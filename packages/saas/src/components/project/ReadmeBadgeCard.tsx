import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';

// README score badge, served by the badge edge function. Opt-in: a badge publishes the
// project's score to anyone reading the README.
export function badgeUrl(projectId: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/badge?project=${projectId}`;
}

export function badgeMarkdown(projectId: string): string {
  return `[![RankCLI SEO score](${badgeUrl(projectId)})](https://rankcli.dev)`;
}

export function ReadmeBadgeCard({ projectId, initiallyEnabled }: { projectId: string; initiallyEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggle = async (next: boolean) => {
    setSaving(true);
    const { error } = await supabase.from('projects').update({ badge_enabled: next }).eq('id', projectId);
    setSaving(false);
    if (error) {
      toast.error('Could not update the badge', { description: error.message });
      return;
    }
    setEnabled(next);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(badgeMarkdown(projectId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">README badge</CardTitle>
            <CardDescription>Show this site's SEO score in your repository's README.</CardDescription>
          </div>
          <Switch
            checked={enabled}
            disabled={saving}
            onCheckedChange={toggle}
            aria-label="Publish the README badge"
          />
        </div>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-3">
          <img src={badgeUrl(projectId)} alt="RankCLI SEO score badge" height={20} />
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-muted px-2 py-1.5 font-mono text-xs">
              {badgeMarkdown(projectId)}
            </code>
            <Button variant="outline" size="sm" onClick={copy} aria-label="Copy badge Markdown">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Anyone who can read the README sees the score. It updates within an hour of each audit.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
