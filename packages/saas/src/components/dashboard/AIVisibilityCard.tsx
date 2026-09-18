import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  TrendingUp,
  ExternalLink,
  KeyRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { functionErrorMessage } from '@/lib/utils';

interface ProviderStatus {
  provider: string;
  name: string;
  // Checks run on the user's own key per provider: not_checked means no key for that
  // assistant, error means the call failed. Rows saved before this have no status.
  status?: 'checked' | 'not_checked' | 'error';
  error?: string;
  mentioned: boolean;
  position: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
}

interface AIVisibilityCardProps {
  projectId: string;
  domain: string;
  brand: string;
  initialData?: {
    score: number;
    providers: ProviderStatus[];
    lastChecked: string;
    question?: string;
  };
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: 'bg-green-500',
  anthropic: 'bg-orange-500',
  google: 'bg-blue-500',
  perplexity: 'bg-purple-500',
};

export function AIVisibilityCard({
  projectId,
  domain,
  brand,
  initialData,
}: AIVisibilityCardProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(!initialData);

  // Fetch latest check on mount if no initial data
  useEffect(() => {
    if (initialData || !projectId) return;

    const fetchLatest = async () => {
      try {
        const { data: latestCheck } = await supabase
          .from('ai_visibility_checks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (latestCheck) {
          // Parse providers from JSONB or reconstruct from columns
          const providers = latestCheck.providers || [
            { provider: 'openai', name: 'ChatGPT', mentioned: latestCheck.openai_mentioned, position: latestCheck.openai_position, sentiment: null },
            { provider: 'anthropic', name: 'Claude', mentioned: latestCheck.anthropic_mentioned, position: latestCheck.anthropic_position, sentiment: null },
            { provider: 'google', name: 'Gemini', mentioned: latestCheck.google_mentioned, position: latestCheck.google_position, sentiment: null },
            { provider: 'perplexity', name: 'Perplexity', mentioned: latestCheck.perplexity_mentioned, position: latestCheck.perplexity_position, sentiment: null },
          ];

          setData({
            score: latestCheck.overall_score,
            providers,
            lastChecked: latestCheck.created_at,
            question: latestCheck.queries_tested?.[0],
          });
        }
      } catch (err) {
        // No previous check found, that's fine
        console.log('No previous AI visibility check found');
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchLatest();
  }, [projectId, initialData]);

  const checkVisibility = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke(
        'check-ai-visibility',
        {
          body: { url: `https://${domain}`, projectId },
        }
      );

      if (fnError) throw fnError;

      setData({
        score: result.overallScore,
        providers: (result.providers as ProviderStatus[]).map((p) => ({
          provider: p.provider,
          name: p.name,
          status: p.status,
          error: p.error,
          mentioned: p.mentioned,
          position: p.position,
          sentiment: p.sentiment,
        })),
        lastChecked: new Date().toISOString(),
        question: result.queries_tested?.[0],
      });
    } catch (err) {
      console.error('AI visibility check error:', err);
      setError(await functionErrorMessage(err, 'Failed to check AI visibility'));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Only assistants actually asked count - not_checked and error are neither a mention nor a miss.
  const askedProviders = data?.providers.filter((p) => !p.status || p.status === 'checked') || [];
  const mentionedCount = askedProviders.filter((p) => p.mentioned).length;
  const totalProviders = askedProviders.length;
  const missingKeys = data?.providers.some((p) => p.status === 'not_checked') ?? false;
  const needsKey = !!error && error.includes('Connect an AI provider key');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5" />
            AI Visibility
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkVisibility}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && !needsKey && (
          <div className="text-sm text-red-500 mb-4">{error}</div>
        )}
        {needsKey && (
          <div className="text-sm mb-4 space-y-2">
            <p className="text-muted-foreground">
              AI visibility checks run on your own keys. One OpenRouter key asks ChatGPT, Claude,
              Gemini and Perplexity; or connect each provider's key.
            </p>
            <Link to="/account?tab=ai-provider">
              <Button size="sm" variant="outline"><KeyRound className="h-4 w-4 mr-2" />Connect AI keys</Button>
            </Link>
          </div>
        )}

        {!data && !loading && !isLoadingInitial && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Check if AI assistants recommend {brand}
            </p>
            <Button onClick={checkVisibility} size="sm">
              <Bot className="h-4 w-4 mr-2" />
              Check AI Visibility
            </Button>
          </div>
        )}

        {(loading || isLoadingInitial) && !data && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">
              {loading ? 'Asking AI assistants...' : 'Loading...'}
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-3xl font-bold ${getScoreColor(data.score)}`}>
                  {data.score}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Mentioned in {mentionedCount}/{totalProviders} AI models asked
                </p>
                {missingKeys && (
                  <Link to="/account?tab=ai-provider" className="text-xs text-primary hover:underline">
                    Add keys to check the rest
                  </Link>
                )}
              </div>
              {mentionedCount > 0 && (
                <TrendingUp className="h-6 w-6 text-green-500" />
              )}
            </div>

            {/* Provider Status */}
            <div className="grid grid-cols-2 gap-2">
              {data.providers.map((provider) => (
                <div
                  key={provider.provider}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    provider.mentioned ? 'bg-green-500/10' : 'bg-muted/50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center ${
                      PROVIDER_COLORS[provider.provider] || 'bg-gray-500'
                    }`}
                  >
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{provider.name}</p>
                    <p className="text-xs text-muted-foreground truncate" title={provider.error}>
                      {provider.status === 'not_checked'
                        ? 'Not checked - no key'
                        : provider.status === 'error'
                          ? 'Error - see key'
                          : provider.mentioned
                            ? provider.position
                              ? `#${provider.position}`
                              : 'Mentioned'
                            : 'Not found'}
                    </p>
                  </div>
                  {provider.status === 'not_checked' || provider.status === 'error' ? (
                    <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : provider.mentioned ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {data.question && (
              <p className="text-xs text-muted-foreground" title="The question never names your brand, so a mention is a real recommendation">
                Asked: "{data.question}"
              </p>
            )}

            {/* Last Checked */}
            {data.lastChecked && (
              <p className="text-xs text-muted-foreground text-center">
                Last checked:{' '}
                {new Date(data.lastChecked).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Link 
                to={`/tools/ai-visibility?projectId=${projectId}&domain=${encodeURIComponent(domain)}&brand=${encodeURIComponent(brand)}`} 
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </Link>
              <Link 
                to={`/tools/chatgpt-checker?url=${encodeURIComponent(`https://${domain}`)}&brand=${encodeURIComponent(brand)}`} 
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full">
                  ChatGPT Check
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
