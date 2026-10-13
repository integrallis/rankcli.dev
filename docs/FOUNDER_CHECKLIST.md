# Founder checklist

Everything left in [GAPS.md](GAPS.md) needs an account only you hold: Google Cloud, the GitHub App, Cloudflare, or a signed-in paid login. The code for each is built and deployed; these steps switch it on. Roughly in order of effort.

## 1. Run a deep audit from the dashboard (gap 11) - one click

Sign in to a paid account on rankcli.dev, open a project and press **Run deep audit**. It should finish in a few minutes, with results on the project page. The dispatch code behind it already runs every hour for scheduled audits.

## 2. Analytics (gap 14) - two minutes

1. Cloudflare dashboard -> **Analytics & Logs -> Web Analytics -> Add a site** -> `rankcli.dev`. Choose the **manual JavaScript snippet**, not automatic setup (automatic setup would count every visit twice).
2. Copy the token from the snippet: `data-cf-beacon='{"token": "..."}'`.
3. GitHub -> `integrallis/rankcli.dev` -> **Settings -> Secrets and variables -> Actions -> Variables** -> New repository variable `CF_BEACON_TOKEN` = the token. It is public in the page, so a variable, not a secret.
4. Redeploy the frontend: Actions -> **Deploy SaaS** -> Run workflow (or any push that touches the site).
5. Check: rankcli.dev's page source contains `static.cloudflareinsights.com/beacon.min.js`; visits appear in Cloudflare within minutes.

