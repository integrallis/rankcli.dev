# Zeely production run, burning 10K credits before the subscription ends

The subscription is paid and ends in a month. Credits expire with it; **downloaded files do
not**. So the goal is not "run good ads", it is "leave the month owning a creative library you
can still use in six months, on any channel, for free."

Everything below is ordered by what you lose if you run out of time.

---

## Before you generate anything (30 minutes, do not skip)

1. **Check whose ad account the campaign runs in.** Zeely is already connected to the Facebook
   and Instagram accounts, so this is a verification rather than a setup step: in Meta Business
   Suite, confirm the ad account the campaigns sit in is one you own. If it is, cancelling
   Zeely costs you an editor and nothing else, the campaigns and audiences stay yours. If the
   campaigns live in an ad account Zeely owns, they end when the subscription does, and that is
   worth knowing before you spend rather than after.
2. **Measure with what is already live: Cloudflare Web Analytics plus UTM'd links.** The beacon
   is on every page as of 2026-09-28, it is cookieless, and it counts page views by URL, which
   is all the week-one decision needs. Tag every ad so the groups are separable:

   ```
   rankcli.dev/free-audit?utm_source=meta&utm_medium=cpc&utm_campaign=margin&utm_content=a1
   ```

   Judge on **cost per `/free-audit` view**. Not `/pricing`: the creative below sends developer
   traffic to the free audit because it needs no signup, so that is the page that has to be
   counted.

   **An earlier draft of this file said to install the Meta pixel. Do not, without deciding
   two things first.** rankcli.dev's published privacy policy states: *"We do not use
   third-party advertising or cross-site tracking cookies."* A Meta pixel is exactly that, so
   installing one makes that sentence false until the policy is rewritten. And the geo list
   below includes UK, DE and NL, where an advertising pixel needs prior consent, meaning a
   consent banner, on a site that currently needs none.

   That is a real trade, not a formality. The pixel buys conversion optimisation and
   retargeting, which matter at scale and are worth having eventually. It costs a policy
   rewrite, a consent banner, and, for a product whose pitch is publishing its own numbers
   honestly, the awkwardness of a privacy page that had to be walked back. For a seven-day
   read, page views by URL answer the question without any of that.
3. **Mine the competitor ad library first.** It is the one Zeely feature that produces value
   you keep *as notes* rather than as files, and it is the first thing you lose on cancellation.
   Search: `ahrefs`, `semrush`, `screaming frog`, `seo audit`, `white label seo`,
   `agency reporting`. Screenshot every ad that has been running 60+ days, longevity is the
   only public signal that an ad is profitable. Paste the hooks into this file as you go.

## The download checklist (do this weekly, not at the end)

Export as you generate. A tool you have cancelled does not let you back in to fetch the file
you forgot.

- [ ] Every video: MP4, highest quality offered, **9:16 and 1:1 both**
- [ ] Every image: PNG or high-quality JPG, 1:1 and 4:5
- [ ] Any generated script/caption text, paste back into this repo
- [ ] Any avatar you create and like (you cannot regenerate the same face later)
- [ ] Competitor research screenshots

Store them in `docs/launch/ad-assets/`. They are small and they are the asset.

---

## What you already have, that Zeely cannot make

Zeely has no access to the product, so it cannot show the product. These were captured from a
real `rankcli audit` run against rankcli.dev and live in `docs/launch/ad-assets/`:

| File | What it is | Use for |
|---|---|---|
| `tall-9x16.mp4` | Full audit, ending on the report | Reels/Stories hero |
| `tall-1x1.mp4` | Same, square | Feed video |
| `audit-16x9.mp4` | Same, landscape | YouTube, site embed |
| `hero-report-9x16.png` / `hero-report-1x1.png` | The finished report: **75/100, 0 errors, AI Readiness 67%**, React detected | **Static image ads** |
| `audit-tall.gif` | Same, as GIF | Dev.to, Reddit, README, X |
| `audit-tall.cast` | The raw asciinema recording | Re-render at any size |

