# Launch kit - September 2026

> Numbers in this file come from [VERIFIED-NUMBERS.md](./VERIFIED-NUMBERS.md). Re-check before posting.

Ready-to-post copy for the launch, written against the product as it is on 2026-09-19. Every claim below was checked that day; see "Proof points". It supersedes the drafts in `social.md`, which quote an old 60/100 score, 13 MCP tools and the old pricing.

## Positioning (one line)

**ESLint for SEO and AI search.** A free CLI, GitHub Action and MCP server that audit a site with 280+ checks, fail the build when SEO regresses, and run AI analysis on your own model (on-device Apple Intelligence on a Mac). The hosted dashboard adds monitoring, history and auto-fix PRs.

## Proof points (verified 2026-09-19)

- `npx @rankcli/cli audit --url <site>` runs the full engine locally, free, no account. On a test page it reported 86 issues, 28 of them from the premium AI-search checks (citation-worthiness, answer structure, E-E-A-T, entities).
- CI gates: `--fail-on error|warning|notice`, `--min-score N`. Exit codes 0 pass / 1 gate failed / 2 bad invocation / 3 site unreachable or erroring, so a down site never passes.
- `uses: integrallis/rankcli-action@v1` is public and open source. rankcli.dev gates itself with it: 75/100, 0 errors on 2026-09-27 (`.github/workflows/seo-gate.yml`). **Before posting, re-check the score** (VERIFIED-NUMBERS.md, or Actions -> SEO gate).
- AI analysis never goes through RankCLI. It picks Apple Intelligence on-device on a Mac that has it, else your key (OpenRouter first; OpenAI, Anthropic, Groq, Gemini, DeepSeek and more), else a local Ollama or LM Studio.
- `npx @rankcli/mcp-server`: 15 tools, local, no signup. Listed on Smithery, Glama, mcp.so, cursor.directory and awesome-mcp-servers.
- Hosted: sign-up to first completed audit took under a minute in the end-to-end test.
  - **Free:** 1 site audited weekly, history, weekly email, README badge, 3 auto-fix PRs a month.
  - **Solo** $9/mo, **Pro** $29/mo ($19 for the first 100 customers), **Agency** $99/mo.

## Before posting

1. Turn on Cloudflare Web Analytics (FOUNDER_CHECKLIST.md step 2), or there is no way to see what the launch did.
2. List the Action on the GitHub Marketplace (step 3). Visitors from a dev launch look for it there.
3. Use one link per channel, so referrers separate cleanly: `https://rankcli.dev/?ref=hn`, `?ref=reddit`, `?ref=devto`, `?ref=ph`, `?ref=li`, `?ref=bsky`.

## Sequence

| When | Channel | Who posts |
|---|---|---|
| Any Saturday | r/webdev "Showoff Saturday" (Saturdays only) | Brian (or u/rankcli once registered) |
| Tue-Thu, 8-10am ET | Show HN, then stay 2-3 hours to answer | Brian (HN account `integrallis`) |
| Same day, after HN | LinkedIn, Bluesky, X | Brian / brand accounts |
| Next day | r/SideProject, Dev.to article | Brian |
| A week later | Product Hunt (12:01am PT, Tue-Thu) | Brian |
| Ongoing | The groups in `facebook-groups.md`, one or two a week, each with its own rules | Brian |

## Show HN

**Title** (80-char limit): `Show HN: RankCLI, an ESLint for SEO and AI search with a CI gate and MCP server`

**URL:** `https://rankcli.dev/?ref=hn`

**Text:**

> I kept shipping sites where SEO broke quietly: a noindex left on after a preview, a canonical pointing at staging, a page that started returning 500 after a deploy. SEO tools are dashboards someone checks once a quarter; I wanted a failing check in CI, like a linter.
>
> RankCLI is that: `npx @rankcli/cli audit --url https://yoursite.com` runs 280+ checks locally (crawlability, indexability, on-page, structured data, Core Web Vitals heuristics, security headers, and "GEO" checks - whether AI crawlers can reach you and whether an AI answer could quote you). `--fail-on error` or `--min-score 80` turn it into a CI gate; a site that is down or answers 5xx exits non-zero instead of scoring well. There's a GitHub Action (`integrallis/rankcli-action@v1`) that does the same and comments on the PR; our own site gates itself with it.
>
> AI analysis is optional and runs on your model, never ours: on a Mac with Apple Intelligence it uses the on-device model (a small Swift helper compiled on first use), otherwise a local Ollama/LM Studio or your own OpenRouter/OpenAI key. There's also a local MCP server (`npx @rankcli/mcp-server`) so Claude Code or Cursor can run the checks.
>
> The CLI, Action and MCP server are free. The hosted part (rankcli.dev) is scheduled audits, history, alerts and auto-fix PRs via a GitHub App, with a free tier. I'd love feedback on the checks that are wrong or noisy for your site.

