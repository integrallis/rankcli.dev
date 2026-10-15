# Founder checklist

Everything left in [GAPS.md](GAPS.md) needs an account only you hold: Google Cloud, the GitHub App, Cloudflare, or a signed-in paid login. The code for each is built and deployed; these steps switch it on. Roughly in order of effort.

## 1. Run a deep audit from the dashboard (gap 11) - one click

Sign in to a paid account on rankcli.dev, open a project and press **Run deep audit**. It should finish in a few minutes, with results on the project page. The dispatch code behind it already runs every hour for scheduled audits.

## 2. Analytics (gap 14) - done

Live since 2026-09-28: `CF_BEACON_TOKEN` is a repository variable and rankcli.dev's page source loads `static.cloudflareinsights.com/beacon.min.js` (re-checked 2026-10-15). Referrers are only in the Cloudflare dashboard: **Analytics & Logs -> Web Analytics -> rankcli.dev -> Referrers**.

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

## 8. Link the framework plugins to npm Trusted Publishing - two minutes per package

`astro-rankcli`, `vite-plugin-rankcli` and `next-rankcli` are on npm at 0.0.1 (2026-10-13, published by the **Publish framework plugins** workflow with the regenerated `NPM_TOKEN`). Two things only a 2FA code can do remain:

1. **Link each package to the workflow**, so releases stop depending on the token (npm retires direct token publishing in January 2027). On any machine with npm 11.15 or newer (`npx npm@latest` is fine), logged in as `integrallis`:

   ```bash
   npx npm@latest trust github astro-rankcli       --file publish-plugins.yml --repo integrallis/rankcli.dev --allow-publish
   npx npm@latest trust github vite-plugin-rankcli --file publish-plugins.yml --repo integrallis/rankcli.dev --allow-publish
   npx npm@latest trust github next-rankcli        --file publish-plugins.yml --repo integrallis/rankcli.dev --allow-publish
   ```

   Each asks for your 2FA code. The website does the same: package -> Settings -> Trusted Publisher -> GitHub Actions, organization `integrallis`, repository `rankcli.dev`, workflow `publish-plugins.yml`. Afterwards the workflow publishes through OIDC and the `NPM_TOKEN` secret can be deleted.

2. **Optional: remove the `0.0.0-stage` stubs.** npm put a 335-byte placeholder version beside each package when it created them. `latest` is 0.0.1 and installs are unaffected, but the version list shows the stub. A 2FA-bypass token may not unpublish, so it needs a code, and npm allows it for 72 hours after publish (until 2026-10-16):

   ```bash
   npx npm@latest unpublish astro-rankcli@0.0.0-stage --otp <code>
   npx npm@latest unpublish vite-plugin-rankcli@0.0.0-stage --otp <code>
   npx npm@latest unpublish next-rankcli@0.0.0-stage --otp <code>
   ```

   After that window, `npm deprecate <package>@0.0.0-stage "placeholder, use 0.0.1"` is the alternative.
