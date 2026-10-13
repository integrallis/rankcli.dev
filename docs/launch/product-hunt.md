# Product Hunt launch post

> Numbers in this file come from [VERIFIED-NUMBERS.md](./VERIFIED-NUMBERS.md). Re-check before posting.

Draft, review and post yourself. Nothing here has been submitted.
Copy re-checked against the product on 2026-10-02 (numbers, pricing, free-tier claims).

## Tagline (60 char limit)

**Primary:** `SEO audits that ship as pull requests, not dashboards`
(55 chars)

**Alt:** `Get cited, not just crawled. SEO + GEO in your CI.`
(52 chars)

## Gallery / description

RankCLI runs 280+ SEO and GEO (AI-search-citation) checks against your site
in CI, the same pipeline that ships your code, and opens a pull request
with the fix, instead of another dashboard alert nobody reads.

Most GEO/AI-visibility tools are monitoring dashboards built for marketing
teams. RankCLI is built for the developer who ships the fix: it runs in CI
and opens the PR.

**What it checks:** technical SEO (crawlability, structured data, Core Web
Vitals, security headers) plus GEO, is your site actually visible to
GPTBot, ClaudeBot, PerplexityBot? Is your content structured so an AI
answer engine can cite you? As of September 2026, Cloudflare blocks
"mixed-use" AI crawlers by default on ad-hosting zones, if you haven't
explicitly configured your robots.txt for that, you may already be invisible
to AI search and not know it. RankCLI checks for exactly this.

**How you use it:**
- Free forever via MCP (`npx @rankcli/mcp-server`) or the CLI, no signup.
  The checks run locally; the AI features use your own OpenAI/Anthropic key.
- CLI + GitHub Action for CI-native scheduled audits and auto-fix PRs.
- We dogfood it against our own site every week, the rankcli.dev homepage
  currently scores 75/100 with 0 errors, audited by the exact tool you'd run.

**Launch pricing:** a free account gets one site audited weekly and 3
auto-fix PRs a month. The first 100 Pro customers (10 sites audited daily,
an audit on every push, unlimited auto-fix PRs) pay $19/mo instead of
$29/mo, locked in for as long as they stay subscribed.

## First comment (post immediately after launch, from founder account)

> Hey Product Hunt 👋
>
> I built RankCLI because every "AI SEO" tool I looked at was a $200+/mo
> dashboard aimed at marketing teams, and none of them actually fit into
> how developers ship things: a PR, reviewed, merged, done.
>
> The idea is simple: run the audit in CI, same as your tests and linter.
> If something's fixable, missing alt text, a broken canonical, an AI
> crawler you're accidentally blocking, open a PR instead of an email
> nobody reads.
>
> We're dogfooding this against rankcli.dev itself: the homepage is 75/100
> today, 0 errors and 65 warnings and notices still open, fixed the same way
> we're asking you to fix yours.
> No cherry-picked demo site.
>
> The CLI and MCP server are free with no signup, and the AI features run on
> your own OpenAI/Anthropic key. Happy to answer anything about
> the GEO checks, the CI setup, or why we think "AI SEO" dashboards are
> solving the wrong problem for developers.

## Topics/tags to select
`Developer Tools`, `SEO`, `Artificial Intelligence`, `GitHub`, `Marketing`

## Timing note
Product Hunt launches perform best posted 12:01am PT on a Tuesday, Thursday.
MCP directory listings are already live. Blocker as of 2026-10-02: no
Product Hunt account exists yet (see `accounts.md`); a brand-new account
launching on day one gets little reach, so create it a few days ahead.
