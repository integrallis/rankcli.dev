// Links a GitHub repository to a project: resolves the RankCLI GitHub App
// installation that covers the repo and saves it on the project. create-seo-pr
// reads project.github_installation_id to open auto-fix PRs, and github-webhook
// matches events to projects by repo, so these columns decide whose repository
// RankCLI writes to. Users can no longer set them directly (migration
// 20260919114000); this function is the only way in, so it must prove the
// caller can write to the repository before saving anything.
//
// The proof comes from GitHub, one of two ways:
// 1. `code` from the App's installation redirect, when the App requests user
//    authorization during installation and GITHUB_APP_CLIENT_ID and
//    GITHUB_APP_CLIENT_SECRET are set. It is exchanged for a user token, and
//    GitHub reports that user's permissions on the repo.
// 2. Otherwise, the GitHub identity on the caller's RankCLI account (they
//    signed in with GitHub, or linked it). The App asks GitHub what permission
//    that GitHub user has on the repo.
// Either way the caller needs write or admin access.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAppIdentity, getInstallationForRepo, getInstallationToken } from '../_shared/github-app.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const githubAppId = Deno.env.get('GITHUB_APP_ID');
const githubPrivateKey = Deno.env.get('GITHUB_PRIVATE_KEY');
const githubAppClientId = Deno.env.get('GITHUB_APP_CLIENT_ID');
const githubAppClientSecret = Deno.env.get('GITHUB_APP_CLIENT_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// github.com/<owner>/<repo>, nothing else. Owner and repo end up in GitHub API
// paths, so only GitHub's own name characters are accepted.
const REPO_URL = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9][A-Za-z0-9_-]{0,38})\/([A-Za-z0-9._-]{1,100}?)(?:\.git)?\/?$/;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

type AccessCheck = { ok: true } | { ok: false; reason: string; code: string };

const IDENTITY_REQUIRED: AccessCheck = {
  ok: false,
  code: 'github_identity_required',
  reason: 'Sign in to RankCLI with GitHub (using the same email) so we can confirm you have access to this repository, then connect it again.',
};

// Route 1: a user token from the App's OAuth code. GitHub fills in
// `permissions` on the repo object for the authenticated user.
async function checkAccessWithCode(code: string, owner: string, repo: string): Promise<AccessCheck | null> {
  if (!githubAppClientId || !githubAppClientSecret) return null;

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: githubAppClientId, client_secret: githubAppClientSecret, code }),
  });
  const tokenResult = tokenResponse.ok ? await tokenResponse.json() : null;
  if (!tokenResult?.access_token) return null; // expired or reused code - fall back to the identity check

  const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: githubHeaders(tokenResult.access_token),
  });
  if (!repoResponse.ok) {
    return { ok: false, code: 'no_repo_access', reason: `Your GitHub account can't access ${owner}/${repo}.` };
  }
  const permissions = (await repoResponse.json()).permissions || {};
  if (permissions.admin || permissions.maintain || permissions.push) return { ok: true };
  return { ok: false, code: 'no_write_access', reason: `Your GitHub account needs write access to ${owner}/${repo}.` };
}

