// The frameworks we claim to support, and the ones we actually have recipes for, must be the
// same list. Three places used to state it independently - Features.tsx, the FAQ and the
// changelog - and agent-runtime's SUPPORTED_FRAMEWORKS once claimed three more (svelte, remix,
// gatsby) than there were recipes for. This test is what makes the config the source of truth.
//
// The engine is the published @rankcli/agent-runtime, a devDependency pinned to the version the
// hosted product runs (see scripts/sync-engine.mjs), so the copy describes what is deployed.
import { describe, it, expect } from 'vitest';
import { frameworks as engine } from '@rankcli/agent-runtime';
import frameworks from '@/config/frameworks.json';

type Framework = Parameters<typeof engine.loadRecipe>[0];

describe('supported frameworks', () => {
  const supported = [...engine.SUPPORTED_FRAMEWORKS].sort();

  it('lists exactly the frameworks that have a recipe', async () => {
    for (const id of supported) {
      expect(await engine.loadRecipe(id), `${id} is supported but has no recipe`).toBeTruthy();
    }
    expect(frameworks.with_recipes.map((f) => f.id).sort()).toEqual(supported);
  });

  it("uses each recipe's own display_name", async () => {
    for (const framework of frameworks.with_recipes) {
      const recipe = await engine.loadRecipe(framework.id as Framework);
      expect(recipe?.display_name, `${framework.id} display name`).toBe(framework.name);
    }
  });

  it('has a name for every framework', () => {
    for (const framework of [...frameworks.with_recipes, ...frameworks.detected]) {
      expect(framework.name.length).toBeGreaterThan(1);
      expect(framework.id).toMatch(/^[a-z]+$/);
    }
  });
});

// Detection and fixing are different claims, and the site makes both. "11 frameworks" was the
// only number the copy could state, because with_recipes was the only list that existed -
// which undersold an audit that names 32.
describe('detected frameworks', () => {
  const detectedIds = frameworks.detected.map((f) => f.id);

  it('lists exactly the frameworks the detector has signals for', () => {
    const signalIds = [...new Set(engine.SIGNALS.map((s) => s.framework as string))]
      // 'unknown' is what the detector returns when the evidence scores below the floor. It is
      // the refusal to guess, not a framework we support, and it does not belong in the copy.
      .filter((id) => id !== 'unknown')
      .sort();

    expect(signalIds.length, 'no signals - did the runtime change shape?').toBeGreaterThan(20);
    expect([...detectedIds].sort()).toEqual(signalIds);
  });

  it('can detect every framework it has a recipe for', () => {
    // A recipe for something we cannot recognise on a live page is a fix nobody is ever
    // offered. Recipes are a subset of detection, never the other way around.
    for (const framework of frameworks.with_recipes) {
      expect(detectedIds, `${framework.id} has a recipe but no detection signal`).toContain(
        framework.id
      );
    }
  });

  it('uses the runtime display name, so the site and the CLI say the same word', () => {
    for (const framework of frameworks.detected) {
      expect(
        engine.getFrameworkDisplayName(framework.id as Framework),
        `${framework.id} display name`
      ).toBe(framework.name);
    }
  });
});
