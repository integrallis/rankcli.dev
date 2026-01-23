import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

        <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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

        {/* Free tier note */}
        <ScrollReveal delay={0.3} className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            Looking for a free option?{' '}
            <Link to="/free-audit" className="text-foreground hover:text-primary transition-colors">
              Try our free audit tool
            </Link>{' '}
            — no signup required.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
