import { Link } from 'react-router-dom';
import { Bot, Terminal, GitBranch, Plug, Search, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';

const differentiators = [
  {
    icon: Bot,
    title: 'AI Visibility Tracking',
    description: 'Track if ChatGPT, Claude, Gemini, and Perplexity recommend your brand.',
    detail: 'The only SEO tool that monitors AI chatbot mentions.',
    badge: 'Unique',
    cta: { text: 'Try AI Checker', link: '/tools/ai-visibility' },
  },
  {
    icon: Terminal,
    title: 'CLI-First Approach',
    description: 'Run audits from your terminal with `rankcli audit`.',
    detail: 'JSON output, scriptable, perfect for automation.',
    cta: { text: 'View Docs', link: '/docs' },
  },
  {
    icon: GitBranch,
    title: 'CI/CD Native',
    description: 'GitHub Actions, auto-fix PRs, branch protection compatible.',
    detail: 'SEO as part of your deployment pipeline.',
    cta: { text: 'See Integration', link: '/docs' },
  },
  {
    icon: Plug,
    title: 'Framework Plugins',
    description: 'Native support for Vite, Next.js, and Astro.',
    detail: 'Dev server integration with real-time feedback.',
    cta: { text: 'View Plugins', link: '/docs' },
  },
  {
    icon: Search,
    title: '200+ Checks',
    description: 'Most comprehensive audit in the market.',
    detail: 'Technical SEO, content, security, performance, AI readiness.',
    cta: { text: 'Try Free Audit', link: '/free-audit' },
  },
  {
    icon: Code,
    title: 'API Access for All',
    description: 'REST API available on all paid tiers.',
    detail: 'Solo: 100/day, Pro: 1K/day, Agency: 10K/day.',
    badge: 'New',
    cta: { text: 'View API Docs', link: '/docs' },
  },
];

export function Differentiators() {
  return (
    <section className="py-24 border-t border-border bg-muted/30">
      <div className="container">
        <ScrollReveal className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Why RankCLI
          </Badge>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter mb-4">
            What makes RankCLI different
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built for developers who ship code, not for marketing teams who buy tools.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {differentiators.map((item, index) => (
            <StaggerItem key={index}>
              <div className="p-6 rounded-xl border bg-card h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {item.description}
                </p>
                <p className="text-xs text-muted-foreground/80 mb-4 flex-grow">
                  {item.detail}
                </p>

                <Link to={item.cta.link}>
                  <Button variant="ghost" size="sm" className="w-full justify-start p-0 h-auto text-primary hover:text-primary/80">
                    {item.cta.text} →
                  </Button>
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Comparison CTA */}
        <ScrollReveal delay={0.3} className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Not sure which SEO tool is right for you?
          </p>
          <Link to="/tools/compare">
            <Button variant="outline">
              Compare Your Site vs Competitors
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
