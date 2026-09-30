# Reddit posting plan — paste-ready, in order

> Numbers in this file come from [VERIFIED-NUMBERS.md](./VERIFIED-NUMBERS.md). Re-check before posting.

**Account age is not the blocker; standing is.** An earlier version of this file said the aged
account "removes the only real blocker". It does not — see "The account is the blocker" below.
r/webdev's removal told us to comment on other posts first, and the r/SideProject post appears
to have been silently filtered. Read that section before posting anything else.

Posting is by hand: Reddit holds new API apps for manual approval under the Responsible Builder
Policy, so `reddit-post.mjs` cannot authenticate yet. `reddit-prefill.mjs` builds a launcher
page with the composer pre-filled, which removes the typing without removing the judgement.

**Numbers below are verified against a live run on 2026-09-27** (`@rankcli/cli@0.0.45`):
homepage **75/100**, **AI Readiness 67**, **0 errors** (v0.0.46). Re-check before
posting if it's been more than a few days — a stale number is the fastest way to lose a thread.

## The rules, checked — read this before posting anything

An earlier version of this file said "post Tue–Thu" and told the reader to check each
subreddit's self-promotion rule. It did not check them itself, and the r/webdev post was
**removed on 2026-09-30** for exactly that reason. Two of these four would have been removed as
written. The rules, verified:

| Subreddit | Self-promotion | Karma gate | Our post as written |
|---|---|---|---|
| **r/webdev** | **Showoff Saturday only.** Any other day is removed | 100+, 30+ days | ❌ Removed 2026-09-30. Needs the Saturday rewrite below |
| **r/SideProject** | **Welcome**, if you show the real product — live URL or demo, not gated behind a signup | 100+ | ✅ Fits. Post this one first |
| **r/programming** | **No promotion at all.** Technical content only | — | ❌ As written it names the CLI. Use the stripped version below |
| **r/SaaS** | Founder stories may mention the product; pure ads removed. **One promotional post per 60 days** (rule added April 2026) | 200+ | ⚠️ Spend the 60-day slot deliberately |

Site-wide, Reddit expects no more than **1 in 10** of your posts and comments to be
self-promotional. Four promo posts from a cold account is the wrong ratio on its own — comment
in these communities between posts, on other people's threads, about things that are not us.

## The account is the blocker, not the copy

r/webdev's removal notice on 2026-09-30 said to comment on other posts first, and the
r/SideProject post did not appear in search afterwards. Those are the same signal: the account
is below the participation bar, and low-standing accounts are **silently filtered**. No
rejection notice arrives, the post looks completely normal to its author, and nobody else ever
sees it. Checking while logged in tells you nothing - open the URL in a private window.

That changes the plan more than any rewrite would. The posts are not the problem.

**Reddit expects 90% participation to 10% self-promotion.** We are at roughly 0/100: four
promotional posts from an account with no history in any of these communities. The fix is not
better copy, it is standing, and standing takes days of genuine commenting - answering
questions in r/webdev and r/nextjs where we actually know the answer, with no link and no
mention of the product.

We have real expertise to spend there. The Cloudflare mixed-use crawler change is live and
costing people traffic - Googlebot's crawl share fell from 57.20% to 27.49% year on year - and
"your CDN is refusing Googlebot even though robots.txt allows it" is a genuinely useful thing
to be able to tell someone. Say it without the link.

Practical sequence:

1. **This week: comment only.** Ten to fifteen substantive replies across r/webdev, r/nextjs,
   r/SideProject. No links, no product. Karma gates are 100+ for r/webdev and 200+ for r/SaaS.
2. **Then repost.** The r/SideProject post is good and was never seen; it can go again once the
   account carries weight.
3. **Meanwhile, ads.** Reddit Ads need no karma and no account history at all, which is exactly
   why they are the parallel track rather than the fallback - see reddit-ads-setup.md.

## Revised order

| When | Subreddit | Why |
|---|---|---|
| **Now** | **r/SideProject** | Welcomes it, post is ready and fits the format |
| **Sat 2026-10-03** | **r/webdev** | Showoff Saturday, using the rewrite below |
| Later, optional | **r/programming** | Only the promotion-free version |
| Once, deliberately | **r/SaaS** | Burns the 60-day slot |

**Then reply to every comment for the first two hours.** This matters more than the post text.
An author who answers questions is what turns a thread into a front page; one who drops a link
and leaves gets buried.

**And check the account first.** r/webdev gates at 100+ karma and 30+ days, r/SaaS at 200+.
Below those, posts are filtered no matter how good they are.

---

## Day 3 — r/webdev — Showoff Saturday only (Sat 2026-10-03)

The news-led version below was removed on 2026-09-30, because r/webdev confines anything
promotional to Showoff Saturday. Showoff Saturday also wants a different shape: technical
detail and the working thing, not a news hook.

**Title**

```
[Showoff Saturday] I rebuilt SEO auditing as a linter — and found five bugs by running it on my own site
```

**Body**

```
RankCLI runs 280+ technical SEO and AI-search checks and exits non-zero in CI, like a linter
rather than a dashboard. Free, no signup, nothing leaves your machine:

    npx @rankcli/cli audit -u https://your-site.dev

Live: https://rankcli.dev — our own score is published weekly, 75/100 today.

The interesting part this week was pointing it at ourselves. Five findings were wrong, and all
five were reporting *errors* — the severity that exits non-zero and breaks a build:

- A noindex /login flagged "your content is likely invisible to Google". It's noindex on
  purpose. Every SaaS has one, so it fired for everybody.
- Dark-themed pages failed colour contrast: the checker read only an element's own inline
  style and assumed white when it found no background. Our text is 9:1; it reported 2.56:1.
- AI Readiness scored 1%. I assumed our content was bad, then ran the same check against
  stripe.com (13), vercel.com (7), cloudflare.com (0) and docs.astro.build (0). A docs site
  scored zero. The category had 3-4x more checks than any other using the same per-check
  penalty, so every real page blew past 100 points of deduction. They now spread 52-71.
- DOM size counted text and whitespace nodes against a threshold borrowed from Lighthouse,
  which counts elements. tailwindcss.com measured 3,231 against 2,230 real elements — 796
  whitespace nodes and 205 comments. Re-indenting a template could fail your build.
- Missing image width/height was an error, which failed svelte.dev, tailwindcss.com,
  rust-lang.org, laravel.com and fastapi.tiangolo.com. It's a real CLS cost, not a broken site.

The lesson I keep relearning: a confident wrong "critical" is worse than a missing check,
because it teaches people the red ones are noise.

Stack is TypeScript, checks run in worker threads, and the framework detector is scored
evidence rather than first-match — that went from 57% to 94% accuracy across 32 frameworks
once it was allowed to answer "unknown".

Happy to go into any of the checks or the detection scoring.
```

Showoff Saturday rewards technical specifics and the live thing. It is also the one day the
tool can be named in that subreddit at all.

---

## Removed on 2026-09-30 — the news-led version, kept for reference

Posting this outside Showoff Saturday is what got it removed. Do not resend it to r/webdev.

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

Source for the numbers:
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
