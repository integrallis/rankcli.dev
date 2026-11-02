/**
 * Records the real audit the landing-page terminal replays.
 *
 * Runs the published @rankcli/cli against rankcli.dev with an empty HOME (so the run is
 * anonymous and nothing syncs to a dashboard) and NO_COLOR, then writes the untouched stdout
 * to src/data/hero-run/raw.txt and the provenance to meta.json. The hero selects its lines
 * from raw.txt at build time (src/data/hero-run/lines.ts); no line or number is typed by hand.
 *
 *   pnpm tsx scripts/record-hero-run.ts            # latest published version
 *   pnpm tsx scripts/record-hero-run.ts 0.0.53     # a specific version
 *
 * Re-record when the score moves, then check the diff before committing.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const version = process.argv[2] ?? 'latest';
const url = 'https://rankcli.dev';
const args = ['audit', '-u', url, '--max-pages', '1'];
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data/hero-run');

const home = mkdtempSync(path.join(tmpdir(), 'rankcli-hero-'));
const prefix = mkdtempSync(path.join(tmpdir(), 'rankcli-hero-pkg-'));
try {
  execFileSync('npm', ['install', '--prefix', prefix, '--silent', `@rankcli/cli@${version}`], { stdio: 'inherit' });
  const bin = path.join(prefix, 'node_modules', '.bin', 'rankcli');
  const cliVersion = execFileSync(bin, ['--version'], { encoding: 'utf8' }).trim();
  let exitCode = 0;
  let stdout: string;
  try {
    stdout = execFileSync(bin, args, { encoding: 'utf8', env: { ...process.env, HOME: home, NO_COLOR: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    const e = err as { status?: number; stdout?: string };
    exitCode = e.status ?? 1;
    stdout = e.stdout ?? '';
  }
  if (exitCode !== 0 || !/Score: \d+\/100/.test(stdout)) {
    throw new Error(`audit did not complete (exit ${exitCode}); raw.txt left unchanged`);
  }
  writeFileSync(path.join(outDir, 'raw.txt'), stdout);
  writeFileSync(
    path.join(outDir, 'meta.json'),
    JSON.stringify(
      {
        command: `rankcli ${args.join(' ')}`,
        cliPackage: '@rankcli/cli',
        cliVersion,
        recordedAt: new Date().toISOString().slice(0, 10),
        exitCode,
        recordedBy: 'scripts/record-hero-run.ts, empty HOME, NO_COLOR=1',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`recorded ${cliVersion}: ${stdout.match(/Score: \d+\/100/)?.[0]}`);
} finally {
  rmSync(home, { recursive: true, force: true });
  rmSync(prefix, { recursive: true, force: true });
}
