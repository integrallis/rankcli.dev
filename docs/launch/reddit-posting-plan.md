# Reddit posting plan — paste-ready, in order

> Numbers in this file come from [VERIFIED-NUMBERS.md](./VERIFIED-NUMBERS.md). Re-check before posting.

The account under `bsbodden@integrallis.com` is aged and active, which removes the only real
blocker. Post these by hand from that account. Do not automate them: the scheduler advances its
slot by elapsed time rather than by posts sent, so three of the four are already unreachable by
`growth-ops`, and posting by hand is faster than fixing that.

**Numbers below are verified against a live run on 2026-09-27** (`@rankcli/cli@0.0.45`):
homepage **75/100**, **AI Readiness 67**, **0 errors** (v0.0.46). Re-check before
posting if it's been more than a few days — a stale number is the fastest way to lose a thread.

## Order and spacing

One post every two days, each in a **different** subreddit. Rapid multi-subreddit self-promo is
the exact pattern that trips spam filters, and a removed post costs more than a delayed one.

| Day | Subreddit | Angle | Why this order |
|---|---|---|---|
| 1 | **r/webdev** | Cloudflare → Googlebot | Real news, time-sensitive, largest audience |
| 3 | **r/SideProject** | Dogfooding, 71/100 | Friendliest to self-promo; low risk |
| 5 | **r/programming** | The data behind AI SEO | Harshest crowd; needs the strongest post |
| 7 | **r/SaaS** | Positioning vs. dashboards | Slowest burn, smallest lift |

**Post Tue–Thu, 8–10am US Eastern.** Read each subreddit's self-promotion rule before posting —
r/webdev and r/programming both remove promotional posts on sight, which is why these lead with
the information and mention the tool once, in passing.

**Then reply to every comment for the first two hours.** This matters more than the post text.
An author who answers questions is what turns a thread into a front page; one who drops a link
and leaves gets buried.

---

## Day 1 — r/webdev

**Title**

```
Cloudflare's Sept 15 default can block Googlebot on ad-supported pages, because Googlebot is a "mixed-use" crawler
```

**Body**

```
Since 2026-09-15, Cloudflare blocks AI Training and Agent crawlers by default on ad-supported
pages. It applies to new domains, new sites on existing accounts, and free-tier accounts that
haven't changed the setting. Existing paid customers were notified and can opt out in zone
security settings.

The part I hadn't seen discussed: Googlebot is *mixed-use*. It crawls for Search and for AI
training in one bot, and mixed-use crawlers are treated under whichever rule is most
restrictive. So a site blocking Training crawlers — including through the legacy "Block AI
Bots" toggle — can also be blocking Googlebot on its ad-supported pages, unless it explicitly
opted out.

If you're on Cloudflare and haven't looked at that setting since the 15th, it's worth checking
which crawlers actually reach you now. I maintain a CLI that checks this among other technical
SEO things — `npx @rankcli/cli audit -u yoursite.dev`, no signup, runs locally — but you can
also just curl your own robots.txt and check the zone settings by hand.

Has anyone actually seen impressions drop since the 15th? Curious whether this is showing up in
Search Console yet or whether it's too early.
```

The question at the end is the point. It gives people something to answer that isn't "nice tool".

---

## Day 3 — r/SideProject

**Title**

```
Built an SEO tool that audits sites the way CI audits code — spent this week finding three bugs in it by running it on ourselves
```

**Body**

```
RankCLI is SEO and GEO (AI-search-citation) checks that run in CI and open a pull request when
something's fixable, instead of another dashboard alert nobody reads.

We publish our own audit score weekly whether it went up or not. It's 75/100 today. Getting
there this week meant finding three bugs by pointing the tool at ourselves, and all three were
reporting *errors* — the severity people actually act on:

- Our noindex /login was flagged "your content is likely invisible to Google". It's noindex on
  purpose. Every SaaS has a /login, so this fired for everybody.
- Any dark-themed page failed colour contrast. The checker read only an element's own inline
  style and assumed white when it found no background — our text is 9:1 and it reported 2.56:1.
- The one that stung: our AI Readiness score was 1%. I assumed our content was bad. Then I ran
  the same check against stripe.com (13), vercel.com (7), cloudflare.com (0) and
  docs.astro.build (0). A documentation site — the ideal AI-citation target — scored zero. The
  metric was saturated and meaningless. The category had 3-4x more checks than any other and
  was using the same per-check penalty, so every real page blew past 100 points of deduction
  before the interesting checks counted. Those five now spread 52-71.

The lesson I keep relearning: a confident wrong "critical" is worse than a missing check,
because it teaches people the red ones are noise.

Free tier runs entirely local via MCP (`npx @rankcli/mcp-server`), no signup. Happy to answer
anything about the build.
```

