import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, CreditCard, Key, Bell, Bot, Loader2, AlertTriangle, Trash2, ArrowUpRight, CheckCircle, Copy, Check, Plus, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { useUserLTD } from '@/hooks/useLTD';
import { AlertConfigForm } from '@/components/settings/AlertConfigForm';
import { AIProviderSettings } from '@/components/settings/AIProviderSettings';

function ChangePasswordCard() {
  const { user } = useAuth();
  const hasPassword = user?.identities?.some((i) => i.provider === 'email') ?? false;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    try {
      // Re-verify identity with the current password before changing it,
      // so an unattended logged-in session can't be used to silently take
      // over the password (a valid session alone is enough for
      // auth.updateUser to succeed - this check is on top of that).
      if (hasPassword) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user!.email!,
          password: currentPassword,
        });
        if (verifyError) {
          toast.error('Current password is incorrect');
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(hasPassword ? 'Password updated' : 'Password set');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          {hasPassword
            ? 'Change the password for your account'
            : "You signed up with an OAuth provider - set a password to also sign in with email"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          {hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">{hasPassword ? 'New password' : 'Password'}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : hasPassword ? (
              'Update password'
            ) : (
              'Set password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface UserSubscription {
  plan_id: string | null;
  status: string;
  current_period_end: string | null;
  plan: {
    plan_id: string;
    name: string;
    price_cents: number;
  } | null;
}

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

interface NotificationPreferences {
  email_audit_complete: boolean;
  email_issues_found: boolean;
  email_weekly_report: boolean;
  email_product_updates: boolean;
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'ai-provider', label: 'AI Provider', icon: Bot },
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
  const [sitesCount, setSitesCount] = useState(0);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_audit_complete: true,
    email_issues_found: true,
    email_weekly_report: false,
    email_product_updates: true,
  });
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Check for URL params (tab, success, canceled, ltd_success)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
    if (searchParams.get('success') === 'true' || searchParams.get('ltd_success') === 'true') {
      setActiveTab('billing');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    if (searchParams.get('canceled') === 'true' || searchParams.get('ltd_canceled') === 'true') {
      setActiveTab('billing');
    }
    if (searchParams.toString()) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch subscription data
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
      const subscriptionData: UserSubscription = {
        plan_id: data.plan_id,
        status: data.status,
        current_period_end: data.current_period_end,
        plan: Array.isArray(data.plan) ? data.plan[0] || null : data.plan,
      };
      setSubscription(subscriptionData);
    }
  };

  // Fetch sites count
  const fetchSitesCount = async () => {
    if (!user) return;

    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null);

    setSitesCount(count || 0);
  };

  // Fetch API keys
  const fetchApiKeys = async () => {
    if (!user) return;
    setIsLoadingKeys(true);

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, created_at, last_used_at')
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setApiKeys(data);
    }
    setIsLoadingKeys(false);
  };

  // Fetch notification preferences
  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoadingNotifications(true);

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setNotifications({
        email_audit_complete: data.email_audit_complete,
        email_issues_found: data.email_issues_found,
        email_weekly_report: data.email_weekly_report,
        email_product_updates: data.email_product_updates,
      });
    }
    setIsLoadingNotifications(false);
  };

  useEffect(() => {
    fetchSubscription();
    fetchSitesCount();
    fetchApiKeys();
    fetchNotifications();
  }, [user]);

  // Refetch subscription when returning from Stripe
  useEffect(() => {
    if (showSuccessMessage) {
      const pollInterval = setInterval(fetchSubscription, 2000);
      setTimeout(() => clearInterval(pollInterval), 10000);
      return () => clearInterval(pollInterval);
    }
  }, [showSuccessMessage]);

  // LTD status
  const { userLTD, hasLTD } = useUserLTD();

  // Get current subscription info
  const planData = subscription?.plan;
  const currentPlanId = planData?.plan_id || 'free';
  const subscriptionStatus = subscription?.status || 'active';
  const isLifetime = subscriptionStatus === 'lifetime' || hasLTD;
  const isFreeTier = !subscription?.plan_id || currentPlanId === 'free';

  const planDetails = planData
    ? { name: planData.name, price_cents: planData.price_cents }
    : { name: 'Free', price_cents: 0 };

  const subscriptionPlan = pricingTiers.subscriptions.find(s => s.id === currentPlanId);
  const sitesUsed = sitesCount;
  const sitesLimit = subscriptionPlan?.limits.sites || 1;

  const handleSaveProfile = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleUpgrade = async (planId: string) => {
    setUpgradingPlanId(planId);
    try {
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
      toast.error('Could not start checkout', {
        description: err instanceof Error ? err.message : 'Please try again in a moment.',
      });
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
      toast.error('Could not open billing portal', {
        description: err instanceof Error ? err.message : 'Please try again in a moment.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', user?.id);

      if (error) throw error;

      await logout();
      navigate('/');
    } catch (err) {
      console.error('Delete account error:', err);
      toast.error('Could not delete account', {
        description: err instanceof Error ? err.message : 'Please try again or contact support.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // API Key handlers
  const handleCreateApiKey = async () => {
    setIsCreatingKey(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName || 'Default' }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Show the newly created key (only shown once!)
      setNewlyCreatedKey(data.key);
      setNewKeyName('');
      fetchApiKeys();
    } catch (err) {
      console.error('Create API key error:', err);
      toast.error('Could not create API key', {
        description: err instanceof Error ? err.message : 'Please try again in a moment.',
      });
    } finally {
      setIsCreatingKey(false);
      setShowNewKeyDialog(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    setRevokingKeyId(keyId);
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', keyId);

      if (error) throw error;
      fetchApiKeys();
    } catch (err) {
      console.error('Revoke key error:', err);
      toast.error('Could not revoke API key', {
        description: err instanceof Error ? err.message : 'Please try again in a moment.',
      });
    } finally {
      setRevokingKeyId(null);
    }
  };

  const copyToClipboard = async (text: string, keyId?: string) => {
    await navigator.clipboard.writeText(text);
    if (keyId) {
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    }
  };

  // Notification handlers
  const handleNotificationChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);

    setIsSavingNotifications(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user?.id,
          ...newNotifications,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (err) {
      console.error('Save notification error:', err);
      toast.error('Could not save notification settings', {
        description: err instanceof Error ? err.message : 'Please try again in a moment.',
      });
      // Revert on error
      setNotifications(notifications);
    } finally {
      setIsSavingNotifications(false);
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
                    <CardDescription>Manage your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user?.email || ''} disabled />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
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

                <ChangePasswordCard />

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
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
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
                            {isLifetime
                              ? 'Your lifetime deal has been activated. Enjoy!'
                              : 'Your subscription is being activated. This may take a moment.'}
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
                            {isLifetime
                              ? `LTD ${userLTD?.tier?.replace('ltd_', '').charAt(0).toUpperCase()}${userLTD?.tier?.replace('ltd_', '').slice(1) || ''}`
                              : planDetails?.name || 'Free'}
                          </span>
                          {isLifetime ? (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                              Lifetime
                            </Badge>
                          ) : (
                            <Badge variant={subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                              {subscriptionStatus}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {isLifetime
                            ? 'One-time payment, lifetime access'
                            : planDetails?.price_cents
                              ? `$${planDetails.price_cents / 100}/month`
                              : 'Free forever'}
                        </p>
                      </div>
                      {isLifetime ? (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Purchased {userLTD?.purchasedAt
                              ? new Date(userLTD.purchasedAt).toLocaleDateString()
                              : ''}
                          </p>
                        </div>
                      ) : !isFreeTier ? (
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
                          <span>{sitesUsed} / {sitesLimit}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, (sitesUsed / sitesLimit) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {!isLifetime && subscription?.current_period_end && (
                        <p className="text-sm text-muted-foreground">
                          Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {isFreeTier && !isLifetime && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Upgrade Your Plan</CardTitle>
                      <CardDescription>Get more sites, checks, and features</CardDescription>
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
                                {plan.popular && <Badge variant="secondary">Popular</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {plan.limits.sites} sites, {plan.limits.keywords} keywords
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold">${plan.price_cents / 100}/mo</span>
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
                    <p className="text-muted-foreground text-sm">No billing history yet.</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                {/* Newly created key banner */}
                {newlyCreatedKey && (
                  <Card className="border-green-500/50 bg-green-500/10">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-green-700 dark:text-green-400 mb-2">
                            API Key Created - Copy it now!
                          </p>
                          <p className="text-sm text-muted-foreground mb-3">
                            This is the only time you'll see this key. Store it securely.
                          </p>
                          <div className="flex items-center gap-2 p-3 bg-background rounded-lg font-mono text-sm">
                            <code className="flex-1 break-all">{newlyCreatedKey}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(newlyCreatedKey)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setNewlyCreatedKey(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage API keys for CLI and integrations. Maximum 5 keys.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-6">
                      {isLoadingKeys ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : apiKeys.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No API keys yet. Create one to use the CLI.
                        </p>
                      ) : (
                        apiKeys.map((key) => (
                          <div key={key.id} className="p-4 rounded-lg bg-muted/50 border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{key.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {key.key_prefix}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(key.key_prefix, key.id)}
                                  title="Copy prefix"
                                >
                                  {copiedKeyId === key.id ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleRevokeKey(key.id)}
                                  disabled={revokingKeyId === key.id}
                                >
                                  {revokingKeyId === key.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>
                                Created: {new Date(key.created_at).toLocaleDateString()}
                              </span>
                              {key.last_used_at && (
                                <span>
                                  Last used: {new Date(key.last_used_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <Button
                      onClick={() => setShowNewKeyDialog(true)}
                      disabled={apiKeys.length >= 5}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Generate New Key
                    </Button>
                    {apiKeys.length >= 5 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Maximum 5 keys reached. Revoke an existing key to create a new one.
                      </p>
                    )}

                    <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                      <p className="text-sm font-medium mb-2">Quick Start</p>
                      <code className="text-xs text-muted-foreground block bg-background p-2 rounded">
                        rankcli login --token YOUR_API_KEY
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'ai-provider' && (
              <div className="space-y-6">
                <AIProviderSettings />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
              {/* Webhook Notifications */}
              <AlertConfigForm />

              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Configure how you receive email alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingNotifications ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="audit-complete">Audit Complete</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive an email when an audit finishes
                          </p>
                        </div>
                        <Switch
                          id="audit-complete"
                          checked={notifications.email_audit_complete}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('email_audit_complete', checked)
                          }
                          disabled={isSavingNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="issues-found">Critical Issues Found</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when audits find critical SEO issues
                          </p>
                        </div>
                        <Switch
                          id="issues-found"
                          checked={notifications.email_issues_found}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('email_issues_found', checked)
                          }
                          disabled={isSavingNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weekly-report">Weekly Report</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive a weekly summary of all your sites
                          </p>
                        </div>
                        <Switch
                          id="weekly-report"
                          checked={notifications.email_weekly_report}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('email_weekly_report', checked)
                          }
                          disabled={isSavingNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="product-updates">Product Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            News about new features and improvements
                          </p>
                        </div>
                        <Switch
                          id="product-updates"
                          checked={notifications.email_product_updates}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('email_product_updates', checked)
                          }
                          disabled={isSavingNotifications}
                        />
                      </div>

                      {isSavingNotifications && (
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Saving...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
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
              <p>This will permanently delete your account and all associated data, including:</p>
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

      {/* New API Key Dialog */}
      <AlertDialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Give your key a name to help you identify it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="key-name">Key Name</Label>
            <Input
              id="key-name"
              placeholder="e.g., Production, CI/CD, Local Dev"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreatingKey}>Cancel</AlertDialogCancel>
            <Button onClick={handleCreateApiKey} disabled={isCreatingKey}>
              {isCreatingKey ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Key'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
