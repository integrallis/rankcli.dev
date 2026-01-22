# GitHub App Setup Guide

This guide explains how to create a GitHub App for RankCLI development and testing.

## Prerequisites

- GitHub account
- RankCLI development environment set up

## Quick Reference Checklist

Before you start, generate your webhook secret:
```bash
openssl rand -hex 32
```
Save this value - you'll need it twice.

| Section | Key Settings |
|---------|-------------|
| **Basic Info** | Name: `rankcli-dev`, Homepage: `http://localhost:3005` |
| **Callback URL** | `http://localhost:3005/auth/callback/github` |
| **Setup URL** | `http://localhost:3005/dashboard/github-callback` |
| **Webhook URL** | `https://plfhfykcoytxkjxnjnez.supabase.co/functions/v1/github-webhook` |
| **Webhook Secret** | Your generated secret (same value goes to Supabase) |
| **SSL Verification** | ✓ Enabled |
| **Repo Permissions** | Contents (RW), Issues (RW), Metadata (R), PRs (RW), Webhooks (RW), Actions (RW) |
| **Org Permissions** | None |
| **Account Permissions** | Email addresses (R) |
| **Events** | Push, Pull request, Workflow run, Create, Issues, Issue comment |
| **Install Location** | Only on this account (for dev) |

---

## Step 1: Create a GitHub App

Go to: https://github.com/settings/apps/new

---

### Basic Information

| Field | Value |
|-------|-------|
| **GitHub App name** | `rankcli-dev` (or `rankcli-dev-{your-username}` to avoid conflicts) |
| **Description** | `RankCLI SEO Automation - Development` |
| **Homepage URL** | `http://localhost:3005` |

---

### Identifying and authorizing users

| Field | Value |
|-------|-------|
| **Callback URL** | `http://localhost:3005/auth/callback/github` |
| **Expire user authorization tokens** | ✓ Checked (recommended) |
| **Request user authorization (OAuth) during installation** | ✓ Checked |
| **Enable Device Flow** | ☐ Unchecked |

---

### Post installation

| Field | Value |
|-------|-------|
| **Setup URL (optional)** | `http://localhost:3005/dashboard/github-callback` |
| **Redirect on update** | ✓ Checked |

> **Important:** The Setup URL must point to `/dashboard/github-callback` (not just `/dashboard`) to properly handle the post-installation flow.

---

### Webhook

| Field | Value |
|-------|-------|
| **Active** | ✓ Checked |
| **Webhook URL** | `https://plfhfykcoytxkjxnjnez.supabase.co/functions/v1/github-webhook` |
| **Webhook secret** | Generate with: `openssl rand -hex 32` (see note below) |

> **About the Webhook Secret:** This is a random string YOU generate. You'll enter the same value here AND in Supabase secrets. GitHub uses it to sign webhook payloads so your server can verify requests are authentic.

---

### SSL verification

| Option | Selection |
|--------|-----------|
| **Enable SSL verification** | ✓ Selected (default, recommended) |
| **Disable** | ☐ Not selected |

> Keep SSL verification **enabled**. Only disable for local testing with self-signed certificates.

---

### Permissions

#### Repository permissions

| Permission | Access | Why needed |
|------------|--------|------------|
| **Actions** | Read and write | Create CI workflow files, trigger audits on deploy |
| **Contents** | Read and write | Read code, create branches, commit fixes |
| **Environments** | Read-only | (Optional) Read deployment URLs for preview audits |
| **Issues** | Read and write | Create issues for SEO problems |
| **Metadata** | Read-only | Required (automatically set) |
| **Pull requests** | Read and write | Create auto-fix PRs |
| **Webhooks** | Read and write | Manage repository webhooks |

All other repository permissions: **No access**

> **Note on Variables/Secrets:** RankCLI does NOT need access to repository variables or secrets. Configuration is stored in a `.rankcli.yml` file (using Contents permission) or in the RankCLI dashboard. API keys and sensitive data stay in your RankCLI account, not in the repo.

#### Organization permissions

| Permission | Access |
|------------|--------|
| All | **No access** |

> Organization permissions are not needed for RankCLI.

#### Account permissions

