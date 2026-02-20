# GitHub App Integration

RankCLI uses a GitHub App to enable automated SEO fix PRs, webhook-triggered audits, and repository-aware code generation.

## Overview

The GitHub App enables:

- **Auto-Fix PRs**: AI-generated pull requests with framework-aware SEO fixes
- **Push-triggered audits**: Automatically run audits when SEO-relevant files change
- **Deployment-triggered audits**: Run audits after successful deployments (Vercel, Netlify, etc.)
- **PR state tracking**: Track when fix PRs are merged and mark issues as resolved
- **Issue commands**: Trigger audits via `/rankcli audit` comments

## Architecture

```
┌─────────────────┐      Webhook Events       ┌──────────────────────┐
│   GitHub App    │ ─────────────────────────▶│   github-webhook     │
│   (installed)   │                           │   (Supabase Edge Fn) │
└─────────────────┘                           └──────────┬───────────┘
                                                         │
                    ┌────────────────────────────────────┼────────────────────────────────┐
                    │                                    │                                │
                    ▼                                    ▼                                ▼
           ┌──────────────┐                    ┌──────────────┐                 ┌──────────────┐
           │  run-audit   │                    │ create-seo-pr│                 │ DB Updates   │
           │  (trigger)   │                    │ (AI fixes)   │                 │ (tracking)   │
           └──────────────┘                    └──────────────┘                 └──────────────┘
```

## Creating the GitHub App

### Step 1: Register the App

1. Go to **GitHub Developer Settings** → **GitHub Apps** → **New GitHub App**
   - Or: `https://github.com/settings/apps/new`

2. Fill in the app details:

   | Field | Dev Value | Prod Value |
   |-------|-----------|------------|
   | **App name** | `rankcli-dev` | `rankcli` |
   | **Homepage URL** | `http://localhost:3000` | `https://rankcli.dev` |
   | **Webhook URL** | Use ngrok or smee.io | `https://<project>.supabase.co/functions/v1/github-webhook` |
   | **Webhook secret** | Generate with `openssl rand -hex 32` | Same (store securely) |

3. Set **Permissions**:

   **Repository permissions:**
   | Permission | Access | Purpose |
   |------------|--------|---------|
   | Contents | Read & Write | Read repo files, create fix commits |
   | Pull requests | Read & Write | Create and update PRs |
   | Issues | Read & Write | Create issues, respond to commands |
   | Metadata | Read-only | Get repo info |
   | Workflows | Read-only | Detect deployment completions |

   **Account permissions:**
   | Permission | Access | Purpose |
   |------------|--------|---------|
   | Email addresses | Read-only | Link installation to user |

4. **Subscribe to events:**
   - `push`
   - `pull_request`
   - `workflow_run`
   - `create`
   - `issues`
   - `issue_comment`

   > **Note:** The `installation` event is automatically sent to all GitHub Apps when they are installed/uninstalled — you don't need to subscribe to it.

5. **Where can this GitHub App be installed?**
   - Select "Any account" for production
   - Select "Only on this account" for development

6. Click **Create GitHub App**

### Step 2: Generate Private Key

1. After creating the app, scroll to **Private keys**
2. Click **Generate a private key**
3. A `.pem` file will download
4. Base64-encode it for storage:
   ```bash
   # macOS
   base64 -i rankcli.pem -o rankcli-key.b64
   
   # Linux
   base64 -w 0 rankcli.pem > rankcli-key.b64
   ```

### Step 3: Note the App ID

- Find the **App ID** at the top of the app settings page (e.g., `123456`)

## Configuration

### Environment Variables

Add these to your Supabase Edge Function secrets:

```bash
# Required for GitHub App authentication
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=<base64-encoded-pem-key>
GITHUB_WEBHOOK_SECRET=<your-webhook-secret>

# Required for AI-powered fix generation
OPENAI_API_KEY=sk-...
```

Set secrets via Supabase CLI:

```bash
# Set individual secrets
supabase secrets set GITHUB_APP_ID=123456
supabase secrets set GITHUB_PRIVATE_KEY="$(cat rankcli-key.b64)"
supabase secrets set GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Or set from .env file
supabase secrets set --env-file .env.production
```

### Frontend Configuration

Add to your `.env` (SaaS package):

```bash
# GitHub App installation URL
# Dev: https://github.com/apps/rankcli-dev
# Prod: https://github.com/apps/rankcli
VITE_GITHUB_APP_URL=https://github.com/apps/rankcli
```

## Database Schema

The integration uses these tables:

