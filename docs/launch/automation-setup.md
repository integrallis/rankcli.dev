# Growth Ops automation, setup

`.github/workflows/growth-ops.yml` runs daily and posts a real,
self-generated status update (this week's dogfooding audit score) or a
human-curated content item (Reddit) to whichever channels are due today,
per `docs/launch/campaign-config.json`. Cadence, launch-vs-sustain phases,
and campaign duration all live in that config file, nothing in the
workflow itself needs to change to retune "how often" or "for how long."

Every channel is independently gated on its own secrets existing, so this
is safe to merge and enable now, it activates channel-by-channel as you
add credentials. None of that can be done without your account; that's a
platform requirement, not a caution I'm adding.

## How the schedule actually works

`scripts/growth-ops/scheduler.mjs` is a pure function, `(config, date) ->
which channels post today`, with no external state and no network calls,
so it's fully unit-tested (`scheduler.test.mjs`, 15 tests, run with `node
--test scripts/growth-ops/scheduler.test.mjs`). A few things worth knowing
before you edit `campaign-config.json`:

- **`campaign_start`** anchors everything. Whatever weekday it falls on is
  guaranteed to be a posting day for every enabled channel, so launch day
  itself always gets the push, regardless of which day of the week you
  pick. (This was a real bug in an earlier version: hardcoded Mon/Wed/Fri
  patterns meant a Tuesday launch posted nothing on launch day. Fixed by
  anchoring the cadence to `campaign_start`'s own weekday instead.)
- **`posts_per_week`** (1-7) spaces posts evenly across the week from that
  anchor. `phases` lets a channel change cadence over time, e.g. 3x/week
  for the first 4 weeks, then 1x/week indefinitely (see below for why).
- **`content_calendar`** (Reddit) replaces the generated status content
  with a curated, ordered list, each scheduled slot pulls the next
  un-posted item. Once the list is exhausted, that channel goes silent
  rather than looping the same content, repeating an identical post is
  exactly the pattern that reads as spam.
- Test any change before trusting it: `node scripts/growth-ops/scheduler.mjs
  docs/launch/campaign-config.json 2026-09-08` prints the full schedule for
  any date, or trigger `workflow_dispatch` with `simulate_date` set and
  `dry_run: true`.

## Why the cadence numbers are what they are

Researched actual SaaS/dev-tool launch playbooks before picking numbers -
here's what's solid vs. rule-of-thumb (full sourcing: Plausible Analytics'
$1M ARR post-mortem, redship.io's Reddit launch guides, getmonetizely.com
on discount structuring, lets-nara.com's 90-day SaaS demand-gen playbook).

- **Launch-phase cadence (3x/week social, 4 weeks) tapering to sustained
  (1x/week)**: a "3-5x/week for 4 weeks then taper" pattern is cited
  across marketing guides, reasonable default, not a single proven case
  study. Solo-founder guidance is explicit that 1x/week or even 2x/month
  is fine long-term; don't over-commit past what you'll actually sustain.
- **Reddit: 1x/week, across different subreddits, never the same one
  repeatedly, bounded to 4 curated weeks**: this is the one number
  multiple independent sources actually agree on for avoiding spam-flag
  risk. The 90/10 rule (90% genuine participation, ≤10% self-promotion)
  is the dominant cited guideline. Reddit itself never published an
  official ratio, but a cited survey of 500 moderators found 73% apply
  something like it informally. No universal karma/account-age threshold
  exists, sources range from "30-50 karma" to "500+ karma," so treat
  your account's standing as your own judgment call, not something this
  system can determine for you.
- **Dev.to weekly**: no sourced signup/backlink data specific to dev
  tools, this is inference from standard cross-posting practice (publish
  once per article, syndicate same-day with a canonical link back to your
  own site), not proven cadence.
- **Founding-offer: 100 seats OR 90 days, whichever first**: convergent
  guidance is a 3-12 month discount window, 30-50% off, *explicitly*
  bounded rather than open-ended (open-ended discounts reportedly train
  users to expect permanent discounting). No sourced data on optimal seat
  count specifically, 100 is a judgment call, not evidence-backed.

**What's NOT in this system, deliberately**: genuine Reddit community
participation (commenting, helping people before ever mentioning the
product), the 90/10 ratio only works if the 90% is real, and that's not
something a bot should be doing unsupervised. If you want the Reddit
channel to actually land well, that part is on you, separate from what
this automates.

## Free, no approval, safe to enable today

### Bluesky
1. bsky.app → Settings → App Passwords → create one (**not** your main
   password, scoped and revocable).
2. Repo secrets: `BLUESKY_IDENTIFIER` (e.g. `rankcli.bsky.social`),
   `BLUESKY_APP_PASSWORD`.

### Mastodon
1. On your instance: Settings → Development → New Application, scope
   `write:statuses`.
2. Repo secrets: `MASTODON_INSTANCE_URL`, `MASTODON_ACCESS_TOKEN`.

### LinkedIn (your own profile only)
1. Create an app at linkedin.com/developers, request `w_member_social`
   (self-serve, no partner review for personal-profile posting).
2. Complete the OAuth2 flow once for a long-lived token; get your member
   URN (`urn:li:person:...`) from `/v2/me`.
3. Repo secrets: `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_MEMBER_URN`.

This posts as **you personally**, not a company page (that needs partner
approval, not wired up here). LinkedIn's 2026 enforcement crackdown
targeted browser automation/scraping specifically, not sanctioned API
use, but the API surface shifts periodically. Smoke-test with
`workflow_dispatch` before trusting the schedule.

### Dev.to
1. dev.to/settings/extensions → generate an API key.
2. Repo secret: `DEVTO_API_KEY`.

No developer-portal review, no ban risk pattern (publishing an article
isn't spam-flagged the way link-drops are), genuinely the best
reward-to-risk channel in this whole list. Uses a canonical URL back to
rankcli.dev for SEO.

### Discord
Only relevant if you have a community server. Server Settings →
Integrations → Webhooks → New Webhook → copy the URL into repo secret
`DISCORD_WEBHOOK_URL`.

## Costs money, opt in deliberately

### X/Twitter
Free API tier discontinued February 2026. Posting now costs ~$0.015/post,
~$0.20/post with a link (this post has one), roughly $0.80-2.60/month
depending on phase. Adding `TWITTER_BEARER_TOKEN` (developer.x.com,
pay-as-you-go billing) is an explicit decision to pay per post.

## Real ban risk, configured carefully, still your judgment call

### Reddit
1. reddit.com/prefs/apps → create app, type "script".
2. Repo secrets: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`,
   `REDDIT_USERNAME`, `REDDIT_PASSWORD` (script-app password grant, this
   is Reddit's standard flow for a single-user automation like this one,
   not a workaround).

This channel is deliberately the most constrained in the whole system:
capped at 1x/week, only from the curated `content_calendar` (never
generic templated content), across four different subreddits, for four
weeks only. **Read the four drafted posts in `campaign-config.json`
before enabling this**, they're genuinely tailored per subreddit, not
identical cross-posts, because identical cross-posting is exactly the
pattern that gets accounts flagged. Adjust them if they don't sound like
you, but keep the "distinct content per subreddit" principle if you add
more.

## Not wired into this workflow at all, different risk class

### Ad platforms (Google Ads, Meta Ads)
Both have usable APIs (Google Ads: Basic Access application, ~2-5
business day review, faster with brand verification; Meta: Standard
access for your own ad accounts works immediately). Neither is included
here, running paid campaigns needs a real budget number and creative
decision from you, not a place for unattended cron. Ask if you want this
built once you've picked a budget.

### Platforms with no write API, stay manual
- **Hacker News**: no posting API exists at all, full stop.
- **Product Hunt**: read/query API exists, but the maker-launch flow
  itself isn't something to automate. PH's model is built on a human
  maker. Use `docs/launch/product-hunt.md`.
- **mcp.so**: form or GitHub-issue submission, no API.

## Directory listing sync

- **Glama**: fully passive, auto-indexes public MCP servers from GitHub.
  `rankcli-mcp-server` being public is the entire action required.
- **Smithery**: has a CLI publish command; not wired into a workflow yet
  since I couldn't confirm its exact current syntax without publishing
  something unverified. See `mcp-directories.md`.
- **mcp.so**: manual, see `mcp-directories.md`.

## Testing before you trust the schedule

Every platform step logs `::notice::` either way (posted, or skipped and
why, including *why not*, like a missing secret or an unfavorable API
cost). Run `node scripts/growth-ops/scheduler.mjs docs/launch/campaign-config.json
<any-date>` locally to preview any day's schedule with zero risk, or
trigger `workflow_dispatch` with `dry_run: true` to build real content
against the live audit without posting anywhere.
