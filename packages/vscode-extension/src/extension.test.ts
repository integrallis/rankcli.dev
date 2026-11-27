import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

// Mock vscode module - must be inline since vi.mock is hoisted
vi.mock('vscode', () => {
  return {
    DiagnosticSeverity: {
      Error: 0,
      Warning: 1,
      Information: 2,
      Hint: 3,
    },
    Range: class MockRange {
      startLine: number;
      startChar: number;
      endLine: number;
      endChar: number;
      constructor(
        startOrLine: any,
        endOrChar: any,
        endLine?: number,
        endChar?: number
      ) {
        if (typeof startOrLine === 'object') {
          this.startLine = startOrLine.line;
          this.startChar = startOrLine.character;
          this.endLine = endOrChar.line;
          this.endChar = endOrChar.character;
        } else {
          this.startLine = startOrLine;
          this.startChar = endOrChar;
          this.endLine = endLine ?? startOrLine;
          this.endChar = endChar ?? endOrChar;
        }
      }
      get start() {
        return { line: this.startLine, character: this.startChar };
      }
      get end() {
        return { line: this.endLine, character: this.endChar };
      }
    },
    Position: class MockPosition {
      constructor(public line: number, public character: number) {}
    },
    Diagnostic: class MockDiagnostic {
      code?: string;
      source?: string;
      constructor(
        public range: any,
        public message: string,
        public severity: number
      ) {}
    },
    workspace: {
      getConfiguration: () => ({
        get: (key: string, defaultValue: any) => {
          if (key === 'enabled') return true;
          if (key === 'severity') return 'warning';
          if (key === 'defaultUrl') return 'https://example.com';
          if (key === 'checks') {
            return {
              title: true,
              metaDescription: true,
              openGraph: true,
              twitterCard: true,
              canonical: true,
              headings: true,
              images: true,
              links: true,
              noindex: true,
              robotsTxt: true,
            };
          }
          return defaultValue;
        },
      }),
    },
  };
});

import * as vscode from 'vscode';
import { analyzeDocument } from './extension';
import { isPageDocument, lintDocumentText, lintRobotsTxt } from './lint-document';
import {
  buildConfigTemplate,
  buildGateSpecFromConfig,
  detectBuildDirectory,
  formatAuditMarkdown,
  normalizeUrl,
  runWorkspaceAudit,
} from './audit-runner';
import { renderReportHtml } from './report-panel';

