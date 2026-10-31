# Verified numbers

Every claim in the launch copy that cites a number should cite one from here, and every file
that does says so at the top. The dogfood score moves every week, so copy written against it
goes stale silently, three separate drafts were carrying 60/100, 84/100 and 88/100
simultaneously, and one Reddit ad was built on a 1% AI Readiness that turned out to be a bug in
our own scoring.

## Scope changes the number. Always cite the homepage figure.

Three different true numbers exist for rankcli.dev at the same moment, and mixing them looks
like a regression when nothing has changed:

| Measurement | Score | What it is |
|---|---|---|
| `--max-pages 1` | **90** on `@rankcli/cli@0.0.52` and 0.0.51 (85 on 0.0.50 until 2026-10-29; 80 on 0.0.49; 75 until 2026-10-14) | The homepage. **This is the number all launch copy cites.** |
| default crawl (5 pages) | 72 before 2026-10-14; 8 pages score 80 after | Averages in weaker inner pages |
| SEO gate CI run | 81 (last checked 2026-10-02) | The published Action's own scope |

**Re-verified 2026-10-30 on the published `@rankcli/cli@0.0.52`, from an empty directory:
homepage 90/100, 0 errors, 2 warnings, 31 notices, AI Readiness 89, React; 310 checks run, 308
passed.** 0.0.52 changed what ships (the 21 formerly encrypted checks run in the CLI, the MCP
server and the Action alike; the JSON report gained timestamp, cliVersion, checksRun,
checksPassed and pages), not the score.

**Re-verified 2026-10-29 on the published `@rankcli/cli@0.0.51`, from an empty directory:
homepage 90/100, 0 errors, 2 warnings, 31 notices, AI Readiness 89**, React. The move from 85
is the checker's, not the site's: 0.0.51 reports one finding per condition (the same missing
thing was counted under two to six codes), retires checks that fired on every site (AMP, "no
YouTube channel", "content-to-authority imbalance", the colour-contrast disclaimer) and
downgrades heuristic composites to notices. `rankcli fix` and `rankcli apply` print the same 90;
before 0.0.51 they printed 100 and 93 for the same URL. The 5-page crawl is not re-measured.

Before that, 2026-10-14 on `@rankcli/cli@0.0.50`: homepage 85/100, 0 errors, 13 warnings, 37
notices, AI Readiness 67, React. The six warnings that left between 0.0.49 and 0.0.50 were the
checker's own false positives (GA4, GTM and Search Console verification, empty anchor, brand
definition, two YMYL), not site changes. On 0.0.49 the same day, after the site fixes: 80/100, 0
errors, 19 warnings, 37 notices. The 8-page crawl scores 80
as well (security 75 to 95, performance 36 to 60, social 90 to 96). The ad creatives recorded on
2026-09-28 still show 75/100; they are not wrong about the day they were made, but new copy
should cite 80 and re-check before posting.

Before that (2026-10-02 and 2026-09-30, same CLI): homepage **75/100, 0 errors, 22 warnings,
43 notices, AI Readiness 67**.

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

**Do not cite the docs.astro.build 57.** Its root answers HTTP 200 with an 80-byte
`<meta http-equiv="refresh">` stub, and every CLI before 0.0.51 scored the stub (seven errors:
no title, no H1, no viewport, no content). 0.0.51 follows the refresh and scores the real page
**78 (AI 85), 0 errors, Astro detected** (2026-10-29). The stripe, vercel and cloudflare figures
are from 0.0.46 and have not been re-run on 0.0.51; re-run before using them.

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
silently. The score cannot be asserted, it changes when the site does.

## Refresh before posting

```bash
npx @rankcli/cli@latest audit -u https://rankcli.dev --max-pages 1
```

If the number moved, update this file first, then the copy that cites it. A stale figure in a
Reddit or HN post gets found in the comments, and being corrected on your own headline stat is
worse than not posting.
