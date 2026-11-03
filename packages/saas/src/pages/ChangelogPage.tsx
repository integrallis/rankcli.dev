import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { SEO } from '@/components/SEO';
import frameworks from '@/config/frameworks.json';

const highlights = [
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
        description="What's new in RankCLI: v0.0.54 reads AI crawler access by bot class, catches streaming metadata and draws the link graph without JavaScript; v0.0.53 turns the audit into a CI gate with one rule syntax, baselines, SARIF and JUnit output and a config file; v0.0.52 runs every check in the CLI, the MCP server and the GitHub Action under the FSL-1.1-MIT license; agentic auto-fix, keyword rank tracking, GEO checks for AI search, the MCP server for AI assistants, and framework-specific fix recipes."
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
