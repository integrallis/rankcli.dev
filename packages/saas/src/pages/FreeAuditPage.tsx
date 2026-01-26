import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, ArrowRight, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AuditResult {
  score: number;
  issues: {
    code: string;
    severity: 'error' | 'warning' | 'notice';
    title: string;
    category: string;
  }[];
  categories: {
    crawlability: number;
    onPage: number;
    content: number;
    performance: number;
    security: number;
  };
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
        categories: data.categories,
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Free Tool
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Free SEO Audit
            </h1>
            <p className="text-lg text-muted-foreground">
              Get instant SEO insights for any website. No signup required.
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
              {/* Score Card */}
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>SEO Score</CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <div className={cn('text-6xl font-bold mb-2', getScoreColor(result.score))}>
                    {result.score}
                  </div>
                  <p className="text-muted-foreground">out of 100</p>

                  {/* Category scores */}
                  <div className="grid grid-cols-5 gap-4 mt-8">
                    {Object.entries(result.categories).map(([category, score]) => (
                      <div key={category} className="text-center">
                        <div className={cn('text-2xl font-semibold', getScoreColor(score))}>
                          {score}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Issues Found */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Issues Found
                    <Badge variant="outline">{result.issues.length} issues</Badge>
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

                  {/* Upgrade CTA */}
                  <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    <p className="font-semibold mb-2">
                      This preview runs 50 checks. Sign up to unlock all 300+ checks.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get detailed reports, auto-fix suggestions, and track improvements over time.
                    </p>
                    <Link to="/signup">
                      <Button className="gap-2">
                        Get Full Report
                        <ArrowRight className="h-4 w-4" />
                      </Button>
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
