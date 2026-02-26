import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Activity } from 'lucide-react';

interface AuditStats {
  checks_today: number;
  checks_month: number;
  checks_year: number;
}

const SHOW_THRESHOLD = 1000; // Only show once we hit 1000 checks

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export function SocialProof() {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase.rpc('get_audit_stats');
        if (error) {
          console.error('Failed to fetch audit stats:', error);
          return;
        }
        if (data && data.length > 0) {
          setStats(data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch audit stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Don't show if loading, no data, or below threshold
  if (loading || !stats || stats.checks_today < SHOW_THRESHOLD) {
    return null;
  }

  return (
    <ScrollReveal delay={0.6}>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
        <Activity className="h-4 w-4 text-primary animate-pulse" />
        <span>
          <span className="font-medium text-foreground">{formatNumber(stats.checks_today)}</span> checks today
          <span className="mx-2 text-muted-foreground/50">·</span>
          <span className="font-medium text-foreground">{formatNumber(stats.checks_month)}</span> this month
          <span className="mx-2 text-muted-foreground/50">·</span>
          <span className="font-medium text-foreground">{formatNumber(stats.checks_year)}</span> this year
        </span>
      </div>
    </ScrollReveal>
  );
}
