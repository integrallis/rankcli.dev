import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, HelpCircle, Clock, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { supabase } from '@/integrations/supabase/client';

type PricingView = 'lifetime' | 'monthly' | 'annual';

interface SubscriptionTier {
  id: string;
  name: string;
  price_cents: number;
  price_cents_annual?: number;
  billing_period: string;
  tagline: string;
  popular: boolean;
  highlights: string[];
}

interface LTDTier {
  id: string;
  name: string;
  price_cents: number;
  total_licenses: number;
  tagline: string;
  popular: boolean;
  highlights: string[];
  comparison_to_sub: string;
}

interface LTDAvailability {
  id: string;
  remaining: number;
  soldCount: number;
  totalLicenses: number;
  percentageSold: number;
  isLow: boolean;
  isAlmostGone: boolean;
  isSoldOut: boolean;
}

const subscriptionTiers = pricingConfig.subscriptions as SubscriptionTier[];
const ltdConfig = pricingConfig.lifetime_deals as {
  enabled: boolean;
  show_remaining: boolean;
  urgency_threshold: number;
  tiers: LTDTier[];
};

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
  const defaultView = pricingConfig.default_view === 'lifetime_deals' ? 'lifetime' : 'monthly';
  const [view, setView] = useState<PricingView>(defaultView);
  const [ltdAvailability, setLtdAvailability] = useState<Record<string, LTDAvailability>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  // Fetch LTD availability
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const { data, error } = await supabase.functions.invoke('ltd-availability');
        if (error) throw error;

        const availabilityMap: Record<string, LTDAvailability> = {};
        data.availability?.forEach((tier: LTDAvailability) => {
          availabilityMap[tier.id] = tier;
        });
        setLtdAvailability(availabilityMap);
      } catch (err) {
        console.error('Failed to fetch LTD availability:', err);
      } finally {
        setLoadingAvailability(false);
      }
    }

    if (ltdConfig.enabled) {
      fetchAvailability();
      // Refresh every 30 seconds
      const interval = setInterval(fetchAvailability, 30000);
      return () => clearInterval(interval);
    } else {
      setLoadingAvailability(false);
    }
  }, []);

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

  const handleSelectLTD = async (tierId: string) => {
    if (user) {
      // Navigate to checkout directly
      navigate(`/checkout/ltd?tier=${tierId}`);
    } else {
      // Navigate to signup with LTD intent
      navigate(`/signup?ltd=${tierId}`);
    }
  };

  const anyLTDAvailable = ltdConfig.enabled && ltdConfig.tiers.some(
    tier => !ltdAvailability[tier.id]?.isSoldOut
  );

  return (
    <section id="pricing" className="py-24 border-t border-border">
      <div className="container">
        <ScrollReveal className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need more. No credit card required.
          </p>
        </ScrollReveal>

        {/* Pricing Toggle */}
        {ltdConfig.enabled && anyLTDAvailable && (
          <ScrollReveal delay={0.1} className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/50 border">
              <button
                onClick={() => setView('lifetime')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  view === 'lifetime'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Lifetime Deal
                </span>
              </button>
              <button
                onClick={() => setView('monthly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  view === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setView('annual')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  view === 'annual'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="flex items-center gap-1.5">
                  Annual
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    -20%
                  </Badge>
                </span>
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* LTD Urgency Banner */}
        {view === 'lifetime' && ltdConfig.enabled && (
          <ScrollReveal delay={0.15} className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Clock className="h-5 w-5 text-amber-500" />
              <p className="text-sm">
                <span className="font-medium text-amber-600 dark:text-amber-400">Limited Time Offer:</span>{' '}
                <span className="text-muted-foreground">
                  Pay once, use forever. Only {ltdConfig.tiers.reduce((sum, t) => sum + (ltdAvailability[t.id]?.remaining || t.total_licenses), 0)} licenses remaining across all tiers.
                </span>
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Pricing Cards */}
        {view === 'lifetime' ? (
          <LTDPricingCards
            tiers={ltdConfig.tiers}
            availability={ltdAvailability}
            loading={loadingAvailability}
            onSelect={handleSelectLTD}
          />
        ) : (
          <SubscriptionPricingCards
            tiers={subscriptionTiers}
            freeTier={freeTier}
            isAnnual={view === 'annual'}
            onSelectPlan={handleSelectPlan}
          />
        )}

        {/* Feature Comparison Table */}
        {view !== 'lifetime' && (
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
        )}

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

// LTD Pricing Cards Component
function LTDPricingCards({
  tiers,
  availability,
  loading,
  onSelect,
}: {
  tiers: LTDTier[];
  availability: Record<string, LTDAvailability>;
  loading: boolean;
  onSelect: (tierId: string) => void;
}) {
  return (
    <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
      {tiers.map((tier) => {
        const avail = availability[tier.id];
        const remaining = avail?.remaining ?? tier.total_licenses;
        const percentSold = avail?.percentageSold ?? 0;
        const isSoldOut = avail?.isSoldOut ?? false;
        const isLow = avail?.isLow ?? false;
        const isAlmostGone = avail?.isAlmostGone ?? false;

        return (
          <StaggerItem key={tier.id}>
            <Card
              className={cn(
                'relative flex flex-col h-full',
                tier.popular && 'border-primary ring-1 ring-primary/20',
                isSoldOut && 'opacity-60'
              )}
            >
              {tier.popular && !isSoldOut && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground">
                  Best Value
                </Badge>
              )}

              {isSoldOut && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-destructive text-destructive-foreground">
                  Sold Out
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-medium">{tier.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold tracking-tight">
                    ${Math.floor(tier.price_cents / 100)}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    one-time
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {tier.comparison_to_sub}
                </p>
              </CardHeader>

              {/* Availability Progress */}
              {!loading && ltdConfig.show_remaining && (
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={cn(
                      'font-medium',
                      isAlmostGone ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-muted-foreground'
                    )}>
                      {isSoldOut ? (
                        'No licenses remaining'
                      ) : isAlmostGone ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Only {remaining} left!
                        </span>
                      ) : (
                        `${remaining} of ${tier.total_licenses} remaining`
                      )}
                    </span>
                    <span className="text-muted-foreground">{percentSold.toFixed(0)}% sold</span>
                  </div>
                  <Progress
                    value={percentSold}
                    className={cn(
                      'h-1.5',
                      isAlmostGone && '[&>div]:bg-red-500',
                      isLow && !isAlmostGone && '[&>div]:bg-amber-500'
                    )}
                  />
                </div>
              )}

              <CardContent className="flex-1">
                <ul className="space-y-2.5">
                  {tier.highlights.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  disabled={isSoldOut}
                  onClick={() => onSelect(tier.id)}
                >
                  {isSoldOut ? 'Sold Out' : 'Get Lifetime Access'}
                </Button>
              </CardFooter>
            </Card>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}

// Subscription Pricing Cards Component
function SubscriptionPricingCards({
  tiers,
  freeTier,
  isAnnual,
  onSelectPlan,
}: {
  tiers: SubscriptionTier[];
  freeTier: {
    id: string;
    name: string;
    price_cents: number;
    billing_period: string;
    tagline: string;
    popular: boolean;
    highlights: string[];
  };
  isAnnual: boolean;
  onSelectPlan: (planId: string) => void;
}) {
  return (
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
              onClick={() => onSelectPlan('free')}
            >
              Sign Up Free
            </Button>
          </CardFooter>
        </Card>
      </StaggerItem>

      {/* Paid Tiers */}
      {tiers.map((plan) => {
        const price = isAnnual && plan.price_cents_annual
          ? Math.floor(plan.price_cents_annual / 12 / 100)
          : Math.floor(plan.price_cents / 100);

        return (
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
                    ${price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /month{isAnnual && ', billed annually'}
                  </span>
                </div>
                {isAnnual && plan.price_cents_annual && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Save ${Math.floor((plan.price_cents * 12 - plan.price_cents_annual) / 100)}/year
                  </p>
                )}
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
                  onClick={() => onSelectPlan(plan.id)}
                >
                  {plan.id === 'agency' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </CardFooter>
            </Card>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
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
