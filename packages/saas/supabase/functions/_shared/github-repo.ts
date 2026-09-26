// Writing to a GitHub repository through an App installation token: branch, file, PR.
//
// create-seo-pr (AI-generated fixes) and create-ci-pr (the CI workflow template) both open
// PRs, and both used to need these four calls. Keeping one copy means a fix to how we
// commit - encoding, conflict handling, error text - lands in both.

// Fetch file content from GitHub
export async function fetchFileContent(token: string, owner: string, repo: string, path: string): Promise<string | null> {
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

export async function getDefaultBranchSha(token: string, owner: string, repo: string): Promise<{ sha: string; branch: string }> {
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
export async function createBranch(token: string, owner: string, repo: string, branchName: string, baseSha: string): Promise<void> {
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
export async function createOrUpdateFile(
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
export async function createPullRequest(
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
