#!/usr/bin/env node
// Turn the framework recipes into landing pages.
//
// We ship eleven recipes of genuine, framework-specific SEO knowledge - the actual checks, with
// the actual fix for each, in that framework's own idiom - and none of it was on the site. That
// is the product's whole thesis unused: someone searching "SvelteKit SEO" is exactly who this
// tool is for, and we had nothing for them to land on.
//
// Generated rather than hand-written, for the same reason frameworks.json is: the recipes are
// the source of truth and the pages must not drift from what the product actually checks. A
// page claiming a check we do not run is worse than no page.
//
//   node scripts/generate-framework-guides.mjs          # write the config
//   node scripts/generate-framework-guides.mjs --check  # CI: fail if stale

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// pnpm keeps `yaml` inside agent-runtime, which declares it; a bare import from the repo root
// does not resolve. Ask from there rather than adding a dependency the root does not need.
const { parse } = createRequire(
  path.join(ROOT, 'packages/agent-runtime/package.json')
)('yaml');
const RECIPES = path.join(ROOT, 'packages/agent-runtime/src/frameworks/recipes');
const OUT = path.join(ROOT, 'packages/saas/src/config/framework-guides.json');

const guides = readdirSync(RECIPES)
  .filter((f) => f.endsWith('.yaml'))
  .map((file) => {
    const recipe = parse(readFileSync(path.join(RECIPES, file), 'utf8'));
    return {
      slug: recipe.framework,
      name: recipe.display_name,
      category: recipe.category ?? null,
      ssrDefault: Boolean(recipe.ssr_default),
      strengths: recipe.seo_strengths ?? [],
      challenges: recipe.seo_challenges ?? [],
      checks: (recipe.checks ?? []).map((c) => ({
        code: c.code,
        severity: c.severity,
        title: c.title,
        description: c.description ?? '',
        // The fix is the reason anyone would read the page. Keep it whole.
        howToFix: (c.howToFix ?? '').trim(),
      })),
    };
  })
  .filter((g) => g.checks.length > 0)
  .sort((a, b) => a.name.localeCompare(b.name));

const payload = {
  _comment:
    'Generated from packages/agent-runtime/src/frameworks/recipes/*.yaml by scripts/generate-framework-guides.mjs. The recipes are the source of truth: these pages describe checks the product actually runs, and a page claiming one we do not run is worse than no page. src/test/framework-guides.test.ts fails if this drifts.',
  guides,
};

const next = JSON.stringify(payload, null, 2) + '\n';

if (process.argv.includes('--check')) {
  const current = readFileSync(OUT, 'utf8');
  if (current === next) {
    console.log(`in sync (${guides.length} guides)`);
    process.exit(0);
  }
  console.error('framework-guides.json is stale. Run: node scripts/generate-framework-guides.mjs');
  process.exit(1);
}

writeFileSync(OUT, next);
console.log(`wrote ${guides.length} guides`);
for (const g of guides) {
  console.log(`  /seo/${g.slug.padEnd(12)} ${String(g.checks.length).padStart(2)} checks  ${g.name}`);
}
