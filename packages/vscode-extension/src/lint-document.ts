import * as path from 'path';
import { analyzers } from '@rankcli/agent-runtime';

export type LintSeverity = 'error' | 'warning' | 'information' | 'hint';

export interface LintFix {
  title: string;
  newText: string;
  startOffset: number;
  endOffset: number;
}

export interface LintFinding {
  code: string;
  message: string;
  severity: LintSeverity;
  startOffset: number;
  endOffset: number;
  fix?: LintFix;
}

export interface LintChecksConfig {
  title?: boolean;
  metaDescription?: boolean;
  openGraph?: boolean;
  twitterCard?: boolean;
  canonical?: boolean;
  headings?: boolean;
  images?: boolean;
  links?: boolean;
  noindex?: boolean;
  robotsTxt?: boolean;
}

export interface LintOptions {
  languageId: string;
  filePath?: string;
  defaultSeverity?: LintSeverity;
  checks?: LintChecksConfig;
  siteUrl?: string;
}

const SUPPORTED_MARKUP_LANGUAGES = new Set([
  'html',
  'javascriptreact',
  'typescriptreact',
  'vue',
  'astro',
  'svelte',
]);

export function isSupportedMarkupLanguage(languageId: string): boolean {
  return SUPPORTED_MARKUP_LANGUAGES.has(languageId);
}

export function isRobotsFile(filePath?: string): boolean {
  if (!filePath) return false;
  return path.basename(filePath).toLowerCase() === 'robots.txt';
}

export function isSupportedDocument(languageId: string, filePath?: string): boolean {
  return isSupportedMarkupLanguage(languageId) || isRobotsFile(filePath);
}

/**
 * Determine whether a file represents a full page/layout document rather than a reusable UI component.
 *
 * Page-level checks (missing <title>, meta description, OG, Twitter Card, canonical, missing H1)
 * only apply to page documents so normal components like Button.tsx or Card.vue do not get noisy
 * false positives.
 */
