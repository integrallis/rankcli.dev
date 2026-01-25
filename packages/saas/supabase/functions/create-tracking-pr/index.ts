/**
 * Tracking Code PR Generator
 *
 * Generates a PR to add Google/Bing tracking verification codes to a project.
 * Called when a user links their GSC account and wants to add verification tags.
 *
 * Adds:
 * - Google Site Verification meta tag (for GSC)
 * - Google Analytics 4 tracking script (optional)
 * - Bing Webmaster verification meta tag (optional)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackingConfig {
  googleSiteVerification?: string; // Google site verification code
  ga4MeasurementId?: string; // GA4 measurement ID (G-XXXXXX)
  bingVerification?: string; // Bing Webmaster verification code
}

interface FileChange {
  path: string;
  content: string;
  message: string;
}

// Convert PKCS#1 PEM to PKCS#8 PEM format (same as create-seo-pr)
function convertPkcs1ToPkcs8(pkcs1Pem: string): string {
  if (pkcs1Pem.includes('BEGIN PRIVATE KEY')) {
    return pkcs1Pem;
  }

  const base64 = pkcs1Pem
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const pkcs1Bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const rsaOid = [0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];
  const algorithmSeq = [0x30, rsaOid.length, ...rsaOid];

  const octetStringHeader = encodeLength(pkcs1Bytes.length);
  const octetString = [0x04, ...octetStringHeader, ...pkcs1Bytes];
  const version = [0x02, 0x01, 0x00];
  const innerContent = [...version, ...algorithmSeq, ...octetString];
  const outerHeader = encodeLength(innerContent.length);
  const pkcs8Bytes = new Uint8Array([0x30, ...outerHeader, ...innerContent]);

  const pkcs8Base64 = btoa(String.fromCharCode(...pkcs8Bytes));
  const lines = pkcs8Base64.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
}

function encodeLength(length: number): number[] {
  if (length < 128) return [length];
  if (length < 256) return [0x81, length];
  if (length < 65536) return [0x82, (length >> 8) & 0xff, length & 0xff];
  return [0x83, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff];
}

async function getInstallationToken(installationId: number, privateKeyBase64: string, appId: string): Promise<string> {
  let pemKey = atob(privateKeyBase64);
  pemKey = convertPkcs1ToPkcs8(pemKey);
  const privateKey = await jose.importPKCS8(pemKey, 'RS256');

  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(appId)
    .setIssuedAt(Math.floor(Date.now() / 1000) - 60)
    .setExpirationTime('10m')
    .sign(privateKey);

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
      ?.map((item: { path: string }) => item.path) || [];
  } catch {
    return [];
  }
}

function findAppRoot(files: string[]): string {
  const appDirs = ['ui', 'web', 'frontend', 'client', 'app', 'packages/web', 'packages/app'];

  for (const dir of appDirs) {
    if (files.some(f => f === `${dir}/package.json`)) {
      return `${dir}/`;
    }
  }

  if (files.some(f => f === 'package.json')) {
    return '';
  }

  const indexHtml = files.find(f => f.endsWith('index.html') && !f.includes('node_modules'));
  if (indexHtml) {
    const parts = indexHtml.split('/');
    if (parts.length > 1) {
      return parts.slice(0, -1).join('/') + '/';
    }
  }

  return '';
}

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

/**
 * Generate tracking code changes for different frameworks
 */
