# RankCLI Pricing Analysis (September 2026)

Question from the founder: "Are we well positioned? Should we go down?"

Research date: 2026-09-18. All competitor prices were checked against the vendor's own pricing page on that date unless marked otherwise. Current RankCLI limits come from `packages/saas/src/config/pricing-tiers.json`.

---

## 0. The direct answer

1. **Don't lower prices. Price is not what's holding you back.** Almost nobody has seen the price. There are 6 accounts, all yours, 41 anonymous audits ever, and close to zero pricing-page views. Until today the signup email never arrived and the free AI-visibility tool hung. When nobody reaches the price, there's no way to tell whether it's too high.
2. **You're already at the bottom of every category.** Solo at $9 is the cheapest paid plan in the whole competitor set below. Pro at $29 costs the same as Ahrefs Starter, Otterly Lite and SEOptimer DIY, and less than HubSpot AEO ($50), Semrush's AI toolkit ($99) and Peec ($95). If anything, Agency at $99 for 50 sites with white-label is underpriced.
3. **Change the shape, not the level.** Stop charging for diagnosis: run all checks on every plan, keep local fixes free, and leave the GitHub Action free. Charge for things that run on their own: scheduled monitoring, regression alerts, the auto-fix PR bot, CI gating, AI-visibility trends, team seats and client reporting. Cut the SKU count by pulling the lifetime deals. Keep the founding offer but make it count-based only. Standardize the annual discount at 2 months free.
4. **For the 10K-user goal, the free tier and distribution do the work, not the price.** Free forever should include the full CLI, MCP and GitHub Action, a no-signup web audit, one free hosted AI-visibility snapshot, and a free account that monitors one site.
5. **Before any pricing experiment makes sense**, fix three things. The site returns only a `<title>` to non-JS clients, including AI crawlers. The AI-visibility check needs an API key before it can show any value. And CLI users have no reason to create an account beyond unlocking withheld checks.

---

## 1. Where RankCLI actually is

| Signal | Value | Read |
|---|---|---|
| Accounts | 6, all the founder's own | No external customers yet |
| Anonymous free audits (all time) | 41 | Top of funnel is almost empty |
| Pricing page reach | "almost no one" | Price hasn't been tested at all |
| Email signup | Broken until today (no confirmation email) | The funnel was closed |
| Free AI-visibility tool | Hung for most visitors until today | The best lead magnet wasn't working |
| `@rankcli/cli` npm downloads | 1,319 (Aug 18 to Sep 16) | Mostly noise, see below |
| `@rankcli/mcp-server` npm downloads | 1,050 (same window) | Same caveat |
| rankcli.dev as seen by a non-JS fetcher | `/`, `/pricing` and `/blog/react-seo-guide` return only the title "RankCLI - Ship code, get ranked" | Content is invisible to AI crawlers and slow for Google to pick up |

**npm downloads are not a hidden user base.** Daily downloads for `@rankcli/cli` were 0 to 7 per day through August. They spiked to 330, 625 and 205 on Sep 4 to 6, the same three days 7 versions were published. After that they settled at 6 to 34 per day. Publish-triggered mirrors and scanners explain the spike. The README's GitHub Action runs `npm install -g @rankcli/cli` on every push, so your own CI inflates the baseline too. Count real users with an opt-in first-run ping or `rankcli login` events, not npm.

**The site-rendering finding matters more than any price.** Vercel's crawler study found that GPTBot, ClaudeBot and PerplexityBot don't execute JavaScript ([Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler)). If rankcli.dev is a client-rendered Vite SPA with no prerender, then:

- the tool that measures what ChatGPT, Claude and Perplexity say about a brand is itself invisible to them;
- the blog, the main organic channel, isn't being read by those crawlers;
- a visitor who runs `rankcli geo https://rankcli.dev` may find the tool failing its own checks. That's a credibility risk.

Confirm with `curl -A GPTBot https://rankcli.dev/pricing`. If the body is empty, prerender the marketing pages, blog, tools and pricing using a Vite prerender step, not Next.js patterns. The sitemap has 13 URLs, all with `lastmod` 2026-01-24, so it's stale as well.

---

## 2. Competitor pricing

Legend: **V** = verified on the vendor's own page on 2026-09-18. **S** = secondary source only; the vendor page was JS-rendered, blocked, or didn't show prices. **C** = the vendor page and third parties disagree. Prices are USD per month on monthly billing unless noted.

### 2a. AI-visibility / GEO trackers

