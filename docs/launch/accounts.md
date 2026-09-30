# Promotion accounts

Tracking the actual accounts and submissions created during the "go wide"
promotion push, so we don't lose track of what's live, what's staged, and
which identity owns what. No passwords/tokens here, just what exists and
where.

## Accounts created

| Platform | Handle / identity | Notes |
|---|---|---|
| Hacker News | `integrallis` | New account, created specifically for Show HN posting |
| Reddit | `integrallis-software` (superseded) → `u/rankcli` (pending, Brian to register) | Switched 2026-09-12 for brand consistency, see "Resolved: Reddit handle" below |
| GitHub (Smithery / Glama / cursor.directory / dev.to / awesome-list PRs) | `bsbodden` | Existing personal GitHub account, used to sign into all GitHub-OAuth platforms |
| Product Hunt | X handle `@rankcli` assumed | Not yet created. Brian will create if available when ready to launch |

## Live / submitted

| Platform | Status | Link |
|---|---|---|
| Smithery | **Live**, published, tested end-to-end | smithery.ai/servers/bsbodden/rankcli |
| Indie Hackers | **Live**, product page up | indiehackers.com/product/rankcli |
| cursor.directory | **Live** (confirmed 2026-09-13), passed their automated scan | cursor.directory/plugins/rankcli |
| SaaSHub | **Live** (confirmed 2026-09-13), approved well inside the 32-day window | saashub.com/rankcli |
| Glama | **Live** (from earlier session) | glama.ai/mcp/servers/integrallis/rankcli-mcp-server |
| mcp.so | **Live** (from earlier session), via merged GitHub issue | github.com/chatmcp/mcpso/issues/3963 |
| `awesome-mcp-servers` (punkpeye, 94k★) | **Merged** 2026-09-15 | github.com/punkpeye/awesome-mcp-servers/pull/13779 |
| GitHub Action `integrallis/rankcli-action` | **Public** 2026-09-19, v1.0.0; Marketplace listing pending (founder click) | github.com/integrallis/rankcli-action |
| `awesome-seo-tools` (serpapi) | PR open | github.com/serpapi/awesome-seo-tools/pull/340 |
| Google Search Console | **Live**, domain verified via DNS TXT, sitemap submitted (13 pages) | search.google.com/search-console?resource_id=sc-domain:rankcli.dev |
| Bing Webmaster Tools | **Live**, imported from GSC, sitemap submitted | bing.com/webmasters/home?siteUrl=https://rankcli.dev/ |
| IndexNow | **Live**, key hosted at rankcli.dev, 13 URLs submitted 2026-09-06 (`scripts/indexnow-submit.mjs`, re-run after publishing new/changed pages) | api.indexnow.org |

## Staged, not yet submitted

These are filled into their respective editors/forms but deliberately left
unpublished for Brian to review/edit before going live, see
`docs/launch/social.md` for draft copy history.

| Platform | What's staged | Blocked on |
|---|---|---|
| Hacker News | Show HN title + URL + body redrafted 2026-09-13 (with the then-current dogfood score; it is 75/100 as of 2026-09-27 - check VERIFIED-NUMBERS.md before posting), text only, in chat, not stored anywhere. HN has no draft-save or posting API at all, so this can't be staged server-side; the previous session's staged submit-form content was lost when that browser tab closed. | Brian to paste into news.ycombinator.com/submit himself + timing call |
| Dev.to article ("Is Your Site Even Visible to ChatGPT?") | Rewritten 2026-09-13 (original was also lost the same way) and **saved as a real draft** on the account this time, dev.to has actual server-side drafts, unlike HN, so this survives. | Brian's review, then Publish from the dashboard |
| Reddit r/SideProject | Title + body drafted (see `docs/launch/social.md`) | Superseded, was filled into `integrallis-software`'s form; needs re-entry once `u/rankcli` exists and is verified |
| dev.to | Full article ("Is Your Site Even Visible to ChatGPT?"), title + 3 tags + body | Brian's review before publishing |

## Skipped

| Platform | Why |
|---|---|
| `awesome-cli-apps` (agarrharr) | Requires a genuinely open-source, publicly-inspectable repo per their own guidelines. `@rankcli/cli`'s source lives in this private monorepo, an MIT tag in `package.json` alone doesn't honestly satisfy that. |
| BetaList | No longer has a free tier ($39-$299 only as of 2026-09-06). Draft saved on their side if we ever want to pay for it. |

## Resolved: Reddit handle

Decided 2026-09-12: switch to a dedicated `u/rankcli` account rather than
`integrallis-software`, for brand consistency. `integrallis-software`'s
staged r/SideProject draft does not carry over. Brian needs to register
`u/rankcli`, verify its email, and recreate reddit.com/prefs/apps
credentials (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`,
`REDDIT_PASSWORD`) under the new account before the Reddit channel in
`growth-ops.yml` can be enabled.
