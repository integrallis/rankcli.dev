import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Github, Twitter } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-16 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">About RankCLI</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p>
            RankCLI is a developer-first SEO tool built on a simple idea: SEO should work
            the way developers already work. Not a dashboard you log into once a quarter,
            but a check that runs in your terminal and your CI pipeline, right alongside
            your linter and your test suite.
          </p>

          <p>
            We built RankCLI after watching the same pattern play out on project after
            project: real engineering effort goes into shipping fast, well-tested code,
            while basic SEO fundamentals - meta tags, structured data, crawlability,
            Core Web Vitals - get skipped, not out of neglect, but because the tooling for
            catching them never fit into a developer's actual workflow.
          </p>

          <p>
            So RankCLI runs 280+ checks from the command line, understands your framework,
            and can open a pull request with the fix instead of just a report telling you
            something's wrong. It also ships a free, local MCP server, so AI coding
            assistants can run the same checks directly against your codebase - no signup,
            nothing sent to our servers.
          </p>

          <p>
            RankCLI is built and maintained by{' '}
            <a href="https://integrallis.com" target="_blank" rel="noopener noreferrer">
              Integrallis Software, LLC
            </a>
            , a software consultancy that has spent years building developer tools and
            production systems for other teams.
          </p>
        </div>

        <div className="flex gap-4 mt-10 pt-8 border-t">
          <a
            href="https://github.com/integrallis/rankcli-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <a
            href="https://twitter.com/rankcli"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
