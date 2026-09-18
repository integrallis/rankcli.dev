import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';

const LAST_UPDATED = 'September 18, 2026';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy"
        description="How RankCLI (Integrallis Software, LLC) collects, uses and protects information across the website, dashboard, CLI, GitHub App and MCP server."
        path="/privacy"
      />
      <Navbar />

      <main className="container py-16 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p>
            This Privacy Policy explains how Integrallis Software, LLC ("RankCLI," "we,"
            "us") collects, uses, and protects information when you use the RankCLI
            website, dashboard, command-line tool, GitHub App, and MCP server
            (collectively, the "Service").
          </p>

          <h2>Using RankCLI without an account</h2>
          <p>
            You can run <code>rankcli audit</code> and the free, local MCP server
            (<code>npx @rankcli/mcp-server</code>) without creating an account. In this
            mode, RankCLI fetches and analyzes whatever URL you point it at, entirely on
            your own machine - the audit results are not sent to our servers. If you
            configure your own AI provider key for local use, that key stays on your
            machine and is used only to call that provider directly.
          </p>

          <h2>Information we collect</h2>
          <p>Once you create an account (email/password, Google, or GitHub sign-in), we collect:</p>
          <ul>
            <li>
              <strong>Account information</strong>: your email address, and if you sign in
              with Google or GitHub, the basic profile information those providers share
              with us.
            </li>
            <li>
              <strong>Site and audit data</strong>: the URLs you ask RankCLI to audit,
              the resulting scores and issues, and (if you connect a repository) the
              repository name and the pull requests RankCLI opens.
            </li>
            <li>
              <strong>Billing information</strong>: if you subscribe to a paid plan,
              payment is processed by Stripe. We never see or store your full card
              number - Stripe shares with us only what's needed to manage your
              subscription (plan, status, and renewal date).
            </li>
            <li>
              <strong>Your own AI provider keys (optional)</strong>: if you choose to
              connect your own OpenAI, Anthropic, or other AI provider key for
              cloud-based auto-fix PRs, it is encrypted (AES-256-GCM) before storage and
              is only decrypted server-side, in memory, to make the specific API call you
              requested.
            </li>
            <li>
              <strong>Usage data</strong>: basic request logs (timestamps, IP address,
              user agent) used for rate limiting, abuse prevention, and debugging.
            </li>
          </ul>

          <h2>How we use this information</h2>
          <ul>
            <li>To run audits, generate reports, and open auto-fix pull requests</li>
            <li>To operate your account, subscription, and billing</li>
            <li>To send transactional email (audit results, weekly reports if you opt in, account notices)</li>
            <li>To detect abuse and enforce our rate limits and fair-use terms</li>
            <li>To improve the accuracy and coverage of our SEO checks</li>
          </ul>
          <p>We do not sell your personal information, and we do not use your audit data to train AI models.</p>

          <h2>Third parties we rely on</h2>
          <p>Running the Service means some data necessarily passes through infrastructure providers we use:</p>
          <ul>
            <li><strong>Supabase</strong> - database, authentication, and serverless functions</li>
            <li><strong>Cloudflare</strong> - content delivery, DNS, and Web Analytics (cookieless page-view counts; no cookies or cross-site identifiers)</li>
            <li><strong>Fly.io</strong> - runs the audit engine that crawls and analyzes URLs</li>
            <li><strong>Stripe</strong> - payment processing for paid subscriptions</li>
            <li><strong>Resend</strong> - transactional email delivery</li>
            <li><strong>GitHub</strong> - OAuth sign-in and the RankCLI GitHub App, if you connect a repository</li>
          </ul>
          <p>
            Each of these providers processes data only as needed to provide their part
            of the Service, under their own privacy and security practices.
          </p>

          <h2>GitHub App permissions</h2>
          <p>
            If you install the RankCLI GitHub App, it requests read access to repository
            contents (to detect your framework and generate accurate fixes) and write
            access to pull requests and branches (to open auto-fix PRs). It does not
            access repositories you haven't explicitly installed it on, and you can
            revoke access at any time from your GitHub account settings.
          </p>

          <h2>Cookies</h2>
          <p>
            The dashboard uses essential cookies/local storage to keep you signed in.
            We do not use third-party advertising or cross-site tracking cookies. We
            count page views with Cloudflare Web Analytics, which sets no cookies and
            doesn't track you across sites.
          </p>

          <h2>Data retention and deletion</h2>
          <p>
            We retain account and audit data for as long as your account is active. You
            can delete your account at any time from Account settings, which removes
            your projects, audit history, and any connected AI provider keys. Some
            records may be retained briefly afterward where required for billing records
            or fraud prevention.
          </p>

          <h2>Children's privacy</h2>
          <p>
            The Service is not directed at children under 16, and we do not knowingly
            collect personal information from them.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy as the Service evolves. Material changes will be
            reflected by updating the date at the top of this page.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy or your data can be sent to{' '}
            <a href="mailto:support@rankcli.dev">support@rankcli.dev</a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
