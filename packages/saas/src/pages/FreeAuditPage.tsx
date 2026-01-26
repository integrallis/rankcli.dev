import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Loader2, ArrowRight, AlertCircle, CheckCircle, XCircle, Bot, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CategoryRadarChart } from '@/components/audit/CategoryRadarChart';
import { SERPPreview } from '@/components/audit/SERPPreview';
import { ShareResults } from '@/components/audit/ShareResults';

interface AuditResult {
  score: number;
  issues: {
    code: string;
    severity: 'error' | 'warning' | 'notice';
    title: string;
    category: string;
    description?: string;
  }[];
  categories: {
    crawlability: number;
    onPage: number;
    content: number;
    performance: number;
    security: number;
    socialMeta: number;
    aiReadiness: number;
  };
  checksRun: number;
  totalIssues: number;
  hiddenIssues: number;
  title?: string;
  description?: string;
  favicon?: string;
}

export function FreeAuditPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Basic URL validation
    let validUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      validUrl = `https://${url}`;
    }

    try {
      new URL(validUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/free-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: validUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run audit');
      }

      setResult({
        score: data.score,
        issues: data.issues,
        categories: {
          crawlability: data.categories?.crawlability ?? 0,
          onPage: data.categories?.onPage ?? 0,
          content: data.categories?.content ?? 0,
          performance: data.categories?.performance ?? 0,
          security: data.categories?.security ?? 0,
          socialMeta: data.categories?.socialMeta ?? 0,
          aiReadiness: data.categories?.aiReadiness ?? 0,
        },
        checksRun: data.checksRun || 280,
        totalIssues: data.totalIssues || data.issues?.length || 0,
        hiddenIssues: data.hiddenIssues || 0,
        title: data.title,
        description: data.description,
        favicon: data.favicon,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run audit');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free SEO Audit Tool',
    description: 'Get instant SEO analysis for any website. 200+ checks including technical SEO, content, performance, and AI readiness. No signup required.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const handleEmailCapture = async (email: string) => {
    // Send email to edge function for PDF report
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    fetch(`${supabaseUrl}/functions/v1/free-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, email }),
    }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Free SEO Audit - 200+ Checks, Instant Results | RankCLI</title>
        <meta
          name="description"
          content="Get instant SEO analysis for any website. 200+ checks including technical SEO, content, performance, and AI readiness. No signup required."
        />
        <meta property="og:title" content="Free SEO Audit Tool | RankCLI" />
        <meta
          property="og:description"
          content="Analyze your website's SEO health with 200+ checks. Get instant results for free."
        />
        <link rel="canonical" href="https://rankcli.dev/free-audit" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Free Tool
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Free SEO Audit
            </h1>
            <p className="text-lg text-muted-foreground">
              200+ SEO checks in seconds. No signup required.
            </p>
          </div>

          {/* URL Input */}
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter website URL (e.g., example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 h-12"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" size="lg" disabled={isLoading || !url}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </form>

          {/* Loading State */}
          {isLoading && (
            <Card className="mb-8">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Analyzing your site...</p>
                <p className="text-muted-foreground">
                  Running 200+ SEO checks. This usually takes 10-30 seconds.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && !isLoading && (
            <div className="space-y-8">
              {/* Score Card with Radar Chart */}
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>SEO Health Score</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Based on {result.checksRun} checks
                  </p>
                </CardHeader>
                <CardContent className="pb-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Score */}
                    <div className="text-center">
                      <div className={cn('text-7xl font-bold mb-2', getScoreColor(result.score))}>
                        {result.score}
                      </div>
                      <p className="text-muted-foreground mb-4">out of 100</p>

                      {/* AI Readiness Badge */}
                      {result.categories.aiReadiness > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm">
                          <Bot className="h-4 w-4" />
                          <span>AI Readiness: {result.categories.aiReadiness}%</span>
                        </div>
                      )}
                    </div>

                    {/* Radar Chart */}
                    <div>
                      <CategoryRadarChart categories={result.categories} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SERP Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Google Search Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SERPPreview
                    url={url.startsWith('http') ? url : `https://${url}`}
                    title={result.title}
                    description={result.description}
                    favicon={result.favicon}
                  />
                </CardContent>
              </Card>

              {/* Issues Found */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Issues Found
                    <div className="flex gap-2">
                      <Badge variant="outline">{result.totalIssues} total</Badge>
                      {result.hiddenIssues > 0 && (
                        <Badge variant="secondary">+{result.hiddenIssues} more</Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-sm text-muted-foreground">{issue.category}</p>
                          {issue.description && (
                            <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                          )}
                        </div>
                        <Badge
                          variant={
                            issue.severity === 'error'
                              ? 'error'
                              : issue.severity === 'warning'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {result.hiddenIssues > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                      +{result.hiddenIssues} more issues found. Sign up to see the complete report.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Share Results */}
              <Card>
                <CardContent className="pt-6">
                  <ShareResults
                    url={url.startsWith('http') ? url : `https://${url}`}
                    score={result.score}
                    onEmailCapture={handleEmailCapture}
                  />
                </CardContent>
              </Card>

              {/* Upgrade CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-8 text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Want to Fix These Issues Automatically?
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    RankCLI can automatically fix SEO issues and create pull requests.
                    Track improvements over time and get alerts when new issues appear.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link to="/signup">
                      <Button className="gap-2">
                        Start Free Trial
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/tools/ai-visibility">
                      <Button variant="outline">Check AI Visibility</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
