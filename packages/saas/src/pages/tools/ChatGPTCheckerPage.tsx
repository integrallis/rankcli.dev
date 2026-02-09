import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
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
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { useAIVisibilitySSE } from '@/hooks/useAIVisibilitySSE';

export function ChatGPTCheckerPage() {
  const [searchParams] = useSearchParams();
  const urlParam = searchParams.get('url');
  const brandParam = searchParams.get('brand');
  
  const [url, setUrl] = useState(urlParam || '');
  const [autoStarted, setAutoStarted] = useState(false);

  const {
    status,
    providers,
    brand,
    checkVisibility,
    isLoading,
    error,
  } = useAIVisibilitySSE();

  // Auto-start check if URL is provided via query param
  useEffect(() => {
    if (urlParam && !autoStarted && status === 'idle') {
      setAutoStarted(true);
      checkVisibility(urlParam);
    }
  }, [urlParam, autoStarted, status, checkVisibility]);

  // Get the OpenAI result specifically
  const chatgptResult = useMemo(() => {
    return providers.find(p => p.provider === 'openai') || null;
  }, [providers]);

  const isWaitingForChatGPT = isLoading && !chatgptResult;
  const isFailed = status === 'failed';

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
    if (!chatgptResult) return;
    const text = chatgptResult.mentioned
      ? `My site ${brand} is recommended by ChatGPT at position #${chatgptResult.position}! Check if yours is too:`
      : `Checked if ChatGPT recommends my site. See where you rank:`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://rankcli.dev/tools/chatgpt-checker')}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://rankcli.dev/tools/chatgpt-checker')}`;
    window.open(shareUrl, '_blank');
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500';
      case 'neutral':
        return 'text-yellow-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ChatGPT Site Checker',
    description: 'Check if ChatGPT recommends your website. See if you appear in AI-generated recommendations for your industry.',
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
        <title>Is Your Site Recommended by ChatGPT? Free Checker | RankCLI</title>
        <meta
          name="description"
          content="Check if ChatGPT recommends your website when users ask for suggestions in your industry. Free AI visibility checker."
        />
        <meta property="og:title" content="Is Your Site Recommended by ChatGPT? | RankCLI" />
        <meta
          property="og:description"
          content="Check if ChatGPT recommends your website. See if you appear in AI-generated recommendations."
        />
        <meta property="og:image" content="https://rankcli.dev/og/chatgpt-checker.png" />
        <link rel="canonical" href="https://rankcli.dev/tools/chatgpt-checker" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Free Tool
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Is Your Site Recommended by ChatGPT?
            </h1>
            <p className="text-lg text-muted-foreground">
              Check if ChatGPT mentions your website when users ask for recommendations
              in your industry. AI visibility is the new SEO.
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
              {isWaitingForChatGPT ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check Now
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

          {/* Loading State */}
          {isWaitingForChatGPT && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Checking ChatGPT...</p>
            </div>
          )}

          {/* Results */}
          {chatgptResult && (
            <div className="space-y-6">
              {/* Main Result */}
              <div className={`p-8 rounded-xl border-2 text-center ${
                chatgptResult.mentioned
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-orange-500/10 border-orange-500/30'
              }`}>
                <div className="flex justify-center mb-4">
                  {chatgptResult.mentioned ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-orange-500" />
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-2">
                  {chatgptResult.mentioned ? (
                    <>You're Recommended!</>
                  ) : (
                    <>Not Found Yet</>
                  )}
                </h2>

                {chatgptResult.mentioned && chatgptResult.position && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-600 mb-4">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Position #{chatgptResult.position}</span>
                  </div>
                )}

                <p className="text-muted-foreground mb-4">
                  {chatgptResult.mentioned ? (
                    <>
                      ChatGPT mentions <strong>{brand}</strong> when asked about your industry.
                      {chatgptResult.sentiment && (
                        <span className={`ml-1 ${getSentimentColor(chatgptResult.sentiment)}`}>
                          ({chatgptResult.sentiment} sentiment)
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      ChatGPT doesn't currently recommend <strong>{brand}</strong> for the queries we tested.
                      This is an opportunity to improve your AI visibility!
                    </>
                  )}
                </p>

                {/* Share Buttons */}
                <div className="flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share on X
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareOnLinkedIn}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share on LinkedIn
                  </Button>
                </div>
              </div>

              {/* ChatGPT Response Preview */}
              {chatgptResult.context && (
                <div className="p-6 rounded-xl border bg-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Bot className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">ChatGPT Response Preview</h3>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm whitespace-pre-wrap">
                    {chatgptResult.context}
                  </div>
                </div>
              )}

              {/* Other Providers (bonus - since we're checking them anyway) */}
              {isLoading && (
                <div className="p-4 rounded-lg border bg-muted/20 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Also checking Claude, Gemini, and Perplexity...
                  </p>
                </div>
              )}

              {!isLoading && providers.length > 1 && (
                <div className="p-4 rounded-lg border bg-muted/20">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    We also checked other AI models:
                  </p>
                  <div className="flex justify-center gap-4">
                    {providers.filter(p => p.provider !== 'openai').map(p => (
                      <div key={p.provider} className="flex items-center gap-2 text-sm">
                        {p.mentioned ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{p.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-3">
                    <Link to="/tools/ai-visibility">
                      <Button variant="link" size="sm">
                        View full AI visibility report →
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <h3 className="text-lg font-semibold mb-2">Track Your AI Visibility</h3>
                <p className="text-muted-foreground mb-4">
                  Monitor how ChatGPT, Claude, Perplexity, and Gemini recommend your brand over time.
                  Get alerts when your visibility changes.
                </p>
                <div className="flex justify-center gap-3">
                  <Link to="/tools/ai-visibility">
                    <Button>Check All AI Models</Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline">Track Continuously</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Why It Matters (when no result) */}
          {status === 'idle' && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 text-center">
                Why AI Visibility Matters
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'AI is the New Search',
                    desc: 'More people ask ChatGPT for recommendations instead of searching Google.',
                  },
                  {
                    title: 'Zero-Click Discovery',
                    desc: 'Users get answers directly from AI without visiting search results.',
                  },
                  {
                    title: 'Brand Authority',
                    desc: 'Being recommended by AI builds trust and credibility with potential customers.',
                  },
                  {
                    title: 'Competitive Advantage',
                    desc: 'Most businesses don\'t track AI visibility yet. Get ahead of the curve.',
                  },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-lg border bg-card">
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 p-6 rounded-xl bg-muted/50 text-center">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">100M+</div>
                    <div className="text-sm text-muted-foreground">Weekly ChatGPT users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">40%</div>
                    <div className="text-sm text-muted-foreground">Use AI for product research</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">2025</div>
                    <div className="text-sm text-muted-foreground">AI SEO becomes critical</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Tools */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">Also check out our other free tools:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/tools/ai-visibility">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  AI Visibility Checker
                </Button>
              </Link>
              <Link to="/tools/meta-tag-analyzer">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Meta Tag Analyzer
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
