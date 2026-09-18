import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

interface ComparisonResult {
  yourUrl: string;
  competitorUrl: string;
  yourScore: number;
  competitorScore: number;
  yourSummary: {
    errors: number;
    warnings: number;
    notices: number;
  };
  competitorSummary: {
    errors: number;
    warnings: number;
    notices: number;
  };
  categories: {
    name: string;
    yourScore: number;
    competitorScore: number;
    winner: 'you' | 'competitor' | 'tie';
  }[];
  advantages: string[];
  disadvantages: string[];
}

export function CompetitorAnalyzerPage() {
  const [yourUrl, setYourUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compare = async () => {
    if (!yourUrl || !competitorUrl) {
      setError('Please enter both URLs');
      return;
    }

    // Validate URLs
    let normalizedYourUrl = yourUrl;
    let normalizedCompetitorUrl = competitorUrl;

    if (!yourUrl.startsWith('http')) {
      normalizedYourUrl = `https://${yourUrl}`;
    }
    if (!competitorUrl.startsWith('http')) {
      normalizedCompetitorUrl = `https://${competitorUrl}`;
    }

    try {
      new URL(normalizedYourUrl);
      new URL(normalizedCompetitorUrl);
    } catch {
      setError('Please enter valid URLs');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('compare-urls', {
        body: { yourUrl: normalizedYourUrl, competitorUrl: normalizedCompetitorUrl },
      });

      if (fnError) throw fnError;
      setResult(data);
    } catch (err) {
      console.error('Comparison error:', err);
      setError('Failed to compare URLs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getWinnerIcon = (winner: 'you' | 'competitor' | 'tie') => {
    switch (winner) {
      case 'you':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'competitor':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SEO Competitor Analyzer',
    description: 'Compare your website\'s SEO against competitors. Side-by-side analysis of scores, issues, and performance.',
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
      <SEO
        fullTitle="SEO Competitor Analyzer - Compare Your Site vs Competitors | RankCLI"
        description="Compare your website's SEO score against a competitor side by side, and see where they beat you and how to catch up. Free, no signup required."
        path="/tools/compare"
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Free Tool
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              SEO Competitor Analyzer
            </h1>
            <p className="text-lg text-muted-foreground">
              Compare your website's SEO against a competitor. See where you're winning
              and where you need to improve.
            </p>
          </div>

          {/* Input Form */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your URL</label>
              <Input
                type="url"
                placeholder="yoursite.com"
                value={yourUrl}
                onChange={(e) => setYourUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && compare()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Competitor URL</label>
              <Input
                type="url"
                placeholder="competitor.com"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && compare()}
              />
            </div>
          </div>
          <Button onClick={compare} disabled={loading || !yourUrl || !competitorUrl} className="w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Compare SEO
          </Button>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 mt-8">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Running SEO audits on both sites...</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6 mt-8">
              {/* Score Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-6 rounded-xl border-2 ${
                  result.yourScore >= result.competitorScore
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-muted'
                }`}>
                  <div className="text-sm text-muted-foreground mb-1">Your Site</div>
                  <div className={`text-4xl font-bold ${getScoreColor(result.yourScore)}`}>
                    {result.yourScore}/100
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      {result.yourSummary.errors} errors
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      {result.yourSummary.warnings} warnings
                    </span>
                  </div>
                </div>

                <div className={`p-6 rounded-xl border-2 ${
                  result.competitorScore > result.yourScore
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-muted'
                }`}>
                  <div className="text-sm text-muted-foreground mb-1">Competitor</div>
                  <div className={`text-4xl font-bold ${getScoreColor(result.competitorScore)}`}>
                    {result.competitorScore}/100
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      {result.competitorSummary.errors} errors
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      {result.competitorSummary.warnings} warnings
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-semibold mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                  {result.categories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium">{cat.name}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreBg(cat.yourScore)}`}
                            style={{ width: `${cat.yourScore}%` }}
                          />
                        </div>
                        <span className="w-8 text-sm text-right">{cat.yourScore}</span>
                      </div>
                      <div className="w-8">{getWinnerIcon(cat.winner)}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="w-8 text-sm">{cat.competitorScore}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreBg(cat.competitorScore)}`}
                            style={{ width: `${cat.competitorScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advantages and Disadvantages */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl border bg-green-500/5 border-green-500/20">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Where You Win
                  </h3>
                  {result.advantages.length > 0 ? (
                    <ul className="space-y-2">
                      {result.advantages.map((adv, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No clear advantages found</p>
                  )}
                </div>

                <div className="p-6 rounded-xl border bg-red-500/5 border-red-500/20">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Where Competitor Wins
                  </h3>
                  {result.disadvantages.length > 0 ? (
                    <ul className="space-y-2">
                      {result.disadvantages.map((dis, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          <span>{dis}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No clear disadvantages found</p>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <h3 className="text-lg font-semibold mb-2">Track Competitors Over Time</h3>
                <p className="text-muted-foreground mb-4">
                  RankCLI Pro lets you monitor up to 3 competitors and get alerts when their SEO changes.
                  Stay ahead of the competition.
                </p>
                <div className="flex justify-center gap-3">
                  <Link to="/signup">
                    <Button>
                      Start Tracking
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline">View Plans</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Info Section (when no result) */}
          {!result && !loading && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 text-center">
                What We Compare
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'SEO Score',
                    desc: 'Overall health score based on 280+ SEO checks.',
                  },
                  {
                    title: 'Technical SEO',
                    desc: 'Crawlability, indexing, structured data, and security.',
                  },
                  {
                    title: 'On-Page SEO',
                    desc: 'Title tags, meta descriptions, headings, and content.',
                  },
                  {
                    title: 'Performance',
                    desc: 'Page speed, Core Web Vitals, and mobile optimization.',
                  },
                  {
                    title: 'Social & OG',
                    desc: 'Open Graph tags, Twitter Cards, and social sharing.',
                  },
                  {
                    title: 'AI Readiness',
                    desc: 'How well your content is structured for AI crawlers.',
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
              <Link to="/tools/ai-visibility">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  AI Visibility Checker
                </Button>
              </Link>
              <Link to="/tools/chatgpt-checker">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  ChatGPT Checker
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
