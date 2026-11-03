// Copy the audit engine's Deno bundle out of the published @rankcli/agent-runtime into the
// edge functions, so the hosted audit runs the same engine as `rankcli audit`.
//
// To move the hosted engine to a new release: bump `@rankcli/agent-runtime` in
// packages/saas/package.json, run `pnpm install`, then `pnpm sync:engine`, and commit the
// bundle. The engine's source is https://github.com/integrallis/rankcli.
import { copyFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const saas = join(dirname(fileURLToPath(import.meta.url)), '..');
const runtime = join(saas, 'node_modules', '@rankcli', 'agent-runtime');
const { version } = JSON.parse(readFileSync(join(runtime, 'package.json'), 'utf8'));
const source = join(runtime, 'dist', 'deno', 'engine.bundle.js');
const target = join(saas, 'supabase', 'functions', '_shared', 'audit', 'engine.bundle.js');

copyFileSync(source, target);
console.log(`engine.bundle.js is @rankcli/agent-runtime ${version}`);
