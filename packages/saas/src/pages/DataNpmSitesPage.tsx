import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { CORPUS_LATEST_URL, CORPUS_README_URL, headlines, siteFlags, frameworksOf, type CorpusDataset } from '@/lib/corpus';

type State = { status: 'loading' } | { status: 'none' } | { status: 'error'; message: string } | { status: 'ready'; data: CorpusDataset };

const percent = (share: number) => `${Math.round(share * 100)}%`;

export function DataNpmSitesPage() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [framework, setFramework] = useState<string>('all');
  const [sort, setSort] = useState<'score' | 'origin'>('score');

  useEffect(() => {
    let cancelled = false;
    fetch(CORPUS_LATEST_URL)
      .then(async (res) => {
        if (res.status === 404) return { status: 'none' } as State;
        if (!res.ok) return { status: 'error', message: `HTTP ${res.status}` } as State;
        return { status: 'ready', data: (await res.json()) as CorpusDataset } as State;
      })
      .catch((err: unknown) => ({ status: 'error', message: err instanceof Error ? err.message : 'failed to load' }) as State)
      .then((next) => {
        if (!cancelled) setState(next);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const data = state.status === 'ready' ? state.data : null;
  const rows = useMemo(() => {
    if (!data) return [];
    const audited = data.results.filter((site) => site.facts);
    const filtered = framework === 'all' ? audited : audited.filter((site) => (site.framework ?? 'unknown') === framework);
    return [...filtered].sort((a, b) => (sort === 'score' ? (a.score ?? 0) - (b.score ?? 0) : a.origin.localeCompare(b.origin)));
  }, [data, framework, sort]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="What the most popular npm packages' sites do: the weekly dataset"
        description="The homepages of the 400 most popular npm packages, audited every week: how many refuse Claude's search crawler at the edge, serve their metadata only to Googlebot, publish an llms.txt or stamp one date on every sitemap URL. Rebuildable by anyone from the public scripts."
        path="/data/npm-sites"
      />
      <Navbar />

      <main className="container py-16 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">What the most popular npm packages' sites do</h1>
        <p className="text-muted-foreground mb-6">
          The homepages of the 400 most popular npm packages, by npm's own popularity order, audited one page each every Monday with the published RankCLI engine. The list, the scripts and every weekly result are public, so each number here can be rebuilt by anyone:{' '}
          <a className="underline" href={CORPUS_README_URL} target="_blank" rel="noopener">
            how the corpus is built
          </a>
          .
        </p>

        {state.status === 'loading' && <p className="text-muted-foreground">Loading the latest run…</p>}
        {state.status === 'none' && (
          <p className="text-muted-foreground">No run has been published yet. The first one lands on the Monday after the corpus workflow is merged; the pilot numbers are on the pull request that added it.</p>
        )}
        {state.status === 'error' && <p className="text-muted-foreground">The dataset could not be loaded ({state.message}). It lives at {CORPUS_LATEST_URL}.</p>}

        {data && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Badge variant="outline">Run of {data.auditedAt.slice(0, 10)}</Badge>
              <Badge variant="outline">{String(data.headlines.audited)} of {String(data.headlines.sites)} sites audited</Badge>
              {data.cliVersion && <Badge variant="outline">@rankcli/cli {data.cliVersion}</Badge>}
              {typeof data.headlines.medianScore === 'number' && <Badge variant="outline">median score {data.headlines.medianScore}</Badge>}
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
              {headlines(data).map((h) => (
                <div key={h.key} className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {h.count} <span className="text-base font-medium text-muted-foreground">({percent(h.share)})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{h.label}</p>
                </div>
              ))}
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-3">What the facts mean</h2>
              <p className="text-muted-foreground text-sm mb-2">
                Four kinds of bot read a site. Refusing a <strong>search crawler</strong> (Googlebot, bingbot) costs the index that most AI answers draw from; refusing an <strong>AI search crawler</strong> (OAI-SearchBot, Claude-SearchBot, PerplexityBot) takes the site out of that assistant's answers; refusing a <strong>user-triggered fetcher</strong> (ChatGPT-User, Claude-User, Perplexity-User) means the assistant cannot read a page a user pastes; refusing a <strong>training crawler</strong> (GPTBot, ClaudeBot, CCBot) costs nothing a user sees. "At the edge" means the audit fetched the homepage as that bot and got a 401, 403, 429, 503 or a challenge page while a browser got 200; robots.txt never shows that.
              </p>
              <p className="text-muted-foreground text-sm">
                "Metadata only for Googlebot" is a page whose title, description and canonical reach Googlebot but arrive later, inside the body, for every other agent (Next.js streaming metadata does this for bots it does not list). "One lastmod for every URL" is a sitemap stamped with its build time, which search engines learn to ignore. An llms.txt is a convention for coding agents and documentation sites; no search or answer engine reads it. No page content is kept, and a site can ask to be left out on the repository.
              </p>
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h2 className="text-xl font-semibold">Every site</h2>
                <div className="flex items-center gap-2 text-sm">
                  <label htmlFor="corpus-framework" className="text-muted-foreground">
                    Framework
                  </label>
                  <select id="corpus-framework" className="border rounded px-2 py-1 bg-background" value={framework} onChange={(e) => setFramework(e.target.value)}>
                    <option value="all">all</option>
                    {frameworksOf(data).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="corpus-sort" className="text-muted-foreground ml-2">
                    Sort
                  </label>
                  <select id="corpus-sort" className="border rounded px-2 py-1 bg-background" value={sort} onChange={(e) => setSort(e.target.value as 'score' | 'origin')}>
                    <option value="score">score, lowest first</option>
                    <option value="origin">site</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 pr-3">Site</th>
                      <th className="py-2 pr-3">Framework</th>
                      <th className="py-2 pr-3">Score</th>
                      <th className="py-2 pr-3">AI readiness</th>
                      <th className="py-2">Facts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((site) => (
                      <tr key={site.origin} className="border-b align-top">
                        <td className="py-2 pr-3 whitespace-nowrap">
                          <a className="underline" href={site.origin} target="_blank" rel="noopener nofollow">
                            {site.origin.replace(/^https?:\/\//, '')}
                          </a>
                          <div className="text-xs text-muted-foreground">{site.packages.slice(0, 3).join(', ')}</div>
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">{site.framework ?? '–'}</td>
                        <td className="py-2 pr-3">{site.score}</td>
                        <td className="py-2 pr-3">{site.aiReadiness ?? '–'}</td>
                        <td className="py-2 text-muted-foreground">{siteFlags(site).join(' · ') || 'nothing to report'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {data.results.length - rows.length > 0 && framework === 'all'
                  ? `${data.results.length - rows.length} sites were unreachable or answered an error status and carry no facts.`
                  : null}
              </p>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
