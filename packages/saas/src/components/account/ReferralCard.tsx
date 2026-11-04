import { useEffect, useState } from 'react';
import { Copy, Check, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// The referral program (migration 20261104220000): a link per account; the referred get 30
// days of Pro instead of 14; the referrer gets a month of their plan when the referred pays,
// or 30 days of Pro on Free. Credit, never cash.
export function referralLink(code: string): string {
  return `https://rankcli.dev/?ref=${encodeURIComponent(code)}`;
}

type Counts = { signed_up: number; converted: number; rewarded: number };

export function ReferralCard() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts>({ signed_up: 0, converted: 0, rewarded: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.rpc('my_referral_code').then(({ data }) => {
      if (typeof data === 'string') setCode(data);
    });
    supabase
      .from('referrals')
      .select('status')
      .eq('referrer_id', user.id)
      .then(({ data }) => {
        const c: Counts = { signed_up: 0, converted: 0, rewarded: 0 };
        for (const r of (data || []) as Array<{ status: string }>) {
          if (r.status in c) c[r.status as keyof Counts] += 1;
        }
        setCounts(c);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const link = code ? referralLink(code) : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // the field is selectable
    }
  };
  const total = counts.signed_up + counts.converted + counts.rewarded;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Refer a developer</CardTitle>
        <CardDescription>
          They start with 30 days of Pro instead of 14. When they pay, you get a month of your plan free; on the Free plan you get 30 days of Pro. Credit, never cash; one reward per referred account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <input
            readOnly
            value={link}
            aria-label="Your referral link"
            className="flex-1 rounded-md border bg-muted/40 px-3 py-2 text-sm font-mono"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button variant="outline" onClick={copy} disabled={!link} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {total === 0
            ? 'No referrals yet.'
            : `${total} referred: ${counts.signed_up} signed up, ${counts.converted + counts.rewarded} paying, ${counts.rewarded} rewarded.`}
        </p>
      </CardContent>
    </Card>
  );
}
