// The frameworks we claim to support, and the ones we actually have recipes for, must be the
// same list. Three places used to state it independently - Features.tsx, the FAQ and the
// changelog - and agent-runtime's SUPPORTED_FRAMEWORKS claimed three more (svelte, remix,
// gatsby) than there were recipes for. This test is what makes the config the source of truth.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import frameworks from '@/config/frameworks.json';

const RECIPE_DIR = join(__dirname, '../../../agent-runtime/src/frameworks/recipes');

describe('supported frameworks', () => {
  const onDisk = readdirSync(RECIPE_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => f.replace('.yaml', ''))
    .sort();

  it('lists exactly the frameworks that have a recipe', () => {
    expect(frameworks.with_recipes.map((f) => f.id).sort()).toEqual(onDisk);
  });

  it('uses each recipe\'s own display_name', () => {
    for (const framework of frameworks.with_recipes) {
      const yaml = readFileSync(join(RECIPE_DIR, `${framework.id}.yaml`), 'utf8');
      const declared = yaml.match(/^display_name:\s*(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, '');
      expect(framework.name, `${framework.id} display name`).toBe(declared);
    }
  });

  it('has a name for every framework', () => {
    for (const framework of [...frameworks.with_recipes, ...frameworks.detected]) {
      expect(framework.name.length).toBeGreaterThan(1);
      expect(framework.id).toMatch(/^[a-z]+$/);
    }
  });
});

// Detection and fixing are different claims, and the site now makes both. "11 frameworks" was
// the only number the copy could state, because with_recipes was the only list that existed -
// which undersold an audit that names 32.
//
// These read agent-runtime's source rather than importing it, for the same reason the recipe
// checks above read YAML off disk: this package has no dependency on agent-runtime, and its
// dist/ is gitignored and goes stale (see CLAUDE.md), so importing it would make these tests
// fail for reasons that have nothing to do with the copy being wrong.
describe('detected frameworks', () => {
  const FRAMEWORK_SRC = join(__dirname, '../../../agent-runtime/src/frameworks');
  const detectedIds = frameworks.detected.map((f) => f.id);

  it('lists exactly the frameworks the detector has signals for', () => {
    const signals = readFileSync(join(FRAMEWORK_SRC, 'signals.ts'), 'utf8');
    const signalIds = [
      ...new Set([...signals.matchAll(/\bframework: '([a-z]+)'/g)].map((m) => m[1])),
    ]
      // 'unknown' is what the detector returns when the evidence scores below the floor. It is
      // the refusal to guess, not a framework we support, and it does not belong in the copy.
      .filter((id) => id !== 'unknown')
      .sort();

    expect(signalIds.length, 'no signals parsed - did signals.ts change shape?').toBeGreaterThan(20);
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
    const detector = readFileSync(join(FRAMEWORK_SRC, 'detector.ts'), 'utf8');
    // Scoped to getFrameworkDisplayName's own map: getLanguageDisplayName further down the file
    // has a `go:` key too, and reading the whole file let 'Go' overwrite 'Go (Gin/Echo/Fiber)'.
    const mapBody = detector.slice(detector.indexOf('export function getFrameworkDisplayName'));
    const names = new Map(
      [...mapBody.slice(0, mapBody.indexOf('\n}')).matchAll(/^\s{4}([a-z]+): '([^']+)',$/gm)].map(
        (m) => [m[1], m[2]]
      )
    );

    expect(names.size, 'no display names parsed - did detector.ts change shape?').toBeGreaterThan(20);

    for (const framework of frameworks.detected) {
      expect(names.get(framework.id), `${framework.id} display name`).toBe(framework.name);
    }
  });
});
