import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import guides from '@/config/framework-guides.json';
import frameworkPlugins from '@/config/framework-plugins.json';

/**
 * One page per framework we ship a recipe for, built from that recipe.
 *
 * These are the checks the product actually runs and the fixes it actually suggests, so the
 * page cannot describe something we do not do - and it is regenerated from the recipe files,
 * so it cannot drift from them either. Someone searching "SvelteKit SEO" is precisely who this
 * tool is for, and until now there was nothing for them to land on.
 */
export function FrameworkGuidePage() {
  const { framework } = useParams<{ framework: string }>();
  const guide = guides.guides.find((g) => g.slug === framework);

  if (!guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-24 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-3">No guide for that framework</h1>
          <p className="text-muted-foreground mb-6">
            We ship fix recipes for {guides.guides.length} frameworks.
          </p>
          <Link to="/seo" className="text-primary underline">
            See all framework guides
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const errors = guide.checks.filter((c) => c.severity === 'error').length;
  const plugin = frameworkPlugins.plugins.find((p) => p.slug === guide.slug);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${guide.name} SEO: ${guide.checks.length} checks and how to fix them`}
        description={`The ${guide.checks.length} ${guide.name}-specific SEO problems RankCLI checks for, each with the fix in ${guide.name}'s own idiom. Run them yourself free, no signup.`}
        path={`/seo/${guide.slug}`}
      />
      <Navbar />

      <main className="container py-16 max-w-3xl mx-auto">
        <Link to="/seo" className="text-sm text-muted-foreground hover:text-foreground">
          ← All framework guides
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
          {guide.name} SEO: {guide.checks.length} checks and how to fix them
        </h1>

        <p className="text-muted-foreground text-lg mb-6">
          These are the {guide.name}-specific checks RankCLI runs, and the fix for each one in{' '}
          {guide.name}'s own idiom. {guide.ssrDefault
            ? `${guide.name} renders on the server by default, which removes a whole class of SEO problems before you start.`
            : `${guide.name} renders on the client by default, which is where most of its SEO problems come from.`}
        </p>

        <div className="flex flex-wrap gap-2 mb-10">
          <Badge variant="secondary">{guide.checks.length} checks</Badge>
          {errors > 0 && <Badge variant="destructive">{errors} rated error</Badge>}
          {guide.category && <Badge variant="outline">{guide.category}</Badge>}
          <Badge variant="outline">{guide.ssrDefault ? 'SSR by default' : 'Client-rendered by default'}</Badge>
        </div>

        <div className="rounded-lg border bg-muted/40 p-5 mb-12">
          <p className="text-sm mb-3">Run all of these against your own site, free and without an account:</p>
          <pre className="bg-background rounded p-3 text-sm overflow-x-auto">
            <code>npx @rankcli/cli audit -u https://your-site.dev</code>
          </pre>
        </div>

        {plugin && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">The {guide.name} plugin</h2>
            <p className="text-muted-foreground mb-4">
              <a href={plugin.npm} className="text-primary underline" rel="noopener">
                <code>{plugin.package}</code>
              </a>{' '}
              on npm, MIT. {plugin.summary}
            </p>
            <pre className="bg-muted rounded p-3 text-sm overflow-x-auto mb-3">
              <code>{plugin.install}</code>
            </pre>
            <pre className="bg-muted rounded p-3 text-sm overflow-x-auto">
              <code>{plugin.snippet}</code>
            </pre>
          </section>
        )}

        {guide.challenges.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Where {guide.name} makes SEO harder</h2>
            <ul className="space-y-2 text-muted-foreground">
              {guide.challenges.map((c) => (
                <li key={c} className="flex gap-3">
                  <span className="text-destructive">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {guide.strengths.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">What {guide.name} gives you for free</h2>
            <ul className="space-y-2 text-muted-foreground">
              {guide.strengths.map((s) => (
                <li key={s} className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-6">The checks</h2>
          <div className="space-y-10">
            {guide.checks.map((check) => (
              <article key={check.code} id={check.code.toLowerCase()} className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={check.severity === 'error' ? 'destructive' : 'secondary'}>
                    {check.severity}
                  </Badge>
                  <code className="text-xs text-muted-foreground font-mono">{check.code}</code>
                </div>
                <h3 className="text-lg font-semibold mb-2">{check.title}</h3>
                {check.description && (
                  <p className="text-muted-foreground mb-4">{check.description}</p>
                )}
                {check.howToFix && (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{check.howToFix}</ReactMarkdown>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-lg border p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Check your own {guide.name} site</h2>
          <p className="text-muted-foreground mb-4">
            280+ checks including every one above. No signup, nothing leaves your machine.
          </p>
          <Link
            to="/free-audit"
            className="inline-block bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-lg"
          >
            Run a free audit
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
