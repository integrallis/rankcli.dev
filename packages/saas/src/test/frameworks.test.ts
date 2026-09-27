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
    for (const framework of frameworks.with_recipes) {
      expect(framework.name.length).toBeGreaterThan(1);
      expect(framework.id).toMatch(/^[a-z]+$/);
    }
  });
});
