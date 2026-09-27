// AI-Powered SEO Fix PR Generator
// Uses OpenAI to analyze repository and generate intelligent, framework-aware fixes

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getInstallationToken } from '../_shared/github-app.ts';
import { fetchFileContent, getDefaultBranchSha, createBranch, createOrUpdateFile, createPullRequest } from '../_shared/github-repo.ts';
import { callChatCompletion, type AIProviderConfig } from '../_shared/ai-provider.ts';
import { resolveAIConfig, giftModel, giftCostUsd } from '../_shared/resolve-ai-config.ts';
import { userIdFromApiKey } from '../_shared/caller-auth.ts';
import { buildDeterministicFixes, findAppRoot } from '../_shared/audit/index.ts';
import { getEntitlement } from '../_shared/tier.ts';

// The monthly auto-fix PR allowance comes from _shared/tier.ts (limits.autoFixPrsPerMonth,
// null = unlimited) - one definition, shared with validate-api-key and the dashboard.

// At most this many RankCLI auto-fix PRs may be open on a project at once. Neither the
// monthly nor the per-report cap bounds the automated path: every push produces a new
// audit, so a new report, so a fresh per-report allowance - and paid plans have no monthly
// cap at all. An active repo on Pro ("audited daily and on every push") could therefore
// accumulate PRs without limit. One open PR at a time is self-regulating: merge or close
// it and the next audit picks up whatever is left, which is how Dependabot behaves. An
// already-open PR is a skip, not a failure, so the push-triggered path stays quiet.
const MAX_OPEN_AUTO_FIX_PRS = 1;

// How many PRs one audit report may open, on every plan. A report is a snapshot of one
// moment: the first PR takes the fixable issues, and a follow-up is only useful for what
// it left behind - issues from a PR that was closed unmerged, or ones the AI skipped.
// Capping it there means a double-click, a retry, or a loop can't bury a repo in
// near-identical PRs off a single audit. Run a new audit to get a new allowance.
const PRS_PER_REPORT = 3;

// Whatever the model returned is JSON from a remote service, and the next thing we do with
// it is commit it to someone's default branch. Before this, `JSON.parse(content)` was the
// only check: a path of "../../etc" or a truncated index.html went straight into the PR.
const MAX_GENERATED_FILES = 20;
// A model call's cost tracks the size of the page we send, not the number of issues: the two
// sites measured needed ~9K input and 2-4K output, and output rose with index.html (5KB ->
// 12KB) while the issue count halved. A 200KB page would therefore cost many times a normal
// PR on our key. Above this, the page's <head> goes in instead of the whole file - which is
// the part SEO fixes touch anyway - so a huge page costs about what a small one does. A
// whole-file rewrite generated from a head-only view would be far shorter than the original
// and the truncation guard drops it, so this cannot quietly shrink someone's page.
const MAX_HTML_CHARS_FOR_AI = 30_000;

// Files RankCLI can generate itself, exactly, from facts it holds. The model may create one
// that is missing; it may not rewrite one that exists.
//
// Both real PRs generated against a live site damaged a file of this kind. The first replaced
// a homepage's robots.txt with a shorter one; the second rewrote a sitemap's lastmod dates
// from 2026-09-15 to 2024-07-26 - a date it cannot know and got wrong by two years, which
// tells crawlers the pages are staler than they are. There is no upside here worth that: an
// existing robots.txt or sitemap is either fine or a finding for a human to read, and the
// report still says so either way.
const TEMPLATE_OWNED_FILES = ['robots.txt', 'sitemap.xml', 'sitemap_index.xml', 'llms.txt', 'llms-full.txt'];

function isTemplateOwned(path: string): boolean {
  const name = path.split('/').pop()?.toLowerCase() ?? '';
  return TEMPLATE_OWNED_FILES.includes(name);
}

/** The <head> alone, when a page is too big to send whole. */
function headOnly(html: string): string {
  const match = html.match(/<head[\s\S]*?<\/head>/i);
  return match ? `${match[0]}\n<!-- body omitted: page over ${MAX_HTML_CHARS_FOR_AI} characters -->` : html.slice(0, MAX_HTML_CHARS_FOR_AI);
}
const MAX_FILE_BYTES = 256 * 1024;
// A fix touches site content and config. Anything else - CI, lockfiles, source code we were
// never asked to rewrite - is not what an SEO fix PR is for.
const ALLOWED_EXTENSIONS = ['.html', '.htm', '.txt', '.xml', '.json', '.webmanifest', '.md', '.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.astro'];

