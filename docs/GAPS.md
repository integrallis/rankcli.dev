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
| **Gap 2 — billing and tiers**: one tier resolver (TS, Node, SQL), lifetime-deal entitlement, webhook retries + plan-follows-price, founding cap, LTD sign-in + reservation release, site-limit trigger, Stripe events updated in place. Verified: 0 stranded subscriptions, tiers resolve (3 free / 2 Pro / 1 Solo), checkout 401s without auth | merge `6ca240e`, `4748f34`, `0419913` |

## Open, in order

1. **Security** (agent branch): GitHub App link lock, caller auth on run-audit/local-seo/sync-*, RLS on visibility tables, SECURITY DEFINER grants, mcp-connect approve step, email relay, webhook signing, SSRF in hosted fetches. — in progress
2. ~~Billing and tiers~~ — closed (see above).
3. **CLI / CI product** (agent branch): `--fail-on` / `--min-score` exit codes, honest scoring (fetch failure, 5xx, noindex), API-key plan in CI, generated workflow, GitHub Action inputs/create-pr, local and cheap inference in the CLI, plugins, CI jobs, Node compatibility. — in progress
4. **Site SEO and frontend** (agent branch): prerendering, per-route SEO, real 404, fake testimonials, pricing copy, sitemap/robots, bundle size, analytics snippet, account-page bugs, agency gating. — in progress
5. **Slack / Discord alerts are never sent.** Pro advertises them; nothing reads `alert_configs`. — open
6a. **Decisions carried into pricing (6)**: the per-plan audit schedule cap has never run (ambiguous SQL overloads) and would limit Solo to one manual deep audit a week if enabled; create-seo-pr has no plan gate (free/Solo can open auto-fix PRs); free users have no domain limit window.
6b. **create-checkout allows a second subscription** for a user who already has one. — open
6c. **CLI plan lookup** (`cli/src/commands/auth.ts:304`) reads the raw plan id — part of 3. **AccountPage sites meter** shows 1 for annual/LTD — part of 4.
6. **Pricing shape** (approved): richer Free, Solo gets auto-fix PRs + alerts, founding offer without the 90-day clock, lifetime deals pulled, annual = 2 months free, Agency +$2/site over 50. Only features that work get advertised. — open (after 2, 4, 5)
7. **Rank-tracking cost cap**: Agency's "unlimited" keywords has no ceiling on Serper spend. — open
8. **Edge functions are never type-checked** (no deno anywhere): add `deno check` to CI. — open
9. **CLI release v0.0.30** with gap 3's fixes; MCP Registry listing still on 0.0.7. — open (after 3)
10. **Dead code**: root `supabase/` legacy schema, functions with no callers, the worker keyword path. — open
11. **Deep audit via start-deep-audit** not yet exercised with a paid account. — open
12. **GitHub Action publishing** needs a public repo. — needs founder (after 3)
13. **Premium checks model** (WASM copy bug vs. extractable premium code). — needs founder
14. **Analytics token**: Cloudflare Web Analytics beacon token. — needs founder (after 4)
