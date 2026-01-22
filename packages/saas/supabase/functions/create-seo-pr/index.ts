// AI-Powered SEO Fix PR Generator
// Uses OpenAI to analyze repository and generate intelligent, framework-aware fixes

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditIssue {
  code: string;
  severity: string;
  category: string;
  title: string;
  description: string | null;
  how_to_fix: string | null;
}

interface FileChange {
  path: string;
  content: string;
  message: string;
}

interface RepoContext {
  packageJson: string | null;
  indexHtml: string | null;
  framework: string;
  files: string[];
}

// Convert PKCS#1 PEM to PKCS#8 PEM format
function convertPkcs1ToPkcs8(pkcs1Pem: string): string {
  // If already PKCS#8, return as-is
  if (pkcs1Pem.includes('BEGIN PRIVATE KEY')) {
    return pkcs1Pem;
  }

  // Extract the base64 content
  const base64 = pkcs1Pem
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  // Decode the PKCS#1 key
  const pkcs1Bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  // PKCS#8 header for RSA keys (ASN.1 structure)
  // SEQUENCE {
  //   INTEGER 0 (version)
  //   SEQUENCE { OID rsaEncryption, NULL }
  //   OCTET STRING { <PKCS#1 key> }
  // }
  const rsaOid = [0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];

  // Build the PKCS#8 structure
  const algorithmSeq = [0x30, rsaOid.length, ...rsaOid];

  // Encode OCTET STRING with PKCS#1 content
  const octetStringHeader = encodeLength(pkcs1Bytes.length);
  const octetString = [0x04, ...octetStringHeader, ...pkcs1Bytes];

  // Version (INTEGER 0)
  const version = [0x02, 0x01, 0x00];

  // Inner content
  const innerContent = [...version, ...algorithmSeq, ...octetString];

  // Outer SEQUENCE
  const outerHeader = encodeLength(innerContent.length);
  const pkcs8Bytes = new Uint8Array([0x30, ...outerHeader, ...innerContent]);

  // Convert to base64
  const pkcs8Base64 = btoa(String.fromCharCode(...pkcs8Bytes));

  // Format as PEM with line breaks every 64 chars
  const lines = pkcs8Base64.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
}

// ASN.1 DER length encoding
function encodeLength(length: number): number[] {
  if (length < 128) {
    return [length];
  } else if (length < 256) {
    return [0x81, length];
  } else if (length < 65536) {
    return [0x82, (length >> 8) & 0xff, length & 0xff];
  }
  return [0x83, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff];
}

// Get installation access token from GitHub App
async function getInstallationToken(installationId: number, privateKeyBase64: string, appId: string): Promise<string> {
  // Decode the base64-encoded PEM key
  let pemKey = atob(privateKeyBase64);

  // Convert PKCS#1 to PKCS#8 if needed (jose only supports PKCS#8)
  pemKey = convertPkcs1ToPkcs8(pemKey);

  // Import the private key using jose library
  const privateKey = await jose.importPKCS8(pemKey, 'RS256');

  // Create and sign the JWT
  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(appId)
    .setIssuedAt(Math.floor(Date.now() / 1000) - 60)
    .setExpirationTime('10m')
    .sign(privateKey);

  // Exchange JWT for installation access token
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get installation token: ${error}`);
  }

  const result = await response.json();
  return result.token;
}

// Fetch file content from GitHub
async function fetchFileContent(token: string, owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.content) {
      return atob(data.content.replace(/\n/g, ''));
    }
    return null;
  } catch {
    return null;
  }
}

// Get repository file tree
async function getRepoTree(token: string, owner: string, repo: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.tree
      ?.filter((item: { type: string }) => item.type === 'blob')
      ?.map((item: { path: string }) => item.path)
      ?.slice(0, 100) || []; // Limit to 100 files for context
  } catch {
    return [];
  }
}

// Detect framework from package.json and file structure
function detectFramework(packageJson: string | null, files: string[]): string {
  if (!packageJson) return 'unknown';

  const pkg = JSON.parse(packageJson);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  if (deps['next']) return 'nextjs';
  if (deps['@astrojs/astro'] || deps['astro']) return 'astro';
  if (deps['nuxt']) return 'nuxt';
  if (deps['vue']) return 'vue';
  if (deps['svelte'] || deps['@sveltejs/kit']) return 'svelte';
  if (deps['react']) {
    if (files.some(f => f.includes('vite.config'))) return 'react-vite';
    if (files.some(f => f.includes('gatsby'))) return 'gatsby';
    return 'react';
  }

  return 'unknown';
}

// Use OpenAI to generate intelligent fixes
async function generateAIFixes(
  openaiKey: string,
  issues: AuditIssue[],
  repoContext: RepoContext,
  siteUrl: string,
  projectName: string,
  aiSuggestions?: { titles?: string[]; descriptions?: string[] }
): Promise<{ files: FileChange[]; summary: string }> {
  const systemPrompt = `You are an expert SEO engineer. Your task is to generate code changes to fix SEO issues.

You are working with a ${repoContext.framework} project.

RULES:
1. Generate ONLY the files that need to be created or modified
2. Match the existing code style and patterns from the repository
3. For React/Vue apps, prefer creating reusable SEO components
4. For static sites, modify index.html directly
5. Always use proper TypeScript if the project uses TypeScript
6. Include clear comments explaining what each fix does
7. Make minimal, focused changes - don't over-engineer
8. If AI-suggested titles or descriptions are provided, prefer using those

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "files": [
    {
      "path": "relative/path/to/file.tsx",
      "content": "full file content here",
      "message": "commit message for this change"
    }
  ],
  "summary": "brief summary of all changes"
}`;

  // Include AI suggestions if available
  const suggestionContext = aiSuggestions ? `

