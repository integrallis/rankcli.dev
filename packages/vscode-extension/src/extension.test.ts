import { describe, it, expect, vi, beforeEach } from 'vitest';

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
        startLine: number,
        startChar: number,
        endLine?: number,
        endChar?: number
      ) {
        this.startLine = startLine;
        this.startChar = startChar;
        this.endLine = endLine ?? startLine;
        this.endChar = endChar ?? startChar;
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
          if (key === 'checks') return {
            title: true,
            metaDescription: true,
            openGraph: true,
            twitterCard: true,
            canonical: true,
            headings: true,
            images: true,
            links: true,
          };
          return defaultValue;
        },
      }),
    },
  };
});

// Import after mocking
import { analyzeDocument, SEOIssue } from './extension.js';
import * as vscode from 'vscode';

// Mock document
const createMockDocument = (text: string) => ({
  getText: () => text,
  positionAt: (offset: number) => ({ line: 0, character: offset }),
  languageId: 'html',
  uri: { fsPath: '/test/file.html' },
});

// Create config helper
const getConfig = () => vscode.workspace.getConfiguration();

describe('SEO Autopilot Extension', () => {
  let config: any;

  beforeEach(() => {
    config = getConfig();
  });

  describe('analyzeDocument', () => {
    it('detects missing title tag', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_TITLE')).toBe(true);
    });

    it('does not report title issue when present', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <title>Page Title</title>
</head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_TITLE')).toBe(false);
    });

    it('detects missing meta description', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_META_DESCRIPTION')).toBe(true);
    });

    it('does not report meta description when present', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
  <meta name="description" content="Page description">
</head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_META_DESCRIPTION')).toBe(false);
    });

    it('detects missing Open Graph tags', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_OG_TAGS')).toBe(true);
    });

    it('does not report OG tags when present', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
  <meta property="og:title" content="OG Title">
</head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_OG_TAGS')).toBe(false);
    });

    it('detects missing Twitter Card tags', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_TWITTER_CARD')).toBe(true);
    });

    it('detects missing canonical URL', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_CANONICAL')).toBe(true);
    });

    it('does not report canonical when present', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
  <link rel="canonical" href="https://example.com">
</head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_CANONICAL')).toBe(false);
    });

    it('detects missing H1 heading', () => {
      const text = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <h2>Section Title</h2>
</body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_H1')).toBe(true);
    });

    it('does not report H1 when present', () => {
      const text = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <h1>Page Title</h1>
</body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_H1')).toBe(false);
    });

    it('detects multiple H1 headings', () => {
      const text = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <h1>First H1</h1>
  <h1>Second H1</h1>
</body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MULTIPLE_H1')).toBe(true);
    });

    it('detects images without alt text', () => {
      const text = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <img src="image.png">
</body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'IMG_MISSING_ALT')).toBe(true);
    });

    it('does not report images with alt text', () => {
      const text = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <img src="image.png" alt="Description of image">
</body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'IMG_MISSING_ALT')).toBe(false);
    });

    it('detects empty links', () => {
      const text = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <a href="/page"></a>
</body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'EMPTY_LINK')).toBe(true);
    });

    it('does not report links with content', () => {
      const text = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <a href="/page">Click here</a>
</body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'EMPTY_LINK')).toBe(false);
    });

    it('returns no issues for well-optimized page', () => {
      const text = `<!DOCTYPE html>
<html>
<head>
  <title>Page Title - Brand</title>
  <meta name="description" content="A detailed description of this page.">
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

      expect(issues.length).toBe(0);
    });

    it('respects disabled checks', () => {
      const disabledConfig = {
        get: (key: string, defaultValue: any) => {
          if (key === 'enabled') return true;
          if (key === 'severity') return 'warning';
          if (key === 'checks') return {
            title: false, // Disabled
            metaDescription: false, // Disabled
            openGraph: false,
            twitterCard: false,
            canonical: false,
            headings: false,
            images: true,
            links: true,
          };
          return defaultValue;
        },
      };

      const text = `<!DOCTYPE html>
<html>
<head></head>
<body></body>
</html>`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, disabledConfig);

      expect(issues.some(i => i.code === 'MISSING_TITLE')).toBe(false);
      expect(issues.some(i => i.code === 'MISSING_META_DESCRIPTION')).toBe(false);
    });
  });

  describe('JSX/React support', () => {
    it('detects missing title in JSX', () => {
      const text = `export default function Page() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>Content</body>
    </html>
  );
}`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'MISSING_TITLE')).toBe(true);
    });

    it('detects images without alt in JSX', () => {
      const text = `export default function Page() {
  return (
    <div>
      <img src="/logo.png" />
    </div>
  );
}`;
      const doc = createMockDocument(text);
      const issues = analyzeDocument(text, doc as any, config);

      expect(issues.some(i => i.code === 'IMG_MISSING_ALT')).toBe(true);
    });
  });
});