describe('manifest agreement & packaging safety', () => {
  const source = fs.readFileSync(path.join(__dirname, 'extension.ts'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const vscodeignore = fs.readFileSync(path.join(__dirname, '..', '.vscodeignore'), 'utf8');

  it('declares every command id the code registers or binds', () => {
    const declared = new Set(manifest.contributes.commands.map((c: { command: string }) => c.command));
    const used = [...source.matchAll(/(?:registerCommand\(|\.command = )'([^']+)'/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThanOrEqual(6);
    for (const id of used) {
      expect(declared.has(id), id).toBe(true);
    }
  });

  it('reads the configuration section the manifest declares', () => {
    const sections = [...source.matchAll(/getConfiguration\('([^']+)'\)/g)].map((m) => m[1]);
    const properties = Object.keys(manifest.contributes.configuration.properties);
    expect(sections.length).toBeGreaterThan(0);
    for (const section of sections) {
      expect(properties.some((p) => p.startsWith(`${section}.`)), section).toBe(true);
    }
  });

  it('uses the Integrallis publisher and ships an existing icon', () => {
    expect(manifest.publisher).toBe('Integrallis');
    expect(manifest.name).toBe('rankcli-vscode');
    expect(manifest.icon).toBe('images/icon.png');
    expect(fs.existsSync(path.join(__dirname, '..', manifest.icon))).toBe(true);
  });

  it('keeps an allowlist .vscodeignore so workspace secrets are never packaged', () => {
    expect(vscodeignore).toContain('**');
    expect(vscodeignore).toContain('!dist/extension.js');
    expect(vscodeignore).toContain('!images/icon.png');
    expect(vscodeignore).toContain('!package.json');
  });
});

const createMockDocument = (text: string, languageId = 'html', fsPath = '/test/index.html') => ({
  getText: () => text,
  positionAt: (offset: number) => ({ line: 0, character: offset }),
  languageId,
  uri: { fsPath },
});

describe('HTML & framework markup linting', () => {
  let config: any;

  beforeEach(() => {
    config = vscode.workspace.getConfiguration();
  });

  it('detects missing title, meta description, OG, Twitter, canonical, and H1 on full HTML pages', () => {
    const text = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <h2>Subheading</h2>
</body>
</html>`;
    const doc = createMockDocument(text);
    const issues = analyzeDocument(text, doc as any, config);
    const codes = issues.map((i) => i.code);

    expect(codes).toContain('MISSING_TITLE');
    expect(codes).toContain('MISSING_META_DESCRIPTION');
    expect(codes).toContain('MISSING_OG_TAGS');
    expect(codes).toContain('MISSING_TWITTER_CARD');
    expect(codes).toContain('MISSING_CANONICAL');
    expect(codes).toContain('MISSING_H1');
  });

  it('returns no issues for a well-optimized HTML page', () => {
    const text = `<!DOCTYPE html>
<html>
<head>
  <title>Page Title - Brand</title>
  <meta name="description" content="A clear description of this page.">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Description">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title">
  <link rel="canonical" href="https://example.com/page">
</head>
<body>
  <h1>Main Heading</h1>
  <img src="image.png" alt="Descriptive alt text">
  <a href="/link">Link text</a>
</body>
</html>`;
    const doc = createMockDocument(text);
    const issues = analyzeDocument(text, doc as any, config);
    expect(issues).toEqual([]);
  });

  it('does NOT fire page-level false positives on React/Vue/Svelte UI components', () => {
    const buttonTsx = `export function PrimaryButton({ label }: { label: string }) {
  return <button className="btn">{label}</button>;
}`;
    expect(isPageDocument(buttonTsx, 'typescriptreact')).toBe(false);

    const issues = lintDocumentText(buttonTsx, {
      languageId: 'typescriptreact',
      filePath: '/src/components/PrimaryButton.tsx',
    });
    expect(issues).toEqual([]);
  });

  it('still catches component-safe issues (missing img alt, empty link) inside JSX components', () => {
    const cardTsx = `export function Card() {
  return (
    <div>
      <img src="/hero.png" />
      <img src="/ok.png" alt={dynamicAlt} />
      <a href="/x"></a>
      <a href="/icon" aria-label="Close"></a>
    </div>
  );
}`;
    const issues = lintDocumentText(cardTsx, {
      languageId: 'typescriptreact',
      filePath: '/src/components/Card.tsx',
    });
    const codes = issues.map((i) => i.code);
    expect(codes).toEqual(['IMG_MISSING_ALT', 'EMPTY_LINK']);
  });

  it('recognizes Next.js App Router metadata exports and flags robots.index = false', () => {
    const goodPage = `export const metadata = {
  title: 'Pricing',
  description: 'Simple transparent pricing for developers.',
  openGraph: { title: 'Pricing' },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://example.com/pricing' },
};`;
    expect(isPageDocument(goodPage, 'typescriptreact')).toBe(true);
    expect(lintDocumentText(goodPage, { languageId: 'typescriptreact' })).toEqual([]);

    const noindexPage = `export const metadata = {
  title: 'Staging',
  description: 'Desc',
  openGraph: { title: 'Staging' },
  twitter: { card: 'summary' },
  alternates: { canonical: 'https://example.com' },
  robots: { index: false, follow: false },
};`;
    const issues = lintDocumentText(noindexPage, { languageId: 'typescriptreact' });
    expect(issues.some((i) => i.code === 'STRAY_NOINDEX' && i.severity === 'error')).toBe(true);
  });

  it('detects stray HTML robots noindex, empty/long titles, and multiple H1s', () => {
    const text = `<!DOCTYPE html>
<html>
<head>
  <title>This is an intentionally very long title that exceeds sixty characters by quite a bit</title>
  <meta name="description" content="Valid description">
  <meta name="robots" content="noindex, nofollow">
  <meta property="og:title" content="T">
  <meta name="twitter:card" content="summary">
  <link rel="canonical" href="https://example.com/">
</head>
<body>
  <h1>First</h1>
  <h1>Second</h1>
</body>
</html>`;
    const issues = lintDocumentText(text, { languageId: 'html' });
    const codes = issues.map((i) => i.code);
    expect(codes).toContain('TITLE_TOO_LONG');
    expect(codes).toContain('STRAY_NOINDEX');
    expect(codes).toContain('MULTIPLE_H1');
  });
});

describe('robots.txt AI crawler linting (powered by @rankcli/agent-runtime)', () => {
  it('flags wildcard Disallow: / across bot classes with evidence-based severities', () => {
    const robots = `User-agent: *\nDisallow: /\n`;
    const findings = lintRobotsTxt(robots, 'https://rankcli.dev');

    const byCode = Object.fromEntries(findings.map((f) => [f.code, f]));
    expect(byCode.SEARCH_BOTS_DISALLOWED?.severity).toBe('error');
    expect(byCode.AI_SEARCH_BOTS_DISALLOWED?.severity).toBe('error');
    expect(byCode.AI_SEARCH_BOTS_DISALLOWED?.fix?.title).toContain('AI-search-friendly');
    expect(byCode.AI_USER_FETCH_DISALLOWED?.severity).toBe('warning');
    expect(byCode.AI_TRAINING_BOTS_DISALLOWED?.severity).toBe('information');
    expect(byCode.SITEMAP_NOT_IN_ROBOTS?.severity).toBe('information');
  });

  it('treats disallowing training bots alone as informational policy with no errors', () => {
    const robots = `User-agent: *
Allow: /

User-agent: GPTBot
User-agent: ClaudeBot
Disallow: /

Sitemap: https://rankcli.dev/sitemap.xml
`;
    const findings = lintRobotsTxt(robots, 'https://rankcli.dev');
    expect(findings.filter((f) => f.severity === 'error')).toEqual([]);
    expect(findings.filter((f) => f.severity === 'warning')).toEqual([]);
    expect(findings.some((f) => f.code === 'AI_TRAINING_BOTS_DISALLOWED' && f.severity === 'information')).toBe(true);
  });

  it('routes robots.txt files automatically through lintDocumentText', () => {
    const findings = lintDocumentText('User-agent: OAI-SearchBot\nDisallow: /\n', {
      languageId: 'plaintext',
      filePath: '/project/public/robots.txt',
    });
    expect(findings.some((f) => f.code === 'AI_SEARCH_BOTS_DISALLOWED')).toBe(true);
  });
});

describe('audit-runner & local build-directory engine audit', () => {
  it('normalizes URLs cleanly', () => {
    expect(normalizeUrl('rankcli.dev')).toBe('https://rankcli.dev');
    expect(normalizeUrl('https://rankcli.dev/docs')).toBe('https://rankcli.dev/docs');
  });

  it('detects build directories and builds config templates with framework detection', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rankcli-vscode-'));
    try {
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({ dependencies: { astro: '^5.0.0' } })
      );
      fs.mkdirSync(path.join(tmpDir, 'dist'));
      fs.writeFileSync(path.join(tmpDir, 'dist', 'index.html'), '<!doctype html><html><head><title>Hi</title></head><body><h1>Hi</h1></body></html>');

      expect(detectBuildDirectory(tmpDir)).toBe(path.join(tmpDir, 'dist'));
      const cfg = buildConfigTemplate(tmpDir, 'https://example.com');
      expect(cfg.framework).toBe('astro');
      expect(cfg.dir).toBe('dist');
      expect(cfg.url).toBe('https://example.com');

      const gateSpec = buildGateSpecFromConfig(cfg);
      expect(gateSpec.failOn).toBe('error');
      expect(gateSpec.budgets).toContainEqual({ category: 'overall', min: 80 });
      expect(gateSpec.budgets).toContainEqual({ category: 'aiReadiness', min: 70 });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('runs a real 280+ check local build-directory audit and renders the webview report', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rankcli-vscode-audit-'));
    try {
      const distDir = path.join(tmpDir, 'dist');
      fs.mkdirSync(distDir);
      fs.writeFileSync(
        path.join(distDir, 'index.html'),
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Test Site — Developer SEO</title>
  <meta name="description" content="A local static build tested by RankCLI VS Code extension." />
  <link rel="canonical" href="https://example.com/" />
</head>
<body>
  <main>
    <h1>Developer SEO Audit</h1>
    <p>RankCLI checks technical SEO and AI-search readiness locally before you deploy.</p>
  </main>
</body>
</html>`
      );

      const summary = await runWorkspaceAudit({
        mode: 'dir',
        url: 'https://example.com',
        dir: distDir,
        workspaceRoot: tmpDir,
        maxPages: 1,
      });

      expect(summary.score).toBeGreaterThan(0);
      expect(summary.score).toBeLessThanOrEqual(100);
      expect(summary.pagesAudited).toBe(1);
      expect(summary.checksRun).toBeGreaterThan(50);

      const md = formatAuditMarkdown(summary);
      expect(md).toContain('# RankCLI Audit Report');
      expect(md).toContain('AI Readiness');

      const html = renderReportHtml(summary, 'testnonce123');
      expect(html).toContain("script-src 'nonce-testnonce123'");
      expect(html).toContain('RankCLI SEO &amp; AI Search Report');
      expect(html).toContain(summary.aiReadinessNote);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }, 30000);
});
