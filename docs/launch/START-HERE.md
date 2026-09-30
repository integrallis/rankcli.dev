# Start here

There are fifteen files in this directory and some of them contradict each other, because they
were written across several sessions as things changed. This one is the index. If it disagrees
with another file, this one is right, and fix the other one.

**Last verified: 2026-09-28.**

---

## Do these in this order

### 1. Reddit, build account standing first, do not post again yet

The r/webdev post was **removed on 2026-09-30** (it allows promotion only on Showoff Saturday),
and its notice said to comment on other posts first. The r/SideProject post does not appear in
search, which is what a silent filter looks like, low-standing accounts get filtered with no
notice, and the post still looks normal to its author. Check any post in a private window, not
while logged in.

So the bottleneck is the account, not the copy. Reddit expects roughly **90% participation to
10% self-promotion**; we are at 0/100. This week is comments only, no links, no product, in
r/webdev, r/nextjs and r/SideProject, where the Cloudflare mixed-use crawler change gives us
something genuinely useful to say. Karma gates: 100+ for r/webdev, 200+ for r/SaaS.

**→ [reddit-comments.html]** (generate with `node scripts/growth-ops/reddit-comments.mjs`):
ten topics across seventeen subreddits, each with live searches and an answer to adapt.

**→ [reddit-participation-log.md](./reddit-participation-log.md)**: the 90/10 ratio ledger.
Two comments logged on 2026-09-30, both on the Cloudflare crawler issue.

**→ [reddit-posting-plan.md](./reddit-posting-plan.md)**: the posts and the per-subreddit rules

### 2. Submit Product Hunt

Written months ago, never submitted. The only realistic path to a large single-day number.

**→ [product-hunt.md](./product-hunt.md)**

### 3. Post to LinkedIn

Credentials work; you said you'd do this one. Copy is in the launch kit.

**→ [launch-kit-2026-09.md](./launch-kit-2026-09.md)** (LinkedIn section)

### 4. Reddit Ads, 15 minutes once, then it runs itself

You have the account and a budget. This is the automated path: set it up once and it keeps
serving, unlike organic posting where every post costs another hour.

**→ [reddit-ads-setup.md](./reddit-ads-setup.md)**, exact fields to enter, creative ready

Blocked on one thing: the **Reddit conversion pixel ID**. Reddit requires a
`conversion_pixel_id` on every ad group, so no pixel means no campaign. Create it in Events
Manager, hand over the id, and the site picks it up on the next deploy - the code is already
shipped and inert until that variable is set.

### 5. Then, and only then, the rest of the ad spend

Both ad plans assume the free channels above are already running. An ad buys a slot; a good
r/webdev post buys a front page.

- **Reddit Ads**, better fit than Meta, community targeting, no karma needed.
  **→ [reddit-ads-2026-09.md](./reddit-ads-2026-09.md)**
- **Meta via Zeely**, you have 10K credits and a paid month. Strategy first, then execution:
  **→ [zeely-ads-2026-09.md](./zeely-ads-2026-09.md)** (why Meta only works for the Agency tier)
  **→ [zeely-production-2026-09.md](./zeely-production-2026-09.md)** (what to generate, and the
  pre-flight checks)

---

## What is already done

| | |
|---|---|
| Analytics | **Live.** Cloudflare Web Analytics, cookieless, one beacon on every page since 2026-09-28 |
| Blog | Two posts live on rankcli.dev/blog |
| Dev.to | Two articles published on the `rankcli` account, both canonical to rankcli.dev |
| Bluesky | Two posts from `@rankclidev.bsky.social` |
| IndexNow | Working, 22 URLs submitted to Bing, Yandex, Seznam, Naver |
| MCP distribution | Official registry, Glama, Smithery, awesome-mcp-servers; mcp.so queued |
| Ad creative | Re-recorded 2026-09-28 in `ad-assets/`, 75/100, 0 errors, AI Readiness 67 |

## What is broken or blocked

| | |
|---|---|
| **Mastodon** | Token in `.env` is **invalid**, and was never added to GitHub secrets. Regenerate at mastodon.social → Preferences → Development with `write:statuses`, then `gh secret set` both values |
| **X / Twitter** | No credentials anywhere. Deliberate, the free tier ended Feb 2026, roughly $0.20 per post with a link |
| **Reddit account** | `accounts.md` says `u/rankcli` is pending registration, but you have an aged account under `bsbodden@integrallis.com`. Use the aged one, a new account posting links gets auto-removed |
| **Email to `@rankcli.dev`** | Only `brian@`, `support@` and `admin@` exist, there is no catch-all. And forwarding breaks DMARC for `p=reject` senders like Reddit, which is why signup mail vanished. Use a direct `@integrallis.com` address for signups |

## Numbers

Never type a score from memory into a post. Every figure lives in one place, with the command
to refresh it.

**→ [VERIFIED-NUMBERS.md](./VERIFIED-NUMBERS.md)**

As of 2026-09-28: **75/100**, **0 errors**, **AI Readiness 67**, 32 frameworks detected,
11 with fix recipes, 15 MCP tools, 280+ checks.

## Reference, not instructions

- [mcp-discovery.md](./mcp-discovery.md), how MCP users actually find a server, and why more
  directory submissions will not help
- [mcp-directories.md](./mcp-directories.md), listing copy, all submitted
- [reddit-community-setup.md](./reddit-community-setup.md), form values for r/rankcli. Hold the
  name, but it is not an acquisition channel; do it after the posts
- [accounts.md](./accounts.md), which account owns what
- [automation-setup.md](./automation-setup.md), how `growth-ops` decides what posts when
- [facebook-groups.md](./facebook-groups.md), group-by-group notes
- [announcement.md](./announcement.md), short-form blurbs

## Dead

- [social.md](./social.md), superseded. Quotes a 60/100 score, 13 MCP tools and the old
  pricing. Kept for phrasing only.

---

## Why this file exists

Three documents in here were overtaken by things discovered hours after they were written: ad
assets showing an AI Readiness of 1% that turned out to be a scoring bug, a Reddit ad built on
that same 1%, and a Meta-pixel instruction that contradicted the site's own privacy policy.

None of that is visible from a directory listing. Check the date at the top of this file before
trusting anything here, and when something turns out to be wrong, fix it here first.
