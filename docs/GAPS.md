# Gap tracker

Every known gap, closed one at a time. A gap is closed only when it is fixed, tested, deployed,
and verified in production. Sources: docs/AUDIT_2026-09-18.md and docs/PRICING_ANALYSIS_2026-09.md.

Status: `open` · `in progress` · `closed` (with commit) · `needs founder` (blocked on a decision or an account only you hold)

## Closed 2026-09-18

| Gap | Commit |
|---|---|
| Users could self-upgrade via RLS; checkout trusted the client's price | `5fdd756` |
| create-seo-pr had no caller auth | `9b147a6` |
| vsce would have packaged the repo `.env` | `8feef9a` |
| Fake rating, nonexistent trial, wrong llms.txt prices | `218021f` |
| GPT-5.6 rejected temperature / max_tokens (ChatGPT checks silently "not mentioned") | `c9cfea6` |
| Worker secret shipped in the frontend bundle; now rotated, old value returns 401 | `fd784dd` + rotation |
| AI features ran on RankCLI's keys; now users' own keys (per provider) | `fd784dd` |
| Public email signups never received a confirmation email | `configure-auth-smtp.yml` run |
| Progress streams hung when they hit another worker machine | `79712e9` |
| OpenRouter default model withdrawn; OpenRouter is now the primary bridge | `79712e9` |
| Visibility question named the brand, so every site scored as visible | `c114a77` |
| Cheap inference providers as first-class keys | `78a56a0` |
| **Gap 5 — Slack/Discord alerts**: project-alerts fires on failed audits, score drops past a threshold, auto-fix PRs and weekly reports (Solo and up), called by the worker, run-audit, create-seo-pr and send-weekly-report; webhook hosts allowlisted, Slack text escaped, Discord mentions off; "Send test" goes through the server (Slack blocks browser posts). Also fixed: weekly emails always said 0 issues. Verified in production: the worker credential reaches project-alerts and a real audit evaluates correctly; anonymous/unauthenticated calls 401. First real webhook delivery happens when a user saves one | `3d07abc`, `6b81f86` |
| **Gap 4 — site SEO and frontend**: prerendered public pages (19 + 404.html) with per-route head, real 404s, app routes as a noindex shell, generated sitemap, robots.txt bot groups fixed, invented testimonials removed, pricing copy from the config (annual 33%), main chunk 1,723 kB → 268 kB, Cloudflare Web Analytics wiring, profile save / sites meter / login ?redirect= / missing assets, Agency UI gate. Verified live as GPTBot: every public page 200 with its own title/canonical and real content (home 1,828 words), unknown URL 404 noindex, OAuth handoff + /auth/callback + signed-out /dashboard redirect all work | merge `12a5d98` |
| **Gap 9 — release v0.0.30**: `@rankcli/cli@0.0.30`, `agent-runtime@0.0.21`, `mcp-server@0.0.9` on npm; native release built; MCP Registry now lists 0.0.9 (the registry step waits for npm). Verified: `npx @rankcli/cli@0.0.30` on a clean cache exits 3 / score 0 on a 404 page, and a `--fail-on error` gate passes on example.com | release `v0.0.30` |
| **Gap 3 — CLI / CI product**: `--fail-on` / `--min-score` exit codes (1 gate, 2 bad invocation, 3 no real audit), fetch failures and 4xx/5xx score 0, X-Robots-Tag noindex, API-key plan in CI, generated workflow fixed, Action gate honest (create-pr removed), local + cheap inference in the CLI, mcp-server robots/SSRF option, plugin fixes, CI jobs (agent-runtime CI green for the first time since Sept 5), Node 20.19/22.12 launcher; hosted provider defaults aligned (deepseek-chat was retired). Verified: CLI exits 3/1/0/2 on real targets; live free audit scores a 404 and an unreachable host 0 | merge + `0319368` |
| **Gap 1 — security**: GitHub link lock, caller auth on run-audit/local-seo/sync-*, RLS on the visibility tables and free_audits, SECURITY DEFINER lockdown, mcp-connect approve step with a user code, email relay closed, webhooks fail closed, GSC state signed, SSRF guards (worker process-wide after DNS; edge guarded fetch). Verified in production: free audit works, metadata/localhost refused, visibility tool asks all 4, every open function now 401s, tables/RPCs deny anon, unsigned GitHub webhook 401, connect page no longer auto-approves | merge `f2d0907` |
| **Gap 2 — billing and tiers**: one tier resolver (TS, Node, SQL), lifetime-deal entitlement, webhook retries + plan-follows-price, founding cap, LTD sign-in + reservation release, site-limit trigger, Stripe events updated in place. Verified: 0 stranded subscriptions, tiers resolve (3 free / 2 Pro / 1 Solo), checkout 401s without auth | merge `6ca240e`, `4748f34`, `0419913` |

