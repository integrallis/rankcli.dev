import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PendingProject {
  name: string;
  url: string;
  github_repo_url?: string;
}

interface PendingGitHubConnect {
  projectId: string;
  projectName: string;
  projectUrl: string;
  github_repo_url?: string;
}

export function GitHubCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing GitHub installation...');

  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');

  useEffect(() => {
    async function handleCallback() {
      if (!user) {
        setStatus('error');
        setMessage('You must be logged in to complete this action.');
        return;
      }

      if (!installationId) {
        setStatus('error');
        setMessage('No installation ID received from GitHub.');
        return;
      }

      try {
        // Check for pending project creation (from AddProjectModal)
        const pendingProjectJson = localStorage.getItem('pendingProject');
        const pendingProject: PendingProject | null = pendingProjectJson
          ? JSON.parse(pendingProjectJson)
          : null;

        // Check for pending GitHub connect (from ConnectGitHubModal - existing project)
        const pendingConnectJson = localStorage.getItem('pendingGitHubConnect');
        const pendingConnect: PendingGitHubConnect | null = pendingConnectJson
          ? JSON.parse(pendingConnectJson)
          : null;

        if (pendingProject) {
          // Case 1: Create new project with GitHub installation
          setMessage('Creating your project...');

          // Extract domain from URL
          let domain = '';
          try {
            const urlObj = new URL(pendingProject.url);
            domain = urlObj.hostname.replace('www.', '');
          } catch {
            domain = pendingProject.name.toLowerCase().replace(/\s+/g, '-');
          }

          const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
              user_id: user.id,
              name: pendingProject.name,
              url: pendingProject.url,
              domain: domain,
              github_repo_url: pendingProject.github_repo_url || null,
              github_installation_id: parseInt(installationId, 10),
            })
            .select()
            .single();

          if (projectError) {
            throw projectError;
          }

          // Clear pending project
          localStorage.removeItem('pendingProject');

          setStatus('success');
          setMessage('Project created and GitHub connected!');

          // Redirect to project page after a short delay
          setTimeout(() => {
            navigate(`/dashboard/projects/${project.id}`);
          }, 1500);

        } else if (pendingConnect) {
          // Case 2: Connect GitHub to existing project
          setMessage('Connecting GitHub to your project...');

          const { error: updateError } = await supabase
            .from('projects')
            .update({
              github_installation_id: parseInt(installationId, 10),
              github_repo_url: pendingConnect.github_repo_url || null,
            })
            .eq('id', pendingConnect.projectId)
            .eq('user_id', user.id);

          if (updateError) {
            throw updateError;
          }

          // Clear pending connect
          localStorage.removeItem('pendingGitHubConnect');

          setStatus('success');
          setMessage('GitHub connected to your project!');

          // Redirect to project page after a short delay
          setTimeout(() => {
            navigate(`/dashboard/projects/${pendingConnect.projectId}`);
          }, 1500);

        } else {
          // No pending project - just note the installation was successful
          // The webhook will handle storing the installation details
          setStatus('success');
          setMessage('GitHub App installed! You can now connect repositories to your projects.');

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('GitHub callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to process GitHub installation.');
      }
    }

    handleCallback();
  }, [user, installationId, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-16">
        <div className="max-w-md mx-auto text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <h1 className="text-xl font-semibold mb-2">Setting up GitHub</h1>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h1 className="text-xl font-semibold mb-2">Success!</h1>
              <p className="text-muted-foreground mb-4">{message}</p>
              <p className="text-sm text-muted-foreground">Redirecting...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
