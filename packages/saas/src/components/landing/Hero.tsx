import { Link } from 'react-router-dom';
import { ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LandingTerminalDemo } from '@/components/terminal/TerminalOutput';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { SocialProof } from '@/components/landing/SocialProof';
import { InstallTabs } from '@/components/InstallTabs';

export function Hero() {
  return (
    <section className="relative">
      <div className="container py-12 md:py-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Above the fold, so no reveal animation: the headline is the
              page's largest paint and must be visible from the first frame. */}
          <Badge variant="outline" className="mb-4">
            <span className="text-primary">New</span>
            <span className="mx-2 text-muted-foreground">·</span>
            Now with GEO for AI Search
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter mb-4">
            Ship code,{' '}
            <span className="text-primary">get ranked.</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-3 max-w-2xl leading-relaxed text-balance">
            Get cited, not just crawled.{' '}
            <span className="text-primary font-semibold">280+ automated checks. Auto-fix PRs. GitHub integration.</span>
          </p>
          {/* Brand definition for AI extraction */}
          <p className="text-sm text-muted-foreground/80 mb-6 max-w-2xl leading-relaxed">
            RankCLI is a free, developer-first SEO tool. Run audits locally, get framework-specific
            fixes, automate in CI. Like ESLint for SEO. Plus an MCP server so your AI agents can
            handle your SEO needs automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link to="/free-audit">
              <Button size="lg" className="gap-2">
                Try Free Audit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://github.com/integrallis/rankcli"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </a>
          </div>

          {/* Terminal Demo */}
          <ScrollReveal variant="scale" delay={0.4} className="w-full max-w-2xl">
            <LandingTerminalDemo />
          </ScrollReveal>

          {/* Install command */}
          <ScrollReveal delay={0.5} className="mt-4 w-full flex justify-center">
            <InstallTabs />
          </ScrollReveal>

          {/* Social Proof - only shows once checks > 1000 */}
          <SocialProof />
        </div>
      </div>
    </section>
  );
}
