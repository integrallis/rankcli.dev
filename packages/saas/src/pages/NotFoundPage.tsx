import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

const suggestions = [
  { href: '/free-audit', label: 'Free SEO audit' },
  { href: '/docs', label: 'Documentation' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/tools/meta-tag-analyzer', label: 'Meta tag analyzer' },
  { href: '/tools/ai-visibility', label: 'AI visibility checker' },
];

// Rendered for any URL no route matches. The build also saves it as
// dist/404.html, which Cloudflare Pages serves with a 404 status.
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Page not found"
        description="This page doesn't exist. Try the free SEO audit, the docs, or the blog."
        noindex
      />
      <Navbar />

      <main className="container flex-1 py-24 max-w-2xl mx-auto text-center">
        <p className="font-tech text-sm text-muted-foreground mb-4">404</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-10">
          The page you're looking for doesn't exist or has moved.
        </p>

        <Button asChild size="lg" className="mb-12">
          <Link to="/">Back to the homepage</Link>
        </Button>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
          {suggestions.map((link) => (
            <li key={link.href}>
              <Link to={link.href} className="text-primary hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </div>
  );
}
