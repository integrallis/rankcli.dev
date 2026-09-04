import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  // agent-runtime-premium has no build step (workspace-only, never
  // published - see its package.json) and its "main" points straight at
  // raw TypeScript source. That's fine for dev (tsx/tsup handle TS
  // directly) but the Docker runtime stage runs plain compiled
  // `node dist/index.js`, which can't require() a .ts file - so this
  // package specifically needs to be bundled/transpiled into
  // audit-worker's own output rather than left external like every
  // other dependency.
  noExternal: ['@rankcli/agent-runtime-premium'],
});