| Permission | Access | Why needed |
|------------|--------|------------|
| **Email addresses** | Read-only | Identify user for linking installations |

All other account permissions: **No access**

---

### Subscribe to events

Based on the permissions selected, you'll see many available events. Here's exactly what to check:

#### Required Events (check these)

| Event | Check | Why needed |
|-------|-------|------------|
| **Push** | ✓ | Trigger audits when code is pushed to default branch |
| **Pull request** | ✓ | Track auto-fix PRs (merged/closed/synchronized) |

#### Recommended Events (check these for full functionality)

| Event | Check | Why needed |
|-------|-------|------------|
| **Workflow run** | ✓ | Trigger audit after CI/CD deployment completes |
| **Create** | ✓ | Detect new branches (for PR previews) |
| **Issues** | ✓ | Track SEO issues created by RankCLI |
| **Issue comment** | ✓ | Respond to commands like `/rankcli audit` in issues |
| **Pull request review** | ✓ | (Optional) Track review status on auto-fix PRs |

#### Do NOT Check (not needed)

| Event | Skip | Reason |
|-------|------|--------|
| **Installation target** | ☐ | Only fires when the GitHub App itself is renamed |
| **Meta** | ☐ | Only fires when this App is deleted |
| **Security advisory** | ☐ | For CVE/security vulnerability notifications |
| **Commit comment** | ☐ | Not used by RankCLI |
| **Delete** | ☐ | Branch/tag deletion not relevant |
| **Fork** | ☐ | Fork events not tracked |
| **Gollum** | ☐ | Wiki updates not relevant |
| **Label** | ☐ | Label management not needed |
| **Milestone** | ☐ | Milestone tracking not used |
| **Merge queue entry** | ☐ | Merge queue not used |
| **Public** | ☐ | Repo visibility changes not tracked |
| **Pull request review comment** | ☐ | PR diff comments not processed |
| **Pull request review thread** | ☐ | Review threads not processed |
| **Release** | ☐ | Release events not used (use Workflow run instead) |
| **Repository** | ☐ | Repo settings changes not tracked |
| **Repository dispatch** | ☐ | Custom dispatch not used |
| **Star** | ☐ | Not relevant |
| **Watch** | ☐ | Not relevant |
| **Workflow dispatch** | ☐ | Manual workflow triggers not needed |
| **Workflow job** | ☐ | Individual job status not needed (Workflow run is enough) |
| **Sub issues** | ☐ | Sub-issue tracking not used |

#### Summary Checklist

```
✓ Push
✓ Pull request
✓ Workflow run
✓ Create
✓ Issues
✓ Issue comment
✓ Pull request review (optional)

☐ Everything else - leave unchecked
```

> **Tip:** You can always add more events later from the GitHub App settings page.

---

### Where can this GitHub App be installed?

| Option | Selection | Use case |
|--------|-----------|----------|
| **Only on this account** | ✓ Selected | Development/testing |
| **Any account** | ☐ Not selected | Production only |

> For development, select **"Only on this account"**. This restricts installation to your GitHub account only, which is safer for testing.
>
> For production, you would select **"Any account"** so users can install it on their own accounts.

---

### Create the App

Click **Create GitHub App**

## Step 2: Generate Private Key

After creating the app:

1. Scroll down to **Private keys** section
2. Click **Generate a private key**
3. A `.pem` file will be downloaded
4. Save this file securely (e.g., `rankcli-dev.private-key.pem`)

## Step 3: Get App Credentials

From your GitHub App settings page, collect these values:

| Credential | Where to find it | Example |
|------------|------------------|---------|
| **App ID** | Top of the settings page, labeled "App ID" | `123456` |
| **Client ID** | In the "About" section | `Iv1.abc123xyz` |
| **Client Secret** | Click "Generate a new client secret" button | `abc123...` (40+ chars) |

> **Important:** The Client Secret is only shown once when generated. Copy it immediately!

## Step 4: Configure Environment Variables

You need two secrets - one from GitHub, one you generate yourself:

### Generate your webhook secret (you create this):
```bash
openssl rand -hex 32
```
This outputs something like: `a1b2c3d4e5f6...` (64 characters)

**Use this same value in TWO places:**
1. GitHub App settings → Webhook → Webhook secret field
2. Your `.env` file → `GITHUB_WEBHOOK_SECRET`