AI-SUGGESTED OPTIMIZATIONS (use these when fixing title/description issues):
${aiSuggestions.titles ? `Suggested Titles:\n${aiSuggestions.titles.map((t, i) => `${i + 1}. "${t}"`).join('\n')}` : ''}
${aiSuggestions.descriptions ? `Suggested Descriptions:\n${aiSuggestions.descriptions.map((d, i) => `${i + 1}. "${d}"`).join('\n')}` : ''}
` : '';

  const userPrompt = `Fix these SEO issues for ${projectName} (${siteUrl}):
${suggestionContext}

ISSUES TO FIX:
${issues.map(i => `- ${i.code}: ${i.title}${i.how_to_fix ? ` (${i.how_to_fix})` : ''}`).join('\n')}

REPOSITORY CONTEXT:
Framework: ${repoContext.framework}

package.json:
\`\`\`json
${repoContext.packageJson || 'Not found'}
\`\`\`

index.html:
\`\`\`html
${repoContext.indexHtml || 'Not found'}
\`\`\`

Files in repo (sample):
${repoContext.files.slice(0, 50).join('\n')}

Generate the necessary file changes to fix these SEO issues. For meta tags and structured data, create appropriate components or modify index.html based on the framework.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content);
}

// Get default branch info
async function getDefaultBranchSha(token: string, owner: string, repo: string): Promise<{ sha: string; branch: string }> {
  const repoResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  if (!repoResponse.ok) throw new Error('Failed to get repository info');

  const repoData = await repoResponse.json();
  const defaultBranch = repoData.default_branch;

  const refResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  if (!refResponse.ok) throw new Error('Failed to get branch ref');

  const refData = await refResponse.json();
  return { sha: refData.object.sha, branch: defaultBranch };
}

// Create a branch
async function createBranch(token: string, owner: string, repo: string, branchName: string, baseSha: string): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    }
  );

  if (!response.ok && response.status !== 422) {
    const error = await response.text();
    throw new Error(`Failed to create branch: ${error}`);
  }
}

// Create or update file
async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  path: string,
  content: string,
  message: string
): Promise<void> {
  let existingSha: string | undefined;
  try {
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      existingSha = fileData.sha;
    }
  } catch {
    // File doesn't exist
  }

  const body: Record<string, string> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))), // Handle Unicode
    branch,
  };

  if (existingSha) {
    body.sha = existingSha;
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create file ${path}: ${error}`);
  }
}

