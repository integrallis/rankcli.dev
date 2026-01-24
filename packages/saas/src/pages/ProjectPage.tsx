import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/hooks/useProjects';
import { useAuditSSE } from '@/hooks/useAuditSSE';
import { cn } from '@/lib/utils';
import type { Project } from '@/integrations/supabase/types';
import { ConnectGitHubModal } from '@/components/project/ConnectGitHubModal';
import { ProjectSettingsModal } from '@/components/project/ProjectSettingsModal';
import { IssuesList } from '@/components/project/IssuesList';


export function ProjectPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const {
    project,
    audits,
    issues,
    isLoading,
    error,
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
    type: 'success' | 'error';
    message: string;
    prUrl?: string;
  } | null>(null);

  // Track pending audit for SSE connection
  const [pendingAuditId, setPendingAuditId] = useState<string | null>(null);
  const [auditProgress, setAuditProgress] = useState<{
    progress: number;
    pagesCompleted: number;
    pagesTotal: number;
  } | null>(null);

  // SSE connection for real-time audit updates (paid users using worker)
  useAuditSSE({
    auditId: pendingAuditId,
    enabled: !!pendingAuditId,
    onProgress: (_auditId, progress, pagesCompleted, pagesTotal) => {
      setAuditProgress({ progress, pagesCompleted, pagesTotal });
    },
    onCompleted: () => {
      setPendingAuditId(null);
      setAuditProgress(null);
    },
    onFailed: () => {
      setPendingAuditId(null);
      setAuditProgress(null);
    },
  });

  // Auto-dismiss notification after 10 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const latestAudit = audits.find((a) => a.status === 'completed');
  const pendingAudit = audits.find((a) => a.status === 'pending' || a.status === 'running');

  // Get check counts from the audit or summary
  const auditSummary = latestAudit?.summary as { checksRun?: number; pagesAudited?: number } | undefined;
  const checksRun = (latestAudit as { checks_run?: number })?.checks_run || auditSummary?.checksRun || 0;
  const pagesAudited = (latestAudit as { pages_crawled?: number })?.pages_crawled || auditSummary?.pagesAudited || 1;

  const handleRunAudit = async () => {
    const audit = await runAudit();
    // Set pending audit ID to enable SSE connection
    if (audit?.id) {
      setPendingAuditId(audit.id);
      setAuditProgress(null);
    }
  };

  const handleConnectGitHub = async (repoUrl: string) => {
    await connectGitHub(repoUrl);
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

      if (result.success && result.prUrl) {
        setNotification({
          type: 'success',
          message: `PR #${result.prNumber} created with ${result.filesChanged} files changed, fixing ${result.issuesFixed} issues`,
          prUrl: result.prUrl,
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
                : 'bg-red-500/10 border border-red-500/30 text-red-600'
            )}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <GitPullRequest className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
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
              disabled={!!pendingAudit}
            >
              {pendingAudit ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running...
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

        {/* Score Card */}
        <Card className="mb-6">
          <CardContent className="py-5">
            <div className="grid md:grid-cols-6 gap-6">
              {/* Main Score */}
              <div className="md:col-span-1 text-center md:border-r md:border-border">
                <div
                  className={cn(
                    'text-4xl font-semibold tracking-tight tabular-nums',
                    getScoreColor(project.last_audit_score)
                  )}
                >
                  {project.last_audit_score ?? '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Overall</p>
              </div>

              {/* Category Scores */}
              <div className="md:col-span-5 grid grid-cols-5 gap-4">
                {[
                  { key: 'crawlability', label: 'Crawlability' },
                  { key: 'onPage', label: 'On-Page' },
                  { key: 'content', label: 'Content' },
                  { key: 'performance', label: 'Performance' },
                  { key: 'security', label: 'Security' },
                ].map(({ key, label }) => (
                  <div key={key} className="text-center">
                    <div
                      className={cn(
                        'text-xl font-medium tabular-nums',
                        getScoreColor(healthScores[key] ?? null)
                      )}
                    >
                      {healthScores[key] ?? '-'}
                    </div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checks Summary */}
        {latestAudit && (
          <Card className="mb-8">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{checksRun}</strong> checks performed across <strong>{pagesAudited}</strong> page{pagesAudited !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    {issues.filter((i) => i.severity === 'error').length} errors
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    {issues.filter((i) => i.severity === 'warning').length} warnings
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
              <Button onClick={handleRunAudit} className="gap-2">
                <Play className="h-4 w-4" />
                Run First Audit
              </Button>
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
                  Running 200+ SEO checks. This usually takes 30-60 seconds.
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingAuditId === audit.id}
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (deletingAuditId) return;
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
