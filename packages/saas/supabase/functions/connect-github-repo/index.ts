// Resolves the GitHub App installation covering a repo and links it to a
// project. This closes the gap where ConnectGitHubModal's plain "Connect
// Repository" URL field only ever set github_repo_url - create-seo-pr reads
// project.github_installation_id directly, so a project connected this way
// could never get an auto-fix PR even though the App really is installed.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getInstallationForRepo, getInstallationToken } from '../_shared/github-app.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const githubAppId = Deno.env.get('GITHUB_APP_ID');
const githubPrivateKey = Deno.env.get('GITHUB_PRIVATE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!githubAppId || !githubPrivateKey) {
      return new Response(JSON.stringify({ error: 'GitHub App not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { projectId, repoUrl } = await req.json();
    if (!projectId || !repoUrl) {
      return new Response(JSON.stringify({ error: 'projectId and repoUrl required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const repoMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoMatch) {
      return new Response(JSON.stringify({ error: 'Invalid GitHub repo URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const [, owner, repo] = repoMatch;
    const repoName = repo.replace(/\.git$/, '');

    // Confirm this project belongs to the caller before touching it.
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const installationId = await getInstallationForRepo(owner, repoName, githubPrivateKey, githubAppId);

    if (!installationId) {
      // Not an error - the repo URL is still saved by the caller's own
      // update. The App just isn't installed on it (yet).
      return new Response(JSON.stringify({ linked: false, reason: 'App not installed on this repository' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let repoId: number | null = null;
    try {
      const installationToken = await getInstallationToken(installationId, githubPrivateKey, githubAppId);
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (repoResponse.ok) {
        repoId = (await repoResponse.json()).id;
      }
    } catch (err) {
      console.error('Failed to fetch repo id (non-fatal):', err);
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        github_repo_url: repoUrl,
        github_installation_id: installationId,
        ...(repoId ? { github_repo_id: repoId } : {}),
      })
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ linked: true, installationId, repoId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('connect-github-repo error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
