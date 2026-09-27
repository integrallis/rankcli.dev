import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { functionErrorMessage } from '@/lib/utils';
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
        })
        .select()
        .single();

      if (error) {
        // Check for unique constraint/index violation
        if (error.code === '23505' && (error.message?.includes('projects_user_id_name') || error.message?.includes('duplicate key'))) {
          throw new Error(`A project named "${input.name}" already exists. Please choose a different name.`);
        }
        // The database enforces the plan's site limit (enforce_project_site_limit) and
        // words the message for the user.
        if (error.hint === 'site_limit_reached') {
          throw new Error(error.message);
        }
        throw error;
      }

      // The repo can't be written on the row directly: connect-github-repo
      // links it after checking on GitHub that the user can write to it. The
      // project exists either way; the repo can be connected again later.
      if (input.github_repo_url) {
        const { data: link, error: linkError } = await supabase.functions.invoke<{ linked: boolean; reason?: string }>(
          'connect-github-repo',
          { body: { projectId: data.id, repoUrl: input.github_repo_url } }
        );
        if (linkError || !link?.linked) {
          console.warn('Project created, repository not connected:', linkError?.message || link?.reason);
        }
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
  /** The report needed no PR (already covered, or the repo already matches). Not a failure. */
  noop?: boolean;
  message?: string;
  code?: string;
  /** 'ai' with the user's key, 'gift' on RankCLI's, 'templates' with no model at all. */
  generatedBy?: 'ai' | 'gift' | 'templates';
  /** PRs this report has already opened, and how many it may. */
  prsForReport?: number;
  prsAllowedForReport?: number;
  prUrls?: string[];
  unchangedFiles?: string[];
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
  connectGitHub: (repoUrl: string) => Promise<{ success: boolean; linked: boolean; reason?: string }>;
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
      // The start-deep-audit edge function creates the audit, works out the plan's audit
      // depth, and hands the job to the worker with the secret held server-side (it used
      // to be built into this bundle). The worker enforces the per-plan domain and
      // schedule limits and streams progress to the SSE hook in the component.
      const { data, error: fnError } = await supabase.functions.invoke('start-deep-audit', {
        body: { projectId },
      });
      if (fnError) throw new Error(await functionErrorMessage(fnError, 'Failed to start audit'));

      // worker_instance routes the progress stream to the machine running this audit.
      const audit = { ...(data.audit as Audit), worker_instance: data.workerInstance ?? null };

      // Refresh to show pending state
      await fetchProject();

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

      const allowance = {
        prsForReport: result.prsForReport,
        prsAllowedForReport: result.prsAllowedForReport,
        prUrls: result.prUrls,
      };

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to create PR', code: result.code, ...allowance };
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
          unchangedFiles: result.unchangedFiles,
          generatedBy: result.generatedBy,
          ...allowance,
        };
      }

      // No PR, no failure: the repo already matches the report, or every fixable issue
      // is in a PR already. Reported as a no-op so the UI doesn't cry wolf.
      return {
        success: true,
        noop: true,
        message: result.message || 'Nothing to change',
        ...allowance,
      };
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

  const connectGitHub = async (repoUrl: string): Promise<{ success: boolean; linked: boolean; reason?: string }> => {
    if (!user || !projectId) return { success: false, linked: false };

    try {
      // Resolves the installation covering this repo (not just the repo
      // URL) - create-seo-pr needs github_installation_id set to ever open
      // an auto-fix PR, and that never happens from a plain URL alone.
      const { data, error: connectError } = await supabase.functions.invoke<{
        linked: boolean;
        reason?: string;
      }>('connect-github-repo', {
        body: { projectId, repoUrl },
      });

      if (connectError) throw connectError;

      if (data && !data.linked) {
        setError(data.reason || 'RankCLI GitHub App is not installed on this repository yet');
      }

      await fetchProject();
      return { success: true, linked: data?.linked ?? false, reason: data?.reason };
    } catch (err) {
      console.error('Error connecting GitHub:', err);
      const message = err instanceof Error ? err.message : 'Failed to connect GitHub';
      setError(message);
      return { success: false, linked: false, reason: message };
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
