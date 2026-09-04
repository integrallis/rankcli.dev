# Launch announcement (blog post / rankcli.dev/blog)

Draft — not published. Intended for `rankcli.dev/blog` and to link from the
Product Hunt post, MCP directory listings, and social posts.

---

## Shift GEO Left

**RankCLI is launching with a different bet than every other "AI SEO"
tool: the fix belongs in a pull request, not a dashboard.**

Every AI-search-visibility tool we looked at — Profound, Otterly, Peec,
Scrunch, AthenaHQ — is the same product: a monitoring dashboard, built for
marketing teams, priced $29 to $2,000+/mo, that tells you whether ChatGPT
or Perplexity mentioned your brand. None of them run in CI. None of them
open a PR when they find something fixable. None of them are built for the
person who can actually ship the fix.

We think that's backwards. If your site is invisible to GPTBot or
ClaudeBot, or your structured data is broken, or Cloudflare just started
blocking AI crawlers by default on your zone (it did, September 15, 2026,
for "mixed-use" bots on ad-hosting pages) — that's an engineering problem
with an engineering fix, and it belongs next to your linter and your test
suite, not in a Slack alert someone dismisses.

### What "cited, not crawled" means

Google's own data is blunt about this: organic click-through on AI
Overview queries has fallen from roughly 1.8% to under 1% since mid-2024.
But brands that are actually **cited** in an AI answer get 35% more
organic clicks and 91% more paid clicks than brands that aren't — even
when both show up in the underlying search results. Getting crawled isn't
the win. Getting cited is. That's the number RankCLI's GEO checks are
built around, not vague "AI SEO" branding.

### What's actually free

The MCP server (`npx @rankcli/mcp-server`) is genuinely free — no signup,
no API key, nothing sent to our servers. It runs 13 tools locally inside
whatever AI coding assistant you're already using: full SEO audits, GEO
/AI-crawler-access checks, Core Web Vitals estimates, structured data
validation, security header grading. If you just want to know whether your
site is broken for AI search, that's the whole answer, for $0, forever.

### What's paid, and why

CI scheduling, auto-fix pull requests, hosted GEO tracking without needing
your own API key, and multi-site/team management — the parts that actually
require infrastructure on our end, not the audit itself. Every SEO-MCP
tool we found is already free or open-source at the audit layer; charging
for that would be charging for something that's already commoditized. We
charge for the automation layer instead.

### Founding pricing

The first 100 Pro subscribers get $19/mo instead of $29/mo, locked in for
as long as they stay subscribed. After that, full price. [See pricing →]

### We're dogfooding this in public

rankcli.dev currently scores 60/100 in its own audit, with 70 open issues.
We're not hiding that — it's the same tool, the same checks, the same
weekly CI run that would fire against your site.

[Try the free audit →] [Add the MCP server →] [See pricing →]
