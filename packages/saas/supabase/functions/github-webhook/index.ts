// GitHub Webhook Handler for RankCLI
// Handles: push, pull_request, workflow_run, create, issues, issue_comment, installation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hub-signature-256',
};

interface GitHubPushEvent {
  ref: string;
  repository: {
    id: number;
    full_name: string;
    html_url: string;
    default_branch: string;
  };
  installation?: {
    id: number;
  };
  sender: {
    login: string;
  };
  commits?: Array<{
    id: string;
    message: string;
    added: string[];
    modified: string[];
  }>;
}

interface GitHubInstallationEvent {
  action: 'created' | 'deleted' | 'suspend' | 'unsuspend';
  installation: {
    id: number;
    account: {
      login: string;
      type: 'User' | 'Organization';
    };
    permissions: Record<string, string>;
  };
  sender: {
    login: string;
  };
}

interface GitHubPullRequestEvent {
  action: 'opened' | 'closed' | 'merged' | 'synchronize';
  number: number;
  pull_request: {
    id: number;
    number: number;
    state: string;
    title: string;
    html_url: string;
    merged: boolean;
    merged_at: string | null;
  };
  repository: {
    id: number;
    full_name: string;
  };
  installation?: {
    id: number;
  };
}

interface GitHubWorkflowRunEvent {
  action: 'requested' | 'completed' | 'in_progress';
  workflow_run: {
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    html_url: string;
    head_branch: string;
  };
  repository: {
    id: number;
    full_name: string;
    html_url: string;
    default_branch: string;
  };
  installation?: {
    id: number;
  };
}

interface GitHubCreateEvent {
  ref: string;
  ref_type: 'branch' | 'tag';
  repository: {
    id: number;
    full_name: string;
    html_url: string;
  };
  installation?: {
    id: number;
  };
}

interface GitHubIssueCommentEvent {
  action: 'created' | 'edited' | 'deleted';
  issue: {
    number: number;
    title: string;
    html_url: string;
  };
  comment: {
    id: number;
    body: string;
    user: {
      login: string;
    };
  };
  repository: {
    id: number;
    full_name: string;
    html_url: string;
  };
  installation?: {
    id: number;
  };
}