**First comment (post right after):** the technical notes HN likes. The audit engine runs in worker threads on the hosted side. The hardest bug was request timeouts that ended at the response headers, so a slow sitemap body could hang an audit forever. And the Apple Intelligence path: Foundation Models is Swift-only, so the CLI compiles a ~60-line helper with the Xcode command-line tools and caches it.

## Reddit

**r/webdev - Showoff Saturday** (self-promotion is allowed only on Saturdays, with the "Showoff Saturday" flair; check the sidebar the day you post):

- Title: `I built "ESLint for SEO": a CLI + GitHub Action that fails your build when SEO regresses`
- Body: the first two paragraphs of the Show HN text, then "Free, no signup: `npx @rankcli/cli audit --url yoursite.com`. Happy to hear which checks are noisy." Link `https://rankcli.dev/?ref=reddit`.

**r/SideProject:**

- Title: `RankCLI: SEO + AI-search audits in your terminal and CI (free CLI, on-device AI on Macs)`
- Body: what it does in 3 bullets; the dogfood number (75/100 via our own Action); what's free vs paid, plainly; ask for feedback.

**r/SEO:** self-promotion is heavily restricted. Answer questions where a CI check genuinely helps; don't post a launch.

**r/ClaudeAI, r/cursor:** only as a genuinely useful MCP server post ("a free local MCP server for SEO/GEO audits"), and only where that subreddit's rules allow tools. Check the sidebar first.

## Product Hunt

- **Name:** RankCLI
- **Tagline** (60 chars): `ESLint for SEO & AI search - in your terminal and CI`
- **Description** (260 chars): `Audit any site with 280+ SEO and AI-search checks from the command line, fail CI when SEO regresses, and let Claude or Cursor run the checks via MCP. AI analysis runs on your own model - on-device Apple Intelligence on a Mac. Free CLI; hosted monitoring from $0.`
- **Topics:** Developer Tools, SEO, GitHub, Artificial Intelligence
- **First comment:** the Show HN story in three sentences, plus the founding offer ($19/mo Pro for the first 100).
- **Gallery:** (1) terminal audit output; (2) the PR comment from the Action; (3) the project dashboard; (4) MCP in Claude/Cursor; (5) the AI-crawler table from `seo_geo_check`.

## LinkedIn (Brian)

> SEO usually breaks quietly: a noindex that survives a preview deploy, a canonical pointing at staging, a page that starts returning 500s. By the time someone opens a dashboard, it has cost weeks of traffic.
>
> We built RankCLI to treat SEO like linting. It runs 280+ checks from the command line or a GitHub Action, fails the build when something regresses, and covers the new part too: whether AI crawlers can reach your site and whether an AI answer could quote it.
>
> It's developer-first: the CLI, the GitHub Action and a local MCP server for Claude/Cursor are free, and AI analysis runs on your own model - on-device Apple Intelligence if you're on a Mac. Our own site gates itself with it (75/100 today).
>
> rankcli.dev/?ref=li

## Bluesky / X thread

1. `SEO breaks quietly. We built RankCLI so it fails your build instead: 280+ SEO and AI-search checks from the CLI or a GitHub Action. Free: npx @rankcli/cli audit --url yoursite.com 🧵`
2. `CI gate: --fail-on error or --min-score 80. A site that's down or answering 5xx exits non-zero - it never "passes". Our own site gates itself with the public Action: 75/100 today.`
3. `AI analysis runs on your model, never ours. On a Mac with Apple Intelligence it's on-device and free. Otherwise Ollama, LM Studio, or your OpenRouter/OpenAI key.`
4. `Using Claude Code or Cursor? npx @rankcli/mcp-server gives them 15 SEO/GEO tools, locally, no signup.`
5. `Hosted monitoring, history and auto-fix PRs have a free tier. rankcli.dev/?ref=bsky`

## Dev.to article (update the saved draft)

Title: `Your SEO should fail the build: SEO and AI-search checks in CI`. Tags: `seo`, `webdev`, `githubactions`, `ai`. Structure:

1. The failure mode: a real noindex/canonical/500 story.
2. `npx @rankcli/cli audit` output, and what the checks cover (including GEO: AI crawler access, quotable answers).
3. Gating CI: the Action YAML and `--fail-on` / `--min-score`; the exit codes.
4. AI analysis on your own model, including Apple Intelligence on-device.
5. MCP: the same checks from Claude Code or Cursor.
6. What's free, what's hosted.
