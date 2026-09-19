import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// Google Search Console for one project: connect (gsc-oauth), pick the property, and show the
// last 28 days (sync-gsc-metrics fills seo_metrics). Hidden entirely until the server has a
// Google OAuth client configured.

interface Status {
  configured: boolean;
  allowed: boolean;
  connected: boolean;
  email: string | null;
  siteUrl: string | null;
  lastSync: { status: string; completed_at: string | null; error_message: string | null } | null;
}

interface Row {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface Summary extends Row {
  period_start: string;
  period_end: string;
  top_queries: Array<Row & { query: string }>;
  top_pages: Array<Row & { page: string }>;
}

const ERRORS: Record<string, string> = {
  access_denied: 'Google access was not granted.',
  scope_not_granted: 'Search Console access was not granted - tick the Search Console box on the Google screen.',
  expired: 'The connection took too long. Try again.',
  token_exchange_failed: 'Google did not complete the connection. Try again.',
  storage_failed: 'The connection could not be saved. Try again.',
  project: 'This project is no longer yours.',
  unavailable: 'Search Console is not available right now.',
};

async function callGsc<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}

const number = new Intl.NumberFormat();

export function SearchConsoleCard({ projectId }: { projectId: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [sites, setSites] = useState<{ siteUrl: string; permissionLevel: string }[] | null>(null);
  const [chosen, setChosen] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [daily, setDaily] = useState<Array<{ period_start: string; clicks: number }>>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await callGsc<Status>('gsc-oauth/status', { project_id: projectId }));
    } catch {
      setStatus(null);
    }
  }, [projectId]);

  const loadMetrics = useCallback(async () => {
    const [{ data: latest }, { data: days }] = await Promise.all([
      supabase.from('seo_metrics')
        .select('period_start, period_end, clicks, impressions, ctr, avg_position, top_queries, top_pages')
        .eq('project_id', projectId).eq('source', 'gsc').eq('period_type', 'monthly')
        .order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('seo_metrics')
        .select('period_start, clicks')
        .eq('project_id', projectId).eq('source', 'gsc').eq('period_type', 'daily')
        .order('period_start', { ascending: false }).limit(28),
    ]);
    setSummary(latest ? { ...latest, position: Number(latest.avg_position), ctr: Number(latest.ctr) } as unknown as Summary : null);
    setDaily(((days ?? []) as Array<{ period_start: string; clicks: number }>).reverse());
  }, [projectId]);

  const loadSites = useCallback(async () => {
    try {
      const result = await callGsc<{ sites: { siteUrl: string; permissionLevel: string }[]; suggested: string | null; selected: string | null }>(
        'gsc-oauth/sites', { project_id: projectId },
      );
      setSites(result.sites.filter((s) => s.permissionLevel !== 'siteUnverifiedUser'));
      setChosen(result.selected ?? result.suggested ?? '');
    } catch (error) {
      toast.error('Could not list your Search Console properties', { description: (error as Error).message });
    }
  }, [projectId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (status?.connected && status.siteUrl) loadMetrics();
    if (status?.connected && !status.siteUrl && !sites) loadSites();
  }, [status, sites, loadMetrics, loadSites]);

  // Back from Google (gsc-oauth/callback redirects here with ?gsc=connected or ?gsc_error=).
  useEffect(() => {
    const connected = searchParams.get('gsc');
    const error = searchParams.get('gsc_error');
    if (!connected && !error) return;
    if (connected) toast.success('Google Search Console connected');
    if (error) toast.error('Search Console was not connected', { description: ERRORS[error] ?? error });
    searchParams.delete('gsc');
    searchParams.delete('gsc_error');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const run = async (label: string, work: () => Promise<void>) => {
    setBusy(label);
    try {
      await work();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const connect = () => run('connect', async () => {
    const { auth_url } = await callGsc<{ auth_url: string }>('gsc-oauth/start', { project_id: projectId });
    window.location.href = auth_url;
  });

  const syncNow = () => run('sync', async () => {
    await callGsc('sync-gsc-metrics', { project_id: projectId });
    await Promise.all([loadMetrics(), loadStatus()]);
    toast.success('Search Console data updated');
  });

  const saveSite = () => run('save', async () => {
    await callGsc('gsc-oauth/select-site', { project_id: projectId, site_url: chosen });
    await callGsc('sync-gsc-metrics', { project_id: projectId });
    setSites(null);
    await loadStatus();
  });

  const disconnect = () => run('disconnect', async () => {
    await callGsc('gsc-oauth/disconnect', { project_id: projectId });
    setSummary(null);
    setDaily([]);
    setSites(null);
    await loadStatus();
  });

  if (!status?.configured) return null;

  const header = (
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Google Search Console</CardTitle>
      <CardDescription>Real clicks, impressions and queries from Google for this site.</CardDescription>
    </CardHeader>
  );

  if (!status.allowed) {
    return (
      <Card>
        {header}
        <CardContent className="text-sm text-muted-foreground">
          Search Console is part of the Solo, Pro and Agency plans.{' '}
          <Link to="/pricing" className="text-foreground underline">See plans</Link>
        </CardContent>
      </Card>
    );
  }

  if (!status.connected) {
    return (
      <Card>
        {header}
        <CardContent className="space-y-2">
          <Button onClick={connect} disabled={busy !== null}>
            {busy === 'connect' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Connect Google Search Console
          </Button>
          <p className="text-xs text-muted-foreground">Read-only access. You can disconnect at any time.</p>
        </CardContent>
      </Card>
    );
  }

  if (!status.siteUrl) {
    return (
      <Card>
        {header}
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Connected as {status.email ?? 'your Google account'}. Choose the property for this site:
          </p>
          {sites === null ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : sites.length === 0 ? (
            <p className="text-sm">This Google account has no verified Search Console properties. Add and verify the site in Search Console, then reload.</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={chosen}
                onChange={(e) => setChosen(e.target.value)}
                aria-label="Search Console property"
              >
                <option value="" disabled>Choose a property</option>
                {sites.map((s) => <option key={s.siteUrl} value={s.siteUrl}>{s.siteUrl}</option>)}
              </select>
              <Button onClick={saveSite} disabled={!chosen || busy !== null}>
                {busy === 'save' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Use this property
              </Button>
              <Button variant="ghost" onClick={disconnect} disabled={busy !== null}>Disconnect</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const maxClicks = Math.max(1, ...daily.map((d) => d.clicks));
  const failed = status.lastSync?.status === 'failed' ? status.lastSync.error_message : null;

  return (
    <Card>
      {header}
      <CardContent className="space-y-5">
        {failed && <p className="text-sm text-red-500">Last sync failed: {failed}</p>}
        {summary ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Clicks', number.format(summary.clicks)],
                ['Impressions', number.format(summary.impressions)],
                ['CTR', `${(summary.ctr * 100).toFixed(1)}%`],
                ['Avg. position', summary.position ? summary.position.toFixed(1) : '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-xl font-semibold">{value}</div>
                </div>
              ))}
            </div>
            {daily.length > 1 && (
              <div>
                <div className="flex h-16 items-end gap-0.5" aria-label="Clicks per day">
                  {daily.map((d) => (
                    <div
                      key={d.period_start}
                      className="flex-1 rounded-sm bg-primary/70"
                      style={{ height: `${Math.max(2, (d.clicks / maxClicks) * 100)}%` }}
                      title={`${d.period_start}: ${d.clicks} clicks`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Clicks per day, {summary.period_start} to {summary.period_end}</p>
              </div>
            )}
            {summary.top_queries?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Top queries</h4>
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr><th className="text-left font-normal">Query</th><th className="text-right font-normal">Clicks</th><th className="text-right font-normal">Impr.</th><th className="text-right font-normal">Pos.</th></tr>
                  </thead>
                  <tbody>
                    {summary.top_queries.slice(0, 10).map((q) => (
                      <tr key={q.query} className="border-t">
                        <td className="py-1 pr-2">{q.query}</td>
                        <td className="py-1 text-right">{number.format(q.clicks)}</td>
                        <td className="py-1 text-right">{number.format(q.impressions)}</td>
                        <td className="py-1 text-right">{q.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {summary.top_pages?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Top pages</h4>
                <ul className="space-y-1 text-sm">
                  {summary.top_pages.slice(0, 5).map((p) => (
                    <li key={p.page} className="flex justify-between gap-3">
                      <span className="truncate">{p.page}</span>
                      <span className="shrink-0 text-muted-foreground">{number.format(p.clicks)} clicks</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No data yet. Sync to pull the last 28 days.</p>
        )}
        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={syncNow} disabled={busy !== null}>
            {busy === 'sync' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync now
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setStatus({ ...status, siteUrl: null }); setSites(null); }} disabled={busy !== null}>
            Change property
          </Button>
          <Button variant="ghost" size="sm" onClick={disconnect} disabled={busy !== null}>Disconnect</Button>
          <span className="ml-auto text-xs text-muted-foreground">
            {status.siteUrl} · {status.email ?? ''}{status.lastSync?.completed_at ? ` · synced ${new Date(status.lastSync.completed_at).toLocaleString()}` : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
