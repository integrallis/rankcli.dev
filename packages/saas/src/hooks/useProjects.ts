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

      if (error) {
        // Check for unique constraint/index violation
        if (error.code === '23505' && (error.message?.includes('projects_user_id_name') || error.message?.includes('duplicate key'))) {
          throw new Error(`A project named "${input.name}" already exists. Please choose a different name.`);
        }
        throw error;
      }

      // Refetch to get updated list with stats
      await fetchProjects();

      return data;
    } catch (err) {
      console.error('Error creating project:', err);
      const message = err instanceof Error ? err.message : 'Failed to create project';
      setError(message);
      throw new Error(message);
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

      if (error) {
        // Check for unique constraint/index violation
        if (error.code === '23505' && (error.message?.includes('projects_user_id_name') || error.message?.includes('duplicate key'))) {
          throw new Error(`A project with this name already exists. Please choose a different name.`);
        }
        throw error;
      }

      await fetchProjects();
      return data;
    } catch (err) {
      console.error('Error updating project:', err);
      const message = err instanceof Error ? err.message : 'Failed to update project';
      setError(message);
      throw new Error(message);
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

// PR creation result type
interface CreatePRResult {
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  filesChanged?: number;
  issuesFixed?: number;
  error?: string;
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
  createFixPR: (auditId: string) => Promise<CreatePRResult>;
  deleteAudit: (auditId: string) => Promise<boolean>;
  deleteOldAudits: (keepCount?: number) => Promise<number>;
  updateProject: (updates: Partial<Project>) => Promise<boolean>;
  deleteProject: () => Promise<boolean>;
  connectGitHub: (repoUrl: string) => Promise<boolean>;
  disconnectGitHub: () => Promise<boolean>;
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
      // Check if user is on a paid plan
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('plan_id')
        .eq('user_id', user.id)
        .single();

      const isPaidUser = !!subscription?.plan_id;

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

      // Get project URL for paid user worker call
      const { data: projectData } = await supabase
        .from('projects')
        .select('url')
        .eq('id', projectId)
        .single();

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      // Environment-based worker URL (local in dev, Fly.io in prod)
      const workerUrl = import.meta.env.VITE_AUDIT_WORKER_URL || 'http://localhost:8080';
      const workerSecret = import.meta.env.VITE_AUDIT_WORKER_SECRET || 'dev-secret';

      if (isPaidUser && projectData?.url) {
        // Paid users: Call audit worker directly (Fly.io in prod, localhost in dev)
        console.log('Paid user - calling audit worker:', workerUrl);

        fetch(`${workerUrl}/audit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${workerSecret}`,
          },
          body: JSON.stringify({
            auditId: audit.id,
            projectId,
            url: projectData.url,
            maxPages: 10,
            checksLimit: 280,
            enableAI: true,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            console.error('Audit worker failed:', await res.text());
          }
          // SSE hook in the component will handle real-time updates
        }).catch((err) => {
          console.error('Audit worker request failed:', err);
          fetchProject();
        });
      } else if (token) {
        // Free users: Call edge function
        console.log('Free user - calling edge function');

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

  const createFixPR = async (auditId: string): Promise<CreatePRResult> => {
    if (!user || !projectId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        return { success: false, error: 'No auth token available' };
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-seo-pr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ auditId }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to create PR' };
      }

      if (result.prCreated) {
        // Refresh to update any PR-related data
        await fetchProject();
        return {
          success: true,
          prUrl: result.prUrl,
          prNumber: result.prNumber,
          filesChanged: result.filesChanged,
          issuesFixed: result.issuesFixed,
        };
      } else {
        return { success: false, error: result.message || 'PR not created' };
      }
    } catch (err) {
      console.error('Error creating fix PR:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create PR' };
    }
  };

  const updateProject = async (updates: Partial<Project>): Promise<boolean> => {
    if (!user || !projectId) return false;

    try {
      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        // Check for unique constraint violation (duplicate name)
        if (updateError.code === '23505' && (updateError.message?.includes('projects_user_id_name') || updateError.message?.includes('duplicate key'))) {
          throw new Error('A project with this name already exists. Please choose a different name.');
        }
        // Check for "no rows returned" error (RLS blocked or project not found)
        if (updateError.code === 'PGRST116') {
          throw new Error('Project not found or you do not have permission to update it.');
        }
        throw updateError;
      }

      if (!data) {
        throw new Error('Failed to update project. Please try again.');
      }

      await fetchProject();
      return true;
    } catch (err) {
      console.error('Error updating project:', err);
      const message = err instanceof Error ? err.message : 'Failed to update project';
      setError(message);
      return false;
    }
  };

  const deleteProject = async (): Promise<boolean> => {
    if (!user || !projectId) return false;

    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .update({ is_active: false })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    }
  };

  const connectGitHub = async (repoUrl: string): Promise<boolean> => {
    if (!user || !projectId) return false;

    try {
      const { error: connectError } = await supabase
        .from('projects')
        .update({ github_repo_url: repoUrl })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (connectError) throw connectError;

      await fetchProject();
      return true;
    } catch (err) {
      console.error('Error connecting GitHub:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect GitHub');
      return false;
    }
  };

  const disconnectGitHub = async (): Promise<boolean> => {
    if (!user || !projectId) return false;

    try {
      const { error: disconnectError } = await supabase
        .from('projects')
        .update({
          github_repo_url: null,
          github_repo_id: null,
          github_installation_id: null,
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (disconnectError) throw disconnectError;

      await fetchProject();
      return true;
    } catch (err) {
      console.error('Error disconnecting GitHub:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect GitHub');
      return false;
    }
  };

  const deleteAudit = async (auditId: string): Promise<boolean> => {
    if (!user || !projectId) {
      console.error('deleteAudit: No user or projectId', { user: !!user, projectId });
      return false;
    }

    // Prevent deleting the last audit to maintain score consistency
    if (audits.length <= 1) {
      setError('Cannot delete the only audit. Run a new audit first or delete the project.');
      return false;
    }

    try {
      // Delete in order: github_prs -> audit_issues -> audits (due to foreign key constraints)

      // 1. Delete associated github_prs
      const { error: prsError } = await supabase
        .from('github_prs')
        .delete()
        .eq('audit_id', auditId);

      if (prsError) throw new Error(`Failed to delete PRs: ${prsError.message}`);

      // 2. Delete associated issues
      const { error: issuesError } = await supabase
        .from('audit_issues')
        .delete()
        .eq('audit_id', auditId);

      if (issuesError) throw new Error(`Failed to delete issues: ${issuesError.message}`);

      // 3. Delete the audit
      const { data: deletedAudit, error: auditError } = await supabase
        .from('audits')
        .delete()
        .eq('id', auditId)
        .eq('project_id', projectId)
        .select();

      if (auditError) throw new Error(`Failed to delete audit: ${auditError.message}`);

      // Check if RLS blocked the delete (empty result = no rows deleted)
      if (!deletedAudit || deletedAudit.length === 0) {
        throw new Error('Audit not found or no permission to delete');
      }

      await fetchProject();
      return true;
    } catch (err) {
      console.error('Error deleting audit:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete audit');
      return false;
    }
  };

  const deleteOldAudits = async (keepCount: number = 5): Promise<number> => {
    if (!user || !projectId) return 0;

    try {
      // Get all audits sorted by date
      const { data: allAudits, error: fetchError } = await supabase
        .from('audits')
        .select('id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (!allAudits || allAudits.length <= keepCount) return 0;

      // Get IDs of audits to delete (all except the most recent keepCount)
      const auditsToDelete = allAudits.slice(keepCount);
      const idsToDelete = auditsToDelete.map(a => a.id);

      // Delete in order: github_prs -> audit_issues -> audits (due to foreign key constraints)

      // 1. Delete associated github_prs
      const { error: prsError } = await supabase
        .from('github_prs')
        .delete()
        .in('audit_id', idsToDelete);

      if (prsError) throw prsError;

      // 2. Delete associated issues
      const { error: issuesError } = await supabase
        .from('audit_issues')
        .delete()
        .in('audit_id', idsToDelete);

      if (issuesError) throw issuesError;

      // 3. Delete the audits
      const { error: auditsError } = await supabase
        .from('audits')
        .delete()
        .in('id', idsToDelete);

      if (auditsError) throw auditsError;

      await fetchProject();
      return idsToDelete.length;
    } catch (err) {
      console.error('Error deleting old audits:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete old audits');
      return 0;
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
    createFixPR,
    deleteAudit,
    deleteOldAudits,
    updateProject,
    deleteProject,
    connectGitHub,
    disconnectGitHub,
  };
}
