import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Settings,
  Github,
  CheckCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Info,
  Sparkles,
  Trash2,
  GitPullRequest,
  X,
  XCircle,
  Clock,
  Building2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/hooks/useProjects';
import { useAuditSSE } from '@/hooks/useAuditSSE';
import { cn } from '@/lib/utils';
import { formatLocalDate, formatCountdown, parseNextAllowedAt, getTimeRemaining } from '@/lib/date-utils';
import type { Project } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { ConnectGitHubModal } from '@/components/project/ConnectGitHubModal';
import { ProjectSettingsModal } from '@/components/project/ProjectSettingsModal';
import { IssuesList } from '@/components/project/IssuesList';
import { AIVisibilityCard } from '@/components/dashboard/AIVisibilityCard';
import { ReadmeBadgeCard } from '@/components/project/ReadmeBadgeCard';
import { SearchConsoleCard } from '@/components/project/SearchConsoleCard';
import { CategoryRadarChart } from '@/components/audit/CategoryRadarChart';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Kept in step with PRS_PER_REPORT in supabase/functions/create-seo-pr, which is what
// actually enforces it. Only used to label the button before the first attempt; every
// response carries the server's own numbers, which win.
const PRS_PER_REPORT = 3;

export function ProjectPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const {
    project,
    audits,
    issues,
    isLoading,
    error,
    refetch,
    runAudit,
    createFixPR,
    deleteAudit,
    deleteOldAudits,
    updateProject,
    deleteProject,
    connectGitHub,
    disconnectGitHub,
  } = useProject(projectId);

  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deletingAuditId, setDeletingAuditId] = useState<string | null>(null);
  const [isDeletingOldAudits, setIsDeletingOldAudits] = useState(false);
  const [isCreatingPR, setIsCreatingPR] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    prUrl?: string;
  } | null>(null);
  // PRs the latest report has already opened, and its allowance, so the button can say
  // "2 of 3 left" before the user clicks rather than after.
  const [reportPrs, setReportPrs] = useState<{ used: number; allowed: number } | null>(null);

  // Track pending audit for SSE connection
  const [pendingAuditId, setPendingAuditId] = useState<string | null>(null);
  const [pendingAuditInstance, setPendingAuditInstance] = useState<string | null>(null);
  const [auditProgress, setAuditProgress] = useState<{
    progress: number;
    pagesCompleted: number;
    pagesTotal: number;
  } | null>(null);

  // Track schedule limit countdown
  const [nextAllowedAt, setNextAllowedAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  // SSE connection for real-time audit updates (paid users using worker)
  useAuditSSE({
    auditId: pendingAuditId,
    instance: pendingAuditInstance,
    enabled: !!pendingAuditId,
    onProgress: (_auditId, progress, pagesCompleted, pagesTotal) => {
      setAuditProgress({ progress, pagesCompleted, pagesTotal });
    },
    onCompleted: () => {
      setPendingAuditId(null);
      setAuditProgress(null);
      // Refetch project data to get updated audit status
      refetch();
    },
    onFailed: (_auditId, errorMsg) => {
      setPendingAuditId(null);
      setAuditProgress(null);
      // Check for schedule limit and extract next_allowed_at
      const nextAt = parseNextAllowedAt(errorMsg);
      if (nextAt) {
        setNextAllowedAt(nextAt);
      }
      // Refetch to update UI state
      refetch();
    },
  });

  // Update countdown timer every second when schedule limited
  useEffect(() => {
    if (!nextAllowedAt) {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const time = getTimeRemaining(nextAllowedAt);
      if (time.isPast) {
        setNextAllowedAt(null);
        setCountdown('');
      } else {
        setCountdown(formatCountdown(nextAllowedAt));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextAllowedAt]);

  // Check latest failed audit for schedule limit on mount
  useEffect(() => {
    const failedAudit = audits.find((a) => a.status === 'failed' && a.error_message?.includes('Schedule limit'));
    if (failedAudit?.error_message) {
      const nextAt = parseNextAllowedAt(failedAudit.error_message);
      if (nextAt) {
        const time = getTimeRemaining(nextAt);
        if (!time.isPast) {
          setNextAllowedAt(nextAt);
        }
      }
    }
  }, [audits]);

  // Auto-dismiss notification after 10 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Plain-language explanations for the category scores - the raw labels
  // ("Crawlability", "AI Ready") mean nothing to a non-technical founder
  // without this, and developers already get the full technical detail
  // in the issues list below regardless.
  const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    crawlability: 'Can search engines find and read your pages at all',
    onPage: 'Titles, headings, and meta tags search engines use to understand each page',
    content: "Whether your content is substantial and well-structured enough to rank",
    performance: 'How fast your site loads - slow sites lose visitors and rankings',
    security: "HTTPS and security headers - search engines and users don't trust insecure sites",
    aiReadiness: 'Whether AI assistants like ChatGPT and Claude can find and cite your site',
  };

  // One plain-language sentence a non-technical founder can act on without
  // reading a single check name - the full technical breakdown is still
  // right below for anyone who wants it, this doesn't replace that.
  function getPlainLanguageSummary(score: number | null, errorCount: number, warningCount: number): string {
    if (score === null) return '';
    if (errorCount > 0) {
      return `${errorCount} critical issue${errorCount === 1 ? ' is' : 's are'} likely hurting how search engines and AI assistants see your site.`;
    }
    if (warningCount > 0) {
      return `No critical issues - ${warningCount} smaller improvement${warningCount === 1 ? '' : 's'} could help you rank better.`;
    }
    return 'Your site is in good shape - search engines and AI assistants can find and understand it well.';
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const latestAudit = audits.find((a) => a.status === 'completed');

  // How many PRs the report on screen has already opened. create-seo-pr caps it per
  // report (PRS_PER_REPORT); knowing the count up front means the button can show what
  // is left instead of only telling the user once they hit the wall.
  useEffect(() => {
    const auditId = latestAudit?.id;
    if (!auditId) {
      setReportPrs(null);
      return;
    }
    let active = true;
    (async () => {
      const { count, error } = await supabase
        .from('github_prs')
        .select('id', { count: 'exact', head: true })
        .eq('audit_id', auditId);
      if (active && !error) setReportPrs({ used: count ?? 0, allowed: PRS_PER_REPORT });
    })();
    return () => {
      active = false;
    };
  }, [latestAudit?.id]);

  const pendingAudit = audits.find((a) => a.status === 'pending' || a.status === 'running');

  // Get check counts from the audit
  const checksRun = latestAudit?.checks_run || 0;
  const pagesAudited = latestAudit?.pages_crawled || 1;

  const handleRunAudit = async () => {
    const audit = await runAudit();
    // Set pending audit ID to enable SSE connection
    if (audit?.id) {
      setPendingAuditInstance(audit.worker_instance ?? null);
      setPendingAuditId(audit.id);
      setAuditProgress(null);
    }
  };

  const handleConnectGitHub = async (repoUrl: string) => {
    const result = await connectGitHub(repoUrl);
    if (!result.success) {
      toast.error('Could not connect repository', {
        description: result.reason || 'Please try again in a moment.',
      });
    } else if (!result.linked) {
      // connect-github-repo saves nothing unless it can link the repo (the
      // App is installed there and the user has access), so don't claim
      // anything was saved; the reason says what to fix before trying again.
      const reason = result.reason || 'Install the RankCLI GitHub App on this repository, then connect it again';
      toast.warning('Repository not connected', {
        description: `${reason.replace(/\.$/, '')}. Nothing was saved.`,
      });
    } else {
      toast.success('GitHub repository connected');
    }
  };

  const handleUpdateProject = async (updates: Partial<Project>): Promise<boolean> => {
    if (project) {
      return await updateProject(updates);
    }
    return false;
  };

  const handleDeleteProject = async (): Promise<boolean> => {
    const success = await deleteProject();
    if (success) {
      navigate('/dashboard');
    }
    return success;
  };

  const handleDisconnectGitHub = async (): Promise<boolean> => {
    return await disconnectGitHub();
  };

  const handleCreateFixPR = async () => {
    if (!latestAudit || isCreatingPR) return;

    setIsCreatingPR(true);
    setNotification(null);

    try {
      const result = await createFixPR(latestAudit.id);

      if (result.prsForReport !== undefined && result.prsAllowedForReport !== undefined) {
        setReportPrs({ used: result.prsForReport, allowed: result.prsAllowedForReport });
      }

      if (result.success && result.prUrl) {
        const skipped = result.unchangedFiles?.length
          ? ` (${result.unchangedFiles.length} file${result.unchangedFiles.length === 1 ? '' : 's'} already up to date)`
          : '';
        setNotification({
          type: 'success',
          message: `PR #${result.prNumber} created with ${result.filesChanged} files changed, fixing ${result.issuesFixed} issues${skipped}`,
          prUrl: result.prUrl,
        });
      } else if (result.noop) {
        // Nothing needed doing. Say that plainly instead of dressing it up as a failure.
        setNotification({
          type: 'info',
          message: result.message || 'Nothing to change',
          prUrl: result.prUrls?.[0],
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to create PR',
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create PR',
      });
    } finally {
      setIsCreatingPR(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <Card className="border-red-500/50">
            <CardContent className="py-12 text-center">
              <p className="text-red-500">{error || 'Project not found'}</p>
              <Link to="/dashboard">
                <Button variant="outline" className="mt-4">
                  Return to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Calculate category scores from latest audit
  const healthScores = (latestAudit?.health_scores || {}) as Record<string, number | undefined>;
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Notification Banner */}
        {notification && (
          <div
            className={cn(
              'mb-6 p-4 rounded-lg flex items-center justify-between',
              notification.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-600'
                : notification.type === 'info'
                  ? 'bg-muted border text-muted-foreground'
                  : 'bg-red-500/10 border border-red-500/30 text-red-600'
            )}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'error' ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <GitPullRequest className="h-5 w-5" />
              )}
              <span>{notification.message}</span>
              {notification.prUrl && (
                <a
                  href={notification.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline font-medium hover:no-underline"
                >
                  View PR →
                </a>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-black/10 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {project.framework && (
                <Badge variant="outline">{project.framework}</Badge>
              )}
            </div>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              {project.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" asChild>
              <Link to={`/dashboard/projects/${projectId}/keywords`}>
                <Sparkles className="h-4 w-4" />
                Keywords
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link to={`/dashboard/projects/${projectId}/agency`}>
                <Building2 className="h-4 w-4" />
                Agency
              </Link>
            </Button>
            {project.github_repo_url ? (
              <Button variant="outline" className="gap-2" asChild>
                <a href={project.github_repo_url} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  View Repo
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowGitHubModal(true)}
              >
                <Github className="h-4 w-4" />
                Connect GitHub
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              className="gap-2"
              onClick={handleRunAudit}
              disabled={!!pendingAudit || !!nextAllowedAt}
            >
              {pendingAudit ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : nextAllowedAt ? (
                <>
                  <Clock className="h-4 w-4" />
                  Available in {countdown}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Audit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Score Card with Radar Chart */}
        <Card className="mb-6">
          <CardContent className="py-5">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Score */}
              <div className="flex flex-col items-center justify-center md:border-r md:border-border">
                <div
                  className={cn(
                    'text-5xl font-bold tracking-tight tabular-nums',
                    getScoreColor(project.last_audit_score)
                  )}
                >
                  {project.last_audit_score ?? '-'}
                </div>
                <p className="text-sm text-muted-foreground mt-1">SEO Health Score</p>
                {latestAudit && (
                  <p className="text-xs text-muted-foreground/80 mt-2 text-center max-w-[16rem]">
                    {getPlainLanguageSummary(project.last_audit_score, errorCount, warningCount)}
                  </p>
                )}
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
              <TooltipProvider>
                <div className="grid grid-cols-2 gap-3 content-center">
                  {[
                    { key: 'crawlability', label: 'Crawlability' },
                    { key: 'onPage', label: 'On-Page' },
                    { key: 'content', label: 'Content' },
                    { key: 'performance', label: 'Performance' },
                    { key: 'security', label: 'Security' },
                    { key: 'aiReadiness', label: 'AI Ready' },
                  ].map(({ key, label }) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between px-2 py-1 rounded bg-muted/50 cursor-help">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span
                            className={cn(
                              'text-sm font-medium tabular-nums',
                              getScoreColor(healthScores[key] ?? null)
                            )}
                          >
                            {healthScores[key] ?? '-'}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64">
                        <p>{CATEGORY_DESCRIPTIONS[key]}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* AI Visibility Card */}
        <div className="mb-6">
          <AIVisibilityCard
            projectId={project.id}
            domain={new URL(project.url).hostname}
            brand={project.name}
          />
        </div>

        <div className="mb-6">
          <ReadmeBadgeCard projectId={project.id} initiallyEnabled={!!project.badge_enabled} />
        </div>

        <div className="mb-6">
          <SearchConsoleCard projectId={project.id} />
        </div>

        {/* Checks Summary */}
        {latestAudit && (
          <Card className="mb-8">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{checksRun}</strong> unique checks across <strong>{pagesAudited}</strong> page{pagesAudited !== 1 ? 's' : ''}
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
                    {issues.filter((i) => i.severity === 'notice').length} notices
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Audit State */}
        {!latestAudit && !pendingAudit && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="p-4 rounded-full bg-muted inline-block mb-4">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No audits yet</h3>
              <p className="text-muted-foreground mb-4">
                Run your first audit to see SEO issues and recommendations.
              </p>
              <Button onClick={handleRunAudit} className="gap-2" disabled={!!nextAllowedAt}>
                {nextAllowedAt ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Available in {countdown}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run First Audit
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Schedule Limit Reached */}
        {nextAllowedAt && !pendingAudit && (
          <Card className="mb-8 border-yellow-500/50">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Schedule limit reached</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Your plan allows audits on a limited schedule. Next audit available:
                  </p>
                  <p className="font-medium">
                    {formatLocalDate(nextAllowedAt)} ({countdown})
                  </p>
                  <Link to="/pricing" className="text-primary text-sm hover:underline mt-2 inline-block">
                    Upgrade for more frequent audits →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Audit State */}
        {pendingAudit && (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Audit in progress...</p>
              {auditProgress ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Page {auditProgress.pagesCompleted} of {auditProgress.pagesTotal}
                  </p>
                  <div className="w-64 mx-auto bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${auditProgress.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{auditProgress.progress}%</p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Running 280+ SEO checks. This usually takes 1-3 minutes.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Issues */}
        {latestAudit && issues.length > 0 && (
          <IssuesList
            issues={issues}
            projectName={project.name}
            projectUrl={project.url}
            onCreateFixPR={handleCreateFixPR}
            isCreatingPR={isCreatingPR}
            hasGitHub={!!(project.github_repo_url && project.github_installation_id)}
            onConnectGitHub={() => setShowGitHubModal(true)}
            prsUsedForReport={reportPrs?.used}
            prsAllowedForReport={reportPrs?.allowed}
          />
        )}

        {/* No Issues State */}
        {latestAudit && issues.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="p-4 rounded-full bg-green-500/10 inline-block mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">All clear!</h3>
              <p className="text-muted-foreground">
                No SEO issues found. Your site is in great shape.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Audit History */}
        {audits.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit History</CardTitle>
                {audits.length > 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground"
                    disabled={isDeletingOldAudits}
                    onClick={async () => {
                      setIsDeletingOldAudits(true);
                      try {
                        const deleted = await deleteOldAudits(5);
                        if (deleted > 0) {
                          console.log(`Deleted ${deleted} old audits`);
                        }
                      } catch (err) {
                        console.error('Delete old audits error:', err);
                        alert(`Failed to delete old audits: ${err instanceof Error ? err.message : 'Unknown error'}`);
                      } finally {
                        setIsDeletingOldAudits(false);
                      }
                    }}
                  >
                    {isDeletingOldAudits ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Old Audits
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {audits.slice(0, 10).map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'font-bold w-8',
                          getScoreColor(audit.score)
                        )}
                      >
                        {audit.score ?? '-'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(audit.created_at).toLocaleDateString()} at{' '}
                          {new Date(audit.created_at).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {audit.triggered_by === 'manual' ? 'Manual audit' : `Triggered by ${audit.triggered_by}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          audit.status === 'completed'
                            ? 'secondary'
                            : audit.status === 'failed'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {audit.status}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-8 w-8',
                                  audits.length === 1
                                    ? 'text-muted-foreground/50 cursor-not-allowed'
                                    : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                                )}
                                disabled={deletingAuditId === audit.id || audits.length === 1}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (deletingAuditId || audits.length === 1) return;
                                  setDeletingAuditId(audit.id);
                                  try {
                                    const success = await deleteAudit(audit.id);
                                    if (!success) {
                                      alert('Failed to delete audit. Check console for details.');
                                    }
                                  } catch (err) {
                                    console.error('Delete error:', err);
                                    alert(`Failed to delete audit: ${err instanceof Error ? err.message : 'Unknown error'}`);
                                  } finally {
                                    setDeletingAuditId(null);
                                  }
                                }}
                              >
                                {deletingAuditId === audit.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {audits.length === 1 && (
                            <TooltipContent>
                              <p>Cannot delete the only audit. Run a new audit first.</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modals */}
      <ConnectGitHubModal
        open={showGitHubModal}
        onOpenChange={setShowGitHubModal}
        projectId={project.id}
        projectName={project.name}
        projectUrl={project.url}
        onConnect={handleConnectGitHub}
      />

      <ProjectSettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        project={project}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
        onDisconnectGitHub={handleDisconnectGitHub}
        error={error}
      />
    </div>
  );
}
