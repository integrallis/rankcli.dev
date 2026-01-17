# CLAUDE.md

This file provides context for Claude Code to work autonomously on this project.

## Project: SEO Autopilot

A developer-first SEO automation tool. CLI-based, AI-powered, event-driven.

## Current State

**Status**: Early development - building the MVP

**What exists**:
- Project plan and architecture docs in `docs/`
- Agent YAML definitions in `agents/`
- DevContainer setup in `.devcontainer/`
- CLI scaffold in `packages/cli/`

**What needs to be built**:
1. Agent runtime (load YAML agents, execute with tools)
2. CLI commands (`seo init`, `seo analyze`, `seo apply`)
3. Supabase integration (schema already defined in `.devcontainer/init-db.sql`)
4. GitHub Action for CI/CD

## Test Repo: animerm.ai

There's a real SaaS at `test_repos/animerm.ai` to test against:

**Product**: animerm.ai - Animate your Mermaid diagrams with Keynote-style controls
**URL**: https://animerm.ai
**Stack**: React + TypeScript + Vite (frontend), Rust (backend), Supabase (auth/DB)
**SEO Status**: ZERO SEO implemented - perfect test case

**What animerm.ai needs**:
- Meta tags (title, description) on all pages
- Open Graph / Twitter cards
- JSON-LD schema (SoftwareApplication)
- sitemap.xml
- robots.txt
- Proper heading hierarchy (H1s)
- Image alt text
- Core Web Vitals optimization

## Environment

All credentials are in `.env`:
```bash
OPENAI_API_KEY=...           # For OpenAI API calls
VITE_SUPABASE_URL=...        # Supabase project URL
VITE_SUPABASE_ANON_KEY=...   # Supabase public key
SUPABASE_SERVICE_KEY=...     # Supabase admin key
SUPABASE_ACCESS_TOKEN=...    # Supabase CLI token
```

**Backend**: Uses Supabase directly (no local PostgreSQL needed).
See `test_repos/animerm.ai/ui/supabase/` for migration patterns.

## Goal: Build the CLI

When I say "go", build the SEO Autopilot CLI that can:

### Phase 1: Analysis (Priority)
1. `seo init` - Initialize in a project directory
   - Detect framework (animerm.ai uses Vite + React)
   - Create `.seo-autopilot.yaml` config
   - Identify all pages/routes

2. `seo analyze` - Run full SEO analysis
   - Crawl all pages (can test against http://localhost:9000 or https://animerm.ai)
   - Check meta tags, headings, schema, images
   - Generate report with score and issues
   - Use the agent definitions in `agents/site-analyzer.yaml`

3. `seo apply` - Apply fixes
   - Generate code changes for each issue
   - Create git commits (or PR if GitHub repo)
   - Changes should be framework-aware (Vite/React patterns)

### Architecture

```
packages/
├── cli/                 # CLI entry point
│   └── src/
│       ├── index.ts     # Main CLI using Commander.js
│       └── commands/    # Command implementations
├── agent-runtime/       # Agent executor
│   └── src/
│       ├── loader.ts    # Load YAML agents
│       ├── executor.ts  # Run agents with Claude API
│       └── tools/       # Tool implementations (crawl, analyze, etc.)
└── core/                # Shared utilities
```

### Key Files to Reference

- `docs/CONSOLIDATED_PLAN.md` - Full technical spec
- `agents/*.yaml` - Agent definitions with SEO best practices
- `test_repos/animerm.ai/` - Test target (Vite + React SaaS)

## Commands

```bash
# In DevContainer
pnpm install           # Install all deps
pnpm dev               # Run all packages in dev mode
pnpm cli               # Run CLI package commands

# Test against animerm.ai
cd test_repos/animerm.ai/ui
docker compose up      # Start animerm.ai on localhost:9000

# Then from project root
seo init test_repos/animerm.ai
seo analyze --url http://localhost:9000
seo apply
```

## Output Format

When generating fixes for animerm.ai, output should be:

1. **Git commits** with clear messages
2. **One commit per fix category** (meta tags, schema, images, etc.)
3. **Framework-aware code** (Vite patterns, React conventions)

Example fix for animerm.ai (adding meta tags):

```typescript
// ui/src/main.tsx or ui/index.html
// Add to <head>:
<title>animerm.ai - Animate Mermaid Diagrams with Keynote-Style Controls</title>
<meta name="description" content="Create stunning animated Mermaid diagrams. Write Mermaid code, apply professional animations, and export to GIF. Free to start." />
<meta property="og:title" content="animerm.ai - Animated Mermaid Diagrams" />
<meta property="og:description" content="Create stunning animated Mermaid diagrams. Export to GIF." />
<meta property="og:image" content="https://animerm.ai/og-image.png" />
<link rel="canonical" href="https://animerm.ai" />
```

## Success Criteria

1. Run `seo analyze` on animerm.ai → Get comprehensive report
2. Run `seo apply` → Generate commits with all SEO fixes
3. Fixes are correct for Vite + React (not Next.js patterns)
4. Score improves from ~20 to 80+

## Don't

- Don't create Next.js patterns (animerm.ai is Vite)
- Don't add complex abstractions - keep it simple
- Don't wait for user input - propose and execute
- Don't write tests first - build working code, test manually
