# r/rankcli — values for Reddit's Create a Community form

Paste-ready. Assets are in `ad-assets/reddit/`.

**One caution before you spend time on this.** A brand subreddit with zero members is not an
acquisition channel — nobody discovers a product by browsing to its empty community. It is a
support and announcement hub that becomes useful once you have users. It is worth creating
*now* mainly to hold the name before someone else does, and because an empty community you own
beats a squatted one. Do not let it displace the four hand-written posts to r/webdev,
r/programming, r/SaaS and r/SideProject, which are where users actually come from.

---

## Create a Community

| Field | Value |
|---|---|
| **Community name** | `rankcli` → r/rankcli (7 chars, under the 21 limit; permanent, cannot be changed) |
| **Fallback if taken** | `rankcli_dev`, then `getrankcli` |
| **Community type** | **Public** |
| **Mature (18+)** | No |
| **Topics** (pick up to 3) | Programming · Technology · Business |

### Description (max 500 characters)

```
SEO and GEO checks that run in your terminal and your CI pipeline, not in another dashboard.
280+ technical checks, 32 frameworks detected automatically, and fixes delivered as pull
requests you review. Free forever on the CLI. Announcements, releases, and help — ask anything.
```

*(311 characters.)*

---

## After creation — Mod Tools → Appearance

| Setting | File |
|---|---|
| **Community icon** | `ad-assets/reddit/icon-512.png` (512×512) |
| **Banner** | `ad-assets/reddit/banner-1920x384.png` (1920×384) |
| **Theme colour** | `#22C55E` |
| **Banner background** | `#0A0A0A` |

## Welcome message (Mod Tools → Community settings)

```
Welcome. This is where RankCLI releases, changelogs and questions live.

If you're new: `npx @rankcli/cli audit -u https://your-site.dev` runs 280+ SEO and AI-search
checks with no signup and no account. If something looks wrong in the output, post it here —
bug reports from real sites are the most useful thing you can give us.

We publish our own audit score for rankcli.dev every week, whether it went up or not.
```

## Rules

**1. No spam or unrelated self-promotion**
Sharing your site to ask about its audit results is fine and encouraged. Promoting an unrelated
product is not.

**2. Bug reports need the output**
Paste the actual CLI output or the audit URL. "It's wrong" is not something anyone can act on.

**3. Be civil**
Disagree with the finding, not the person.

**4. No scraped or generated filler**
Low-effort AI-generated posts get removed.

## Sidebar — About

```
**RankCLI** — ship code, get ranked.

280+ SEO and GEO checks that run in CI and open pull requests with the fix.

- Free audit, no signup: rankcli.dev/free-audit
- Docs: rankcli.dev/docs
- Changelog: rankcli.dev/changelog
- CLI: `npm i -g @rankcli/cli`

The CLI, the MCP server and the GitHub Action are free forever. AI features run on your own
API key.
```

## First posts (pin these)

1. **"What RankCLI is, and what it deliberately isn't"** — pinned, the honest positioning: it's
   a linter for SEO, not a rank tracker or a marketing dashboard. Include the current
   rankcli.dev score.
2. **"Weekly: rankcli.dev scored X/100"** — the dogfood post. It gives the community a reason
   to exist and a reason to come back, and it is the thing no competitor will copy.

---

## Not the same thing as ads

Creating this community does nothing for Reddit Ads and vice versa — separate systems. Ad
targeting buys impressions *inside other people's* subreddits (see `reddit-ads-2026-09.md`),
which is where the audience already is. r/rankcli is where they land afterwards.
