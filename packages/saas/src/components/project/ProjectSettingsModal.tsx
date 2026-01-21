import { useState } from 'react';
import { Settings, Trash2, Github, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Project {
  id: string;
  name: string;
  url: string;
  github_repo_url: string | null;
}

interface ProjectSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onUpdate: (updates: Partial<Project>) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onDisconnectGitHub: () => Promise<boolean>;
  error?: string | null;
}

export function ProjectSettingsModal({
  open,
  onOpenChange,
  project,
  onUpdate,
  onDelete,
  onDisconnectGitHub,
  error: externalError,
}: ProjectSettingsModalProps) {
  const [name, setName] = useState(project.name);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Use external error or local error
  const error = externalError || localError;

  const handleSave = async () => {
    if (name.trim() === project.name) return;

    setIsSaving(true);
    setLocalError(null);
    try {
      const success = await onUpdate({ name: name.trim() });
      if (success) {
        onOpenChange(false);
      } else {
        // Error was set in the hook, but we can show a generic message
        setLocalError('Failed to save changes. Please try again.');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    setIsSaving(true);
    try {
      await onDisconnectGitHub();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Project Settings
            </DialogTitle>
            <DialogDescription>
              Manage settings for {project.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setLocalError(null); // Clear error on input change
                }}
                disabled={isSaving}
              />
            </div>

            {/* URL (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="project-url">Website URL</Label>
              <Input
                id="project-url"
                value={project.url}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                URL cannot be changed. Create a new project to track a different site.
              </p>
            </div>

            {/* GitHub Connection */}
            {project.github_repo_url && (
              <div className="space-y-2">
                <Label>GitHub Repository</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{project.github_repo_url}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnectGitHub}
                    disabled={isSaving}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || name.trim() === project.name}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>

            {/* Danger Zone */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Deleting this project will remove all audit history and data.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{project.name}</strong> and all its audit history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
