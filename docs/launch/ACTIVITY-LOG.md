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
| growth-ops | Posts the weekly score to Bluesky and LinkedIn. Mastodon, Discord and X unconfigured; Dev.to disabled; Reddit API still gated |
| Founder checklist | Google OAuth and GitHub App OAuth secrets still unset; 0 Search Console connections; deep audits run |
| Reddit | Comments logged: 2 (2026-09-30). Posts: 0 since the removals. The Reddit Ads campaign was **never created** (founder, 2026-10-13); the pixel fires for nobody |

What drove the 7 signups and 31 free audits in the week of Oct 5 is not knowable from here:
nothing was published or pushed that week (only the weekly Bluesky post, 0 likes), and the
Cloudflare Web Analytics referrer report is only in the dashboard. Check Cloudflare -> Web
Analytics -> rankcli.dev -> Referrers for Oct 5 to Oct 11 before deciding what to repeat.

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
- Tried to publish `astro-rankcli` (run 38481967050 of the new **Publish framework plugins**
  workflow, `42056f5`). Build and 32 tests passed; npm rejected the `NPM_TOKEN` secret
  (January token, dead) and a new package cannot use Trusted Publishing for its first version.
  Needs one founder credential (FOUNDER_CHECKLIST §8); the same run then publishes all three.
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
| Hacker News | Show HN submitted 2026-09-30 | **Dead on arrival** (new account, 7 karma); 0 views. See "Status on 2026-10-13" |
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

1. **Hacker News thread.** Submitted; answer every comment for the first two to three hours.
2. **Reddit standing.** Eight to thirteen more genuine comments to reach roughly 9:1 and clear
   the karma gates. Drafts in `reddit-comments.html`.
3. **r/webdev on Showoff Saturday (2026-10-03)**, using the rewrite in `reddit-posting-plan.md`.
4. **Product Hunt.** Written months ago, never submitted.
5. **Reddit Ads.** Never run as of 2026-10-13. Pixel is live and verified; create the campaign
   from the field values in `reddit-ads-setup.md`.
6. **Repost r/SideProject** once the account carries weight. It is a good post nobody saw.
