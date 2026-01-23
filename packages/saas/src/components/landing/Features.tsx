import {
  Search,
  GitPullRequest,
  BarChart3,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';

const features = [
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
    icon: BarChart3,
    title: 'Keyword Tracking',
    description:
      'Track rankings over time. Get alerts when positions change significantly.',
  },
  {
    icon: Zap,
    title: 'Fast Audits',
    description:
      'Parallel crawling and analysis. 50-page site audited in under 30 seconds.',
  },
  {
    icon: Shield,
    title: 'Security Checks',
    description:
      'HTTPS, mixed content, security headers. Keep your site secure and trusted.',
  },
  {
    icon: Globe,
    title: 'Multi-site Support',
    description:
      'Monitor multiple sites from one dashboard. Perfect for agencies and portfolios.',
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
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium mb-1 tracking-tight">{feature.title}</h3>
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