### Add to your `.env` file:

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456                           # From GitHub App settings page
GITHUB_APP_NAME=rankcli-dev                    # The name you chose
GITHUB_CLIENT_ID=Iv1.abc123xyz                 # From GitHub App "About" section
GITHUB_CLIENT_SECRET=abc123...                 # Generated by GitHub (Step 3)
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6...          # Generated by YOU (openssl rand -hex 32)

# Base64 encode the private key (from the .pem file downloaded in Step 2)
GITHUB_PRIVATE_KEY=$(cat rankcli-dev.private-key.pem | base64 -w 0)

# Frontend variable for Connect GitHub button
VITE_GITHUB_APP_URL=https://github.com/apps/rankcli-dev
```

### Summary of where each value comes from:

| Variable | Source |
|----------|--------|
| `GITHUB_APP_ID` | GitHub shows this on app settings page |
| `GITHUB_APP_NAME` | The name you chose when creating the app |
| `GITHUB_CLIENT_ID` | GitHub shows this in "About" section |
| `GITHUB_CLIENT_SECRET` | GitHub generates when you click "Generate a new client secret" |
| `GITHUB_WEBHOOK_SECRET` | **You generate** with `openssl rand -hex 32` |
| `GITHUB_PRIVATE_KEY` | Base64-encoded contents of the `.pem` file from Step 2 |

## Step 5: Set Supabase Secrets

Set the webhook secret in Supabase (the function is already deployed):

```bash
cd packages/saas

# Set the webhook secret (required for signature verification)
npx supabase secrets set GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Optional: Set these if you need to make API calls to GitHub
npx supabase secrets set GITHUB_APP_ID=123456
npx supabase secrets set GITHUB_PRIVATE_KEY="$(cat rankcli-dev.private-key.pem | base64 -w 0)"
```

> **Note:** The `github-webhook` function is already deployed. You only need to set the secrets.

## Step 6: Install the App on a Test Repository

1. Go to your GitHub App page: `https://github.com/apps/rankcli-dev`
2. Click **Install**
3. Choose a repository to test with (or select "All repositories")
4. Authorize the installation

## Testing the Integration

### Test 1: Verify Webhook Connection

1. Make a small change to your test repository
2. Push the change
3. Check GitHub App settings → Advanced → Recent Deliveries
4. Check Supabase logs: `npx supabase functions logs github-webhook`

### Test 2: Connect Repository in Dashboard

1. Go to `http://localhost:3005/dashboard`
2. Open a project
3. Click "Connect GitHub"
4. Enter your test repository URL
5. Verify the connection is saved

### Test 3: Trigger Audit on Push

1. Make a change to an HTML/React file in your connected repo
2. Push the change
3. Check if an audit is triggered in the dashboard

## Troubleshooting

### Webhook Not Receiving Events

1. Verify the webhook URL is correct: `https://plfhfykcoytxkjxnjnez.supabase.co/functions/v1/github-webhook`
2. Check GitHub App settings → Advanced → Recent Deliveries
3. Look for any error messages in the delivery details
4. Check Supabase function logs: `npx supabase functions logs github-webhook`

### Signature Verification Failed

1. Ensure `GITHUB_WEBHOOK_SECRET` matches the secret in GitHub App settings
2. Check that the secret is set correctly in Supabase:
   ```bash
   npx supabase secrets list
   ```

### Installation Not Linked to User

The webhook stores installations. To link to a user:
1. User must have `github_username` in their profile
2. Or manually connect via the dashboard

### Cannot Push to Repository

1. Verify the app has "Contents: Read and write" permission
2. Reinstall the app on the repository
3. Check the installation ID is saved in the project

## Production Setup

For production, create a separate GitHub App:

1. Use your production domain URLs
2. Generate new secrets
3. Install on the organization account
4. Set "Where can this be installed?" to "Any account"

Update the production environment:
```bash
VITE_GITHUB_APP_URL=https://github.com/apps/rankcli
```

## Security Notes

- Never commit private keys or secrets to git
- Rotate secrets periodically
- Use separate apps for development and production
- Enable webhook secret verification in production
- Review and limit permissions to minimum required
