# RankCLI Deployment Guide

**Ship code, get ranked. SEO meets CI/CD.**

Website: https://rankcli.dev

This guide covers everything needed to deploy RankCLI for both development and production environments.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Manual Setup Steps](#manual-setup-steps)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         RankCLI                           │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)     │  Cloudflare Pages (Production)  │
│                              │  localhost:3000 (Development)    │
├──────────────────────────────┼──────────────────────────────────┤
│  Backend (Supabase)          │  Auth, Database, Edge Functions  │
├──────────────────────────────┼──────────────────────────────────┤
│  Payments (Stripe)           │  Subscriptions + Credit Bundles  │
├──────────────────────────────┼──────────────────────────────────┤
│  CLI / Agent Runtime         │  npm package (separate)          │
└─────────────────────────────────────────────────────────────────┘
```

### Services Used

| Service | Purpose | Dev | Prod |
|---------|---------|-----|------|
| Supabase | Auth, Database, Edge Functions | Dev project | Prod project |
| Stripe | Payments | Test mode | Live mode |
| Cloudflare Pages | Frontend hosting | N/A | Yes |
| GitHub Actions | CI/CD | Yes | Yes |

---

## Manual Setup Steps

These are one-time setup steps that **cannot be automated** and must be done manually.

### 1. Supabase Project Setup

#### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down:
   - **Project URL**: `https://<project-ref>.supabase.co`
   - **Project Ref**: The `<project-ref>` part (e.g., `plfhfykcoytxkjxnjnez`)
   - **anon key**: Settings → API → `anon` `public` key
   - **service_role key**: Settings → API → `service_role` key (keep secret!)
   - **JWT Secret**: Settings → API → JWT Secret
   - **Database Password**: Settings → Database → Connection string password

#### Enable OAuth Providers

##### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   - Dev: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Prod: `https://<your-project-ref>.supabase.co/auth/v1/callback`
7. Note the **Client ID** and **Client Secret**
8. In Supabase Dashboard:
   - Go to **Authentication → Providers → Google**
   - Enable Google provider
   - Enter Client ID and Client Secret

##### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Application name: `RankCLI` (or your name)
   - Homepage URL: `https://your-domain.com` (or `http://localhost:3000` for dev)
   - Authorization callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Note the **Client ID** and generate a **Client Secret**
5. In Supabase Dashboard:
   - Go to **Authentication → Providers → GitHub**
   - Enable GitHub provider
   - Enter Client ID and Client Secret

### 2. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. For development, enable **Test Mode** (toggle in top right)
3. Note down:
   - **Publishable Key**: Developers → API keys → Publishable key
   - **Secret Key**: Developers → API keys → Secret key

#### Create Webhook Endpoint
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Note the **Webhook Signing Secret** (starts with `whsec_`)

### 3. GitHub Repository Setup (Production Only)

#### Repository Secrets
Go to **Settings → Secrets and variables → Actions → Secrets**

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token ([generate here](https://supabase.com/dashboard/account/tokens)) |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key |
| `SUPABASE_DB_PASSWORD` | Database password |
| `SUPABASE_JWT_SECRET` | JWT secret from API settings |
| `STRIPE_SECRET_KEY` | Stripe secret key (use test key for staging) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

#### Repository Variables
Go to **Settings → Secrets and variables → Actions → Variables**

| Variable | Description |
|----------|-------------|
| `SUPABASE_PROJECT_REF` | Supabase project reference ID |

---

## Development Deployment

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Supabase CLI (`npm install -g supabase`)

### Step 1: Configure Environment

Create/update `.env` in the project root:

```bash
# Supabase (Development)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-role-key>
SUPABASE_JWT_SECRET=<your-jwt-secret>
SUPABASE_ACCESS_TOKEN=<your-access-token>

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-proj-...
```

### Step 2: Link Supabase Project

```bash
cd packages/saas

# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>
```

### Step 3: Run Database Migrations

```bash
# Push all migrations to Supabase
supabase db push
```

### Step 4: Deploy Edge Functions

```bash
# Set Edge Function secrets
supabase secrets set \
  STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"

# Deploy all functions
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy run-audit --no-verify-jwt
```

### Step 5: Start Development Server

```bash
# Option A: Docker Compose (recommended)
cd packages/saas
docker compose up

# Option B: Direct npm
cd packages/saas
pnpm install
pnpm dev
```

### Ports

| Port | Service |
|------|---------|
| 3000 | Frontend (Vite dev server) |
| 54321 | Supabase Studio (if running locally) |

### Quick Dev Deploy Script

Run from project root:

```bash
./scripts/dev-deploy.sh
```

This script:
1. Checks for required environment variables
2. Links Supabase project
3. Runs migrations
4. Deploys Edge Functions
5. Starts the dev server

---

## Production Deployment

Production deployments are fully automated via GitHub Actions.

### Trigger Deployment

```bash
# Option 1: Create a release (triggers automatically)
gh release create v1.0.0 --title "Release 1.0.0"

# Option 2: Manual trigger
gh workflow run deploy.yml

# With specific options
gh workflow run deploy.yml \
  -f deploy_frontend=true \
  -f run_migrations=true \
  -f sync_stripe_pricing=false
```

### What Gets Deployed

| Component | Destination |
|-----------|-------------|
| Frontend | Cloudflare Pages |
| Database Migrations | Supabase |
| Edge Functions | Supabase |
| Stripe Pricing | Stripe Products/Prices |

### Verify Deployment

```bash
# Check workflow status
gh run list --workflow=deploy.yml

# View logs
gh run view --log

# Health check
curl https://your-domain.com
```

---

## Environment Variables Reference

### Frontend (VITE_* prefix)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |

### Backend / Edge Functions

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Optional |

### CLI / Development

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token | For CLI |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification | For CLI |

---

## Troubleshooting

### OAuth Not Working

1. **Check redirect URLs** - Must match exactly in provider settings
2. **Check Supabase provider settings** - Ensure enabled with correct credentials
3. **Clear cookies** - Sometimes stale sessions cause issues

### Stripe Webhooks Not Received

1. **Check endpoint URL** - Must be publicly accessible
2. **Check signing secret** - Must match in Edge Function secrets
3. **Check event selection** - Ensure required events are selected

### Migrations Failing

```bash
# Check migration status
supabase db diff

# Reset and rerun (DESTRUCTIVE - dev only!)
supabase db reset
```

### Edge Functions Not Working

```bash
# Check function logs
supabase functions logs create-checkout

# Test function locally
supabase functions serve
```

---

## Checklist

### Development Setup Checklist

- [ ] Supabase project created
- [ ] Google OAuth configured in Supabase
- [ ] GitHub OAuth configured in Supabase
- [ ] Stripe account in test mode
- [ ] Stripe webhook endpoint created (pointing to Supabase)
- [ ] `.env` file configured
- [ ] Supabase CLI linked to project
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Dev server running

### Production Setup Checklist

- [ ] Separate Supabase project for production
- [ ] Google OAuth configured for production URLs
- [ ] GitHub OAuth configured for production URLs
- [ ] Stripe account in live mode
- [ ] Stripe webhook endpoint for production
- [ ] GitHub repository secrets configured
- [ ] GitHub repository variables configured
- [ ] Cloudflare Pages project created
- [ ] Custom domain configured (optional)
- [ ] First deployment triggered