function validateGeneratedFiles(files: unknown, appRoot: string): FileChange[] {
  if (!Array.isArray(files)) {
    console.warn('[VALIDATE] generated files was not an array; dropping everything');
    return [];
  }

  const kept: FileChange[] = [];
  const seen = new Set<string>();

  for (const candidate of files.slice(0, MAX_GENERATED_FILES)) {
    const path = (candidate as { path?: unknown })?.path;
    const content = (candidate as { content?: unknown })?.content;
    const message = (candidate as { message?: unknown })?.message;
    const reject = (why: string) => console.warn(`[VALIDATE] dropped ${String(path)}: ${why}`);

    if (typeof path !== 'string' || !path.trim()) { reject('no path'); continue; }
    if (typeof content !== 'string' || content.length === 0) { reject('empty content'); continue; }
    if (content.length > MAX_FILE_BYTES) { reject(`${content.length} bytes`); continue; }

    // Path traversal, absolute paths and Windows drive letters never reach the GitHub API.
    if (path.includes('..') || path.startsWith('/') || path.startsWith('~') || /^[a-zA-Z]:/.test(path)) {
      reject('unsafe path'); continue;
    }
    if (appRoot && !path.startsWith(appRoot)) { reject(`outside app root ${appRoot}`); continue; }
    // Workflows are what create-ci-pr is for, and .git is not ours to write.
    if (path.includes('.github/workflows/') || path.startsWith('.git/')) { reject('not an SEO file'); continue; }
    if (!ALLOWED_EXTENSIONS.some((ext) => path.toLowerCase().endsWith(ext))) { reject('extension not allowed'); continue; }
    if (seen.has(path)) { reject('duplicate path'); continue; }

    seen.add(path);
    kept.push({
      path,
      content,
      message: typeof message === 'string' && message.trim() ? message : `fix(seo): update ${path}`,
    });
  }

  if (kept.length !== files.length) {
    console.warn(`[VALIDATE] kept ${kept.length} of ${files.length} generated files`);
  }
  return kept;
}

