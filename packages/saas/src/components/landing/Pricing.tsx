import { Link, useNavigate } from 'react-router-dom';
import { Check, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import pricingConfig from '@/config/pricing-tiers.json';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';

interface PricingTier {
  id: string;
  name: string;
  price_cents: number;
  billing_period: string;
  tagline: string;
  popular: boolean;
  highlights: string[];
}

const tiers = pricingConfig.subscriptions as PricingTier[];

// Free tier for display
const freeTier = {
  id: 'free',
  name: 'Free',
  price_cents: 0,
  billing_period: 'forever',
  tagline: 'Get started for free',
  popular: false,
  highlights: [
    '1 site monitored',
    '100 SEO checks',
    'Audit history',
    'Basic dashboard',
    'CLI access',
  ],
};

// Feature comparison for detailed view
const featureComparison = [
  {
    name: 'SEO Checks',
    free: '100',
    solo: '200+',
    pro: '200+',
    agency: '200+'
  },
  {
    name: 'Sites',
    free: '1',
    solo: '3',
    pro: '10',
    agency: '50'
  },
  {
    name: 'Audit History',
    free: true,
    solo: true,
    pro: true,
    agency: true
  },
  {
    name: 'Export Reports',
    free: false,
    solo: true,
    pro: true,
    agency: true
  },
  {
    name: 'Local Auto-Fix (CLI)',
    free: false,
    solo: true,
    pro: true,
    agency: true,
    tooltip: 'Apply SEO fixes directly to your local codebase via CLI'
  },
  {
    name: 'GitHub Integration',
    free: false,
    solo: false,
    pro: true,
    agency: true
  },
  {
    name: 'Auto-Fix PRs',
    free: false,
    solo: false,
    pro: true,
    agency: true,
    tooltip: 'Automatically create fix PRs via GitHub App'
  },
  {
    name: 'Scheduled Audits',
    free: 'Manual',
    solo: 'Weekly',
    pro: 'Daily',
    agency: 'On-demand'
  },
  {
    name: 'Team Members',
    free: '1',
    solo: '1',
    pro: '5',
    agency: 'Unlimited'
  },
  {
    name: 'REST API Access',
    free: false,
    solo: '100/day',
    pro: '1K/day',
    agency: '10K/day',
    tooltip: 'Programmatic API for custom integrations and bulk operations'
  },
  {
    name: 'White-Label Reports',
    free: false,
    solo: false,
    pro: false,
    agency: true,
    tooltip: 'Remove RankCLI branding, add your own logo and colors'
  },
  {
    name: 'Priority Support',
    free: false,
    solo: false,
    pro: false,
    agency: true
  },
];

export function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      navigate('/signup');
      return;
    }
    if (user) {
      navigate('/account/billing');
    } else {
      navigate(`/signup?plan=${planId}`);
    }
  };

  return (
    <section id="pricing" className="py-24 border-t border-border">
      <div className="container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need more. No credit card required.
          </p>
        </ScrollReveal>

        {/* Pricing Cards */}
        <StaggerContainer className="grid md:grid-cols-4 gap-5 max-w-6xl mx-auto mb-16">
          {/* Free Tier */}
          <StaggerItem>
            <Card className="relative flex flex-col h-full">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-lg font-medium">{freeTier.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{freeTier.tagline}</p>
                <div className="mt-4">
                  <span className="text-3xl font-semibold tracking-tight">$0</span>
                  <span className="text-muted-foreground text-sm">/forever</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-2.5">
                  {freeTier.highlights.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSelectPlan('free')}
                >
                  Sign Up Free
                </Button>
              </CardFooter>
            </Card>
          </StaggerItem>

          {/* Paid Tiers */}
          {tiers.map((plan) => (
            <StaggerItem key={plan.id}>
              <Card
                className={cn(
                  'relative flex flex-col h-full',
                  plan.popular && 'border-primary'
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground">
                    Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-lg font-medium">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-semibold tracking-tight">
                      ${Math.floor(plan.price_cents / 100)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /{plan.billing_period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2.5">
                    {plan.highlights.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.id === 'agency' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Feature Comparison Table */}
        <ScrollReveal delay={0.2}>
          <div className="max-w-5xl mx-auto">
            <h3 className="text-lg font-semibold text-center mb-6">Compare Plans</h3>
            <TooltipProvider>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Feature</th>
                      <th className="text-center py-3 px-4 font-medium">Free</th>
                      <th className="text-center py-3 px-4 font-medium">Solo</th>
                      <th className="text-center py-3 px-4 font-medium text-primary">Pro</th>
                      <th className="text-center py-3 px-4 font-medium">Agency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureComparison.map((feature, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 px-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            {feature.name}
                            {feature.tooltip && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  {feature.tooltip}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <FeatureValue value={feature.free} />
                        </td>
                        <td className="text-center py-3 px-4">
                          <FeatureValue value={feature.solo} />
                        </td>
                        <td className="text-center py-3 px-4 bg-primary/5">
                          <FeatureValue value={feature.pro} />
                        </td>
                        <td className="text-center py-3 px-4">
                          <FeatureValue value={feature.agency} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TooltipProvider>
          </div>
        </ScrollReveal>

        {/* Free audit note */}
        <ScrollReveal delay={0.3} className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            Just want a quick check?{' '}
            <Link to="/free-audit" className="text-foreground hover:text-primary transition-colors">
              Try our free audit tool
            </Link>{' '}
            — 50 checks, no signup required.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-green-500 mx-auto" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
    );
  }
  return <span className="text-muted-foreground">{value}</span>;
}
