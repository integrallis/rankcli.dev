import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';

// The URL in RankCLI's User-Agent strings (RankCLI-Bot/1.0 (+https://rankcli.dev/bot)): what
// the requests are, when they happen and who to contact.
export function BotPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="RankCLI-Bot"
        description="What RankCLI's requests to your site are: on-demand SEO audits that someone asked for, not a crawler. User agents, request volume and how to reach us."
        path="/bot"
      />
      <Navbar />

      <main className="container py-16 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">RankCLI-Bot</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p>
            If you found <code>rankcli.dev/bot</code> in your logs, the requests came from an SEO
            audit that someone ran on your site with RankCLI. RankCLI is not a crawler: it doesn't
            discover sites, follow links across the web or build an index. It fetches pages only
            when an audit asks for them.
          </p>

          <h2>When audits happen</h2>
          <ul>
            <li>Someone runs a free audit of a URL on rankcli.dev, like any online SEO checker.</li>
            <li>
              A RankCLI account has the site in its projects: those are audited on a schedule
              (weekly or daily), on demand, and when the site's repository is pushed to.
            </li>
            <li>
              Someone runs the RankCLI command-line tool or MCP server. Those requests come from
              that person's own machine, not from our servers.
            </li>
          </ul>

          <h2>What an audit requests</h2>
          <p>
            A one-page audit fetches the page, <code>robots.txt</code>, the sitemap, and the
            stylesheets, scripts and images the page links to, so it can check them: usually a few
            dozen requests. A site audit repeats that for up to 10 pages. RankCLI reads your{' '}
            <code>robots.txt</code> to report on it.
          </p>

          <h2>User agents</h2>
          <p>Requests identify themselves with a user agent that starts with <code>RankCLI</code>, for example:</p>
          <ul>
            <li><code>RankCLI-Bot/1.0 (+https://rankcli.dev/bot)</code></li>
            <li><code>RankCLI/1.0 (+https://rankcli.dev)</code></li>
          </ul>
          <p>
            Audits run from rankcli.dev come from Fly.io's network (US East). Audits run with the
            command-line tool come from wherever it was run.
          </p>

          <h2>Contact</h2>
          <p>
            To report a problem or ask us to stop auditing your site, email{' '}
            <a href="mailto:support@rankcli.dev">support@rankcli.dev</a> with your domain. You can
            also block user agents that start with <code>RankCLI</code> at your firewall or CDN.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
