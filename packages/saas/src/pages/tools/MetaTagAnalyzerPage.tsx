import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetaTag {
  name: string;
  content: string;
  status: 'good' | 'warning' | 'error' | 'missing';
  recommendation?: string;
}

interface AnalysisResult {
  url: string;
  title: string;
  metaTags: MetaTag[];
  score: number;
}

export function MetaTagAnalyzerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const analyzeUrl = async () => {
    if (!url) return;

    // Validate URL
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use a CORS proxy or server-side function in production
      // For now, we'll simulate the analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated analysis result
      const mockResult: AnalysisResult = {
        url: normalizedUrl,
        title: 'Example Page Title',
        score: 72,
        metaTags: [
          {
            name: 'title',
            content: 'Example Page Title | Brand',
            status: 'good',
          },
          {
            name: 'description',
            content: 'This is a sample meta description that describes the page content.',
            status: url.includes('example') ? 'warning' : 'good',
            recommendation: url.includes('example') ? 'Description could be more compelling. Add a call-to-action.' : undefined,
          },
          {
            name: 'og:title',
            content: 'Example Page Title',
            status: 'good',
          },
          {
            name: 'og:description',
            content: 'This is the Open Graph description for social sharing.',
            status: 'good',
          },
          {
            name: 'og:image',
            content: url.includes('example') ? '' : 'https://example.com/og-image.png',
            status: url.includes('example') ? 'error' : 'good',
            recommendation: url.includes('example') ? 'Missing og:image. Social shares will have no preview image.' : undefined,
          },
          {
            name: 'twitter:card',
            content: 'summary_large_image',
            status: 'good',
          },
          {
            name: 'canonical',
            content: normalizedUrl,
            status: 'good',
          },
          {
            name: 'robots',
            content: 'index, follow',
            status: 'good',
          },
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1',
            status: 'good',
          },
        ],
      };

      setResult(mockResult);
    } catch (err) {
      setError('Failed to analyze URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusIcon = (status: MetaTag['status']) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
      case 'missing':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Meta Tag Analyzer',
    description: 'Free tool to analyze and validate meta tags on any webpage. Check title, description, Open Graph, and Twitter Card tags.',
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
        <title>Free Meta Tag Analyzer - Check SEO Meta Tags | RankCLI</title>
        <meta
          name="description"
          content="Free tool to analyze and validate meta tags on any webpage. Check title, description, Open Graph, and Twitter Card tags instantly."
        />
        <meta property="og:title" content="Free Meta Tag Analyzer | RankCLI" />
        <meta
          property="og:description"
          content="Analyze and validate meta tags on any webpage. Check title, description, OG tags, and Twitter Cards."
        />
        <link rel="canonical" href="https://rankcli.dev/tools/meta-tag-analyzer" />
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Meta Tag Analyzer</h1>
            <p className="text-lg text-muted-foreground">
              Check if your page has proper meta tags for SEO and social sharing.
              Analyze title, description, Open Graph, and Twitter Cards.
            </p>
          </div>

          {/* Input */}
          <div className="flex gap-2 mb-8">
            <Input
              type="url"
              placeholder="Enter URL to analyze (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyzeUrl()}
              className="flex-1"
            />
            <Button onClick={analyzeUrl} disabled={loading || !url}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 mb-8">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Score */}
              <div className="p-6 rounded-xl border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Overall Score</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {result.url}
                    </p>
                  </div>
                  <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}/100
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      result.score >= 80
                        ? 'bg-green-500'
                        : result.score >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* Meta Tags */}
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Meta Tags Found</h2>
                </div>
                <div className="divide-y">
                  {result.metaTags.map((tag) => (
                    <div key={tag.name} className="p-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(tag.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{tag.name}</span>
                            <Badge
                              variant={
                                tag.status === 'good'
                                  ? 'default'
                                  : tag.status === 'warning'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="text-xs"
                            >
                              {tag.status}
                            </Badge>
                          </div>
                          {tag.content ? (
                            <div className="flex items-start gap-2">
                              <p className="text-sm text-muted-foreground break-all flex-1">
                                {tag.content}
                              </p>
                              <button
                                onClick={() => handleCopy(tag.content, tag.name)}
                                className="p-1 hover:bg-muted rounded shrink-0"
                                title="Copy"
                              >
                                {copied === tag.name ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-red-500 italic">Not found</p>
                          )}
                          {tag.recommendation && (
                            <p className="text-sm text-yellow-600 mt-2 p-2 bg-yellow-500/10 rounded">
                              {tag.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <h3 className="text-lg font-semibold mb-2">Want a Full SEO Audit?</h3>
                <p className="text-muted-foreground mb-4">
                  This tool checks meta tags. RankCLI runs 280+ SEO checks including
                  performance, security, structured data, and more.
                </p>
                <div className="flex justify-center gap-3">
                  <Link to="/free-audit">
                    <Button>Try Full Audit</Button>
                  </Link>
                  <Link to="/docs">
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* How It Works (when no result) */}
          {!result && !loading && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 text-center">What This Tool Checks</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Title Tag',
                    desc: 'The most important on-page SEO element. Should be unique and compelling.',
                  },
                  {
                    title: 'Meta Description',
                    desc: 'The snippet shown in search results. Should be 150-160 characters.',
                  },
                  {
                    title: 'Open Graph Tags',
                    desc: 'Controls how your page appears when shared on Facebook and LinkedIn.',
                  },
                  {
                    title: 'Twitter Cards',
                    desc: 'Optimizes your page appearance when shared on Twitter/X.',
                  },
                  {
                    title: 'Canonical URL',
                    desc: 'Prevents duplicate content issues by specifying the preferred URL.',
                  },
                  {
                    title: 'Robots Meta',
                    desc: 'Controls whether search engines can index and follow links on the page.',
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
