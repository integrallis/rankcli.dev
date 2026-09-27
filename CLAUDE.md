# CLAUDE.md

This file provides context for Claude Code to work autonomously on this project.

## Project: RankCLI

**Ship code, get ranked. SEO meets CI/CD.**

A developer-first SEO automation tool. CLI-based, AI-powered, event-driven.

Website: https://rankcli.dev

## Current State

**Status**: MVP development - SaaS platform with CLI (see `packages/` for the monorepo layout)

## Test Site: animerm.ai

A real SaaS to audit against (the site is live; its source is **not** in this repo -
`test_repos/animerm.ai` does not exist here, so audit the URL rather than looking for files):

**Product**: animerm.ai - Animate your Mermaid diagrams with Keynote-style controls
**URL**: https://animerm.ai
**Stack**: React + TypeScript + Vite (frontend), Rust (backend), Supabase (auth/DB)
**SEO Status**: minimal - it has a real robots.txt and a meta description, but no sitemap,
no llms.txt and no structured data (verified 2026-09-27). Its /sitemap.xml and /llms.txt
answer 200 with the SPA shell, which makes it a good test of fallback detection.

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

### Running the CLI from this repo

A monorepo build has no injected production config (`inject-config` runs at publish), so
cloud sync fails until you pass it:

```bash
cd packages/agent-runtime && pnpm build      # cli bundles this; dist/ is gitignored and
                                             # goes stale, which makes CLI tests fail oddly
cd ../cli && pnpm build:js
RANKCLI_SUPABASE_URL=... RANKCLI_SUPABASE_ANON_KEY=... node dist/index.js audit -u <url>
```

## Taglines

- **Main**: "Ship code, get ranked."
- **CI/CD pages**: "SEO meets CI/CD"
- **Developer focus**: "Engineering as Marketing"

## Pricing Tiers
Source of truth: `packages/saas/src/config/pricing-tiers.json` (rationale: `docs/PRICING_ANALYSIS_2026-09.md`). Every plan runs all 280+ checks; the CLI, MCP server, GitHub Action and local `rankcli fix` are free forever; AI features run on the user's own key.
- **Free**: 1 site audited weekly, README badge, weekly email report, 3 auto-fix PRs/month (1 open at a time, 3 per report)
- **Solo** ($9/mo, $90/yr): 3 sites audited weekly, unlimited auto-fix PRs (1 open per site, 3 per report), Slack/Discord alerts, API 100/day
- **Pro** ($29/mo, $290/yr; $19 founding for the first 100): 10 sites audited daily and on every push, 3 open auto-fix PRs per site, 5 per report, API 1K/day
- **Agency** ($99/mo, $990/yr): 50 sites, white-label reports and widgets, client report links, 10 open auto-fix PRs per site, 10 per report, API 10K/day

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
