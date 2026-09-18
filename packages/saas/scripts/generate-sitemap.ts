#!/usr/bin/env npx tsx
/**
 * Writes dist/sitemap.xml from the public route list (scripts/site-routes.ts).
 * Runs after `vite build` as part of `pnpm build`.
 *
 * <lastmod> is real, never the build date: a blog post's own date, or the
 * last commit touching the page's source files. In a shallow clone git can't
 * tell, so those entries omit <lastmod> rather than guess.
 */
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteRoutes, routeUrl, type SiteRoute } from './site-routes';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');

function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

const historyAvailable = git(['rev-parse', '--is-shallow-repository']) === 'false';

function lastmodFor(route: SiteRoute): string | undefined {
  if (route.lastmod) return route.lastmod;
  if (!historyAvailable || !route.sources?.length) return undefined;
  // %cs: committer date, YYYY-MM-DD
  return git(['log', '-1', '--format=%cs', '--', ...route.sources]) || undefined;
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const entries = siteRoutes.map((route) => {
  const lastmod = lastmodFor(route);
  return [
    '  <url>',
    `    <loc>${escapeXml(routeUrl(route.path))}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    `    <changefreq>${route.changefreq}</changefreq>`,
    `    <priority>${route.priority.toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n');
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

if (!fs.existsSync(distDir)) {
  console.error('generate-sitemap: dist/ not found; run `vite build` first.');
  process.exit(1);
}
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml);
console.log(
  `generate-sitemap: ${siteRoutes.length} URLs -> dist/sitemap.xml` +
    (historyAvailable ? '' : ' (shallow clone: page lastmod omitted)')
);