Leading with your own bugs is the move here. r/SideProject rewards candour and is immediately
suspicious of a flawless launch post — and the AI-readiness story is genuinely the best thing
you have, because it is a measurement failure anyone who has built a scoring system recognises.

## Day 5 — r/programming

**Title**

```
Being crawled isn't the win any more; being cited is (35% more organic clicks, 91% more paid)
```

**Body**

```
Seer Interactive tracked 3,119 informational queries across 42 organizations — 25.1M organic
impressions, 1.1M paid — between June 2024 and September 2025. On queries showing an AI
Overview, organic CTR fell 61%, from 1.76% to 0.61%. Paid fell 68%.

The part I find more interesting: brands actually *cited* in the AI Overview saw 35% more
organic clicks and 91% more paid clicks than uncited brands.

Worth stating the obvious caveat, because it's the first thing I'd ask — that's correlation.
Seer are explicit that they can't show citation *causes* the lift, and the plausible reverse
reading is that brands with more authority and better baseline CTR are the ones Google's model
tends to cite. Either way, ranking and being cited have come apart, and most SEO tooling still
only measures the first one.

What makes this tractable is that citation-readiness looks much more like static analysis than
like marketing: is there structured data, is the content answer-shaped, can GPTBot and
ClaudeBot actually reach the page. Those are deterministic checks. They run in CI and fail the
build.

That's the thesis behind a CLI I've been building. Source for the numbers:
seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update

Mostly I'm curious whether people here think citation-readiness is a real engineering concern
or just SEO with new vocabulary.
```

**The statistics are verified** (Seer Interactive, Sept 2025 update; 3,119 queries / 42 orgs /
25.1M organic impressions). The earlier draft of this post attributed them to "Google's own
numbers", which was wrong and would have been caught — they are Seer's. It also said CTR fell
to "under 1%", which understates the actual 1.76% to 0.61%. Both corrected above, along with
the correlation caveat, which is better raised by you than by a commenter.


---

## Day 7 — r/SaaS

**Title**

```
Every "AI SEO" tool is a $29–$2,000/mo dashboard for marketing teams. We built the CI-native one instead
```

**Body**

```
Researched the GEO/AI-visibility space before building and found the same product everywhere: a
monitoring dashboard priced for marketing budgets that tells you whether ChatGPT mentioned your
brand. None of them run in CI, and none ship a fix as a pull request.

Pricing we landed on, for anyone weighing a similar decision: the CLI, the MCP server and the
GitHub Action are free forever, AI features run on the user's own API key so the free tier costs
us nothing per-user, and paid plans start at $9/mo for scheduled audits and hosted history.
Putting the expensive part on the user's own key is what made an actually-unlimited free tier
possible.

Happy to talk through the pricing reasoning if it's useful — that decision took longer than the
product did.
```

---

## After the posts

**Create r/rankcli** (values in `reddit-community-setup.md`). Two minutes, and worth doing once
the posts are live so arrivals have somewhere to land. It is not an acquisition channel on its
own — nobody finds a product by browsing to its empty community — so it comes after, not before.

**Submit Product Hunt.** The draft in `product-hunt.md` has never been submitted and is the only
realistic path to a large single-day number. Reddit builds a floor; PH is the spike.

**Reddit Ads** (`reddit-ads-2026-09.md`) once `CF_BEACON_TOKEN` is set. Without analytics you
cannot tell a good ad group from a bad one, so paid spend before that is spend without a
feedback loop.
