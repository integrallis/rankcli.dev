# RankCLI

> Ship code, get ranked. Get cited, not just crawled.

CLI-first SEO + GEO automation for developers. Audit, fix, and track — from your terminal.

## Why RankCLI?

Enterprise SEO tools cost $100+/month and expect you to click through dashboards. You're a developer. You want:

- **CLI-first**: Runs in your terminal, fits your workflow
- **Agentic fixes**: Detects issues, generates fixes, commits & pushes
- **AI-native**: GEO (Generative Engine Optimization) + a free, local MCP server for AI assistants
- **Affordable**: a real Free tier + $9/mo for solo devs (founding members: $19/mo Pro, first 100 customers)

## Quick Start

```bash
# Install (standalone binary, no Node required)
brew install integrallis/tap/rankcli
# or: scoop bucket add integrallis https://github.com/integrallis/scoop-bucket && scoop install rankcli
# or via npm (requires Node 18+)
npm install -g @rankcli/cli

# Authenticate
rankcli login

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
# Full audit with 280+ checks
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
Claude and other AI assistants can run audits directly via Model Context Protocol. Free, local, no signup:
```bash
npx @rankcli/mcp-server
```
A free hosted endpoint (`https://mcp.rankcli.dev/mcp/free`) is also available — no npx, no signup. For teams that want dashboard sync, GitHub auto-fix PRs, and scheduled monitoring, use the paid hosted endpoint (`https://mcp.rankcli.dev/mcp`) — see [`packages/mcp-server`](packages/mcp-server).

## CLI Commands

| Command | Description |
|---------|-------------|
| `rankcli login` | Authenticate with API key |
| `rankcli audit` | Run SEO audit (280+ checks) |
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

Every plan runs all 280+ checks, and local `rankcli fix` is free on every plan.

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 1 site audited weekly, audit history, weekly report email, README badge, 3 auto-fix PRs a month |
| Solo | $9/mo | 3 sites audited weekly, 10 pages per audit, auto-fix PRs, Slack & Discord alerts, AI analysis on your own key |
| Pro | $29/mo | 10 sites audited daily, audit on every push, keyword research on your own key |
| Agency | $99/mo | 50 sites, white-label reports & widgets, client report links |

Annual billing is 2 months free.

Founding members get Pro for $19/mo (locked in for as long as you stay subscribed) — limited to the first 100 customers. See [rankcli.dev/pricing](https://rankcli.dev/pricing).

## Project Structure

```
/packages
  /cli                    # @rankcli/cli - CLI tool
  /agent-runtime          # @rankcli/agent-runtime - Core audit engine (public checks)
  /agent-runtime-premium  # Paid-tier checks (never published; encrypted into the CLI's WASM binary)
  /mcp-server             # @rankcli/mcp-server - free, local MCP server
  /saas                   # Web dashboard (rankcli.dev)
  /audit-worker           # Deep-audit worker (Fly.io)
  /github-action          # GitHub Action wrapper
  /vite-plugin, /next-plugin, /astro-plugin  # Build-tool plugins
  /vscode-extension       # VS Code extension

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
- **Binaries (Homebrew/Scoop)**: [github.com/integrallis/rankcli-cli](https://github.com/integrallis/rankcli-cli)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built for developers who'd rather ship code than click through SEO dashboards.
