import { Helmet } from 'react-helmet-async';

export const SITE_URL = 'https://rankcli.dev';
const SITE_NAME = 'RankCLI';
const DEFAULT_TITLE = 'RankCLI - Ship code, get ranked';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_DESCRIPTION =
  'RankCLI is a developer-first SEO and GEO tool: 280+ checks from your terminal or CI, framework-aware fixes, and GitHub auto-fix PRs. Free to start.';

/** Public profiles, in the footer and in the Organization schema's sameAs. */
export const SOCIAL_PROFILES = [
  { label: 'GitHub', href: 'https://github.com/integrallis/rankcli-cli' },
  { label: 'npm', href: 'https://www.npmjs.com/package/@rankcli/cli' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/rankclidev.bsky.social' },
  { label: 'Dev.to', href: 'https://dev.to/rankcli' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/rankcli' },
];

/** Site-wide Organization, added to every page that does not declare its own. */
export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: SOCIAL_PROFILES.map((p) => p.href),
  parentOrganization: { '@type': 'Organization', name: 'Integrallis Software, LLC', url: 'https://integrallis.com' },
};

interface SEOProps {
  /** Page name; rendered as "<title> | RankCLI". */
  title?: string;
  /** Used verbatim instead of the "<title> | RankCLI" template. */
  fullTitle?: string;
  description?: string;
  /** Site-relative path of the canonical URL, e.g. "/pricing". */
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  /** Keeps the page out of search results; also drops the canonical. */
  noindex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  /** Structured data for this page only. */
  jsonLd?: object | object[];
}

/** JSON for a <script> body: `<` is escaped so no string can close the tag. */
function toScriptJson(data: object) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Site-wide head defaults. Page-level <SEO> tags override these (Helmet
 * dedupes by name/property, and the deeper component wins). They live here
 * rather than in index.html because Helmet can't remove static tags, which
 * left every page with a second, homepage canonical and description.
 */
export function DefaultSEO() {
  return (
    <Helmet defaultTitle={DEFAULT_TITLE}>
      <meta name="description" content={DEFAULT_DESCRIPTION} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />
    </Helmet>
  );
}

export function SEO({
  title,
  fullTitle,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  imageAlt,
  type = 'website',
  noindex = false,
  article,
  jsonLd,
}: SEOProps) {
  const pageTitle = fullTitle ?? (title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE);
  const url = path ? `${SITE_URL}${path === '/' ? '/' : path}` : undefined;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  const pageData = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const hasOrganization = pageData.some(
    (d) => (d as { '@type'?: string })['@type'] === 'Organization'
  );
  const structuredData = hasOrganization ? pageData : [...pageData, ORGANIZATION_JSON_LD];

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {url && !noindex && <link rel="canonical" href={url} />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={imageUrl} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}

      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {type === 'article' && article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {type === 'article' && article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {type === 'article' && article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      {type === 'article' &&
        article?.tags?.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      {structuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {toScriptJson(data)}
        </script>
      ))}
    </Helmet>
  );
}
