import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Check, AlertTriangle, ArrowLeft, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useLTDAvailability, useLTDCheckout, useUserLTD } from '@/hooks/useLTD';
import pricingConfig from '@/config/pricing-tiers.json';
import { cn } from '@/lib/utils';

const ltdTiers = (pricingConfig.lifetime_deals as { tiers: Array<{
  id: string;
  name: string;
  price_cents: number;
  total_licenses: number;
  tagline: string;
  highlights: string[];
}> }).tiers;

export default function LTDCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { loading: ltdStatusLoading, hasLTD } = useUserLTD();
  const { loading: availabilityLoading, getTierAvailability } = useLTDAvailability();
  const { startCheckout, loading: checkoutLoading, error: checkoutError } = useLTDCheckout();

  const tierId = searchParams.get('tier') || 'ltd_pro';
  const tier = ltdTiers.find((t) => t.id === tierId);
  const tierAvailability = getTierAvailability(tierId);

  // Purchases need an account (ltd-checkout requires sign-in). Login returns to
  // location.state.from; signup carries ?ltd= through email confirmation or OAuth and
  // ProtectedRoute brings the user back here.
  const returnHere = { from: { pathname: '/checkout/ltd', search: `?tier=${tierId}` } };

  // Redirect if user already has LTD
  useEffect(() => {
    if (!ltdStatusLoading && hasLTD) {
      navigate('/account/billing?has_ltd=true');
    }
  }, [hasLTD, ltdStatusLoading, navigate]);

  const handleCheckout = async () => {
    if (!tier || !user) return;
    await startCheckout(tier.id);
  };

  if (authLoading || ltdStatusLoading || availabilityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Invalid Tier</h2>
            <p className="text-muted-foreground mb-4">
              The selected lifetime deal tier is not valid.
            </p>
            <Button asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSoldOut = tierAvailability?.isSoldOut ?? false;
  const remaining = tierAvailability?.remaining ?? tier.total_licenses;
  const percentSold = tierAvailability?.percentageSold ?? 0;

  if (isSoldOut) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">{tier.name} is Sold Out</h2>
            <p className="text-muted-foreground mb-4">
              All {tier.total_licenses} licenses have been claimed. Check out our other tiers or subscribe monthly.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link to="/pricing">View All Plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl py-12 px-4">
        {/* Back Link */}
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to pricing
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  {tier.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{tier.tagline}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    ${Math.floor(tier.price_cents / 100)}
                  </span>
                  <span className="text-muted-foreground">one-time payment</span>
                </div>

                {/* Availability */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={cn(
                      'font-medium',
                      remaining <= 20 ? 'text-red-500' : remaining <= 50 ? 'text-amber-500' : ''
                    )}>
                      {remaining} licenses remaining
                    </span>
                    <span className="text-muted-foreground">{percentSold.toFixed(0)}% sold</span>
                  </div>
                  <Progress value={percentSold} className="h-2" />
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {tier.highlights.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Guarantee */}
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                  <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      30-Day Money-Back Guarantee
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Not satisfied? Get a full refund within 30 days, no questions asked.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Purchase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Purchasing as:</p>
                      <p className="font-medium">{user.email}</p>
                    </div>

                    {checkoutError && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive">{checkoutError}</p>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay ${Math.floor(tier.price_cents / 100)} - Get Lifetime Access
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Your lifetime deal is tied to your RankCLI account. Create one or log in to continue.
                    </p>
                    <Button className="w-full" size="lg" asChild>
                      <Link to={`/signup?ltd=${tierId}`}>Create account and continue</Link>
                    </Button>
                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/login" state={returnHere}>Log in</Link>
                    </Button>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Stripe. Your payment information is encrypted.
                </p>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-xs">
                <Shield className="h-4 w-4" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Check className="h-4 w-4" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