// Create pull request
async function createPullRequest(
  token: string,
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string
): Promise<{ url: string; number: number }> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title, body, head, base }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PR: ${error}`);
  }

  const prData = await response.json();
  return { url: prData.html_url, number: prData.number };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { projectId, auditId } = await req.json();

    if (!projectId && !auditId) {
      return new Response(JSON.stringify({ error: 'Project ID or Audit ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get credentials
    const githubAppId = Deno.env.get('GITHUB_APP_ID');
    const githubPrivateKey = Deno.env.get('GITHUB_PRIVATE_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!githubAppId || !githubPrivateKey) {
      return new Response(JSON.stringify({ error: 'GitHub App not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get project
    let targetProjectId = projectId;
    if (auditId) {
      const { data: audit } = await supabase
        .from('audits')
        .select('project_id')
        .eq('id', auditId)
        .single();
      if (!audit) {
        return new Response(JSON.stringify({ error: 'Audit not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      targetProjectId = audit.project_id;
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', targetProjectId)
      .single();

    if (projectError || !project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!project.github_repo_url) {
      return new Response(JSON.stringify({ error: 'No GitHub repository connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse repo URL
    const repoMatch = project.github_repo_url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoMatch) {
      return new Response(JSON.stringify({ error: 'Invalid GitHub repo URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [, owner, repo] = repoMatch;
    const repoName = repo.replace(/\.git$/, '');

    // Get installation ID
    const installationId = project.github_installation_id;
    if (!installationId) {
      return new Response(JSON.stringify({ error: 'GitHub App not installed on this repository' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get latest completed audit with AI analysis
    let targetAuditId = auditId;
    let aiFixPrioritization: { prioritizedIssues: { issueCode: string; impactScore: number; roiScore: number }[] } | null = null;

    if (!targetAuditId) {
      const { data: latestAudit } = await supabase
        .from('audits')
        .select('id, ai_analysis')
        .eq('project_id', project.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      targetAuditId = latestAudit?.id;
      aiFixPrioritization = latestAudit?.ai_analysis?.fixPrioritization || null;
    } else {
      // Get AI analysis from the specified audit
      const { data: audit } = await supabase
        .from('audits')
        .select('ai_analysis')
        .eq('id', targetAuditId)
        .single();
      aiFixPrioritization = audit?.ai_analysis?.fixPrioritization || null;
    }

    if (!targetAuditId) {
      return new Response(JSON.stringify({ error: 'No completed audit found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auto-fixable issue codes
    const AUTO_FIXABLE_CODES = [
      'ROBOTS_TXT_MISSING', 'SITEMAP_MISSING', 'LLMS_TXT_MISSING',
      'CANONICAL_MISSING', 'META_DESC_MISSING', 'TITLE_MISSING',
      'OG_TITLE_MISSING', 'OG_DESC_MISSING', 'OG_IMAGE_MISSING', 'OG_URL_MISSING', 'OG_TYPE_MISSING',
      'TWITTER_CARD_MISSING', 'TWITTER_IMAGE_MISSING',
      'SCHEMA_MISSING', 'VIEWPORT_MISSING', 'HTML_LANG_MISSING',
      'H1_MISSING', 'FAVICON_MISSING',
      // AI-generated suggestions are also auto-fixable
      'AI_TITLE_SUGGESTION', 'AI_DESC_SUGGESTION', 'AI_CONTENT_SUGGESTION',
    ];

    // Get auto-fixable issues
    const { data: rawIssues } = await supabase
      .from('audit_issues')
      .select('code, severity, category, title, description, how_to_fix, details')
      .eq('audit_id', targetAuditId)
      .eq('status', 'open')
      .in('code', AUTO_FIXABLE_CODES);

    if (!rawIssues || rawIssues.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No auto-fixable issues found',
        prCreated: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Apply AI prioritization if available
    let issues = rawIssues;
    if (aiFixPrioritization?.prioritizedIssues?.length > 0) {
      console.log('Applying AI fix prioritization...');

      // Create a priority map
      const priorityMap = new Map<string, { impactScore: number; roiScore: number }>();
      for (const p of aiFixPrioritization.prioritizedIssues) {
        priorityMap.set(p.issueCode, { impactScore: p.impactScore, roiScore: p.roiScore });
      }

      // Sort issues by AI-determined ROI (highest first)
      issues = [...rawIssues].sort((a, b) => {
        const aScore = priorityMap.get(a.code)?.roiScore || 50;
        const bScore = priorityMap.get(b.code)?.roiScore || 50;
        return bScore - aScore; // Higher ROI first
      });

      // Log prioritization
      console.log('AI-prioritized issues:', issues.map(i => `${i.code} (ROI: ${priorityMap.get(i.code)?.roiScore || 'N/A'})`).join(', '));
    }

    console.log(`Found ${issues.length} auto-fixable issues, generating AI fixes...`);

    // Get GitHub token
    const token = await getInstallationToken(installationId, githubPrivateKey, githubAppId);

    // Fetch repository context
    console.log('Fetching repository context...');
    const [packageJson, indexHtml, files] = await Promise.all([
      fetchFileContent(token, owner, repoName, 'package.json'),
      fetchFileContent(token, owner, repoName, 'index.html').then(r => r || fetchFileContent(token, owner, repoName, 'public/index.html')),
      getRepoTree(token, owner, repoName),
    ]);

    const framework = detectFramework(packageJson, files);
    console.log(`Detected framework: ${framework}`);

    const repoContext: RepoContext = {
      packageJson,
      indexHtml,
      framework,
      files,
    };

    // Extract AI-generated suggestions to include in fix generation
    const aiSuggestions: { titles?: string[]; descriptions?: string[] } = {};
    for (const issue of issues) {
      if (issue.code === 'AI_TITLE_SUGGESTION' && issue.details?.suggestions) {
        aiSuggestions.titles = issue.details.suggestions as string[];
      }
      if (issue.code === 'AI_DESC_SUGGESTION' && issue.details?.suggestions) {
        aiSuggestions.descriptions = issue.details.suggestions as string[];
      }
    }

    // Generate AI fixes
    console.log('Generating AI-powered fixes...');
    const aiResult = await generateAIFixes(
      openaiKey,
      issues as AuditIssue[],
      repoContext,
      project.url,
      project.name,
      aiSuggestions
    );

    if (!aiResult.files || aiResult.files.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'AI could not generate fixes for these issues',
        prCreated: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`AI generated ${aiResult.files.length} file changes`);

    // Create branch and commit files
    const { sha: baseSha, branch: defaultBranch } = await getDefaultBranchSha(token, owner, repoName);
    const branchName = `rankcli/seo-fixes-${Date.now()}`;

    console.log(`Creating branch ${branchName}...`);
    await createBranch(token, owner, repoName, branchName, baseSha);

    for (const file of aiResult.files) {
      console.log(`Creating/updating ${file.path}...`);
      await createOrUpdateFile(token, owner, repoName, branchName, file.path, file.content, file.message);
    }

    // Create PR
    const prTitle = `fix(seo): ${issues.length} SEO improvements for ${project.name}`;
    const prBody = `## 🚀 AI-Generated SEO Fixes

