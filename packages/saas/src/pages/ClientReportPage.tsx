import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Loader2,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CategoryRadarChart } from '@/components/audit/CategoryRadarChart';

interface ReportData {
  project: {
    name: string;
    url: string;
    score: number;
  };
  audit: {
    created_at: string;
    health_scores: Record<string, number>;
    checks_run: number;
    pages_crawled: number;
  };
  issues: Array<{
    id: string;
    severity: 'error' | 'warning' | 'notice';
    code: string;
    message: string;
    page_url: string;
  }>;
}

export function ClientReportPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid report link');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/client-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to load report');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Report Unavailable</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { project, audit, issues } = data;
  const healthScores = audit.health_scores || {};
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const noticeCount = issues.filter((i) => i.severity === 'notice').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
              >
                {project.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">SEO Audit Report</p>
              <p className="text-sm text-muted-foreground">
                {new Date(audit.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Score Overview */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Score */}
              <div className="flex flex-col items-center justify-center md:border-r">
                <div
                  className={cn(
                    'text-6xl font-bold tracking-tight',
                    getScoreColor(project.score)
                  )}
                >
                  {project.score}
                </div>
                <p className="text-sm text-muted-foreground mt-2">SEO Health Score</p>
              </div>

              {/* Radar Chart */}
              <div className="flex items-center justify-center">
                <CategoryRadarChart
                  categories={{
                    crawlability: healthScores.crawlability ?? 0,
                    onPage: healthScores.onPage ?? 0,
                    content: healthScores.content ?? 0,
                    performance: healthScores.performance ?? 0,
                    security: healthScores.security ?? 0,
                    socialMeta: healthScores.socialMeta ?? healthScores.social ?? 0,
                    aiReadiness: healthScores.aiReadiness ?? 0,
                  }}
                />
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-2 gap-3 content-center">
                {[
                  { key: 'crawlability', label: 'Crawlability' },
                  { key: 'onPage', label: 'On-Page' },
                  { key: 'content', label: 'Content' },
                  { key: 'performance', label: 'Performance' },
                  { key: 'security', label: 'Security' },
                  { key: 'aiReadiness', label: 'AI Ready' },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-2 rounded bg-muted/50"
                  >
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        getScoreColor(healthScores[key] ?? null)
                      )}
                    >
                      {healthScores[key] ?? '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{audit.checks_run}</strong> checks across{' '}
                  <strong>{audit.pages_crawled}</strong> page
                  {audit.pages_crawled !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {errorCount} errors
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  {warningCount} warnings
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {noticeCount} notices
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        {issues.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Issues Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={cn(
                      'p-4 rounded-lg border-l-4',
                      issue.severity === 'error' && 'bg-red-50 dark:bg-red-950/20 border-red-500',
                      issue.severity === 'warning' && 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500',
                      issue.severity === 'notice' && 'bg-blue-50 dark:bg-blue-950/20 border-blue-500'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{issue.code}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              issue.severity === 'error' && 'border-red-300 text-red-700',
                              issue.severity === 'warning' && 'border-yellow-300 text-yellow-700',
                              issue.severity === 'notice' && 'border-blue-300 text-blue-700'
                            )}
                          >
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.message}</p>
                        {issue.page_url && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {issue.page_url}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground">
                No SEO issues found. This site is in great shape.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a
              href="https://rankcli.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              RankCLI
            </a>{' '}
            — SEO Autopilot for Developers
          </p>
        </div>
      </footer>
    </div>
  );
}
