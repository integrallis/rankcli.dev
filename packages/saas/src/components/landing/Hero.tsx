import { Link } from 'react-router-dom';
import { ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LandingTerminalDemo } from '@/components/terminal/TerminalOutput';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export function Hero() {
  return (
    <section className="relative">
      <div className="container py-12 md:py-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <ScrollReveal variant="fadeDown">
            <Badge variant="outline" className="mb-4">
              <span className="text-primary">New</span>
              <span className="mx-2 text-muted-foreground">·</span>
              AI Visibility Tracking
            </Badge>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter mb-4">
              Ship code, get ranked{' '}
              <span className="text-primary">everywhere.</span>
            </h1>
          </ScrollReveal>

          {/* Subheadline */}
          <ScrollReveal delay={0.2}>
            <p className="text-lg text-muted-foreground mb-3 max-w-2xl leading-relaxed">
              The only SEO tool that tracks both Google <em>and</em> AI chatbots.
              See if ChatGPT, Claude, and Perplexity recommend your site.
            </p>
            {/* Brand definition for AI extraction */}
            <p className="text-sm text-muted-foreground/80 mb-6 max-w-2xl leading-relaxed">
              RankCLI is a developer-first SEO automation tool with 200+ checks, auto-fix PRs via GitHub, and AI visibility tracking. Track how ChatGPT, Claude, Gemini, and Perplexity recommend your brand.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
                  GitHub
                </Button>
              </a>
            </div>
          </ScrollReveal>

          {/* Terminal Demo */}
          <ScrollReveal variant="scale" delay={0.4} className="w-full max-w-2xl">
            <LandingTerminalDemo />
          </ScrollReveal>

          {/* Install command */}
          <ScrollReveal delay={0.5} className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <code className="px-3 py-2 bg-card border border-border rounded-md font-mono text-foreground">
              npm install -g @rankcli/cli
            </code>
            <button
              className="p-2 hover:bg-card rounded-md transition-colors border border-transparent hover:border-border"
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
