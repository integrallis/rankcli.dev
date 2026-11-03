# What the sites behind the 400 most popular npm packages actually do

*Draft for the founder, 2026-11-03. Every number below is from the first published run of the
corpus (CLI 0.0.54, 2026-11-03 02:30 UTC) and can be rebuilt from
https://github.com/integrallis/rankcli/blob/main/corpus/README.md. The live table is at
https://rankcli.dev/data/npm-sites. The title and the body avoid the word that makes a
developer thread close its tabs; the facts are about crawlers, sitemaps, dates and metadata.*

Every week a workflow takes the homepages of the 400 most popular npm packages, by npm's own
popularity order, and fetches each one once as a browser, once as each of eleven crawlers,
plus its robots.txt and sitemap. It keeps no content, only what it observed. This is the
first run: 367 of the 400 sites answered (the rest are GitHub Pages that moved, one 429, one
403 to everyone).

## The numbers

| Of 367 sites | Count |
|---|---|
| have no sitemap | 150 (41%) |
| publish an llms.txt | 174 (47%) |
| stamp one date on every sitemap URL | 32 (9%) |
| client-render the homepage | 20 (5%) |
| refuse a training crawler at the edge (GPTBot, ClaudeBot, CCBot) | 11 (3%) |
| disallow the training crawlers in robots.txt | 11 (3%) |
| refuse an AI search crawler at the edge (OAI-SearchBot, Claude-SearchBot, PerplexityBot) | 5 |
| refuse a user-triggered fetcher at the edge (ChatGPT-User, Claude-User, Perplexity-User) | 3 |
| refuse Googlebot or bingbot at the edge | 3 |
| disallow the AI search crawlers in robots.txt | 3 |
| serve their title, description and canonical to Googlebot and to no other agent | 2 |
| have an IndexNow key | 0 |

Median score 70 out of 100. Frameworks the audit recognised: 84 Next.js, 51 Vue, 38
Docusaurus, 24 Astro, 17 React, 5 Nuxt, 5 WordPress; 121 it could not name.

## Three things worth saying

**Four in ten have no sitemap.** These are the documentation sites of the libraries half the
web is built with, and 150 of them give a crawler no list of pages. Crawlers find pages by
following links; a site that ships a navigation in JavaScript and no sitemap is discovered
one page at a time, if at all. The framework-detected sites are not better: Next.js sites
are missing a sitemap about as often as the rest.

**Half publish an llms.txt, and the share tracks the tools people use to build agents.**
174 sites have one: 54 of the 84 Next.js sites (64 percent), 15 of 24 Astro sites (63
percent), 29 of 51 Vue sites, 20 of 38 Docusaurus sites. No search or answer engine reads
the file; Google says it neither helps nor harms, and in a 137,000-domain study 97 percent of
these files received no request in a month. What the file is for is coding agents reading
documentation, and the people who build those agents are the people publishing it. That is a
convention, not a ranking lever, and the number is a measure of who is in the corpus.

**Blocking is rare, and some of it looks accidental.** Eleven sites refuse the training
crawlers at the edge and eleven disallow them in robots.txt; that is the deliberate kind, and
it costs nothing a user sees. The other kind is smaller and stranger. Three sites refuse
Googlebot or bingbot while a browser gets 200: ag-grid.com answers both with a 403, mths.be
refuses bingbot, and lokalise.github.io serves a challenge page to Googlebot, bingbot and the
three AI search crawlers alike, which a crawler cannot solve. Five refuse an AI search
crawler: besides those, apitools.dev refuses PerplexityBot and every user-triggered fetcher,
code.haverbeke.berlin refuses OAI-SearchBot and PerplexityBot and also disallows them in
robots.txt, and vite-php.nititech.de rate-limits them with a 429. None of these shows in
robots.txt, which is why the audit fetches as each bot instead of parsing a file.

## What did not show up

The Next.js streaming-metadata failure, where a page's title and canonical reach Googlebot
and arrive later in the body for every other agent, appeared on 0 of the 84 Next.js sites.
It appeared on two sites built with other things (an HTMX site and a Nuxt site). The failure
is real and reproducible; it is not common on the sites that ship the framework's
documentation.

Thirty-two sites, developer.mozilla.org, solidjs.com and mantine.dev among them, stamp every
sitemap URL with the same date, which is the build time and not the content's. Google uses
lastmod only while it proves accurate and ignores it once it does not, so those sitemaps
carry no freshness signal at all.

## Check your own

```bash
npx @rankcli/cli audit --url https://your-site.com -o llm
```

prints the same findings for one site, by code, with the fix. The corpus's scripts, list and
every weekly result are public; a site can ask to be left out on the repository.

*Not in this piece, on purpose: any claim that a score predicts citations. No published score
does, and the dataset is a measure of hygiene, not of outcomes.*
