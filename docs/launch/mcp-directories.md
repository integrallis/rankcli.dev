# MCP directory submissions

Draft listing copy for the four directories identified in the market
research as real, free top-of-funnel distribution (combined reach:
~57,000 listed servers across them). Nothing has been submitted — these
are ready to paste in.

Submit the **local, free `@rankcli/mcp-server`** package (`npx
@rankcli/mcp-server`), not the hosted/API-key-gated endpoint — it's the
zero-signup, zero-cost option that actually competes on these directories'
own terms (several competing SEO-MCP listings are explicitly free/OSS).

## Common fields (same across all four)

**Name:** RankCLI

**One-line description:**
Free SEO + GEO (AI-search-citation) analysis — 15 tools, no signup, no API
key, runs entirely local against HTML you provide.

**Install:**
```json
{
  "mcpServers": {
    "rankcli": {
      "command": "npx",
      "args": ["@rankcli/mcp-server"]
    }
  }
}
```

**Category:** SEO / Web Development / Content Analysis

**Repository:** https://github.com/integrallis/rankcli-mcp-server — a new,
public, standalone repo (the monorepo `integrallis/rankcli.dev` stays
private). Extracted, installed, and built from the real published npm
packages as a live check before pushing — this is a genuine working repo,
not just copied files.

**Website:** https://rankcli.dev

## Anthropic's official MCP directory
Submit via: https://github.com/modelcontextprotocol/servers (community
servers list) or the in-product directory submission flow, whichever is
current when you launch — confirm the process hasn't changed.

Description (longer form allowed):
> RankCLI exposes 13 SEO and GEO (Generative Engine Optimization) analysis
> tools: full SEO audits, AI-crawler-access checks (GPTBot, ClaudeBot,
> PerplexityBot), Core Web Vitals estimation, structured data validation,
> security header grading, image/mobile/internal-linking analysis, and
> schema/robots.txt generators. Everything runs locally against HTML your
> agent already has or fetches — no account, no API key, nothing sent to
> our servers.

## Glama (glama.ai) — quality-scored, ~37k servers
Glama scores listings on documentation quality and safety — make sure the
README (`packages/mcp-server/README.md`, already updated this session) is
what gets indexed; it now leads with "free, local, no signup" rather than
the old deprecation notice.

## Smithery (smithery.ai) — largest breadth-first catalog, ~3.3k servers
Smithery supports one-click install configs — use the same JSON block
above.

## mcp.so — ~17k servers
Straightforward listing form; use the common fields above verbatim.

## After submitting
Directory approval/indexing can take anywhere from instant to a few days
depending on the platform. None of this requires deploying anything —
`@rankcli/mcp-server` is already published to npm and works today.
