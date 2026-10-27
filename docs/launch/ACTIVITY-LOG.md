# Promotion activity log

Everything actually done, with outcomes where they are known. Kept because the plans describe
intent and this describes what happened, and the two diverged more than once.

Baseline on 2026-09-28: **9 registered users**, of which 3 are `@integrallis.com`, 1 is a
disposable address, and 2 of the remaining signed in once and never returned. Real external
users are somewhere between 1 and 5.


## Status on 2026-10-13 (measured, not remembered)

Sources: the `e2e-check-auth-config` diagnostics run, the npm downloads API, the GitHub API, the
Bluesky and Dev.to public APIs, the HN Firebase API. The three `@integrallis.com` accounts and the
founder's test subscriptions are included in the user counts below.

| | |
|---|---|
| Accounts | **17** (8 Google, 7 email, 2 GitHub). Before launch 3; week of Aug 31: 3; Sep 14: 1; Sep 21: 1; Sep 28: 2; **Oct 5: 7**; since: 0 |
| Plans | 13 free, 2 Pro, 1 Solo, 1 Agency (the paid rows are almost certainly the founder's own test accounts) |
| Free audits | 31 in the week of Oct 5 (7 left an email), 12 / 17 / 17 the three weeks before. **0 recorded conversions** to signup; conversion is only measurable when an email was entered |
| Audits by users | 11 manual audits finished in the last 7 days, latest 2026-10-09 |
| Show HN | **Dead.** Submitted 2026-09-30 19:32 UTC from `integrallis` (account created 2026-09-06, karma 7). HN marked it dead at 1 point, 0 comments; Algolia does not index it; nobody saw it. The log above said "Pending" |
| HN account | 7 karma, 4 comments on 2026-10-02, 1 dead story |
| Bluesky | 16 posts, **2 followers**, 1 like total (the first dogfood post) |
| Dev.to `rankcli` | 5 articles. The Cloudflare/Googlebot one: 7 reactions, 2 comments. The other four: 0 reactions |
| npm `@rankcli/cli` | 67 downloads last week; 0 to 6 a day outside release days. The spikes (1,382 on Sep 27) are release days, CI and mirrors, not users |
| GitHub | `rankcli-mcp-server` 1 star, 2 views in 14 days; `rankcli-action` 0 stars, 0 views, **not on the GitHub Marketplace** (both slug guesses 404) |
| growth-ops | Posts the weekly score to Bluesky. LinkedIn switched off 2026-10-27; Mastodon, Discord and X unconfigured; Dev.to disabled; Reddit API still gated |
| Founder checklist | Google OAuth and GitHub App OAuth secrets still unset; 0 Search Console connections; deep audits run |
| Reddit | Comments logged: 2 (2026-09-30). Posts: 0 since the removals. The Reddit Ads campaign was **never created** (founder, 2026-10-13); the pixel fires for nobody |
| Traffic | 20 to 80 page loads a day, 0 to 20 session starts (Cloudflare Web Analytics, Sep 28 to Oct 14); Google search about 10 page loads a week; no HN, Reddit, Bluesky or Dev.to referrer in any week. `node scripts/cf-traffic.mjs` prints it |

What drove the 7 signups and 31 free audits in the week of Oct 5, from Cloudflare Web Analytics
(read 2026-10-15 with `scripts/cf-traffic.mjs`; counts are samples rounded to tens): the site
gets 20 to 80 page loads a day in total, 0 to 20 of them session starts, and a fair share of
that is the founder (the referrers animerm.ai, kmpilot.dev and moobi.dev carry no RankCLI link).
The signup-week cohort is unmistakable: 170 page loads from Bangladesh and Pakistan between
Oct 4 and Oct 8, zero the week before and zero after Oct 10, arriving with no referrer at all
(20 page loads that week came through an Android in-app webview), landing on `/`,
`/free-audit`, `/login`, `/docs` and the dashboard. That is the audience of SEO Facebook
groups, and the timing fits: two to six days after the founder's 2026-10-02 posts to 15 SEO/GEO
groups, which is when held posts get approved. Ten sampled page loads from `l.facebook.com` in
the week of the posts are the only direct trace. No HN, Reddit, Bluesky or Dev.to referrer
appears in any week, and Google search sent about 10 page loads a week. So the one channel
that produced signups reached SEO freelancers, which fits a $9 to $99 developer tool badly,
and the developer channels have produced no measurable visit.

### 2026-10-27

- LinkedIn automatic posting switched off at the founder's request: `"enabled": false` on the
  `linkedin` channel in `docs/launch/campaign-config.json` (the scheduler reports "disabled in
  config"), and `release-announce` no longer defaults to LinkedIn; it still posts there if
  `linkedin` is typed into its channels input. The secrets stay in place.

### 2026-10-15

- Founder checklist re-verified against production with a Supabase management token that now
  reaches the project. Analytics (item 2) had been live since 2026-09-28 and is marked done.
  `GITHUB_APP_CLIENT_ID` / `GITHUB_APP_CLIENT_SECRET` set on production from the App pair in
  `.env` (GitHub accepted the pair first); item 4 now needs only the OAuth-at-install tick on
  the App. `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` confirmed absent; the Google Cloud
  project behind sign-in is 432973813243. Plugin workflow diagnose run: `npm trust list` is 403
  on the bypass token, stubs `0.0.0-stage` still present on all three packages, window closes
  2026-10-16. Marketplace slugs still 404. The `.env` test login no longer works on production.
  Open: items 1, 3, 5, 6, 7, 8, the tick in 4.
- Cloudflare Analytics token and account id added to `.env`; `scripts/cf-traffic.mjs` written
  (loads and visits by day, referrer, path, country, device for any date range). First read
  answered the Oct 5 question above: a Bangladesh and Pakistan cohort with no referrer, days after
  the Facebook group posts, and nothing from any developer channel. The founder chose not to
  email the current users.

### 2026-10-13

- Local checkout was 113 commits behind `origin/main`; synced. Of the four audit-accuracy fixes
  left uncommitted on 2026-09-19, three had been re-solved upstream (framework detector rebuilt
  on weighed evidence in v0.0.43, AI readiness recalibrated in v0.0.46, noindex gating in
  v0.0.45) and were dropped. The fourth, YMYL detection that flagged nearly every page on words
  like "price" and "warning", was not upstream; committed as `734b7f1` with tests.
- Found the Show HN dead (above). The activity log had it as pending for two weeks.
- Merged PR #1 on `integrallis/rankcli-mcp-server` (`4ee5d98`): two agent skills (`seo-audit`,
  `seo-ci-gate`) and a Claude Code plugin. `claude plugin validate` passes on `main`;
  `npx skills add integrallis/rankcli-mcp-server` installed both once. Directory submission
  needs the founder (FOUNDER_CHECKLIST §7).
- Published `astro-rankcli`, `vite-plugin-rankcli` and `next-rankcli`, all 0.0.1, through the new
  **Publish framework plugins** workflow. It took three tokens: the January `NPM_TOKEN` was dead,
  the first regenerated one was read-only (npm answered 403 on PUT), the third had read/write on
  all packages and 2FA bypass. npm created a `0.0.0-stage` stub beside each package during that
  publish, which a bypass token may not unpublish. The workflow now tries Trusted Publishing
  first and falls back to the token with a warning; linking each package to OIDC needs a 2FA
  code (FOUNDER_CHECKLIST §8).
- Merged PR #12 (the 2026-10-02 review branch, conflicting with this log) and learned from it that
  the founder posted an intro to 15 SEO/GEO Facebook groups on 2026-10-02, the one event right
  before the week that produced 7 signups. The status section now says so.
- The Astro and Next.js guide pages (`/seo/astro`, `/seo/nextjs`) now show their npm plugins with
  an install line and a snippet from the package README; deployed and checked live.
- Audited rankcli.dev with the published CLI (8 pages: 75/100, 0 errors, 127 findings) and split
  the findings into ours and the checker's. Ours, fixed and deployed: no security headers and
  4-hour caching on hashed assets (`_headers`), Organization schema only on the home page, a
  footer with one unlabelled icon link, a logo with no intrinsic size, 15-character titles and
  190-character descriptions, dark-mode muted text at 4.1:1. Result: homepage **80/100** (from
  75), security 95, performance 60, social 96; VERIFIED-NUMBERS.md updated. The checker's, fixed
  in the runtime for the next release: a logo link counted as an empty anchor, and a brand
  definition only counted if it contained "leading", "premier" or "best".
- **Released v0.0.50** ("seven findings that fired on things every developer site does"):
  DNS-based Search Console and Bing verification, analytics other than Google, stylesheets in
  files (and Tailwind v4 breakpoints), logo links as anchors, plain brand definitions, Bluesky,
  Dev.to, Mastodon and Threads as social profiles, and the YMYL fix. `@rankcli/agent-runtime`
  0.0.38 and `@rankcli/mcp-server` 0.0.23 went with it; the edge audit engine was redeployed with
  the same code.
- With `@rankcli/cli@0.0.50` the homepage audits at **85/100** (13 warnings, 37 notices); the
  seven codes the release targeted are gone from our own report. Native binaries, the Claude
  Desktop extension, Homebrew and Scoop all published for 0.0.50.
- Four comparison pages, every rival fact sourced from the vendor's own pages and dated:
  `/compare/lighthouse-ci`, `/compare/squirrelscan`, `/compare/geoready`,
  `/alternatives/screaming-frog`. Linked from the footer, in the sitemap.
- Founder confirmed the Reddit Ads campaign never ran. The pixel has fired for organic visitors
  only since 2026-09-30.
- Checked what open-sourcing the CLI would reveal: nothing `node_modules` does not already show.
  The published JS is unminified with comments, every package is already `"license": "MIT"`, and
  the premium checks' decrypt passphrase ships in plain text inside `@rankcli/cli`'s own
  `dist/index.js`. Details in COMPETITION-AND-OUTREACH-2026-10.md §3.1.

---

## Channels reached

| Channel | State | Measured result |
|---|---|---|
| Blog (rankcli.dev) | 3 posts live | Indexed, in sitemap |
| Dev.to | 3 articles, account `rankcli` | 10, 14 and 34 views |
| Bluesky `@rankclidev` | 16 posts (2026-10-13) | **1 like, 0 reposts, 0 replies. 2 followers** |
| IndexNow | Working | 35 URLs to Bing, Yandex, Seznam, Naver |
| MCP directories | Listed everywhere that matters | Registry, Glama, Smithery, awesome-mcp-servers; mcp.so queued |
| Reddit organic | 2 comments, 2 posts | **Both posts removed or filtered** |
| Hacker News | Show HN submitted 2026-09-30 | **Dead on arrival.** Item 49913246, `dead: true`, score 1, new account (karma 1 on 2026-10-02). Nobody saw it. See "Status on 2026-10-13" |
| Reddit Ads | **Never run** | Pixel `a2_jrtl7de1quoe` live, PageVisit and Search verified; no campaign was ever created (founder, 2026-10-13) |
| Meta / Zeely | Not started | 10K credits unspent |
| LinkedIn | Not started | Credentials work; owner's call |
| Mastodon | **Dead** | Token invalid, never in CI secrets |
| X / Twitter | **No account** | No credentials anywhere |

**The honest read:** the two channels I could reach on my own, Bluesky and Dev.to, are the two
with no audience. Roughly 24 people saw two days of publishing. Posting to 2 followers is
archiving, not promotion.

---

## Timeline

### 2026-09-27

- Released **v0.0.44**: framework detection rebuilt on scored evidence, 57% to 94% across 32
  frameworks; served-directory awareness for auto-fix PRs; safety layer.
- Fixed the public release notes, which said "Binaries for rankcli vX. Source: <private repo>".
  Every release announcement pointed at a 404 for anyone outside the org.
- Corrected site copy that said "11 frameworks" when the audit names 32.
- Announced v0.0.44 on Bluesky and LinkedIn via the new `release-announce` workflow.

### 2026-09-28

- Released **v0.0.45 and v0.0.46**: three false-positive fixes found by dogfooding, and the
  AI-readiness recalibration.
- Published two blog posts and mirrored both to Dev.to with canonicals back to rankcli.dev.
- **Cloudflare Web Analytics went live.** The site had no analytics at all until this point, so
  nothing before it is measurable.
- Fixed `scripts/indexnow-submit.mjs`, which read a sitemap path that does not exist and had
  therefore never submitted anything since it was written.
- Fixed the MCP registry listing: all 13 entries pointed `repository.url` at a private repo, so
  every directory mirroring the registry showed a 404.
- Added GitHub topics to the public MCP repo, which had none.
- Released **v0.0.47**: Claude Desktop extension (`.mcpb`), one-click install for Cursor and
  VS Code, per-report PR cap scaling.
- Re-recorded every ad asset. The originals showed "AI Readiness: 1%", which was the scoring bug
  fixed hours later. Running those ads would have paid to advertise a broken measurement.

### 2026-09-30

- Released **v0.0.48**: two false errors that could fail a CI build.
- Built 12 framework SEO landing pages at `/seo` from the recipes, 81 checks, prerendered.
- **r/webdev post removed.** That subreddit allows promotion only on Showoff Saturday; it went
  up on a Wednesday. My plan said "post Tue-Thu" and told the reader to check each subreddit's
  rules, which I had not done myself.
- **r/SideProject post not visible in search**, consistent with a silent filter on account
  standing. The removal notice from r/webdev said to comment on other posts first.
- Checked every target subreddit's rules properly. Two of the four posts would have been removed
  as written; r/programming forbids promotion entirely and the post named the CLI.
- Two genuine comments posted, r/CloudFlare and r/TechSEO, both on the edge-crawler issue.
- Built `analyzeCrawlerAccess` after discovering our r/webdev post promised a check we did not
  have. Verified against reddit.com and nytimes.com.
- Released **v0.0.49** so that check is runnable by anyone.
- Published the Cloudflare/Googlebot article to the blog, Dev.to and Bluesky.
- Changed the homepage to lead with `npx @rankcli/cli audit -u ...` instead of
  `npm install -g`, so an arriving developer can run it without committing to anything.
- **Show HN submitted.**
- **Reddit Pixel installed and verified**, `a2_jrtl7de1quoe`. Two bugs found in the process:
  the prerenderer was capturing the script tag Reddit's loader creates at runtime, which would
  have double-counted every `PageVisit`; and `trackFreeAudit()` existed with no call site, so
  the free audit, the action every ad creative asks for, reported nothing. Both fixed. A real
  browser run against the live site now shows `PageVisit` on load and `Search` on audit submit.
- **Declined auto-advanced matching.** Reddit's "Send to Developer" option for email and phone
  would ship visitor PII to Reddit, across GDPR geos, and would make the privacy policy false.
  We collect no phone numbers and have 9 users, so the benefit is nil against a real cost.
- Reddit Ads is no longer blocked on anything. Every field is written in `reddit-ads-setup.md`.
- **Fixed `www.rankcli.dev`, which had been answering HTTP 522 to every visitor.** DNS was
  never wrong; the hostname was attached to the Cloudflare Pages project with status
  `deactivated` and validation `error`, so Pages refused to serve it and Cloudflare proxied to
  nothing. Revalidating the custom domain cleared it. Every inbound link, directory listing or
  pasted URL using www had been hitting a Cloudflare error page, for an unknown length of time.
  Nothing was monitoring it. Found while chasing an unrelated Reddit pixel error.
  - **www now 301s to the apex**, path and query string preserved. The modern dynamic-redirect
    ruleset is unavailable (`CLOUDFLARE_API_TOKEN` lacks `Rulesets > Edit`), so this is a legacy
    Page Rule, which the token could write. Query-string preservation matters for more than
    tidiness: Reddit and every other ad platform append click parameters, and a redirect that
    dropped them would silently break attribution on any ad landing on a www URL.

### 2026-10-02

- **Show HN was dead on arrival.** Item 49913246 was `[flagged]` and `dead`, account karma 1. It looks
  normal to its author, which is why it seemed live. Account karma is being built with genuine comments.
- **Facebook: intro post in 15 SEO/GEO groups**, spaced about 10 minutes apart, from Brian's profile,
  linking rankcli.dev. All 15 went in; most are waiting for admin approval. **WordPress • AI | Speed | SEO |
  Developers removed it within minutes.** Four groups that require admin permission first (Superstar
  SEO, SEO Projects and SEO Jobs, SEO Masterminds Pakistan, SEO & Digital Marketing by Riha Webtech) were
  not posted to. Four that ban promotion were skipped (SEO Philippines, SEO EXPERT, SEO Expert In
  Bangladesh, SEO Masters Academy). Check the approvals in a day before posting anywhere else.

---

## What was learned, and cost something

**The account is the blocker, not the copy.** Reddit expects roughly 90% participation to 10%
self-promotion. Four promotional posts from an account with no history is the wrong ratio
before anyone reads a word. Two removals taught this; no amount of rewriting would have.

**Check the rules of the specific community before posting, not after.** I wrote that
instruction into the plan and did not follow it, and it cost the best post in the best
subreddit.

**Content written before a bug is fixed will advertise the bug.** The ad assets, one Reddit ad
and one Reddit post were all built on an AI Readiness of 1% that turned out to be our own
scoring error. Caught before spending, but only just.

**Documents go stale silently.** Three separate documents were overtaken by things discovered
hours after they were written, none of it visible from a directory listing. `START-HERE.md`
exists because of that, and `VERIFIED-NUMBERS.md` exists so no score is ever typed from memory.

**Distribution is not reach.** Being in every MCP directory produced nothing while every listing
pointed at a 404, and being listed among ten thousand servers is not discovery in the first
place.

---

## Open, in order of expected value

1. **Hacker News.** The 2026-09-30 Show HN was killed on submission (new account, karma 1). Ask hn@ycombinator.com to re-up it; see `REVIEW-2026-10-02.md`.
2. **Reddit standing.** Eight to thirteen more genuine comments to reach roughly 9:1 and clear
   the karma gates. Drafts in `reddit-comments.html`.
3. **r/webdev on Showoff Saturday (2026-10-03)**, using the rewrite in `reddit-posting-plan.md`.
4. **Product Hunt.** Written months ago, never submitted.
5. **Reddit Ads.** Never run as of 2026-10-13. Pixel is live and verified; create the campaign
   from the field values in `reddit-ads-setup.md`.
6. **Repost r/SideProject** once the account carries weight. It is a good post nobody saw.