Alternative: give the `CLOUDFLARE_API_TOKEN` secret the **Account Analytics: Edit** permission and run the **Cloudflare Web Analytics site** workflow, which finds or creates the site and prints the token for step 3. (Today's token is scoped to Pages deploys and is refused.)

## 3. List the GitHub Action on the Marketplace (gap 12) - two minutes

Still not listed on 2026-10-13 (the Marketplace slugs 404). The manifest has `branding`, the name `RankCLI SEO Audit` is unique and the repo is public, so nothing but the tick is missing. GitHub has no API for this step; it needs your login with 2FA.

https://github.com/integrallis/rankcli-action/releases/tag/v1.0.0 -> **Edit** -> tick **Publish this Action to the GitHub Marketplace** -> accept the Marketplace developer agreement (first time only) -> category "Code quality" or "Continuous integration" -> Update release.

## 4. Repo linking for email/Google sign-ups (gap 12b) - five minutes

Today a user who signed up with email or Google must sign in with GitHub once before linking a repository, because RankCLI has to prove they can write to it. To drop that step:

1. GitHub -> Settings -> Developer settings -> GitHub Apps -> **RankCLI** -> General.
2. Tick **Request user authorization (OAuth) during installation**. The callback URL becomes the post-install redirect; set it to `https://rankcli.dev/dashboard/github-callback`.
3. **Generate a new client secret**, and copy the App's **Client ID**.
4. Supabase -> project `bspljbxwbjiqueeyzyat` -> **Edge Functions -> Secrets**: add `GITHUB_APP_CLIENT_ID` and `GITHUB_APP_CLIENT_SECRET`.

`connect-github-repo` already uses them when present: installing the App then identifies the installer, and GitHub confirms their write access.

## 5. Google Search Console (gap 10b) - thirty minutes, then Google's review

1. Google Cloud Console (the project behind "Sign in with Google" is fine) -> **APIs & Services -> Library** -> enable **Google Search Console API**.
2. **OAuth consent screen** (Google Auth Platform):
   - App name RankCLI, support email, logo.
   - Home page `https://rankcli.dev`, privacy policy `https://rankcli.dev/privacy`, terms `https://rankcli.dev/terms`.
   - Authorized domains: `rankcli.dev` and `bspljbxwbjiqueeyzyat.supabase.co`.
   - Data access -> add scopes `https://www.googleapis.com/auth/webmasters.readonly` and `https://www.googleapis.com/auth/userinfo.email`.
3. **Credentials -> OAuth client ID (Web application)**, or the existing sign-in client -> add the authorized redirect URI `https://bspljbxwbjiqueeyzyat.supabase.co/functions/v1/gsc-oauth/callback`.
4. Supabase -> **Edge Functions -> Secrets**: add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. The Search Console card then appears on project pages for Solo and up, and the daily sync starts.
5. **Verification.** `webmasters.readonly` is a sensitive scope. Until Google verifies the app, users see an "unverified app" warning and at most 100 can connect. Submit for verification with:
   - rankcli.dev verified in Search Console (you own it);
   - the privacy policy - it already has the required Limited Use statement;
   - a short screen recording: sign in, open a project, Connect Google Search Console, the consent screen, pick the property, the numbers on the project page;
   - justification: "Read-only access so a site's owner sees their own Search Console performance (clicks, impressions, queries) in their RankCLI dashboard. Data is shown only to that user and never shared."

   Review usually takes days to a few weeks.

Once it works, add Search Console to the Solo/Pro highlights in `packages/saas/src/config/pricing-tiers.json`. It stays out of the pricing until then, so nothing is advertised that doesn't work.

## 6. Try Apple Intelligence on a Mac - two minutes

On macOS 26+ with Apple Intelligence on: `npx @rankcli/cli@latest audit --url https://yoursite.com --ai`, then `npx @rankcli/cli@latest keywords --url https://yoursite.com --ai`. Expect "Using Apple Intelligence on this Mac (on-device, free)". The first run builds a small helper (Xcode command-line tools needed). CI compiles the helper, but no CI machine has Apple Intelligence, so this is its first real run.

## 7. Submit the Claude Code plugin to Anthropic's directory - five minutes

The plugin is merged and valid on `integrallis/rankcli-mcp-server` `main` (`4ee5d98`; `claude plugin validate .` passes). The directory only takes submissions from a GitHub account with push access to the repo, connected to claude.ai.

1. https://claude.ai/directory/manage -> **Submit new** -> **Plugin bundle**.
2. Repository `integrallis/rankcli-mcp-server`. Leave **Plugin path** empty (the manifest is at the root, `.claude-plugin/plugin.json`) and **Branch or tag** empty (follows `main`).
3. **Validate**. It runs the same checks as `claude plugin validate` plus a security scan.
4. **Data handling**: the plugin runs `npx @rankcli/cli` on the user's machine against the URL they name; without an API key nothing is sent to rankcli.dev; with one, audit results sync to that user's own account. No personal data is stored by the plugin; not intended for under-18s.
5. **Compliance**: contact email, four acknowledgements. **Review and submit**, keeping the default "GitHub push webhook" so every merge to `main` re-validates, and choose whether passing versions auto-publish.

Bump `version` in `.claude-plugin/plugin.json` with each release after that.

## 8. Give npm a credential for the framework plugins - five minutes

`astro-rankcli`, `vite-plugin-rankcli` and `next-rankcli` are ready (`42056f5`) and the **Publish framework plugins** workflow publishes them, but its first run (38481967050) was rejected: the `NPM_TOKEN` secret dates from January and is dead, and npm cannot link a package to Trusted Publishing before its first version exists ([npm/cli#8544](https://github.com/npm/cli/issues/8544)). Either path works:

- **From a machine**: `npm login`, then in `packages/astro-plugin` run `pnpm build && npm publish --access public`; the same for `packages/vite-plugin` and `packages/next-plugin`.
- **From CI**: npmjs.com -> Access Tokens -> Generate new token -> Granular, read and write on packages, allow publishing from CI (bypass 2FA), shortest expiry you accept -> `gh secret set NPM_TOKEN --repo integrallis/rankcli.dev`, then Actions -> **Publish framework plugins** -> Run workflow -> package `all`.

After each package's first publish: npmjs.com -> package -> Settings -> **Trusted Publisher** -> GitHub Actions: organization `integrallis`, repository `rankcli.dev`, workflow `publish-plugins.yml`. Then the token can be deleted again; `build-cli.yml` already publishes the CLI, runtime and MCP server that way.
