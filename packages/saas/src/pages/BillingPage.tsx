import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CreditCard,
  Check,
  AlertCircle,
  ExternalLink,
  Calendar,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function BillingPage() {
  const [searchParams] = useSearchParams();
  const {
    subscription,
    plans,
    isLoading,
    createCheckout,
    createPortal,
    isFreeTier,
    planName,
    getLimit,
  } = useSubscription();

  // Show success/cancel toast from Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated successfully!');
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout canceled');
    }
  }, [searchParams]);

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500/10 text-blue-500">Trial</Badge>;
      case 'past_due':
        return <Badge variant="error">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="warning">Canceled</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing details
          </p>
        </div>

        {/* Current Plan */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Your current subscription details
                </CardDescription>
              </div>
              {subscription && getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">{planName}</h3>
                {subscription?.plan && (
                  <p className="text-muted-foreground">
                    {formatPrice(subscription.plan.price_cents)}/month
                  </p>
                )}
                {isFreeTier && (
                  <p className="text-muted-foreground">Free forever</p>
                )}
              </div>
              {!isFreeTier && subscription?.stripe_customer_id && (
                <Button
                  variant="outline"
                  onClick={() => createPortal.mutate()}
                  disabled={createPortal.isPending}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              )}
            </div>

            {/* Period info */}
            {subscription?.current_period_end && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                {subscription.cancel_at ? (
                  <span>
                    Cancels on {formatDate(subscription.cancel_at)}
                  </span>
                ) : (
                  <span>
                    Renews on {formatDate(subscription.current_period_end)}
                  </span>
                )}
              </div>
            )}

            {/* Usage */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Sites</p>
                <p className="text-lg font-semibold">
                  0 / {getLimit('sites')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Keywords</p>
                <p className="text-lg font-semibold">
                  0 / {getLimit('keywords')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-lg font-semibold">
                  1 / {getLimit('team_members') === Infinity ? '∞' : getLimit('team_members')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">History</p>
                <p className="text-lg font-semibold">
                  {getLimit('historical_days')} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Past Due Warning */}
        {subscription?.status === 'past_due' && (
          <Card className="mb-8 border-destructive">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Payment Failed</p>
                  <p className="text-sm text-muted-foreground">
                    Please update your payment method to continue your subscription.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => createPortal.mutate()}
                  disabled={createPortal.isPending}
                >
                  Update Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isFreeTier ? 'Upgrade Your Plan' : 'Change Plan'}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {plans?.map((plan) => {
              const isCurrentPlan = subscription?.plan?.id === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative',
                    isCurrentPlan && 'border-primary'
                  )}
                >
                  {plan.plan_id === 'pro' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-primary/80">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {isCurrentPlan && (
                        <Badge variant="outline">Current</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        {formatPrice(plan.price_cents)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>

                    <ul className="space-y-2 mb-6 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {plan.sites_limit} sites
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {plan.keywords_limit} keywords
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {plan.team_members_limit || 'Unlimited'} team members
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {plan.historical_days} days history
                      </li>
                      {plan.features?.github_auto_fix && (
                        <li className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          Auto-fix PRs
                        </li>
                      )}
                    </ul>

                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : plan.stripe_price_id ? (
                      <Button
                        className="w-full"
                        onClick={() =>
                          createCheckout.mutate({
                            priceId: plan.stripe_price_id!,
                            planId: plan.plan_id,
                          })
                        }
                        disabled={createCheckout.isPending}
                      >
                        {isFreeTier ? 'Upgrade' : 'Switch Plan'}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Billing FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h4 className="font-medium">What happens when I upgrade?</h4>
              <p className="text-sm text-muted-foreground">
                You'll be charged the prorated amount for the remainder of your billing period, and your new limits will be available immediately.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Do you offer refunds?</h4>
              <p className="text-sm text-muted-foreground">
                We offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Need help? <Link to="/support" className="text-primary hover:underline">Contact support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
