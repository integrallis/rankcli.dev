# Start here

There are fifteen files in this directory and some of them contradict each other, because they
were written across several sessions as things changed. This one is the index. If it disagrees
with another file, this one is right — and fix the other one.

**Last verified: 2026-09-28.**

---

## Do these in this order

### 1. Post to Reddit — by hand, from your aged account. **Closes 2026-10-06.**

The highest-value thing available, and the only one with a deadline. Four posts, written and
fact-checked, one every two days in a *different* subreddit, Tue–Thu 8–10am ET.

**→ [reddit-posting-plan.md](./reddit-posting-plan.md)** — paste-ready titles and bodies

Do not automate them. The scheduler advances its slot by elapsed time rather than by posts
sent, so three of the four are already unreachable by `growth-ops`. By hand is also faster.

Reply to every comment for the first two hours. That matters more than the post text.

### 2. Submit Product Hunt

Written months ago, never submitted. The only realistic path to a large single-day number.

**→ [product-hunt.md](./product-hunt.md)**

### 3. Post to LinkedIn

Credentials work; you said you'd do this one. Copy is in the launch kit.

**→ [launch-kit-2026-09.md](./launch-kit-2026-09.md)** (LinkedIn section)

### 4. Then, and only then, spend money on ads

Both ad plans assume the free channels above are already running. An ad buys a slot; a good
r/webdev post buys a front page.

- **Reddit Ads** — better fit than Meta, community targeting, no karma needed.
  **→ [reddit-ads-2026-09.md](./reddit-ads-2026-09.md)**
- **Meta via Zeely** — you have 10K credits and a paid month. Strategy first, then execution:
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
| IndexNow | Working — 22 URLs submitted to Bing, Yandex, Seznam, Naver |
| MCP distribution | Official registry, Glama, Smithery, awesome-mcp-servers; mcp.so queued |
| Ad creative | Re-recorded 2026-09-28 in `ad-assets/` — 75/100, 0 errors, AI Readiness 67 |

## What is broken or blocked

| | |
|---|---|
| **Mastodon** | Token in `.env` is **invalid**, and was never added to GitHub secrets. Regenerate at mastodon.social → Preferences → Development with `write:statuses`, then `gh secret set` both values |
| **X / Twitter** | No credentials anywhere. Deliberate — the free tier ended Feb 2026, roughly $0.20 per post with a link |
| **Reddit account** | `accounts.md` says `u/rankcli` is pending registration, but you have an aged account under `bsbodden@integrallis.com`. Use the aged one — a new account posting links gets auto-removed |
| **Email to `@rankcli.dev`** | Only `brian@`, `support@` and `admin@` exist — there is no catch-all. And forwarding breaks DMARC for `p=reject` senders like Reddit, which is why signup mail vanished. Use a direct `@integrallis.com` address for signups |

## Numbers

Never type a score from memory into a post. Every figure lives in one place, with the command
to refresh it.

**→ [VERIFIED-NUMBERS.md](./VERIFIED-NUMBERS.md)**

As of 2026-09-28: **75/100**, **0 errors**, **AI Readiness 67**, 32 frameworks detected,
11 with fix recipes, 15 MCP tools, 280+ checks.

## Reference, not instructions

- [mcp-discovery.md](./mcp-discovery.md) — how MCP users actually find a server, and why more
  directory submissions will not help
- [mcp-directories.md](./mcp-directories.md) — listing copy, all submitted
- [reddit-community-setup.md](./reddit-community-setup.md) — form values for r/rankcli. Hold the
  name, but it is not an acquisition channel; do it after the posts
- [accounts.md](./accounts.md) — which account owns what
- [automation-setup.md](./automation-setup.md) — how `growth-ops` decides what posts when
- [facebook-groups.md](./facebook-groups.md) — group-by-group notes
- [announcement.md](./announcement.md) — short-form blurbs

## Dead

- [social.md](./social.md) — superseded. Quotes a 60/100 score, 13 MCP tools and the old
  pricing. Kept for phrasing only.

---

## Why this file exists

Three documents in here were overtaken by things discovered hours after they were written: ad
assets showing an AI Readiness of 1% that turned out to be a scoring bug, a Reddit ad built on
that same 1%, and a Meta-pixel instruction that contradicted the site's own privacy policy.

None of that is visible from a directory listing. Check the date at the top of this file before
trusting anything here, and when something turns out to be wrong, fix it here first.
