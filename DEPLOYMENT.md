# RankCLI Deployment Guide

**Ship code, get ranked. SEO meets CI/CD.**

Website: https://rankcli.dev

This guide covers everything needed to deploy RankCLI for both development and production environments.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Manual Prerequisites](#manual-prerequisites)
4. [Automated Deployment](#automated-deployment)
5. [Development Setup](#development-setup)
6. [CLI Package Build](#cli-package-build)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### First-Time Production Setup (New SaaS Instance)

```bash
# 1. Set up all GitHub secrets (see Prerequisites section)
gh secret set CLOUDFLARE_API_TOKEN --body "your-token"
# ... (all secrets listed below)

# 2. Run initial setup workflow
gh workflow run initial-setup-saas.yml -f confirm=SETUP

# 3. Set up custom domain (after initial setup completes)
gh workflow run setup-custom-domain.yml \
  -f domain=yourdomain.com \
  -f pages_project=rankcli \
  -f confirm=SETUP
```

### Subsequent Deployments

```bash
# Automatic: push to main or create a release
git push origin main

# Or manual trigger
gh workflow run deploy.yml
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           RankCLI                               │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)     │  Cloudflare Pages               │
│  Custom Domain               │  Cloudflare DNS + SSL           │
├──────────────────────────────┼──────────────────────────────────┤
│  Backend (Supabase)          │  Auth, Database, Edge Functions  │
├──────────────────────────────┼──────────────────────────────────┤
│  Audit Worker (Fly.io)       │  Deep audits for paid users     │
├──────────────────────────────┼──────────────────────────────────┤
│  Payments (Stripe)           │  Subscriptions + LTD             │
├──────────────────────────────┼──────────────────────────────────┤
│  CLI (rankcli npm)           │  WASM-protected audit engine     │
└─────────────────────────────────────────────────────────────────┘
```

### Services Used

| Service | Purpose | Managed By |
|---------|---------|------------|
| **Cloudflare Pages** | Frontend hosting | Automated |
| **Cloudflare DNS** | Domain + SSL | Automated |
| **Supabase** | Auth, DB, Edge Functions | Automated |
| **Fly.io** | Audit worker (long-running jobs) | Automated |
| **Stripe** | Payments | Automated |
| **DNSimple** | Domain registration | Automated |
| **npm** | CLI package distribution | Automated |

---

## Manual Prerequisites

These are **one-time setup steps** that must be done manually before running automated workflows.

### 1. Create Accounts (One-Time)

| Service | Sign Up | What You Need |
|---------|---------|---------------|
| **Supabase** | [supabase.com](https://supabase.com) | Project + API keys |
| **Stripe** | [stripe.com](https://stripe.com) | Account + API keys |
| **Cloudflare** | [cloudflare.com](https://cloudflare.com) | Account + API token |
| **Fly.io** | [fly.io](https://fly.io) | Account + API token |
| **DNSimple** | [dnsimple.com](https://dnsimple.com) | Account + API token |
| **OpenAI** | [openai.com](https://openai.com) | API key |

### 2. Supabase Project Setup

#### Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Note down:
   - **Project URL**: `https://<project-ref>.supabase.co`
   - **Project Ref**: The `<project-ref>` part
   - **anon key**: Settings → API → `anon` `public` key
   - **service_role key**: Settings → API → `service_role` key
   - **JWT Secret**: Settings → API → JWT Secret
   - **Database Password**: Settings → Database → Connection string password

#### Generate Access Token
1. Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Generate a new access token
3. Save as `SUPABASE_ACCESS_TOKEN`

#### Enable OAuth Providers (Optional)

<details>
<summary>Google OAuth Setup</summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth credentials
3. Add redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
4. In Supabase: Authentication → Providers → Google → Enable + add credentials
</details>

<details>
<summary>GitHub OAuth Setup</summary>

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Set callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`
4. In Supabase: Authentication → Providers → GitHub → Enable + add credentials
</details>

### 3. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys: Developers → API keys
   - **Publishable Key**: `pk_test_...` or `pk_live_...`
   - **Secret Key**: `sk_test_...` or `sk_live_...`

> **Note:** Webhook endpoint is created automatically by the setup workflow.

### 4. Cloudflare API Token

1. Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token** → **Custom Token**
3. Configure permissions:

| Permission | Access |
|------------|--------|
| Zone → Zone | Edit |
| Zone → DNS | Edit |
| Zone → Zone Settings | Edit |
| Account → Cloudflare Pages | Edit |

4. Zone Resources: **All zones** (or specific zones)
5. Create and save the token

**Account ID:** Found in dashboard URL: `dash.cloudflare.com/<ACCOUNT_ID>/...`

### 5. Fly.io Setup

```bash
# Install CLI
curl -L https://fly.io/install.sh | sh

# Login and get token
fly auth login
fly tokens create deploy -x 999999h
```

Save the token as `FLY_API_TOKEN`.

### 6. DNSimple Setup (For Custom Domains)

1. Go to [dnsimple.com](https://dnsimple.com) → User Settings → API tokens
2. Generate a new token
3. Note your **Account ID** from the URL: `/a/<ACCOUNT_ID>/...`

### 7. Generate Secrets

```bash
# Audit worker secret (for secure communication)
openssl rand -hex 32
# Save as AUDIT_WORKER_SECRET

# CLI build key (for WASM encryption)
openssl rand -base64 32
# Save as RANKCLI_BUILD_KEY
```

---

## GitHub Repository Configuration

### Required Secrets

Go to: **Settings → Secrets and variables → Actions → Secrets**

```bash
# Set all secrets via CLI:
cd /path/to/rankcli.dev

# Cloudflare
gh secret set CLOUDFLARE_API_TOKEN --body "your-token"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "your-account-id"

# Supabase
gh secret set SUPABASE_ACCESS_TOKEN --body "your-token"
gh secret set SUPABASE_ANON_KEY --body "your-anon-key"
gh secret set SUPABASE_SERVICE_KEY --body "your-service-key"
gh secret set SUPABASE_DB_PASSWORD --body "your-db-password"
gh secret set SUPABASE_JWT_SECRET --body "your-jwt-secret"

# Stripe
gh secret set STRIPE_SECRET_KEY --body "sk_test_..."
gh secret set STRIPE_WEBHOOK_SECRET --body "whsec_..."  # Created by setup workflow

# Fly.io
gh secret set FLY_API_TOKEN --body "your-token"

# DNSimple (for custom domains)
gh secret set DNSIMPLE_TOKEN --body "your-token"

# OpenAI
gh secret set OPENAI_API_KEY --body "sk-proj-..."

# Generated secrets
gh secret set AUDIT_WORKER_SECRET --body "$(openssl rand -hex 32)"
gh secret set RANKCLI_BUILD_KEY --body "$(openssl rand -base64 32)"

# Optional: Search APIs for keyword research
gh secret set BRAVE_API_KEY --body "your-key"
gh secret set SERPER_API_KEY --body "your-key"

# npm (for CLI publishing)
gh secret set NPM_TOKEN --body "your-npm-token"
```

### Required Variables

Go to: **Settings → Secrets and variables → Actions → Variables**

```bash
gh variable set SUPABASE_PROJECT_REF --body "your-project-ref"
gh variable set DNSIMPLE_ACCOUNT_ID --body "248"  # Your DNSimple account ID
```

---

## Automated Deployment

All deployment is handled by GitHub Actions workflows.

### Available Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `initial-setup-saas.yml` | Manual | First-time infrastructure setup |
| `setup-custom-domain.yml` | Manual | Add custom domain to Cloudflare |
| `deploy.yml` | Push/Release/Manual | Deploy changes |
| `build-cli.yml` | Release/Manual | Build and publish CLI |

### Initial Setup (First Time Only)

Run this **once** for a new SaaS instance:

```bash
gh workflow run initial-setup-saas.yml -f confirm=SETUP
```

**What it does (fully automated):**

| Step | Service | Action |
|------|---------|--------|
| 1 | DNSimple | Creates CNAME record for domain |
| 2 | Fly.io | Creates `rankcli-audit-worker` app |
| 3 | Supabase | Runs database migrations |
| 4 | Stripe | Creates products, prices, webhook |
| 5 | Supabase | Deploys edge functions |
| 6 | Cloudflare | Creates Pages project, deploys frontend |

### Custom Domain Setup

After initial setup, add your custom domain:

```bash
gh workflow run setup-custom-domain.yml \
  -f domain=rankcli.dev \
  -f pages_project=rankcli \
  -f confirm=SETUP
```

**What it does (fully automated):**

| Step | Service | Action |
|------|---------|--------|
| 1 | Cloudflare | Adds zone for domain |
| 2 | Cloudflare | Creates DNS records (CNAME → Pages) |
| 3 | Cloudflare | Configures SSL (Full mode) |
| 4 | Cloudflare | Adds custom domain to Pages project |
| 5 | DNSimple | Updates nameservers to Cloudflare |

### Regular Deployments

Triggered automatically on:
- Push to `main` branch
- Release creation
- Manual trigger

```bash
# Manual trigger
gh workflow run deploy.yml

# Check status
gh run list --workflow=deploy.yml --limit 5
```

**What it deploys:**

| Component | Destination | Condition |
|-----------|-------------|-----------|
| Frontend | Cloudflare Pages | Always |
| Migrations | Supabase DB | If changed |
| Edge Functions | Supabase | If changed |
| Audit Worker | Fly.io | If changed |
| Stripe Pricing | Stripe | If changed |

### CLI Publishing

```bash
# Automatic: create a release
gh release create v1.0.0 --title "Release 1.0.0"

# Manual trigger
gh workflow run build-cli.yml -f publish=true
```

---

## Local Scripts

For local development or debugging, scripts are available:

### Custom Domain Setup (Local)

```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export DNSIMPLE_TOKEN="your-token"
export DNSIMPLE_ACCOUNT_ID="248"

# Run script
./scripts/setup-cloudflare-domain.sh mydomain.com my-pages-project
```

---

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase CLI: `npm install -g supabase`

### Quick Start

```bash
# Clone and install
git clone https://github.com/integrallis/rankcli.dev.git
cd rankcli.dev
pnpm install

# Copy environment template
cp .env.example .env
# Edit .env with your dev credentials

# Start development server
cd packages/saas
pnpm dev
```

### Environment Variables

Create `.env` in the project root:

```bash
# Supabase (Development)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<jwt-secret>
SUPABASE_ACCESS_TOKEN=<access-token>

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Optional: Search APIs
BRAVE_API_KEY=...
SERPER_API_KEY=...
```

### Local Edge Functions

```bash
cd packages/saas

# Link to Supabase project
supabase link --project-ref <project-ref>

# Run migrations
supabase db push

# Deploy functions
supabase functions deploy
```

---

## CLI Package Build

For building the WASM-protected CLI package.

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install wasm-pack
cargo install wasm-pack
```

### Development Build

```bash
cd packages/cli

# Build with dev key
pnpm build:wasm:dev
pnpm build:js

# Test
pnpm test:wasm
```

### Production Build

```bash
export RANKCLI_BUILD_KEY=$(cat /path/to/production-key)
pnpm build
```

---

## Troubleshooting

### Workflow Failures

```bash
# View failed workflow logs
gh run view --log-failed

# Re-run failed jobs
gh run rerun <run-id> --failed
```

### Common Issues

<details>
<summary>wrangler-action fails with pnpm workspace error</summary>

**Error:** `ERR_PNPM_ADDING_TO_ROOT Running this command will add the dependency to the workspace root`

**Solution:** The workflows use `npm install -g wrangler` instead of the wrangler-action. This is already fixed in the current workflows.
</details>

<details>
<summary>Fly.io build fails with "not found" errors</summary>

**Error:** `failed to calculate checksum: "/packages/audit-worker": not found`

**Solution:** The Dockerfile expects repo root as build context. The workflow runs flyctl with `--config` and `--dockerfile` flags from repo root.
</details>

<details>
<summary>Custom domain SSL pending</summary>

**Issue:** Domain shows "pending" status in Cloudflare Pages

**Solution:** Wait 5-10 minutes for SSL certificate provisioning. Check status:
```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/rankcli/domains" \
  -H "Authorization: Bearer $TOKEN" | jq '.result[] | {name, status}'
```
</details>

<details>
<summary>DNS not propagating</summary>

**Issue:** Domain doesn't resolve after nameserver change

**Solution:** 
1. Verify nameservers updated at registrar
2. Check Cloudflare zone status (should be "active")
3. Wait up to 48 hours for global propagation (usually 5-30 min)
```bash
host -t NS yourdomain.com
```
</details>

---

## Checklist

### New SaaS Instance Checklist

**Manual Prerequisites:**
- [ ] Supabase project created
- [ ] Stripe account ready
- [ ] Cloudflare account ready
- [ ] Fly.io account ready
- [ ] DNSimple account ready (if using custom domain)
- [ ] OpenAI API key obtained
- [ ] Domain registered (if using custom domain)

**GitHub Configuration:**
- [ ] All secrets set (see Required Secrets section)
- [ ] All variables set (see Required Variables section)

**Automated Setup:**
- [ ] `initial-setup-saas.yml` workflow completed
- [ ] `setup-custom-domain.yml` workflow completed (optional)
- [ ] First `deploy.yml` run successful

**Verification:**
- [ ] Frontend accessible at Pages URL
- [ ] Custom domain working with SSL (if configured)
- [ ] Audit worker health check passing
- [ ] Stripe webhook receiving events
- [ ] User signup/login working

---

## Reference

### URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend (Pages) | `https://rankcli.pages.dev` |
| Frontend (Custom) | `https://rankcli.dev` |
| Audit Worker | `https://rankcli-audit-worker.fly.dev` |
| Supabase | `https://<project-ref>.supabase.co` |
| Stripe Dashboard | `https://dashboard.stripe.com` |

### Workflow Files

| File | Purpose |
|------|---------|
| `.github/workflows/initial-setup-saas.yml` | First-time infrastructure setup |
| `.github/workflows/setup-custom-domain.yml` | Custom domain automation |
| `.github/workflows/deploy.yml` | Regular deployments |
| `.github/workflows/build-cli.yml` | CLI package builds |
| `scripts/setup-cloudflare-domain.sh` | Local domain setup script |

### Key Lessons Learned

1. **pnpm workspaces + wrangler-action don't mix** — Use `npm install -g wrangler` instead
2. **Fly.io Dockerfile context** — Run flyctl from repo root with `--config` and `--dockerfile` flags
3. **GitHub Actions secrets in `if:`** — Can't use `secrets.*` in job-level `if:` conditions; move to step level
4. **Cloudflare zone must be "active"** — Nameserver change detected before custom domain works
5. **SSL provisioning takes time** — `www` subdomain often activates before root domain
