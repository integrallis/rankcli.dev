// AI-Powered SEO Fix PR Generator
// Uses OpenAI to analyze repository and generate intelligent, framework-aware fixes

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getInstallationToken } from '../_shared/github-app.ts';
import { callChatCompletion, type AIProviderConfig } from '../_shared/ai-provider.ts';
import { resolveAIConfig, aiConfigErrorMessage } from '../_shared/resolve-ai-config.ts';
import { getEntitlement } from '../_shared/tier.ts';

// pricing-tiers.json: Free includes 3 auto-fix PRs a calendar month; paid plans are unlimited
// (Solo's are naturally bounded by its 3 sites).
const FREE_PRS_PER_MONTH = 3;

// How many PRs one audit report may open, on every plan. A report is a snapshot of one
// moment: the first PR takes the fixable issues, and a follow-up is only useful for what
// it left behind - issues from a PR that was closed unmerged, or ones the AI skipped.
// Capping it there means a double-click, a retry, or a loop can't bury a repo in
// near-identical PRs off a single audit. Run a new audit to get a new allowance.
const PRS_PER_REPORT = 3;

// Same file, same bytes. Compared ignoring line endings and a trailing newline, so a PR
// is never opened over a difference that no reviewer would call a change.
function sameContent(a: string, b: string): boolean {
  return a.replace(/\r\n/g, '\n').trimEnd() === b.replace(/\r\n/g, '\n').trimEnd();
}

// A "nothing to do" answer. 200, not an error: the caller asked for the repo to match the
// report and it already does. `noop` is what the UI keys on to say so calmly.
function noop(message: string, extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ success: true, prCreated: false, noop: true, message, ...extra }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


interface AuditIssue {
  id: string;
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
  appRoot: string; // Root path of the app (e.g., 'ui/', 'web/', or '')
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

// Get repository file tree (returns ALL files for accurate detection)
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
    // Return all files - don't limit here, we'll limit when passing to AI
    return data.tree
      ?.filter((item: { type: string }) => item.type === 'blob')
      ?.map((item: { path: string }) => item.path) || [];
  } catch {
    return [];
  }
}

// Find the app root directory (for monorepos)
function findAppRoot(files: string[]): string {
  // Common frontend app directory names
  const appDirs = ['ui', 'web', 'frontend', 'client', 'app', 'packages/web', 'packages/app'];

  for (const dir of appDirs) {
    // Check if there's a package.json in this directory
    if (files.some(f => f === `${dir}/package.json`)) {
      return `${dir}/`;
    }
  }

  // Check if package.json exists at root
  if (files.some(f => f === 'package.json')) {
    return '';
  }

  // Fallback: look for index.html location
  const indexHtml = files.find(f => f.endsWith('index.html') && !f.includes('node_modules'));
  if (indexHtml) {
    const parts = indexHtml.split('/');
    if (parts.length > 1) {
      // Return the directory containing index.html's parent (e.g., ui/ from ui/index.html)
      return parts.slice(0, -1).join('/') + '/';
    }
  }

  return '';
}

