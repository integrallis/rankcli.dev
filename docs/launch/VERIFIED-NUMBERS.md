# Verified numbers

Every claim in the launch copy that cites a number should cite one from here, and every file
that does says so at the top. The dogfood score moves every week, so copy written against it
goes stale silently — three separate drafts were carrying 60/100, 84/100 and 88/100
simultaneously, and one Reddit ad was built on a 1% AI Readiness that turned out to be a bug in
our own scoring.

## As of 2026-09-27, `@rankcli/cli@0.0.46`, `rankcli.dev` homepage

| | |
|---|---|
| Overall score | **75/100** |
| Errors | **0** |
| Warnings / notices | 22 / 42 (64 issues) |
| AI Readiness | **67** |
| Framework detected | React |

Other sites, same run, for comparison claims: stripe.com 70 (AI 71), vercel.com 67 (AI 69),
cloudflare.com 68 (AI 63), docs.astro.build 57 (AI 52).

## Product facts that do not move weekly

| | |
|---|---|
| Checks | 280+ |
| Frameworks detected | 32 |
| Frameworks with fix recipes | 11 |
| MCP tools | 15 |
| Detection accuracy | 94% on a 51-site corpus (57% before v0.0.44) |

Counts for frameworks and MCP tools are asserted against the source by
`packages/saas/src/test/frameworks.test.ts` and `mcp-tools.test.ts`, so they cannot drift
silently. The score cannot be asserted — it changes when the site does.

## Refresh before posting

```bash
npx @rankcli/cli@latest audit -u https://rankcli.dev --max-pages 1
```

If the number moved, update this file first, then the copy that cites it. A stale figure in a
Reddit or HN post gets found in the comments, and being corrected on your own headline stat is
worse than not posting.
