import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Terminal,
  Key,
  Scan,
  GitPullRequest,
  Upload,
  Settings,
  Book,
  Code,
  ExternalLink,
  Github,
  LayoutDashboard,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Terminal,
    subsections: ['installation', 'authentication', 'first-audit'],
  },
  {
    id: 'cli-reference',
    title: 'CLI Reference',
    icon: Code,
    subsections: ['audit', 'fix', 'link', 'keywords', 'setup'],
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

export function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="sticky top-8 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left',
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeSection === 'getting-started' && <GettingStartedSection />}
            {activeSection === 'cli-reference' && <CLIReferenceSection />}
            {activeSection === 'dashboard' && <DashboardSection />}
            {activeSection === 'github' && <GitHubSection />}
            {activeSection === 'frameworks' && <FrameworksSection />}
            {activeSection === 'workflows' && <WorkflowsSection />}
            {activeSection === 'api' && <APISection />}
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
        <h1 className="text-3xl font-bold mb-4">Getting Started</h1>
        <p className="text-muted-foreground text-lg">
          Get up and running with RankCLI in minutes. Choose between the CLI for local development
          or the web dashboard for a visual experience.
        </p>
      </div>

      {/* Installation */}
      <section id="installation">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Installation
        </h2>
        <p className="text-muted-foreground mb-4">
          Install the RankCLI globally using npm, yarn, or pnpm:
        </p>
        <div className="space-y-2">
          <CodeBlock code="npm install -g @rankcli/cli" />
          <CodeBlock code="# or with yarn" />
          <CodeBlock code="yarn global add @rankcli/cli" />
          <CodeBlock code="# or with pnpm" />
          <CodeBlock code="pnpm add -g @rankcli/cli" />
        </div>
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          Authentication
        </h2>
        <p className="text-muted-foreground mb-4">
          Link your CLI to your RankCLI account to unlock full features:
        </p>
        <CodeBlock code="rankcli login" />
        <p className="text-muted-foreground mt-4">
          This will open your browser to authenticate. You can also use email/password:
        </p>
        <CodeBlock code="rankcli login --email you@example.com" />
        <p className="text-muted-foreground mt-4">
          Check your login status:
        </p>
        <CodeBlock code="rankcli whoami" />

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Without Authentication</h4>
          <p className="text-sm text-muted-foreground">
            You can still run basic audits without logging in, but you'll be limited
            to 50 checks and won't have access to cloud features like audit history,
            issue tracking, and automatic PR creation.
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
                <td className="text-center py-2 px-4">50</td>
                <td className="text-center py-2 px-4">100</td>
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
                <td className="py-2 pr-4">GitHub Connect</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                <td className="text-center py-2 px-4"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Auto-Fix PRs</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4">-</td>
                <td className="text-center py-2 px-4"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* First Audit */}
      <section id="first-audit">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Running Your First Audit
        </h2>
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
          Requires an OpenAI API key set as <code className="bg-muted px-1 rounded">OPENAI_API_KEY</code> environment variable.
        </p>
      </section>
    </div>
  );
}

function CLIReferenceSection() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-4">CLI Reference</h1>
        <p className="text-muted-foreground text-lg">
          Complete reference for all RankCLI commands.
        </p>
      </div>

      {/* rankcli audit */}
      <section id="audit">
        <h2 className="text-xl font-semibold mb-4">rankcli audit</h2>
        <p className="text-muted-foreground mb-4">
          Run a comprehensive SEO audit on a URL or local project.
        </p>
        <CodeBlock
          code={`rankcli audit [options]

Options:
  -u, --url <url>        URL to audit
  -o, --output <format>  Output format: json, markdown (default: console)
  --max-pages <n>        Max pages to crawl (default: 5)
  --check-links          Also check for broken links
  --ai                   Enable AI-powered analysis
  --ai-provider <p>      AI provider: openai or anthropic
  --ai-key <key>         API key (or use env var)`}
        />
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
        <h2 className="text-xl font-semibold mb-4">rankcli apply</h2>
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

      {/* rankcli link */}
      <section id="link">
        <h2 className="text-xl font-semibold mb-4">rankcli link</h2>
        <p className="text-muted-foreground mb-4">
          Link your local repository to a RankCLI project for cloud sync.
        </p>
        <CodeBlock
          code={`rankcli link [options]

Options:
  --project <id>       Link to a specific project ID
  --create             Create a new project if none exists`}
        />
      </section>

      {/* rankcli keywords */}
      <section id="keywords">
        <h2 className="text-xl font-semibold mb-4">rankcli keywords</h2>
        <p className="text-muted-foreground mb-4">
          AI-powered keyword research and analysis.
        </p>
        <CodeBlock
          code={`rankcli keywords [options]

Options:
  -u, --url <url>      URL to analyze
  -s, --seed <kw>      Seed keyword to start research
  --competitor <url>   Competitor URL for gap analysis
  --quick              Quick analysis with fewer results`}
        />
      </section>

      {/* rankcli setup */}
      <section id="setup">
        <h2 className="text-xl font-semibold mb-4">rankcli setup</h2>
        <p className="text-muted-foreground mb-4">
          Configure tracking and CI/CD integrations.
        </p>
        <CodeBlock
          code={`rankcli setup [command]

Commands:
  ga4              Add Google Analytics 4 tracking
  gsc              Add Google Search Console verification
  github-action    Create GitHub Actions workflow`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock code="# Add GA4 tracking to your project" />
        <CodeBlock code="rankcli setup ga4 --id G-XXXXXXXXXX" />
        <CodeBlock code="# Create GitHub Actions workflow" />
        <CodeBlock code="rankcli setup github-action" />
      </section>
    </div>
  );
}