## Open, in order

1. ~~Security~~ — closed (see above).
2. ~~Billing and tiers~~ — closed (see above).
3. ~~CLI / CI product~~ — closed (see above); reaches npm users with 9.
4. ~~Site SEO and frontend~~ — closed (see above).
4a. **Agency features server-side**: widget-data doesn't return `whiteLabel` (every widget shows the credit); widget_tokens, client_links, client-report and generate-pdf-report's white-label have no plan check. — open
4b. **Check counts disagree in code**: free-audit runs 280 while the config says 50; start-deep-audit runs free accounts at 50 (fewer than anonymous visitors); the engine hardcodes "310". — open
4c. **Links that now 404** — closed: `/bot` exists (what the crawler UA's requests are, user agents, volume, contact); the CLI links to `/docs#getting-started` and `/account?tab=notifications` and says `rankcli login` (there is no `auth login`); audit emails link to `/dashboard/projects/<id>`. The legacy redirects stay for old CLI versions. Also: the CLI no longer reads `VITE_SUPABASE_*` (a CI job building a Vite + Supabase app pointed RankCLI's login and key checks at the user's own project), and agent-runtime's leftover "SEO Autopilot" strings are RankCLI (one was written into users' HTML by the OG-tag fixer).
4d. **ci-saas.yml / deploy-saas.yml builds skip prerendering** (no Chromium); harmless while deploy-saas doesn't deploy the frontend. — open
5. ~~Slack / Discord alerts~~ — closed (see above).
6a. **Decisions carried into pricing (6)**: the per-plan audit schedule cap has never run (ambiguous SQL overloads) and would limit Solo to one manual deep audit a week if enabled; create-seo-pr has no plan gate (free/Solo can open auto-fix PRs); free users have no domain limit window.
6b. **create-checkout allows a second subscription** — closed: a customer with a live Stripe subscription is never sent to a second checkout; picking another plan switches the one they have (confirm dialog, prorated invoice now, a declined card leaves it unchanged; the webhook's plan-follows-price updates the row). Paid users can now change plans at all - the Stripe portal has plan switching off, and the Account page only showed plans to Free users. Verified against Stripe test mode.
6c. **CLI plan lookup** (`cli/src/commands/auth.ts:304`) reads the raw plan id — part of 3. **AccountPage sites meter** shows 1 for annual/LTD — part of 4.
6. **Pricing shape** (approved) — in progress: richer Free, Solo gets auto-fix PRs + alerts, founding offer without the 90-day clock, lifetime deals pulled, annual = 2 months free, Agency +$2/site over 50. Only features that work get advertised. — open (after 2, 4, 5)
7. **Rank-tracking cost cap** — closed: no hosted path spends Serper today. Rank tracking runs only in the CLI on the user's own `SERPER_API_KEY`; the worker's keyword research (up to ~15 Brave/Serper searches a run) is off unless `USE_WORKER_FOR_KEYWORDS` is set, and `/competitive-search` is secret-gated debug. The pricing no longer sells unlimited keywords. If the worker path is turned on, ai-keywords now allows 10 worker runs per user a day, then falls back to the edge path (no searches).
8. **Edge functions are never type-checked** — closed: `packages/saas/scripts/check-functions.sh` runs `deno check` over all 40 functions and `_shared`; it gates the function deploys in deploy.yml and deploy-saas.yml and runs on SaaS PRs. The 69 existing errors are fixed, including one real bug: with AI fix prioritization, create-seo-pr put the non-fixable issues back into the PR.
9. ~~CLI release v0.0.30~~ — closed (see above).
10. **Dead code**: root `supabase/` legacy schema, functions with no callers, the worker keyword path. — open
11. **Deep audit via start-deep-audit** not yet exercised with a paid account. — open
11b. **Worker type errors**: `tier` passed to AuditOptions (no such field), the domain-limit query's embed typing. — closed with the worker-thread change (`tsc --noEmit` clean).
11c. **create-checkout / create-portal 500 without auth** — closed `0419913`.
12. **GitHub Action publishing** needs a public repo. — needs founder (after 3)
12b. **GitHub repo linking for email/Google sign-ups**: linking now proves write access on GitHub. Users with no GitHub identity can link only after enabling "Request user authorization (OAuth) during installation" on the GitHub App and adding `GITHUB_APP_CLIENT_ID` / `GITHUB_APP_CLIENT_SECRET` as Supabase secrets - or by signing in with GitHub once. — needs founder
13. **Premium checks model** (WASM copy bug vs. extractable premium code). — needs founder
14. **Analytics token**: set repo variable `CF_BEACON_TOKEN` (Cloudflare → Web Analytics → Add site → manual JS snippet), then redeploy the frontend. Don't also enable Pages' automatic analytics (double counting). — needs founder
