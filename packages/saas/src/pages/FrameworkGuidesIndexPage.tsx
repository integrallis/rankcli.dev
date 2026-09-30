import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import guides from '@/config/framework-guides.json';
import frameworks from '@/config/frameworks.json';

/** The hub for the per-framework guides. Also the page that explains detection honestly. */
export function FrameworkGuidesIndexPage() {
  const totalChecks = guides.guides.reduce((n, g) => n + g.checks.length, 0);
  const withRecipes = new Set(guides.guides.map((g) => g.slug));
  const detectOnly = frameworks.detected.filter((f) => !withRecipes.has(f.id));

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Framework SEO guides — the checks that differ per framework"
        description={`${totalChecks} framework-specific SEO checks across ${guides.guides.length} frameworks, each with the fix in that framework's own idiom. Next.js, Nuxt, SvelteKit, Astro, Rails, Laravel, Django, WordPress and more.`}
        path="/seo"
      />
      <Navbar />

      <main className="container py-16 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Framework SEO guides</h1>
        <p className="text-muted-foreground text-lg mb-4 max-w-2xl">
          Most SEO advice is framework-agnostic, which is why it rarely helps. A canonical tag in
          Next.js is the Metadata API; in SvelteKit it is a load function; in Rails it is a
          helper in the layout. Same problem, three different fixes.
        </p>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          These are the <strong>{totalChecks} framework-specific checks</strong> RankCLI runs
          across <strong>{guides.guides.length} frameworks</strong> — each with the fix written
          in that framework's own idiom, taken from the recipes the tool actually uses.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {guides.guides.map((g) => (
            <Link
              key={g.slug}
              to={`/seo/${g.slug}`}
              className="border rounded-lg p-5 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">{g.name}</h2>
                <Badge variant="secondary">{g.checks.length} checks</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {g.ssrDefault ? 'Renders on the server by default' : 'Client-rendered by default'}
                {g.challenges.length > 0 && ` · ${g.challenges.length} known traps`}
              </p>
            </Link>
          ))}
        </div>

        <section className="border-t pt-10">
          <h2 className="text-2xl font-semibold mb-3">
            Detected but not yet given a recipe
          </h2>
          <p className="text-muted-foreground mb-4 max-w-2xl">
            Every audit identifies your framework and tells you which one it found —{' '}
            {frameworks.detected.length} of them. Detection weighs all the evidence on the page
            and answers "unknown" rather than guessing, so when it names one it is right. These
            are recognised and reported, but their fixes are generic rather than idiomatic:
          </p>
          <div className="flex flex-wrap gap-2">
            {detectOnly.map((f) => (
              <Badge key={f.id} variant="outline">
                {f.name}
              </Badge>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-lg border p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Find out which of these apply to you</h2>
          <p className="text-muted-foreground mb-4">
            280+ checks, framework detected automatically. No signup.
          </p>
          <pre className="bg-muted rounded p-3 text-sm inline-block mb-4 overflow-x-auto">
            <code>npx @rankcli/cli audit -u https://your-site.dev</code>
          </pre>
          <div>
            <Link
              to="/free-audit"
              className="inline-block bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-lg"
            >
              Or run it in the browser
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
