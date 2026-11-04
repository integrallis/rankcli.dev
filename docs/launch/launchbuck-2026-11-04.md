# LaunchBuck submission (launchbuck.com), 2026-11-04

A free listing: reviewed within seven days, a product page, a founder profile, a dofollow link
once their badge is on rankcli.dev and verified. Paid "Highlight" placements exist ($19 for 7
days, $29 for 15) and are not part of this.

## Two ways to submit

1. **Web form, with the images** (logo and one screenshot are required by the form). Needs the
   founder's signed-in browser. With the Claude in Chrome extension connected (claude.ai/chrome,
   then `/chrome` in Claude Code), a session fills it from this file in one go.
2. **API, text only**: create a key at https://launchbuck.com/settings, add
   `LAUNCHBUCK_API_KEY=lb_...` to `.env`, run `node scripts/launchbuck-submit.mjs`
   (`--dry-run` validates first). The logo and screenshot then go in from the dashboard; the
   API does not take images yet.

## The answers (`launchbuck-2026-11-04.json` is the same content for the API)

- **Name:** RankCLI
- **Tagline:** Ship code, get ranked. 280+ SEO and AI-search checks from the CLI, a CI gate, and fixes as pull requests.
- **Website:** https://rankcli.dev
- **Pricing:** freemium
- **Categories (1-3):** Developer Tools, Marketing & Growth, DevOps & Infrastructure
- **Launch date:** today (or any day up to 90 days out)
- **Description:** the `description` field of the JSON, five short paragraphs
- **Key features:** the six `keyFeatures` lines of the JSON
- **Links:** docs https://rankcli.dev/docs, pricing https://rankcli.dev/pricing, blog https://rankcli.dev/blog, GitHub https://github.com/integrallis/rankcli

## Assets, in `ad-assets/launchbuck-2026-11-04/`

- `rankcli-logo-512.png`: the logo on the site's dark background, 512x512
- `screenshot-1-audit-terminal.png`: a real audit in the terminal (the ProgrammerNeeds set)
- `screenshot-2-dashboard.png`: the hosted dashboard
- `screenshot-3-autofix-pr.png`: an auto-fix pull request
- `../vibe-coding-2026-11-04/vibe-coding-1200x628.png` if a banner is asked for

## After it is live

Install their badge (dashboard, Card or Pill, Dark) on rankcli.dev and verify it for the
dofollow link. Put it where the ProgrammerNeeds badge is, with `loading="lazy"`; the engine no
longer asks for a preconnect for a lazy image. Record the listing URL in ACTIVITY-LOG.md and
measure with `node scripts/cf-traffic.mjs` before claiming it brought anyone.
