import {
  Search,
  GitPullRequest,
  Zap,
  Globe,
  Bot,
  Terminal,
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';

const features = [
  {
    icon: Bot,
    title: 'AI Visibility Tracking',
    description:
      'Track if ChatGPT, Claude, Gemini, and Perplexity recommend your brand. The new SEO frontier.',
    highlight: true,
  },
  {
    icon: Search,
    title: '200+ SEO Checks',
    description:
      'Technical audits covering meta tags, schema, Core Web Vitals, security, and more.',
  },
  {
    icon: GitPullRequest,
    title: 'Auto-Fix PRs',
    description:
      'Connect GitHub and get PRs with fixes automatically. Just review and merge.',
  },
  {
    icon: Terminal,
    title: 'CLI-First',
    description:
      'Run audits from your terminal with `rankcli audit`. JSON output, scriptable, CI/CD ready.',
  },
  {
    icon: Zap,
    title: 'Fast Audits',
    description:
      'Parallel crawling and analysis. 50-page site audited in under 30 seconds.',
  },
  {
    icon: Globe,
    title: 'Framework Plugins',
    description:
      'Native plugins for Vite, Next.js, and Astro. Seamless integration with your stack.',
  },
];

export function Features() {
  return (
    <section className="py-24 border-t border-border">
      <div className="container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter mb-4">
            Everything you need for SEO
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built by developers, for developers. No fluff, just the tools you need.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <div className={`flex gap-4 ${feature.highlight ? 'p-4 -m-4 rounded-lg bg-primary/5 border border-primary/20' : ''}`}>
                <div className="flex-shrink-0">
                  <feature.icon className={`h-5 w-5 ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium mb-1 tracking-tight">
                    {feature.title}
                    {feature.highlight && (
                      <span className="ml-2 text-xs text-primary font-normal">New</span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