// Route 2: the GitHub identity Supabase Auth recorded when the user signed in
// with GitHub. The numeric GitHub user id is stable across username changes,
// so the current login is looked up from it rather than trusted from sign-in.
async function checkAccessWithIdentity(
  identities: Array<{ provider: string; id?: string; identity_data?: Record<string, unknown> }> | undefined,
  installationToken: string,
  owner: string,
  repo: string
): Promise<AccessCheck> {
  const identity = identities?.find((i) => i.provider === 'github');
  const githubUserId = String(identity?.identity_data?.provider_id ?? identity?.identity_data?.sub ?? identity?.id ?? '');
  if (!identity || !/^\d+$/.test(githubUserId)) return IDENTITY_REQUIRED;

  const userResponse = await fetch(`https://api.github.com/user/${githubUserId}`, {
    headers: githubHeaders(installationToken),
  });
  if (!userResponse.ok) {
    return { ok: false, code: 'github_user_not_found', reason: 'Could not find your GitHub account on GitHub.' };
  }
  const login = (await userResponse.json()).login as string;

  const permissionResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/collaborators/${encodeURIComponent(login)}/permission`,
    { headers: githubHeaders(installationToken) }
  );
  if (!permissionResponse.ok) {
    return { ok: false, code: 'no_repo_access', reason: `GitHub user @${login} doesn't have access to ${owner}/${repo}.` };
  }
  const result = await permissionResponse.json();
  const sameUser = String(result.user?.id ?? '') === githubUserId;
  if (sameUser && (result.permission === 'admin' || result.permission === 'write')) return { ok: true };
  return { ok: false, code: 'no_write_access', reason: `GitHub user @${login} needs write access to ${owner}/${repo}.` };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!githubAppId || !githubPrivateKey) {
      return json({ error: 'GitHub App not configured' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing authorization header' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const { projectId, repoUrl, code } = await req.json();
    if (!projectId || !repoUrl) {
      return json({ error: 'projectId and repoUrl required' }, 400);
    }

    const repoMatch = typeof repoUrl === 'string' ? repoUrl.trim().match(REPO_URL) : null;
    if (!repoMatch || repoMatch[2] === '.' || repoMatch[2] === '..') {
      return json({ error: 'Invalid GitHub repo URL' }, 400);
    }
    const [, owner, repoName] = repoMatch;

    // Confirm this project belongs to the caller before touching it.
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return json({ error: 'Project not found' }, 404);
    }

    // With no way to prove access, stop before asking GitHub anything about
    // the repo.
    const canUseCode = typeof code === 'string' && !!code && !!githubAppClientId && !!githubAppClientSecret;
    if (!canUseCode && !user.identities?.some((i) => i.provider === 'github')) {
      return json({ linked: false, code: IDENTITY_REQUIRED.code, reason: IDENTITY_REQUIRED.reason });
    }

    const installationId = await getInstallationForRepo(owner, repoName, githubPrivateKey, githubAppId);

    if (!installationId) {
      // Not an error: the App just isn't installed on this repo (yet). Nothing is saved
      // until it is. The App is named because GitHub answers 404 identically when this
      // deployment is carrying the wrong App's credentials - a production install of
      // "rankcli" is invisible to a deployment holding the "rankcli-dev" key, and the
      // user, who did everything right, gets told to install what they just installed.
      const app = await getAppIdentity(githubPrivateKey, githubAppId);
      const named = app ? `The ${app.slug} GitHub App (id ${app.id})` : 'The RankCLI GitHub App';
      return json({
        linked: false,
        code: 'app_not_installed',
        app: app?.slug ?? null,
        reason: `${named} is not installed on ${owner}/${repoName}. Install it on this repository, then connect again - and if that App name is not the one you installed, this deployment is configured with the wrong GITHUB_APP_ID / GITHUB_PRIVATE_KEY.`,
      });
    }

    const installationToken = await getInstallationToken(installationId, githubPrivateKey, githubAppId);

    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: githubHeaders(installationToken),
    });
    if (!repoResponse.ok) {
      return json({ linked: false, reason: 'App not installed on this repository' });
    }
    const repoData = await repoResponse.json();

    const access =
      (typeof code === 'string' && code ? await checkAccessWithCode(code, owner, repoName) : null) ??
      (await checkAccessWithIdentity(user.identities, installationToken, owner, repoName));

    if (!access.ok) {
      // 200 with linked:false, like the not-installed case, so the dashboard
      // shows the reason rather than a generic request failure.
      return json({ linked: false, code: access.code, reason: access.reason });
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        // GitHub's canonical URL, which is what github-webhook matches on.
        github_repo_url: repoData.html_url,
        github_installation_id: installationId,
        github_repo_id: repoData.id,
      })
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return json({ linked: true, installationId, repoId: repoData.id });
  } catch (error) {
    console.error('connect-github-repo error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
