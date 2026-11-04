import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// The 14-day Pro trial every new account starts on (migration 20261104210000): what it
// includes, how long is left, and what follows. Stripe-paid rows (a stripe_subscription_id)
// are not trials of this kind and show nothing here.
export function TrialBanner() {
  const { user } = useAuth();
  const [state, setState] = useState<{ daysLeft: number } | 'ended' | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_subscriptions')
      .select('status, current_period_end, stripe_subscription_id, plan:subscription_plans(plan_id)')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data || data.status !== 'trialing' || data.stripe_subscription_id || !data.current_period_end) return;
        const plan = Array.isArray(data.plan) ? data.plan[0] : data.plan;
        if (plan?.plan_id !== 'pro') return;
        const ms = new Date(data.current_period_end).getTime() - Date.now();
        setState(ms > 0 ? { daysLeft: Math.ceil(ms / 86400000) } : 'ended');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!state) return null;
  if (state === 'ended') {
    return (
      <div className="mb-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
        Your 14 days of Pro have ended; this account is on the Free plan (one site, audited weekly, alerts by email).{' '}
        <Link to="/pricing" className="underline">Keep Pro</Link> for daily audits, ten sites and Slack or Discord alerts.
      </div>
    );
  }
  return (
    <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
      <strong>Pro trial: {state.daysLeft} day{state.daysLeft === 1 ? '' : 's'} left.</strong> Daily audits, up to ten sites, Slack or Discord alerts, three open auto-fix PRs per site. No card was taken; afterwards the account is on Free unless you{' '}
      <Link to="/pricing" className="underline">keep Pro</Link>.
    </div>
  );
}
