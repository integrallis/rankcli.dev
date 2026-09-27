// Opens the PR that puts RankCLI into the repository's CI.
//
// Deliberately not part of create-seo-pr, even though both open PRs, because they are
// different products. This one commits a template: no LLM, no AI key, no plan check, no
// quota. Getting an audit into CI is the on-ramp - the CLI, the Action and the MCP server
// are free on every plan - and folding it into the AI path meant a missing AI key blocked
// the one thing that has nothing to do with AI.
//
// The workflow YAML comes from agent-runtime's generator, the same one `rankcli setup
// --github-action` writes, so the file the dashboard commits and the file the CLI writes
// are the same file.
//
// It cannot create the RANKCLI_API_KEY secret: the App installation holds contents,
// workflows, pull_requests, issues and metadata - not secrets - and adding `secrets: write`
// would force every existing installer to re-approve. So the PR body links to the repo's
// secrets page, and the generated workflow is useful with no key at all (it audits and
// fails on regression; syncing to the dashboard is what the key adds).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getInstallationToken } from '../_shared/github-app.ts';
import {
  fetchFileContent,
  getDefaultBranchSha,
  createBranch,
  createOrUpdateFile,
  createPullRequest,
} from '../_shared/github-repo.ts';
import { getEntitlement } from '../_shared/tier.ts';
// The Deno bundle is emitted JS re-exported by a .ts wrapper, so its runtime values cross
// over but its types do not - importing WorkflowConfig from it fails type-check. Mirrored
// here instead; agent-runtime's tracking/github-action-template.ts holds the original.
import { generateWorkflow, generateSecretsDoc } from '../_shared/audit/index.ts';

interface WorkflowConfig {
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  siteUrl: string;
  features: { audit: boolean; autoFix: boolean; createIssues: boolean; createPRs: boolean };
  syncToDashboard?: boolean;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WORKFLOW_PATH = '.github/workflows/seo.yml';
const SECRETS_DOC_PATH = '.github/SEO_SETUP.md';

/**
 * The path of a workflow that already runs RankCLI, or null. Reads the workflow directory
 * and greps each file, because the name is the author's choice, not ours.
 */
async function findRankcliWorkflow(token: string, owner: string, repo: string): Promise<string | null> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
  );
  if (!response.ok) return null; // no workflows directory yet

  const entries = (await response.json()) as Array<{ name: string; path: string; type: string }>;
  const workflows = entries.filter((e) => e.type === 'file' && /\.ya?ml$/i.test(e.name));

  for (const workflow of workflows) {
    const content = await fetchFileContent(token, owner, repo, workflow.path);
    // Either the published action or the CLI - both mean this repo is already covered.
    if (content && /rankcli/i.test(content)) return workflow.path;
  }
  return null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Nothing to do, and that isn't a failure. Mirrors create-seo-pr's noop shape. */
function noop(message: string, extra: Record<string, unknown> = {}): Response {
  return json({ success: true, prCreated: false, noop: true, message, ...extra });
}

