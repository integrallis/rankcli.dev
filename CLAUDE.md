# CLAUDE.md

This file provides context for Claude Code to work autonomously on this project.

## Project: RankCLI

**Ship code, get ranked. SEO meets CI/CD.**

A developer-first SEO automation tool. CLI-based, AI-powered, event-driven.

Website: https://rankcli.dev

## Current State

**Status**: MVP development - SaaS platform with CLI (see `packages/` for the monorepo layout)

## Test Repo: animerm.ai

There's a real SaaS at `test_repos/animerm.ai` to test against:

**Product**: animerm.ai - Animate your Mermaid diagrams with Keynote-style controls
**URL**: https://animerm.ai
**Stack**: React + TypeScript + Vite (frontend), Rust (backend), Supabase (auth/DB)
**SEO Status**: ZERO SEO implemented - perfect test case

## Environment

All credentials are in `.env` (read it for the key names).

- `RANKCLI_API_KEY` - API key for non-interactive auth (CI/CD)
- `OPENAI_API_KEY` - For AI-powered features

## Commands

CLI commands: see `rankcli --help` / `packages/cli`.

```bash
# SaaS
cd packages/saas
pnpm dev               # Start dev server on localhost:3005

# Development deployment
./scripts/dev-deploy.sh   # Full dev setup (migrations, functions, server)
```

## Taglines

- **Main**: "Ship code, get ranked."
- **CI/CD pages**: "SEO meets CI/CD"
- **Developer focus**: "Engineering as Marketing"

## Pricing Tiers
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
- Don't add "Co-Authored-By" lines mentioning Claude or Anthropic in git commits
- Don't let the dev server run on any port other than 3005. Kill processes on 3005-3008 first: `lsof -ti:3005,3006,3007,3008 | xargs -r kill -9`
