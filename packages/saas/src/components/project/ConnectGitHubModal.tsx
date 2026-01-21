import { useState } from 'react';
import { Github, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConnectGitHubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  projectUrl: string;
  onConnect: (repoUrl: string) => Promise<void>;
}

// GitHub App installation URL - MUST be configured in environment
// Dev: https://github.com/apps/rankcli-dev
// Prod: https://github.com/apps/rankcli
const GITHUB_APP_URL = import.meta.env.VITE_GITHUB_APP_URL;

if (!GITHUB_APP_URL) {
  console.warn('VITE_GITHUB_APP_URL is not set. GitHub App installation link will not work.');
}

export function ConnectGitHubModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  projectUrl,
  onConnect,
}: ConnectGitHubModalProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateGitHubUrl = (url: string): boolean => {
    const pattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return pattern.test(url);
  };

  const handleConnect = async () => {
    setError(null);

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!validateGitHubUrl(repoUrl.trim())) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    setIsConnecting(true);
    try {
      await onConnect(repoUrl.trim());
      onOpenChange(false);
      setRepoUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect repository');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect GitHub Repository
          </DialogTitle>
          <DialogDescription>
            Connect a GitHub repository to {projectName} for automated SEO fixes and PR creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/your-org/your-repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isConnecting}
            />
            <p className="text-xs text-muted-foreground">
              Enter the full URL of your GitHub repository
            </p>
          </div>

          <div className="rounded-lg border p-4 bg-muted/30">
            <h4 className="text-sm font-medium mb-2">Need to install the GitHub App?</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {repoUrl.trim()
                ? 'Click below to install. Your repo URL will be saved and connected automatically after installation.'
                : 'Enter your repo URL above first, then click to install. The connection will complete automatically.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Validate repo URL if provided
                if (repoUrl.trim() && !validateGitHubUrl(repoUrl.trim())) {
                  setError('Please enter a valid GitHub repository URL first');
                  return;
                }

                // Save existing project context so callback can update it
                localStorage.setItem('pendingGitHubConnect', JSON.stringify({
                  projectId,
                  projectName,
                  projectUrl,
                  github_repo_url: repoUrl.trim() || undefined,
                }));
                window.location.href = GITHUB_APP_URL || '';
              }}
            >
              <Github className="h-4 w-4 mr-2" />
              Install &amp; Connect
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConnecting}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              'Connect Repository'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
