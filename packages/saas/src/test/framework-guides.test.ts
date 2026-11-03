// The framework pages must describe checks the product actually runs.
//
// They are generated from the recipe files, because a page claiming a check we do not run is
// worse than no page - it is the product lying about itself on a page meant to demonstrate
// that it does not. The recipes come from the published @rankcli/agent-runtime, a devDependency
// pinned to the version the hosted product runs (see scripts/sync-engine.mjs).
import { describe, it, expect } from 'vitest';
import { frameworks as engine } from '@rankcli/agent-runtime';
import guides from '@/config/framework-guides.json';

type Framework = Parameters<typeof engine.loadRecipe>[0];

describe('framework guides', () => {
  it('covers every framework that has a recipe', () => {
    expect(guides.guides.map((g) => g.slug).sort()).toEqual([...engine.SUPPORTED_FRAMEWORKS].sort());
  });

  it('lists the checks the recipe actually defines', async () => {
    for (const guide of guides.guides) {
      const recipe = await engine.loadRecipe(guide.slug as Framework);
      expect(recipe, `${guide.slug} has no recipe`).toBeTruthy();
      const codes = recipe!.checks.map((c) => c.code);
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
