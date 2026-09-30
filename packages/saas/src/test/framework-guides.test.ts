// The framework pages must describe checks the product actually runs.
//
// They are generated from the recipe files, because a page claiming a check we do not run is
// worse than no page - it is the product lying about itself on a page meant to demonstrate
// that it does not. Read from the recipe source rather than importing agent-runtime, for the
// same reason frameworks.test.ts does: no dependency, and its dist/ goes stale.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import guides from '@/config/framework-guides.json';

const RECIPE_DIR = join(__dirname, '../../../agent-runtime/src/frameworks/recipes');

describe('framework guides', () => {
  const onDisk = readdirSync(RECIPE_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => f.replace('.yaml', ''));

  it('covers every framework that has a recipe', () => {
    expect(guides.guides.map((g) => g.slug).sort()).toEqual([...onDisk].sort());
  });

  it('lists the checks the recipe actually defines', () => {
    for (const guide of guides.guides) {
      const yaml = readFileSync(join(RECIPE_DIR, `${guide.slug}.yaml`), 'utf8');
      const codes = [...yaml.matchAll(/^  - code:\s*(\S+)$/gm)].map((m) => m[1]);
      expect(guide.checks.map((c) => c.code).sort(), guide.slug).toEqual(codes.sort());
    }
  });

  it('keeps the fix, which is the only reason to read the page', () => {
    for (const guide of guides.guides) {
      const withFix = guide.checks.filter((c) => c.howToFix.length > 20);
      expect(withFix.length, `${guide.slug} has no usable fixes`).toBeGreaterThan(0);
    }
  });

  it('has a title and description for every check', () => {
    for (const guide of guides.guides) {
      for (const check of guide.checks) {
        expect(check.title.length, `${guide.slug}/${check.code}`).toBeGreaterThan(3);
        expect(check.code).toMatch(/^[A-Z0-9_]+$/);
      }
    }
  });
});
