import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, Check, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Provider = 'openai' | 'anthropic' | 'openrouter' | 'groq' | 'gemini' | 'custom';

const PROVIDER_OPTIONS: { value: Provider; label: string; helpUrl: string; freeTierNote?: string }[] = [
  { value: 'openrouter', label: 'OpenRouter', helpUrl: 'https://openrouter.ai/keys', freeTierNote: 'Free models available (e.g. DeepSeek R1) - no cost to try' },
  { value: 'groq', label: 'Groq', helpUrl: 'https://console.groq.com/keys', freeTierNote: 'Free tier, no credit card required' },
  { value: 'gemini', label: 'Google Gemini', helpUrl: 'https://aistudio.google.com/apikey', freeTierNote: 'Free tier available via Google AI Studio' },
  { value: 'openai', label: 'OpenAI', helpUrl: 'https://platform.openai.com/api-keys' },
  { value: 'anthropic', label: 'Anthropic', helpUrl: 'https://console.anthropic.com/settings/keys' },
  { value: 'custom', label: 'Custom (self-hosted / Ollama / LM Studio / vLLM)', helpUrl: 'https://github.com/ollama/ollama' },
];

interface StoredKeyMeta {
  provider: Provider;
  base_url: string | null;
  model: string | null;
  verified_at: string | null;
}

export function AIProviderSettings() {
  const { user } = useAuth();
  const [stored, setStored] = useState<StoredKeyMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [provider, setProvider] = useState<Provider>('openrouter');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');

  const fetchStored = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    // Never select encrypted_key - the UI only needs to know a key exists
    // and its metadata, never the secret itself.
    const { data } = await supabase
      .from('user_ai_keys')
      .select('provider, base_url, model, verified_at')
      .eq('user_id', user.id)
      .maybeSingle();
    setStored(data as StoredKeyMeta | null);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStored();
  }, [fetchStored]);

  const selectedOption = PROVIDER_OPTIONS.find((p) => p.value === provider);

  const handleSave = async () => {
    if (provider !== 'custom' && !apiKey.trim()) {
      toast.error('Enter an API key');
      return;
    }
    if (provider === 'custom' && (!baseUrl.trim() || !model.trim())) {
      toast.error('Custom providers need both a base URL and a model name');
      return;
    }

    setIsSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-ai-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim() || undefined,
          baseUrl: baseUrl.trim() || undefined,
          model: model.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to save key');
      }

      toast.success('AI provider connected and verified');
      setApiKey('');
      setBaseUrl('');
      setModel('');
      await fetchStored();
    } catch (err) {
      toast.error('Could not connect AI provider', {
        description: err instanceof Error ? err.message : 'Please check the key and try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-ai-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to remove key');
      }
      toast.success('AI provider disconnected');
      setStored(null);
    } catch (err) {
      toast.error('Could not disconnect AI provider', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider</CardTitle>
        <CardDescription>
          Auto-fix PRs need an LLM to generate the code changes. Connect any provider below - we
          never bill our own inference to your account, so the free plan works too. OpenRouter, Groq,
          and Gemini all offer genuinely free tiers with no card required, which matters most if
          US-dollar API pricing hits harder where you are.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : stored ? (
          <div className="p-4 rounded-lg bg-muted/50 border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {PROVIDER_OPTIONS.find((p) => p.value === stored.provider)?.label || stored.provider}
                </span>
                {stored.verified_at && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Check className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              {stored.model && (
                <p className="text-xs text-muted-foreground mt-1">Model: {stored.model}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
              >
                {PROVIDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {selectedOption?.freeTierNote && (
                <p className="text-xs text-green-600 dark:text-green-400">{selectedOption.freeTierNote}</p>
              )}
              {selectedOption && (
                <a
                  href={selectedOption.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  Get a key <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {provider !== 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="ai-key">API Key</Label>
                <Input
                  id="ai-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            )}

            {provider === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ai-base-url">Base URL</Label>
                  <Input
                    id="ai-base-url"
                    placeholder="http://localhost:11434/v1"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-model">Model</Label>
                  <Input
                    id="ai-model"
                    placeholder="llama3.1"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-key-optional">API Key (optional - local servers often don't need one)</Label>
                  <Input
                    id="ai-key-optional"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </>
            )}

            {(provider === 'openrouter' || provider === 'groq' || provider === 'gemini') && (
              <div className="space-y-2">
                <Label htmlFor="ai-model-override">Model (optional override)</Label>
                <Input
                  id="ai-model-override"
                  placeholder="Leave blank to use our recommended default"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            )}

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Connect & Verify'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
