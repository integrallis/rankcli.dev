# RankCLI Deployment Guide

**Ship code, get ranked. SEO meets CI/CD.**

Website: https://rankcli.dev

This guide covers everything needed to deploy RankCLI for both development and production environments.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Manual Setup Steps](#manual-setup-steps)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [CLI Package Build](#cli-package-build)
6. [Threat Intelligence Updates](#threat-intelligence-updates)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           RankCLI                               │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)     │  Cloudflare Pages (Production)  │
│                              │  localhost:3005 (Development)    │
├──────────────────────────────┼──────────────────────────────────┤
│  Backend (Supabase)          │  Auth, Database, Edge Functions  │
├──────────────────────────────┼──────────────────────────────────┤
│  Payments (Stripe)           │  Subscriptions + Credit Bundles  │
├──────────────────────────────┼──────────────────────────────────┤
│  CLI (rankcli npm)           │  WASM-protected audit engine     │
├──────────────────────────────┼──────────────────────────────────┤
│  Agent Runtime               │  200+ SEO checks (TypeScript)    │
└─────────────────────────────────────────────────────────────────┘

Deployment Modes:
- SaaS: Edge Functions → TypeScript checks (server-side, unprotected)
- CLI:  npm package → WASM binary (client-side, encrypted)
- Action: GitHub Action → npm package → WASM (encrypted)
```

### Services Used

| Service | Purpose | Dev | Prod |
|---------|---------|-----|------|
| Supabase | Auth, Database, Edge Functions | Dev project | Prod project |
| Stripe | Payments | Test mode | Live mode |
| Cloudflare Pages | Frontend hosting | N/A | Yes |
| GitHub Actions | CI/CD | Yes | Yes |
| npm | CLI package distribution | N/A | Yes |

### Build Toolchain

| Tool | Purpose | Version |
|------|---------|---------|
| Node.js | JavaScript runtime | 20+ |
| pnpm | Package manager | 8+ |
| Rust | WASM compilation | 1.70+ |
| wasm-pack | Rust → WASM builder | Latest |
| tsup | TypeScript bundler | 8+ |

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

**Required Secrets:**

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
| `FLY_API_TOKEN` | Fly.io API token for worker deployment |
| `AUDIT_WORKER_SECRET` | Shared secret for worker authentication |
| `OPENAI_API_KEY` | OpenAI API key for AI features |

**Optional Secrets (for AI Keyword Research):**

| Secret | Description |
|--------|-------------|
| `BRAVE_API_KEY` | Brave Search API key (2,000 free/month) - [Get here](https://brave.com/search/api/) |
| `SERPER_API_KEY` | Serper.dev API key (2,500 free/month) - [Get here](https://serper.dev/) |
| `GITHUB_TOKEN_SEARCH` | GitHub PAT for rate limits (no scopes needed) - [Generate here](https://github.com/settings/tokens) |

**Note:** Use `GITHUB_TOKEN_SEARCH` instead of `GITHUB_TOKEN` because the latter is reserved by GitHub Actions.

#### Repository Variables
Go to **Settings → Secrets and variables → Actions → Variables**

| Variable | Description |
|----------|-------------|
| `SUPABASE_PROJECT_REF` | Supabase project reference ID |

---

## Development Deployment

### Prerequisites

**Required:**
- Node.js 20+
- pnpm 8+
- Supabase CLI (`npm install -g supabase`)

**For CLI/WASM builds:**
- Rust 1.70+ (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- wasm-pack (`cargo install wasm-pack`)
- WASM target (`rustup target add wasm32-unknown-unknown`)

**Optional:**
- Docker & Docker Compose (for containerized development)

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

#### DevContainer / Docker-in-Docker Deployment

When deploying from a DevContainer, the standard `supabase functions deploy` command may fail with a Docker mount error:

```
The path /workspace/packages/saas/supabase/functions is not shared from the host
```

**Solution**: Use the `--use-api` flag to bypass Docker and upload directly via the Supabase API:

```bash
# Copy functions to /tmp (avoids mount issues)
mkdir -p /tmp/supabase-deploy/supabase/functions
cp -r packages/saas/supabase/functions/* /tmp/supabase-deploy/supabase/functions/

# Deploy using API (no Docker required)
cd /tmp/supabase-deploy
npx supabase functions deploy run-audit --no-verify-jwt --project-ref <project-ref> --use-api
```

This works for all functions and is the recommended approach in DevContainers.

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
| 3005 | Frontend (Vite dev server) |
| 8080 | Audit Worker (local dev) |
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
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes (for AI) |
| `AUDIT_WORKER_URL` | Fly.io worker URL | Yes (for paid) |
| `AUDIT_WORKER_SECRET` | Shared secret for worker auth | Yes (for paid) |
| `BRAVE_API_KEY` | Brave Search API key (2,000 free/month) | Optional |
| `SERPER_API_KEY` | Serper.dev API key (2,500 free/month) | Optional |
| `GITHUB_TOKEN` | GitHub PAT for rate limits (no scopes) | Optional |

### CLI / Development

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token | For CLI |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification | For CLI |

---

## Fly.io Audit Worker

For paid users, deep audits (up to 20 pages, 5-minute timeout) are handled by a Fly.io worker instead of Supabase Edge Functions (which have a 45-second limit).

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Audit Flow                                  │
├─────────────────────────────────────────────────────────────────┤
│  Free Users:                                                     │
│    Frontend → Edge Function (3 pages, 40s timeout)               │
│                                                                  │
│  Paid Users:                                                     │
│    Frontend → Edge Function → Fly.io Worker (20 pages, 5min)     │
│                              ↓                                   │
│                         Updates DB when done                     │
└─────────────────────────────────────────────────────────────────┘
```

### Initial Setup

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login and create app:
```bash
fly auth login
cd packages/audit-worker
fly apps create rankcli-audit-worker
```

3. Set secrets:
```bash
fly secrets set \
  SUPABASE_URL="https://your-project.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="your-service-key" \
  OPENAI_API_KEY="your-openai-key" \
  WORKER_SECRET="generate-a-strong-secret"
```

4. Deploy:
```bash
fly deploy
```

### Set Edge Function Secrets

After deploying the worker, configure the edge function to use it:

```bash
supabase secrets set \
  AUDIT_WORKER_URL="https://rankcli-audit-worker.fly.dev" \
  AUDIT_WORKER_SECRET="same-secret-as-above"
```

### Local Development

The audit worker runs automatically as part of the devcontainer:

```bash
# Option 1: Devcontainer (automatic)
# Worker runs at http://audit-worker:8080 inside the container

# Option 2: Run manually
cd packages/audit-worker
pnpm dev
# Worker runs at http://localhost:8080
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/jobs` | GET | List active jobs |
| `/jobs/:id` | GET | Get job status |
| `/audit` | POST | Submit audit job |

### Monitoring

```bash
# View logs
fly logs

# Check status
fly status

# Scale up for more capacity
fly scale count 2
```

---

## AI Keyword Research

The AI-powered keyword research feature uses OpenAI plus competitive search APIs to generate actionable keyword recommendations and free tool ideas. This feature includes an LLM-as-judge system that filters out vague or unbuildable suggestions.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  AI Keyword Research Flow                        │
├─────────────────────────────────────────────────────────────────┤
│  CLI (--ai flag):                                                │
│    rankcli keywords --url example.com --ai                       │
│                              ↓                                   │
│    1. Try cloud (Supabase edge function)                         │
│    2. Fallback to local (requires OPENAI_API_KEY)                │
│                                                                  │
│  SaaS UI:                                                        │
│    Dashboard → Project → Keywords → "AI Analysis"                │
│                              ↓                                   │
│    Edge Function → (paid tiers) → Fly.io Worker                  │
│                              ↓                                   │
│    Competitive Search (Brave/Serper/GitHub/npm)                  │
│                              ↓                                   │
│    LLM Judge (filters vague ideas)                               │
│                              ↓                                   │
│    Enhanced tool ideas with:                                     │
│    - Input/output formats                                        │
│    - Competitor analysis                                         │
│    - Implementation hints                                        │
│    - Feasibility scores                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Competitive Search APIs

The keyword research feature uses free-tier APIs for competitive intelligence:

| API | Free Tier | Purpose | Required |
|-----|-----------|---------|----------|
| Brave Search | 2,000/month | Find existing tools, competitors | Optional |
| Serper.dev | 2,500/month | Google search fallback | Optional |
| GitHub API | 60/hour (unauth) or 5,000/hour (auth) | Find open source alternatives | Optional |
| npm Registry | Unlimited | Find JavaScript libraries | Built-in |
| Hacker News | Unlimited | Find discussions, sentiment | Built-in |

**Note:** Without API keys, the system still works but with limited competitive data.

### Getting API Keys

#### Brave Search API
1. Go to [brave.com/search/api](https://brave.com/search/api/)
2. Sign up for the **Free** plan (2,000 queries/month)
3. Generate an API key
4. Set as `BRAVE_API_KEY`

#### Serper.dev API
1. Go to [serper.dev](https://serper.dev/)
2. Sign up for free (2,500 credits/month)
3. Copy your API key from the dashboard
4. Set as `SERPER_API_KEY`

#### GitHub Personal Access Token
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. **No scopes required** - just for rate limiting (60 → 5,000 requests/hour)
4. Generate and copy the token
5. Set as `GITHUB_TOKEN` (or `GITHUB_TOKEN_SEARCH` in GitHub Actions to avoid conflicts)

### Local Development

```bash
# Add to .env file
OPENAI_API_KEY=sk-proj-...
BRAVE_API_KEY=BSA...
SERPER_API_KEY=...
GITHUB_TOKEN=ghp_...

# Test keyword research
cd packages/cli
npx tsx src/index.ts keywords --url https://example.com --ai --local
```

### Production Deployment

#### Fly.io Worker
```bash
# Set secrets on Fly.io
fly secrets set \
  BRAVE_API_KEY="your-brave-key" \
  SERPER_API_KEY="your-serper-key" \
  GITHUB_TOKEN="your-github-token" \
  --app rankcli-audit-worker
```

#### Supabase Edge Functions
```bash
# Set secrets on Supabase
supabase secrets set \
  BRAVE_API_KEY="your-brave-key" \
  SERPER_API_KEY="your-serper-key" \
  GITHUB_TOKEN="your-github-token"
```

### GitHub Actions

The `deploy.yml` workflow automatically sets these secrets if configured:

| GitHub Secret | Target |
|---------------|--------|
| `BRAVE_API_KEY` | Fly.io + Supabase |
| `SERPER_API_KEY` | Fly.io + Supabase |
| `GITHUB_TOKEN_SEARCH` | Fly.io + Supabase (as `GITHUB_TOKEN`) |

**Note:** Use `GITHUB_TOKEN_SEARCH` instead of `GITHUB_TOKEN` in GitHub Actions because `GITHUB_TOKEN` is a reserved name for the automatic token.

### LLM Judge System

The AI keyword research includes an LLM-as-judge system that:

1. **Evaluates feasibility** (1-5): Can this tool actually be built?
2. **Evaluates specificity** (1-5): Are input/output formats defined?
3. **Evaluates product fit** (1-5): Does it connect to the main product?
4. **Evaluates market opportunity** (1-5): Is there demand without strong free alternatives?

Tools must score ≥3 on feasibility and specificity to pass. Failed ideas are logged with reasons for debugging.

### Troubleshooting

**"No tool ideas generated"**
- This is expected if all ideas fail the LLM judge's quality threshold
- Check logs for "Skipping X - failed feasibility check" messages
- The judge is intentionally strict to avoid vague suggestions

**"Competitive search failed"**
- Check API key validity and rate limits
- Brave: 2,000/month limit
- Serper: 2,500/month limit
- The system gracefully falls back to npm/GitHub if search APIs fail

**"Cloud unavailable, running locally"**
- The CLI auto-falls back to local processing if cloud is unreachable
- Ensure `OPENAI_API_KEY` is set for local processing

---

## CLI Package Build

The `rankcli` npm package includes WASM-protected SEO checks. This section covers building the CLI for development and production.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    rankcli npm package                          │
├─────────────────────────────────────────────────────────────────┤
│  TypeScript CLI        │  dist/index.js                         │
│  WASM Engine Wrapper   │  dist/wasm-engine.js                   │
│  Encrypted WASM Binary │  wasm/rankcli_audit_engine_bg.wasm     │
│  WASM Bindings         │  wasm/rankcli_audit_engine.js          │
└─────────────────────────────────────────────────────────────────┘
```

The SEO checks are:
1. Written in TypeScript (`packages/agent-runtime/src/audit/checks/`)
2. Bundled to self-contained IIFE
3. Encrypted with AES-256-GCM at Rust compile time
4. Embedded in WASM binary
5. Decrypted at runtime using license key
6. Executed in Node.js VM sandbox

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install wasm-pack
cargo install wasm-pack

# Verify
wasm-pack --version
```

### Development Build

**Quick setup script:**

```bash
# Run from project root - sets up everything for local testing
./scripts/setup-local-test.sh
```

**Manual steps:**

```bash
# 1. Build agent-runtime WASM bundle (JS checks → IIFE)
cd packages/agent-runtime
pnpm build:wasm

# 2. Build WASM binary with dev key
cd packages/cli
pnpm build:wasm:dev

# 3. Build TypeScript
pnpm build:js

# Or all at once (requires Rust/wasm-pack):
pnpm build
```

### Testing Locally

```bash
cd packages/cli

# Test WASM decryption directly
node -e "
const wasm = require('./wasm/rankcli_audit_engine.js');
wasm.init_engine('dev');
console.log('Decrypted:', wasm.get_decrypted_code().length, 'chars');
console.log('Tier:', wasm.get_tier());
"

# Run WASM integration test suite
pnpm test:wasm

# Test full audit (requires build:js first)
node -e "
const { initEngine, runAudit } = require('./dist/wasm-engine.js');
(async () => {
  await initEngine('dev');
  const html = '<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>';
  const result = await runAudit('https://example.com', html);
  console.log('Score:', result.score);
  console.log('Issues:', result.issues.length);
})();
"
```

### Production Build

For production, set `RANKCLI_BUILD_KEY` to a secure 32-byte base64 key:

```bash
# Generate production key (store securely!)
export RANKCLI_BUILD_KEY=$(openssl rand -base64 32)

# Build with production key
cd packages/cli
pnpm build:wasm

# Verify package contents
npm pack --dry-run
```

### Package Publishing

```bash
# Build everything
cd packages/cli
pnpm build

# Publish to npm
npm publish
```

### GitHub Actions Integration

The repository includes two workflows for CLI builds:

1. **`ci.yml`** - Runs on every PR/push, builds and tests with dev key
2. **`build-cli.yml`** - Builds with production key, publishes on release

**Required Secrets:**

| Secret | Description | Required For |
|--------|-------------|--------------|
| `RANKCLI_BUILD_KEY` | Base64-encoded 32-byte AES key | Production builds |
| `NPM_TOKEN` | npm access token for publishing | npm publish |

**Generate production key:**
```bash
# Generate and copy to clipboard (macOS)
openssl rand -base64 32 | pbcopy

# Or just display
openssl rand -base64 32
```

**Workflow triggers:**

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | Push/PR to main | Build + test with dev key |
| `build-cli.yml` | Push to main (cli/agent changes) | Build only |
| `build-cli.yml` | Release published | Build + publish to npm |
| `build-cli.yml` | Manual dispatch | Build + optional publish |

### Publishing to npm

**Automatic publishing (recommended):**

```bash
# Create a release - triggers build-cli.yml automatically
gh release create v1.0.0 --title "Release 1.0.0" --notes "Release notes here"

# The workflow will:
# 1. Build with production RANKCLI_BUILD_KEY
# 2. Run WASM integration tests
# 3. Set package version from tag (v1.0.0 → 1.0.0)
# 4. Publish to npm
```

**Manual publishing:**

```bash
# Trigger workflow manually with publish flag
gh workflow run build-cli.yml -f publish=true

# Or build locally and publish
cd packages/cli
RANKCLI_BUILD_KEY=$(cat /path/to/key) pnpm build
npm publish
```

### WASM Integration Tests

The CLI includes a test suite that verifies WASM functionality:

```bash
cd packages/cli

# Run WASM integration tests
pnpm test:wasm

# Tests verify:
# ✓ Engine not ready before init
# ✓ Invalid license key rejected
# ✓ Dev key accepted
# ✓ Engine ready after init
# ✓ Correct tier for license
# ✓ Audit returns valid results
```

### Workflow Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | PR/push validation with dev key |
| `.github/workflows/build-cli.yml` | Production builds and npm publishing |

### CI Pipeline Steps

The `build-cli.yml` workflow performs these steps:

1. **Setup environment** - Node.js, pnpm, Rust, wasm-pack
2. **Build agent-runtime** - `pnpm build:wasm` (JS → IIFE bundle)
3. **Build CLI WASM** - `pnpm build:wasm` (encrypt + embed in WASM)
4. **Build TypeScript** - `pnpm build:js`
5. **Run tests** - `pnpm test:wasm`
6. **Upload artifact** - Build artifacts saved for 7 days
7. **Publish** - (on release) Publish to npm registry

### Detailed Documentation

See [docs/wasm-code-protection.md](docs/wasm-code-protection.md) for:
- Encryption algorithm details
- Key derivation process
- Tier-based check limits
- API reference
- Troubleshooting

---

## Threat Intelligence Updates

RankCLI includes a URL safety check powered by a local threat hash database, similar to Google Safe Browsing. This database is populated from [URLhaus](https://urlhaus.abuse.ch/) by abuse.ch.

### How It Works

1. **Hash Database**: Stores FNV-1a hash prefixes of malicious URLs/domains
2. **Local Lookup**: All checks happen locally - no external API calls during audits
3. **Weekly Updates**: GitHub Action automatically refreshes the data

### Database Schema

```sql
-- Threat hash prefixes (in threat_hashes table)
hash_prefix VARCHAR(16)   -- 8-char hex FNV-1a hash
hash_type VARCHAR(20)     -- 'url' or 'domain'
threat_type VARCHAR(50)   -- 'malware', 'phishing', etc.
source VARCHAR(50)        -- 'urlhaus'
tags TEXT[]               -- e.g., ['botnet', 'c2', 'ransomware']
is_active BOOLEAN
```

### Automatic Updates (GitHub Action)

The `update-threat-hashes.yml` workflow runs **every Sunday at 3:00 AM UTC**.

**What it does**:
1. Downloads fresh URLhaus CSV (~20K+ malicious URLs)
2. Generates hash prefixes using FNV-1a algorithm
3. Updates `015_threat_hashes_seed.sql` migration file
4. Commits changes if data changed
5. Deploys to Supabase
6. Calls sync function for live refresh

**Required GitHub Secrets**:

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI token ([get here](https://supabase.com/dashboard/account/tokens)) |
| `SUPABASE_PROJECT_ID` | Project reference ID (Settings → General) |
| `SUPABASE_URL` | Project URL (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Settings → API) |

**Manual trigger**:
```bash
# Via GitHub CLI
gh workflow run update-threat-hashes.yml

# Via GitHub UI
# Go to Actions → Update Threat Hashes → Run workflow
```

### Manual Updates

**Option 1: Regenerate seed file locally**
```bash
cd packages/saas
npx tsx scripts/generate-threat-seed.ts
supabase db push
```

**Option 2: Call sync Edge Function**
```bash
curl -X POST "https://<project>.supabase.co/functions/v1/sync-threat-hashes" \
  -H "Authorization: Bearer <service_role_key>"
```

### Checking Statistics

```sql
-- View threat hash stats by source and type
SELECT * FROM get_threat_hash_stats();

-- Recent sync operations
SELECT source, status, records_processed, completed_at
FROM threat_sync_log
ORDER BY started_at DESC
LIMIT 5;

-- Count active hashes
SELECT hash_type, COUNT(*)
FROM threat_hashes
WHERE is_active = TRUE
GROUP BY hash_type;
```

### Files

| File | Description |
|------|-------------|
| `packages/saas/supabase/migrations/014_add_threat_hashes.sql` | Creates tables and RLS policies |
| `packages/saas/supabase/migrations/015_threat_hashes_seed.sql` | Initial ~30K threat hashes |
| `packages/saas/supabase/functions/sync-threat-hashes/index.ts` | Edge function to sync from URLhaus |
| `packages/saas/scripts/generate-threat-seed.ts` | Script to generate seed SQL |
| `.github/workflows/update-threat-hashes.yml` | Weekly auto-update workflow |
| `packages/agent-runtime/src/audit/checks/url-safety.ts` | URL safety check implementation |

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

### WASM Build Failing

```bash
# Check Rust is installed
rustc --version

# Check wasm-pack is installed
wasm-pack --version

# Check WASM target is installed
rustup target list | grep wasm32

# If missing, add it:
rustup target add wasm32-unknown-unknown

# Clean and rebuild
cd packages/cli/native
cargo clean
cd ..
pnpm build:wasm:dev
```

### "Invalid license key" Error

The license key doesn't match the key used at build time. For development builds, use `"dev"`:

```typescript
await initEngine('dev');
```

For production, ensure `RANKCLI_LICENSE_KEY` environment variable matches the tier associated with the user's subscription.

### "WASM engine not found" Error

The WASM binary hasn't been built or is in the wrong location:

```bash
cd packages/cli
pnpm build:wasm:dev

# Verify files exist
ls -la wasm/
```

---

## Checklist

### Development Setup Checklist

**SaaS Platform:**
- [ ] Supabase project created
- [ ] Google OAuth configured in Supabase
- [ ] GitHub OAuth configured in Supabase
- [ ] Stripe account in test mode
- [ ] Stripe webhook endpoint created (pointing to Supabase)
- [ ] `.env` file configured
- [ ] Supabase CLI linked to project
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Dev server running on port 3005

**CLI Package:**
- [ ] Rust installed with WASM target
- [ ] wasm-pack installed
- [ ] Agent runtime WASM bundle built
- [ ] CLI WASM binary built (dev mode)
- [ ] Local testing passing

### Production Setup Checklist

**SaaS Platform:**
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

**Fly.io Audit Worker:**
- [ ] Fly.io account created
- [ ] `FLY_API_TOKEN` secret set in GitHub
- [ ] `AUDIT_WORKER_SECRET` secret set in GitHub
- [ ] `OPENAI_API_KEY` secret set in GitHub
- [ ] Worker deployed and healthy

**AI Keyword Research (Optional):**
- [ ] `BRAVE_API_KEY` secret set in GitHub (for competitive search)
- [ ] `SERPER_API_KEY` secret set in GitHub (backup search)
- [ ] `GITHUB_TOKEN_SEARCH` secret set in GitHub (for rate limits)
- [ ] Keyword research tested via CLI and UI

**CLI Package:**
- [ ] `RANKCLI_BUILD_KEY` secret set in GitHub
- [ ] `NPM_TOKEN` secret set in GitHub
- [ ] WASM build workflow configured
- [ ] First npm publish completed
