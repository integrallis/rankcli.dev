import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PricingView = 'lifetime' | 'monthly' | 'annual';

interface BillingIntervalToggleProps {
  view: PricingView;
  onChange: (view: PricingView) => void;
  /** Show the "Lifetime Deal" option (only meaningful where LTD purchase is wired up, e.g. the Pricing page). */
  showLifetime?: boolean;
}

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
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            -20%
          </Badge>
        </span>
      </button>
    </div>
  );
}
