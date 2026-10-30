import { defineConfig } from 'tsup';

export default defineConfig({
  // audit-thread runs the audit engine off the main event loop (see audit-pool.ts).
  entry: ['src/index.ts', 'src/audit-thread.ts'],
  format: ['esm'],
  target: 'node20',
});
