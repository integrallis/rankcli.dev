import { useEffect, useRef } from 'react';
import { Check, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';
import type { FoundingOfferConfig, FoundingAvailability } from '@/hooks/usePricingAvailability';

export interface SubscriptionTier {
  id: string;
  name: string;
  price_cents: number;
  price_cents_annual?: number;
  billing_period: string;
  tagline: string;
  popular: boolean;
  highlights: string[];
}

export interface FreeTier {
  id: string;
  name: string;
  price_cents: number;
  billing_period: string;
  tagline: string;
  popular: boolean;
  highlights: string[];
}

interface SubscriptionPricingCardsProps {
  tiers: SubscriptionTier[];
  /** Omit to hide the Free card entirely (e.g. on /account, where the user is past signup). */
  freeTier?: FreeTier;
  isAnnual: boolean;
  onSelectPlan: (planId: string) => void;
  foundingOffer?: FoundingOfferConfig;
  foundingAvailability: FoundingAvailability | null;
  /** The plan_id the user is currently subscribed to - renders as "Current Plan" instead of a CTA. */
  currentPlanId?: string;
  /** A plan_id carried over from another screen (e.g. the Pricing page) - highlighted and scrolled into view. */
  highlightPlanId?: string | null;
  /** Disables every CTA (e.g. while a checkout request for another card is in flight). */
  isProcessing?: boolean;
}

// Shared pricing-card rendering used by both the public Pricing page and the
// Account billing tab, so a plan's price/availability never drifts between
// the two screens.
export function SubscriptionPricingCards({
  tiers,
  freeTier,
  isAnnual,
  onSelectPlan,
  foundingOffer,
  foundingAvailability,
  currentPlanId,
  highlightPlanId,
  isProcessing,
}: SubscriptionPricingCardsProps) {
  // Founding pricing only applies to the monthly, non-annual view - it's a
  // recurring-price override, not a separate billing period.
  const showFounding =
    !isAnnual &&
    foundingOffer?.enabled &&
    (foundingAvailability === null || (foundingAvailability.isActive && !foundingAvailability.isSoldOut));

  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (highlightPlanId) {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightPlanId]);

  return (
    <StaggerContainer
      className={cn(
        'grid gap-5 max-w-6xl mx-auto mb-16',
        freeTier ? 'md:grid-cols-4' : 'md:grid-cols-3'
      )}
    >
      {/* Free Tier */}
      {freeTier && (
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
              <Button className="w-full" variant="outline" onClick={() => onSelectPlan('free')}>
                Sign Up Free
              </Button>
            </CardFooter>
          </Card>
        </StaggerItem>
      )}

      {/* Paid Tiers */}
      {tiers.map((plan) => {
        const price = isAnnual && plan.price_cents_annual
          ? Math.floor(plan.price_cents_annual / 12 / 100)
          : Math.floor(plan.price_cents / 100);
        const isFoundingPlan = showFounding && foundingOffer?.base_plan_id === plan.id;
        const foundingPrice = isFoundingPlan ? Math.floor(foundingOffer!.discounted_price_cents / 100) : null;
        const selectedPlanId = isAnnual ? `${plan.id}_annual` : isFoundingPlan ? foundingOffer!.plan_id : plan.id;
        const isCurrentPlan = currentPlanId === selectedPlanId || currentPlanId === plan.id;
        const isHighlighted = highlightPlanId === selectedPlanId;

        return (
          <StaggerItem key={plan.id}>
            <div ref={isHighlighted ? highlightRef : undefined} className="h-full">
              <Card
                className={cn(
                  'relative flex flex-col h-full',
                  (plan.popular || isFoundingPlan) && 'border-primary',
                  isFoundingPlan && 'ring-1 ring-primary/30',
                  isHighlighted && 'ring-2 ring-primary shadow-lg'
                )}
              >
                {isFoundingPlan ? (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-primary text-primary-foreground flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    Founding Member
                  </Badge>
                ) : plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-primary text-primary-foreground">
                    Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-lg font-medium">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isFoundingPlan ? foundingOffer!.tagline : plan.tagline}
                  </p>
                  <div className="mt-4">
                    {isFoundingPlan ? (
                      <>
                        <span className="text-muted-foreground text-lg line-through mr-2">
                          ${Math.floor(foundingOffer!.original_price_cents / 100)}
                        </span>
                        <span className="text-3xl font-semibold tracking-tight text-primary">
                          ${foundingPrice}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-semibold tracking-tight">
                        ${price}
                      </span>
                    )}
                    <span className="text-muted-foreground text-sm">
                      /month{isAnnual && ', billed annually'}
                    </span>
                  </div>
                  {isAnnual && plan.price_cents_annual && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Save ${Math.floor((plan.price_cents * 12 - plan.price_cents_annual) / 100)}/year
                    </p>
                  )}
                  {isFoundingPlan && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center justify-center gap-1">
                      {foundingAvailability
                        ? foundingAvailability.isAlmostGone
                          ? `Only ${foundingAvailability.remaining} spots left`
                          : `${foundingAvailability.remaining} of ${foundingOffer!.total_seats} founding spots left`
                        : `Limited to the first ${foundingOffer!.total_seats} customers or ${foundingOffer!.duration_days} days, whichever comes first`}
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
                    variant={plan.popular || isFoundingPlan ? 'default' : 'outline'}
                    disabled={isCurrentPlan || isProcessing}
                    onClick={() => onSelectPlan(selectedPlanId)}
                  >
                    {isCurrentPlan
                      ? 'Current Plan'
                      : isFoundingPlan
                        ? 'Claim Founding Pricing'
                        : plan.id === 'agency'
                          ? 'Contact Sales'
                          : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
