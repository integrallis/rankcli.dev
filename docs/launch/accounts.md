# Promotion accounts

Tracking the actual accounts and submissions created during the "go wide"
promotion push, so we don't lose track of what's live, what's staged, and
which identity owns what. No passwords/tokens here — just what exists and
where.

## Accounts created

| Platform | Handle / identity | Notes |
|---|---|---|
| Hacker News | `integrallis` | New account, created specifically for Show HN posting |
| Reddit | `integrallis-software` | New account. Considered `u/rankcli` instead (username not taken as of 2026-09-06) but not switched — see "Open question" below |
| GitHub (Smithery / Glama / cursor.directory / dev.to / awesome-list PRs) | `bsbodden` | Existing personal GitHub account, used to sign into all GitHub-OAuth platforms |
| Product Hunt | X handle `@rankcli` assumed | Not yet created — Brian will create if available when ready to launch |

## Live / submitted

| Platform | Status | Link |
|---|---|---|
| Smithery | **Live**, published, tested end-to-end | smithery.ai/servers/bsbodden/rankcli |
| Indie Hackers | **Live**, product page up | indiehackers.com/product/rankcli |
| cursor.directory | Submitted, pending their automated security scan | cursor.directory/plugins/rankcli |
| SaaSHub | Submitted (free tier), in approval queue (up to 32 days) | saashub.com — search "RankCLI" |
| Glama | **Live** (from earlier session) | glama.ai/mcp/servers/integrallis/rankcli-mcp-server |
| mcp.so | **Live** (from earlier session), via merged GitHub issue | github.com/chatmcp/mcpso/issues/3963 |
| `awesome-mcp-servers` (punkpeye, 94k★) | PR open | github.com/punkpeye/awesome-mcp-servers/pull/13779 |
| `awesome-seo-tools` (serpapi) | PR open | github.com/serpapi/awesome-seo-tools/pull/340 |

## Staged, not yet submitted

These are filled into their respective editors/forms but deliberately left
unpublished for Brian to review/edit before going live — see
`docs/launch/social.md` for draft copy history.

| Platform | What's staged | Blocked on |
|---|---|---|
| Hacker News | Show HN title + URL + body, in the submit form | Brian's review + Reddit-style timing call |
| Reddit r/SideProject | Title + body, in the submit form | Email verification on the `integrallis-software` account |
| dev.to | Full article ("Is Your Site Even Visible to ChatGPT?"), title + 3 tags + body | Brian's review before publishing |

## Skipped

| Platform | Why |
|---|---|
| `awesome-cli-apps` (agarrharr) | Requires a genuinely open-source, publicly-inspectable repo per their own guidelines. `@rankcli/cli`'s source lives in this private monorepo — an MIT tag in `package.json` alone doesn't honestly satisfy that. |
| BetaList | No longer has a free tier ($39–$299 only as of 2026-09-06). Draft saved on their side if we ever want to pay for it. |

## Open question

Reddit: should `integrallis-software` be replaced with a dedicated
`u/rankcli` account for brand consistency on future posts? Reddit usernames
can't be renamed, so this is only cheap to change while the account has no
history yet. Not resolved as of 2026-09-06 - `integrallis-software` is
what's actually staged and awaiting email verification.