| Product | Free option | Entry paid plan | What entry includes | Higher tiers | Status | Source |
|---|---|---|---|---|---|---|
| HubSpot AI Search Grader | Free one-time diagnostic, no account | none | ChatGPT (GPT-5.4 mini), Perplexity, Gemini snapshot | none | V | [hubspot.com/ai-search-grader](https://www.hubspot.com/ai-search-grader) |
| HubSpot AEO | Grader only | **$50** ($45 annual) | 25 prompts; ChatGPT, Gemini, Perplexity | Bundled in Marketing Hub Pro/Enterprise | V | [hubspot.com/products/aeo](https://www.hubspot.com/products/aeo) |
| Otterly.AI | Free trial, no free plan | **Lite $29** ($25 annual) | 15 prompts, daily; ChatGPT, Google AIO, Perplexity, Copilot; unlimited seats | Standard $189 (100 prompts, API, MCP), Premium $489 (400), Enterprise from $1,000. Gemini, AI Mode and Claude are paid add-ons ($9 to $439) | V | [otterly.ai/pricing](https://otterly.ai/pricing) |
| Peec AI | Trial | **Starter $95** ($80 annual) | 50 prompts, 3 models, 1 project, unlimited seats | Pro $245 (150 prompts), Advanced $495 (350) | S | Official page didn't render prices; figures from [SE Ranking's review, 2026-08-28](https://visible.seranking.com/blog/peec-ai-review/). Agency plans: [peec.ai/pricing-agencies](https://peec.ai/pricing-agencies) |
| Profound | Free trial: 10 prompts, run once, ChatGPT only | Official page shows no self-serve price | Enterprise custom (9+ engines) | Third parties report Starter $99 (ChatGPT only, 50 prompts) and Growth $399, annual-only | **C** | [tryprofound.com/pricing](https://www.tryprofound.com/pricing); [Maintouch, updated 2026-09-01](https://maintouch.com/blogs/profound-ai-pricing) |
| Scrunch | 7-day trial | **Starter $300** ($250 annual) | 350 custom prompts, 3 seats, 6+ engines | Growth $500 ($417 annual), Enterprise custom | V | [scrunch.com/pricing](https://scrunch.com/pricing/) |
| AthenaHQ | **Essential: free** (300 credits) | **Starter $295** | 3,600 credits, 11 models, unlimited seats | Enterprise custom | V | [athenahq.ai/pricing](https://www.athenahq.ai/pricing) |
| Semrush AI Visibility Toolkit | 7-day trial | **$99 per domain**, billed annually | 25 prompts daily; ChatGPT, Google AI, Gemini, Perplexity; AI-readiness site audit | Enterprise custom | V | [semrush.com/pricing/ai](https://www.semrush.com/pricing/ai/) |
| Ahrefs Brand Radar AI | none | **Add-on from $199**, on top of a paid Ahrefs plan ($129+) | Per-platform AI index | Third parties report $699 for all platforms | V (from-price) / S (bundle) | [ahrefs.com/pricing](https://ahrefs.com/pricing) |
| SE Ranking AI Search add-on | 14-day trial | **$89 add-on** ($71.20 annual) on top of Core $129 | 200+ prompts | SE Visible standalone reportedly from $189 (S) | V (add-on) | [seranking.com/subscription.html](https://seranking.com/subscription.html) |
| LLMrefs | Free tier | **$79** ("limited time") | 500 prompts, all major engines, weekly reports, API | none | V | [llmrefs.com/pricing](https://llmrefs.com/pricing) |
| Rankscale | 7-day trial (Pro) | **Essentials from $20** (allocation not published) | Unclear | Pro $99 ($84 annual, 1,200 credits), Growth $385 | V (price) / unverified (contents) | [rankscale.ai/pricing](https://rankscale.ai/pricing) |
| Trakkr | 14-day trial | **Growth $100** ($790/yr) | 1 brand, 50 prompts, 8 models | Scale $500 (10 brands, white-label, API) | V | [trakkr.ai/pricing](https://trakkr.ai/pricing) |

**What competitors charge per AI answer.** This is my own arithmetic from the table, assuming daily tracking:

| Product | Calculation | Per answer |
|---|---|---|
| Otterly Lite | $29 / (15 prompts × 4 engines × 30 days) | about $0.016 |
| Peec Starter | $95 / (50 × 3 × 30) | about $0.021 |
| HubSpot AEO | $50 / (25 × 3 × 30), cadence not stated, daily assumed | about $0.022 |
| Semrush AI toolkit | $99 / (25 × 4 × 30) | about $0.033 |
| Profound Starter (third-party figure) | $99 / 1,500 responses | about $0.066 |

The market sells AI answers at about $0.016 to $0.07 each.

### 2b. Developer / CI SEO tooling (what a developer compares RankCLI to)

| Product | Free | Paid entry | Notes | Status | Source |
|---|---|---|---|---|---|
| **squirrelscan** (closest analog) | MIT CLI free forever (282 to 295 rules); Cloud Free: 500 credits, about 5 cloud audits a month | **Pro $19** (3,000 credits, about 30 audits); **Team $29 per seat**, 2+ seats (white-label, daily scheduled audits) | CLI, MCP, CI and coding-agent skills. Positioned as "website QA for your coding agent". 268 GitHub stars | V | [squirrelscan.com](https://squirrelscan.com/), [GitHub](https://github.com/squirrelscan/squirrelscan) |
| Lighthouse CI | Free, Apache-2.0, self-hosted server | none | PR reports, regression gating; 7.1k stars | V | [GitHub](https://github.com/GoogleChrome/lighthouse-ci) |
| Unlighthouse | Free, MIT | none, sponsor-funded | Whole-site Lighthouse, CI integration. **158,855 npm downloads** (Aug 18 to Sep 16) | V | [unlighthouse.dev](https://unlighthouse.dev/), npm API |
| Ahrefs Webmaster Tools ("Ahrefs Free") | Free for verified sites | none | Site Audit covers 170+ issues; 5K crawl credits a month per project | V | [ahrefs.com/webmaster-tools](https://ahrefs.com/webmaster-tools) |
| Screaming Frog SEO Spider | Free up to 500 URLs | **£199/yr** (US $279/yr per licence; $235 at 20+ licences) | Scheduling and command-line automation | V | [seo-spider](https://www.screamingfrog.co.uk/seo-spider/), [licence](https://www.screamingfrog.co.uk/seo-spider/licence/) |
| Sitebulb | 14-day trial | Desktop from about $13.50 to $18; Cloud from about $125 | Official page didn't render numbers | S | [sitebulb.com/pricing](https://sitebulb.com/pricing/), [TMB](https://thatmarketingbuddy.com/pricing/sitebulb) |
| Seobility | Basic free: 1 project, 100 pages per crawl | Premium €59.90 | none | V | [seobility.net/en/pricing](https://www.seobility.net/en/pricing/) |
| SEOptimer | 14-day trial | DIY $29, White Label $39, Lead Gen $59 (25% off annual) | SEO Audit API $100 to $500; GEO audits $29 to $79 | V | [seoptimer.com/pricing](https://www.seoptimer.com/pricing) |
| DataForSEO | $1 trial credit | Pay as you go, $50 minimum | Google SERP $0.0006 (standard queue) to $0.002 (live) | V | [dataforseo.com SERP pricing](https://dataforseo.com/pricing/serp/google-organic-serp-api) |
| OSS npm auditors | Free | none | seo-analyzer, @seomator/seo-audit (251 rules), @nurkamol/seo-audit (GitHub Action), SEOnaut | Existence verified, not reviewed | [npm](https://www.npmjs.com/package/seo-analyzer), [SEOnaut](https://github.com/stjudewashere/seonaut) |
| Auto-fix SEO platforms | none | Alli AI about $169 to $299+; Search Atlas OTTO from about $99 | Marketer-side "we change your site" tools | S | review sites only; treat as directional |

**Dev-tool budget anchors.** These are the lines a team lead sets RankCLI against, not SEO tools:

| Product | Free | Paid tiers | Source |
|---|---|---|---|
| Sentry | Developer (1 user) | Team $26, Business $80 | V, [sentry.io/pricing](https://sentry.io/pricing/) |
| Checkly | Hobby | Starter $24, Team $64 | V, [checklyhq.com/pricing](https://www.checklyhq.com/pricing/) |

### 2c. Mainstream SEO suites, for anchoring

| Suite | Entry | Next tiers | Status | Source |
|---|---|---|---|---|
| Semrush | "SEO" **$139** ($117.33 annual), 5 sites | Starter $199 (adds MCP and 50 daily AI prompts), Pro+ $299, Advanced $549 | V (lineup as rendered 2026-09-18) | [semrush.com/prices](https://www.semrush.com/prices/) |
| Ahrefs | **Starter $29** (no MCP); Ahrefs Free | Lite $129, Standard $249, Advanced $449, Enterprise $1,499 (annual) | V | [ahrefs.com/pricing](https://ahrefs.com/pricing) |
| SE Ranking | **Core $129** ($103.20 annual), 10 projects | Growth $279. Add-ons: AI Search $89, API $45 (annual), Agency Pack $69 (annual) | V | [seranking.com/subscription.html](https://seranking.com/subscription.html) |
| Moz Pro | **Starter $49** | Standard $99, Medium $179, Large $299 | S (moz.com blocked the fetch) | [costbench](https://costbench.com/software/seo-tools/moz-pro/) |

### 2d. What the market tells us

- **RankCLI's list prices are already the lowest paid prices in all three groups.**
  - $9 Solo sits below every paid entry, including Rankscale's $20.
  - $29 Pro is the market's cheapest self-serve line: Ahrefs Starter, Otterly Lite, SEOptimer DIY, squirrelscan Team per seat.
- **Diagnosis is free across the market.** Lighthouse CI, Unlighthouse, squirrelscan (MIT, 280+ rules), Ahrefs Webmaster Tools (170+ issues) and the Screaming Frog free tier all give audits away. Withholding 180 of 280 checks from free users puts RankCLI behind a free MIT competitor on the most visible thing it does.
- **AI-visibility tracking is where the market charges the most.** Entry prices run from $29 to $300. RankCLI offers it at $9 plus the user's own API cost. That's the headline RankCLI isn't using.
- **Nearly everyone gives unlimited seats at entry:** Otterly, Peec, AthenaHQ, Sentry Team. Seat caps are out of step with the market and slow adoption inside a team.
- **Annual discounts cluster at about 15 to 20%:** Otterly 15%, Peec about 15%, Scrunch 17%, Ahrefs and Semrush "up to 17%", SE Ranking, Seobility and Moz 20%, Checkly up to 20%. RankCLI's config gives **33%**, while `llms.txt` says **20%**.

---

## 3. Positioning

### 3a. Who buys, and what they compare RankCLI to

| Buyer | Job to be done | Compares against | Willingness to pay | What converts them |
|---|---|---|---|---|
| **Indie dev / solo founder**: 1 to 3 sites, ships fast, uses Claude Code or Cursor. This is the animerm.ai profile | "Don't let my launch be invisible on Google and ChatGPT" | Free: Lighthouse, Unlighthouse, Ahrefs Webmaster Tools, squirrelscan, "just ask Claude" | $0 to $20/mo | Unattended monitoring, PRs that land without them, a trend of what AI assistants say about them |
| **Dev team lead**: startup, marketing site or docs in a repo | "SEO and AI-search regressions shouldn't ship; marketing should stop filing tickets" | Lighthouse CI (free), dev-tool line items like Sentry $26 and Checkly $24, and marketing's Semrush seat ($139+) | $29 to $99/mo on a card, below procurement | CI gate on PRs, Slack alerts, auto-fix PRs, unlimited seats |
| **Agency / freelancer**: 10 to 50 client sites | "Recurring deliverables per client, including the AI-visibility report clients now ask for" | SEOptimer white-label ($39 to $59), SE Ranking ($129), Screaming Frog ($279/yr), Otterly Standard ($189), Scrunch/Peec agency plans ($500+) | $99 to $300+/mo, passed through to clients | Per-client sites, white-label reports, AI visibility per client, API |

**Primary adoption target:** indie devs and dev teams. The CLI, MCP and Action audience gets you to 10K users.
**Primary revenue target:** dev teams, then agencies. Indie devs pay, but at low ARPU and with higher churn.

### 3b. Are you well positioned?

**Strengths.** No competitor in the table has this combination:

- a CLI, MCP server and GitHub Action;
- an auto-fix PR bot;
- a four-assistant AI-visibility check;
- all at indie prices;
- with BYOK, meaning no markup on AI calls.

The strongest adjacent products either charge $29 to $300 for AI visibility alone (the GEO trackers) or give free diagnosis with no GEO and no PR bot (squirrelscan, Unlighthouse, Lighthouse CI).

**Weaknesses:**

- **The pitch is spread too thin.** The plan pages list keyword research, a content optimizer, local SEO, competitor intel, GSC sync, rank tracking and white-label. For a developer it reads like "Semrush at $9", which isn't believable, and it hides the wedge.
- **The paid line is drawn in the wrong place.** Diagnosis (rule count) and local fixes are gated. In 2026 a coding agent reading the free MCP output does the local fix for free anyway.
- **The main differentiator sits in the $29 tier.** The auto-fix PR bot is the "ship code, get ranked" moment, and most first-time payers will never see it.

**Recommended wedge:** "Regression testing for SEO and AI search. Lighthouse CI, plus what ChatGPT, Claude, Gemini and Perplexity say about you, plus PRs that fix it." Lead with CI and the AI-visibility trend. Treat keyword research, content and local SEO as supporting features, not headline differentiators.

### 3c. The value metric

| Candidate metric | Verdict | Why |
|---|---|---|
| Checks (rule count) | **Drop** | Buyers read "100 checks" as 100 audits. Free competitors ship 170 to 295 rules. It weakens the free audit, which is your best ad |
| Audits / runs | **Don't meter** | Metering penalizes the CI habit you want: an audit on every PR. The Action runs on the user's own CI minutes anyway |
| Seats | **Don't meter on team tiers** | Seats are how a dev tool spreads inside a company. They cost you almost nothing. The market gives them away |
| Prompts (GEO) | **Don't meter BYOK prompts** | The user already pays the provider. Meter only hosted, no-key usage (see 4f) |
| **Monitored sites** | **Primary metric** | Tracks value (each site is a product or client) and your real cost (scheduled crawls, history, SERP calls). Agencies understand it |
| **Automation depth** | **Tier fence** | Weekly vs daily vs on-deploy; PR bot; CI gating; alerts; white-label. These are unattended outcomes, which is what people pay for |

### 3d. Does BYOK change what's fair to charge?

It changes **what** you charge for. It barely changes **how much**.

- **The subscription pays for the software, not the tokens.** That covers scheduling, history and diffs, alerts, the GitHub App, CI gating and white-label. Those are priced like dev tools ($9 to $99), not like GEO trackers ($95 to $399). No discount is owed for BYOK: the subscription never included AI costs.
- **BYOK makes prompt-based pricing illegitimate for BYOK usage.** Charging per prompt when the customer pays OpenRouter would be double-billing. Put "unlimited prompts, no markup" on the pricing page.
- **The customer's all-in cost has to be shown honestly.**
  - Assumption: a web-search-grounded query costs about $0.007 to $0.02 per assistant.
    - OpenAI web search: $10 per 1k calls plus tokens ([OpenAI](https://developers.openai.com/api/docs/pricing)).
    - Perplexity Sonar: $5 to $12 per 1k requests plus about $1/M tokens ([Perplexity](https://docs.perplexity.ai/getting-started/pricing)).
    - OpenRouter's Exa web plugin: $0.007 per request plus model tokens ([OpenRouter](https://openrouter.ai/docs/features/web-search)).
  - On that basis, 25 prompts × 4 assistants **weekly** is about 433 answers a month, or roughly **$3 to $9/mo** in API fees.
  - The same **daily** is about 3,000 answers, or roughly **$21 to $60/mo**.
  - **Default to weekly** and show an estimated monthly API cost before the user schedules anything.
  - A fair comparison line: "Solo + your key ≈ $12 to $18/mo for 25 prompts weekly across 4 assistants, vs HubSpot AEO $50 (25 prompts, 3 assistants), Otterly Lite $29 (15 prompts, daily), Peec $95." Always state the cadence difference.
- **BYOK is an activation tax.** Most visitors don't have an OpenRouter key. If the AI-visibility check needs a key before it shows anything, you lose most people at your strongest hook. The fix is a small hosted first run (4f and experiment E1), not dropping BYOK.
- **Not everything is BYOK.** Rank tracking uses a SERP API. `.env.example` lists SerpAPI, and I didn't verify what's actually in use.
  - SerpAPI list pricing is $150/mo for 15,000 searches, about $0.01 each ([SerpAPI](https://serpapi.com/pricing)).
  - Pro's 500 keywords tracked daily would be 15,000 searches a month, about **$150/mo of cost for a $29 (or $19) customer**.
  - Agency's "unlimited" keyword tracking has no ceiling on that cost.
  - DataForSEO's standard queue ($0.0006 per SERP) brings the same volume to about $9. Before selling Pro or Agency, check the provider and the refresh cadence. Otherwise switch provider, make SERP BYOK, or cap it.

---

## 4. Answers to each question

### 4a. Is price the bottleneck right now?

No. In order, the constraints are:

1. **Traffic.** Visitors can't reach or read the site (rendering issue, 13-URL stale sitemap, no launch).
2. **Activation.** Signup was broken and the AI-visibility tool hung. BYOK blocks the first "wow".
3. **The bridge from CLI to account.** Free CLI users have no reason to sign up except to unlock withheld checks.
4. **Only then, pricing.**

Price changes only become measurable once the pricing page gets a few thousand visitors per variant (see section 7).

### 4b. Go down, stay, or change shape?

**Keep the list prices. Change the shape.**

Going down gains nothing measurable today. It removes headroom you'll need to fund paid acquisition later. It also signals "toy" to the team and agency buyers who produce most of the revenue. The founding offer already gives early adopters a lower price without moving the list price.

### 4c. Should Solo exist?

**Yes, as the indie-dev plan, but give it the signature feature.**

- Indie devs are your distribution base and your likeliest first payers, and $9 is an impulse buy.
- Today Solo is Free plus 2 sites plus weekly audits plus local fix. That's thin, and a coding agent covers local fix for free.
- Redefine Solo as **"unattended for your side projects"**:
  - 3 sites monitored weekly;
  - auto-fix PRs via the GitHub App on up to 3 repos;
  - email and Slack/Discord regression alerts;
  - weekly BYOK AI-visibility tracking.
- Pro's fence becomes **team plus CI**: unlimited seats, daily and on-deploy audits, GitHub check-run gating, 10 sites.

Experiment E3 tests whether the 4-tier layout beats 3 tiers.

### 4d. Founding offer and lifetime deals: helping or muddying?

Today a visitor can buy **8 things**:

- Solo, Pro and Agency, each monthly or annual;
- founding Pro at $19;
- three lifetime deals ($79, $149, $299).

On top of that sit three discount mechanisms: a 33% annual discount, a 34% founding discount, and lifetime.

**Founding offer: helps a little, if simplified.**

- **Drop the 90-day clock.** With no traffic it'll run out before anyone sees it.
- **Keep "first 100 customers"**, locked while they stay subscribed.
- **Hide the seat counter until at least 10 are claimed.** "100 of 100 left" is negative social proof.
- **No stacking with annual.**
- It's already wired in Stripe (`pro_founding`), so this costs nothing to keep.

**Lifetime deals: muddying. Pull them for now** (`lifetime_deals.enabled: false`).

| Problem | Detail |
|---|---|
| They sell future revenue cheaply | LTD Pro $149 is about 5 months of Pro. LTD Starter $79 is about 9 months of Solo |
| One undercuts the Agency plan outright | LTD Agency ($299 once) includes white-label and auto-fix for 10 sites, which is exactly Agency's fence |
| They show negative social proof | `show_remaining: true` would display "500 of 500 remaining" |
| They attract the wrong buyer | Deal-hunters are support-heavy, not the dev audience |
| They lock pricing before product-market fit | Lifetime obligations constrain every future change |

If you need a cash event later, run one capped LTD tied to a launch, with a site cap and no white-label.

### 4e. Annual discount

Standardize on **2 months free**, about 17%: $90, $290 and $990 a year. That's the market norm, and it fixes the 33% vs "20%" contradiction between the config and `llms.txt`. Pre-product-market fit, monthly billing is also the faster way to learn churn.

### 4f. A usage-based AI-visibility add-on?

**Yes, as a hosted convenience, not the core model. Keep BYOK as the default path.**

| Step | What to offer | Cost to you |
|---|---|---|
| **Now** | One free hosted snapshot on the public web tool. For example, 3 prompts × 4 assistants on cheap search-grounded models, cached per domain, rate-limited per IP and domain. This is your answer to HubSpot's free grader, and your best lead magnet | About $0.08 to $0.25 per run, so 1,000 runs is about $80 to $250 a month. Much cheaper than any paid channel |
| **After signup** | The first 2 AI-visibility runs hosted, then ask for a key. Experiment E1 decides whether this stays | Small, capped per user |
| **Later** | **AI Visibility Pack (no key needed): $15/mo per site, 25 prompts × 4 assistants weekly.** Alternatively, prepaid packs at about $0.03 to $0.04 per answer. Launch it once E1 shows a large drop-off at the BYOK step, or paying users ask | About 433 answers a month, so $3 to $9 of COGS and 40 to 80% gross margin. About $0.035 per answer, inside the market's $0.016 to $0.07 range |

Don't offer hosted **daily** tracking in a cheap pack: it's about 7x the cost.

### 4g. Free tier for 10K users without killing the paid path

**The rule: give away diagnosis, local fixes and the CI Action. Charge for what runs without the user, and for team and client scale.**

**Free forever:**

- **No account needed:**
  - CLI, MCP server and GitHub Action with **all 280+ checks**, unlimited runs;
  - BYOK AI, local models supported;
  - `rankcli fix` locally.
- **Web, no signup:**
  - full audit score and every issue listed;
  - one hosted AI-visibility snapshot per domain per week.
- **Free account** (GitHub OAuth plus email):
  - fix code snippets, then a saved and shareable report link;
  - 1 monitored site with a **weekly** scheduled audit;
  - 30-day history and email alerts on regressions;
  - PR comments from the Action linking to the hosted report;
  - a README score badge;
  - BYOK AI-visibility tracking for 1 site (10 prompts, weekly);
  - 3 auto-fix PRs a month on 1 repo, so free users see the PR bot.
- **Open source program:** Pro free for public OSS project and docs sites, in exchange for the badge. Docs sites are run by developers and read by developers. This seeds distribution.

**Growth loops built in:**

- PR comments and README badges ("Audited by RankCLI") are impressions inside every team that installs it.
- Shareable reports: "What ChatGPT says about <brand>" cards.
- White-label is Agency-only. Every other report carries the brand.

**Define "10,000 users" before chasing it.** I recommend **registered accounts** as the headline number. Use **weekly active sites** (sites audited by any RankCLI surface in the last 7 days) as the North Star, because it counts CLI, MCP and Action users who never sign up.

Rough revenue at the goal, assuming a typical 2 to 5% freemium conversion (not measured) and a blended ARPU of $15 to $25: 10K accounts means 200 to 500 paying and about **$3K to $12.5K MRR**. The free tier and distribution decide whether you reach that. Price moves it by maybe ±30%.

---

## 5. Recommended price sheet

| | **Free** | **Solo** | **Pro** | **Agency** |
|---|---|---|---|---|
| Price (monthly) | $0 forever | **$9/mo** | **$29/mo**. Founding: **$19/mo for life** for the first 100 customers | **$99/mo** |
| Price (annual, 2 months free) | none | $90/yr | $290/yr (founding price monthly only) | $990/yr |
| For | Everyone | Indie devs, side projects | Startups and dev teams | Agencies and freelancers |
| Checks | All 280+ | All | All | All |
| CLI / MCP / GitHub Action | Unlimited, BYOK, no account | same | same | same |
| Local `rankcli fix` | Yes | Yes | Yes | Yes |
| Monitored (hosted) sites | 1 | 3 | 10 | 50, then +$2 per site per month |
| Scheduled audits | Weekly | Weekly | Daily, plus on deploy (webhook or Action) | Daily, plus on deploy |
| Regression alerts | Email | Email, Slack/Discord | Email, Slack/Discord | Plus per-client routing |
| GitHub auto-fix PRs (App) | 3 PRs/mo, 1 repo | Unlimited, up to 3 repos | Unlimited | Unlimited |
| CI gating (GitHub check runs, baseline vs main) | none | none | Yes | Yes |
| AI-visibility tracking (BYOK, no markup) | 1 site, 10 prompts, weekly | 3 sites, 25 prompts each, weekly | 10 sites, 50 prompts each, up to daily | 50 sites, 100 prompts each, up to daily |
| Hosted AI visibility (no key) | 1 web snapshot per domain per week | Add-on: $15 per site per month (later) | Add-on | Add-on |
| Rank tracking (SERP cost-bound) | none | 100 keywords, weekly | 500 keywords (daily only if SERP cost is at least 10x under price) | 2,000 keywords (replaces "unlimited") |
| History | 30 days | 1 year | 1 year | Unlimited |
| Seats | 1 | 1 | **Unlimited** | Unlimited, plus client viewers |
| API | none | 100 req/day | 1K req/day | 10K req/day |
| White-label reports and client portals | none | none | none | Yes |
| Support | GitHub Discussions | Email | Email | Priority |

**Removed from sale:**

- all three lifetime deals;
- the founding offer's 90-day timer;
- "checks" as a pricing limit;
- Pro's 5-seat cap;
- unlimited rank tracking on Agency.

**Keep the Pro trial disabled.** The free tier and the 3 free PRs do the trial's job. A reverse trial is an option once traffic exists.

### Changes against `pricing-tiers.json`

I didn't edit the config. These are the changes for you to make:

- **Kill lifetime deals:** set `lifetime_deals.enabled` to `false`.
- **Founding offer:** remove the `founding_offer.duration_days` expiry. Keep `total_seats: 100`. Show the counter only once at least 10 seats are claimed.
- **Free audit and free account:**
  - set `free_audit.checks_limit` and `free_registered.checks_limit` to all checks;
  - set `free_registered.features.full_audit` and `local_auto_fix` to `true`;
  - add a weekly schedule for 1 site and a 3-per-month `github_auto_fix` allowance.
- **Solo:**
  - `github_connect`, `github_auto_fix` (3 repos) and `slack_alerts` to `true`;
  - `historical_days` to 365;
  - `price_cents_annual` to 9000.
- **Pro:** `team_members` to `null` (unlimited), `historical_days` to 365, `price_cents_annual` to 29000.
- **Agency:** `price_cents_annual` to 99000, `keyword_tracking` to 2000, per-site overage beyond 50.
- **Copy:** use one check count everywhere ("280+"; the highlights currently say "200+"). Remove "checks" from plan highlights. Fix `llms.txt` to match the annual discount.

---

## 6. Cost guardrails

Rough guardrails, to check against real usage:

| Cost | Who pays | Guardrail |
|---|---|---|
| LLM calls for signed-in AI features | Customer (BYOK) | Show the estimated monthly API cost before scheduling. Default to weekly |
| Hosted anonymous AI snapshot | RankCLI | Cache per domain; rate-limit per IP and domain; cheap search-grounded models; cap the monthly spend |
| Scheduled crawls (Fly worker) | RankCLI | Page cap per audit by tier; weekly on Free and Solo |
| Rank tracking SERP calls | RankCLI | Check the provider (SerpAPI at about $0.01 vs DataForSEO at $0.0006 per SERP); weekly cadence below Pro; no "unlimited" |
| GitHub App fix PRs | Customer's key for any AI generation | Per-repo limits on Free and Solo |

**Target:** COGS under 20% of price on every paid tier. At $9 that means under about $1.80 per Solo user per month, which is realistic only if Solo's SERP and crawl usage stays weekly.

---

## 7. Experiments to run once there's traffic

**Can a test tell anything yet?** At a 2% baseline checkout conversion, detecting a lift to 3% (80% power, α = 0.05, two-sided) takes about **3,800 pricing-page visitors per arm**. For activation metrics near 10% (detecting 10% → 13%) it takes about **1,800 signups or runs per arm**. Until then:

- run changes one at a time, as before/after cohorts;
- run a Van Westendorp price-sensitivity survey once you have 50+ signups;
- talk to every paying customer.

Activation tests will reach significance before price tests do, so run them first.

### E1. Hosted first run vs BYOK-required (activation)

- **Control:** after signup, AI visibility asks for an OpenRouter key before the first run.
- **Variant:** the first 2 runs are hosted (5 prompts × 4 assistants, cheap search-grounded models), then the key prompt appears with a cost estimate.
- **Primary metric:** % of new signups completing an AI-visibility run within 24h.
- **Secondary metrics:** % adding a key within 7 days; D7 and D30 retention; free-to-paid at 60 days.
- **Guardrail:** hosted cost per signup under $0.50.
- **Decision:** if the variant raises the key-add rate as well as runs, keep it. If it raises runs but key-adds collapse, launch the $15 hosted pack.

### E2. Where the signup gate sits on the free web audit (top-of-funnel conversion)

- **Control:** everything is open, with signup offered for monitoring.
- **Variant:** score and all issues open; fix code snippets, the shareable link and monitoring require a free account via GitHub OAuth.
- **Primary metric:** anonymous audit → account rate.
- **Secondary metrics:** report share rate; 7-day activation (first monitored site); weekly active sites.
- **Guardrail:** audit completion rate must not drop.

### E3. Tier shape and Pro price (revenue per visitor)

**Stage A (tier shape):**

- **Arm 1:** 4 tiers as recommended.
- **Arm 2:** 3 tiers (Free / Pro $29 / Agency $99), no Solo.

**Stage B (price, after at least 100 checkout starts):**

- **Arm 1:** Pro at $29.
- **Arm 2:** Pro at $39, founding offer shown in both arms.

**Metrics for both stages:**

- **Primary:** revenue per pricing-page visitor (conversion × ARPU).
- **Secondary:** checkout start rate; plan mix; paid logo retention at 60 days; refund rate.
- **Decision:** keep whichever shape and price gives the highest revenue per visitor without hurting 60-day retention. Test Agency at $149 only after 10+ agency conversations.

---

## 8. What to measure now

Wire this before any experiment.

- **North Star:** weekly active sites. These are distinct sites audited by any RankCLI surface (CLI, MCP, Action, web, scheduled) in the last 7 days. CLI and MCP need an opt-in, disclosed anonymous run ping for this.
- **Acquisition:**
  - unique visitors;
  - web audits started and completed;
  - AI snapshots started and completed, plus p95 latency, since it hung until today;
  - Action installs (GitHub code search for `rankcli` in workflows);
  - MCP registry referrals.
- **Activation** (within 24h / 7 days of signup):
  - first monitored site;
  - first scheduled audit delivered;
  - first AI-visibility run;
  - first PR opened and merged.
- **Conversion:**
  - pricing-page views per visitor;
  - checkout starts and completions by plan;
  - free-to-paid at 30, 60 and 90 days;
  - founding seats claimed.
- **Retention:** W1 and W4 weekly active sites per account; monthly paid logo churn; alert-to-fix rate.
- **Economics:**
  - COGS per active site (crawl, SERP, hosted AI);
  - hosted AI spend per signup;
  - ARPU;
  - CAC payback, once any paid channel exists.

---

## 9. Do before pricing matters (high leverage, not pricing)

1. **Prerender rankcli.dev** (marketing pages, blog, pricing, tools), then confirm with `curl -A GPTBot`. Refresh the sitemap and add the AI-visibility tool page and comparison pages to it.
2. **Make the free AI-visibility check the front door:** hosted, fast, cached and shareable. Position it as the free developer-facing version of HubSpot's grader.
3. **Add GitHub OAuth signup.** It avoids a repeat of the email-confirmation failure, and it's what developers expect.
4. **Build comparison pages from the table above,** for example "Otterly alternative", "Lighthouse CI for SEO", "squirrelscan vs RankCLI" and "Screaming Frog alternative for CI". The verified prices are the content.
5. **List everywhere developers look:**
   - Show HN;
   - MCP registries: the official registry, Smithery, Glama, mcp.so;
   - GitHub Marketplace for the Action;
   - a Claude Code plugin/skill listing, as squirrelscan has done;
   - Product Hunt.
6. **Fix the copy inconsistencies:**
   - "200+" vs "280+" checks;
   - the annual discount: 33% in the config vs 20% in `llms.txt`;
   - the README pricing table says API access starts at Pro, while the config gives Solo API access too;
   - "100 checks" on Free.

---

## Sources

All accessed 2026-09-18.

- AI visibility / GEO:
  - [HubSpot AI Search Grader](https://www.hubspot.com/ai-search-grader)
  - [HubSpot AEO](https://www.hubspot.com/products/aeo)
  - [Otterly pricing](https://otterly.ai/pricing)
  - [Peec agency pricing](https://peec.ai/pricing-agencies)
  - [Peec review (SE Ranking, 2026-08-28)](https://visible.seranking.com/blog/peec-ai-review/)
  - [Profound pricing](https://www.tryprofound.com/pricing)
  - [Profound pricing (Maintouch)](https://maintouch.com/blogs/profound-ai-pricing)
  - [Scrunch pricing](https://scrunch.com/pricing/)
  - [AthenaHQ pricing](https://www.athenahq.ai/pricing)
  - [Semrush AI Visibility Toolkit](https://www.semrush.com/pricing/ai/)
  - [Ahrefs pricing](https://ahrefs.com/pricing)
  - [SE Ranking subscription](https://seranking.com/subscription.html)
  - [LLMrefs pricing](https://llmrefs.com/pricing)
  - [Rankscale pricing](https://rankscale.ai/pricing)
  - [Trakkr pricing](https://trakkr.ai/pricing)
- Developer / CI SEO:
  - [squirrelscan](https://squirrelscan.com/)
  - [squirrelscan GitHub](https://github.com/squirrelscan/squirrelscan)
  - [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
  - [Unlighthouse](https://unlighthouse.dev/)
  - [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools)
  - [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)
  - [Screaming Frog licence](https://www.screamingfrog.co.uk/seo-spider/licence/)
  - [Sitebulb pricing](https://sitebulb.com/pricing/)
  - [Sitebulb (TMB)](https://thatmarketingbuddy.com/pricing/sitebulb)
  - [Seobility pricing](https://www.seobility.net/en/pricing/)
  - [SEOptimer pricing](https://www.seoptimer.com/pricing)
  - [DataForSEO SERP pricing](https://dataforseo.com/pricing/serp/google-organic-serp-api)
  - [seo-analyzer](https://www.npmjs.com/package/seo-analyzer)
  - [SEOnaut](https://github.com/stjudewashere/seonaut)
- Suites and dev-tool anchors:
  - [Semrush prices](https://www.semrush.com/prices/)
  - [Moz Pro (costbench, secondary)](https://costbench.com/software/seo-tools/moz-pro/)
  - [Sentry pricing](https://sentry.io/pricing/)
  - [Checkly pricing](https://www.checklyhq.com/pricing/)
- Cost inputs:
  - [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
  - [Perplexity API pricing](https://docs.perplexity.ai/getting-started/pricing)
  - [OpenRouter web search](https://openrouter.ai/docs/features/web-search)
  - [SerpAPI pricing](https://serpapi.com/pricing)
- Crawlers and RankCLI data:
  - [Vercel: The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler)
  - npm downloads API (`api.npmjs.org/downloads/...` for `@rankcli/cli`, `@rankcli/mcp-server`, `unlighthouse`)
  - npm registry (`registry.npmjs.org/@rankcli/cli`)
  - [rankcli.dev/llms.txt](https://rankcli.dev/llms.txt)
  - [rankcli.dev/sitemap.xml](https://rankcli.dev/sitemap.xml)
