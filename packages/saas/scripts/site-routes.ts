/**
 * The public, indexable pages of rankcli.dev: what the build prerenders
 * (scripts/prerender.ts) and what goes in sitemap.xml
 * (scripts/generate-sitemap.ts).
 *
 * Adding a public page to src/routes.tsx? Add it here too, or crawlers that
 * don't run JavaScript won't see it and search engines won't be told about it.
 * App screens (sign-in, dashboard, share links) don't belong here; they are
 * served by the SPA shell through the rewrites in scripts/prerender.ts.
 */
import { blogPosts } from '../src/data/blog-posts';
import frameworkGuides from '../src/config/framework-guides.json';
import comparisons from '../src/config/comparisons.json';

export const SITE_URL = 'https://rankcli.dev';

export interface SiteRoute {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
  /**
   * Files (relative to packages/saas) whose last commit dates the page's
   * content, for <lastmod>.
   */
  sources?: string[];
  /** A known content date (YYYY-MM-DD); used instead of `sources`. */
  lastmod?: string;
}

const staticRoutes: SiteRoute[] = [
  {
    path: '/',
    changefreq: 'weekly',
    priority: 1.0,
    sources: ['src/pages/LandingPage.tsx', 'src/components/landing', 'src/data/faqs.ts', 'src/config/pricing-tiers.json'],
  },
  {
    path: '/pricing',
    changefreq: 'monthly',
    priority: 0.9,
    sources: ['src/pages/PricingPage.tsx', 'src/components/landing/Pricing.tsx', 'src/components/pricing', 'src/config/pricing-tiers.json'],
  },
  { path: '/free-audit', changefreq: 'monthly', priority: 0.9, sources: ['src/pages/FreeAuditPage.tsx'] },
  { path: '/docs', changefreq: 'weekly', priority: 0.8, sources: ['src/pages/DocsPage.tsx'] },
  { path: '/blog', changefreq: 'weekly', priority: 0.8, sources: ['src/pages/BlogPage.tsx', 'src/data/blog-posts.ts'] },
  { path: '/tools/meta-tag-analyzer', changefreq: 'monthly', priority: 0.7, sources: ['src/pages/tools/MetaTagAnalyzerPage.tsx'] },
  { path: '/tools/og-image-preview', changefreq: 'monthly', priority: 0.7, sources: ['src/pages/tools/OgImagePreviewPage.tsx'] },
  { path: '/tools/ai-visibility', changefreq: 'monthly', priority: 0.7, sources: ['src/pages/tools/AIVisibilityCheckerPage.tsx'] },
  { path: '/tools/chatgpt-checker', changefreq: 'monthly', priority: 0.7, sources: ['src/pages/tools/ChatGPTCheckerPage.tsx'] },
  { path: '/tools/compare', changefreq: 'monthly', priority: 0.7, sources: ['src/pages/tools/CompetitorAnalyzerPage.tsx'] },
  { path: '/changelog', changefreq: 'weekly', priority: 0.6, sources: ['src/pages/ChangelogPage.tsx'] },
  { path: '/about', changefreq: 'yearly', priority: 0.5, sources: ['src/pages/AboutPage.tsx'] },
  { path: '/contact', changefreq: 'yearly', priority: 0.4, sources: ['src/pages/ContactPage.tsx'] },
  { path: '/bot', changefreq: 'yearly', priority: 0.2, sources: ['src/pages/BotPage.tsx'] },
  { path: '/privacy', changefreq: 'yearly', priority: 0.3, sources: ['src/pages/PrivacyPage.tsx'] },
  { path: '/terms', changefreq: 'yearly', priority: 0.3, sources: ['src/pages/TermsPage.tsx'] },
];

const blogRoutes: SiteRoute[] = blogPosts.map((post) => ({
  path: `/blog/${post.slug}`,
  changefreq: 'monthly',
  priority: 0.7,
  lastmod: post.updatedAt ?? post.publishedAt,
}));

// One page per framework we ship a recipe for, generated from the recipes themselves by
// scripts/generate-framework-guides.mjs. These are the pages someone searching "SvelteKit SEO"
// should land on, so they have to be prerendered and in the sitemap like any other public page.
const frameworkRoutes: SiteRoute[] = [
  {
    path: '/seo',
    changefreq: 'weekly',
    priority: 0.8,
    sources: ['src/pages/FrameworkGuidesIndexPage.tsx', 'src/config/framework-guides.json'],
  },
  ...frameworkGuides.guides.map((guide) => ({
    path: `/seo/${guide.slug}`,
    changefreq: 'monthly' as const,
    priority: 0.7,
    sources: ['src/pages/FrameworkGuidePage.tsx', 'src/config/framework-guides.json'],
  })),
];

// Comparison and alternative pages, one per rival, from src/config/comparisons.json.
type ComparisonEntry = { slug: string; kind: string; verifiedAt: string; draft?: boolean };
const comparisonRoutes: SiteRoute[] = (comparisons.comparisons as ComparisonEntry[])
  .filter((c) => !c.draft)
  .map((c) => ({
    path: `/${c.kind}/${c.slug}`,
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: c.verifiedAt,
  }));

export const siteRoutes: SiteRoute[] = [...staticRoutes, ...blogRoutes, ...frameworkRoutes, ...comparisonRoutes];

/** Absolute URL for a route, matching the canonical <SEO> emits. */
export function routeUrl(path: string) {
  return `${SITE_URL}${path}`;
}