interface GitHubIssuesEvent {
  action: 'opened' | 'edited' | 'closed' | 'reopened' | 'labeled' | 'unlabeled';
  issue: {
    number: number;
    title: string;
    html_url: string;
    state: string;
    labels: Array<{ name: string }>;
  };
  repository: {
    id: number;
    full_name: string;
  };
  installation?: {
    id: number;
  };
}

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;

  const hmac = createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  // Timing-safe comparison
  if (signature.length !== digest.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ digest.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify webhook signature (if secret is configured)
    if (webhookSecret) {
      const signature = req.headers.get('x-hub-signature-256');
      if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const event = req.headers.get('x-github-event');
    const payload = JSON.parse(rawBody);

    console.log(`Received GitHub event: ${event}`);

    // handlePush/handlePullRequest/handleWorkflowRun/handleIssueComment chain
    // into run-audit (a real crawl) and then create-seo-pr (an LLM call plus
    // several GitHub API calls) - together these routinely take well past
    // GitHub's webhook delivery timeout. Ack immediately and let the actual
    // work continue in the background via waitUntil, instead of blocking
    // the response on it (confirmed via real webhook deliveries timing out).
    const handleEvent = async () => {
      try {
        switch (event) {
          case 'installation':
            await handleInstallation(supabase, payload as GitHubInstallationEvent);
            break;

          case 'push':
            await handlePush(supabase, payload as GitHubPushEvent);
            break;

          case 'pull_request':
            await handlePullRequest(supabase, payload as GitHubPullRequestEvent);
            break;

          case 'workflow_run':
            await handleWorkflowRun(supabase, payload as GitHubWorkflowRunEvent);
            break;

          case 'create':
            await handleCreate(supabase, payload as GitHubCreateEvent);
            break;

          case 'issue_comment':
            await handleIssueComment(supabase, payload as GitHubIssueCommentEvent);
            break;

          case 'issues':
            await handleIssues(supabase, payload as GitHubIssuesEvent);
            break;

          case 'ping':
            console.log('Received ping event - webhook configured successfully');
            break;

          default:
            console.log(`Unhandled event type: ${event}`);
        }
      } catch (error) {
        console.error(`Webhook background handling error (${event}):`, error);
      }
    };

    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil(handleEvent());

    return new Response(
      JSON.stringify({ received: true, event }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleInstallation(
  supabase: ReturnType<typeof createClient>,
  payload: GitHubInstallationEvent
) {
  const { action, installation, sender } = payload;

  console.log(`Installation ${action}: ${installation.account.login} (${installation.id})`);

  if (action === 'created') {
    // Find user by GitHub username or create pending installation
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('github_username', sender.login)
      .single();

    if (profile) {
      // Link installation to user
      await supabase.from('github_installations').upsert({
        user_id: profile.id,
        installation_id: installation.id,
        account_login: installation.account.login,
        account_type: installation.account.type,
        permissions: installation.permissions,
        status: 'active',
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'installation_id',
      });

      console.log(`Linked installation ${installation.id} to user ${profile.id}`);
    } else {
      // Store pending installation (will be linked when user connects)
      await supabase.from('github_installations').upsert({
        user_id: null,
        installation_id: installation.id,
        account_login: installation.account.login,
        account_type: installation.account.type,
        permissions: installation.permissions,
        status: 'pending',
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'installation_id',
      });

      console.log(`Stored pending installation ${installation.id}`);
    }
  } else if (action === 'deleted') {
    // Mark installation as deleted
    await supabase
      .from('github_installations')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('installation_id', installation.id);

    // Remove installation from all projects
    await supabase
      .from('projects')
      .update({ github_installation_id: null })
      .eq('github_installation_id', installation.id);

    console.log(`Marked installation ${installation.id} as deleted`);
  } else if (action === 'suspend') {
    await supabase
      .from('github_installations')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('installation_id', installation.id);
  } else if (action === 'unsuspend') {
    await supabase
      .from('github_installations')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('installation_id', installation.id);
  }
}

async function handlePush(
  supabase: ReturnType<typeof createClient>,
  payload: GitHubPushEvent
) {
  const { repository, ref, installation, commits } = payload;

  // Only trigger on default branch pushes
  const branch = ref.replace('refs/heads/', '');
  if (branch !== repository.default_branch) {
    console.log(`Skipping push to non-default branch: ${branch}`);
    return;
  }

  // Find project by repo ID or URL
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, url, name')
    .or(`github_repo_id.eq.${repository.id},github_repo_url.eq.${repository.html_url}`)
    .single();

  if (!project) {
    console.log(`No project found for repo: ${repository.full_name}`);
    return;
  }

  // Check if relevant files were changed (SEO-related files)
  const relevantPatterns = [
    /\.(html|htm|tsx|jsx|vue|svelte|astro)$/i,
    /robots\.txt$/i,
    /sitemap.*\.xml$/i,
    /manifest\.json$/i,
    /(seo|meta|head)\./i,
  ];

  const changedFiles = commits?.flatMap(c => [...(c.added || []), ...(c.modified || [])]) || [];
  const hasRelevantChanges = changedFiles.some(file =>
    relevantPatterns.some(pattern => pattern.test(file))
  );

  if (!hasRelevantChanges && changedFiles.length > 0) {
    console.log(`No SEO-relevant files changed in push to ${repository.full_name}`);
    return;
  }

  console.log(`Triggering audit for project ${project.id} (${project.name})`);

  // Create audit record
  const { data: audit, error: auditError } = await supabase
    .from('audits')
    .insert({
      project_id: project.id,
      triggered_by: 'github_push',
      triggered_by_user: null,
      status: 'pending',
    })
    .select()
    .single();

  if (auditError) {
    console.error('Failed to create audit:', auditError);
    return;
  }

  // Call run-audit function
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/run-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ auditId: audit.id }),
    });

    if (!response.ok) {
      console.error('Failed to trigger audit:', await response.text());
    } else {
      console.log(`Audit ${audit.id} triggered successfully`);

      // After audit completes, trigger PR creation if GitHub App is configured
      const auditResult = await response.json();
      if (auditResult.issuesFound > 0) {
        console.log(`Triggering PR creation for ${auditResult.issuesFound} issues`);
        try {
          const prResponse = await fetch(`${supabaseUrl}/functions/v1/create-seo-pr`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ auditId: audit.id }),
          });

          if (prResponse.ok) {
            const prResult = await prResponse.json();
            if (prResult.prCreated) {
              console.log(`PR created: ${prResult.prUrl}`);
            }
          } else {
            console.log('PR creation skipped (GitHub App may not be configured)');
          }
        } catch (prError) {
          console.log('PR creation skipped:', prError.message);
        }
      }
    }
  } catch (error) {
    console.error('Error triggering audit:', error);
  }
}

