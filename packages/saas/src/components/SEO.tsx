import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  product?: {
    price?: number;
    currency?: string;
    availability?: 'in stock' | 'out of stock' | 'preorder';
  };
}

const BASE_URL = 'https://rankcli.dev';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'RankCLI';
const TWITTER_HANDLE = '@rankcli';

export function SEO({
  title,
  description = 'Ship code, get ranked. Get cited, not just crawled. 200+ automated SEO + GEO checks, auto-fix PRs, GitHub integration.',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  article,
  product,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Ship code, get ranked`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />

      {/* Article-specific tags */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Product-specific tags */}
      {type === 'product' && product && (
        <>
          {product.price && (
            <>
              <meta property="product:price:amount" content={String(product.price)} />
              <meta property="product:price:currency" content={product.currency || 'USD'} />
            </>
          )}
          {product.availability && (
            <meta property="product:availability" content={product.availability} />
          )}
        </>
      )}
    </Helmet>
  );
}

/**
 * Pre-configured SEO for common pages
 */
export const PageSEO = {
  Landing: () => (
    <SEO
      description="Ship code, get ranked. Get cited, not just crawled. 200+ automated SEO + GEO checks, auto-fix PRs, GitHub integration. Engineering as marketing."
      url="/"
    />
  ),

  Pricing: () => (
    <SEO
      title="Pricing"
      description="Simple, transparent pricing for RankCLI. Start free, upgrade when you need more. Solo, Pro, and Agency plans available."
      url="/pricing"
    />
  ),

  FreeAudit: () => (
    <SEO
      title="Free SEO Audit"
      description="Get a free SEO audit of your website. Analyze meta tags, headings, images, and more. No signup required."
      url="/free-audit"
    />
  ),

  Login: () => (
    <SEO
      title="Login"
      description="Sign in to your RankCLI account to manage your sites and SEO audits."
      url="/login"
      noindex
    />
  ),

  Signup: () => (
    <SEO
      title="Sign Up"
      description="Create your RankCLI account. Start with a free audit and upgrade anytime."
      url="/signup"
    />
  ),

  Dashboard: () => (
    <SEO
      title="Dashboard"
      description="Manage your sites, view audit results, and track SEO improvements."
      url="/dashboard"
      noindex
    />
  ),

  Billing: () => (
    <SEO
      title="Billing"
      description="Manage your subscription and billing details."
      url="/account/billing"
      noindex
    />
  ),

  Account: () => (
    <SEO
      title="Account Settings"
      description="Manage your account settings and preferences."
      url="/account"
      noindex
    />
  ),
};
