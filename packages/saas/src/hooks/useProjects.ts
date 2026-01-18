import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, Audit, AuditIssue, CreateProjectInput, UpdateProjectInput } from '@/integrations/supabase/types';

interface ProjectWithStats extends Project {
  issues_count: {
    errors: number;
    warnings: number;
    notices: number;
  };
}

interface UseProjectsReturn {
  projects: ProjectWithStats[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project | null>;
  updateProject: (id: string, input: UpdateProjectInput) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
}

export function useProjects(): UseProjectsReturn {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch projects with latest audit
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          audits (
            id,
            score,
            status,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // For each project, get issue counts from latest completed audit
      const projectsWithStats: ProjectWithStats[] = await Promise.all(
        (projectsData || []).map(async (project) => {
          // Find latest completed audit
          const latestAudit = (project.audits as Audit[])
            ?.filter((a) => a.status === 'completed')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

          let issuesCount = { errors: 0, warnings: 0, notices: 0 };

          if (latestAudit) {
            const { data: issues } = await supabase
              .from('audit_issues')
              .select('severity')
              .eq('audit_id', latestAudit.id)
              .eq('status', 'open');

            if (issues) {
              issuesCount = {
                errors: issues.filter((i) => i.severity === 'error').length,
                warnings: issues.filter((i) => i.severity === 'warning').length,
                notices: issues.filter((i) => i.severity === 'notice').length,
              };
            }
          }

          // Remove audits from project object (we only needed it for the query)
          const { audits: _, ...projectWithoutAudits } = project;

          return {
            ...projectWithoutAudits,
            issues_count: issuesCount,
          } as ProjectWithStats;
        })
      );

      setProjects(projectsWithStats);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (input: CreateProjectInput): Promise<Project | null> => {
    if (!user) return null;

    try {
      // Extract domain from URL
      const url = new URL(input.url.startsWith('http') ? input.url : `https://${input.url}`);
      const domain = url.hostname;

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: input.name,
          url: url.toString(),
          domain,
          github_repo_url: input.github_repo_url || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Refetch to get updated list with stats
      await fetchProjects();

      return data;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  };

  const updateProject = async (id: string, input: UpdateProjectInput): Promise<Project | null> => {
    if (!user) return null;

    try {
      const updateData: Record<string, unknown> = { ...input };

      // If URL is being updated, also update domain
      if (input.url) {
        const url = new URL(input.url.startsWith('http') ? input.url : `https://${input.url}`);
        updateData.url = url.toString();
        updateData.domain = url.hostname;
      }

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchProjects();
      return data;
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProjects();
      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    }
  };

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

// Hook for single project with full details
interface UseProjectReturn {
  project: Project | null;
  audits: Audit[];
  issues: AuditIssue[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  runAudit: () => Promise<Audit | null>;
}

export function useProject(projectId: string | undefined): UseProjectReturn {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!user || !projectId) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch audits
      const { data: auditsData, error: auditsError } = await supabase
        .from('audits')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (auditsError) throw auditsError;
      setAudits(auditsData || []);

      // Fetch issues from latest completed audit
      const latestAudit = auditsData?.find((a) => a.status === 'completed');
      if (latestAudit) {
        const { data: issuesData, error: issuesError } = await supabase
          .from('audit_issues')
          .select('*')
          .eq('audit_id', latestAudit.id)
          .order('severity', { ascending: true });

        if (issuesError) throw issuesError;
        setIssues(issuesData || []);
      } else {
        setIssues([]);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const runAudit = async (): Promise<Audit | null> => {
    if (!user || !projectId) return null;

    try {
      // Create pending audit record
      const { data: audit, error: auditError } = await supabase
        .from('audits')
        .insert({
          project_id: projectId,
          triggered_by: 'manual',
          triggered_by_user: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (auditError) throw auditError;

      // Refresh to show pending state
      await fetchProject();

      // Call edge function to run the audit
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (token) {
        // Call in background - don't await
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-audit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ auditId: audit.id }),
        }).then(async (res) => {
          if (!res.ok) {
            console.error('Audit failed:', await res.text());
          }
          // Refresh after audit completes
          fetchProject();
        }).catch((err) => {
          console.error('Audit request failed:', err);
          fetchProject();
        });
      }

      return audit;
    } catch (err) {
      console.error('Error running audit:', err);
      setError(err instanceof Error ? err.message : 'Failed to start audit');
      return null;
    }
  };

  return {
    project,
    audits,
    issues,
    isLoading,
    error,
    refetch: fetchProject,
    runAudit,
  };
}
