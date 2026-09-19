import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import pricingConfig from '@/config/pricing-tiers.json';

export type PricingView = 'lifetime' | 'monthly' | 'annual';

interface BillingIntervalToggleProps {
  view: PricingView;
  onChange: (view: PricingView) => void;
  /** Show the "Lifetime Deal" option (only meaningful where LTD purchase is wired up, e.g. the Pricing page). */
  showLifetime?: boolean;
}

// The annual saving, from the prices in pricing-tiers.json (the smallest
// across tiers, so the badge never overstates it). Today every tier's annual
// price is 10x its monthly price: 17% off, or 2 months free.
const annualDiscountPercent = Math.min(
  ...pricingConfig.subscriptions.map((tier) =>
    Math.round((1 - tier.price_cents_annual / (tier.price_cents * 12)) * 100)
  )
);
const annualMonthsFree = Math.min(
  ...pricingConfig.subscriptions.map((tier) =>
    Math.round(12 - tier.price_cents_annual / tier.price_cents)
  )
);

// Shared Lifetime/Monthly/Annual toggle used by the Pricing page and the
// Account billing tab.
export function BillingIntervalToggle({ view, onChange, showLifetime = false }: BillingIntervalToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/50 border">
      {showLifetime && (
        <button
          onClick={() => onChange('lifetime')}
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
      )}
      <button
        onClick={() => onChange('monthly')}
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
        onClick={() => onChange('annual')}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-all',
          view === 'annual'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span className="flex items-center gap-1.5">
          Annual
          <Badge
            variant="secondary"
            className="text-xs px-1.5 py-0"
            title={`${annualMonthsFree} months free`}
          >
            -{annualDiscountPercent}%
          </Badge>
        </span>
      </button>
    </div>
  );
}
