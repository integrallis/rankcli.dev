import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { SEO } from '@/components/SEO';
import frameworks from '@/config/frameworks.json';

const highlights = [
  {
    title: 'v0.0.58: five findings from dogfooding, fixed',
    description:
      'Found by auditing a plain static site and reading the source behind each finding. An inline style block is no longer a render-blocking resource (the check had recommended inlining critical CSS and then counted it). A 401, 403, 405 or 429 from an external link is retried with a browser-like GET and, if still refused, is indeterminate rather than broken, so links to Medium stop being reported dead. /index.html is the homepage, so NAV_NOT_IN_HTML no longer reports zero links over ten static ones. The FAQ and plaintext-email recommendations now say what the checks accept. The auto-fixer writes a WebSite or WebPage from the page\'s own title and description, never a SoftwareApplication with a free Offer. A lazy-loaded image\'s origin no longer asks for a preconnect.',
  },
  {
    title: 'v0.0.57: the second pass over the always-on findings',
    description:
      'v0.0.55 took the audit from 56 codes per site to 42 on the npm corpus; this release takes the next tier, ten findings on a third to two thirds of sites with no evidence behind them: the testimonials and review-ecosystem heuristics, the "agent experience surface" notice, the freshness composite, the popup detector, the click-through estimate, Search Console verification by meta tag, the unique-selling-proposition and social-platform checks. The security headers, DMARC and SPF, structured data, the performance findings Lighthouse also reports and the llms.txt notice stay.',
  },
  {
    title: 'v0.0.55: a finding that fires on nearly every site is a default, not a finding',
    description:
      'The first run of the npm corpus (367 of the 400 most popular packages\' homepages, published at /data/npm-sites) counted 56 codes per site, 30 of them on 60 percent or more of sites. 25 always-on findings are gone: not using Google\'s tag manager or Bing\'s webmaster tools is a choice, and the brand, entity, experience, engagement, snippet and dwell-time heuristics had no evidence behind them. NO_BREADCRUMBS never fires on the homepage; INDEXNOW_NOT_IMPLEMENTED is dropped when the site has no sitemap. One bot table: rankcli geo, the MCP robots tools and the robots.txt the auto-fix writes derive from the same crawler classes as the audit, so the generated robots.txt has one group per class and no tool calls Anthropic\'s crawler Claude-Web. v0.0.56 finishes the job in rankcli geo and the MCP geo tool: a disallowed training crawler is listed as policy, with no critical finding and no score penalty; only a disallowed search or AI search crawler is critical.',
  },
  {
    title: 'v0.0.54: the AI checks say what the evidence says',
    description:
      'AI crawler access by bot class (search, AI search, user-triggered, training), read from robots.txt and fetched live as each bot, each finding worded for what blocking that class costs. A fetch as Googlebot catches Next.js streaming metadata that other agents never get. The site audit draws the link graph without JavaScript: clicks from the homepage, orphans, navigation missing from the HTML. The answer-shaped and freshness findings cite their studies; unsupported ones are gone. rankcli audit -o llm prints the report as an agent reads it. The AI Readiness score is stated for what it is: hygiene on evidence-backed levers, not a citation predictor.',
  },
  {
    title: 'v0.0.53: the audit as a CI gate',
    description:
      'One rule syntax for the gate in the CLI, in rankcli.config.json and in the GitHub Action (v1.2.0): error, warning or notice, score<80, score:aiReadiness<70. A committed baseline makes the severity rule count only new findings, so an existing site adopts the gate without first fixing every old finding; rankcli diff compares two saved reports. -o sarif feeds GitHub Code Scanning and -o junit test reporters. --dir audits the build directory before it is deployed, --header and --cookie reach protected previews, and the config file carries ignore rules and category budgets.',
  },
  {
    title: 'v0.0.52: every check, everywhere',
    description:
      'The 21 checks that used to ship encrypted in the CLI are ordinary engine code, so rankcli audit, the MCP server and the GitHub Action (v1.1.1) run the same 280+ checks and give the same score. The JSON report carries the timestamp, the CLI version, the checks run and passed, and one entry per page. The CLI, the engine, the MCP server and the Action are published under the Functional Source License (FSL-1.1-MIT): free to read, run, change and embed; each version becomes MIT two years after its release.',
  },
  {
    title: 'Agentic Auto-Fix',
    description:
      'rankcli fix --auto --commit --push detects issues, applies fixes, commits with conventional messages, and pushes - full automation.',
  },
  {
    title: 'Keyword Rank Tracking',
    description:
      'rankcli track monitors keyword positions over time, with SERP tracking, position history, sparkline trends, and CSV export.',
  },
  {
    title: 'GEO (AI Search Optimization)',
    description:
      "Check whether GPTBot, ClaudeBot, and PerplexityBot can access your site, and track your AI visibility over time.",
  },
  {
    title: 'MCP Server for AI Assistants',
    description:
      'npx @rankcli/mcp-server lets Claude, Cursor, or any MCP client audit your site directly - free, local, no signup.',
  },
  {
    title: `${frameworks.with_recipes.length} Framework Recipes`,
    description:
      `Auto-generated, framework-specific fixes for ${frameworks.with_recipes.length} frameworks, from the recipes shipped in @rankcli/agent-runtime.`,
  },
  {
    title: `Framework Detection Across ${frameworks.detected.length} Frameworks`,
    description:
      `Every audit names the framework it found, weighing all the evidence on the page rather than stopping at the first thing that matches - and answering "unknown" instead of guessing. Auto-fix PRs use it to write static files where your framework actually serves them: static/ for SvelteKit and Hugo, wwwroot/ for ASP.NET, priv/static/ for Phoenix.`,
  },
];

export function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Changelog"
        description="What's new in RankCLI: v0.0.58 fixes five findings from dogfooding; v0.0.57 and v0.0.55 remove the 35 findings the npm corpus showed firing on most sites; v0.0.54 reads AI crawler access by bot class, catches streaming metadata and draws the link graph without JavaScript; v0.0.53 turns the audit into a CI gate with one rule syntax, baselines, SARIF and JUnit output and a config file; v0.0.52 runs every check in the CLI, the MCP server and the GitHub Action under the FSL-1.1-MIT license; agentic auto-fix, keyword rank tracking, GEO checks for AI search, the MCP server for AI assistants, and framework-specific fix recipes."
        path="/changelog"
      />
      <Navbar />

      <main className="container py-16 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Changelog</h1>
        <p className="text-muted-foreground mb-10">
          Recent highlights below. For the full, version-by-version history, see{' '}
          <a
            href="https://github.com/integrallis/rankcli/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            GitHub Releases
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          .
        </p>

        <div className="space-y-6">
          {highlights.map((item) => (
            <div key={item.title} className="pb-6 border-b last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">New</Badge>
                <h2 className="font-semibold">{item.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
