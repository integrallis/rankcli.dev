import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { SEO } from '@/components/SEO';
import frameworks from '@/config/frameworks.json';

const highlights = [
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
        description="What's new in RankCLI: v0.0.52 runs every check in the CLI, the MCP server and the GitHub Action under the FSL-1.1-MIT license; agentic auto-fix, keyword rank tracking, GEO checks for AI search, the MCP server for AI assistants, and framework-specific fix recipes."
        path="/changelog"
      />
      <Navbar />

      <main className="container py-16 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Changelog</h1>
        <p className="text-muted-foreground mb-10">
          Recent highlights below. For the full, version-by-version history, see{' '}
          <a
            href="https://github.com/integrallis/rankcli-cli/releases"
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
