import { useState } from 'react';
import { Loader2, Plus, Trash2, TestTube, Check, X, Slack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
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
import { useAlertConfigs, type AlertConfig, type AlertChannel, type NewAlertConfig } from '@/hooks/useAlertConfigs';
import { cn } from '@/lib/utils';

// Discord icon component
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

interface AlertConfigFormProps {
  projectId?: string;
}

export function AlertConfigForm({ projectId }: AlertConfigFormProps) {
  const {
    configs,
    isLoading,
    error,
    addConfig,
    updateConfig,
    deleteConfig,
    testWebhook,
  } = useAlertConfigs(projectId);

  const [isAdding, setIsAdding] = useState(false);
  const [newChannel, setNewChannel] = useState<AlertChannel>('slack');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newOnError, setNewOnError] = useState(true);
  const [newOnScoreDrop, setNewOnScoreDrop] = useState(true);
  const [newOnWeeklyReport, setNewOnWeeklyReport] = useState(false);
  const [newOnPrCreated, setNewOnPrCreated] = useState(true);
  const [newScoreDropThreshold, setNewScoreDropThreshold] = useState(10);
  
  const [isSaving, setIsSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddConfig = async () => {
    setIsSaving(true);
    const newConfig: NewAlertConfig = {
      channel: newChannel,
      webhook_url: newWebhookUrl,
      on_error: newOnError,
      on_score_drop: newOnScoreDrop,
      on_weekly_report: newOnWeeklyReport,
      on_pr_created: newOnPrCreated,
      score_drop_threshold: newScoreDropThreshold,
    };

    const success = await addConfig(newConfig);
    
    if (success) {
      // Reset form
      setNewWebhookUrl('');
      setIsAdding(false);
    }
    
    setIsSaving(false);
  };

  const handleTestWebhook = async (config: AlertConfig) => {
    setTestingId(config.id);
    setTestResult(null);
    
    const success = await testWebhook(config.channel, config.webhook_url);
    
    setTestResult({ id: config.id, success });
    setTestingId(null);
    
    // Clear result after 3 seconds
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleToggleEnabled = async (config: AlertConfig) => {
    await updateConfig(config.id, { enabled: !config.enabled });
  };

  const handleDeleteConfig = async (id: string) => {
    setDeletingId(id);
    await deleteConfig(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Webhook Notifications</CardTitle>
          <CardDescription>
            Receive alerts in Slack or Discord when SEO events occur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Existing configs */}
          {configs.length === 0 && !isAdding ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No webhooks configured. Add one to receive notifications.
            </p>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className={cn(
                    'p-4 rounded-lg border',
                    !config.enabled && 'opacity-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {config.channel === 'slack' ? (
                        <Slack className="h-5 w-5 text-[#4A154B]" />
                      ) : (
                        <DiscordIcon className="h-5 w-5 text-[#5865F2]" />
                      )}
                      <span className="font-medium capitalize">{config.channel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={() => handleToggleEnabled(config)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTestWebhook(config)}
                        disabled={testingId === config.id || !config.enabled}
                      >
                        {testingId === config.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : testResult?.id === config.id ? (
                          testResult.success ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmDeleteId(config.id)}
                        disabled={deletingId === config.id}
                      >
                        {deletingId === config.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2 font-mono truncate">
                    {config.webhook_url.substring(0, 50)}...
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {config.on_error && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-xs">
                        Errors
                      </span>
                    )}
                    {config.on_score_drop && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs">
                        Score Drop (≥{config.score_drop_threshold}pts)
                      </span>
                    )}
                    {config.on_weekly_report && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs">
                        Weekly Report
                      </span>
                    )}
                    {config.on_pr_created && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs">
                        PR Created
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new config form */}
          {isAdding ? (
            <div className="p-4 rounded-lg border border-dashed space-y-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select 
                  value={newChannel} 
                  onChange={(e) => setNewChannel(e.target.value as AlertChannel)}
                >
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder={
                    newChannel === 'slack'
                      ? 'https://hooks.slack.com/services/...'
                      : 'https://discord.com/api/webhooks/...'
                  }
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {newChannel === 'slack' ? (
                    <>Create a webhook at <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="underline">api.slack.com/apps</a></>
                  ) : (
                    <>Create a webhook in Discord channel settings → Integrations</>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Alert on:</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="on-error" className="font-normal">Critical errors detected</Label>
                    <Switch id="on-error" checked={newOnError} onCheckedChange={setNewOnError} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="on-score-drop" className="font-normal">Score drops</Label>
                    <Switch id="on-score-drop" checked={newOnScoreDrop} onCheckedChange={setNewOnScoreDrop} />
                  </div>
                  {newOnScoreDrop && (
                    <div className="flex items-center gap-2 ml-4">
                      <Label htmlFor="threshold" className="font-normal text-sm">Minimum drop:</Label>
                      <Input
                        id="threshold"
                        type="number"
                        min={1}
                        max={100}
                        value={newScoreDropThreshold}
                        onChange={(e) => setNewScoreDropThreshold(parseInt(e.target.value) || 10)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="on-weekly" className="font-normal">Weekly reports</Label>
                    <Switch id="on-weekly" checked={newOnWeeklyReport} onCheckedChange={setNewOnWeeklyReport} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="on-pr" className="font-normal">Fix PRs created</Label>
                    <Switch id="on-pr" checked={newOnPrCreated} onCheckedChange={setNewOnPrCreated} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddConfig} disabled={!newWebhookUrl || isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Add Webhook'
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAdding(true)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this webhook configuration. You will no longer receive notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && handleDeleteConfig(confirmDeleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
