# Reddit Ads — the paid plan

Reddit Ads is a better fit for RankCLI than Meta, for one structural reason: **community
targeting**. You can buy impressions inside r/webdev and r/devops specifically. On Meta you buy
"people who like software development" and hope. For a developer tool that difference is the
whole game.

It also removes the problem that was blocking us: **ads require no karma and no account
history**. The organic route needs an aged account to survive subreddit spam filters. Paid
placements skip that entirely.

## Setup

Creating the account is free — no setup fee, no monthly platform fee, no minimum just to have
one.

1. **Sign up at ads.reddit.com with `bsbodden@gmail.com`**, not `brian@rankcli.dev`. Reddit
   requires a verified email, and mail to our forwarded domain is the thing that failed — see
   the diagnosis in the session notes: Reddit publishes DMARC `p=reject`, and forwarding breaks
   SPF alignment, so Google can drop it silently.
2. You'll be asked for first/last name, the **legal business name** (Integrallis Software, LLC —
   it appears in the ad and on the receipt), industry, country and currency.
3. Add a payment method.

## What it costs, honestly

| | Range | Median |
|---|---|---|
| CPC | $0.50 – $4.00 | **$1.25 – $1.85** |
| CPM | $3 – $15 | **~$6.50** |
| Minimum daily budget | $5/campaign | $20–50/day for a real test |
| Minimum lifetime budget | $25 | |

### The 1,000-users-in-7-days math

Worth doing before spending anything.

At a median $1.55 CPC, 1,000 *clicks* is about **$1,550**. But a click is not a user. A
free-tier developer tool converting landing-page visitors to signups at 5–15% means 1,000
signups needs roughly 7,000–20,000 clicks: **$11,000–$31,000**.

At a sane $20–50/day for a week ($140–350), expect **90–225 clicks** and, realistically,
**10–30 signups**.

So: paid Reddit will not produce 1,000 users in 7 days at startup budget. Nothing will, on paid.
That number comes from an organic spike — a Product Hunt launch or an HN front page — and the
Product Hunt draft in `product-hunt.md` has still never been submitted. **Run both.** Paid
Reddit is the steady, measurable channel underneath the spike, not a substitute for it.

## Targeting

Community targeting, tiered by how well the audience matches what we actually sell.

**Tier 1 — buy these first.** People here have the problem and can act on it today:
`r/webdev` · `r/nextjs` · `r/reactjs` · `r/sveltejs` · `r/vuejs` · `r/astrojs` · `r/devops`

**Tier 2 — broader, cheaper, less qualified:**
`r/programming` · `r/javascript` · `r/typescript` · `r/selfhosted` · `r/SaaS` · `r/indiehackers`
· `r/EntrepreneurRideAlong`

**Tier 3 — the Agency tier's audience, test separately with different creative:**
`r/bigseo` · `r/SEO` · `r/juststart` · `r/agency`

Do **not** mix Tier 3 with Tiers 1–2 in one ad group. They want different things: developers
want the free CLI, agency owners want white-label reports at $99/mo. One creative cannot do
both, and the mixed audience will make the numbers unreadable.

Also enable **conversation placement** — ads that sit inside comment threads. It is the most
native-feeling Reddit format and the one that works best for tooling.

## Creative

Reddit punishes anything that looks like a marketing asset. The winning ad looks like a post:
plain language, a real screenshot, no stock photography, no slogans, no exclamation marks.

Use the assets already in `ad-assets/` — they are real captures of `rankcli audit` running, and
the dark terminal reads as native on Reddit. The Meta angles in
`zeely-production-2026-09.md` are mostly wrong here; these are the ones that fit.

### Ad 1 — CI/CD (Tier 1)

> Your tests run on every push. Your SEO doesn't.
>
> RankCLI runs 280+ technical SEO and AI-search checks from your terminal or your CI pipeline,
> and opens a pull request with the fix. Free forever on the CLI — no signup to try it.
>
> `npx @rankcli/cli audit -u https://your-site.dev`

**Headline:** SEO checks that run in CI · **→ rankcli.dev/free-audit**
**Creative:** `tall-1x1.mp4` or `hero-report-1x1.png`

### Ad 2 — AI readiness (Tier 1 + 2)

Our own AI Readiness score is 1%. Leading with our own bad number is the most Reddit-native
move available, and it is true.

> Can ChatGPT actually read your site?
>
> We checked ours. AI Readiness: 1%. That's rankcli.dev, the site of the tool that runs the
> check — we publish the score weekly whether it went up or not.
>
> Free check, no signup: GPTBot, ClaudeBot, PerplexityBot, and whether Googlebot still reaches
> you after Cloudflare's Sept 15 default.

**Headline:** Can AI assistants read your site? · **→ rankcli.dev/free-audit**

### Ad 3 — The Cloudflare angle (Tier 1, time-sensitive)

Real, verified, and recent. This is news, which is the only kind of ad Reddit forgives.

> Since Sept 15, Cloudflare blocks AI crawlers by default on ad-supported pages. Googlebot is a
> "mixed-use" crawler, so it's treated under whichever rule is most restrictive — which means
> blocking AI bots can block Googlebot too, unless you explicitly opted out.
>
> Free check for whether it hit you, no signup.

**Headline:** Cloudflare's Sept 15 default may have blocked Googlebot too

### Ad 4 — Agency (Tier 3 only)

> You audit the client's site. You write up the findings. You bill for the fix.
> The audit and the write-up are the part a machine should be doing.
>
> 50 client sites, audited daily, white-label reports with your logo. $99/mo.

**Headline:** Stop hand-writing SEO audits · **→ rankcli.dev/pricing**

## How to judge it

Send Tier 1 and 2 to **`/free-audit`**, not the homepage and not `/pricing`. It needs no signup,
so the click has somewhere useful to land, and a developer who runs one audit is a far warmer
lead than one who bounced off a pricing table.

Tag every link so Cloudflare Web Analytics can separate them — this requires `CF_BEACON_TOKEN`
to be set, which it currently is not, and without it none of this is measurable:

```
rankcli.dev/free-audit?utm_source=reddit&utm_medium=cpc&utm_campaign=ci-cd&utm_content=r-webdev
```

Judge on **cost per free-audit run**, not clicks. Kill any ad group above **$5 per audit run**
after $100 spent — at that price the funnel cannot support a $9–29/mo product.

Expect Tier 3 (agency) to cost more per click and convert better per dollar. If it doesn't,
that is real evidence Meta is the wrong place for the Agency tier too, and worth knowing before
the Zeely month runs out.

## The thing paid ads cannot buy

The four hand-written posts in `campaign-config.json` are still the highest-reward Reddit play,
and they are free. Ads and organic are not substitutes: an ad buys a slot, a good r/webdev post
buys a front page. Post them from a personal account with history — the paid account does not
help the organic one.