async function handlePullRequest(
  supabase: ReturnType<typeof createClient>,
  payload: GitHubPullRequestEvent
) {
  const { action, pull_request, repository } = payload;

  // Find project by repo ID
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .or(`github_repo_id.eq.${repository.id}`)
    .single();

  if (!project) {
    console.log(`No project found for repo: ${repository.full_name}`);
    return;
  }

  // Update PR record if it was created by RankCLI
  const { data: existingPR } = await supabase
    .from('github_prs')
    .select('id')
    .eq('project_id', project.id)
    .eq('pr_number', pull_request.number)
    .single();

  if (existingPR) {
    const prState = pull_request.merged ? 'merged' : (pull_request.state as 'open' | 'closed');

    await supabase
      .from('github_prs')
      .update({
        pr_state: prState,
        merged_at: pull_request.merged_at,
        closed_at: action === 'closed' && !pull_request.merged ? new Date().toISOString() : null,
      })
      .eq('id', existingPR.id);

    // If PR was merged, mark issues as fixed
    if (pull_request.merged) {
      const { data: pr } = await supabase
        .from('github_prs')
        .select('issue_ids')
        .eq('id', existingPR.id)
        .single();

      if (pr?.issue_ids?.length) {
        await supabase
          .from('audit_issues')
          .update({
            status: 'fixed',
            fixed_at: pull_request.merged_at,
            fix_pr_url: pull_request.html_url,
          })
          .in('id', pr.issue_ids);

        console.log(`Marked ${pr.issue_ids.length} issues as fixed`);
      }
    }

    console.log(`Updated PR #${pull_request.number} state: ${prState}`);
  }
}

async function handleWorkflowRun(
  supabase: ReturnType<typeof createClient>,
  payload: GitHubWorkflowRunEvent
) {
  const { action, workflow_run, repository } = payload;

  // Only act on completed workflow runs
  if (action !== 'completed') {
    console.log(`Workflow run ${action}, waiting for completion`);
    return;
  }

  // Only trigger on successful deployments
  if (workflow_run.conclusion !== 'success') {
    console.log(`Workflow run concluded with: ${workflow_run.conclusion}`);
    return;
  }

  // Check if this is a deployment workflow (common names)
  const deploymentWorkflowPatterns = [
    /deploy/i,
    /release/i,
    /publish/i,
    /vercel/i,
    /netlify/i,
    /cloudflare/i,
    /pages/i,
  ];

  const isDeployment = deploymentWorkflowPatterns.some(pattern =>
    pattern.test(workflow_run.name)
  );

  if (!isDeployment) {
    console.log(`Workflow "${workflow_run.name}" is not a deployment workflow`);
    return;
  }

  // Only trigger on default branch
  if (workflow_run.head_branch !== repository.default_branch) {
    console.log(`Workflow ran on branch ${workflow_run.head_branch}, skipping`);
    return;
  }

  // Find project
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .or(`github_repo_id.eq.${repository.id},github_repo_url.eq.${repository.html_url}`)
    .single();

  if (!project) {
    console.log(`No project found for repo: ${repository.full_name}`);
    return;
  }

  console.log(`Deployment completed for ${project.name}, triggering audit`);

  // Create audit record
  const { data: audit, error: auditError } = await supabase
    .from('audits')
    .insert({
      project_id: project.id,
      triggered_by: 'github_push', // Use github_push as the trigger type
      triggered_by_user: null,
      status: 'pending',
    })
    .select()
    .single();

  if (auditError) {
    console.error('Failed to create audit:', auditError);
    return;
  }

  // Call run-audit function
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/run-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ auditId: audit.id }),
    });

    if (!response.ok) {
      console.error('Failed to trigger audit:', await response.text());
    } else {
      console.log(`Audit ${audit.id} triggered after deployment`);
    }
  } catch (error) {
    console.error('Error triggering audit:', error);
  }
}