function generateTrackingChanges(
  framework: string,
  appRoot: string,
  indexHtml: string | null,
  config: TrackingConfig,
  siteUrl: string
): FileChange[] {
  const changes: FileChange[] = [];

  // Generate the meta tags to add
  const metaTags: string[] = [];
  const scripts: string[] = [];

  if (config.googleSiteVerification) {
    metaTags.push(`    <meta name="google-site-verification" content="${config.googleSiteVerification}" />`);
  }

  if (config.bingVerification) {
    metaTags.push(`    <meta name="msvalidate.01" content="${config.bingVerification}" />`);
  }

  if (config.ga4MeasurementId) {
    scripts.push(`    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${config.ga4MeasurementId}');
    </script>`);
  }

  // Handle based on framework
  if (framework === 'nextjs') {
    // For Next.js, we need to create/update app/layout.tsx or pages/_document.tsx
    // Check if using App Router or Pages Router
    const isAppRouter = indexHtml === null; // In App Router, there's no index.html

    if (isAppRouter) {
      // Create a separate head component or update layout
      const headContent = `// Add this to your app/layout.tsx <head> section
// Google Search Console verification
${config.googleSiteVerification ? `<meta name="google-site-verification" content="${config.googleSiteVerification}" />` : ''}
${config.bingVerification ? `<meta name="msvalidate.01" content="${config.bingVerification}" />` : ''}

${config.ga4MeasurementId ? `// Google Analytics 4
import Script from 'next/script';
// Add these Script components inside your layout:
<Script src="https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}" strategy="afterInteractive" />
<Script id="google-analytics" strategy="afterInteractive">
  {\`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${config.ga4MeasurementId}');
  \`}
</Script>` : ''}`;

      changes.push({
        path: `${appRoot}TRACKING_SETUP.md`,
        content: `# Tracking Code Setup for ${siteUrl}

This file contains the tracking codes you need to add to your Next.js app.

## Quick Setup

Add the following to your \`app/layout.tsx\` file:

### Metadata (in the metadata export)

\`\`\`tsx
export const metadata: Metadata = {
  // ... existing metadata
  verification: {
    ${config.googleSiteVerification ? `google: '${config.googleSiteVerification}',` : ''}
    ${config.bingVerification ? `other: { 'msvalidate.01': '${config.bingVerification}' },` : ''}
  },
};
\`\`\`

${config.ga4MeasurementId ? `### Google Analytics 4

Add these imports and scripts to your layout:

\`\`\`tsx
import Script from 'next/script';

// Inside your RootLayout component, add:
<Script src="https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}" strategy="afterInteractive" />
<Script id="google-analytics" strategy="afterInteractive">
  {\`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${config.ga4MeasurementId}');
  \`}
</Script>
\`\`\`` : ''}

## Verification

After deploying, verify your site in:
- [Google Search Console](https://search.google.com/search-console)
${config.bingVerification ? '- [Bing Webmaster Tools](https://www.bing.com/webmasters)' : ''}
`,
        message: 'docs: add tracking code setup instructions for Next.js',
      });
    }
  } else if (framework === 'react-vite' || framework === 'react' || framework === 'vue' || framework === 'unknown') {
    // For SPA frameworks, modify index.html
    if (indexHtml) {
      // Insert meta tags and scripts into existing index.html
      let updatedHtml = indexHtml;

      // Find the </head> tag and insert before it
      const headCloseIndex = updatedHtml.indexOf('</head>');
      if (headCloseIndex !== -1) {
        const toInsert = [
          '',
          '    <!-- Search Engine Verification -->',
          ...metaTags,
          '',
          ...scripts,
          '  ',
        ].join('\n');

        updatedHtml = updatedHtml.slice(0, headCloseIndex) + toInsert + updatedHtml.slice(headCloseIndex);
      }

      const issueCount = (config.googleSiteVerification ? 1 : 0) +
                         (config.bingVerification ? 1 : 0) +
                         (config.ga4MeasurementId ? 1 : 0);

      const issueList: string[] = [];
      if (config.googleSiteVerification) issueList.push('- Google Site Verification');
      if (config.bingVerification) issueList.push('- Bing Webmaster Verification');
      if (config.ga4MeasurementId) issueList.push('- Google Analytics 4');

      changes.push({
        path: `${appRoot}index.html`,
        content: updatedHtml,
        message: `feat(tracking): add search engine verification codes (${issueCount} additions)\n\nAdded:\n${issueList.join('\n')}`,
      });
    }
  } else if (framework === 'astro') {
    // For Astro, create a BaseHead component update
    const headContent = `---
// Add to your BaseHead.astro or Layout.astro
---
<!-- Search Engine Verification -->
${config.googleSiteVerification ? `<meta name="google-site-verification" content="${config.googleSiteVerification}" />` : ''}
${config.bingVerification ? `<meta name="msvalidate.01" content="${config.bingVerification}" />` : ''}

${config.ga4MeasurementId ? `<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${config.ga4MeasurementId}');
</script>` : ''}`;

    changes.push({
      path: `${appRoot}src/components/TrackingHead.astro`,
      content: headContent,
      message: 'feat(tracking): add search engine verification component for Astro',
    });
  }

  return changes;
}

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
    content: btoa(unescape(encodeURIComponent(content))),
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

    // Verify user auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      projectId,
      googleSiteVerification,
      ga4MeasurementId,
      bingVerification,
    } = await req.json();

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify at least one tracking code is provided
    if (!googleSiteVerification && !ga4MeasurementId && !bingVerification) {
      return new Response(JSON.stringify({ error: 'At least one tracking code is required' }), {
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

    // Get project (verify user owns it)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
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

    const installationId = project.github_installation_id;
    if (!installationId) {
      return new Response(JSON.stringify({ error: 'GitHub App not installed on this repository' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get GitHub token
    const ghToken = await getInstallationToken(installationId, githubPrivateKey, githubAppId);

    // Fetch repository context
    console.log('Fetching repository context...');
    const files = await getRepoTree(ghToken, owner, repoName);
    const appRoot = findAppRoot(files);

    const [packageJson, indexHtml] = await Promise.all([
      fetchFileContent(ghToken, owner, repoName, `${appRoot}package.json`),
      fetchFileContent(ghToken, owner, repoName, `${appRoot}index.html`)
        .then(r => r || fetchFileContent(ghToken, owner, repoName, `${appRoot}public/index.html`)),
    ]);

    const framework = detectFramework(packageJson, files, appRoot);
    console.log(`Detected framework: ${framework}, app root: ${appRoot || '(root)'}`);

    // Generate tracking code changes
    const trackingConfig: TrackingConfig = {
      googleSiteVerification,
      ga4MeasurementId,
      bingVerification,
    };

    const fileChanges = generateTrackingChanges(
      framework,
      appRoot,
      indexHtml,
      trackingConfig,
      project.url
    );

    if (fileChanges.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not generate tracking code changes for this framework',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create branch and commit files
    const { sha: baseSha, branch: defaultBranch } = await getDefaultBranchSha(ghToken, owner, repoName);
    const branchName = `rankcli/add-tracking-${Date.now()}`;

    console.log(`Creating branch ${branchName}...`);
    await createBranch(ghToken, owner, repoName, branchName, baseSha);

    for (const file of fileChanges) {
      console.log(`Creating/updating ${file.path}...`);
      await createOrUpdateFile(ghToken, owner, repoName, branchName, file.path, file.content, file.message);
    }

    // Build PR description
    const trackingList: string[] = [];
    if (googleSiteVerification) trackingList.push('Google Search Console verification');
    if (ga4MeasurementId) trackingList.push('Google Analytics 4');
    if (bingVerification) trackingList.push('Bing Webmaster Tools verification');

    const prTitle = `feat(tracking): add search engine verification codes`;
    const prBody = `## Search Engine Tracking Setup

This PR adds verification codes to enable search engine tracking for ${project.url}.

### What's Added

${trackingList.map(t => `- ${t}`).join('\n')}

### Why This Matters

${googleSiteVerification ? `**Google Search Console** - Track your site's performance in Google Search, monitor indexing status, and receive alerts about issues.\n\n` : ''}
${ga4MeasurementId ? `**Google Analytics 4** - Understand how users find and interact with your site, measure conversions, and track marketing campaigns.\n\n` : ''}
${bingVerification ? `**Bing Webmaster Tools** - Monitor your site's visibility in Bing/Yahoo search results (10-15% of search traffic).\n\n` : ''}

### Files Changed

${fileChanges.map(f => `- \`${f.path}\``).join('\n')}

### After Merging

1. Deploy your site
2. Verify ownership in each service:
${googleSiteVerification ? '   - [Google Search Console](https://search.google.com/search-console)\n' : ''}
${bingVerification ? '   - [Bing Webmaster Tools](https://www.bing.com/webmasters)\n' : ''}
3. RankCLI will automatically start syncing metrics once verification is complete

---

**Powered by [RankCLI](https://rankcli.dev)** - Ship code, get ranked.
`;

    console.log('Creating PR...');
    const pr = await createPullRequest(ghToken, owner, repoName, prTitle, prBody, branchName, defaultBranch);

    // Record PR in database
    await supabase.from('github_prs').insert({
      project_id: project.id,
      pr_number: pr.number,
      pr_url: pr.url,
      pr_title: prTitle,
      pr_state: 'open',
      branch_name: branchName,
      files_changed: fileChanges.length,
    });

    return new Response(JSON.stringify({
      success: true,
      prCreated: true,
      prUrl: pr.url,
      prNumber: pr.number,
      filesChanged: fileChanges.length,
      framework,
      trackingAdded: trackingList,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating tracking PR:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
