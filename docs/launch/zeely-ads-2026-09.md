# Zeely / Meta ad creative, 2026-09

Paste-ready copy for app.zeely.ai. Zeely has no API, so this is a hand-off document, not
automation.

## The brief, and why it is not the obvious one

Meta is the wrong place to sell a $9/mo CLI to developers. Developers do not buy tooling from
a Facebook feed; they buy it from a colleague, a Show HN thread, or a README badge. Paid reach
among people who will never type `npm i` is money spent on impressions that cannot convert.

There is one tier where Meta genuinely works: **Agency, $99/mo**. Agency owners are on
Facebook and Instagram, they already buy software there, and the tier's real selling points -
50 client sites, white-label reports, client report links - land on a non-technical
decision-maker who bills their clients for exactly this work.

So every ad below sells Agency to agency owners. The free CLI is the hook, not the offer.

**Target the buyer, not the user.** The person who converts is the agency owner looking at
margin, not the developer who will run the tool.

### Audience (set this in Zeely)

- Job titles / interests: web design agency, digital marketing agency, freelance web
  developer, WordPress developer, Shopify Partners, SEO consultant
- Behaviours: admins of a business page; small-business software buyers
- Exclude: students, and anyone already in an audience built from rankcli.dev visitors
  (they are cheaper to reach by email)
- Geo: US, CA, UK, AU, DE, NL first - highest agency-retainer prices, so $99/mo reads as
  cheap against what they bill
- Landing page: **https://rankcli.dev/pricing**, not the homepage. The homepage sells the
  CLI to developers, which is the wrong pitch for this audience.

### What not to claim

Everything below is checkable. No invented client counts, no invented rankings, no "guaranteed
#1 on Google". The numbers used - 280+ checks, 50 sites, 32 frameworks detected, the tiers -
are the real ones from `packages/saas/src/config/pricing-tiers.json` and
`packages/saas/src/config/frameworks.json`. Keep it that way: an SEO tool caught exaggerating
its own SEO claims is the only unrecoverable own-goal available here.

---

## Ad 1. The margin angle (lead with this)

**Primary text**

> You audit a client's site. You write up the findings. You bill for the fix.
>
> The audit and the write-up are the part a machine should be doing.
>
> RankCLI runs 280+ technical SEO checks on 50 client sites, every day, and opens the pull
> request with the fix already in it. Reports go out under your logo, not ours.
>
> $99/mo for all 50 sites. One retainer covers it.

**Headline:** Stop hand-writing SEO audits
**Description:** 50 client sites, audited daily. White-label reports. $99/mo.
**CTA:** Learn more

## Ad 2. The white-label angle

**Primary text**

> Your client does not need to know which tool found it.
>
> White-label SEO reports with your branding, a share link you can drop straight into an
> email, and a live widget for your own site. 50 client sites, audited daily, 280+ checks
> each.
>
> The fixes arrive as pull requests your developers review and merge, nothing changes on a
> client site without a human approving it.

**Headline:** SEO reports with your logo on them
**Description:** White-label audits for 50 client sites. $99/mo, cancel anytime.
**CTA:** Learn more

## Ad 3. The dogfood angle (most credible, narrowest appeal)

**Primary text**

> We publish our own score.
>
> rankcli.dev is audited by RankCLI every week and the number goes public whether it went up
> or not. No SEO tool that hides its own score deserves your clients' sites.
>
> 280+ checks, 32 frameworks recognised automatically, daily audits on 50 sites, fixes
> delivered as pull requests.

**Headline:** We audit ourselves in public
**Description:** See this week's score, then run the same audit on your client's site. Free.
**CTA:** Learn more

## Ad 4. Free-first (cheapest clicks, slowest conversion)

**Primary text**

> Run a full technical SEO audit on any URL. No signup, no card, no trial timer.
>
> 280+ checks in about a minute. If it finds something worth fixing, we will open the pull
> request that fixes it.

**Headline:** Free SEO audit, no signup
**Description:** 280+ checks on any URL. See what your client's site is missing.
**CTA:** Try it free, send this one to **https://rankcli.dev/free-audit**

---

## Visuals

Zeely will push you toward stock footage of people looking pleased at laptops. Do not use it -
it says nothing and this audience has seen it ten thousand times. Use instead:

1. A terminal running `rankcli audit`, real output, score visible. Screen-record it; the
   scrolling check list is the whole product in eight seconds.
2. A real pull request diff, the "Files changed" tab of an auto-fix PR. Agency owners
   recognise this as work they currently pay someone to do by hand.
3. A client report with a placeholder logo in the corner, to make white-label concrete.

Square (1:1) for feed, vertical (9:16) for Reels/Stories. Keep on-screen text under ten words:
the terminal is the visual, the copy is the pitch.

## Budget

Start at $10-15/day across Ads 1 and 2 only, one week, and judge on cost per pricing-page
visit rather than on impressions or clicks. If cost per visit is above roughly $3, the audience
is wrong and no amount of creative will fix it. Meta is simply not where this buyer is, and
the money belongs in Reddit (r/agency, r/bigseo), Dev.to, or sponsoring a newsletter agency
owners actually read.

Kill Ad 3 and Ad 4 if they win on clicks but lose on signups. Cheap clicks from developers who
will happily use the free tier forever are not the goal of a paid Agency campaign.
