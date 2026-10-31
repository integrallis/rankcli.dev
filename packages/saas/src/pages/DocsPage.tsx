import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InstallTabs } from '@/components/InstallTabs';
import {
  Terminal,
  Key,
  Scan,
  GitPullRequest,
  Upload,
  Settings,
  Book,
  Code,
  Github,
  LayoutDashboard,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Layers,
  Bot,
  Search,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import mcpTools from '@/config/mcp-tools.json';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Terminal,
    subsections: ['installation', 'authentication', 'first-audit'],
  },
  {
    id: 'geo',
    title: 'GEO (AI Search)',
    icon: Search,
    subsections: ['what-is-geo', 'ai-crawlers', 'geo-command', 'optimization'],
  },
  {
    id: 'mcp-server',
    title: 'MCP Server',
    icon: Bot,
    subsections: ['what-is-mcp', 'installation-mcp', 'claude-desktop', 'available-tools'],
  },
  {
    id: 'cli-reference',
    title: 'CLI Reference',
    icon: Code,
    subsections: ['auth', 'audit', 'fix', 'track', 'apply', 'keywords', 'content', 'setup'],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    subsections: ['projects', 'audits', 'issues', 'exports'],
  },
  {
    id: 'github',
    title: 'GitHub Integration',
    icon: Github,
    subsections: ['install-app', 'connect-repo', 'auto-prs', 'webhooks'],
  },
  {
    id: 'frameworks',
    title: 'Framework Checks',
    icon: Layers,
    subsections: ['supported', 'detection', 'recipes'],
  },
  {
    id: 'workflows',
    title: 'Workflows',
    icon: GitPullRequest,
    subsections: ['local-workflow', 'github-workflow', 'ci-cd'],
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Book,
    subsections: ['rest-api', 'webhooks-api'],
  },
];

const sectionContent: Record<string, () => JSX.Element> = {
  'getting-started': GettingStartedSection,
  geo: GEOSection,
  'mcp-server': MCPServerSection,
  'cli-reference': CLIReferenceSection,
  dashboard: DashboardSection,
  github: GitHubSection,
  frameworks: FrameworksSection,
  workflows: WorkflowsSection,
  api: APISection,
};

// Every section is rendered and the inactive ones are `hidden`, so the whole
// manual is in the prerendered HTML that crawlers read, not just the first
// tab. The active section is the URL hash (/docs#cli-reference), which also
// makes sections linkable.
export function DocsPage() {
  const { hash } = useLocation();
  const requested = hash.slice(1);
  const activeSection = requested in sectionContent ? requested : 'getting-started';

  useEffect(() => {
    if (requested) window.scrollTo(0, 0);
  }, [requested]);

  const navLinkClass = (id: string) =>
    cn(
      'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left whitespace-nowrap',
      activeSection === id
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-muted-foreground hover:bg-muted'
    );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Docs: CLI, CI gate, MCP server and auto-fix PRs"
        description="RankCLI docs: install the CLI, run SEO and GEO audits, use the MCP server with AI assistants, connect GitHub for auto-fix PRs, gate CI and call the API."
        path="/docs"
      />
      <Navbar />
      <div className="container py-8">
        <header className="mb-8">
          <h1 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            RankCLI documentation
          </h1>
          {/* Section nav for small screens (the sidebar is lg+ only) */}
          <nav className="lg:hidden mt-4 -mx-1 flex gap-1 overflow-x-auto pb-2" aria-label="Documentation sections">
            {sections.map((section) => (
              <Link key={section.id} to={`#${section.id}`} className={navLinkClass(section.id)}>
                <section.icon className="h-4 w-4" />
                {section.title}
              </Link>
            ))}
          </nav>
        </header>
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="sticky top-8 space-y-1" aria-label="Documentation sections">
              {sections.map((section) => (
                <Link key={section.id} to={`#${section.id}`} className={cn('w-full', navLinkClass(section.id))}>
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {sections.map((section) => {
              const Content = sectionContent[section.id];
              return (
                <section key={section.id} id={section.id} hidden={section.id !== activeSection}>
                  <Content />
                </section>
              );
            })}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function GettingStartedSection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
        <p className="text-muted-foreground text-lg">
          Get up and running with RankCLI in minutes. Choose between the CLI for local development
          or the web dashboard for a visual experience.
        </p>
      </div>

      {/* Installation */}
      <section id="installation">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Installation
        </h3>
        <p className="text-muted-foreground mb-4">
          npm works everywhere Node does. Homebrew and Scoop install a standalone binary instead — no Node required.
        </p>
        <InstallTabs />
        <p className="text-sm text-muted-foreground mt-3">
          Also available via <code className="bg-muted px-1 rounded">yarn global add @rankcli/cli</code> or{' '}
          <code className="bg-muted px-1 rounded">pnpm add -g @rankcli/cli</code>.
        </p>
        <p className="text-muted-foreground mt-4">
          Verify the installation:
        </p>
        <CodeBlock code="rankcli --version" />

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Web Dashboard Alternative</h4>
          <p className="text-sm text-muted-foreground">
            Don't want to install anything? Use the <a href="/dashboard" className="text-primary underline">web dashboard</a> to
            run audits directly in your browser. Just add your site URL and click "Run Audit".
          </p>
        </div>
      </section>

      {/* Authentication */}
      <section id="authentication">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          Authentication
        </h3>
        <p className="text-muted-foreground mb-4">
          Every audit, fix and check runs without an account. Log in to sync results to your dashboard:
        </p>
        <CodeBlock code="rankcli login" />
        <p className="text-muted-foreground mt-4">
          This opens your browser. To log in with email and password in the terminal instead:
        </p>
        <CodeBlock code="rankcli login --no-browser" />
        <p className="text-muted-foreground mt-4">
          Or provide your email directly:
        </p>
        <CodeBlock code="rankcli login --email you@example.com" />

        <h4 className="font-medium mt-6 mb-2">API Key Authentication (CI/CD)</h4>
        <p className="text-muted-foreground mb-4">
          For non-interactive environments like CI/CD pipelines, use an API key:
        </p>
        <CodeBlock code="rankcli login --token rankcli_your_api_key_here" />
        <p className="text-muted-foreground mt-4">
          Or set the environment variable (recommended for CI):
        </p>
        <CodeBlock code="export RANKCLI_API_KEY=rankcli_your_api_key_here" />
        <p className="text-muted-foreground mt-2 text-sm">
          Generate an API key from <a href="/account" className="text-primary underline">Account Settings → API Keys</a>.
        </p>

        <p className="text-muted-foreground mt-4">
          Check your login status:
        </p>
        <CodeBlock code="rankcli whoami" />

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Without Authentication</h4>
          <p className="text-sm text-muted-foreground">
            Everything local runs without logging in: all 280+ checks, rankcli fix, the MCP
            server and the GitHub Action, with no limit. An account adds the cloud: audit
            history, scheduled audits, issue tracking and auto-fix pull requests.
          </p>
        </div>

        <h4 className="font-medium mt-6 mb-2">Feature Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Feature</th>
                <th className="text-center py-2 px-4">Anonymous</th>
                <th className="text-center py-2 px-4">Free</th>
                <th className="text-center py-2 px-4">Solo</th>
                <th className="text-center py-2 px-4">Pro+</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">SEO Checks</td>
                <td className="text-center py-2 px-4">280+</td>
                <td className="text-center py-2 px-4">280+</td>
                <td className="text-center py-2 px-4">280+</td>
                <td className="text-center py-2 px-4">280+</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Cloud Sync</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                <td className="text-center py-2 px-4"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                <td className="text-center py-2 px-4"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Scheduled Audits</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4">Weekly</td>
                <td className="text-center py-2 px-4">Weekly</td>
                <td className="text-center py-2 px-4">Daily + every push</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">GitHub Connect</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                <td className="text-center py-2 px-4"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                <td className="text-center py-2 px-4"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Auto-Fix PRs</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4">3 a month</td>
                <td className="text-center py-2 px-4">Unlimited, 1 open per site</td>
                <td className="text-center py-2 px-4">Unlimited, 3 open per site (10 on Agency)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">REST API</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4">100/day</td>
                <td className="text-center py-2 px-4">1K/day (10K on Agency)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* First Audit */}
      <section id="first-audit">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Running Your First Audit
        </h3>
        <p className="text-muted-foreground mb-4">
          Run a comprehensive SEO audit on any URL:
        </p>
        <CodeBlock code="rankcli audit --url https://yoursite.com" />

        <h4 className="font-medium mt-6 mb-2">What Gets Checked</h4>
        <p className="text-muted-foreground mb-4">
          The audit runs 280+ SEO checks across these categories:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: 'Crawlability', desc: 'robots.txt, sitemap, indexability' },
            { name: 'On-Page SEO', desc: 'Title, meta, headings, URLs' },
            { name: 'Content', desc: 'Word count, readability, keywords' },
            { name: 'Performance', desc: 'Page speed, compression, caching' },
            { name: 'Security', desc: 'HTTPS, headers, vulnerabilities' },
            { name: 'Social', desc: 'OG tags, Twitter cards' },
            { name: 'Structured Data', desc: 'Schema.org, JSON-LD' },
            { name: 'AI Readiness', desc: 'LLM optimization, citations' },
            { name: 'Framework', desc: 'React, Next.js, Vue, etc.' },
          ].map((category) => (
            <div key={category.name} className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">{category.name}</h5>
              <p className="text-xs text-muted-foreground">{category.desc}</p>
            </div>
          ))}
        </div>

        <h4 className="font-medium mt-6 mb-2">Multi-Page Audits</h4>
        <p className="text-muted-foreground mb-4">
          Audit multiple pages at once to find site-wide issues:
        </p>
        <CodeBlock code="rankcli audit --url https://yoursite.com --max-pages 10" />

        <h4 className="font-medium mt-6 mb-2">AI-Powered Analysis</h4>
        <p className="text-muted-foreground mb-4">
          Enable AI analysis for content suggestions and prioritized fixes:
        </p>
        <CodeBlock code="rankcli audit --url https://yoursite.com --ai" />
        <p className="text-sm text-muted-foreground mt-2">
          Runs on your own provider, never RankCLI&apos;s: Apple Intelligence on a Mac that has it, otherwise the first key it finds (<code className="bg-muted px-1 rounded">OPENROUTER_API_KEY</code>, <code className="bg-muted px-1 rounded">OPENAI_API_KEY</code>, ...) or a local Ollama. Choose one with <code className="bg-muted px-1 rounded">--ai-provider</code>.
        </p>
      </section>
    </div>
  );
}