The score shown is **75/100 with 0 errors**, our own site, measured with the published CLI on
2026-09-28. That is the point, not a flaw. Do not regenerate these with a fake higher number.

**Re-record them if the score moves.** The first set of these showed 71/100 and an AI Readiness
of 1%, and that 1% turned out to be a bug in our own scoring rather than a fact about our
content. Shipping ads built on it would have advertised a broken measurement. To refresh:

```bash
asciinema rec audit.cast --window-size 96x48 --idle-time-limit 0.5 \
  -c "rankcli audit -u https://rankcli.dev --max-pages 1"
agg --theme github-dark --font-size 20 --speed 1.8 audit.cast audit.gif
```

**Upload these into Zeely as the product footage** and let it build around them. An AI-generated
approximation of a terminal will have nonsense text in it, and developers will spot it instantly.

---

## Rule: no fake customers

Zeely will offer AI avatars and "UGC-style" testimonial videos. **Do not generate a person who
claims to be a RankCLI customer.** It is a lie, it violates Meta's advertising policies on
misleading representations, and for a tool whose entire pitch is "we publish our own score
honestly" it is the one thing that makes the product look fraudulent.

Avatars are fine as a **narrator**, a presenter explaining a product is a normal ad. The line
is first-person claims of experience: "I use this every day" is out, "RankCLI audits 50 client
sites daily" is in.

---

# The creative matrix, 24 pieces

Six angles x four formats. Generate all of them; kill the losers with data, not taste.
Roughly 400 credits each leaves headroom for regenerating the winners.

## Angle A. The margin angle (agency owners; lead with this)

> You audit a client's site. You write up the findings. You bill for the fix.
> The audit and the write-up are the part a machine should be doing.

- **A1 · 9:16 video, 15s.** Shot 1 (0-3s): text on black, "Your SEO audit takes 3 hours."
  Shot 2 (3-10s): `tall-9x16.mp4`, terminal running, checks scrolling. Shot 3 (10-15s): freeze
  on the report, text "12 seconds. 50 sites. Every day." End card: rankcli.dev
- **A2 · 1:1 video, 15s.** Same beats, `tall-1x1.mp4`.
- **A3 · static 1:1.** `hero-report-1x1.png`, headline overlay: *"This took 12 seconds"*
- **A4 · static 4:5.** Split: left "3 hours, by hand" / right the report. Caption: *"Same audit."*

**Headline:** Stop hand-writing SEO audits · **Description:** 50 client sites, audited daily.
White-label reports. $99/mo. · **CTA:** Learn more · **→ rankcli.dev/pricing**

## Angle B. White label

> Your client does not need to know which tool found it.

- **B1 · 9:16 video, 12s.** Report frame, then the same report with a placeholder agency logo
  dropped in the corner. Text: "Your logo. Your report. Our 280 checks."
- **B2 · 1:1 video, 12s.** Same.
- **B3 · static 1:1.** Report with placeholder logo. *"White-label SEO reports"*
- **B4 · static 4:5.** Three phone mockups of a client report. *"Send this to your client today"*

**Headline:** SEO reports with your logo on them · **Description:** White-label audits for 50
client sites. $99/mo, cancel anytime.

## Angle C. The honesty angle (highest credibility)

> We publish our own score. 75/100, zero errors. It goes public whether it went up or not.

- **C1 · 9:16 video, 15s.** Open on "Most SEO tools won't show you their own score." Then the
  real run, landing on **75/100**. Text: "Ours is 75. We publish it weekly."
- **C2 · 1:1 video, 15s.** Same.
- **C3 · static 1:1.** `hero-report-1x1.png` unmodified. *"Our own score. Published weekly."*
- **C4 · static 4:5.** Just the number 75/100, huge, on black. *"An SEO tool that shows its work"*

**Headline:** We audit ourselves in public · **Description:** See this week's score, then run
the same audit on your site. Free.

## Angle D. CI/CD (developers; the free tier is the offer)

