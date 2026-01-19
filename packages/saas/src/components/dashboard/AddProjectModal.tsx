import { useState } from 'react';
import { Loader2, Globe, Github, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; url: string; github_repo_url?: string }) => Promise<void>;
}

export function AddProjectModal({ open, onOpenChange, onSubmit }: AddProjectModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  const resetForm = () => {
    setStep(1);
    setName('');
    setUrl('');
    setGithubUrl('');
    setError(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const validateUrl = (input: string): string | null => {
    try {
      const urlToTest = input.startsWith('http') ? input : `https://${input}`;
      new URL(urlToTest);
      return urlToTest;
    } catch {
      return null;
    }
  };

  const handleUrlBlur = () => {
    if (url && !name) {
      // Auto-fill name from domain
      const validUrl = validateUrl(url);
      if (validUrl) {
        try {
          const domain = new URL(validUrl).hostname.replace('www.', '');
          setName(domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1));
        } catch {
          // Ignore
        }
      }
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validUrl = validateUrl(url);
    if (!validUrl) {
      setError('Please enter a valid URL');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (skipGithub: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const validUrl = validateUrl(url);
      if (!validUrl) {
        setError('Invalid URL');
        return;
      }

      await onSubmit({
        name: name.trim(),
        url: validUrl,
        github_repo_url: skipGithub ? undefined : githubUrl || undefined,
      });

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 1 ? (
              <>
                <Globe className="h-5 w-5" />
                Add New Project
              </>
            ) : (
              <>
                <Github className="h-5 w-5" />
                Connect GitHub (Optional)
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Enter your website URL to start monitoring its SEO health.'
              : 'Connect a GitHub repository to enable auto-fix PRs.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleStep1Submit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  placeholder="example.com or https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  autoFocus
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Website"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Continue
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4">
            <div className="grid gap-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-muted-foreground">{url}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="github">GitHub Repository URL</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/username/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Connect to enable automatic fix PRs (Pro plan required for auto-fix)
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Github className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">GitHub App not installed?</p>
                  <p className="text-xs text-muted-foreground">
                    You can connect later from project settings.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://github.com/apps/rankcli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-1"
                  >
                    Install
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleFinalSubmit(true)}
                disabled={isLoading}
              >
                Skip for now
              </Button>
              <Button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