export function isPageDocument(text: string, languageId: string): boolean {
  if (languageId === 'html') {
    // Only treat HTML as a full page when it has document structure (not a small partial/snippet).
    return /<!doctype\b|<html\b|<head\b|<body\b/i.test(text);
  }

  // For JSX/TSX/Vue/Astro/Svelte, require an explicit document/head/metadata declaration.
  return (
    /<!doctype\b|<html\b|<head\b|<Head\b|<Helmet\b|<svelte:head\b/i.test(text) ||
    /\bexport\s+(?:const|let)\s+metadata\b/.test(text) ||
    /\bexport\s+(?:async\s+)?function\s+generateMetadata\b/.test(text) ||
    /\buseSeoMeta\s*\(|\buseHead\s*\(/.test(text)
  );
}

function findHeadOffset(text: string): { start: number; end: number } | null {
  const match = text.match(/<head[^>]*>|<Head[^>]*>|<Helmet[^>]*>|<svelte:head[^>]*>/);
  if (match && match.index !== undefined) {
    return { start: match.index, end: match.index + match[0].length };
  }
  return null;
}

function findMetadataAnchor(text: string): { start: number; end: number } {
  const head = findHeadOffset(text);
  if (head) return head;

  const metaExport = text.match(
    /\bexport\s+(?:const|let)\s+metadata\b|\bexport\s+(?:async\s+)?function\s+generateMetadata\b|\buseSeoMeta\s*\(|\buseHead\s*\(/
  );
  if (metaExport && metaExport.index !== undefined) {
    return { start: metaExport.index, end: metaExport.index + metaExport[0].length };
  }

  return { start: 0, end: Math.min(text.length, 1) };
}

function hasFrameworkMetadataBlock(text: string): boolean {
  return (
    /\bexport\s+(?:const|let)\s+metadata\b/.test(text) ||
    /\bexport\s+(?:async\s+)?function\s+generateMetadata\b/.test(text) ||
    /\buseSeoMeta\s*\(|\buseHead\s*\(/.test(text)
  );
}

function hasTitle(text: string): boolean {
  if (/<title[^>]*>[\s\S]*?<\/title>/i.test(text)) return true;
  if (hasFrameworkMetadataBlock(text) && /\btitle\s*:/.test(text)) return true;
  return false;
}

function hasMetaDescription(text: string): boolean {
  if (/<meta[^>]*name=["']description["'][^>]*>/i.test(text)) return true;
  if (hasFrameworkMetadataBlock(text) && /\bdescription\s*:/.test(text)) return true;
  return false;
}

function hasOpenGraph(text: string): boolean {
  if (/<meta[^>]*property=["']og:(?:title|description|image)["'][^>]*>/i.test(text)) return true;
  if (hasFrameworkMetadataBlock(text) && /\b(?:openGraph|ogTitle|ogDescription)\s*:/.test(text)) {
    return true;
  }
  return false;
}

function hasTwitterCard(text: string): boolean {
  if (/<meta[^>]*name=["']twitter:(?:card|title|description)["'][^>]*>/i.test(text)) return true;
  if (hasFrameworkMetadataBlock(text) && /\b(?:twitter|twitterCard|twitterTitle)\s*:/.test(text)) {
    return true;
  }
  return false;
}

function hasCanonical(text: string): boolean {
  if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(text)) return true;
  if (hasFrameworkMetadataBlock(text) && /\bcanonical\s*:/.test(text)) return true;
  return false;
}

function isHeadlessMetadataOnlyFile(text: string): boolean {
  // e.g. a Next.js layout/page with metadata export and no visible HTML body markup in the same snippet
  return hasFrameworkMetadataBlock(text) && !/<body\b|<main\b|<section\b|<div\b|<article\b/i.test(text);
}

export function lintRobotsTxt(text: string, siteUrl = 'https://example.com'): LintFinding[] {
  const findings: LintFinding[] = [];
  const analysis = analyzers.analyzeRobotsTxtForAI(text);

  const findDisallowOffset = (agents: string[]): { start: number; end: number } => {
    const lines = text.split(/\r?\n/);
    let offset = 0;
    let inMatchingGroup = false;
    let firstDisallow: { start: number; end: number } | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      const uaMatch = /^user-agent\s*:\s*(.+)$/i.exec(trimmed);
      if (uaMatch) {
        const ua = uaMatch[1].trim().toLowerCase();
        inMatchingGroup = ua === '*' || agents.some((a) => a.toLowerCase() === ua);
      } else if (/^disallow\s*:\s*\//i.test(trimmed)) {
        const range = { start: offset, end: offset + line.length };
        if (!firstDisallow) firstDisallow = range;
        if (inMatchingGroup) return range;
      }
      offset += line.length + 1;
    }

    return firstDisallow ?? { start: 0, end: Math.min(text.length, 1) };
  };

  const searchBlocked = analysis.byClass.search.blocked;
  if (searchBlocked.length > 0) {
    const range = findDisallowOffset(searchBlocked);
    findings.push({
      code: 'SEARCH_BOTS_DISALLOWED',
      message: `Search crawlers blocked (${searchBlocked.join(', ')}). Blocking search crawlers removes the site from search and most AI answers.`,
      severity: 'error',
      startOffset: range.start,
      endOffset: range.end,
    });
  }

  const aiSearchBlocked = analysis.byClass['ai-search'].blocked;
  if (aiSearchBlocked.length > 0) {
    const range = findDisallowOffset(aiSearchBlocked);
    findings.push({
      code: 'AI_SEARCH_BOTS_DISALLOWED',
      message: `AI search crawlers blocked (${aiSearchBlocked.join(', ')}). Blocking these crawlers removes the site from ChatGPT, Claude, and Perplexity search answers.`,
      severity: 'error',
      startOffset: range.start,
      endOffset: range.end,
      fix: {
        title: 'Replace with AI-search-friendly robots.txt',
        newText: analyzers.generateAIFriendlyRobotsTxt(siteUrl),
        startOffset: 0,
        endOffset: text.length,
      },
    });
  }

  const userBlocked = analysis.byClass.user.blocked;
  if (userBlocked.length > 0) {
    const range = findDisallowOffset(userBlocked);
    findings.push({
      code: 'AI_USER_FETCH_DISALLOWED',
      message: `User-triggered AI fetchers blocked (${userBlocked.join(', ')}). Assistants cannot fetch pages on demand when a user asks about your URL.`,
      severity: 'warning',
      startOffset: range.start,
      endOffset: range.end,
    });
  }

  const trainingBlocked = analysis.byClass.training.blocked;
  if (trainingBlocked.length > 0) {
    const range = findDisallowOffset(trainingBlocked);
    findings.push({
      code: 'AI_TRAINING_BOTS_DISALLOWED',
      message: `Training crawlers blocked (${trainingBlocked.join(', ')}). Policy choice: blocking training crawlers does not reduce search or AI-answer visibility.`,
      severity: 'information',
      startOffset: range.start,
      endOffset: range.end,
    });
  }

  if (text.trim().length > 0 && !/^\s*sitemap\s*:/im.test(text)) {
    const end = text.length;
    const prefix = text.endsWith('\n') ? '' : '\n';
    const cleanUrl = siteUrl.replace(/\/$/, '');
    findings.push({
      code: 'SITEMAP_NOT_IN_ROBOTS',
      message: 'No Sitemap directive in robots.txt. Add a Sitemap URL so search and AI crawlers discover pages cleanly.',
      severity: 'information',
      startOffset: 0,
      endOffset: Math.min(text.length, 1),
      fix: {
        title: 'Add Sitemap directive',
        newText: `${prefix}\nSitemap: ${cleanUrl}/sitemap.xml\n`,
        startOffset: end,
        endOffset: end,
      },
    });
  }

  return findings;
}

export function lintDocumentText(text: string, options: LintOptions): LintFinding[] {
  const checks = options.checks ?? {};
  const defaultSeverity = options.defaultSeverity ?? 'warning';

  if (isRobotsFile(options.filePath)) {
    if (checks.robotsTxt === false) return [];
    return lintRobotsTxt(text, options.siteUrl);
  }

  if (!isSupportedMarkupLanguage(options.languageId)) {
    return [];
  }

  const findings: LintFinding[] = [];
  const fullPage = isPageDocument(text, options.languageId);
  const head = findHeadOffset(text);
  const anchor = findMetadataAnchor(text);

  // Page-level metadata checks (skipped on UI components to prevent false positives)
  if (fullPage) {
    if (checks.title !== false) {
      if (!hasTitle(text)) {
        findings.push({
          code: 'MISSING_TITLE',
          message: 'Missing <title> tag. Every page should have a unique title (50-60 characters).',
          severity: defaultSeverity,
          startOffset: anchor.start,
          endOffset: anchor.end,
          fix: head
            ? {
                title: 'Add <title> tag',
                newText: '\n  <title>Page Title</title>',
                startOffset: head.end,
                endOffset: head.end,
              }
            : undefined,
        });
      } else {
        const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(text);
        if (titleMatch && titleMatch.index !== undefined) {
          const inner = titleMatch[1].replace(/\s+/g, ' ').trim();
          const hasTemplateExpr = /\{|\$\{|<%|{{/.test(inner);
          if (!hasTemplateExpr && inner.length === 0) {
            findings.push({
              code: 'EMPTY_TITLE',
              message: '<title> tag is empty. Add a descriptive page title.',
              severity: 'error',
              startOffset: titleMatch.index,
              endOffset: titleMatch.index + titleMatch[0].length,
            });
          } else if (!hasTemplateExpr && inner.length > 60) {
            findings.push({
              code: 'TITLE_TOO_LONG',
              message: `Title is ${inner.length} characters (recommended max 60 to avoid SERP truncation).`,
              severity: 'information',
              startOffset: titleMatch.index,
              endOffset: titleMatch.index + titleMatch[0].length,
            });
          }
        }
      }
    }

    if (checks.metaDescription !== false) {
      if (!hasMetaDescription(text)) {
        findings.push({
          code: 'MISSING_META_DESCRIPTION',
          message: 'Missing meta description. Add a 120-160 character summary for search engines.',
          severity: defaultSeverity,
          startOffset: anchor.start,
          endOffset: anchor.end,
          fix: head
            ? {
                title: 'Add meta description',
                newText: '\n  <meta name="description" content="Page description goes here" />',
                startOffset: head.end,
                endOffset: head.end,
              }
            : undefined,
        });
      } else {
        const descMatch = /<meta[^>]*name=["']description["'][^>]*>/i.exec(text);
        if (descMatch && descMatch.index !== undefined) {
          const contentMatch = /content=["']([^"']*)["']/i.exec(descMatch[0]);
          if (contentMatch) {
            const val = contentMatch[1].trim();
            if (val.length > 160 && !/\{|\$\{|{{/.test(val)) {
              findings.push({
                code: 'META_DESC_TOO_LONG',
                message: `Meta description is ${val.length} characters (recommended max 160).`,
                severity: 'information',
                startOffset: descMatch.index,
                endOffset: descMatch.index + descMatch[0].length,
              });
            }
          }
        }
      }
    }

    if (checks.openGraph !== false && !hasOpenGraph(text)) {
      findings.push({
        code: 'MISSING_OG_TAGS',
        message: 'Missing Open Graph tags. Add og:title, og:description, and og:image for social sharing.',
        severity: defaultSeverity,
        startOffset: anchor.start,
        endOffset: anchor.end,
        fix: head
          ? {
              title: 'Add Open Graph tags',
              newText:
                '\n  <meta property="og:title" content="Page Title" />' +
                '\n  <meta property="og:description" content="Page description" />' +
                '\n  <meta property="og:image" content="https://example.com/og-image.png" />' +
                '\n  <meta property="og:url" content="https://example.com/page" />',
              startOffset: head.end,
              endOffset: head.end,
            }
          : undefined,
      });
    }

    if (checks.twitterCard !== false && !hasTwitterCard(text)) {
      findings.push({
        code: 'MISSING_TWITTER_CARD',
        message: 'Missing Twitter Card tags. Add twitter:card, twitter:title, and twitter:description.',
        severity: defaultSeverity,
        startOffset: anchor.start,
        endOffset: anchor.end,
        fix: head
          ? {
              title: 'Add Twitter Card tags',
              newText:
                '\n  <meta name="twitter:card" content="summary_large_image" />' +
                '\n  <meta name="twitter:title" content="Page Title" />' +
                '\n  <meta name="twitter:description" content="Page description" />' +
                '\n  <meta name="twitter:image" content="https://example.com/og-image.png" />',
              startOffset: head.end,
              endOffset: head.end,
            }
          : undefined,
      });
    }

    if (checks.canonical !== false && !hasCanonical(text)) {
      findings.push({
        code: 'MISSING_CANONICAL',
        message: 'Missing canonical URL. Add rel="canonical" to prevent duplicate content issues.',
        severity: defaultSeverity,
        startOffset: anchor.start,
        endOffset: anchor.end,
        fix: head
          ? {
              title: 'Add canonical link',
              newText: '\n  <link rel="canonical" href="https://example.com/page" />',
              startOffset: head.end,
              endOffset: head.end,
            }
          : undefined,
      });
    }

    if (checks.headings !== false && !isHeadlessMetadataOnlyFile(text)) {
      if (!/<h1\b[^>]*>/i.test(text)) {
        findings.push({
          code: 'MISSING_H1',
          message: 'Missing H1 heading. Each page should have one primary H1.',
          severity: defaultSeverity,
          startOffset: 0,
          endOffset: Math.min(text.length, 1),
        });
      }
    }
  }

  // Component-safe checks (run on both full pages and individual components)
  if (checks.noindex !== false) {
    const noindexRegex =
      /<meta\b[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*>|<meta\b[^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*name=["'](?:robots|googlebot)["'][^>]*>/gi;
    let match: RegExpExecArray | null;
    while ((match = noindexRegex.exec(text)) !== null) {
      findings.push({
        code: 'STRAY_NOINDEX',
        message: 'Page has a robots noindex directive. Verify this is intentional — a stray noindex deindexes the page.',
        severity: 'error',
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        fix: {
          title: 'Remove noindex directive',
          newText: match[0].replace(/\bnoindex\b\s*,?\s*/i, ''),
          startOffset: match.index,
          endOffset: match.index + match[0].length,
        },
      });
    }

    const nextNoindexRegex = /\brobots\s*:\s*\{[^}]*\bindex\s*:\s*false\b[^}]*\}/g;
    while ((match = nextNoindexRegex.exec(text)) !== null) {
      findings.push({
        code: 'STRAY_NOINDEX',
        message: 'Metadata sets robots.index = false (noindex). Verify this is intentional before deploying.',
        severity: 'error',
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }

  if (checks.headings !== false) {
    const h1Matches = [...text.matchAll(/<h1\b[^>]*>/gi)];
    if (h1Matches.length > 1) {
      const second = h1Matches[1];
      const start = second.index ?? 0;
      findings.push({
        code: 'MULTIPLE_H1',
        message: `Found ${h1Matches.length} H1 headings. Prefer a single primary H1 per page.`,
        severity: defaultSeverity,
        startOffset: start,
        endOffset: start + second[0].length,
      });
    }
  }

  if (checks.images !== false) {
    const imgRegex = /<img\b[^>]*>/gi;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(text)) !== null) {
      const imgTag = match[0];
      // Accept static alt="...", decorative alt="", JSX alt={...}, and Vue :alt="..." / v-bind:alt="..."
      const hasAlt = /(?:^|[\s:])(?:v-bind:)?alt\s*=\s*(?:["'][^"']*["']|\{[^}]+\})/i.test(imgTag);
      if (!hasAlt) {
        findings.push({
          code: 'IMG_MISSING_ALT',
          message: 'Image missing alt attribute. Add descriptive alt text (or alt="" for decorative images).',
          severity: defaultSeverity,
          startOffset: match.index,
          endOffset: match.index + imgTag.length,
          fix: {
            title: 'Add alt attribute',
            newText: imgTag.replace(/<img\b/i, '<img alt="Image description"'),
            startOffset: match.index,
            endOffset: match.index + imgTag.length,
          },
        });
      }
    }
  }

  if (checks.links !== false) {
    const linkRegex = /<a\b([^>]*)>([\s]*)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(text)) !== null) {
      const attrs = match[1] ?? '';
      const hasAccessibleName = /\b(?:aria-label|aria-labelledby|title)\s*=/i.test(attrs);
      if (!hasAccessibleName) {
        findings.push({
          code: 'EMPTY_LINK',
          message: 'Link has no visible text or accessible name (aria-label). Add descriptive link text for accessibility and SEO.',
          severity: defaultSeverity,
          startOffset: match.index,
          endOffset: match.index + match[0].length,
        });
      }
    }
  }

  return findings;
}
