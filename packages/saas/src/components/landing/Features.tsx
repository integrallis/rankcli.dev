import {
  Search,
  GitPullRequest,
  BarChart3,
  Bell,
  Key,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Search,
    title: '200+ SEO Checks',
    description:
      'Ahrefs-level technical audits. Meta tags, schema, performance, security, and more.',
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
    icon: Bell,
    title: 'Slack Alerts',
    description:
      'Get notified when audits complete or rankings drop. Integrate with your workflow.',
  },
  {
    icon: Key,
    title: 'API Access',
    description:
      'Full REST API for automation. Integrate with CI/CD pipelines and custom tools.',
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
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for SEO
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built by developers, for developers. No fluff, just the tools you need.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 hover:bg-card transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