function DashboardSection() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          The web dashboard provides a visual interface for managing your SEO audits,
          tracking issues, and creating fix PRs.
        </p>
      </div>

      {/* Projects */}
      <section id="projects">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5" />
          Managing Projects
        </h2>
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Understanding Audits
        </h2>
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Managing Issues
        </h2>
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
              Requires GitHub connection (Pro plan).
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Exporting Reports
        </h2>
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
            <h5 className="font-medium text-sm">PDF Report</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Generate a branded PDF report to share with clients or stakeholders.
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
        <h1 className="text-3xl font-bold mb-4">GitHub Integration</h1>
        <p className="text-muted-foreground text-lg">
          Connect your GitHub repository to enable automatic audits, fix PRs, and deployment triggers.
        </p>
      </div>

      {/* Install App */}
      <section id="install-app">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Github className="h-5 w-5" />
          Installing the GitHub App
        </h2>
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          Route Discovery
        </h2>
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          Automatic Fix PRs
        </h2>
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
          <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">Pro Plan Required</h4>
          <p className="text-sm text-muted-foreground">
            Automatic PR creation requires the Pro plan or higher.
            Solo users can use the CLI to generate fixes locally.
          </p>
        </div>
      </section>

      {/* Webhooks */}
      <section id="webhooks">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Automatic Triggers
        </h2>
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
        <h1 className="text-3xl font-bold mb-4">Framework-Specific Checks</h1>
        <p className="text-muted-foreground text-lg">
          RankCLI includes specialized SEO checks and fixes tailored to your framework.
        </p>
      </div>

      {/* Supported Frameworks */}
      <section id="supported">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Supported Frameworks
        </h2>
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scan className="h-5 w-5" />
          How Detection Works
        </h2>
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Framework Recipes
        </h2>
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
        <h1 className="text-3xl font-bold mb-4">Workflows</h1>
        <p className="text-muted-foreground text-lg">
          Choose the workflow that fits your needs. Full control or full automation.
        </p>
      </div>

      {/* Local Workflow */}
      <section id="local-workflow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Local Workflow (Solo Plan)
        </h2>
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          GitHub Workflow (Pro Plan)
        </h2>
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          CI/CD Integration
        </h2>
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
      - uses: actions/checkout@v4

      - name: Install RankCLI
        run: npm install -g @rankcli/cli

      - name: Run SEO Audit
        run: rankcli audit --url \${{ secrets.SITE_URL }} -o json > audit.json
        env:
          RANKCLI_TOKEN: \${{ secrets.RANKCLI_TOKEN }}

      - name: Check for critical issues
        run: |
          errors=$(jq '.issues | map(select(.severity == "error")) | length' audit.json)
          if [ "$errors" -gt 0 ]; then
            echo "::error::Found $errors critical SEO issues"
            exit 1
          fi`}
        />

        <h4 className="font-medium mt-6 mb-2">Using the GitHub Action</h4>
        <p className="text-muted-foreground mb-4">
          Alternatively, use our official GitHub Action:
        </p>
        <CodeBlock
          code={`- uses: rankcli/audit-action@v1
  with:
    url: \${{ secrets.SITE_URL }}
    token: \${{ secrets.RANKCLI_TOKEN }}
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
        <h1 className="text-3xl font-bold mb-4">API Reference</h1>
        <p className="text-muted-foreground text-lg">
          REST API for programmatic access (Agency plan only).
        </p>
      </div>

      {/* REST API */}
      <section id="rest-api">
        <h2 className="text-xl font-semibold mb-4">REST API</h2>
        <p className="text-muted-foreground mb-4">
          The RankCLI API allows you to run audits programmatically and integrate
          SEO checks into your own tools and workflows.
        </p>

        <h4 className="font-medium mt-6 mb-2">Authentication</h4>
        <p className="text-muted-foreground mb-4">
          Use your API key in the Authorization header:
        </p>
        <CodeBlock
          code={`curl -X POST https://api.rankcli.dev/v1/audit \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
        />

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

        <div className="mt-6">
          <a
            href="/api-docs"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            View Full API Documentation
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Webhooks */}
      <section id="webhooks-api">
        <h2 className="text-xl font-semibold mb-4">Webhooks</h2>
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