// Detect framework from package.json and file structure
function detectFramework(packageJson: string | null, files: string[], appRoot: string): string {
  if (!packageJson) return 'unknown';

  try {
    const pkg = JSON.parse(packageJson);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps['next']) return 'nextjs';
    if (deps['@astrojs/astro'] || deps['astro']) return 'astro';
    if (deps['nuxt']) return 'nuxt';
    if (deps['vue']) return 'vue';
    if (deps['svelte'] || deps['@sveltejs/kit']) return 'svelte';
    if (deps['react']) {
      if (files.some(f => f.startsWith(appRoot) && f.includes('vite.config'))) return 'react-vite';
      if (files.some(f => f.includes('gatsby'))) return 'gatsby';
      return 'react';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

// Use OpenAI to generate intelligent fixes
async function generateAIFixes(
  aiConfig: AIProviderConfig,
  issues: AuditIssue[],
  repoContext: RepoContext,
  siteUrl: string,
  projectName: string,
  aiSuggestions?: { titles?: string[]; descriptions?: string[] }
): Promise<{ files: FileChange[]; summary: string }> {
  const appRoot = repoContext.appRoot || '';
  const isReactVite = repoContext.framework === 'react-vite' || repoContext.framework === 'react';
  const isNextjs = repoContext.framework === 'nextjs';

  const frameworkInstructions = isReactVite ? `
REACT/VITE SPECIFIC RULES (VERY IMPORTANT):
- The app is in the "${appRoot}" directory - ALL file paths must start with "${appRoot}"
- DO NOT create a new index.html - modify the EXISTING "${appRoot}index.html" in the <head> section only
- For dynamic meta tags, create a React component using react-helmet-async or modify existing SEO component
- Static files (robots.txt, sitemap.xml, _headers) go in "${appRoot}public/"
- The index.html already has a <div id="root"></div> - DO NOT remove or modify the body content
- Add meta tags, preconnect links, and JSON-LD scripts to the <head> section of the existing index.html
- If the index.html already has meta tags, UPDATE them, don't duplicate
` : isNextjs ? `
NEXT.JS SPECIFIC RULES:
- Use the app/ or pages/ directory structure
- Create or modify app/layout.tsx for metadata
- Use Next.js Metadata API for SEO tags
- Static files go in public/
` : `
STATIC SITE RULES:
- Modify index.html directly
- Static files go in public/ or root
`;

  const systemPrompt = `You are an expert SEO engineer. Your task is to generate code changes to fix SEO issues.

You are working with a ${repoContext.framework} project.
${repoContext.appRoot ? `The app is located in the "${repoContext.appRoot}" subdirectory (monorepo structure).` : ''}

${frameworkInstructions}

GENERAL RULES:
1. Generate ONE file change per issue where possible - each fix should be a separate commit
2. Match the existing code style and patterns from the repository
3. Always use proper TypeScript if the project uses TypeScript
4. Include clear comments explaining what each fix does
5. Make minimal, focused changes - don't over-engineer
6. If AI-suggested titles or descriptions are provided, prefer using those
7. For issues that require the same file, you may combine them but use separate commit messages
8. IMPORTANT: Try to fix AS MANY issues as possible, not just the obvious ones
9. CRITICAL: All file paths must be correct for the project structure

ISSUE CATEGORIES TO FIX:
- Meta tags (title, description, OG, Twitter cards) -> modify existing index.html <head> section
- robots.txt issues -> create/modify ${appRoot}public/robots.txt
- sitemap issues -> create ${appRoot}public/sitemap.xml
- llms.txt issues -> create/modify ${appRoot}public/llms.txt
- Schema/structured data -> add JSON-LD scripts to index.html <head>
- Security headers -> create ${appRoot}public/_headers or ${appRoot}vercel.json
- Preconnect/preload -> add link tags to index.html <head>

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "files": [
    {
      "path": "${appRoot}path/to/file.tsx",
      "content": "full file content here",
      "message": "fix(seo): add meta tags and structured data (3 fixes)\\n\\nIssues fixed:\\n- META_DESCRIPTION_MISSING\\n- OG_TAGS_MISSING\\n- TWITTER_CARDS_MISSING"
    }
  ],
  "summary": "brief summary of all changes"
}

COMMIT MESSAGE FORMAT (Conventional Commits):
The subject line should be readable and include the count of fixes. Issue codes go in the commit body.

Examples:
- Subject: "fix(seo): add robots.txt with proper crawl rules (1 fix)"
  Body: "Issues fixed:\\n- ROBOTS_TXT_MISSING"

- Subject: "fix(seo): add meta tags and Open Graph for social sharing (4 fixes)"
  Body: "Issues fixed:\\n- META_DESCRIPTION_MISSING\\n- OG_IMAGE_MISSING\\n- OG_TITLE_MISSING\\n- OG_DESCRIPTION_MISSING"

- Subject: "fix(seo): add JSON-LD structured data schemas (2 fixes)"
  Body: "Issues fixed:\\n- ORGANIZATION_SCHEMA_MISSING\\n- WEBSITE_SCHEMA_MISSING"

- Subject: "fix(seo): add security headers via _headers file (3 fixes)"
  Body: "Issues fixed:\\n- CSP_MISSING\\n- X_FRAME_OPTIONS_MISSING\\n- HSTS_MISSING"

Format each message as: "subject line (N fixes)\\n\\nIssues fixed:\\n- ISSUE_CODE_1\\n- ISSUE_CODE_2"`;

  // Include AI suggestions if available
  const suggestionContext = aiSuggestions ? `

AI-SUGGESTED OPTIMIZATIONS (use these when fixing title/description issues):
${aiSuggestions.titles ? `Suggested Titles:\n${aiSuggestions.titles.map((t, i) => `${i + 1}. "${t}"`).join('\n')}` : ''}
${aiSuggestions.descriptions ? `Suggested Descriptions:\n${aiSuggestions.descriptions.map((d, i) => `${i + 1}. "${d}"`).join('\n')}` : ''}
` : '';

  const userPrompt = `Fix ALL these SEO issues for ${projectName} (${siteUrl}):
${suggestionContext}

ISSUES TO FIX (${issues.length} total - fix as many as possible):
${issues.map(i => `- ${i.code}: ${i.title}${i.how_to_fix ? ` (Fix: ${i.how_to_fix})` : ''}${i.description ? ` - ${i.description}` : ''}`).join('\n')}

REPOSITORY CONTEXT:
Framework: ${repoContext.framework}
App Root Directory: ${repoContext.appRoot || '(root)'}
${repoContext.appRoot ? `IMPORTANT: All file paths MUST start with "${repoContext.appRoot}"` : ''}

package.json (${repoContext.appRoot}package.json):
\`\`\`json
${repoContext.packageJson || 'Not found'}
\`\`\`

index.html (${repoContext.appRoot}index.html):
\`\`\`html
${repoContext.indexHtml || 'Not found'}
\`\`\`

Files in repo (sample):
${repoContext.files.filter(f => f.startsWith(repoContext.appRoot)).slice(0, 50).join('\n')}

CRITICAL INSTRUCTIONS:
1. All file paths MUST start with "${repoContext.appRoot}" (e.g., "${repoContext.appRoot}public/robots.txt")
2. For the existing index.html, ONLY modify the <head> section - DO NOT replace the entire file
3. Preserve the existing <div id="root"></div> and body content
4. Each commit message should have: subject line with fix count, then body with issue codes (e.g., "fix(seo): add meta tags (3 fixes)\\n\\nIssues fixed:\\n- CODE1\\n- CODE2")

For this project, you should:
1. Create/update ${repoContext.appRoot}public/robots.txt with proper rules
2. Create ${repoContext.appRoot}public/sitemap.xml with the site URL
3. Update ${repoContext.appRoot}index.html <head> section with all missing meta tags, OG tags, Twitter cards (DO NOT replace body!)
4. Add JSON-LD structured data to ${repoContext.appRoot}index.html <head>
5. Create ${repoContext.appRoot}public/_headers or ${repoContext.appRoot}vercel.json for security headers
6. Add preconnect/preload hints to ${repoContext.appRoot}index.html <head>
7. Fix any other issues that can be addressed with code changes

EXAMPLE for React/Vite - modifying index.html <head>:
If the current index.html is:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
\`\`\`

You should output the COMPLETE file with additions in <head>, keeping body unchanged:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App - Brief description</title>
    <meta name="description" content="Full description here" />
    <!-- Add OG, Twitter, JSON-LD etc here -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
\`\`\``;

  const content = await callChatCompletion(aiConfig, systemPrompt, userPrompt, { jsonMode: true });
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

    // Functions deploy with --no-verify-jwt, so the caller is checked here: either
    // github-webhook with the service key, or a signed-in user who owns the project.
    const bearer = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    let callerId: string | null = null;
    if (bearer !== supabaseServiceKey) {
      const { data: { user } } = await supabase.auth.getUser(bearer);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      callerId = user.id;
    }

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

    if (!githubAppId || !githubPrivateKey) {
      return new Response(JSON.stringify({ error: 'GitHub App not configured' }), {
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

    if (projectError || !project || (callerId && project.user_id !== callerId)) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { tier } = await getEntitlement(supabase, project.user_id);
    if (tier === 'free') {
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('github_prs')
        .select('id, projects!inner(user_id)', { count: 'exact', head: true })
        .eq('projects.user_id', project.user_id)
        .gte('created_at', monthStart.toISOString());
      if ((count ?? 0) >= FREE_PRS_PER_MONTH) {
        return new Response(JSON.stringify({
          error: `The Free plan includes ${FREE_PRS_PER_MONTH} auto-fix PRs a month, and this month's are used. Upgrade to Solo for unlimited auto-fix PRs: https://rankcli.dev/pricing`,
          code: 'pr_limit_reached',
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const aiResolution = await resolveAIConfig(supabase, project.user_id);
    if (!aiResolution.ok) {
      return new Response(JSON.stringify({ error: aiConfigErrorMessage('auto-fix PRs') }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const aiConfig = aiResolution.config;

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

    // What this report has already opened. Ordered oldest first so the message names
    // them in the order they happened.
    const { data: reportPrRows, error: reportPrError } = await supabase
      .from('github_prs')
      .select('pr_number, pr_url, pr_state, issue_ids')
      .eq('audit_id', targetAuditId)
      .order('created_at', { ascending: true });
    if (reportPrError) {
      return new Response(JSON.stringify({ error: `Could not read this report's PRs: ${reportPrError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const reportPrs = reportPrRows ?? [];

    if (reportPrs.length >= PRS_PER_REPORT) {
      return new Response(JSON.stringify({
        error: `This report has already opened its ${PRS_PER_REPORT} PRs (${reportPrs.map((p) => `#${p.pr_number}`).join(', ')}). Run a new audit to open more.`,
        code: 'report_pr_limit_reached',
        prsForReport: reportPrs.length,
        prsAllowedForReport: PRS_PER_REPORT,
        prUrls: reportPrs.map((p) => p.pr_url),
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Issues that CANNOT be auto-fixed (require manual intervention or architectural changes)
    const NON_FIXABLE_CODES = [
      // These require SSR/architectural changes
      'CLIENT_SIDE_RENDERING', 'EMPTY_BODY_CONTENT', 'HIGH_JS_RENDERING_RATIO',
      // These require actual content writing
      'THIN_CONTENT', 'LOW_TEXT_HTML_RATIO', 'LOW_CONTENT_ENTROPY',
      // These are informational/external
      'BING_NOT_VERIFIED', 'NEW_SITE_STRATEGY', 'DMARC_MISSING',
      // These need user decision
      'CANONICAL_WWW_DUPLICATE',
    ];

    // Issues this report still needs a PR for. 'fixing' is included because that is what
    // opening a PR sets them to: without it, a PR that was closed unmerged would leave its
    // issues permanently unfixable.
    const { data: rawIssues } = await supabase
      .from('audit_issues')
      .select('id, code, severity, category, title, description, how_to_fix, details')
      .eq('audit_id', targetAuditId)
      .in('status', ['open', 'fixing']);

    // An issue carried by a PR that is still open, or merged, is spoken for. Closing a PR
    // unmerged hands its issues back, so a follow-up PR can try them again.
    const claimedIssueIds = new Set(
      reportPrs.filter((p) => p.pr_state !== 'closed').flatMap((p) => p.issue_ids ?? [])
    );

    const fixableIssues = (rawIssues ?? []).filter(
      (i) => !NON_FIXABLE_CODES.includes(i.code) && !claimedIssueIds.has(i.id)
    );

    if (fixableIssues.length === 0) {
      // Nothing to do, and the reason matters: a report whose issues are all already in a
      // PR is a no-op, not an empty report.
      if (claimedIssueIds.size > 0) {
        const open = reportPrs.filter((p) => p.pr_state === 'open');
        return noop(
          `Every auto-fixable issue on this report is already in ${open.length === 1 ? 'a PR' : 'a PR'} (${reportPrs.map((p) => `#${p.pr_number}`).join(', ')}). Nothing new to open.`,
          { prUrls: reportPrs.map((p) => p.pr_url), prsForReport: reportPrs.length, prsAllowedForReport: PRS_PER_REPORT }
        );
      }
      return noop('No auto-fixable issues on this report.', {
        prsForReport: reportPrs.length,
        prsAllowedForReport: PRS_PER_REPORT,
      });
    }

    // Apply AI prioritization if available
    let issues = fixableIssues;
    const prioritized = aiFixPrioritization?.prioritizedIssues ?? [];
    if (prioritized.length > 0) {
      console.log('Applying AI fix prioritization...');

      // Create a priority map
      const priorityMap = new Map<string, { impactScore: number; roiScore: number }>();
      for (const p of prioritized) {
        priorityMap.set(p.issueCode, { impactScore: p.impactScore, roiScore: p.roiScore });
      }

      // Sort issues by AI-determined ROI (highest first)
      // Reorders the fixable issues only - sorting rawIssues here put the non-fixable codes
      // back into the PR whenever an audit had AI prioritization.
      issues = [...fixableIssues].sort((a, b) => {
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

    // First get file tree to detect monorepo structure
    const files = await getRepoTree(token, owner, repoName);
    const appRoot = findAppRoot(files);
    console.log(`Detected app root: ${appRoot || '(root)'}`);

    // Fetch package.json and index.html from the correct location
    const [packageJson, indexHtml] = await Promise.all([
      fetchFileContent(token, owner, repoName, `${appRoot}package.json`),
      fetchFileContent(token, owner, repoName, `${appRoot}index.html`)
        .then(r => r || fetchFileContent(token, owner, repoName, `${appRoot}public/index.html`)),
    ]);

    const framework = detectFramework(packageJson, files, appRoot);
    console.log(`Detected framework: ${framework}`);

    const repoContext: RepoContext = {
      packageJson,
      indexHtml,
      framework,
      files,
      appRoot,
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
      aiConfig,
      issues as AuditIssue[],
      repoContext,
      project.url,
      project.name,
      aiSuggestions
    );

    if (!aiResult.files || aiResult.files.length === 0) {
      return noop('The AI could not generate fixes for these issues.', {
        prsForReport: reportPrs.length,
        prsAllowedForReport: PRS_PER_REPORT,
      });
    }

    console.log(`AI generated ${aiResult.files.length} file changes`);

    // Keep only files that would actually change the repo. Re-running a report over a
    // codebase that already carries the fixes used to open a PR containing nothing:
    // a branch, a commit per file, and no diff for the reviewer to look at.
    const changedFiles: FileChange[] = [];
    const unchangedPaths: string[] = [];
    for (const file of aiResult.files) {
      const existing = await fetchFileContent(token, owner, repoName, file.path);
      if (existing !== null && sameContent(existing, file.content)) {
        unchangedPaths.push(file.path);
      } else {
        changedFiles.push(file);
      }
    }

    if (changedFiles.length === 0) {
      console.log('All generated files match the repository; no PR opened');
      return noop(
        `Your repository already matches the ${unchangedPaths.length} file${unchangedPaths.length === 1 ? '' : 's'} we would have changed. No PR opened.`,
        {
          unchangedFiles: unchangedPaths,
          prsForReport: reportPrs.length,
          prsAllowedForReport: PRS_PER_REPORT,
        }
      );
    }
    if (unchangedPaths.length > 0) {
      console.log(`Skipping ${unchangedPaths.length} unchanged file(s): ${unchangedPaths.join(', ')}`);
    }

    // Create branch and commit files
    const { sha: baseSha, branch: defaultBranch } = await getDefaultBranchSha(token, owner, repoName);
    const branchName = `rankcli/seo-fixes-${Date.now()}`;

    console.log(`Creating branch ${branchName}...`);
    await createBranch(token, owner, repoName, branchName, baseSha);

    for (const file of changedFiles) {
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

${changedFiles.map((f: FileChange) => `- \`${f.path}\``).join('\n')}
${unchangedPaths.length > 0 ? `\n_Already up to date, left alone: ${unchangedPaths.map((p) => `\`${p}\``).join(', ')}._` : ''}

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

    // Record PR in database, linked to the exact issues it addresses so the
    // webhook can mark them fixed when this PR merges (see handlePullRequest
    // in github-webhook/index.ts, which reads this column back by id).
    const issueIds = issues.map((i: AuditIssue) => i.id);
    const { error: prInsertError } = await supabase.from('github_prs').insert({
      project_id: project.id,
      audit_id: targetAuditId,
      pr_number: pr.number,
      pr_url: pr.url,
      pr_title: prTitle,
      pr_state: 'open',
      branch_name: branchName,
      files_changed: changedFiles.length,
      issue_ids: issueIds,
    });
    if (prInsertError) {
      console.error('Failed to record PR in database:', prInsertError.message);
    }

    // Update issues status - 'fixing' (not 'fixed') since the PR is only
    // open, not merged yet. audit_issues.status has a CHECK constraint of
    // 'open'|'fixing'|'fixed'|'ignored'|'wont_fix'; must match exactly.
    const { error: issuesUpdateError } = await supabase
      .from('audit_issues')
      .update({ status: 'fixing', fix_pr_url: pr.url })
      .in('id', issueIds);
    if (issuesUpdateError) {
      console.error('Failed to update issue status:', issuesUpdateError.message);
    }

    // Slack/Discord "PR opened" alert (project-alerts); never fails the PR.
    await fetch(`${supabaseUrl}/functions/v1/project-alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseServiceKey}` },
      body: JSON.stringify({ projectId: project.id, event: 'pr_created', prUrl: pr.url, issuesFixed: issues.length }),
    }).catch((err) => console.warn('project-alerts call failed:', err));

    return new Response(JSON.stringify({
      success: true,
      prCreated: true,
      prUrl: pr.url,
      prNumber: pr.number,
      filesChanged: changedFiles.length,
      unchangedFiles: unchangedPaths,
      issuesFixed: issues.length,
      // One more PR has been opened against this report than the caller last saw.
      prsForReport: reportPrs.length + 1,
      prsAllowedForReport: PRS_PER_REPORT,
      framework,
      summary: aiResult.summary,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating SEO PR:', error);
    return new Response(JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