// The cadence the plan is sold with. The cron runs on the customer's own Actions minutes,
// so this is a sensible default rather than a limit we enforce - writing a workflow that
// pretended to be metered would be a lie in their repository.
function scheduleForTier(tier: string): WorkflowConfig['schedule'] {
  return tier === 'pro' || tier === 'agency' ? 'daily' : 'weekly';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const bearer = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    let callerId: string | null = null;
    if (bearer !== supabaseServiceKey) {
      const { data: { user } } = await supabase.auth.getUser(bearer);
      if (!user) return json({ error: 'Unauthorized' }, 401);
      callerId = user.id;
    }

    const { projectId } = await req.json();
    if (!projectId) return json({ error: 'Project ID required' }, 400);

    const githubAppId = Deno.env.get('GITHUB_APP_ID');
    const githubPrivateKey = Deno.env.get('GITHUB_PRIVATE_KEY');
    if (!githubAppId || !githubPrivateKey) return json({ error: 'GitHub App not configured' }, 500);

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, name, url, github_repo_url, github_installation_id')
      .eq('id', projectId)
      .single();
    if (projectError || !project || (callerId && project.user_id !== callerId)) {
      return json({ error: 'Project not found' }, 404);
    }

    if (!project.github_repo_url || !project.github_installation_id) {
      return json({
        error: 'Connect a GitHub repository to this project first.',
        code: 'no_repo',
      }, 400);
    }

    const repoMatch = project.github_repo_url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoMatch) return json({ error: 'Invalid GitHub repo URL' }, 400);
    const [, owner, rawRepo] = repoMatch;
    const repo = rawRepo.replace(/\.git$/, '');

    // An open CI-setup PR is the answer to a second click.
    const { data: existingPrs, error: existingError } = await supabase
      .from('github_prs')
      .select('pr_number, pr_url')
      .eq('project_id', project.id)
      .eq('kind', 'ci_setup')
      .eq('pr_state', 'open')
      .order('created_at', { ascending: false });
    if (existingError) return json({ error: `Could not read open PRs: ${existingError.message}` }, 500);
    if (existingPrs?.length) {
      return noop(`PR #${existingPrs[0].pr_number} already adds RankCLI to this repository's CI.`, {
        prUrl: existingPrs[0].pr_url,
        code: 'pr_already_open',
      });
    }

    const token = await getInstallationToken(project.github_installation_id, githubPrivateKey, githubAppId);

    // Already in CI: any workflow that runs RankCLI, whatever it is called. Checking only
    // for seo.yml meant a repository already auditing itself under another name - say
    // seo-audit.yml, which is what integrallis/integrallis uses - got a second workflow
    // doing the same job.
    const existing = await findRankcliWorkflow(token, owner, repo);
    if (existing) {
      return noop(`${existing} already runs RankCLI on the default branch - it is already in CI.`, {
        code: 'already_set_up',
        workflowUrl: `${project.github_repo_url}/blob/HEAD/${existing}`,
      });
    }

    const { tier } = await getEntitlement(supabase, project.user_id);

    // An API key makes the CI audits land on the dashboard; without one the workflow still
    // audits and still fails on regression, so the key is an upgrade, not a requirement.
    const { count: apiKeyCount } = await supabase
      .from('api_keys')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', project.user_id)
      .is('revoked_at', null);
    const syncToDashboard = (apiKeyCount ?? 0) > 0;

    const config: WorkflowConfig = {
      schedule: scheduleForTier(tier),
      siteUrl: project.url,
      features: {
        audit: true,
        // The fix step needs an API key to prove entitlement, so only generate it when
        // there is one to find - otherwise every run would hit a tier check it can't pass.
        autoFix: syncToDashboard,
        createIssues: true,
        createPRs: syncToDashboard,
      },
      syncToDashboard,
    };

    const { sha: baseSha, branch: defaultBranch } = await getDefaultBranchSha(token, owner, repo);
    const branchName = `rankcli/add-seo-ci-${Date.now()}`;
    await createBranch(token, owner, repo, branchName, baseSha);

    await createOrUpdateFile(
      token, owner, repo, branchName, WORKFLOW_PATH,
      generateWorkflow(config),
      'ci(seo): add RankCLI SEO audit workflow'
    );
    await createOrUpdateFile(
      token, owner, repo, branchName, SECRETS_DOC_PATH,
      generateSecretsDoc(config),
      'docs(seo): how to configure the RankCLI workflow'
    );

    const prTitle = `ci(seo): audit ${project.name} on every change`;
    const prBody = `## Add RankCLI to CI

This PR adds a GitHub Actions workflow that audits [${project.url}](${project.url}) with
[RankCLI](https://rankcli.dev) — ${config.schedule}, on pushes to \`${defaultBranch}\`, and on demand.

### What it does

- Runs the SEO/GEO audit and writes the result to the job summary
- Comments the report on pull requests
- **Fails the step when SEO regresses**, so a drop can't merge unnoticed
${syncToDashboard ? '- Syncs each audit to your RankCLI dashboard\n' : ''}
### Files

- \`${WORKFLOW_PATH}\` — the workflow
- \`${SECRETS_DOC_PATH}\` — what it needs and why

${syncToDashboard
  ? `### One secret to add

Add \`RANKCLI_API_KEY\` under [Settings → Secrets and variables → Actions](${project.github_repo_url}/settings/secrets/actions/new),
using a key from [your account](https://rankcli.dev/account?tab=api-keys). Without it the audit still
runs and still fails on regression — the key is what makes the results show up on your dashboard.`
  : `### No secrets required

The workflow runs as-is. Want these audits on your RankCLI dashboard too? Create an API key at
[your account](https://rankcli.dev/account?tab=api-keys), add it as \`RANKCLI_API_KEY\` under
[Settings → Secrets and variables → Actions](${project.github_repo_url}/settings/secrets/actions/new),
and re-run this setup to include the sync and auto-fix steps.`}

---

**🤖 Generated by [RankCLI](https://rankcli.dev)** — Ship code, get ranked.
`;

    const pr = await createPullRequest(token, owner, repo, prTitle, prBody, branchName, defaultBranch);

    // kind: 'ci_setup' keeps this out of every auto-fix quota and out of the one-open-PR cap.
    const { error: insertError } = await supabase.from('github_prs').insert({
      project_id: project.id,
      kind: 'ci_setup',
      pr_number: pr.number,
      pr_url: pr.url,
      pr_title: prTitle,
      pr_state: 'open',
      branch_name: branchName,
      files_changed: 2,
    });
    if (insertError) console.error('Failed to record CI PR:', insertError.message);

    return json({
      success: true,
      prCreated: true,
      prUrl: pr.url,
      prNumber: pr.number,
      schedule: config.schedule,
      syncToDashboard,
      filesChanged: 2,
    });
  } catch (error) {
    console.error('[CREATE-CI-PR] failed:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
