# CLAUDE.md

This file provides context for Claude Code to work autonomously on this project.

## Project: RankCLI

**Ship code, get ranked. SEO meets CI/CD.**

A developer-first SEO automation tool. CLI-based, AI-powered, event-driven.

Website: https://rankcli.dev

## Current State

**Status**: MVP development - SaaS platform with CLI

**What exists**:
- Agent runtime with 200+ SEO checks (`packages/agent-runtime/`)
- CLI scaffold (`packages/cli/`)
- SaaS frontend with auth, billing, dashboard (`packages/saas/`)
- Framework plugins (Vite, Next.js, Astro)
- GitHub Action for CI/CD integration
- VS Code extension

**Packages**:
```
packages/
├── cli/                 # CLI entry point (rankcli command)
├── agent-runtime/       # Core audit engine, GEO tracking, content generation
├── saas/                # SaaS web app (React + Vite + Supabase + Stripe)
├── github-action/       # GitHub Action for CI/CD
├── vscode-extension/    # VS Code extension
├── vite-plugin/         # Vite plugin
├── next-plugin/         # Next.js plugin
└── astro-plugin/        # Astro integration
```

## Test Repo: animerm.ai

There's a real SaaS at `test_repos/animerm.ai` to test against:

**Product**: animerm.ai - Animate your Mermaid diagrams with Keynote-style controls
**URL**: https://animerm.ai
**Stack**: React + TypeScript + Vite (frontend), Rust (backend), Supabase (auth/DB)
**SEO Status**: ZERO SEO implemented - perfect test case

## Environment

All credentials are in `.env`:
```bash
OPENAI_API_KEY=...           # For OpenAI API calls
VITE_SUPABASE_URL=...        # Supabase project URL
VITE_SUPABASE_ANON_KEY=...   # Supabase public key
SUPABASE_SERVICE_KEY=...     # Supabase admin key
SUPABASE_ACCESS_TOKEN=...    # Supabase CLI token
STRIPE_SECRET_KEY=...        # Stripe API key
```

## Commands

```bash
# Development
pnpm install           # Install all deps
pnpm dev               # Run all packages in dev mode
pnpm test              # Run all tests

# CLI
pnpm cli               # Run CLI commands
rankcli init           # Initialize in a project
rankcli audit          # Run SEO audit
rankcli fix            # Apply auto-fixes

# SaaS
cd packages/saas
pnpm dev               # Start dev server on localhost:3005

# Development deployment
./scripts/dev-deploy.sh   # Full dev setup (migrations, functions, server)
```

## CLI Commands

```bash
# Authentication
rankcli login                   # Interactive login (email/password)
rankcli login --browser         # Browser-based OAuth login
rankcli login --token <key>     # API key login (for CI/CD)
rankcli logout                  # Log out
rankcli whoami                  # Show current user

# Auditing
rankcli audit --url <url>       # Run SEO audit on a URL
rankcli audit --url <url> --max-pages 10  # Multi-page audit
rankcli audit --url <url> --ai  # AI-enhanced audit
rankcli audit -o json           # Output as JSON

# Fixes
rankcli apply --url <url>       # Apply SEO fixes to codebase
rankcli apply --dry-run         # Preview fixes without applying

# Keywords & Content
rankcli keywords --url <url> --ai   # AI keyword research
rankcli content --url <url> -k <keyword>  # Content analysis
rankcli intent <keyword>        # Search intent classification

# Setup
rankcli init                    # Initialize in a project
rankcli setup --github-action   # Create GitHub Action workflow
rankcli setup --ga4 <id>        # Add GA4 tracking
```

**Environment Variables:**
- `RANKCLI_API_KEY` - API key for non-interactive auth (CI/CD)
- `OPENAI_API_KEY` - For AI-powered features

## Taglines

- **Main**: "Ship code, get ranked."
- **CI/CD pages**: "SEO meets CI/CD"
- **Developer focus**: "Engineering as Marketing"

## Architecture

### SaaS Stack
- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Payments**: Stripe (subscriptions + one-time)
- **Hosting**: Cloudflare Pages

### Pricing Tiers
- **Free**: 1 site, 50 checks, manual audits
- **Solo** ($9/mo): 3 sites, 50+ checks, weekly audits, GitHub connect
- **Pro** ($29/mo): 10 sites, daily audits, auto-fix PRs, Slack alerts
- **Agency** ($99/mo): 50 sites, on-demand audits, white-label, API access

## Key Files

- `DEPLOYMENT.md` - Full deployment guide
- `github_deployments.md` - GitHub secrets/variables reference
- `packages/saas/supabase/migrations/` - Database schema
- `packages/saas/supabase/functions/` - Edge functions (checkout, webhook, audit)
- `.github/workflows/` - CI/CD pipelines

## Don't

- Don't create Next.js patterns for Vite projects
- Don't add complex abstractions - keep it simple
- Don't wait for user input - propose and execute
- Don't add time estimates
- Don't let the dev server run on any port other than 3005. Kill processes on 3005-3008 first: `lsof -ti:3005,3006,3007,3008 | xargs -r kill -9`
