import { Link } from 'react-router-dom';
import { ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LandingTerminalDemo } from '@/components/terminal/TerminalOutput';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background" />

      <div className="container relative py-24 md:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <ScrollReveal variant="fadeDown">
            <Badge variant="outline" className="mb-6">
              <span className="text-primary">New</span>
              <span className="mx-2">·</span>
              200+ SEO checks, Ahrefs-level audits
            </Badge>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Ship code,{' '}
              <span className="gradient-text">get ranked.</span>
            </h1>
          </ScrollReveal>

          {/* Subheadline */}
          <ScrollReveal delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              SEO meets CI/CD. 200+ automated checks. Auto-fix PRs. GitHub integration.
              Engineering as marketing.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/free-audit">
                <Button size="lg" className="gap-2">
                  Try Free Audit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a
                href="https://github.com/rankcli/rankcli"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="gap-2">
                  <Github className="h-4 w-4" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </ScrollReveal>

          {/* Terminal Demo */}
          <ScrollReveal variant="scale" delay={0.4} className="w-full max-w-2xl">
            <LandingTerminalDemo />
          </ScrollReveal>

          {/* Install command */}
          <ScrollReveal delay={0.5} className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <code className="px-3 py-1.5 bg-muted rounded-md font-mono">
              npm install -g @rankcli/cli
            </code>
            <button
              className="p-1.5 hover:bg-muted rounded-md transition-colors"
              onClick={() => navigator.clipboard.writeText('npm install -g @rankcli/cli')}
              title="Copy to clipboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
