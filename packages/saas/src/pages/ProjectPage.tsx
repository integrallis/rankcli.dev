import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Settings,
  Github,
  AlertCircle,
  XCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Info,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import type { Project } from '@/integrations/supabase/types';
import { ConnectGitHubModal } from '@/components/project/ConnectGitHubModal';
import { ProjectSettingsModal } from '@/components/project/ProjectSettingsModal';

// Check limits per tier (using full agent-runtime engine)
const TIER_CHECKS = {
  free: 200,
  solo: 280,
  pro: 280,
  agency: 280,
};

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
    updateProject,
    deleteProject,
    connectGitHub,
    disconnectGitHub,
  } = useProject(projectId);

  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const latestAudit = audits.find((a) => a.status === 'completed');
  const pendingAudit = audits.find((a) => a.status === 'pending' || a.status === 'running');

  // Get check counts from the audit or summary
  const auditSummary = latestAudit?.summary as { checksRun?: number } | undefined;
  const checksRun = (latestAudit as { checks_run?: number })?.checks_run || auditSummary?.checksRun || 0;
  const totalChecks = TIER_CHECKS.pro; // TODO: Get from user's subscription tier

  const handleRunAudit = async () => {
    await runAudit();
  };

  const handleConnectGitHub = async (repoUrl: string) => {
    await connectGitHub(repoUrl);
  };

  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (project) {
      await updateProject(updates);
    }
  };

  const handleDeleteProject = async () => {
    const success = await deleteProject();
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDisconnectGitHub = async () => {
    await disconnectGitHub();
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
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="grid md:grid-cols-6 gap-8">
              {/* Main Score */}
              <div className="md:col-span-1 text-center">
                <div
                  className={cn(
                    'text-5xl font-bold mb-2',
                    getScoreColor(project.last_audit_score)
                  )}
                >
                  {project.last_audit_score ?? '-'}
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
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
                        'text-2xl font-semibold',
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
                    <strong>{checksRun}</strong> checks run out of <strong>{totalChecks}+</strong> available
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
              <p className="text-muted-foreground">
                Running 200+ SEO checks. This usually takes 30-60 seconds.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Issues */}
        {latestAudit && issues.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Issues Found</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="destructive">
                    {issues.filter((i) => i.severity === 'error').length} errors
                  </Badge>
                  <Badge variant="outline" className="border-yellow-500/50 text-yellow-600">
                    {issues.filter((i) => i.severity === 'warning').length} warnings
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{issue.title}</h3>
                          {issue.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {issue.description}
                            </p>
                          )}
                          {issue.affected_urls && issue.affected_urls.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">
                                Affected pages:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {issue.affected_urls.slice(0, 3).map((url) => (
                                  <code
                                    key={url}
                                    className="text-xs px-2 py-1 bg-background rounded"
                                  >
                                    {(() => {
                                      try {
                                        return new URL(url).pathname;
                                      } catch {
                                        return url;
                                      }
                                    })()}
                                  </code>
                                ))}
                                {issue.affected_urls.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{issue.affected_urls.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            issue.severity === 'error'
                              ? 'destructive'
                              : issue.severity === 'warning'
                              ? 'outline'
                              : 'secondary'
                          }
                          className={
                            issue.severity === 'warning'
                              ? 'border-yellow-500/50 text-yellow-600'
                              : undefined
                          }
                        >
                          {issue.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
        {audits.length > 1 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {audits.slice(0, 5).map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'font-bold',
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
