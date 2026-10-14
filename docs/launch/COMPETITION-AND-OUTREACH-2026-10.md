# What the competition does that we do not, and the outreach plan

**Verified: 2026-10-13.** Sources: three research passes on 2026-10-13 (GEO vendors, developer
SEO tooling, indie SEO SaaS case studies), the GitHub and npm APIs, HN Algolia, and the
production diagnostics run. Every number has a source in the sections below; "spec." marks an
inference. The measured state of our own channels is in
[ACTIVITY-LOG.md](./ACTIVITY-LOG.md#status-on-2026-10-13-measured-not-remembered).

## The one-paragraph version

17 accounts, 7 of them in the week of Oct 5 and none since. The launch never reached anyone:
the Show HN was killed on arrival (new account), both Reddit posts were removed or filtered,
Bluesky has 2 followers, and the Action is not on the GitHub Marketplace. Meanwhile the premise
in `docs/COMPETITOR_RESEARCH_SYNTHESIS.md` ("ZERO competitors offer CLI-first tools") stopped
being true in 2026: squirrelscan, GeoReady, Crawlie, geo-score and Ryze all ship an MIT CLI with
an Action and an MCP server, and they get installed through agent-skill directories, plugin
marketplaces, framework integration directories and the GitHub Marketplace. We are in none of
those. The fixes are mostly listings and clicks, not code; the one strategic decision is whether
the CLI stays closed in a category where every 2026 rival is open.

## 1. Tactics the competition uses that we do not

| # | Tactic | Who does it (evidence) | RankCLI today | Action |
|---|---|---|---|---|
| 1 | **Agent-skill directories** (`npx skills add`, skills.sh, Claude plugin marketplaces) | A single `seo-audit` skill has **226.7K installs** on skills.sh ([skills.sh](https://www.skills.sh/)); Ryze's open-seo-mcp-skills has 5.2k stars in 6 weeks ([repo](https://github.com/Ryze-AI-Adgent/open-seo-mcp-skills)); squirrelscan and geo-score ship a skill | None | **Done today**: two skills and a Claude Code plugin in a PR on `rankcli-mcp-server` (see §4). Merge, then submit the plugin to Anthropic's directory |
| 2 | **GitHub Marketplace listing** for the Action | 42 "seo" Actions listed; GeoReady's has SARIF output ([marketplace](https://github.com/marketplace?type=actions&query=seo)) | **Not listed.** Both slug guesses 404 | Founder: release v1.0.0 -> Edit -> "Publish this Action to the GitHub Marketplace" |
| 3 | **Framework integration directories** | Astro auto-lists any npm package with the `astro-integration` keyword ([docs](https://docs.astro.build/en/guides/publish-to-npm/)); audit-type Astro integrations pull 4K+/mo; Nuxt modules are one PR to nuxt/modules; Netlify's Lighthouse plugin: 125K/mo | **`astro-rankcli`, `vite-plugin-rankcli`, `next-rankcli` are built in this repo, tested (Astro: 32 tests), keyworded, and never published** | Founder: publish `astro-rankcli` first (needs a Trusted Publishing link on npm or `NPM_TOKEN`); then Vite and Next; then a Nuxt module |
| 4 | **Open-source CLI as the top of the funnel** | Every direct rival launched in 2026 is MIT/Apache: squirrelscan ([site](https://squirrelscan.com/)), GeoReady 1.1k stars / 11.6k dl/mo ([site](https://geoready.dev/)), Crawlie, geo-score, iannuttall/seo. HN threads ask "is it open source?" ([example](https://news.ycombinator.com/item?id=48844813)). No closed-CLI SEO tool with adoption was found | CLI source private; premium checks already ship as encrypted WASM | Founder decision, see §3 |
| 5 | **No-login free checker promoted by third-party roundups** | Semrush, Ahrefs, Promptwatch, Profound, Otterly, Am I Cited, GeoReady all run one and get linked from "best AI visibility tools" listicles | We have three (`/free-audit`, `/tools/ai-visibility`, `/tools/chatgpt-checker`); nobody links them | Pitch the tools, not the product, to the listicle authors (§5.9) |
| 6 | **Data studies from own telemetry** | Peec: 20M fan-outs; Profound citation studies; Otterly weekly experiments; AthenaHQ State of AI Search; GeoReady's 1,700-site benchmark. Press (SEJ) picks these up | None. We run 280 checks on every audit and the framework detector has a 51-site corpus | One study: "AI crawler access across N developer-tool sites" or "what 1,000 Next.js sites get wrong". Cheap to produce, the only content type that earns links |
| 7 | **"X vs Y" and "X alternative" pages** | Peec vs Profound, Promptwatch vs Scrunch, Ahrefs vs Profound, GeoReady "Profound alternative"; comparison keywords convert at 8.4% ([Grow & Convert](https://www.growandconvert.com/conversion-rate-optimization/average-seo-conversion-rate/)) | None | RankCLI vs Lighthouse CI, vs squirrelscan, vs GeoReady, "Screaming Frog alternative for developers". Months to rank; start now |
| 8 | **Affiliate / partner programs** | Otterly 20% x 12 months, Rankscale 10% via Rewardful, Profound partner directory | None | Only once Agency ($99) sells; 25% of $9 is nobody's motivation |
| 9 | **Founder as a recurring voice** (podcasts, talks, own webinars, X audience) | Otterly's founder on BrightonSEO and three podcasts; iannuttall's 36K X followers -> 572 stars in 3 months; Journalist AI's YouTube -> $70K MRR | No X account, no video, no talks | One demo video; pitch two podcasts; an X account is the cheapest of these |
| 10 | **Show HN with a no-signup demo and a public repo** | DevUtils ~100 orders from a front-page day; Plausible 166 trials in a week. Show HN median is 2 points; "SEO" in the title has not cleared 36 points since Jan 2025 ([Algolia](https://hn.algolia.com/api/v1/search?query=SEO&tags=show_hn&numericFilters=created_at_i%3E1735689600)) | Dead post from a 3-week-old account | Resubmit from the aged account with the linter framing (§6.1), after the repo question |
| 11 | **Newsletters, editorial** | Console.dev is editorial and free to pitch; 68% of readers have signed up to a featured tool ([console.dev](https://console.dev/advertise)); TLDR is $3,500/issue | Nothing pitched | Pitch Console.dev and JavaScript Weekly with the Action, not the SaaS |
| 12 | **Someone else's marketplace** | Otterly in the Semrush App Center; Ryze and GEOly in the Claude and Codex plugin marketplaces | MCP directories only (185 dl/wk, measured low-yield) | Covered by 1, 2 and 3 |

Things we do that the evidence says to stop: templated weekly status posts to 2 Bluesky
followers (archiving, not promotion), and submitting to more MCP directories.

## 2. The direct rivals (as of 2026-10-13)

| Product | Launched | License | Surfaces | Price | Traction |
|---|---|---|---|---|---|
| [squirrelscan](https://squirrelscan.com/) | Jan 2026 | MIT CLI, paid cloud | CLI (`--offline` free), Marketplace Action, MCP, skill, setup pages for 10 agents | Free / $19 / $29 per seat | 274 stars, 6.3K npm/mo |
| [GeoReady](https://geoready.dev/) (geo-optimizer-skill) | Feb 2026 | MIT | CLI (pip), MCP (12 tools), Marketplace Action with SARIF and min-score, README badge, benchmark of 1,700 sites | Free / $19 / $49 / $89, "founding price locked for life" | 1.1k stars, 85 releases, 11.6k dl/mo |
| [Crawlie](https://github.com/spronta/crawlie) | Jun 2026 | OSS | npm CLI, MCP, `--fail-on` | Free | 114 stars; Show HN 20 points ("for humans and agents") |
| [geo-score](https://github.com/jianruntech/geo-score) | 2026 | OSS | CLI, Action, MCP, Claude Code skill | Free | 410 stars |
| [iannuttall/seo](https://github.com/iannuttall/seo) | Jul 2026 | Apache | npm `seo` CLI, skill | Free | 572 stars, 5.4K dl/mo, author's X audience |
| [Ryze open-seo-mcp-skills](https://github.com/Ryze-AI-Adgent/open-seo-mcp-skills) | Aug 2026 | MIT | Hosted MCP + Claude skills | Funnel to Ryze | 5.2k stars (5 watchers; likely promoted, spec.) |

Our pitch, word for word, is squirrelscan's ("the website QA tool for your coding agent", free
CLI, Action, MCP, skill, $19/mo) and GeoReady's (GEO score, fix command, Action with a score
gate, badge, $19 founding price). The parts we still have and they do not: 280 checks across
classic SEO and GEO in one engine, framework-aware fixes (32 frameworks, 11 with recipes),
auto-fix PRs via a GitHub App, Apple Intelligence on-device AI, and a hosted tier at $9.
None of that is visible from a directory listing; it has to be said where developers look.

The funded GEO vendors (Profound $1.8B, Peec $10M ARR, Otterly, Promptwatch, Scrunch) are not our
competition for developers, but their MCP and API are now standard on every mid-market plan, so
"we have an MCP server" is no longer a differentiator anywhere.

## 3. The decision: open the CLI or not

The evidence, both ways:

- For: every 2026 rival is open; HN asks; skills.sh and the Claude plugin directory index
  public repos; YouTube creators cover open repos (Unlighthouse: +1,628 stars in the month of one
  Fireship mention, [source](https://harlanzw.com/blog/2023-may.md)); stars are the social proof
  every listing shows next to our name (today: 1 and 0).
- Against: stars are not revenue. Unlighthouse and Nuxt SEO (6k stars combined) earn 62% of a
  $1,000/mo sponsors goal ([GitHub Sponsors](https://github.com/sponsors/harlan-zw)). SiteOne
  Crawler has 946 stars and, per a stranger's HN post, no users. Opening the code does nothing
  on its own; it removes a disqualifier.
- The premium checks already ship as encrypted WASM with the passphrase in the CLI (gap 13 in
  GAPS.md): the code is extractable today by anyone determined. Opening the CLI and
  `agent-runtime` while keeping `agent-runtime-premium` as it is changes little about what is
  actually protected.

Recommendation: open `packages/cli`, `packages/agent-runtime`, the plugins and the MCP server
under MIT in one public `integrallis/rankcli` repo (the empty `rankcli-cli` repo already exists),
keep the premium checks and the SaaS private, and make that repo the thing every listing, post
and README points at. If the answer is no, the rest of this plan still works; it just caps how
far HN, YouTube and the skill directories can carry it.

### 3.1 What opening it would reveal, and why it is still closed (checked 2026-10-13)

Measured against the packages on npm today (`@rankcli/cli@0.0.49`, `@rankcli/agent-runtime@0.0.37`):

| What is in the public tarballs already | Measured |
|---|---|
| `agent-runtime/dist/index.js`, the 260 free checks | 36,171 lines, not minified, 558 comment lines survive |
| `cli/dist/index.js` | 4,406 lines, not minified |
| `INJECTED_CONFIG` in `cli/dist/index.js` | `supabaseUrl`, `supabaseAnonKey`, `webAppUrl` and **`decryptPassphrase`**, in plain text |
| `wasm/rankcli_audit_engine_bg.wasm` | the 21 premium checks, AES-256-GCM encrypted, with the key in the file next to it |
| `"license"` in every published package.json | `MIT` |

So the question "what would open source reveal" has a short answer: **nothing a `node_modules`
folder does not already show.** Every free check is readable JavaScript with its comments.
The premium checks (9,468 lines of TypeScript in `packages/agent-runtime-premium/src`: E-E-A-T,
citation worthiness, RAG chunk readiness, entity SEO, featured snippets and 16 more) are
encrypted, and the passphrase is injected into the same package at publish time; one `grep` and
one call to the WASM's decrypt export returns the source. `wasm-engine.ts` says this itself:
"This is code protection, not access control". And since `c755700` (2026-09-18, "every plan
runs all 280+ checks, as the pricing says") the CLI decrypts them for anonymous users too, so
the encryption guards nothing that anyone is charged for. Legally, everyone who ran `npx
@rankcli/cli` already holds an MIT licence to what they downloaded.

What is actually closed is the git repository, and what opening it adds is:

- the free and premium checks as readable, commented, tested TypeScript instead of built output,
  so the thresholds and heuristics can be read, forked and copied (the OSS rivals' are already);
- the tests and fixtures, including the 32-framework detection benchmark, which is a selling
  point, not a secret;
- the Rust wrapper (`decrypt.rs`, `lib.rs`, `build.rs`: 352 lines) and the build scripts, which
  show that the "protection" is a passphrase in the bundle;
- nothing from the hosted product. The SaaS, the edge functions, the audit worker, the GitHub
  App, Stripe, the database and the pricing analyses stay in the private monorepo. That is also
  why the monorepo itself must not be flipped public: the public repo has to be an export of
  `packages/cli`, `packages/agent-runtime`, `packages/mcp-server` and the three plugins.

Checked for leaks before recommending the export: no token-shaped strings in the source of
those packages; `.env` was never committed; the only JWT-shaped string in the monorepo's whole
history (lockfiles excluded) is the `anon` key of the first Supabase project
`uisqfyeasobjjrgurwnb`, which is dead and was public by design.

Why it is not open already, from the record:

1. **The plan always said open.** `PROJECT_PLAN.md` ("Open Source Strategy": CLI core and
   Action open; AI engine, analytics and team features proprietary) and
   `COMPETITOR_RESEARCH_SYNTHESIS.md` (`cli` and `agent-runtime` MIT, `saas` proprietary) both
   predate the code. It was never executed: everything was built in one private monorepo, and
   publishing to npm with `"license": "MIT"` looked like the same thing. It is not: the
   directories that matter (skills.sh, the plugin directory, awesome lists, HN) index
   repositories, and `accounts.md` records skipping awesome-cli-apps on 2026-09-06 for exactly
   that reason.
2. **From February to September the work went the other way.** `b85d47e` ("stop leaking
   paid-tier check logic in the public npm package"), `ab8cdd7` (WASM decryption gated on
   entitlement), `4ef234c`, a Rust toolchain in the CLI build and `RANKCLI_BUILD_KEY` in CI were
   all built for a pricing model in which the premium checks were the paid difference.
3. **The pricing changed on 2026-09-18 and the repo did not.** Every plan got every check; the
   encryption lost its purpose; nobody revisited the repo's visibility.
4. **Coupling.** `cli` depends on `agent-runtime`, which builds the premium bundle through
   `wasm-adapter`; the SaaS edge functions consume `agent-runtime` through a Deno build
   (`build:deno`, `deno-entry.ts`); the audit worker imports the premium package directly.
   Opening means an export pipeline (a subtree push or `git filter-repo` of the public
   packages on each release) and a decision about where the premium source lives.

What this changes about the recommendation above: open all of it, including the premium
checks, and delete the encryption. That removes `wasm-pack` and the Rust toolchain from the CLI
build, `RANKCLI_BUILD_KEY` from CI, the 0.7 MB WASM and the VM sandbox from every install, and
the "premium checks unavailable" failure mode, for a protection that was already void. If the
answer is instead "keep the premium source private", keep `agent-runtime-premium` out of the
export and ship the WASM as a built artifact, knowing it protects nothing.

## 4. Done on 2026-10-13

- **Two agent skills and a Claude Code plugin**, merged to `main` of
  `integrallis/rankcli-mcp-server` as `4ee5d98` (PR #1): `skills/seo-audit/SKILL.md`,
  `skills/seo-ci-gate/SKILL.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  `.mcp.json`, README section. `claude plugin validate .` passes on `main`;
  `npx skills add integrallis/rankcli-mcp-server` lists both skills and was run once (both
  installed, which is what registers the repo on skills.sh);
  `/plugin install rankcli --marketplace integrallis/rankcli-mcp-server` works. What is left is
  the directory submission, which needs the founder's GitHub login (FOUNDER_CHECKLIST §7).
- **The three framework plugins are on npm**: `astro-rankcli@0.0.1`, `vite-plugin-rankcli@0.0.1`
  and `next-rankcli@0.0.1`, published 2026-10-13 by the new **Publish framework plugins**
  workflow (`42056f5`, `67b858a`, `64a50dd`) once a regenerated `NPM_TOKEN` had read/write on
  all packages. Astro's integrations directory lists any package keyworded `astro-integration`
  on its own. Two things npm only lets a 2FA code do are left for the founder: link each package
  to Trusted Publishing so the token can go, and remove the `0.0.0-stage` stub npm created
  beside each package (FOUNDER_CHECKLIST §8).
- **GitHub topics** on both public repos now include `ai-visibility`,
  `generative-engine-optimization`, `agent-skills`, `claude-code`, `cursor`, `seo-audit`,
  `core-web-vitals`, `structured-data`, `ai-search`. GitHub Topics pages are where the OSS rivals'
  stars come from (spec., §2).
- `ACTIVITY-LOG.md` has the measured status; the Show HN row no longer says "Pending".
- YMYL detection fix committed (`734b7f1`); it flagged nearly every page as Your-Money-Your-Life.

## 5. The plan, in order of expected value per hour

Each item says who can do it. "Founder" means it needs an account only you hold.

1. ~~Merge the skills/plugin PR~~ Done (`4ee5d98`). **Submit the plugin to Anthropic's
   directory** (founder, five minutes, FOUNDER_CHECKLIST §7): claude.ai/directory/manage,
   Submit new, Plugin bundle, repository `integrallis/rankcli-mcp-server`, path and branch
   empty. The portal re-validates on every push to `main`.
2. **Publish the Action to the GitHub Marketplace** (founder, two minutes, FOUNDER_CHECKLIST §3).
   Checked 2026-10-13: the manifest has `branding`, the name is unique, the repo is public, the
   v1.0.0 release exists; nothing but the tick is missing. There is no API for it.
3. ~~Publish `astro-rankcli`, `vite-plugin-rankcli` and `next-rankcli`~~ Done, all at 0.0.1 on
   2026-10-13. Left for the founder (FOUNDER_CHECKLIST §8): link the three packages to Trusted
   Publishing with a 2FA code, then delete the token. A Nuxt module is new code plus one PR to
   nuxt/modules.
4. **Decide §3.** If yes: one public repo, MIT, README that leads with `npx @rankcli/cli audit`,
   topics as above, and every listing repointed at it.
5. **Hacker News, properly** (founder). Email hn@ycombinator.com first (§6.2): the moderators
   do restore posts killed by the new-account filter. Resubmit from the aged account, Tuesday to
   Thursday, 8 to 10am ET, with the title in §6.1, and stay in the thread for three hours. Expect
   single digits unless the repo is public; the best "SEO" Show HN since January is 36 points.
6. **Reddit, as planned** (founder): the comment ledger to 9:1, Showoff Saturday with the rewrite,
   then r/SideProject again. And the Reddit Ads campaign from `reddit-ads-setup.md`, which was
   never created (the pixel has been live since 2026-09-30 with no campaign behind it), at $20 to
   $50 a day for one week, measured by the pixel; the research expects 90 to 225 clicks and 10 to
   30 signups at that spend, not more.
7. **Talk to the 17 users and the 7 free-audit emails** (founder, §6.4). Seven people signed up in
   one week and stopped. The likeliest source, found in PR #12 on 2026-10-13: the founder's intro
   post to 15 SEO/GEO Facebook groups on 2026-10-02, most of them held for admin approval, which
   lands days later. If that is right it is the only channel that has produced signups, and it
   is repeatable (`facebook-groups.md`). Cloudflare -> Web Analytics -> Referrers for Oct 5 to 11
   confirms or refutes it in one click.
8. **Cold outreach to agencies and dev shops, leading with their own audit** (founder sends,
   the audit and the email can be prepared here): 20 to 50 per batch, a personalised scan plus a
   45-second recording lifted one founder's reply rate from 2% to about 15%
   ([Indie Hackers](https://www.indiehackers.com/post/day-3-update-60-cold-dms-sent-2-replies-0-paying-customers-heres-what-i-ve-learnt-and-found-c56da159ad));
   cold email averages 4.5% replies ([Hunter](https://hunter.io/the-state-of-cold-email)).
   Agency is the tier this sells. Template in §6.3.
9. **Pitch the free tools and the Action to editors** (founder sends; drafts here): Console.dev
   (free, editorial), JavaScript Weekly / Node Weekly (editorial submissions), and the authors of
   the "best AI visibility tools 2026" listicles, offering the no-login checker, not the SaaS.
10. **Comparison pages** (can be built here): `/compare/lighthouse-ci`, `/compare/squirrelscan`,
    `/compare/geoready`, `/alternatives/screaming-frog`. Honest tables from §2; they take months
    to rank and compound.
11. **One data study** (can be built here): run the audit over a few hundred public
    developer-tool or framework sites and publish the distribution. It is the only content type in
    §1 that earns links from press and listicles.
12. **One demo video** (founder): two minutes, terminal only, the audit failing a build and the
    fix PR. Pitch it to Syntax, Theo and Fireship with the public repo. Slow, compounding.
13. **Skip for now**: lifetime deals (per-audit compute forever on 30% of a one-time price),
    paid newsletters above $300 a slot, Product Hunt until there is an audience to seed it (SEO
    tools on PH in 2026: Rankscale got 3 upvotes), Meta ads for anything but Agency.
14. **Stop**: the weekly Bluesky status post (keep the account, post when there is news), and
    Mastodon (dead token).

What "working" looks like, from the benchmarks: a Show HN plus the listings plus 100
personalised agency emails over six weeks plausibly yields 100 to 400 signups and 3 to 15 paying
at the observed 2 to 4% developer-tool conversion (spec., from the research pass). Every $100K+
ARR case found needed either an audience built over one to two years or one channel the founder
worked daily.

## 6. Drafts, ready to paste

Numbers in these come from [VERIFIED-NUMBERS.md](./VERIFIED-NUMBERS.md). Re-check before use.

### 6.1 Show HN, resubmitted

The research is explicit that "SEO" as the first word is a negative signal on HN; lead with the
mechanism.

**Title** (under 80 chars): `Show HN: A linter for SEO that fails your CI build (CLI, GitHub Action, MCP)`

**URL:** `https://rankcli.dev/?ref=hn` (or the public repo, if §3 is a yes; HN prefers it)

**Text:** the Show HN text in [launch-kit-2026-09.md](./launch-kit-2026-09.md) still reads well.
Change two things: open with the three failure modes (a noindex that survived a preview deploy,
a canonical pointing at staging, a page that started answering 500) in one line each, and end
with "The CLI, the Action and the MCP server are free and run locally; the hosted part is
optional. I'd like to hear which checks are wrong or noisy for your site." Post the technical
first comment immediately.

### 6.2 Email to hn@ycombinator.com

> Subject: Show HN killed by the new-account filter (item 49913246)
>
> Hi, I submitted a Show HN on Sept 30 from a new account (integrallis, created Sept 6 for this)
> and it was marked dead at 1 point with no comments, which I assume is the new-account spam
> filter rather than a judgment on the post. It's a developer tool I built: a free CLI, GitHub
> Action and MCP server that run SEO and AI-search checks and fail a CI build when they regress.
> Nothing to sign up for; `npx @rankcli/cli audit --url <site>` runs it.
>
> Would you be willing to restore it, or should I resubmit from my older account (<handle>)?
> Happy to do whichever you prefer. Thanks for reading.
>
> Brian Sam-Bodden

### 6.3 Cold email to an agency or dev shop

Send with their real audit attached (`npx @rankcli/cli audit --url <their site> -o json`, then
the three worst findings in plain words) and, if possible, a 45-second screen recording of the
audit running on their site.

> Subject: 3 things on <their-site> that search engines and ChatGPT can see and you can't
>
> <First name>, I ran our audit on <their-site> before writing this. Three findings, no fluff:
>
> 1. <finding, one line, e.g. "GPTBot and ClaudeBot are blocked at your CDN while robots.txt says Allow, so you don't appear in AI answers">
> 2. <finding>
> 3. <finding>
>
> I build RankCLI: 280 SEO and AI-search checks that run in CI and open the fix as a pull
> request, with white-label reports for client work. Agencies use the $99 tier for up to 50
> client sites. If you'd like, I'll run the full audit on three of your client sites, free, and
> you keep the reports either way.
>
> The 45-second recording of the audit on your site: <link>
>
> Brian Sam-Bodden, Integrallis

### 6.4 Email to the 17 users

> Subject: one question about RankCLI
>
> You signed up for RankCLI recently. I'm the person who built it, and I'd like to know one thing:
> what were you trying to do when you signed up, and did it work?
>
> Reply with a sentence; I read every one. If something was broken or confusing, say that, it's
> the most useful answer I can get.
>
> Brian

### 6.5 Console.dev pitch (editorial, free)

> RankCLI is a free CLI, GitHub Action and MCP server that run 280 SEO and AI-search checks and
> fail a CI build when a site regresses: a noindex left on after a preview, a canonical pointing
> at staging, AI crawlers blocked at the CDN edge while robots.txt says Allow. `npx @rankcli/cli
> audit --url <site>` runs it with no account; AI analysis uses the developer's own model,
> including Apple Intelligence on-device. <public repo link>

## 7. Benchmarks to set expectations

| Metric | Number | Source |
|---|---|---|
| Show HN median score; top 6% | 2 points; 50 points | [Show HN by the numbers](https://danfking.github.io/blog/2026/04/23/show-hn-by-the-numbers/) |
| "SEO" Show HNs since Jan 2025 | 0 of 52 reached 50; max 36 | HN Algolia |
| HN front page -> signups | 11K uniques -> 300; 6K visits -> 80 -> $0 | Indie Hackers posts cited in §5 |
| Product Hunt, featured / not | 10 to 150 signups / 1 to 15 | [shno.co](https://www.shno.co/marketing-statistics/product-hunt-launch-statistics) |
| Freemium free -> paid | 8% median; dev tools 2 to 4% | [ChartMogul](https://chartmogul.com/reports/saas-conversion-report/) |
| Cold email reply | 4.5% average; up to 15% with a personalised scan | Hunter; Indie Hackers |
| Comparison-page conversion | 8.4% average, most under 4% | Grow & Convert |
| Reddit Ads | CPC $1.25 to $1.85 median | `reddit-ads-2026-09.md` |
| Newsletter CPC, best observed | $0.52 | Indie Hackers |
