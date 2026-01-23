import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, CreditCard, Key, Bell, Loader2, AlertTriangle, Trash2, ArrowUpRight, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import pricingTiers from '@/config/pricing-tiers.json';

interface UserSubscription {
  plan_id: string | null;
  status: string;
  current_period_end: string | null;
  plan: {
    plan_id: string;
    name: string;
    price_cents: number;
  }[] | null;
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for success/canceled URL params
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setActiveTab('billing');
      setShowSuccessMessage(true);
      // Clear the URL params
      setSearchParams({});
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    if (searchParams.get('canceled') === 'true') {
      setActiveTab('billing');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Fetch subscription data with plan details
  const fetchSubscription = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_subscriptions')
      .select(`
        plan_id,
        status,
        current_period_end,
        plan:subscription_plans (
          plan_id,
          name,
          price_cents
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSubscription(data as UserSubscription);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Refetch subscription when returning from Stripe (poll for webhook to complete)
  useEffect(() => {
    if (showSuccessMessage) {
      // Poll for subscription update (webhook may take a moment)
      const pollInterval = setInterval(fetchSubscription, 2000);
      // Stop polling after 10 seconds
      setTimeout(() => clearInterval(pollInterval), 10000);
      return () => clearInterval(pollInterval);
    }
  }, [showSuccessMessage]);

  // Get current subscription info (plan is an array from Supabase join)
  const planData = subscription?.plan?.[0];
  const currentPlanId = planData?.plan_id || 'free';
  const subscriptionStatus = subscription?.status || 'active';
  const isFreeTier = !subscription?.plan_id || currentPlanId === 'free';

  // Get plan details - either from joined data or default to free
  const planDetails = planData
    ? { name: planData.name, price_cents: planData.price_cents }
    : { name: 'Free', price_cents: 0 };

  // Find full plan config for limits
  const subscriptionPlan = pricingTiers.subscriptions.find(s => s.id === currentPlanId);

  const sitesUsed = 1; // TODO: Get from actual usage data
  const sitesLimit = subscriptionPlan?.limits.sites || 1;

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // TODO: Implement profile save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleUpgrade = async (planId: string) => {
    setUpgradingPlanId(planId);
    try {
      // Look up the Stripe price ID from the database
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('stripe_price_id')
        .eq('plan_id', planId)
        .single();

      if (planError || !plan?.stripe_price_id) {
        throw new Error('Plan not available for purchase');
      }

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
          planId: planId,
          successUrl: `${window.location.origin}/account?success=true`,
          cancelUrl: `${window.location.origin}/account?canceled=true`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      // TODO: Show error toast
    } finally {
      setUpgradingPlanId(null);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/account/billing`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create portal session');
      }
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      // Call delete account function (soft delete)
      const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', user?.id);

      if (error) throw error;

      // Sign out
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Delete account error:', err);
      // TODO: Show error toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                      Manage your account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        defaultValue={user?.user_metadata?.name || ''}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={handleSaveProfile} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                      <Button variant="destructive" onClick={() => logout()}>
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Success Message */}
                {showSuccessMessage && (
                  <Card className="border-green-500/50 bg-green-500/10">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-400">
                            Payment successful!
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Your subscription is being activated. This may take a moment.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold">
                            {planDetails?.name || 'Free'}
                          </span>
                          <Badge variant={subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                            {subscriptionStatus}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {planDetails?.price_cents
                            ? `$${planDetails.price_cents / 100}/month`
                            : 'Free forever'}
                        </p>
                      </div>
                      {!isFreeTier ? (
                        <Button variant="outline" onClick={handleManageBilling} disabled={isLoading}>
                          Manage Billing
                        </Button>
                      ) : (
                        <Link to="/pricing">
                          <Button className="gap-2">
                            Upgrade
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Sites monitored</span>
                          <span>
                            {sitesUsed} / {sitesLimit}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${Math.min(100, (sitesUsed / sitesLimit) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {subscription?.current_period_end && (
                        <p className="text-sm text-muted-foreground">
                          Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Available Plans */}
                {isFreeTier && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Upgrade Your Plan</CardTitle>
                      <CardDescription>
                        Get more sites, checks, and features
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {pricingTiers.subscriptions.map((plan) => (
                          <div
                            key={plan.id}
                            className={cn(
                              'flex items-center justify-between p-4 rounded-lg border',
                              plan.popular && 'border-primary'
                            )}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{plan.name}</span>
                                {plan.popular && (
                                  <Badge variant="secondary">Popular</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {plan.limits.sites} sites, {plan.limits.keywords} keywords
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold">
                                ${plan.price_cents / 100}/mo
                              </span>
                              <Button
                                size="sm"
                                variant={plan.popular ? 'default' : 'outline'}
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={upgradingPlanId !== null}
                              >
                                {upgradingPlanId === plan.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Select'
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      No billing history yet.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'api-keys' && (
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage API keys for CLI and integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                      Use API keys to authenticate the CLI and access the API.
                    </p>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Default</span>
                        <Badge variant="outline">seo_xxxx...xxxx</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created on Jan 15, 2024
                      </p>
                    </div>
                  </div>

                  <Button>Generate New Key</Button>

                  <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                    <p className="text-sm font-medium mb-2">Quick Start</p>
                    <code className="text-xs text-muted-foreground block">
                      rankcli auth --token YOUR_API_KEY
                    </code>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure how you receive alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Notification settings coming soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This will permanently delete your account and all associated data, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All projects and audit history</li>
                <li>API keys and integrations</li>
                <li>Billing information</li>
              </ul>
              <p className="font-medium">
                Type <span className="font-mono">DELETE</span> to confirm:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== 'DELETE'}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
