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
    subsections: ['audit', 'fix', 'link', 'keywords'],
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
    subsections: ['rest-api', 'webhooks'],
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
          Get up and running with RankCLI in minutes.
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
          <CodeBlock language="bash" code="npm install -g @rankcli/cli" />
          <CodeBlock language="bash" code="# or with yarn" />
          <CodeBlock language="bash" code="yarn global add @rankcli/cli" />
          <CodeBlock language="bash" code="# or with pnpm" />
          <CodeBlock language="bash" code="pnpm add -g @rankcli/cli" />
        </div>
        <p className="text-muted-foreground mt-4">
          Verify the installation:
        </p>
        <CodeBlock language="bash" code="rankcli --version" />
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
        <CodeBlock language="bash" code="rankcli auth" />
        <p className="text-muted-foreground mt-4">
          This will open your browser to authenticate. Once logged in, your CLI
          will be linked to your account automatically.
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Without Authentication</h4>
          <p className="text-sm text-muted-foreground">
            You can still run basic audits without logging in, but you'll be limited
            to 50 checks and won't have access to cloud features like audit history.
          </p>
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
        <CodeBlock language="bash" code="rankcli audit --url https://yoursite.com" />
        <p className="text-muted-foreground mt-4">
          Or run an audit on your local project (from the project root):
        </p>
        <CodeBlock language="bash" code="rankcli audit" />
        <p className="text-muted-foreground mt-4">
          The audit will run 280+ SEO checks and provide a detailed report with:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
          <li>Overall health score</li>
          <li>Critical issues that need immediate attention</li>
          <li>Warnings and recommendations</li>
          <li>Actionable fixes for each issue</li>
        </ul>
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
          language="bash"
          code={`rankcli audit [options]

Options:
  -u, --url <url>      URL to audit (optional, uses project URL if not specified)
  -o, --output <file>  Output file for JSON report
  --check-links        Also check for broken links
  -v, --verbose        Show detailed output`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock language="bash" code="# Audit a URL" />
        <CodeBlock language="bash" code="rankcli audit --url https://example.com" />
        <CodeBlock language="bash" code="# Audit with JSON output" />
        <CodeBlock language="bash" code="rankcli audit --url https://example.com -o report.json" />
      </section>

      {/* rankcli fix */}
      <section id="fix">
        <h2 className="text-xl font-semibold mb-4">rankcli fix</h2>
        <p className="text-muted-foreground mb-4">
          Apply SEO fixes to your local codebase.
        </p>
        <CodeBlock
          language="bash"
          code={`rankcli fix [options]

Options:
  --dry-run            Preview changes without applying
  --commit             Apply fixes and create a commit
  --branch <name>      Create a new branch for fixes
  --pr                 Create a pull request (requires GitHub integration)`}
        />
        <h4 className="font-medium mt-6 mb-2">Examples</h4>
        <CodeBlock language="bash" code="# Preview fixes without applying" />
        <CodeBlock language="bash" code="rankcli fix --dry-run" />
        <CodeBlock language="bash" code="# Apply fixes and commit" />
        <CodeBlock language="bash" code="rankcli fix --commit" />
        <CodeBlock language="bash" code="# Create a fix branch (Solo plan)" />
        <CodeBlock language="bash" code="rankcli fix --branch fix/seo" />
        <CodeBlock language="bash" code="# Create a PR automatically (Pro plan)" />
        <CodeBlock language="bash" code="rankcli fix --pr" />
      </section>

      {/* rankcli link */}
      <section id="link">
        <h2 className="text-xl font-semibold mb-4">rankcli link</h2>
        <p className="text-muted-foreground mb-4">
          Link your local repository to a RankCLI project for cloud sync.
        </p>
        <CodeBlock
          language="bash"
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
          language="bash"
          code={`rankcli keywords [options]

Options:
  -u, --url <url>      URL to analyze
  -s, --seed <kw>      Seed keyword to start research
  --competitor <url>   Competitor URL for gap analysis
  --quick              Quick analysis with fewer results`}
        />
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
              <CodeBlock language="bash" code="rankcli audit" />
              <p className="text-sm text-muted-foreground mt-1">
                280+ SEO checks run locally on your project.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">2</span>
            </div>
            <div>
              <h4 className="font-medium">Apply fixes locally</h4>
              <CodeBlock language="bash" code="rankcli fix --commit" />
              <p className="text-sm text-muted-foreground mt-1">
                Fixes are applied to your local files and committed.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">3</span>
            </div>
            <div>
              <h4 className="font-medium">Push when ready</h4>
              <CodeBlock language="bash" code="git push origin fix/seo" />
              <p className="text-sm text-muted-foreground mt-1">
                Create a PR manually when you're ready.
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
          Full automation with GitHub integration. PRs created automatically.
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">1</span>
            </div>
            <div>
              <h4 className="font-medium">Connect your repository</h4>
              <CodeBlock language="bash" code="rankcli link" />
              <p className="text-sm text-muted-foreground mt-1">
                Install the RankCLI GitHub App on your repository.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">2</span>
            </div>
            <div>
              <h4 className="font-medium">Create fix PR automatically</h4>
              <CodeBlock language="bash" code="rankcli fix --pr" />
              <p className="text-sm text-muted-foreground mt-1">
                A pull request is created on GitHub with all fixes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium">3</span>
            </div>
            <div>
              <h4 className="font-medium">Review and merge</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Review the changes on GitHub and merge when ready.
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
          Run SEO audits as part of your CI/CD pipeline.
        </p>
        <h4 className="font-medium mb-2">GitHub Actions</h4>
        <CodeBlock
          language="yaml"
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
      - uses: rankcli/audit-action@v1
        with:
          url: \${{ secrets.SITE_URL }}
          token: \${{ secrets.RANKCLI_TOKEN }}`}
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
          language="bash"
          code={`curl -X POST https://api.rankcli.dev/v1/audit \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
        />

        <h4 className="font-medium mt-6 mb-2">Endpoints</h4>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <code className="text-sm font-mono">POST /v1/audit</code>
            <p className="text-sm text-muted-foreground mt-1">
              Start a new SEO audit for a URL.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <code className="text-sm font-mono">GET /v1/audits/:id</code>
            <p className="text-sm text-muted-foreground mt-1">
              Get the results of a completed audit.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <code className="text-sm font-mono">GET /v1/projects</code>
            <p className="text-sm text-muted-foreground mt-1">
              List all projects in your account.
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
      <section id="webhooks">
        <h2 className="text-xl font-semibold mb-4">Webhooks</h2>
        <p className="text-muted-foreground mb-4">
          Receive notifications when audits complete or issues are found.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "event": "audit.completed",
  "project_id": "proj_xxx",
  "audit_id": "audit_xxx",
  "score": 85,
  "issues_found": 12,
  "timestamp": "2024-01-15T10:30:00Z"
}`}
        />
      </section>
    </div>
  );
}

function CodeBlock({ code }: { language?: string; code: string }) {
  return (
    <pre className="bg-muted p-3 rounded-md overflow-x-auto">
      <code className="text-sm font-mono">{code}</code>
    </pre>
  );
}