```sql
-- GitHub App installations
CREATE TABLE github_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  installation_id BIGINT UNIQUE NOT NULL,
  account_login TEXT NOT NULL,
  account_type TEXT NOT NULL, -- 'User' or 'Organization'
  permissions JSONB,
  status TEXT DEFAULT 'active', -- 'active', 'suspended', 'deleted', 'pending'
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track created PRs
CREATE TABLE github_prs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  audit_id UUID REFERENCES audits(id),
  pr_number INTEGER NOT NULL,
  pr_url TEXT NOT NULL,
  pr_title TEXT,
  pr_state TEXT DEFAULT 'open', -- 'open', 'closed', 'merged'
  branch_name TEXT,
  files_changed INTEGER,
  issue_ids UUID[], -- Links to audit_issues that this PR fixes
  merged_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table additions
ALTER TABLE projects ADD COLUMN github_repo_url TEXT;
ALTER TABLE projects ADD COLUMN github_repo_id BIGINT;
ALTER TABLE projects ADD COLUMN github_installation_id BIGINT;
```

## Webhook Events

### `installation`

Handles app install/uninstall:
- `created`: Links installation to user, stores in `github_installations`
- `deleted`: Marks installation as deleted, removes from projects
- `suspend/unsuspend`: Updates installation status

### `push`

Triggers audits on relevant file changes:
- Only triggers on default branch
- Filters for SEO-relevant files: `.html`, `.tsx`, `robots.txt`, `sitemap.xml`, etc.
- Creates audit record and calls `run-audit` function
- After audit, triggers `create-seo-pr` if issues found

### `pull_request`

Tracks PR lifecycle:
- Updates PR state (open/closed/merged)
- When merged, marks linked issues as `fixed`

### `workflow_run`

Triggers audits after deployments:
- Only acts on `completed` + `success` runs
- Detects deployment workflows by name (deploy, release, vercel, netlify, etc.)
- Only triggers on default branch

### `issue_comment`

Responds to commands:
- `/rankcli audit` - Triggers an audit
- `/rankcli fix` - (planned) Triggers fix PR generation
- `/rankcli report` - (planned) Posts audit summary

## User Flow

### Connecting a Repository

1. User clicks "Connect GitHub" in project settings
2. `ConnectGitHubModal` opens, user enters repo URL
3. User clicks "Install & Connect" → redirects to GitHub App install page
4. User authorizes the app for their repo
5. GitHub sends `installation` webhook → stored in `github_installations`
6. User is redirected back, connection completes

### Automated Fix Flow

1. Code pushed to default branch
2. `push` webhook received
3. Relevant files checked (HTML, meta files, etc.)
4. Audit triggered via `run-audit` function
5. If issues found, `create-seo-pr` called:
   - Fetches repo context (package.json, index.html, file tree)
   - Detects framework (React, Next.js, Astro, etc.)
   - Generates AI-powered fixes via OpenAI
   - Creates branch, commits files, opens PR
6. PR tracked in `github_prs` table
7. When user merges PR, issues marked as `fixed`

## Local Development

### Using smee.io for Webhooks

1. Create a channel: https://smee.io/new
2. Install smee client:
   ```bash
   npm install -g smee-client
   ```
3. Forward webhooks to local Supabase:
   ```bash
   smee -u https://smee.io/YOUR_CHANNEL -t http://localhost:54321/functions/v1/github-webhook
   ```
4. Set the smee URL as your GitHub App webhook URL

### Testing Webhook Handlers

```bash
# Start Supabase locally
supabase start

# Serve edge functions
supabase functions serve github-webhook --env-file .env.local

# Trigger test events
curl -X POST http://localhost:54321/functions/v1/github-webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref": "refs/heads/main", "repository": {"id": 123, "full_name": "test/repo"}}'
```

### Testing PR Creation

```bash
# Test the create-seo-pr function
curl -X POST http://localhost:54321/functions/v1/create-seo-pr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -d '{"projectId": "your-project-uuid"}'
```

## Troubleshooting

### Common Issues

**"GitHub App not installed on this repository"**
- User needs to install the app on the specific repo
- Check `github_installations` table for the installation record
- Verify `github_installation_id` is set on the project

**"Invalid webhook signature"**
- Ensure `GITHUB_WEBHOOK_SECRET` matches what's configured in GitHub
- Check the secret is set correctly in Supabase secrets

**"Failed to get installation token"**
- Verify `GITHUB_APP_ID` is correct
- Check `GITHUB_PRIVATE_KEY` is properly base64-encoded
- Ensure the private key hasn't expired (regenerate if needed)

**PR creation fails silently**
- Check Supabase Edge Function logs: `supabase functions logs create-seo-pr`
- Verify OpenAI API key is valid
- Check the repo has the expected file structure

### Viewing Logs

```bash
# View webhook handler logs
supabase functions logs github-webhook --follow

# View PR creation logs
supabase functions logs create-seo-pr --follow
```

## Security Considerations

1. **Webhook signature verification**: Always verify `x-hub-signature-256` header
2. **Private key storage**: Never commit the private key; use secrets management
3. **Minimal permissions**: Only request permissions actually needed
4. **Installation scoping**: Consider limiting to specific repos in production
5. **Rate limiting**: GitHub Apps have higher rate limits but monitor usage

## References

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Creating a GitHub App](https://docs.github.com/en/apps/creating-github-apps)
- [Authenticating as a GitHub App](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)
- [Webhook Events](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
