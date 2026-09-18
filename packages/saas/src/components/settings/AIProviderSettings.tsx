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

type Provider =
  | 'openai' | 'anthropic' | 'openrouter' | 'groq' | 'gemini' | 'perplexity'
  | 'deepseek' | 'together' | 'fireworks' | 'mistral' | 'cerebras'
  | 'custom';

// Providers whose model may be overridden, with the default shown as the placeholder. Defaults
// match the CLI and the edge functions (_shared/ai-provider.ts).
const MODEL_FIELD: Partial<Record<Provider, { required: boolean; example: string }>> = {
  openrouter: { required: false, example: 'openrouter/free (default) or e.g. openai/gpt-5.6-luna' },
  groq: { required: false, example: 'llama-3.3-70b-versatile (default)' },
  gemini: { required: false, example: 'gemini-3.7-flash (default)' },
  deepseek: { required: false, example: 'deepseek-flash (default)' },
  mistral: { required: false, example: 'mistral-small-latest (default)' },
  together: { required: false, example: 'openai/gpt-oss-120b (default)' },
  fireworks: { required: false, example: 'accounts/fireworks/models/gpt-oss-120b (default)' },
  cerebras: { required: false, example: 'gpt-oss-120b (default)' },
};

const PROVIDER_OPTIONS: { value: Provider; label: string; helpUrl: string; freeTierNote?: string }[] = [
  { value: 'openrouter', label: 'OpenRouter (recommended)', helpUrl: 'https://openrouter.ai/keys', freeTierNote: 'One key reaches ChatGPT, Claude, Gemini and Perplexity. Analysis defaults to openrouter/free - no cost to try' },
  { value: 'groq', label: 'Groq', helpUrl: 'https://console.groq.com/keys', freeTierNote: 'Free tier, no credit card required' },
  { value: 'gemini', label: 'Google Gemini', helpUrl: 'https://aistudio.google.com/apikey', freeTierNote: 'Free tier available via Google AI Studio' },
  { value: 'openai', label: 'OpenAI', helpUrl: 'https://platform.openai.com/api-keys' },
  { value: 'anthropic', label: 'Anthropic', helpUrl: 'https://console.anthropic.com/settings/keys' },
  { value: 'deepseek', label: 'DeepSeek', helpUrl: 'https://platform.deepseek.com/api_keys', freeTierNote: 'Among the cheapest capable models' },
  { value: 'mistral', label: 'Mistral', helpUrl: 'https://console.mistral.ai/api-keys' },
  { value: 'together', label: 'Together AI', helpUrl: 'https://api.together.ai/settings/api-keys', freeTierNote: 'Cheap open-weight models' },
  { value: 'fireworks', label: 'Fireworks AI', helpUrl: 'https://fireworks.ai/account/api-keys', freeTierNote: 'Cheap open-weight models' },
  { value: 'cerebras', label: 'Cerebras', helpUrl: 'https://cloud.cerebras.ai/', freeTierNote: 'Very fast inference, free tier available' },
  { value: 'perplexity', label: 'Perplexity', helpUrl: 'https://www.perplexity.ai/settings/api' },
  { value: 'custom', label: 'Custom OpenAI-compatible server (self-hosted, vLLM, a tunnel to Ollama/LM Studio)', helpUrl: 'https://github.com/ollama/ollama' },
];

interface StoredKeyMeta {
  provider: Provider;
  base_url: string | null;
  model: string | null;
  verified_at: string | null;
}

export function AIProviderSettings() {
  const { user } = useAuth();
  // One key per provider (user_ai_keys is unique on user + provider).
  const [stored, setStored] = useState<StoredKeyMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [removing, setRemoving] = useState<Provider | null>(null);

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
      .eq('user_id', user.id);
    setStored((data as StoredKeyMeta[] | null) || []);
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
    if (MODEL_FIELD[provider]?.required && !model.trim()) {
      toast.error(`${selectedOption?.label || provider} needs a model name`);
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

      toast.success(`${selectedOption?.label || provider} connected and verified`);
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

  const handleRemove = async (target: Provider) => {
    setRemoving(target);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-ai-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ provider: target }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to remove key');
      }
      toast.success('AI provider disconnected');
      setStored((prev) => prev.filter((k) => k.provider !== target));
    } catch (err) {
      toast.error('Could not disconnect AI provider', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Providers</CardTitle>
        <CardDescription>
          RankCLI's AI features run on your own keys, on every plan. We recommend OpenRouter: one
          key covers everything, and the AI visibility check asks ChatGPT, Claude, Gemini and
          Perplexity through it. Without OpenRouter, the visibility check asks each assistant with
          its own key, and auto-fix PRs, keyword research and audit analysis use the first of
          OpenAI, Anthropic, Gemini, Groq, Custom you've connected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
          {stored.length > 0 && (
            <div className="space-y-2">
              {stored.map((key) => (
                <div key={key.provider} className="p-4 rounded-lg bg-muted/50 border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {PROVIDER_OPTIONS.find((p) => p.value === key.provider)?.label || key.provider}
                      </span>
                      {key.verified_at && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Check className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    {key.model && (
                      <p className="text-xs text-muted-foreground mt-1">Model: {key.model}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemove(key.provider)}
                    disabled={removing !== null}
                    aria-label={`Disconnect ${key.provider}`}
                  >
                    {removing === key.provider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}

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

            {provider === 'custom' && (
              <p className="text-xs text-muted-foreground">
                Running Ollama or LM Studio on your machine? The hosted app can't reach localhost - run
                audits with the CLI instead (<code>rankcli audit --ai-provider ollama</code>), or expose
                the server through a tunnel and use its public URL here.
              </p>
            )}

            {MODEL_FIELD[provider] && (
              <div className="space-y-2">
                <Label htmlFor="ai-model-override">
                  {MODEL_FIELD[provider]!.required ? 'Model' : 'Model (optional override)'}
                </Label>
                <Input
                  id="ai-model-override"
                  placeholder={MODEL_FIELD[provider]!.example}
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
                stored.some((k) => k.provider === provider) ? 'Replace & Verify' : 'Connect & Verify'
              )}
            </Button>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
