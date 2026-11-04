import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Loader2, ArrowRight, AlertCircle, CheckCircle, XCircle, Bot, Eye } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FREE_TOOLS, findFreeTool, toolShowsFinding } from '@/config/free-tools';
import { crawlerAccessRows, blockedForAnswers } from '@/lib/crawler-access';
import { trackFreeAudit } from '@/lib/conversions';
import { NotFoundPage } from '@/pages/NotFoundPage';

interface Finding {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  title: string;
  category: string;
  description?: string;
}
interface ToolResult {
  score: number;
  issues: Finding[];
  totalIssues: number;
  checksRun: number;
}

// One page per question, all answered by the same free audit (the free-audit function runs
// the full engine on one page and returns every finding); the page shows the findings that
// answer its question and links the rest. See src/config/free-tools.ts.
export function FreeToolPage() {
  const { slug = '' } = useParams();
  const tool = findFreeTool(slug);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!tool) return <NotFoundPage />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const validUrl = url.startsWith('http') ? url : `https://${url}`;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/free-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify({ url: validUrl, source: `tool:${tool.slug}` }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The check failed. Try again in a moment.');
      setResult(data);
      trackFreeAudit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The check failed. Try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const shown = result ? result.issues.filter((f) => toolShowsFinding(tool, f)) : [];
  const rows = result ? crawlerAccessRows(result.issues) : [];
  const costly = blockedForAnswers(rows);
  const others = FREE_TOOLS.filter((t) => t.slug !== tool.slug);
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={tool.name} description={tool.description} path={`/tools/${tool.slug}`} />
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      <Navbar />
      <main className="container px-6 md:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-3">
            <Link to="/tools" className="underline">Free tools</Link> / {tool.name}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{tool.h1}</h1>
          <p className="text-muted-foreground mb-8">{tool.intro}</p>

          <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
            <Input
              type="text"
              placeholder="yoursite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              aria-label="Site URL"
            />
            <Button type="submit" disabled={isLoading || !url} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Check
            </Button>
          </form>
          {error && (
            <p className="text-sm text-red-500 mb-8 flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>
          )}

          {result && (
            <div className="space-y-6 mb-12">
              {tool.crawlerTable && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />Crawler access, fetched as each bot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {costly.length === 0
                        ? 'Every crawler that AI answers draw from got in.'
                        : `${costly.length} crawler class${costly.length === 1 ? '' : 'es'} that AI answers draw from cannot read this page.`}
                    </p>
                    <div className="divide-y divide-border rounded-lg border">
                      {rows.map((row) => (
                        <div key={row.cls} className="flex items-start gap-3 p-3 text-sm">
                          {row.status === 'allowed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : row.cls === 'training' ? (
                            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{row.label} <span className="text-muted-foreground font-normal">({row.bots})</span></p>
                            <p className="text-muted-foreground">
                              {row.status === 'allowed' ? 'allowed' : row.status === 'edge' ? 'refused at the edge' : 'disallowed in robots.txt'}
                              {row.status !== 'allowed' && row.cls !== 'training' ? `; costs ${row.cost}` : ''}
                              {row.status !== 'allowed' && row.cls === 'training' ? '; a policy choice' : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {tool.name}: findings
                    <Badge variant="outline">{shown.length} of {result.totalIssues} on the page</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {shown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing to fix for this check on this page.</p>
                  ) : (
                    <div className="space-y-4">
                      {shown.map((f, i) => (
                        <div key={`${f.code}-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="flex-1">
                            <p className="font-medium">{f.title}</p>
                            <p className="text-sm text-muted-foreground">{f.category}</p>
                            {f.description && <p className="text-sm text-muted-foreground mt-1">{f.description}</p>}
                          </div>
                          <Badge variant={f.severity === 'error' ? 'error' : f.severity === 'warning' ? 'warning' : 'secondary'}>{f.severity}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-4 text-sm text-muted-foreground">
                    Overall score {result.score}/100 from {result.checksRun} checks.{' '}
                    <Link to="/free-audit" className="underline">The full audit</Link> shows every finding.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2"><Eye className="h-4 w-4" />Watch this site</h3>
                    <p className="text-sm text-muted-foreground">A weekly check and an alert when a crawler stops getting in. Free, no GitHub, no card.</p>
                  </div>
                  <Link to={`/signup?site=${encodeURIComponent(url)}&intent=watch`}>
                    <Button className="gap-2">Watch this site<ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Questions</h2>
            <div className="space-y-5">
              {tool.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="font-medium mb-1">{f.q}</h3>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">The other free checks</h2>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              {others.map((t) => (
                <li key={t.slug}><Link to={`/tools/${t.slug}`} className="underline">{t.name}</Link></li>
              ))}
              <li><Link to="/free-audit" className="underline">Full SEO and AI-search audit</Link></li>
              <li><Link to="/tools/ai-visibility" className="underline">AI visibility checker</Link></li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              All of them run locally too: <code className="bg-muted px-1 rounded">npx @rankcli/cli audit --url yoursite.com</code>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