> Your tests run on every push. Your SEO doesn't.

- **D1 · 9:16 video, 12s.** Terminal run, then a GitHub PR diff. Text: "SEO that runs in CI."
- **D2 · 1:1 video, 12s.** Same.
- **D3 · static 1:1.** Terminal + green check. *"280+ SEO checks. In your pipeline."*
- **D4 · static 4:5.** A PR titled "fix: add robots.txt, sitemap.xml and JSON-LD".
  *"It opens the pull request too."*

**Headline:** SEO checks that run in CI · **Description:** Free forever on the CLI. No signup
to try it. · **→ rankcli.dev/free-audit**

## Angle E. The AI-search angle (newest, least competition)

> ChatGPT can't read your site. You'd never know.

Do **not** use the "our AI Readiness is 1%" line from the first draft of this file. That 1% was
a bug in our own scoring, fixed in v0.0.46, it read near zero for stripe.com, vercel.com and
cloudflare.com too. rankcli.dev is 75/100 with AI Readiness 67. Sell the question, not a
number about us.

- **E1 · 9:16 video, 15s.** Health bars filling across the categories, landing on AI Readiness.
  Text: "Can ChatGPT read your site?"
- **E2 · 1:1 video, 15s.** Same.
- **E3 · static 1:1.** The health-bar block cropped. *"We publish ours. Check yours."*
- **E4 · static 4:5.** *"GPTBot. ClaudeBot. PerplexityBot. Do they reach your site?"*

**Headline:** Can AI assistants read your site? · **Description:** Free check. No signup.

## Angle F. Zero friction (cheapest clicks; run only to build the retargeting pool)

> Full technical SEO audit on any URL. No signup, no card, no trial timer.

- **F1 · 9:16 video, 10s.** Type a URL, hit enter, report appears. Nothing else.
- **F2 · 1:1 video, 10s.** Same.
- **F3 · static 1:1.** *"Free SEO audit. No signup."*
- **F4 · static 4:5.** *"280+ checks. About a minute. No account."*

**Headline:** Free SEO audit, no signup · **→ rankcli.dev/free-audit**

---

## Audience

- **Primary (Angles A, B):** web design agency, digital marketing agency, SEO consultant,
  freelance web developer, Shopify Partners, WordPress developer; business page admins
- **Secondary (D, E):** software developer, DevOps, React/Next.js, GitHub, Stack Overflow
- **Retarget (C):** everyone who hit rankcli.dev and did not sign up. This is the one thing the
  page-view approach cannot do, building that audience needs the pixel, with the policy and
  consent consequences in step 2. Skip this angle for the first week and decide afterwards,
  once you know from the cost-per-visit numbers whether Meta is even the right channel
- **Geo:** US, CA, UK, AU, DE, NL, highest agency retainers, so $99/mo reads as cheap
- **Exclude:** students; existing rankcli.dev users

## Budget and the kill criterion

$10-15/day across **A1, A3, C1, D3** only for the first week. Judge on **cost per
pricing-page visit**, not impressions or clicks.

Above roughly **$3 per pricing-page visit**, the audience is wrong and no creative fixes it -
Meta is not where this buyer is, and the money belongs on Reddit, Dev.to, or a newsletter
agency owners actually read. Say that number out loud before you start, so you are not
negotiating with yourself on day five.

Cheap clicks from developers who will happily use the free tier forever are not a win for a
paid Agency campaign. They are a win for Angle D and F only, which is why those point at
`/free-audit` and not at `/pricing`.

## Claims you may not make

Every number above is checkable against `packages/saas/src/config/pricing-tiers.json` and
`packages/saas/src/config/frameworks.json`: 280+ checks, 32 frameworks detected, 50 sites,
$99/mo, 75/100, 0 errors, AI Readiness 67. No invented customer counts, no invented rankings, no
"guaranteed #1 on Google", no testimonials from people who do not exist.

An SEO tool caught exaggerating its own SEO claims is the only unrecoverable own-goal
available here.
