import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import pricingConfig from '@/config/pricing-tiers.json';

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

export function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    if (user) {
      // Logged in - go to billing page
      navigate('/account/billing');
    } else {
      // Not logged in - go to signup with plan intent
      navigate(`/signup?plan=${planId}`);
    }
  };

  return (
    <section id="pricing" className="py-24 border-t border-border/40">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                plan.popular && 'border-primary shadow-lg shadow-primary/10'
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-muted-foreground">{plan.tagline}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${Math.floor(plan.price_cents / 100)}
                  </span>
                  <span className="text-muted-foreground">
                    /{plan.billing_period}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.highlights.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
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
                  {plan.id === 'agency' ? 'Contact Sales' : 'Start Free Trial'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Free tier note */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Looking for a free option?{' '}
            <Link to="/free-audit" className="text-primary hover:underline">
              Try our free audit tool
            </Link>{' '}
            - no signup required.
          </p>
        </div>
      </div>
    </section>
  );
}
