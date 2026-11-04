import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { FREE_TOOLS } from '@/config/free-tools';

const OTHER_TOOLS = [
  { path: '/free-audit', name: 'Full SEO and AI-search audit', description: 'Every check on one page: 280+ findings with the evidence behind each.' },
  { path: '/tools/ai-visibility', name: 'AI visibility checker', description: 'Whether ChatGPT, Claude, Perplexity and Gemini can read a site and what they say about it.' },
  { path: '/tools/chatgpt-checker', name: 'ChatGPT checker', description: 'Is a site visible to ChatGPT?' },
  { path: '/tools/meta-tag-analyzer', name: 'Meta tag analyzer', description: 'Title, description, canonical and Open Graph tags, as a crawler reads them.' },
  { path: '/tools/og-image-preview', name: 'OG image preview', description: 'How a link to the page renders on social platforms.' },
];

export function ToolsIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Free SEO and AI-search tools" description="Free checks, no sign-up: AI crawler access, robots.txt for AI crawlers, llms.txt, sitemap, structured data, security headers, and the full audit." path="/tools" />
      <Navbar />
      <main className="container px-6 md:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Free SEO and AI-search tools</h1>
          <p className="text-muted-foreground mb-10">
            Each one answers a question about one page, with the finding and the fix. No sign-up. The same checks run locally with{' '}
            <code className="bg-muted px-1 rounded">npx @rankcli/cli audit --url yoursite.com</code>.
          </p>
          <div className="grid gap-4 mb-12">
            {FREE_TOOLS.map((t) => (
              <Link key={t.slug} to={`/tools/${t.slug}`}>
                <Card className="hover:border-foreground/20 transition-colors">
                  <CardContent className="py-5 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">{t.name}</h2>
                      <p className="text-sm text-muted-foreground">{t.h1}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <h2 className="text-xl font-semibold mb-4">Also free</h2>
          <ul className="space-y-3">
            {OTHER_TOOLS.map((t) => (
              <li key={t.path}>
                <Link to={t.path} className="underline font-medium">{t.name}</Link>
                <span className="text-sm text-muted-foreground"> — {t.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
