# Launch social copy

> **Superseded.** Use [launch-kit-2026-09.md](./launch-kit-2026-09.md) and
> [reddit-posting-plan.md](./reddit-posting-plan.md) instead. The copy below quotes a
> 60/100 score, 13 MCP tools and the old pricing - all three are wrong now. Kept only
> for the phrasing.

Drafts — not posted. Post from the real account(s) after the launch
sequence in LAUNCH_CHECKLIST.md.

## X / Twitter — launch thread

**1/**
Every "AI SEO" tool is the same product: a $29–$2,000/mo dashboard that
tells marketing teams whether ChatGPT mentioned their brand.

None of them run in CI. None of them open a PR.

We built the one that does. Launching RankCLI today 🧵

**2/**
The data that matters here isn't "were you crawled" — it's "were you
cited." Brands actually cited in AI Overviews get 35% more organic clicks
and 91% more paid clicks than uncited brands. Crawled ≠ cited.

**3/**
Free tier is actually free: `npx @rankcli/mcp-server` — no signup, no API
key, runs locally in Claude Code / Cursor / whatever you use. 13 tools:
SEO audit, GEO/AI-crawler checks, Core Web Vitals, structured data,
security headers.

**4/**
Paid tier is CI scheduling + auto-fix PRs + hosted tracking — the
infrastructure layer, not the audit itself (that's already free/OSS
everywhere else, we're not pretending otherwise).

**5/**
We eat our own dog food: rankcli.dev scores 60/100 right now, 70 open
issues, audited by the same tool every week. Not a cherry-picked demo.

**6/**
First 100 Pro subscribers: $19/mo instead of $29, locked in for as long as
you stay subscribed. → rankcli.dev/pricing

## LinkedIn (single post)

Most "AI SEO" tools sell a dashboard to marketing teams: here's whether
ChatGPT mentioned your brand this week. Useful information, wrong delivery
mechanism if you're the one who has to fix it.

We built RankCLI to run the audit in CI — the same pipeline that ships
your code — and open a pull request when something's fixable, instead of
another alert to triage.

The free tier runs entirely local via MCP (no signup, no API key). The
paid tier is CI scheduling and auto-fix PRs — the automation layer, since
the audit itself is already commoditized across several free/open-source
tools.

We're launching with founding pricing (first 100 customers, $19/mo locked
in) and dogfooding it against our own site in public — currently 60/100,
70 open issues, fixed the same way we're asking you to fix yours.

rankcli.dev