function GEOSection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">GEO: Generative Engine Optimization</h2>
        <p className="text-muted-foreground text-lg">
          Optimize your site for AI search engines like ChatGPT, Perplexity, Claude, and Google AI Overviews.
        </p>
      </div>

      {/* What is GEO */}
      <section id="what-is-geo">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          What is GEO?
        </h3>
        <p className="text-muted-foreground mb-4">
          <strong>Generative Engine Optimization (GEO)</strong> is SEO for AI-powered search engines.
          As users shift from traditional search to AI assistants, your content needs to be optimized
          for how LLMs discover, understand, and cite information.
        </p>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
          <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Why GEO Matters</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>527% YoY growth</strong> in AI search traffic (2024-2025)</li>
            <li>• <strong>63% of JavaScript sites</strong> are invisible to AI crawlers</li>
            <li>• AI assistants are becoming the primary way people find information</li>
          </ul>
        </div>

        <h4 className="font-medium mt-6 mb-2">Traditional SEO vs GEO</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Aspect</th>
                <th className="text-left py-2 px-4">Traditional SEO</th>
                <th className="text-left py-2 px-4">GEO</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Goal</td>
                <td className="py-2 px-4">Rank #1 in search results</td>
                <td className="py-2 px-4">Get cited by AI assistants</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Content</td>
                <td className="py-2 px-4">Keyword-optimized</td>
                <td className="py-2 px-4">Fact-dense, citable</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Structure</td>
                <td className="py-2 px-4">H1-H6 hierarchy</td>
                <td className="py-2 px-4">FAQ, definitions, statistics</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Rendering</td>
                <td className="py-2 px-4">Googlebot handles JS</td>
                <td className="py-2 px-4">Many AI crawlers skip JS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Crawlers */}
      <section id="ai-crawlers">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Crawlers
        </h3>
        <p className="text-muted-foreground mb-4">
          RankCLI tracks access for all major AI crawlers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {[
            { name: 'GPTBot', company: 'OpenAI', desc: 'ChatGPT training & browsing' },
            { name: 'ChatGPT-User', company: 'OpenAI', desc: 'ChatGPT browsing feature' },
            { name: 'Claude-Web', company: 'Anthropic', desc: 'Claude web access' },
            { name: 'PerplexityBot', company: 'Perplexity', desc: 'Perplexity AI search' },
            { name: 'Google-Extended', company: 'Google', desc: 'Bard/Gemini training' },
            { name: 'bingbot', company: 'Microsoft', desc: 'Bing Chat/Copilot' },
            { name: 'Applebot-Extended', company: 'Apple', desc: 'Apple Intelligence' },
            { name: 'Amazonbot', company: 'Amazon', desc: 'Alexa/Amazon AI' },
            { name: 'meta-externalagent', company: 'Meta', desc: 'Meta AI training' },
            { name: 'cohere-ai', company: 'Cohere', desc: 'Cohere training' },
          ].map((crawler) => (
            <div key={crawler.name} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium text-sm">{crawler.name}</h5>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{crawler.company}</span>
              </div>
              <p className="text-xs text-muted-foreground">{crawler.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            robots.txt Matters
          </h4>
          <p className="text-sm text-muted-foreground">
            Many sites accidentally block AI crawlers in robots.txt. RankCLI checks if your
            robots.txt allows or blocks each AI crawler and generates optimized rules.
          </p>
        </div>
      </section>

      {/* GEO Command */}
      <section id="geo-command">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Using rankcli geo
        </h3>
        <p className="text-muted-foreground mb-4">
          Run a GEO analysis on any URL:
        </p>
        <CodeBlock code="rankcli geo --url https://yoursite.com" />

        <h4 className="font-medium mt-6 mb-2">What Gets Analyzed</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {[
            { name: 'AI Crawler Access', desc: 'robots.txt rules for each AI bot' },
            { name: 'JS Rendering', desc: 'SSR vs CSR detection' },
            { name: 'Content Clarity', desc: 'How clear is your content to LLMs' },
            { name: 'Fact Density', desc: 'Statistics, dates, numbers' },
            { name: 'Structure Quality', desc: 'Headings, lists, definitions' },
            { name: 'Citation Readiness', desc: 'Trust signals, author info' },
          ].map((check) => (
            <div key={check.name} className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">{check.name}</h5>
              <p className="text-xs text-muted-foreground">{check.desc}</p>
            </div>
          ))}
        </div>

        <h4 className="font-medium mt-6 mb-2">JSON Output for CI</h4>
        <CodeBlock code="rankcli geo --url https://yoursite.com --output json" />
      </section>

      {/* Optimization Tips */}
      <section id="optimization">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          GEO Optimization Tips
        </h3>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">1. Allow AI Crawlers</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Update your robots.txt to allow AI bots:
            </p>
            <CodeBlock code={`User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /`} />
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">2. Use Server-Side Rendering</h4>
            <p className="text-sm text-muted-foreground">
              Most AI crawlers don't execute JavaScript. If your content is client-rendered,
              AI assistants see a blank page. Use SSR, SSG, or prerendering.
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">3. Add Structured Data</h4>
            <p className="text-sm text-muted-foreground mb-2">
              JSON-LD helps AI understand your content:
            </p>
            <CodeBlock code={`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
</script>`} />
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">4. Write for Citation</h4>
            <p className="text-sm text-muted-foreground">
              Include specific facts, statistics, and definitions that AI can quote directly.
              Add author information and publication dates for credibility.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MCPServerSection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">MCP Server for AI Assistants</h2>
        <p className="text-muted-foreground text-lg">
          Let Claude, ChatGPT, and other AI assistants run SEO audits directly using the Model Context Protocol.
        </p>
      </div>

      {/* What is MCP */}
      <section id="what-is-mcp">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bot className="h-5 w-5" />
          What is MCP?
        </h3>
        <p className="text-muted-foreground mb-4">
          The <strong>Model Context Protocol (MCP)</strong> is an open standard that lets AI assistants
          use external tools. RankCLI's MCP server gives AI assistants direct access to SEO analysis capabilities.
        </p>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
          <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Why This Matters</h4>
          <p className="text-sm text-muted-foreground">
            Instead of copy-pasting audit results, you can ask Claude:
            <em> "Run an SEO audit on my homepage and fix the critical issues."</em>
            Claude calls the MCP tools and generates fixes directly.
          </p>
        </div>

        <h4 className="font-medium mt-6 mb-2">Use Cases</h4>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Ask Claude to audit a URL during code review</li>
          <li>Generate robots.txt or structured data on demand</li>
          <li>Check AI crawler visibility while building</li>
          <li>Automate SEO checks in AI-powered workflows</li>
        </ul>
      </section>

      {/* Setup - Free & Local (primary) */}
      <section id="installation-mcp">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Setup
        </h3>
        <p className="text-muted-foreground mb-4">
          The MCP server is <strong>free, local, and requires no signup</strong> — nothing is sent to
          RankCLI's servers. For centralized dashboard sync across a team, a hosted option is also
          available below.
        </p>

        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
          <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">✨ No account needed</h4>
          <p className="text-sm text-muted-foreground">
            <code className="bg-muted px-1 rounded">npx @rankcli/mcp-server</code> runs the whole thing
            locally — no API key, no dashboard, no data leaving your machine.
          </p>
        </div>
      </section>

      {/* One-click install - the config block below is the same thing by hand */}
      <section id="one-click-install">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          One-click install
        </h3>
        <p className="text-muted-foreground mb-4">
          Nothing to configure and no account. The editor writes the config for you.
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          <a
            href="cursor://anysphere.cursor-deeplink/mcp/install?name=rankcli&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkByYW5rY2xpL21jcC1zZXJ2ZXIiXX0="
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-muted/40 hover:bg-muted transition-colors text-sm font-medium"
          >
            Add to Cursor
          </a>
          <a
            href="vscode:mcp/install?%7B%22name%22%3A%22rankcli%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40rankcli%2Fmcp-server%22%5D%7D"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-muted/40 hover:bg-muted transition-colors text-sm font-medium"
          >
            Add to VS Code
          </a>
        </div>

        <h4 className="font-medium mt-4 mb-2">Claude Desktop</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Download the latest{' '}
          <a
            href="https://github.com/integrallis/rankcli/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            <code className="bg-muted px-1 rounded">.mcpb</code> extension
          </a>{' '}
          and double-click it. No config file, no terminal.
        </p>

        <h4 className="font-medium mt-6 mb-2">Claude Code</h4>
        <p className="text-sm text-muted-foreground mb-2">One line, no config file:</p>
        <CodeBlock code={`claude mcp add rankcli -- npx -y @rankcli/mcp-server`} />
      </section>

      {/* Claude Desktop Setup */}
      <section id="claude-desktop">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Claude Desktop Setup
        </h3>
        <p className="text-muted-foreground mb-4">
          Add RankCLI to your Claude Desktop configuration:
        </p>

        <h4 className="font-medium mt-4 mb-2">macOS</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Edit <code className="bg-muted px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code>:
        </p>
        <CodeBlock code={`{
  "mcpServers": {
    "rankcli": {
      "command": "npx",
      "args": ["@rankcli/mcp-server"]
    }
  }
}`} />

        <h4 className="font-medium mt-6 mb-2">Windows</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Edit <code className="bg-muted px-1 rounded">%APPDATA%\\Claude\\claude_desktop_config.json</code>:
        </p>
        <CodeBlock code={`{
  "mcpServers": {
    "rankcli": {
      "command": "npx",
      "args": ["@rankcli/mcp-server"]
    }
  }
}`} />

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">After Configuration</h4>
          <p className="text-sm text-muted-foreground">
            Restart Claude Desktop. You'll see a hammer icon 🔨 indicating tools are available.
            Ask Claude: <em>"What SEO tools do you have?"</em>
          </p>
        </div>

        <h4 className="font-medium mt-8 mb-2">Alternative: Free Hosted (no install)</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Skip the local install entirely — point at the free hosted endpoint instead:
        </p>
        <CodeBlock code={`{
  "mcpServers": {
    "rankcli": {
      "url": "https://mcp.rankcli.dev/mcp/free"
    }
  }
}`} />

        <h4 className="font-medium mt-8 mb-2">Alternative: Hosted (for team dashboard sync)</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Get a free API key from <a href="/account" className="text-primary underline">Account → API Keys</a>,
          then point at the hosted endpoint instead:
        </p>
        <CodeBlock code={`{
  "mcpServers": {
    "rankcli-hosted": {
      "url": "https://mcp.rankcli.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`} />
      </section>

      {/* Available Tools */}
      <section id="available-tools">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Code className="h-5 w-5" />
          Available Tools
        </h3>
        <p className="text-muted-foreground mb-4">
          The MCP server provides {mcpTools.tools.length} tools:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mcpTools.tools.map((tool) => (
            <div key={tool.name} className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm font-mono">{tool.name}</h5>
              <p className="text-xs text-muted-foreground">{tool.desc}</p>
            </div>
          ))}
        </div>

        <h4 className="font-medium mt-6 mb-2">Example Prompts</h4>
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm italic">"Run a comprehensive SEO audit on https://example.com"</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm italic">"Check if my site is visible to ChatGPT and other AI search engines"</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm italic">"Generate an AI-friendly robots.txt for my domain"</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm italic">"What structured data should I add to my blog posts?"</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CLIReferenceSection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">CLI Reference</h2>
        <p className="text-muted-foreground text-lg">
          Complete reference for all RankCLI commands.
        </p>
      </div>

      {/* Auth commands */}
      <section id="auth">
        <h3 className="text-xl font-semibold mb-4">Authentication Commands</h3>
        <p className="text-muted-foreground mb-4">
          Manage your RankCLI authentication.
        </p>
        <CodeBlock
          code={`rankcli login [options]

Options:
  -e, --email <email>    Log in with email and password instead of the browser
  --no-browser           Skip the browser and log in with email and password in the terminal
  -t, --token <apiKey>   API key for non-interactive auth (CI/CD)`}
        />
        <CodeBlock
          code={`rankcli logout              Log out of your account
rankcli whoami              Show current logged in user`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="# Interactive login (opens your browser)" />
        <CodeBlock code="rankcli login" />
        <CodeBlock code="# Login with API key (CI/CD)" />
        <CodeBlock code="rankcli login --token rankcli_your_api_key_here" />
        <CodeBlock code="# Or set environment variable" />
        <CodeBlock code="export RANKCLI_API_KEY=rankcli_your_api_key_here" />
      </section>

      {/* rankcli audit */}
      <section id="audit">
        <h3 className="text-xl font-semibold mb-4">rankcli audit</h3>
        <p className="text-muted-foreground mb-4">
          Run the full audit on a URL (or on the url in rankcli.config.json when --url is omitted). The console report lists every issue with its code; -o json adds the fix for each.
        </p>
        <CodeBlock
          code={`rankcli audit [options]

Options:
  -u, --url <url>           URL to audit
  -o, --output <format>     Output format (json, console) (default: console)
  --max-pages <n>           Max pages to crawl (default: 5)
  --check-links             Check for broken internal/external links (slower)
  --fail-on <level>         CI gate: exit 1 on any issue at or above error, warning or notice
  --min-score <n>           CI gate: exit 1 if the score is below n
  --ai                      AI analysis on your own provider (Apple Intelligence on a
                            Mac that has it; otherwise your key or a local model)
  --ai-provider <provider>  apple, openrouter, openai, anthropic, groq, gemini, deepseek,
                            mistral, cerebras, together, fireworks, ollama, lmstudio,
                            llamacpp, vllm, custom (or set RANKCLI_AI_PROVIDER)
  --ai-key <key>            Provider API key (or its env var, e.g. OPENROUTER_API_KEY)
  --ai-model <model>        Override the provider's default model
  --ai-base-url <url>       Any OpenAI-compatible server (implies --ai-provider custom)`}
        />
        <p className="text-muted-foreground mt-4 mb-2">Exit codes, so a pipeline can tell a failed gate from a site that was down:</p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
          <li><code>0</code>: the audit completed and no --fail-on or --min-score gate tripped</li>
          <li><code>1</code>: a --fail-on or --min-score gate tripped</li>
          <li><code>2</code>: bad invocation (missing or invalid --url, invalid flag value)</li>
          <li><code>3</code>: no real audit: the site was unreachable, answered 4xx/5xx, or no page could be analyzed</li>
        </ul>
        <p className="text-muted-foreground mb-4">
          The gates are opt-in: without them a completed audit exits 0 however many issues it finds. With -o json, stdout is always one JSON document (on failure too) carrying exitCode, timestamp, cliVersion, a per-page breakdown and, when gates are set, a gate object with the reasons.
        </p>
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="# Basic audit" />
        <CodeBlock code="rankcli audit --url https://example.com" />
        <CodeBlock code="# Multi-page audit with JSON output" />
        <CodeBlock code="rankcli audit --url https://example.com --max-pages 10 -o json > report.json" />
        <CodeBlock code="# AI-enhanced audit" />
        <CodeBlock code="rankcli audit --url https://example.com --ai" />
      </section>

      {/* rankcli fix */}
      <section id="fix">
        <h3 className="text-xl font-semibold mb-4">rankcli fix</h3>
        <p className="text-muted-foreground mb-4">
          Agentic SEO fixer - automatically detect issues, generate fixes, apply them, 
          commit, and push. Full CI/CD automation.
        </p>
        <CodeBlock
          code={`rankcli fix [options]

Options:
  -u, --url <url>         URL to analyze
  --auto                  Auto-apply fixes without confirmation
  --commit                Commit changes with conventional commit message
  --push                  Push changes after committing (requires --commit)
  --dry-run               Preview changes without applying
  --only <codes>          Fix only specific issue codes (comma-separated)
  -o, --output <format>   Output format (text, json)`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="# Preview fixes without applying" />
        <CodeBlock code="rankcli fix --url https://mysite.com --dry-run" />
        <CodeBlock code="# Fix, commit, and push (CI mode)" />
        <CodeBlock code="rankcli fix --url https://mysite.com --auto --commit --push" />
        <CodeBlock code="# Fix only specific issues" />
        <CodeBlock code="rankcli fix --url https://mysite.com --auto --only TITLE_MISSING,META_DESC_MISSING" />

        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Conventional Commits
          </h4>
          <p className="text-sm text-muted-foreground">
            With <code className="bg-muted px-1 rounded">--commit</code>, RankCLI generates semantic commit messages 
            like <code className="bg-muted px-1 rounded">feat(seo): fix 3 SEO issues</code> that work with 
            semantic-release and CHANGELOG generators.
          </p>
        </div>
      </section>

      {/* rankcli track */}
      <section id="track">
        <h3 className="text-xl font-semibold mb-4">rankcli track</h3>
        <p className="text-muted-foreground mb-4">
          Keyword rank tracking - monitor your SERP positions over time.
        </p>
        <CodeBlock
          code={`rankcli track <command> [options]

Commands:
  add <keywords...>        Add keywords to track
  status                   Show current keyword rankings
  history                  Show keyword position history
  check                    Check current rankings (calls SERP API)
  export                   Export tracking data

Common Options:
  -u, --url <url>          URL to track rankings for
  -o, --output <format>    Output format (text, json)`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="# Add keywords to track" />
        <CodeBlock code='rankcli track add "seo tool" "cli seo" --url https://mysite.com' />
        <CodeBlock code="# View current rankings" />
        <CodeBlock code="rankcli track status --url https://mysite.com" />
        <CodeBlock code="# Check live SERP positions" />
        <CodeBlock code="rankcli track check --url https://mysite.com" />
        <CodeBlock code="# View position history for a keyword" />
        <CodeBlock code='rankcli track history --keyword "seo tool" --url https://mysite.com --days 30' />
        <CodeBlock code="# Export as CSV" />
        <CodeBlock code="rankcli track export --url https://mysite.com --format csv > rankings.csv" />

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">SERP API Required</h4>
          <p className="text-sm text-muted-foreground">
            Live rank checking requires a SERP API key. Set <code className="bg-muted px-1 rounded">VALUESERP_API_KEY</code> or{' '}
            <code className="bg-muted px-1 rounded">SERPAPI_KEY</code> in your environment.
          </p>
        </div>
      </section>

      {/* rankcli apply */}
      <section id="apply">
        <h3 className="text-xl font-semibold mb-4">rankcli apply</h3>
        <p className="text-muted-foreground mb-4">
          Generate and apply SEO fixes to your local codebase. Detects your framework
          and generates appropriate fixes.
        </p>
        <CodeBlock
          code={`rankcli apply [options]

Options:
  -u, --url <url>        URL to analyze for fixes
  --dry-run              Preview changes without applying
  --auto                 Apply all fixes without confirmation`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="# Preview fixes without applying" />
        <CodeBlock code="rankcli apply --url https://mysite.com --dry-run" />
        <CodeBlock code="# Apply fixes with confirmation" />
        <CodeBlock code="rankcli apply --url https://mysite.com" />
        <CodeBlock code="# Auto-apply all fixes (CI mode)" />
        <CodeBlock code="rankcli apply --url https://mysite.com --auto" />

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Framework Detection
          </h4>
          <p className="text-sm text-muted-foreground">
            Fixes are tailored to your framework. RankCLI automatically detects Next.js, React, Vue, Astro,
            SvelteKit, and more. For best results, run from your project root.
          </p>
        </div>
      </section>

      {/* rankcli keywords */}
      <section id="keywords">
        <h3 className="text-xl font-semibold mb-4">rankcli keywords</h3>
        <p className="text-muted-foreground mb-4">
          AI-powered keyword research and analysis.
        </p>
        <CodeBlock
          code={`rankcli keywords [options]

Options:
  -u, --url <url>            URL to analyze
  -s, --seed <keywords>      Seed keywords (comma-separated)
  --auto                     Auto-extract seed keywords from your page
  --quick                    Quick mode - skip questions, use defaults
  --ai                       AI research on your own provider (as audit --ai)
  --ai-provider <provider>   apple, openrouter, openai, ollama, ... (or RANKCLI_AI_PROVIDER)
  --ai-key / --ai-model / --ai-base-url   as for audit
  --competitor               Competitor gap analysis mode
  -c, --competitors <urls>   Competitor domains (comma-separated)`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="# AI-powered keyword research" />
        <CodeBlock code="rankcli keywords --url https://mysite.com --ai" />
        <CodeBlock code="# Quick analysis with seed keywords" />
        <CodeBlock code="rankcli keywords --url https://mysite.com --quick -s 'seo tools,seo audit'" />
        <CodeBlock code="# Competitor gap analysis" />
        <CodeBlock code="rankcli keywords --url https://mysite.com --competitor -c 'competitor1.com,competitor2.com' -s 'target keyword'" />
      </section>

      {/* rankcli content */}
      <section id="content">
        <h3 className="text-xl font-semibold mb-4">rankcli content</h3>
        <p className="text-muted-foreground mb-4">
          Analyze content for readability, keyword density, and featured snippet optimization.
        </p>
        <CodeBlock
          code={`rankcli content [options]

Options:
  -u, --url <url>          URL to analyze
  -k, --keyword <keyword>  Target keyword for analysis
  --headline <headline>    Analyze a headline
  --mode <mode>            Analysis mode (full, readability, headline, snippet, density)`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="# Full content analysis" />
        <CodeBlock code="rankcli content --url https://mysite.com/blog-post --keyword 'seo tips'" />
        <CodeBlock code="# Check headline effectiveness" />
        <CodeBlock code="rankcli content --headline 'The Ultimate Guide to SEO'" />
      </section>

      {/* rankcli intent */}
      <section id="intent">
        <h3 className="text-xl font-semibold mb-4">rankcli intent</h3>
        <p className="text-muted-foreground mb-4">
          Classify search intent for a keyword.
        </p>
        <CodeBlock
          code={`rankcli intent <keyword>

Arguments:
  keyword     Keyword to analyze for search intent`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="rankcli intent 'buy running shoes'" />
        <CodeBlock code="rankcli intent 'how to optimize images for seo'" />
      </section>

      {/* rankcli setup */}
      <section id="setup">
        <h3 className="text-xl font-semibold mb-4">rankcli setup</h3>
        <p className="text-muted-foreground mb-4">
          Configure tracking and CI/CD integrations.
        </p>
        <CodeBlock
          code={`rankcli setup [options]

Options:
  --ga4 <id>        Google Analytics 4 Measurement ID (G-XXXXXXXXXX)
  --gsc <code>      Google Search Console verification code
  --github-action   Write a GitHub Actions workflow that audits your site on a schedule
  --url <url>       Site URL the workflow audits
  --sync            Sync the workflow's audits to your dashboard and open auto-fix PRs
                    (needs a RANKCLI_API_KEY secret)
  --schedule <freq> GitHub Action schedule (daily, weekly, monthly)
  --all             Interactive setup wizard`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="# Add GA4 tracking to your project" />
        <CodeBlock code="rankcli setup --ga4 G-XXXXXXXXXX" />
        <CodeBlock code="# Create GitHub Actions workflow" />
        <CodeBlock code="rankcli setup --github-action" />
        <CodeBlock code="# Interactive setup wizard" />
        <CodeBlock code="rankcli setup --all" />
      </section>

      {/* rankcli gsc-setup */}
      <section id="gsc-setup">
        <h3 className="text-xl font-semibold mb-4">rankcli gsc-setup</h3>
        <p className="text-muted-foreground mb-4">
          Show Google Search Console API setup instructions.
        </p>
        <CodeBlock code="rankcli gsc-setup" />
      </section>
    </div>
  );
}

function DashboardSection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
        <p className="text-muted-foreground text-lg">
          The web dashboard provides a visual interface for managing your SEO audits,
          tracking issues, and creating fix PRs.
        </p>
      </div>

      {/* Projects */}
      <section id="projects">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5" />
          Managing Projects
        </h3>
        <p className="text-muted-foreground mb-4">
          Projects represent websites you want to audit. Each project tracks:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
          <li>Your website URL and domain</li>
          <li>Detected framework (React, Next.js, Vue, etc.)</li>
          <li>GitHub repository connection</li>
          <li>Audit history and scores over time</li>
          <li>All discovered SEO issues</li>
        </ul>

        <h4 className="font-medium mt-6 mb-2">Creating a Project</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-medium">1</div>
            <p className="text-muted-foreground">Go to the <a href="/dashboard" className="text-primary underline">Dashboard</a></p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-medium">2</div>
            <p className="text-muted-foreground">Click "Add Project"</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-medium">3</div>
            <p className="text-muted-foreground">Enter your site name and URL</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-medium">4</div>
            <p className="text-muted-foreground">Click "Run Audit" to start your first audit</p>
          </div>
        </div>
      </section>

      {/* Audits */}
      <section id="audits">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Understanding Audits
        </h3>
        <p className="text-muted-foreground mb-4">
          Each audit runs 280+ SEO checks and produces a comprehensive report.
        </p>

        <h4 className="font-medium mt-6 mb-2">Health Scores</h4>
        <p className="text-muted-foreground mb-4">
          Your overall score is calculated from category scores:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {[
            { name: 'Crawlability', weight: '20%' },
            { name: 'On-Page', weight: '25%' },
            { name: 'Content', weight: '20%' },
            { name: 'Performance', weight: '15%' },
            { name: 'Security', weight: '10%' },
            { name: 'Social', weight: '10%' },
          ].map((cat) => (
            <div key={cat.name} className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">{cat.name}</h5>
              <p className="text-xs text-muted-foreground">Weight: {cat.weight}</p>
            </div>
          ))}
        </div>

        <h4 className="font-medium mt-6 mb-2">Score Interpretation</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-16 h-6 rounded bg-green-500/20 text-green-600 text-xs font-medium flex items-center justify-center">80-100</span>
            <span className="text-muted-foreground text-sm">Excellent - Minor optimizations possible</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 h-6 rounded bg-yellow-500/20 text-yellow-600 text-xs font-medium flex items-center justify-center">60-79</span>
            <span className="text-muted-foreground text-sm">Good - Some issues need attention</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 h-6 rounded bg-red-500/20 text-red-600 text-xs font-medium flex items-center justify-center">0-59</span>
            <span className="text-muted-foreground text-sm">Needs Work - Critical issues present</span>
          </div>
        </div>
      </section>

      {/* Issues */}
      <section id="issues">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Managing Issues
        </h3>
        <p className="text-muted-foreground mb-4">
          Issues are SEO problems discovered during audits. Each issue includes:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
          <li><strong>Severity</strong> - Error (critical), Warning, or Notice</li>
          <li><strong>Category</strong> - Which SEO area is affected</li>
          <li><strong>Description</strong> - What the problem is</li>
          <li><strong>Impact</strong> - How it affects your SEO</li>
          <li><strong>How to Fix</strong> - Step-by-step fix instructions</li>
          <li><strong>Affected URLs</strong> - Which pages have this issue</li>
        </ul>

        <h4 className="font-medium mt-6 mb-2">Issue Actions</h4>
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">Create Fix PR</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Generate a GitHub pull request with AI-generated fixes for selected issues.
              Requires a connected GitHub repository; every plan has it (3 PRs a month on Free).
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">Mark as Ignored</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Hide issues you've decided not to fix. They won't appear in future audits.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">Mark as Won't Fix</h5>
            <p className="text-xs text-muted-foreground mt-1">
              For issues that are intentional or not applicable to your site.
            </p>
          </div>
        </div>

        <h4 className="font-medium mt-6 mb-2">Bulk Actions</h4>
        <p className="text-muted-foreground mb-4">
          Select multiple issues using the checkboxes, then use the floating action bar to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Mark multiple issues as ignored</li>
          <li>Mark multiple issues as won't fix</li>
          <li>Create a single PR for all selected issues</li>
        </ul>
      </section>

      {/* Exports */}
      <section id="exports">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Exporting Reports
        </h3>
        <p className="text-muted-foreground mb-4">
          Export your audit results in various formats:
        </p>
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">Markdown Export</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Download a markdown file with all issues in a table format.
              Great for adding to GitHub issues or documentation.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">Client report</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Download a printable report to share with clients or stakeholders; print it or save it as a PDF from your browser. White-label on the Agency plan.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">JSON via CLI</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Use <code className="bg-muted px-1 rounded text-xs">rankcli audit -o json</code> for
              programmatic access to audit data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function GitHubSection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">GitHub Integration</h2>
        <p className="text-muted-foreground text-lg">
          Connect your GitHub repository to enable automatic audits, fix PRs, and deployment triggers.
        </p>
      </div>

      {/* Install App */}
      <section id="install-app">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Github className="h-5 w-5" />
          Installing the GitHub App
        </h3>
        <p className="text-muted-foreground mb-4">
          The RankCLI GitHub App needs to be installed on your repository to enable integrations.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">1</span>
            </div>
            <div>
              <h4 className="font-medium">Go to your project</h4>
              <p className="text-sm text-muted-foreground">
                Open your project in the <a href="/dashboard" className="text-primary underline">dashboard</a>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">2</span>
            </div>
            <div>
              <h4 className="font-medium">Click "Connect GitHub"</h4>
              <p className="text-sm text-muted-foreground">
                You'll see this button in the project header if GitHub isn't connected yet
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">3</span>
            </div>
            <div>
              <h4 className="font-medium">Enter your repository URL</h4>
              <p className="text-sm text-muted-foreground">
                Paste the GitHub URL, e.g., <code className="bg-muted px-1 rounded text-xs">https://github.com/your-org/your-repo</code>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">4</span>
            </div>
            <div>
              <h4 className="font-medium">Install the GitHub App</h4>
              <p className="text-sm text-muted-foreground">
                You'll be redirected to GitHub to authorize the app. Select the repository and click "Install".
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">5</span>
            </div>
            <div>
              <h4 className="font-medium">Done!</h4>
              <p className="text-sm text-muted-foreground">
                You'll be redirected back to RankCLI and the connection will be complete.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Required Permissions</h4>
          <p className="text-sm text-muted-foreground mb-2">
            The RankCLI GitHub App requests these permissions:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li><strong>Contents</strong> - Read/write to create fix commits</li>
            <li><strong>Pull Requests</strong> - Create and update PRs</li>
            <li><strong>Metadata</strong> - Read repository information</li>
            <li><strong>Webhooks</strong> - Receive push and deployment events</li>
          </ul>
        </div>
      </section>

      {/* Connect Repo */}
      <section id="connect-repo">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          Route Discovery
        </h3>
        <p className="text-muted-foreground mb-4">
          When connected to GitHub, RankCLI can discover your routes from your source code
          instead of just crawling links. This finds pages that aren't linked from the homepage.
        </p>

        <h4 className="font-medium mt-6 mb-2">Supported Frameworks</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Next.js', pattern: 'app/**/page.tsx, pages/**/*.tsx' },
            { name: 'Astro', pattern: 'src/pages/**/*.astro' },
            { name: 'SvelteKit', pattern: 'src/routes/**/+page.svelte' },
            { name: 'React Router', pattern: 'routes.tsx, App.tsx' },
          ].map((fw) => (
            <div key={fw.name} className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">{fw.name}</h5>
              <p className="text-xs text-muted-foreground font-mono">{fw.pattern}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Auto PRs */}
      <section id="auto-prs">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          Automatic Fix PRs
        </h3>
        <p className="text-muted-foreground mb-4">
          Create pull requests with AI-generated fixes for your SEO issues.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">1</span>
            </div>
            <div>
              <h4 className="font-medium">Run an audit</h4>
              <p className="text-sm text-muted-foreground">
                Click "Run Audit" on your project to discover issues
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">2</span>
            </div>
            <div>
              <h4 className="font-medium">Select issues to fix</h4>
              <p className="text-sm text-muted-foreground">
                Use checkboxes to select which issues you want fixed, or select all
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">3</span>
            </div>
            <div>
              <h4 className="font-medium">Click "Create Fix PR"</h4>
              <p className="text-sm text-muted-foreground">
                AI analyzes your codebase and generates framework-appropriate fixes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">4</span>
            </div>
            <div>
              <h4 className="font-medium">Review and merge</h4>
              <p className="text-sm text-muted-foreground">
                A PR is created on GitHub. Review the changes and merge when ready.
              </p>
            </div>
          </div>
        </div>

        <h4 className="font-medium mt-6 mb-2">What Gets Fixed</h4>
        <p className="text-muted-foreground mb-4">
          The AI generates fixes for issues that can be automatically resolved:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Missing or incomplete meta tags (title, description, OG)</li>
          <li>Missing robots.txt or sitemap.xml</li>
          <li>Missing security headers (_headers, vercel.json)</li>
          <li>Missing structured data (JSON-LD)</li>
          <li>Framework-specific optimizations (Next.js Metadata API, etc.)</li>
        </ul>

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">Limits by plan</h4>
          <p className="text-sm text-muted-foreground">
            Free accounts get 3 auto-fix PRs a month, 1 open at a time. Paid plans have no monthly cap:
            1 open PR per site on Solo, 3 on Pro and 10 on Agency (3, 5 and 10 per report).
            rankcli fix applies the same fixes locally on every plan, with or without an account.
          </p>
        </div>
      </section>

      {/* Webhooks */}
      <section id="webhooks">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Automatic Triggers
        </h3>
        <p className="text-muted-foreground mb-4">
          Once connected, RankCLI automatically responds to GitHub events:
        </p>

        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">Push to main branch</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Triggers an audit when SEO-relevant files change (HTML, meta configs, etc.)
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">Deployment completed</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Triggers an audit when your site is deployed (Vercel, Netlify, Cloudflare Pages)
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">PR merged</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Updates issue status when a fix PR is merged
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FrameworksSection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">Framework-Specific Checks</h2>
        <p className="text-muted-foreground text-lg">
          RankCLI includes specialized SEO checks and fixes tailored to your framework.
        </p>
      </div>

      {/* Supported Frameworks */}
      <section id="supported">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Supported Frameworks
        </h3>
        <p className="text-muted-foreground mb-4">
          We support the most popular web frameworks with specific SEO guidance:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'React',
              type: 'SPA',
              checks: ['Client-side rendering detection', 'React Helmet usage', 'Code splitting optimization'],
            },
            {
              name: 'Next.js',
              type: 'Meta Framework',
              checks: ['Metadata API usage', 'Image component optimization', 'App Router best practices'],
            },
            {
              name: 'Vue.js',
              type: 'SPA',
              checks: ['Client-side rendering detection', 'Vue Meta configuration', 'SSR recommendations'],
            },
            {
              name: 'Nuxt',
              type: 'Meta Framework',
              checks: ['useSeoMeta usage', 'NuxtImage optimization', 'Sitemap module'],
            },
            {
              name: 'Angular',
              type: 'SPA',
              checks: ['Angular Universal SSR', 'Lazy loading routes', 'Meta service usage'],
            },
            {
              name: 'Astro',
              type: 'Static',
              checks: ['Sitemap integration', 'Image optimization', 'View transitions'],
            },
            {
              name: 'SvelteKit',
              type: 'Meta Framework',
              checks: ['Load function SSR', 'Prerendering', 'svelte:head usage'],
            },
            {
              name: 'WordPress',
              type: 'CMS',
              checks: ['SEO plugin detection', 'Caching configuration', 'Image optimization'],
            },
            {
              name: 'Ruby on Rails',
              type: 'Server',
              checks: ['meta-tags gem', 'sitemap_generator', 'Turbo compatibility'],
            },
            {
              name: 'Laravel',
              type: 'Server',
              checks: ['artesaos/seotools', 'Inertia SSR', 'Response caching'],
            },
            {
              name: 'Django',
              type: 'Server',
              checks: ['Sitemap framework', 'django-meta', 'GZip middleware'],
            },
            {
              name: 'Gatsby',
              type: 'Static',
              checks: ['gatsby-plugin-react-helmet', 'Image optimization', 'Sitemap generation'],
            },
          ].map((fw) => (
            <div key={fw.name} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">{fw.name}</h5>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{fw.type}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {fw.checks.map((check, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Detection */}
      <section id="detection">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scan className="h-5 w-5" />
          How Detection Works
        </h3>
        <p className="text-muted-foreground mb-4">
          RankCLI detects your framework using multiple signals:
        </p>

        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">HTML Fingerprints</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Identifies frameworks by HTML patterns like <code className="bg-muted px-1 rounded">id="__next"</code>,{' '}
              <code className="bg-muted px-1 rounded">data-astro-cid</code>, or{' '}
              <code className="bg-muted px-1 rounded">ng-version</code>
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">package.json Dependencies</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Checks for framework packages like <code className="bg-muted px-1 rounded">next</code>,{' '}
              <code className="bg-muted px-1 rounded">@angular/core</code>, or{' '}
              <code className="bg-muted px-1 rounded">astro</code>
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">File Patterns</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Looks for config files like <code className="bg-muted px-1 rounded">next.config.js</code>,{' '}
              <code className="bg-muted px-1 rounded">astro.config.mjs</code>, or{' '}
              <code className="bg-muted px-1 rounded">nuxt.config.ts</code>
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm">HTTP Headers</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Checks <code className="bg-muted px-1 rounded">X-Powered-By</code> headers for framework identification
            </p>
          </div>
        </div>
      </section>

      {/* Recipes */}
      <section id="recipes">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Framework Recipes
        </h3>
        <p className="text-muted-foreground mb-4">
          Each framework has a "recipe" containing specialized SEO guidance:
        </p>

        <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
          <li><strong>Framework-specific checks</strong> - Issues unique to your framework</li>
          <li><strong>SEO strengths</strong> - Built-in SEO features to leverage</li>
          <li><strong>SEO challenges</strong> - Common pitfalls to avoid (e.g., CSR issues)</li>
          <li><strong>Performance tips</strong> - Framework-specific optimizations</li>
          <li><strong>Recommended packages</strong> - Best plugins/gems for SEO</li>
          <li><strong>Migration paths</strong> - How to fix CSR issues with SSR</li>
        </ul>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Example: React CSR Issue</h4>
          <p className="text-sm text-muted-foreground mb-2">
            If RankCLI detects a client-side rendered React app, it will:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Flag it as an error (search engines can't index CSR content)</li>
            <li>Suggest migrating to Next.js, Remix, or adding prerendering</li>
            <li>Provide code examples for each migration path</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function WorkflowsSection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">Workflows</h2>
        <p className="text-muted-foreground text-lg">
          Choose the workflow that fits your needs. Full control or full automation.
        </p>
      </div>

      {/* Local Workflow */}
      <section id="local-workflow">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Local Workflow (no GitHub access)
        </h3>
        <p className="text-muted-foreground mb-4">
          Keep full control over your repository. No GitHub access required.
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">1</span>
            </div>
            <div>
              <h4 className="font-medium">Run an audit</h4>
              <CodeBlock code="rankcli audit --url https://yoursite.com" />
              <p className="text-sm text-muted-foreground mt-1">
                280+ SEO checks run and results sync to your dashboard.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">2</span>
            </div>
            <div>
              <h4 className="font-medium">Generate fixes locally</h4>
              <CodeBlock code="rankcli apply --url https://yoursite.com --dry-run" />
              <p className="text-sm text-muted-foreground mt-1">
                Preview what changes will be made to your codebase.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">3</span>
            </div>
            <div>
              <h4 className="font-medium">Apply and commit</h4>
              <CodeBlock code="rankcli apply --url https://yoursite.com" />
              <CodeBlock code="git add . && git commit -m 'fix(seo): apply SEO fixes'" />
              <p className="text-sm text-muted-foreground mt-1">
                Apply fixes and commit when you're ready.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">4</span>
            </div>
            <div>
              <h4 className="font-medium">Push when ready</h4>
              <CodeBlock code="git push origin main" />
              <p className="text-sm text-muted-foreground mt-1">
                Create a PR manually when you're satisfied with the changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Workflow */}
      <section id="github-workflow">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          GitHub Workflow (auto-fix PRs)
        </h3>
        <p className="text-muted-foreground mb-4">
          Full automation with GitHub integration. PRs created automatically from the dashboard or CLI.
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">1</span>
            </div>
            <div>
              <h4 className="font-medium">Connect your repository</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Install the RankCLI GitHub App on your repository (see{' '}
                <span className="text-primary">GitHub Integration</span> section).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">2</span>
            </div>
            <div>
              <h4 className="font-medium">Run audit and create PR</h4>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>From Dashboard:</strong> Click "Run Audit", then "Create Fix PR"
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>From CLI:</strong>
              </p>
              <CodeBlock code="rankcli audit --url https://yoursite.com" />
              <CodeBlock code="rankcli fix --pr" />
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">3</span>
            </div>
            <div>
              <h4 className="font-medium">Review and merge</h4>
              <p className="text-sm text-muted-foreground mt-1">
                A pull request is created on GitHub with all fixes. Review and merge when ready.
                Issue status updates automatically when the PR is merged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CI/CD */}
      <section id="ci-cd">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          CI/CD Integration
        </h3>
        <p className="text-muted-foreground mb-4">
          Run SEO audits as part of your CI/CD pipeline to catch issues before deployment.
        </p>
        <h4 className="font-medium mb-2">GitHub Actions</h4>
        <CodeBlock
          code={`name: SEO Audit
on:
  push:
    branches: [main]
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Install RankCLI
        run: npm install -g @rankcli/cli

      - name: Run SEO Audit
        run: rankcli audit --url \${{ secrets.SITE_URL }} --fail-on error --min-score 80
        env:
          RANKCLI_API_KEY: \${{ secrets.RANKCLI_API_KEY }}`}
        />

        <h4 className="font-medium mt-6 mb-2">Using the GitHub Action</h4>
        <p className="text-muted-foreground mb-4">
          Alternatively, use our official GitHub Action:
        </p>
        <CodeBlock
          code={`- uses: integrallis/rankcli-action@v1
  with:
    url: \${{ secrets.SITE_URL }}
    api-key: \${{ secrets.RANKCLI_API_KEY }}
    fail-on-errors: true`}
        />
      </section>
    </div>
  );
}

function APISection() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">API Reference</h2>
        <p className="text-muted-foreground text-lg">
          REST API for programmatic access on the Solo, Pro and Agency plans (100, 1,000 and 10,000 requests a day).
        </p>
      </div>

      {/* REST API */}
      <section id="rest-api">
        <h3 className="text-xl font-semibold mb-4">REST API</h3>
        <p className="text-muted-foreground mb-4">
          The RankCLI API allows you to run audits programmatically and integrate
          SEO checks into your own tools and workflows.
        </p>

        <h4 className="font-medium mt-6 mb-2">Authentication</h4>
        <p className="text-muted-foreground mb-4">
          Use your API key in the X-API-Key header:
        </p>
        <CodeBlock
          code={`curl -X POST https://api.rankcli.dev/v1/audit \\
  -H "X-API-Key: rankcli_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
        />
        <p className="text-muted-foreground mt-4">
          Generate an API key from <a href="/account" className="text-primary underline">Account Settings → API Keys</a>.
          API keys start with <code className="bg-muted px-1 rounded">rankcli_</code>.
        </p>

        <h4 className="font-medium mt-6 mb-2">Endpoints</h4>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded font-mono">POST</span>
              <code className="text-sm font-mono">/v1/audit</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Start a new SEO audit for a URL.
            </p>
            <CodeBlock
              code={`{
  "url": "https://example.com",
  "maxPages": 5,
  "enableAI": true
}`}
            />
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded font-mono">GET</span>
              <code className="text-sm font-mono">/v1/audits/:id</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Get the results of a completed audit.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded font-mono">GET</span>
              <code className="text-sm font-mono">/v1/projects</code>
            </div>
            <p className="text-sm text-muted-foreground">
              List all projects in your account.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded font-mono">POST</span>
              <code className="text-sm font-mono">/v1/projects/:id/fix-pr</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a fix PR for a project (requires GitHub connection).
            </p>
          </div>
        </div>

      </section>

      {/* Webhooks */}
      <section id="webhooks-api">
        <h3 className="text-xl font-semibold mb-4">Webhooks</h3>
        <p className="text-muted-foreground mb-4">
          Receive notifications when audits complete or issues are found.
        </p>

        <h4 className="font-medium mt-6 mb-2">Available Events</h4>
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <code className="text-sm font-mono">audit.completed</code>
            <p className="text-xs text-muted-foreground mt-1">Fired when an audit finishes</p>
          </div>
          <div className="p-3 border rounded-lg">
            <code className="text-sm font-mono">audit.failed</code>
            <p className="text-xs text-muted-foreground mt-1">Fired when an audit fails</p>
          </div>
          <div className="p-3 border rounded-lg">
            <code className="text-sm font-mono">pr.created</code>
            <p className="text-xs text-muted-foreground mt-1">Fired when a fix PR is created</p>
          </div>
          <div className="p-3 border rounded-lg">
            <code className="text-sm font-mono">pr.merged</code>
            <p className="text-xs text-muted-foreground mt-1">Fired when a fix PR is merged</p>
          </div>
        </div>

        <h4 className="font-medium mt-6 mb-2">Payload Example</h4>
        <CodeBlock
          code={`{
  "event": "audit.completed",
  "project_id": "proj_xxx",
  "audit_id": "audit_xxx",
  "score": 85,
  "issues_found": 12,
  "issues_by_severity": {
    "error": 2,
    "warning": 6,
    "notice": 4
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}
        />
      </section>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-muted p-3 rounded-md overflow-x-auto">
      <code className="text-sm font-mono">{code}</code>
    </pre>
  );
}