async function handleCreate(
  supabase: ReturnType<typeof createClient>,
  payload: GitHubCreateEvent
) {
  const { ref, ref_type, repository } = payload;

  // Only handle branch creation (not tags)
  if (ref_type !== 'branch') {
    return;
  }

  console.log(`New branch created: ${ref} in ${repository.full_name}`);

  // For now, just log. In the future, this could:
  // - Detect preview branches (e.g., pr-123, preview/*)
  // - Queue audits for preview deployments
  // - Integrate with Vercel/Netlify preview URLs
}

async function handleIssueComment(
  supabase: ReturnType<typeof createClient>,
  payload: GitHubIssueCommentEvent
) {
  const { action, comment, issue, repository } = payload;

  // Only handle new comments
  if (action !== 'created') {
    return;
  }

  const body = comment.body.toLowerCase().trim();

  // Check for RankCLI commands
  const commands = [
    { pattern: /^\/rankcli\s+audit$/i, action: 'audit' },
    { pattern: /^\/rankcli\s+fix$/i, action: 'fix' },
    { pattern: /^\/rankcli\s+report$/i, action: 'report' },
  ];

  const matchedCommand = commands.find(cmd => cmd.pattern.test(body));

  if (!matchedCommand) {
    return;
  }

  console.log(`RankCLI command detected: ${matchedCommand.action} in ${repository.full_name}#${issue.number}`);

  // Find project
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .or(`github_repo_id.eq.${repository.id},github_repo_url.eq.${repository.html_url}`)
    .single();

  if (!project) {
    console.log(`No project found for repo: ${repository.full_name}`);
    // TODO: Could post a comment back saying "This repo is not connected to RankCLI"
    return;
  }

  if (matchedCommand.action === 'audit') {
    // Trigger an audit
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        project_id: project.id,
        triggered_by: 'api', // Triggered via comment command
        triggered_by_user: null,
        status: 'pending',
      })
      .select()
      .single();

    if (auditError) {
      console.error('Failed to create audit:', auditError);
      return;
    }

    // Call run-audit function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    try {
      await fetch(`${supabaseUrl}/functions/v1/run-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ auditId: audit.id }),
      });

      console.log(`Audit triggered via comment command: ${audit.id}`);
      // TODO: Post a comment back with audit status/link
    } catch (error) {
      console.error('Error triggering audit:', error);
    }
  }

  // TODO: Implement 'fix' and 'report' commands
}

async function handleIssues(
  supabase: ReturnType<typeof createClient>,
  payload: GitHubIssuesEvent
) {
  const { action, issue, repository } = payload;

  // Check if this issue was created by RankCLI (has our label)
  const hasRankCLILabel = issue.labels.some(
    label => label.name.toLowerCase() === 'rankcli' || label.name.toLowerCase() === 'seo'
  );

  if (!hasRankCLILabel) {
    return;
  }

  console.log(`RankCLI issue ${action}: ${repository.full_name}#${issue.number}`);

  // Track issue state changes for our created issues
  // This helps us know when users close/resolve SEO issues we created
  if (action === 'closed') {
    // Find project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .or(`github_repo_id.eq.${repository.id}`)
      .single();

    if (project) {
      // Could update audit_issues status here if we link GitHub issues to audit issues
      console.log(`RankCLI issue closed: ${issue.title}`);
    }
  }
}