This PR was automatically generated by [RankCLI](https://rankcli.dev) using AI analysis of your codebase.

### Issues Fixed

| Code | Severity | Issue |
|------|----------|-------|
${issues.map((i: AuditIssue) => `| \`${i.code}\` | ${i.severity} | ${i.title} |`).join('\n')}

### Changes Made

${aiResult.summary}

### Files Modified

${aiResult.files.map((f: FileChange) => `- \`${f.path}\``).join('\n')}

### How This Works

1. RankCLI ran an SEO audit on ${project.url}
2. AI analyzed your codebase (detected: **${framework}**)
3. Generated framework-specific fixes that match your code style
4. Created this PR with the changes

### Test Plan

- [ ] Review the code changes
- [ ] Test locally to ensure no regressions
- [ ] Deploy to staging and verify SEO improvements
- [ ] Run \`rankcli audit ${project.url}\` to verify score improvement

---

**🤖 Generated by [RankCLI](https://rankcli.dev)** - Ship code, get ranked.
`;

    console.log('Creating PR...');
    const pr = await createPullRequest(token, owner, repoName, prTitle, prBody, branchName, defaultBranch);

    // Record PR in database
    await supabase.from('github_prs').insert({
      project_id: project.id,
      audit_id: targetAuditId,
      pr_number: pr.number,
      pr_url: pr.url,
      pr_title: prTitle,
      pr_state: 'open',
      branch_name: branchName,
      files_changed: aiResult.files.length,
    });

    // Update issues status
    await supabase
      .from('audit_issues')
      .update({ status: 'fix_pending', fix_pr_url: pr.url })
      .eq('audit_id', targetAuditId)
      .in('code', issues.map((i: AuditIssue) => i.code));

    return new Response(JSON.stringify({
      success: true,
      prCreated: true,
      prUrl: pr.url,
      prNumber: pr.number,
      filesChanged: aiResult.files.length,
      issuesFixed: issues.length,
      framework,
      summary: aiResult.summary,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating SEO PR:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
