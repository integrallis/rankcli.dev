import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Share2,
  Bot,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { useAIVisibilitySSE } from '@/hooks/useAIVisibilitySSE';
import { supabase } from '@/integrations/supabase/client';

const PROVIDER_INFO: Record<string, { name: string; icon: string; color: string; configured: boolean }> = {
  openai: { name: 'ChatGPT', icon: '', color: 'bg-green-500', configured: true },
  anthropic: { name: 'Claude', icon: '', color: 'bg-orange-500', configured: true },
  google: { name: 'Gemini', icon: '', color: 'bg-blue-500', configured: true },
  perplexity: { name: 'Perplexity', icon: '', color: 'bg-purple-500', configured: false }, // Not configured in production
};

// Provider order for display
const PROVIDER_ORDER = ['openai', 'anthropic', 'google', 'perplexity'];

interface HistoricalCheck {
  id: string;
  created_at: string;
  overall_score: number;
  openai_mentioned: boolean;
  anthropic_mentioned: boolean;
  google_mentioned: boolean;
  perplexity_mentioned: boolean;
}

export function AIVisibilityCheckerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get project context from query params
  const projectId = searchParams.get('projectId');
  const domainParam = searchParams.get('domain');
  const brandParam = searchParams.get('brand');
  
  const [url, setUrl] = useState(domainParam ? `https://${domainParam}` : '');
  const [historicalChecks, setHistoricalChecks] = useState<HistoricalCheck[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Load historical checks if we have a projectId
  useEffect(() => {
    if (!projectId) return;
    
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await supabase
          .from('ai_visibility_checks')
          .select('id, created_at, overall_score, openai_mentioned, anthropic_mentioned, google_mentioned, perplexity_mentioned')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data) {
          setHistoricalChecks(data);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    
    loadHistory();
  }, [projectId]);

  const {
    status,
    progress,
    providers,
    overallScore,
    error,
    brand,
    checkVisibility,
    isLoading,
  } = useAIVisibilitySSE();

  const handleCheck = () => {
    if (!url) return;

    // Validate URL
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return;
    }

    checkVisibility(normalizedUrl);
  };

  const shareOnTwitter = () => {
    if (status !== 'completed') return;
    const mentionedCount = providers.filter(p => p.mentioned).length;
    const text = `My site ${brand} is visible in ${mentionedCount}/4 AI models! Check your AI visibility:`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://rankcli.dev/tools/ai-visibility')}`;
    window.open(shareUrl, '_blank');
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProviderIcon = (mentioned: boolean) => {
    if (mentioned) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    return <XCircle className="h-6 w-6 text-muted-foreground" />;
  };

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null;
    const colors = {
      positive: 'bg-green-500/20 text-green-600',
      neutral: 'bg-yellow-500/20 text-yellow-600',
      negative: 'bg-red-500/20 text-red-600',
    };
    return (
      <Badge className={colors[sentiment as keyof typeof colors] || ''}>
        {sentiment}
      </Badge>
    );
  };

  // Get providers in display order, including placeholders for pending ones
  const getDisplayProviders = () => {
    const providersMap = new Map(providers.map(p => [p.provider, p]));
    return PROVIDER_ORDER.map(id => providersMap.get(id) || null);
  };

  const displayProviders = getDisplayProviders();
  const completedProviders = providers.length;
  const isComplete = status === 'completed';
  const isFailed = status === 'failed';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Visibility Checker',
    description: 'Check if your website is recommended by AI assistants like ChatGPT, Claude, Gemini, and Perplexity.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Visibility Checker - Are You Visible to ChatGPT, Claude, Gemini? | RankCLI</title>
        <meta
          name="description"
          content="Check if your website is recommended by AI assistants like ChatGPT, Claude, Gemini, and Perplexity. Free AI visibility analysis."
        />
        <meta property="og:title" content="AI Visibility Checker | RankCLI" />
        <meta
          property="og:description"
          content="Check if AI assistants recommend your website. Test ChatGPT, Claude, Gemini, and Perplexity."
        />
        <meta property="og:image" content="https://rankcli.dev/og/ai-visibility.png" />
        <link rel="canonical" href="https://rankcli.dev/tools/ai-visibility" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Project Context Header */}
          {projectId && (
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/dashboard/projects/${projectId}`)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {brandParam || 'Project'}
              </Button>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Viewing AI visibility details for <strong>{brandParam}</strong> ({domainParam})
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            {!projectId && (
              <Badge variant="secondary" className="mb-4">
                Free Tool
              </Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {projectId ? `AI Visibility for ${brandParam}` : 'AI Visibility Checker'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {projectId 
                ? 'See how AI assistants recommend your brand across ChatGPT, Claude, and Gemini.'
                : 'Check if ChatGPT, Claude, Gemini, and Perplexity recommend your website. AI visibility is the new SEO battleground.'
              }
            </p>
          </div>

          {/* Input */}
          <div className="flex gap-2 mb-8">
            <Input
              type="url"
              placeholder="Enter your website URL (e.g., mysite.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleCheck} disabled={isLoading || !url}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check AI Visibility
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {error && isFailed && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 mb-8">
              {error}
            </div>
          )}

          {/* Loading State with Progress */}
          {isLoading && (
            <div className="text-center py-8 mb-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground mb-2">
                Checking {completedProviders}/4 AI providers...
              </p>
              <div className="w-64 mx-auto h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results - Show as they stream in */}
          {(isLoading || isComplete) && providers.length > 0 && (
            <div className="space-y-6">
              {/* Overall Score (only when complete) */}
              {isComplete && (
                <div className="p-8 rounded-xl border bg-card text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold">AI Visibility Score</h2>
                  </div>
                  <div className={`text-5xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
                    {overallScore}/100
                  </div>
                  <p className="text-muted-foreground">
                    {brand} is mentioned by{' '}
                    <strong>{providers.filter(p => p.mentioned).length}</strong> out of{' '}
                    <strong>4</strong> AI models
                  </p>

                  {/* Share Button */}
                  <div className="flex justify-center gap-3 mt-6">
                    <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Results
                    </Button>
                  </div>
                </div>
              )}

              {/* Provider Grid - Shows results as they stream */}
              <div className="grid md:grid-cols-2 gap-4">
                {displayProviders.map((provider, index) => {
                  const info = PROVIDER_INFO[PROVIDER_ORDER[index]];
                  const isPending = provider === null && isLoading;
                  const isChecked = provider !== null;

                  return (
                    <div
                      key={PROVIDER_ORDER[index]}
                      className={`p-6 rounded-xl border transition-all ${
                        isPending
                          ? 'bg-muted/20 animate-pulse'
                          : isChecked && provider.mentioned
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center`}>
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{info.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {!info.configured ? (
                                <span className="text-yellow-600">Not configured</span>
                              ) : isPending ? (
                                <span className="text-muted-foreground">Checking...</span>
                              ) : isChecked && provider.mentioned ? (
                                `Position #${provider.position || '?'}`
                              ) : isChecked ? (
                                'Not found'
                              ) : (
                                'Pending'
                              )}
                            </p>
                          </div>
                        </div>
                        {isPending ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : isChecked ? (
                          getProviderIcon(provider.mentioned)
                        ) : null}
                      </div>

                      {isChecked && provider.mentioned && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Sentiment:</span>
                            {getSentimentBadge(provider.sentiment)}
                          </div>
                          {provider.context && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              "{provider.context}"
                            </p>
                          )}
                        </div>
                      )}

                      {!info.configured && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>API not configured - check skipped</span>
                        </div>
                      )}

                      {info.configured && isChecked && !provider.mentioned && !provider.error && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Not mentioned in recommendations</span>
                        </div>
                      )}

                      {isChecked && provider.error && (
                        <div className="flex items-center gap-2 text-sm text-orange-500">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Could not check (API unavailable)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CTA (only when complete and not from project) */}
              {isComplete && !projectId && (
                <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <h3 className="text-lg font-semibold mb-2">Track Your AI Visibility Over Time</h3>
                  <p className="text-muted-foreground mb-4">
                    Get weekly reports on how AI models rank your brand. See trends, get alerts
                    when your position changes, and compare against competitors.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link to="/signup">
                      <Button>Start Tracking Free</Button>
                    </Link>
                    <Link to="/pricing">
                      <Button variant="outline">View Plans</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historical Checks (when viewing from project) */}
          {projectId && historicalChecks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Previous Checks</h2>
              <div className="space-y-2">
                {historicalChecks.map((check) => (
                  <div
                    key={check.id}
                    className="p-4 rounded-lg border bg-card flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Score: <span className={getScoreColor(check.overall_score)}>{check.overall_score}%</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(check.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {check.openai_mentioned && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-600">ChatGPT</Badge>
                      )}
                      {check.anthropic_mentioned && (
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-600">Claude</Badge>
                      )}
                      {check.google_mentioned && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">Gemini</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section (when no result and not loading) */}
          {status === 'idle' && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 text-center">
                Why Check AI Visibility?
              </h2>

              {/* Provider Icons */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                  <div key={key} className="text-center p-4 rounded-lg border bg-card">
                    <div className={`w-12 h-12 rounded-lg ${info.color} flex items-center justify-center mx-auto mb-2`}>
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-medium">{info.name}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'AI Traffic is Growing',
                    desc: 'Millions use AI assistants daily to discover products and services instead of Google.',
                  },
                  {
                    title: 'Zero-Click Answers',
                    desc: 'Users get recommendations directly without clicking through to search results.',
                  },
                  {
                    title: 'Brand Authority Signals',
                    desc: 'Being mentioned by AI builds credibility and drives qualified traffic.',
                  },
                  {
                    title: 'Early Mover Advantage',
                    desc: 'Most businesses don\'t track AI visibility. Get ahead while you can.',
                  },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-lg border bg-card">
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Tools */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">Also check out our other free tools:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/tools/chatgpt-checker">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  ChatGPT Checker
                </Button>
              </Link>
              <Link to="/tools/compare">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Competitor Analyzer
                </Button>
              </Link>
              <Link to="/free-audit">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Full SEO Audit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
