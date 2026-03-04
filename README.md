# RankCLI

> Ship code, get ranked.

CLI-first SEO automation for developers. Audit, fix, and track — from your terminal.

## Why RankCLI?

Enterprise SEO tools cost $100+/month and expect you to click through dashboards. You're a developer. You want:

- **CLI-first**: Runs in your terminal, fits your workflow
- **Agentic fixes**: Detects issues, generates fixes, commits & pushes
- **AI-native**: GEO (Generative Engine Optimization) + MCP server for AI assistants
- **Affordable**: Free tier + $15/mo for solo devs

## Quick Start

```bash
# Install
npm install -g @rankcli/cli

# Authenticate
rankcli auth login

# Run an audit
rankcli audit --url https://yoursite.com

# Auto-fix issues
rankcli fix --url https://yoursite.com --auto --commit --push

# Track keyword rankings
rankcli track add "your keyword" --url https://yoursite.com
rankcli track status
```

## Features

### Agentic Auto-Fix
```bash
# Detect → Fix → Commit → Push (full automation)
rankcli fix --url https://mysite.com --auto --commit --push

# Preview changes first
rankcli fix --url https://mysite.com --dry-run

# Fix specific issues only
rankcli fix --url https://mysite.com --only TITLE_MISSING,META_DESC_MISSING
```

### Keyword Rank Tracking
```bash
# Add keywords to track
rankcli track add "seo cli" "developer seo" --url https://mysite.com

# Check current positions
rankcli track status

# View position history with sparklines
rankcli track history --days 30

# Live SERP check
rankcli track check

# Export to CSV
rankcli track export --format csv > rankings.csv
```

### SEO Audit
```bash
# Full audit with 300+ checks
rankcli audit --url https://yoursite.com

# JSON output for CI/CD
rankcli audit --url https://yoursite.com --output json

# Generate framework-specific fixes
rankcli audit --url https://yoursite.com --framework nextjs
```

### GEO (AI Search Optimization)
```bash
# Check AI crawler access (GPTBot, ClaudeBot, PerplexityBot)
rankcli geo --url https://yoursite.com
```

### MCP Server
Claude and other AI assistants can run audits directly via Model Context Protocol:
```
https://rankcli.dev/mcp
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `rankcli auth` | Authenticate with API key |
| `rankcli audit` | Run SEO audit (300+ checks) |
| `rankcli fix` | Agentic fixer — detect, fix, commit, push |
| `rankcli track` | Keyword rank tracking |
| `rankcli apply` | Apply fixes from audit |
| `rankcli geo` | GEO (AI search) analysis |
| `rankcli keywords` | Keyword research |
| `rankcli content` | Content optimization |

## Framework Support

Auto-generates fixes for: Next.js, Nuxt, Vue, Astro, SvelteKit, Angular, Rails, Django, Laravel, WordPress, React.

## GitHub Action

```yaml
name: SEO Audit
on: [push, pull_request]

jobs:
  seo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @rankcli/cli
      - run: rankcli audit --url ${{ vars.SITE_URL }} --output json
        env:
          RANKCLI_API_KEY: ${{ secrets.RANKCLI_API_KEY }}
```

## Pricing

| Plan | Price | Keywords | Features |
|------|-------|----------|----------|
| Free | $0 | 10 | Basic audit, 1 project |
| Solo | $15/mo | 100 | Full audit, agentic fix, tracking |
| Pro | $49/mo | 500 | GitHub integration, API access |
| Agency | $149/mo | 2000 | White-label, priority support |

## Project Structure

```
/packages
  /cli           # @rankcli/cli - CLI tool
  /agent-runtime # @rankcli/agent-runtime - Core engine
  /saas          # Web dashboard (rankcli.dev)
  /worker        # Audit worker (Fly.io)

/supabase        # Database migrations
/docs            # Documentation
```

## Tech Stack

- **CLI & Runtime**: TypeScript, Commander.js
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Postgres + Auth + Edge Functions)
- **Worker**: Fly.io (audit processing)
- **AI**: Anthropic Claude, OpenAI

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start dashboard dev server
pnpm --filter @rankcli/saas dev
```

## Links

- **Website**: [rankcli.dev](https://rankcli.dev)
- **Docs**: [rankcli.dev/docs](https://rankcli.dev/docs)
- **npm**: [@rankcli/cli](https://www.npmjs.com/package/@rankcli/cli)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built for developers who'd rather ship code than click through SEO dashboards.