// A rewrite that loses most of the file, or an HTML file that comes back without its closing
// tags, is a truncated generation rather than a fix. Compared against what the repo has.
function looksTruncated(path: string, original: string, replacement: string): string | null {
  if (replacement.length < original.length * 0.6) {
    return `replacement is ${Math.round((replacement.length / original.length) * 100)}% of the original`;
  }
  if (/\.html?$/i.test(path)) {
    for (const tag of ['</head>', '</body>', '</html>']) {
      if (original.includes(tag) && !replacement.includes(tag)) return `lost ${tag}`;
    }
  }
  return null;
}

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
  /**
   * Where a file has to live to be served at the site root, relative to appRoot: 'public/'
   * for bundlers, '' for a site served as-is (GitHub Pages from docs/). The prompt used to
   * say public/ unconditionally, and on a Pages site the model duly wrote
   * docs/public/robots.txt - a file that repository will never serve.
   */
  servedDir: string;
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
): Promise<{ files: FileChange[]; summary: string; usage?: { promptTokens?: number; completionTokens?: number } }> {
  const appRoot = repoContext.appRoot || '';
  const servedDir = repoContext.servedDir;
  const isReactVite = repoContext.framework === 'react-vite' || repoContext.framework === 'react';
  const isNextjs = repoContext.framework === 'nextjs';

  const frameworkInstructions = isReactVite ? `
REACT/VITE SPECIFIC RULES (VERY IMPORTANT):
- The app is in the "${appRoot}" directory - ALL file paths must start with "${appRoot}"
- DO NOT create a new index.html - modify the EXISTING "${appRoot}index.html" in the <head> section only
- For dynamic meta tags, create a React component using react-helmet-async or modify existing SEO component
- Static files (robots.txt, sitemap.xml, _headers) go in "${appRoot}${servedDir}"
- The index.html already has a <div id="root"></div> - DO NOT remove or modify the body content
- Add meta tags, preconnect links, and JSON-LD scripts to the <head> section of the existing index.html
- If the index.html already has meta tags, UPDATE them, don't duplicate
` : isNextjs ? `
NEXT.JS SPECIFIC RULES:
- Use the app/ or pages/ directory structure
- Create or modify app/layout.tsx for metadata
- Use Next.js Metadata API for SEO tags
- Static files go in ${servedDir || "the app root"}
` : `
STATIC SITE RULES:
- Modify index.html directly
- Static files go in ${servedDir || "the app root, beside index.html"}
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
- robots.txt issues -> create/modify ${appRoot}${servedDir}robots.txt
- sitemap issues -> create ${appRoot}${servedDir}sitemap.xml
- llms.txt issues -> create/modify ${appRoot}${servedDir}llms.txt
- Schema/structured data -> add JSON-LD scripts to index.html <head>
- Security headers -> create ${appRoot}${servedDir}_headers or ${appRoot}vercel.json
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
1. All file paths MUST start with "${repoContext.appRoot}" (e.g., "${repoContext.appRoot}${repoContext.servedDir}robots.txt")
2. For the existing index.html, ONLY modify the <head> section - DO NOT replace the entire file
3. Preserve the existing <div id="root"></div> and body content
4. Each commit message should have: subject line with fix count, then body with issue codes (e.g., "fix(seo): add meta tags (3 fixes)\\n\\nIssues fixed:\\n- CODE1\\n- CODE2")

For this project, you should:
1. Create/update ${repoContext.appRoot}${repoContext.servedDir}robots.txt with proper rules
2. Create ${repoContext.appRoot}${repoContext.servedDir}sitemap.xml with the site URL
3. Update ${repoContext.appRoot}index.html <head> section with all missing meta tags, OG tags, Twitter cards (DO NOT replace body!)
4. Add JSON-LD structured data to ${repoContext.appRoot}index.html <head>
5. Create ${repoContext.appRoot}${repoContext.servedDir}_headers or ${repoContext.appRoot}vercel.json for security headers
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

  const usage: { promptTokens?: number; completionTokens?: number } = {};
  const content = await callChatCompletion(aiConfig, systemPrompt, userPrompt, { jsonMode: true, usage });
  return { ...JSON.parse(content), usage };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Functions deploy with --no-verify-jwt, so the caller is checked here. Three ways in:
    // github-webhook with the service key, the dashboard with a Supabase session, or an
    // API key - which is all the CLI and CI ever have, so without it `rankcli` could ask for
    // an audit but never for the PR that fixes it. Ownership is enforced the same way for
    // all three: callerId must match the project's owner (the service key is trusted and
    // sets no callerId, because the webhook acts for whichever project the push came from).
    const bearer = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    let callerId: string | null = null;
    if (bearer !== supabaseServiceKey) {
      const apiKeyUserId = await userIdFromApiKey(req, supabase);
      if (apiKeyUserId) {
        callerId = apiKeyUserId;
      } else {
        const { data: { user } } = await supabase.auth.getUser(bearer);
        if (!user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        callerId = user.id;
      }
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

    const { tier, planName, limits } = await getEntitlement(supabase, project.user_id);

    // Monthly allowance. null = unlimited. Only auto-fix PRs count: a CI-setup PR is a
    // one-off template commit and charging quota for the thing that gets SEO into CI
    // would be taxing the on-ramp.
    const monthlyAllowance = limits.autoFixPrsPerMonth;
    let prsThisMonth = 0;
    if (monthlyAllowance !== null) {
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('github_prs')
        .select('id, projects!inner(user_id)', { count: 'exact', head: true })
        .eq('projects.user_id', project.user_id)
        .eq('kind', 'auto_fix')
        .gte('created_at', monthStart.toISOString());
      prsThisMonth = count ?? 0;
      if (prsThisMonth >= monthlyAllowance) {
        return new Response(JSON.stringify({
          error: `The ${planName} plan includes ${monthlyAllowance} auto-fix PRs a month, and this month's are used. Upgrade for unlimited auto-fix PRs: https://rankcli.dev/pricing`,
          code: 'pr_limit_reached',
          prsThisMonth,
          prsAllowedThisMonth: monthlyAllowance,
          tier,
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // One open auto-fix PR at a time (see MAX_OPEN_AUTO_FIX_PRS). A skip, not an error -
    // the push-triggered path hits this constantly by design and must stay quiet.
    const { data: openPrs, error: openPrsError } = await supabase
      .from('github_prs')
      .select('pr_number, pr_url')
      .eq('project_id', project.id)
      .eq('kind', 'auto_fix')
      .eq('pr_state', 'open')
      .order('created_at', { ascending: false });
    if (openPrsError) {
      return new Response(JSON.stringify({ error: `Could not read open PRs: ${openPrsError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if ((openPrs?.length ?? 0) >= MAX_OPEN_AUTO_FIX_PRS) {
      const open = openPrs![0];
      return noop(
        `PR #${open.pr_number} is still open for this project. Merge or close it and the next audit picks up whatever it didn't fix.`,
        { code: 'open_pr_exists', prUrls: openPrs!.map((p) => p.pr_url), prsThisMonth, prsAllowedThisMonth: monthlyAllowance }
      );
    }

    // The AI config is resolved further down, immediately before the model call - claiming
    // the one-time gift here would spend it on a request that still might fail for a missing
    // repository, an exhausted PR allowance, or a report with nothing fixable on it.

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
        prsThisMonth,
        prsAllowedThisMonth: monthlyAllowance,
        prUrls: reportPrs.map((p) => p.pr_url),
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Issues whose only possible "fix" is inventing content. A model told to fix
    // AI_NO_TESTIMONIALS writes testimonials; told to fix YMYL_NO_AUTHOR it invents an
    // author with credentials; told to fix AI_NO_ORIGINAL_DATA it makes up data - and we
    // commit the result to the customer's repository. These are real findings and they
    // belong in the report, where a human can act on them. They do not belong in a prompt
    // that ends in a commit.
    const NEEDS_HUMAN_CONTENT = [
      'AI_NO_TESTIMONIALS', 'AI_NO_REVIEW_INTEGRATION', 'AI_NO_REVIEW_PLATFORMS',
      'AI_WEAK_REVIEW_ECOSYSTEM', 'REVIEW_NO_VIDEO', 'NO_SOCIAL_PROOF',
      'BOFU_NO_SOCIAL_PROOF', 'AI_NO_AUTHOR_EXPERTISE', 'YMYL_NO_AUTHOR',
      'YMYL_NO_CITATIONS', 'AI_NO_EXTERNAL_CITATIONS', 'AI_LOW_CITATION_QUALITY',
      'AI_LOW_CITATION_WORTHINESS', 'LOW_AI_CITATION_READINESS', 'AI_NO_ORIGINAL_DATA',
      'AI_NO_EXPERIENCE_SIGNALS', 'NO_EXPERIENCE_SIGNALS', 'AI_NO_COMPARISON_TABLE',
      'AI_NO_QA_FORMAT', 'AI_NO_NUMBERED_STEPS', 'AI_NO_BRAND_DEFINITION',
      'NO_AGENT_EXPERIENCE_SURFACE',
    ];

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
      (i) =>
        !NON_FIXABLE_CODES.includes(i.code) &&
        !NEEDS_HUMAN_CONTENT.includes(i.code) &&
        !claimedIssueIds.has(i.id)
    );

    if (fixableIssues.length === 0) {
      // Nothing to do, and the reason matters: a report whose issues are all already in a
      // PR is a no-op, not an empty report.
      if (claimedIssueIds.size > 0) {
        const open = reportPrs.filter((p) => p.pr_state === 'open');
        return noop(
          `Every auto-fixable issue on this report is already in ${open.length === 1 ? 'a PR' : 'a PR'} (${reportPrs.map((p) => `#${p.pr_number}`).join(', ')}). Nothing new to open.`,
          { prUrls: reportPrs.map((p) => p.pr_url), prsForReport: reportPrs.length, prsAllowedForReport: PRS_PER_REPORT, prsThisMonth, prsAllowedThisMonth: monthlyAllowance }
        );
      }
      return noop('No auto-fixable issues on this report.', {
        prsForReport: reportPrs.length,
        prsAllowedForReport: PRS_PER_REPORT,
        prsThisMonth,
        prsAllowedThisMonth: monthlyAllowance,
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
    // Vite and friends serve public/; a site served as-is (GitHub Pages from docs/) has no
    // public/ and never would. One answer, used by the prompt and by the templates.
    const publicDir = files.some((f) => f.startsWith(`${appRoot}public/`)) ? 'public/' : '';
    const servedRoot = `${appRoot}${publicDir}`;
    console.log(`Detected app root: ${appRoot || '(root)'}, served from: ${servedRoot || '(root)'}`);

    // Fetch package.json and index.html from the correct location
    const [packageJson, indexHtml] = await Promise.all([
      fetchFileContent(token, owner, repoName, `${appRoot}package.json`),
      fetchFileContent(token, owner, repoName, `${appRoot}index.html`)
        .then(r => r || fetchFileContent(token, owner, repoName, `${appRoot}public/index.html`)),
    ]);

    const framework = detectFramework(packageJson, files, appRoot);
    console.log(`Detected framework: ${framework}`);

    const oversizedHtml = !!indexHtml && indexHtml.length > MAX_HTML_CHARS_FOR_AI;
    if (oversizedHtml) {
      console.log(`index.html is ${indexHtml!.length} chars; sending <head> only`);
    }

    const repoContext: RepoContext = {
      packageJson,
      indexHtml: oversizedHtml ? headOnly(indexHtml!) : indexHtml,
      framework,
      files,
      appRoot,
      servedDir: publicDir,
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

    // The user's own key, else their one gifted call on RankCLI's OpenRouter key, else the
    // templates. The gift is claimed inside resolveAIConfig, atomically, and only here.
    const aiResolution = await resolveAIConfig(supabase, project.user_id, {
      enabled: true,
      projectId: project.id,
      auditId: targetAuditId,
    });
    const aiConfig = aiResolution.ok ? aiResolution.config : null;
    const gifted = aiResolution.ok && aiResolution.source === 'gift';

    let aiResult: { files: FileChange[]; summary: string };
    let generatedBy: 'ai' | 'gift' | 'templates';
    const byModel = () => generatedBy === 'ai' || generatedBy === 'gift';

    if (aiConfig) {
      console.log(`Generating AI-powered fixes${gifted ? ` (gifted, ${giftModel()})` : ''}...`);
      generatedBy = gifted ? 'gift' : 'ai';
      try {
        const raw = await generateAIFixes(
          aiConfig,
          issues as AuditIssue[],
          repoContext,
          project.url,
          project.name,
          aiSuggestions
        );
        // The model's answer is parsed JSON from a remote service, not a trusted value.
        aiResult = { files: validateGeneratedFiles(raw?.files, appRoot), summary: raw?.summary ?? '' };

        if (gifted) {
          // What it actually cost, recorded against the grant, so the unit economics are
          // visible from the first one instead of reconstructed from a dashboard later.
          const promptTokens = raw?.usage?.promptTokens ?? null;
          const completionTokens = raw?.usage?.completionTokens ?? null;
          await supabase.rpc('settle_ai_gift', {
            p_user_id: project.user_id,
            p_status: 'settled',
            p_model: giftModel(),
            p_prompt_tokens: promptTokens,
            p_completion_tokens: completionTokens,
            p_cost_usd:
              promptTokens !== null && completionTokens !== null
                ? giftCostUsd(promptTokens, completionTokens)
                : null,
          });
          console.log(`[GIFT] settled for ${project.user_id}: ${promptTokens}/${completionTokens} tokens`);
        }
      } catch (error) {
        // The grant is already spent at this point. Mark it failed rather than leaving a
        // 'claimed' row that looks like an account which used its gift and got nothing:
        // a failed row is the signal to investigate, and it can be cleared to re-gift.
        if (gifted) {
          await supabase.rpc('settle_ai_gift', { p_user_id: project.user_id, p_status: 'failed', p_model: giftModel() });
        }
        throw error;
      }
    } else {
      console.log('No AI key - generating template fixes...');
      generatedBy = 'templates';
      const [robotsTxt, sitemapXml, llmsTxt] = await Promise.all([
        fetchFileContent(token, owner, repoName, `${servedRoot}robots.txt`),
        fetchFileContent(token, owner, repoName, `${servedRoot}sitemap.xml`),
        fetchFileContent(token, owner, repoName, `${servedRoot}llms.txt`),
      ]);
      // llms.txt exists to list a site's pages, so list them: every index.html the repo
      // serves is a real URL, which is better than guessing and better than one link to the
      // homepage. Capped, sorted, and derived only from files that exist.
      const base = project.url.replace(/\/$/, '');
      const pageUrls = [
        `${base}/`,
        ...files
          .filter((f) => f.startsWith(servedRoot) && f.endsWith('/index.html'))
          .map((f) => `${base}/${f.slice(servedRoot.length, -'index.html'.length)}`)
          .filter((url) => url !== `${base}/`)
          .sort()
          .slice(0, 40),
      ];

      const deterministic = buildDeterministicFixes({
        siteUrl: project.url,
        siteName: project.name,
        appRoot,
        publicDir,
        issueCodes: issues.map((i: AuditIssue) => i.code),
        existing: { indexHtml, robotsTxt, sitemapXml, llmsTxt },
        pages: pageUrls,
      });
      aiResult = { files: deterministic.files, summary: deterministic.summary };
    }

    if (!aiResult.files || aiResult.files.length === 0) {
      return noop(
        byModel()
          ? 'The AI could not generate fixes for these issues.'
          : "None of this report's issues can be fixed from a template. Connect an AI provider key to fix the rest - RankCLI runs AI features on your own key: https://rankcli.dev/account?tab=ai-provider",
        {
          generatedBy,
          prsForReport: reportPrs.length,
          prsAllowedForReport: PRS_PER_REPORT,
          prsThisMonth,
          prsAllowedThisMonth: monthlyAllowance,
        }
      );
    }

    console.log(`AI generated ${aiResult.files.length} file changes`);

    // Keep only files that would actually change the repo. Re-running a report over a
    // codebase that already carries the fixes used to open a PR containing nothing:
    // a branch, a commit per file, and no diff for the reviewer to look at.
    const changedFiles: FileChange[] = [];
    const unchangedPaths: string[] = [];
    const rejectedPaths: string[] = [];
    for (const file of aiResult.files) {
      const existing = await fetchFileContent(token, owner, repoName, file.path);
      if (existing !== null && sameContent(existing, file.content)) {
        unchangedPaths.push(file.path);
        continue;
      }
      // A file we could have generated ourselves, that already exists, is not the model's to
      // rewrite - see TEMPLATE_OWNED_FILES.
      if (existing !== null && isTemplateOwned(file.path)) {
        console.warn(`[VALIDATE] dropped ${file.path}: exists already and is template-owned`);
        rejectedPaths.push(file.path);
        continue;
      }
      // Replacing an existing file is the risky direction: a truncated generation would
      // land as a commit that deletes most of a page. Only checkable here, where the
      // original is in hand.
      if (existing !== null) {
        const truncated = looksTruncated(file.path, existing, file.content);
        if (truncated) {
          console.warn(`[VALIDATE] dropped ${file.path}: ${truncated}`);
          rejectedPaths.push(file.path);
          continue;
        }
      }
      changedFiles.push(file);
    }

    if (changedFiles.length === 0) {
      console.log('All generated files match the repository; no PR opened');
      return noop(
        `Your repository already matches the ${unchangedPaths.length} file${unchangedPaths.length === 1 ? '' : 's'} we would have changed. No PR opened.`,
        {
          unchangedFiles: unchangedPaths,
          prsForReport: reportPrs.length,
          prsAllowedForReport: PRS_PER_REPORT,
          prsThisMonth,
          prsAllowedThisMonth: monthlyAllowance,
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
    const prBody = `## ${byModel() ? '🚀 AI-Generated SEO Fixes' : '🚀 SEO Fixes'}

${generatedBy === 'gift'
  ? `This PR was generated by [RankCLI](https://rankcli.dev) using AI analysis of your codebase - **on us**. You don't have an AI provider key connected, so this one ran on RankCLI's own key (\`${giftModel()}\`). Every account gets one.\n\nFor the next one, [connect your own key](https://rankcli.dev/account?tab=ai-provider) - AI features run on your key, you pick the model, and there's no limit.`
  : generatedBy === 'ai'
  ? 'This PR was automatically generated by [RankCLI](https://rankcli.dev) using AI analysis of your codebase.'
  : `This PR was generated by [RankCLI](https://rankcli.dev) from its templates - no AI involved, nothing invented, built from this site's URL and name. Connect an AI provider key to also get the content rewrites a template can't do (titles, meta descriptions, framework-specific edits): https://rankcli.dev/account?tab=ai-provider`}

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
2. ${byModel() ? `AI analyzed your codebase (detected: **${framework}**)` : `Detected the framework (**${framework}**) and selected the template fixes for what the audit reported`}
3. ${byModel() ? 'Generated framework-specific fixes that match your code style' : 'Generated the files deterministically - the same report always produces the same PR'}
4. Created this PR with the changes${rejectedPaths.length > 0 ? `\n\n> ${rejectedPaths.length} generated file(s) were rejected before committing as likely truncated: ${rejectedPaths.map((p) => `\`${p}\``).join(', ')}.` : ''}

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
      kind: 'auto_fix',
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
      rejectedFiles: rejectedPaths,
      generatedBy,
      issuesFixed: issues.length,
      // One more PR has been opened against this report than the caller last saw.
      prsForReport: reportPrs.length + 1,
      prsAllowedForReport: PRS_PER_REPORT,
      prsThisMonth: prsThisMonth + 1,
      prsAllowedThisMonth: monthlyAllowance,
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
