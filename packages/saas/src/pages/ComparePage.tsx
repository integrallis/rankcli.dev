import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import comparisonsConfig from '@/config/comparisons.json';

export interface ComparisonRow {
  aspect: string;
  rankcli: string;
  rival: string;
  /** Source for the rival cell, from the vendor's own pages. */
  source?: string;
}

export interface Comparison {
  slug: string;
  kind: 'compare' | 'alternatives';
  rival: string;
  title: string;
  description: string;
  verifiedAt: string;
  summary: string;
  rows: ComparisonRow[];
  pickRival: string[];
  pickRankcli: string[];
  sources: { label: string; url: string }[];
  draft?: boolean;
}

export const comparisons = (comparisonsConfig.comparisons as Comparison[]).filter((c) => !c.draft);

export function comparisonPath(c: Pick<Comparison, 'kind' | 'slug'>) {
  return `/${c.kind}/${c.slug}`;
}

/**
 * One page per rival, built from comparisons.json. Every rival fact on the page
 * carries the vendor URL it was read from and the date, so the page says what
 * was true when it was checked and nothing it cannot show.
 */
export function ComparePage({ kind }: { kind: Comparison['kind'] }) {
  const { slug } = useParams<{ slug: string }>();
  const comparison = comparisons.find((c) => c.slug === slug && c.kind === kind);

  if (!comparison) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-24 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-3">No comparison for that tool</h1>
          <p className="text-muted-foreground mb-6">
            The ones we have written: {comparisons.map((c) => c.rival).join(', ')}.
          </p>
          <Link to="/" className="text-primary underline">
            Back to RankCLI
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const sourceIndex = new Map(comparison.sources.map((s, i) => [s.url, i + 1]));

  return (
    <div className="min-h-screen bg-background">
      <SEO
        fullTitle={comparison.title}
        description={comparison.description}
        path={comparisonPath(comparison)}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: comparison.title,
          description: comparison.description,
          dateModified: comparison.verifiedAt,
          author: { '@type': 'Organization', name: 'RankCLI' },
          mainEntityOfPage: `https://rankcli.dev${comparisonPath(comparison)}`,
        }}
      />
      <Navbar />

      <main className="container py-16 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{comparison.title}</h1>
        <p className="text-muted-foreground text-lg mb-4">{comparison.summary}</p>
        <div className="flex flex-wrap gap-2 mb-10">
          <Badge variant="outline">Facts checked {comparison.verifiedAt}</Badge>
          <Badge variant="outline">{comparison.rows.length} aspects</Badge>
        </div>

        <section className="mb-12 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold">Aspect</th>
                <th className="text-left py-2 pr-4 font-semibold">RankCLI</th>
                <th className="text-left py-2 font-semibold">{comparison.rival}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.aspect} className="border-b align-top">
                  <th scope="row" className="text-left py-3 pr-4 font-medium">
                    {row.aspect}
                  </th>
                  <td className="py-3 pr-4 text-muted-foreground">{row.rankcli}</td>
                  <td className="py-3 text-muted-foreground">
                    {row.rival}
                    {row.source && sourceIndex.has(row.source) && (
                      <sup className="ml-1">
                        <a href={`#source-${sourceIndex.get(row.source)}`} className="text-primary">
                          [{sourceIndex.get(row.source)}]
                        </a>
                      </sup>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xl font-semibold mb-3">Pick {comparison.rival} when</h2>
            <ul className="space-y-2 text-muted-foreground">
              {comparison.pickRival.map((item) => (
                <li key={item} className="flex gap-3">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">Pick RankCLI when</h2>
            <ul className="space-y-2 text-muted-foreground">
              {comparison.pickRankcli.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="rounded-lg border bg-muted/40 p-5 mb-12">
          <p className="text-sm mb-3">See the RankCLI side for yourself, free and without an account:</p>
          <pre className="bg-background rounded p-3 text-sm overflow-x-auto">
            <code>npx @rankcli/cli audit -u https://your-site.dev</code>
          </pre>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Sources</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Every {comparison.rival} fact above was read from these pages on {comparison.verifiedAt}.
            If something has changed since, <Link to="/contact" className="text-primary underline">tell us</Link> and
            we will correct it.
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            {comparison.sources.map((s, i) => (
              <li key={s.url} id={`source-${i + 1}`}>
                <a href={s.url} rel="noopener nofollow" className="text-primary underline break-all">
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export function CompareVsPage() {
  return <ComparePage kind="compare" />;
}

export function AlternativesPage() {
  return <ComparePage kind="alternatives" />;
}
