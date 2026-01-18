import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Globe, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AddProjectModal } from '@/components/dashboard/AddProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuth();
  const { projects, isLoading, error, createProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground border-muted bg-muted/50';
    if (score >= 80) return 'text-green-500 border-green-500/20 bg-green-500/10';
    if (score >= 60) return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
    return 'text-red-500 border-red-500/20 bg-red-500/10';
  };

  const formatLastAudit = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return d.toLocaleDateString();
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalErrors = projects.reduce((sum, p) => sum + (p.issues_count?.errors || 0), 0);
  const avgScore =
    projects.length > 0
      ? Math.round(
          projects.filter((p) => p.last_audit_score !== null).reduce((sum, p) => sum + (p.last_audit_score || 0), 0) /
            projects.filter((p) => p.last_audit_score !== null).length || 0
        )
      : 0;

  const handleCreateProject = async (data: { name: string; url: string; github_repo_url?: string }) => {
    await createProject(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email?.split('@')[0] || 'Developer'}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-sm text-muted-foreground">Active Sites</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalErrors}</p>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgScore || '-'}</p>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {projects.filter((p) => p.last_audit_at).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Audited Sites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-500/50">
            <CardContent className="py-6 text-center">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && projects.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="p-4 rounded-full bg-muted inline-block mb-4">
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first website to start monitoring its SEO health.
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Project
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} to={`/dashboard/projects/${project.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                        <CardDescription className="truncate">{project.url}</CardDescription>
                      </div>
                      <div
                        className={cn(
                          'px-3 py-1.5 rounded-lg border font-bold text-lg ml-4',
                          getScoreColor(project.last_audit_score)
                        )}
                      >
                        {project.last_audit_score ?? '-'}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {project.issues_count.errors > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          {project.issues_count.errors} error{project.issues_count.errors !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {project.issues_count.warnings > 0 && (
                        <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-600">
                          {project.issues_count.warnings} warning{project.issues_count.warnings !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {project.issues_count.errors === 0 && project.issues_count.warnings === 0 && project.last_audit_at && (
                        <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600">
                          All clear
                        </Badge>
                      )}
                      {!project.last_audit_at && (
                        <Badge variant="outline">Not audited</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Last audit: {formatLastAudit(project.last_audit_at)}</span>
                      {project.framework && (
                        <Badge variant="secondary" className="text-xs">
                          {project.framework}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Add Project Card */}
            <Card
              className="border-dashed hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center min-h-[200px]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <CardContent className="text-center py-8">
                <div className="p-4 rounded-full bg-muted inline-block mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium">Add New Project</p>
                <p className="text-sm text-muted-foreground">Monitor a new website</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No search results */}
        {!isLoading && !error && projects.length > 0 && filteredProjects.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No projects match "{searchQuery}"
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add Project Modal */}
      <AddProjectModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
