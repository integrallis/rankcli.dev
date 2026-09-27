# Product Hunt launch post

> Numbers in this file come from [VERIFIED-NUMBERS.md](./VERIFIED-NUMBERS.md). Re-check before posting.

Draft — review and post yourself. Nothing here has been submitted.

## Tagline (60 char limit)

**Primary:** `SEO audits that ship as pull requests, not dashboards`
(55 chars)

**Alt:** `Get cited, not just crawled. SEO + GEO in your CI.`
(52 chars)

## Gallery / description

RankCLI runs 280+ SEO and GEO (AI-search-citation) checks against your site
in CI — the same pipeline that ships your code — and opens a pull request
with the fix, instead of another dashboard alert nobody reads.

Every GEO/AI-visibility tool right now is a $29–$2,000/mo monitoring
dashboard built for marketing teams. None of them run in CI, none of them
open PRs, and none of them are priced for a solo developer. RankCLI is the
one that does.

**What it checks:** technical SEO (crawlability, structured data, Core Web
Vitals, security headers) plus GEO — is your site actually visible to
GPTBot, ClaudeBot, PerplexityBot? Is your content structured so an AI
answer engine can cite you? As of September 2026, Cloudflare blocks
"mixed-use" AI crawlers by default on ad-hosting zones — if you haven't
explicitly configured your robots.txt for that, you may already be invisible
to AI search and not know it. RankCLI checks for exactly this.

**How you use it:**
- Free forever via MCP (`npx @rankcli/mcp-server`) — no signup, no API key,
  runs entirely in your AI coding assistant (Claude Code, Cursor, etc.)
  against HTML you already have.
- CLI + GitHub Action for CI-native scheduled audits and auto-fix PRs.
- We dogfood it against our own site every week — rankcli.dev currently
  scores 75/100 with 0 errors, audited by the exact tool you'd run.
  ⚠️ Only claim this publicly if the repo/issue is visible — see the repo
  visibility note in `mcp-directories.md`. If the repo stays private, drop
  "tracked in our own GitHub issues" below and keep only the score claim.

**Launch pricing:** first 100 customers get Pro (CI scheduling, auto-fix
PRs, hosted GEO tracking) at $19/mo instead of $29/mo, locked in for as
long as you stay subscribed.

## First comment (post immediately after launch, from founder account)

> Hey Product Hunt 👋
>
> I built RankCLI because every "AI SEO" tool I looked at was a $200+/mo
> dashboard aimed at marketing teams — and none of them actually fit into
> how developers ship things: a PR, reviewed, merged, done.
>
> The idea is simple: run the audit in CI, same as your tests and linter.
> If something's fixable — missing alt text, a broken canonical, an AI
> crawler you're accidentally blocking — open a PR instead of an email
> nobody reads.
>
> We're dogfooding this against rankcli.dev itself — currently a 75/100
> with 70 open issues, fixed the same way we're asking you to fix yours.
> No cherry-picked demo site.
>
> Free tier is genuinely free — the MCP server runs locally with your own
> OpenAI/Anthropic key, no signup required. Happy to answer anything about
> the GEO checks, the CI setup, or why we think "AI SEO" dashboards are
> solving the wrong problem for developers.

## Topics/tags to select
`Developer Tools`, `SEO`, `Artificial Intelligence`, `GitHub`, `Marketing`

## Timing note
Product Hunt launches perform best posted 12:01am PT on a Tuesday–Thursday.
Coordinate with the MCP directory submissions (see `mcp-directories.md`) so
they're live before the PH post goes up — PH commenters will click through.
