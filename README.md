# SEO Autopilot

> Ship your product. We'll ship your SEO.

Developer-centric, AI-powered SEO automation for indie hackers, solo founders, and small dev teams.

## Why SEO Autopilot?

You built something awesome. Now you need people to find it. But SEO is:
- Time-consuming (you're already stretched thin)
- Expensive (Ahrefs: $129+, SEMrush: $130+, Moz: $99+)
- Overwhelming (too many features, too much data)
- Manual (constant clicking, exporting, analyzing)

**SEO Autopilot is different:**
- **CLI-first**: Install in your repo, runs in your terminal
- **AI-powered**: Analyzes your project, suggests & implements SEO
- **Automated**: Continuous monitoring with auto-improvements
- **Affordable**: Starting at $15/month (10x cheaper than competitors)

## Quick Start

```bash
# Install
npm install -g seo-autopilot

# Initialize in your project
cd your-awesome-project
seo init

# Run analysis
seo analyze

# Run full audit
seo audit

# Apply AI recommendations
seo apply
```

## Features

### CLI Commands
```bash
seo init        # Set up config, detect framework, connect accounts
seo analyze     # AI analyzes codebase for SEO opportunities
seo audit       # Technical SEO audit (links, meta, speed)
seo keywords    # Keyword research for your domain
seo competitors # Analyze competitor strategies
seo rank        # Check current keyword rankings
seo apply       # Apply recommended changes to code
seo report      # Generate performance report
seo watch       # Continuous monitoring mode
```

### GitHub Action
```yaml
name: SEO Audit
on: [push, pull_request]

jobs:
  seo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: seo-autopilot/action@v1
        with:
          api-key: ${{ secrets.SEO_AUTOPILOT_KEY }}
          fail-on: critical
```

### Web Dashboard
For research, monitoring, and those without an existing project:
- Keyword research
- Competitor analysis
- Rank tracking
- Performance monitoring
- AI insights

## Pricing

| Plan | Price | Projects | Keywords | Features |
|------|-------|----------|----------|----------|
| Starter | $15/mo | 1 | 50 | Weekly ranks, monthly audit, email reports |
| Pro | $39/mo | 5 | 250 | Daily ranks, continuous audit, GSC, GitHub Action |
| Team | $99/mo | 20 | 1,000 | Real-time, auto-apply, API, white-label |

## Project Structure

```
/packages
  /cli        # Node.js CLI tool
  /core       # Shared business logic
  /api        # FastAPI backend
  /web        # Next.js dashboard
  /action     # GitHub Action

/docs
  PROJECT_PLAN.md           # Full product plan
  OPEN_SOURCE_TOOLS_REFERENCE.md  # Tools we leverage
  COMPETITOR_ANALYSIS.md    # Market analysis

/references
  /open-source-tools        # Cloned/referenced OSS tools
  /apis                     # API integration examples
```

## Tech Stack

- **CLI**: TypeScript, Commander.js
- **Backend**: Python, FastAPI, PostgreSQL, Redis
- **Frontend**: Next.js, Tailwind CSS, shadcn/ui
- **AI**: Claude API (Anthropic)
- **Integrations**: Google Search Console, Bing Webmaster, Lighthouse

## Development

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run CLI locally
pnpm cli dev

# Run API locally
pnpm api dev

# Run web locally
pnpm web dev
```

## Roadmap

### Q1 2025: Foundation
- [x] Project plan & architecture
- [ ] CLI basic commands
- [ ] Core API setup
- [ ] Basic web dashboard
- [ ] Google Search Console integration

### Q2 2025: Intelligence
- [ ] AI analysis engine
- [ ] Keyword research
- [ ] Competitor analysis
- [ ] Auto-apply system
- [ ] GitHub Action

### Q3 2025: Scale
- [ ] Rank tracking
- [ ] Performance monitoring
- [ ] Automated recommendations
- [ ] Team features

### Q4 2025: Polish
- [ ] White-label reports
- [ ] Advanced integrations
- [ ] Mobile PWA
- [ ] Enterprise features

## Open Source

We believe in giving back. These components are open source:
- CLI core (basic audit)
- GitHub Action (basic checks)
- Documentation
- Example integrations

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with frustration by developers, for developers.
