// Auto-generated Deno-compatible audit bundle
// Do not edit manually - regenerate with: pnpm build:deno
// Generated: 2026-02-17T18:13:45.329Z

// Polyfill for Node's Buffer if needed
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = {
    from: (str, encoding) => new TextEncoder().encode(str),
    isBuffer: () => false
  };
}


// src/audit/types.ts
var ISSUE_DEFINITIONS = {
  // ==================== CRAWLABILITY ====================
  ROBOTS_TXT_MISSING: {
    code: "ROBOTS_TXT_MISSING",
    severity: "warning",
    category: "crawlability",
    title: "Missing robots.txt",
    description: "No robots.txt file found at the root of the domain.",
    impact: "Search engines cannot determine crawling rules for your site.",
    howToFix: "Create a robots.txt file at the root of your domain with appropriate directives."
  },
  ROBOTS_TXT_BLOCKS_ALL: {
    code: "ROBOTS_TXT_BLOCKS_ALL",
    severity: "error",
    category: "crawlability",
    title: "robots.txt blocks all crawlers",
    description: 'The robots.txt file contains "Disallow: /" which blocks all search engines.',
    impact: "Your entire site will not be indexed by search engines.",
    howToFix: "Update robots.txt to allow crawling of important pages."
  },
  SITEMAP_MISSING: {
    code: "SITEMAP_MISSING",
    severity: "warning",
    category: "crawlability",
    title: "Missing XML sitemap",
    description: "No sitemap.xml found at standard locations.",
    impact: "Search engines may not discover all your pages efficiently.",
    howToFix: "Create an XML sitemap and submit it to search engines."
  },
  SITEMAP_NOT_IN_ROBOTS: {
    code: "SITEMAP_NOT_IN_ROBOTS",
    severity: "notice",
    category: "crawlability",
    title: "Sitemap not referenced in robots.txt",
    description: "The sitemap URL is not listed in robots.txt.",
    impact: "Search engines may not find your sitemap automatically.",
    howToFix: 'Add "Sitemap: https://yoursite.com/sitemap.xml" to robots.txt.'
  },
  REDIRECT_CHAIN: {
    code: "REDIRECT_CHAIN",
    severity: "warning",
    category: "crawlability",
    title: "Redirect chain detected",
    description: "Multiple redirects before reaching the final destination.",
    impact: "Wastes crawl budget and reduces link equity passed to the final page.",
    howToFix: "Update redirects to point directly to the final destination URL."
  },
  REDIRECT_LOOP: {
    code: "REDIRECT_LOOP",
    severity: "error",
    category: "crawlability",
    title: "Redirect loop detected",
    description: "Redirects create an infinite loop.",
    impact: "Page is completely inaccessible to users and search engines.",
    howToFix: "Fix the redirect configuration to break the loop."
  },
  ORPHAN_PAGE: {
    code: "ORPHAN_PAGE",
    severity: "warning",
    category: "crawlability",
    title: "Orphan page (no internal links)",
    description: "This page has no internal links pointing to it.",
    impact: "Search engines may not discover this page, and it receives no link equity.",
    howToFix: "Add internal links from relevant pages to this page."
  },
  // ==================== INDEXABILITY ====================
  NOINDEX_TAG: {
    code: "NOINDEX_TAG",
    severity: "notice",
    category: "indexability",
    title: "Page has noindex tag",
    description: "The page contains a noindex meta tag or X-Robots-Tag header.",
    impact: "This page will not appear in search results.",
    howToFix: "Remove the noindex tag if you want this page indexed."
  },
  CANONICAL_MISSING: {
    code: "CANONICAL_MISSING",
    severity: "warning",
    category: "indexability",
    title: "Missing canonical tag",
    description: "No canonical URL specified for this page.",
    impact: "May cause duplicate content issues if the page is accessible via multiple URLs.",
    howToFix: "Add a self-referencing canonical tag or point to the preferred URL."
  },
  CANONICAL_POINTS_TO_REDIRECT: {
    code: "CANONICAL_POINTS_TO_REDIRECT",
    severity: "error",
    category: "indexability",
    title: "Canonical points to redirect",
    description: "The canonical URL redirects to a different page.",
    impact: "Confuses search engines and may cause indexing issues.",
    howToFix: "Update the canonical to point to the final destination URL."
  },
  CANONICAL_POINTS_TO_4XX: {
    code: "CANONICAL_POINTS_TO_4XX",
    severity: "error",
    category: "indexability",
    title: "Canonical points to 4XX page",
    description: "The canonical URL returns a 4XX error.",
    impact: "Search engines cannot index this page properly.",
    howToFix: "Update the canonical to point to a valid URL."
  },
  MULTIPLE_CANONICALS: {
    code: "MULTIPLE_CANONICALS",
    severity: "error",
    category: "indexability",
    title: "Multiple canonical tags",
    description: "Page has more than one canonical tag.",
    impact: "Search engines may ignore all canonical hints.",
    howToFix: "Remove duplicate canonical tags, keeping only one."
  },
  // ==================== ON-PAGE SEO ====================
  TITLE_MISSING: {
    code: "TITLE_MISSING",
    severity: "error",
    category: "on-page",
    title: "Missing title tag",
    description: "The page has no title tag.",
    impact: "Critical ranking factor missing. Page will have poor search visibility.",
    howToFix: "Add a descriptive title tag (50-60 characters)."
  },
  TITLE_TOO_SHORT: {
    code: "TITLE_TOO_SHORT",
    severity: "warning",
    category: "on-page",
    title: "Title tag too short",
    description: "Title tag is less than 30 characters.",
    impact: "Not utilizing the full space available in search results.",
    howToFix: "Expand the title to 50-60 characters with relevant keywords."
  },
  TITLE_TOO_LONG: {
    code: "TITLE_TOO_LONG",
    severity: "warning",
    category: "on-page",
    title: "Title tag too long",
    description: "Title tag exceeds 60 characters.",
    impact: "Title will be truncated in search results.",
    howToFix: "Shorten the title to under 60 characters."
  },
  TITLE_DUPLICATE: {
    code: "TITLE_DUPLICATE",
    severity: "warning",
    category: "on-page",
    title: "Duplicate title tag",
    description: "Multiple pages have the same title.",
    impact: "Can cause keyword cannibalization and confuse search engines.",
    howToFix: "Ensure each page has a unique, descriptive title."
  },
  META_DESC_MISSING: {
    code: "META_DESC_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Missing meta description",
    description: "No meta description tag found.",
    impact: "Search engines may use random page content as the snippet.",
    howToFix: "Add a compelling meta description (150-160 characters)."
  },
  META_DESC_TOO_SHORT: {
    code: "META_DESC_TOO_SHORT",
    severity: "notice",
    category: "on-page",
    title: "Meta description too short",
    description: "Meta description is less than 120 characters.",
    impact: "Not fully utilizing the snippet space in search results.",
    howToFix: "Expand to 150-160 characters with a compelling call-to-action."
  },
  META_DESC_TOO_LONG: {
    code: "META_DESC_TOO_LONG",
    severity: "notice",
    category: "on-page",
    title: "Meta description too long",
    description: "Meta description exceeds 160 characters.",
    impact: "Description may be truncated in search results.",
    howToFix: "Shorten to under 160 characters."
  },
  META_DESC_DUPLICATE: {
    code: "META_DESC_DUPLICATE",
    severity: "warning",
    category: "on-page",
    title: "Duplicate meta description",
    description: "Multiple pages have the same meta description.",
    impact: "Reduces the uniqueness of your pages in search results.",
    howToFix: "Write unique meta descriptions for each page."
  },
  H1_MISSING: {
    code: "H1_MISSING",
    severity: "error",
    category: "on-page",
    title: "Missing H1 heading",
    description: "No H1 tag found on the page.",
    impact: "Search engines use H1 to understand the main topic of the page.",
    howToFix: "Add exactly one H1 tag that describes the main content."
  },
  H1_MULTIPLE: {
    code: "H1_MULTIPLE",
    severity: "warning",
    category: "on-page",
    title: "Multiple H1 headings",
    description: "Page has more than one H1 tag.",
    impact: "Can dilute the topical focus of the page.",
    howToFix: "Use only one H1 per page. Use H2-H6 for subheadings."
  },
  H1_DUPLICATE_OF_TITLE: {
    code: "H1_DUPLICATE_OF_TITLE",
    severity: "notice",
    category: "on-page",
    title: "H1 identical to title tag",
    description: "The H1 heading is exactly the same as the title tag.",
    impact: "Missed opportunity to target additional keywords.",
    howToFix: "Consider varying the H1 to cover related keywords."
  },
  HEADING_SKIP: {
    code: "HEADING_SKIP",
    severity: "notice",
    category: "on-page",
    title: "Skipped heading level",
    description: "Heading hierarchy skips levels (e.g., H1 to H3).",
    impact: "May confuse screen readers and reduce content structure clarity.",
    howToFix: "Maintain proper heading hierarchy (H1 > H2 > H3, etc.)."
  },
  H2_MISSING: {
    code: "H2_MISSING",
    severity: "warning",
    category: "on-page",
    title: "No H2 headings found",
    description: "No H2 tags were found on the page.",
    impact: "H2 headings help structure content and are important for SEO and readability.",
    howToFix: "Break your content into sections using H2 headings with relevant keywords."
  },
  // ==================== CONTENT ====================
  THIN_CONTENT: {
    code: "THIN_CONTENT",
    severity: "warning",
    category: "content",
    title: "Thin content",
    description: "Page has less than 300 words of text content.",
    impact: "May be seen as low-quality by search engines.",
    howToFix: "Add more valuable, relevant content to the page."
  },
  DUPLICATE_CONTENT: {
    code: "DUPLICATE_CONTENT",
    severity: "warning",
    category: "content",
    title: "Duplicate content detected",
    description: "Significant content overlap with other pages.",
    impact: "Search engines may filter out duplicate pages from results.",
    howToFix: "Use canonical tags or differentiate the content."
  },
  LOW_TEXT_HTML_RATIO: {
    code: "LOW_TEXT_HTML_RATIO",
    severity: "notice",
    category: "content",
    title: "Low text-to-HTML ratio",
    description: "Text content is less than 10% of total HTML.",
    impact: "May indicate poor content or bloated HTML.",
    howToFix: "Add more text content or reduce unnecessary HTML/scripts."
  },
  // ==================== LINKS ====================
  BROKEN_INTERNAL_LINK: {
    code: "BROKEN_INTERNAL_LINK",
    severity: "error",
    category: "links",
    title: "Broken internal link",
    description: "Internal link points to a page that returns 4XX error.",
    impact: "Poor user experience and wasted crawl budget.",
    howToFix: "Fix the broken link or remove it."
  },
  BROKEN_EXTERNAL_LINK: {
    code: "BROKEN_EXTERNAL_LINK",
    severity: "warning",
    category: "links",
    title: "Broken external link",
    description: "External link points to a page that returns 4XX error.",
    impact: "Poor user experience and potential trust issues.",
    howToFix: "Update or remove the broken external link."
  },
  JS_ONLY_NAVIGATION: {
    code: "JS_ONLY_NAVIGATION",
    severity: "warning",
    category: "links",
    title: "JavaScript-only navigation detected",
    description: "Navigation elements use onClick handlers without proper <a href> links.",
    impact: "Search engine crawlers cannot follow JavaScript-only navigation. These links are invisible to crawlers, preventing page discovery and indexing.",
    howToFix: "Replace onClick navigation with proper <a href> or <Link> components. In React, use react-router Link instead of navigate() in onClick handlers. Ensure all navigation renders as real anchor tags with href attributes."
  },
  TOO_MANY_LINKS: {
    code: "TOO_MANY_LINKS",
    severity: "notice",
    category: "links",
    title: "Too many on-page links",
    description: "Page has more than 100 links.",
    impact: "Dilutes PageRank passed to each linked page.",
    howToFix: "Reduce the number of links to the most important ones."
  },
  NOFOLLOW_INTERNAL: {
    code: "NOFOLLOW_INTERNAL",
    severity: "notice",
    category: "links",
    title: "Nofollow on internal link",
    description: 'Internal link has rel="nofollow" attribute.',
    impact: "Prevents PageRank from flowing to important pages.",
    howToFix: "Remove nofollow from internal links unless intentional."
  },
  // ==================== IMAGES ====================
  IMG_ALT_MISSING: {
    code: "IMG_ALT_MISSING",
    severity: "warning",
    category: "images",
    title: "Image missing alt text",
    description: "Image has no alt attribute.",
    impact: "Poor accessibility and missed SEO opportunity.",
    howToFix: "Add descriptive alt text to all images."
  },
  IMG_ALT_EMPTY: {
    code: "IMG_ALT_EMPTY",
    severity: "notice",
    category: "images",
    title: "Image has empty alt text",
    description: 'Image has alt="" (empty alt attribute).',
    impact: "Acceptable for decorative images but not for content images.",
    howToFix: "Add descriptive alt text if the image conveys information."
  },
  IMG_NO_DIMENSIONS: {
    code: "IMG_NO_DIMENSIONS",
    severity: "notice",
    category: "images",
    title: "Image missing dimensions",
    description: "Image lacks width and height attributes.",
    impact: "Causes layout shift (CLS) when image loads.",
    howToFix: "Add width and height attributes to all images."
  },
  IMG_TOO_LARGE: {
    code: "IMG_TOO_LARGE",
    severity: "warning",
    category: "images",
    title: "Image file too large",
    description: "Image file size exceeds 200KB.",
    impact: "Slows down page load time.",
    howToFix: "Compress and optimize images. Consider WebP format."
  },
  IMG_BROKEN: {
    code: "IMG_BROKEN",
    severity: "error",
    category: "images",
    title: "Broken image",
    description: "Image URL returns 4XX error.",
    impact: "Poor user experience with missing images.",
    howToFix: "Fix the image URL or replace with a working image."
  },
  // ==================== STRUCTURED DATA ====================
  SCHEMA_MISSING: {
    code: "SCHEMA_MISSING",
    severity: "warning",
    category: "structured-data",
    title: "No structured data found",
    description: "Page has no JSON-LD or microdata.",
    impact: "Missing opportunity for rich snippets in search results.",
    howToFix: "Add appropriate Schema.org markup for your content type."
  },
  SCHEMA_INVALID: {
    code: "SCHEMA_INVALID",
    severity: "error",
    category: "structured-data",
    title: "Invalid structured data",
    description: "JSON-LD contains syntax errors.",
    impact: "Search engines cannot parse the structured data.",
    howToFix: "Fix JSON syntax errors and validate with Google Rich Results Test."
  },
  SCHEMA_MISSING_REQUIRED: {
    code: "SCHEMA_MISSING_REQUIRED",
    severity: "warning",
    category: "structured-data",
    title: "Missing required schema properties",
    description: "Schema markup is missing required properties.",
    impact: "May not qualify for rich snippets.",
    howToFix: "Add all required properties for the schema type."
  },
  // ==================== PERFORMANCE ====================
  SLOW_PAGE: {
    code: "SLOW_PAGE",
    severity: "warning",
    category: "performance",
    title: "Slow page load time",
    description: "Page takes more than 3 seconds to load.",
    impact: "High bounce rates and potential ranking penalty.",
    howToFix: "Optimize images, enable caching, minimize CSS/JS."
  },
  SLOW_TTFB: {
    code: "SLOW_TTFB",
    severity: "warning",
    category: "performance",
    title: "Slow Time to First Byte (TTFB)",
    description: "Server response time exceeds 600ms.",
    impact: "Delays entire page load and affects Core Web Vitals.",
    howToFix: "Optimize server configuration, use caching, consider CDN."
  },
  LCP_POOR: {
    code: "LCP_POOR",
    severity: "error",
    category: "performance",
    title: "Poor Largest Contentful Paint (LCP)",
    description: "LCP exceeds 2.5 seconds.",
    impact: "Direct Core Web Vitals ranking factor.",
    howToFix: "Optimize hero images, preload critical resources."
  },
  CLS_POOR: {
    code: "CLS_POOR",
    severity: "error",
    category: "performance",
    title: "Poor Cumulative Layout Shift (CLS)",
    description: "CLS exceeds 0.1.",
    impact: "Direct Core Web Vitals ranking factor.",
    howToFix: "Set image dimensions, avoid inserting content above existing content."
  },
  HTML_TOO_LARGE: {
    code: "HTML_TOO_LARGE",
    severity: "warning",
    category: "performance",
    title: "HTML document too large",
    description: "HTML size exceeds 100KB.",
    impact: "Increases load time and memory usage.",
    howToFix: "Reduce inline CSS/JS, remove unnecessary HTML."
  },
  UNCOMPRESSED: {
    code: "UNCOMPRESSED",
    severity: "warning",
    category: "performance",
    title: "Uncompressed resources",
    description: "Page is not served with gzip/brotli compression.",
    impact: "Larger file transfer sizes slow down the page.",
    howToFix: "Enable gzip or brotli compression on your server."
  },
  NO_CACHE: {
    code: "NO_CACHE",
    severity: "notice",
    category: "performance",
    title: "Missing cache headers",
    description: "Page lacks Cache-Control or Expires headers.",
    impact: "Browser cannot cache resources, causing repeated downloads.",
    howToFix: "Add appropriate cache headers for static resources."
  },
  // ==================== SECURITY ====================
  NOT_HTTPS: {
    code: "NOT_HTTPS",
    severity: "error",
    category: "security",
    title: "Page not served over HTTPS",
    description: "Page is accessible via HTTP instead of HTTPS.",
    impact: "Browser warnings, user distrust, and ranking penalty.",
    howToFix: "Install SSL certificate and redirect HTTP to HTTPS."
  },
  MIXED_CONTENT: {
    code: "MIXED_CONTENT",
    severity: "error",
    category: "security",
    title: "Mixed content",
    description: "HTTPS page loads resources over HTTP.",
    impact: "Browser may block resources or show security warnings.",
    howToFix: "Update all resource URLs to use HTTPS."
  },
  CERT_EXPIRING: {
    code: "CERT_EXPIRING",
    severity: "warning",
    category: "security",
    title: "SSL certificate expiring soon",
    description: "SSL certificate expires within 30 days.",
    impact: "Site will become insecure when certificate expires.",
    howToFix: "Renew your SSL certificate before expiration."
  },
  HSTS_MISSING: {
    code: "HSTS_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing HSTS header",
    description: "Strict-Transport-Security header not set.",
    impact: "Users may be vulnerable to downgrade attacks.",
    howToFix: "Add HSTS header to enforce HTTPS."
  },
  // ==================== MOBILE ====================
  VIEWPORT_MISSING: {
    code: "VIEWPORT_MISSING",
    severity: "error",
    category: "mobile",
    title: "Missing viewport meta tag",
    description: "No viewport meta tag found.",
    impact: "Page will not render properly on mobile devices.",
    howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
  },
  VIEWPORT_NOT_RESPONSIVE: {
    code: "VIEWPORT_NOT_RESPONSIVE",
    severity: "warning",
    category: "mobile",
    title: "Non-responsive viewport",
    description: "Viewport uses fixed width instead of device-width.",
    impact: "Page may not adapt to different screen sizes.",
    howToFix: "Use width=device-width in viewport meta tag."
  },
  TAP_TARGETS_TOO_SMALL: {
    code: "TAP_TARGETS_TOO_SMALL",
    severity: "warning",
    category: "mobile",
    title: "Tap targets too small",
    description: "Clickable elements are smaller than 48x48 pixels.",
    impact: "Difficult for mobile users to tap links/buttons.",
    howToFix: "Increase the size of tap targets to at least 48x48 pixels."
  },
  // ==================== INTERNATIONAL ====================
  HREFLANG_MISSING: {
    code: "HREFLANG_MISSING",
    severity: "notice",
    category: "international",
    title: "Missing hreflang tags",
    description: "Multi-language site without hreflang annotations.",
    impact: "Search engines may show wrong language version to users.",
    howToFix: "Add hreflang tags to specify language/region versions."
  },
  HREFLANG_INVALID: {
    code: "HREFLANG_INVALID",
    severity: "warning",
    category: "international",
    title: "Invalid hreflang value",
    description: "Hreflang contains invalid language or region code.",
    impact: "Search engines will ignore the hreflang directive.",
    howToFix: "Use valid ISO 639-1 language and ISO 3166-1 Alpha-2 region codes."
  },
  HREFLANG_NO_RETURN: {
    code: "HREFLANG_NO_RETURN",
    severity: "warning",
    category: "international",
    title: "Missing hreflang return link",
    description: "Hreflang page does not link back to this page.",
    impact: "Hreflang signals may be ignored by search engines.",
    howToFix: "Ensure all hreflang pages have reciprocal links."
  },
  HREFLANG_SELF_MISSING: {
    code: "HREFLANG_SELF_MISSING",
    severity: "notice",
    category: "international",
    title: "Missing self-referencing hreflang",
    description: "Page does not include hreflang pointing to itself.",
    impact: "Best practice to include self-referencing hreflang.",
    howToFix: "Add hreflang for the current page language/region."
  },
  HREFLANG_X_DEFAULT_MISSING: {
    code: "HREFLANG_X_DEFAULT_MISSING",
    severity: "notice",
    category: "international",
    title: "Missing x-default hreflang",
    description: "Multi-language page missing x-default fallback.",
    impact: "Users with unsupported language may not see appropriate version.",
    howToFix: 'Add hreflang="x-default" pointing to your default language page.'
  },
  HREFLANG_TO_NON_200: {
    code: "HREFLANG_TO_NON_200",
    severity: "error",
    category: "international",
    title: "Hreflang points to non-200 page",
    description: "Hreflang URL returns error or redirect.",
    impact: "Search engines cannot serve the alternate language version.",
    howToFix: "Update hreflang to point to valid, accessible URLs."
  },
  // ==================== SOFT 404 ====================
  SOFT_404: {
    code: "SOFT_404",
    severity: "error",
    category: "content",
    title: "Soft 404 detected",
    description: "Page returns 200 but appears to be an error page.",
    impact: "Wastes crawl budget and may index low-value error pages.",
    howToFix: "Return proper 404 status for error pages or add meaningful content."
  },
  // ==================== OPEN GRAPH / SOCIAL ====================
  OG_TITLE_MISSING: {
    code: "OG_TITLE_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Missing Open Graph title",
    description: "No og:title meta tag found.",
    impact: "Social shares may display incorrect or missing title.",
    howToFix: 'Add <meta property="og:title" content="Your Title">'
  },
  OG_DESCRIPTION_MISSING: {
    code: "OG_DESCRIPTION_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Missing Open Graph description",
    description: "No og:description meta tag found.",
    impact: "Social shares may display incorrect or missing description.",
    howToFix: 'Add <meta property="og:description" content="Your description">'
  },
  OG_IMAGE_MISSING: {
    code: "OG_IMAGE_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Missing Open Graph image",
    description: "No og:image meta tag found.",
    impact: "Social shares will not display a preview image.",
    howToFix: 'Add <meta property="og:image" content="https://yoursite.com/image.jpg">'
  },
  OG_IMAGE_TOO_SMALL: {
    code: "OG_IMAGE_TOO_SMALL",
    severity: "notice",
    category: "on-page",
    title: "Open Graph image too small",
    description: "OG image should be at least 1200x630 pixels.",
    impact: "Image may appear low quality on social platforms.",
    howToFix: "Use an image at least 1200x630 pixels for optimal display."
  },
  OG_URL_MISSING: {
    code: "OG_URL_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing Open Graph URL",
    description: "No og:url meta tag found.",
    impact: "Social platforms may use inconsistent URL for shares.",
    howToFix: 'Add <meta property="og:url" content="https://yoursite.com/page">'
  },
  OG_TYPE_MISSING: {
    code: "OG_TYPE_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing Open Graph type",
    description: "No og:type meta tag found.",
    impact: 'Social platforms default to "website" type.',
    howToFix: 'Add <meta property="og:type" content="website"> (or article, product, etc.)'
  },
  TWITTER_CARD_MISSING: {
    code: "TWITTER_CARD_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing Twitter Card tags",
    description: "No twitter:card meta tag found.",
    impact: "Twitter shares may not display optimally.",
    howToFix: 'Add <meta name="twitter:card" content="summary_large_image">'
  },
  TWITTER_IMAGE_MISSING: {
    code: "TWITTER_IMAGE_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing Twitter Card image",
    description: "No twitter:image meta tag found.",
    impact: "Twitter shares will not display a preview image.",
    howToFix: 'Add <meta name="twitter:image" content="https://yoursite.com/image.jpg">'
  },
  // ==================== CANONICAL ADVANCED ====================
  CANONICAL_CHAIN: {
    code: "CANONICAL_CHAIN",
    severity: "warning",
    category: "indexability",
    title: "Canonical chain detected",
    description: "Canonical URL points to a page with a different canonical.",
    impact: "Creates confusion for search engines about the preferred URL.",
    howToFix: "Update canonical to point directly to the final preferred URL."
  },
  CANONICAL_CROSS_DOMAIN: {
    code: "CANONICAL_CROSS_DOMAIN",
    severity: "warning",
    category: "indexability",
    title: "Cross-domain canonical",
    description: "Canonical points to a different domain.",
    impact: "Transfers ranking signals to another domain. Ensure this is intentional.",
    howToFix: "Verify cross-domain canonical is intentional or update to same domain."
  },
  CANONICAL_MISMATCH_SITEMAP: {
    code: "CANONICAL_MISMATCH_SITEMAP",
    severity: "warning",
    category: "indexability",
    title: "Canonical URL not in sitemap",
    description: "The canonical URL differs from the sitemap URL.",
    impact: "Conflicting signals about which URL should be indexed.",
    howToFix: "Ensure sitemap contains only canonical URLs."
  },
  // ==================== ANCHOR TEXT ====================
  ANCHOR_TEXT_GENERIC: {
    code: "ANCHOR_TEXT_GENERIC",
    severity: "notice",
    category: "links",
    title: "Generic anchor text detected",
    description: 'Many internal links use generic text like "click here" or "read more".',
    impact: "Misses opportunity to provide context to search engines.",
    howToFix: "Use descriptive anchor text that indicates the target page content."
  },
  ANCHOR_TEXT_OVER_OPTIMIZED: {
    code: "ANCHOR_TEXT_OVER_OPTIMIZED",
    severity: "warning",
    category: "links",
    title: "Over-optimized anchor text",
    description: "Excessive exact-match keyword anchor text detected.",
    impact: "May trigger spam filters and algorithmic penalties.",
    howToFix: "Diversify anchor text with natural variations."
  },
  ANCHOR_TEXT_EMPTY: {
    code: "ANCHOR_TEXT_EMPTY",
    severity: "warning",
    category: "links",
    title: "Empty anchor text",
    description: "Link has no text content (empty anchor).",
    impact: "Provides no context for users or search engines.",
    howToFix: "Add descriptive text to the link or use aria-label for icon links."
  },
  // ==================== PAGINATION ====================
  PAGINATION_NO_LINKS: {
    code: "PAGINATION_NO_LINKS",
    severity: "warning",
    category: "crawlability",
    title: "Pagination without HTML links",
    description: "Paginated content uses JavaScript without HTML fallback links.",
    impact: "Search engines cannot discover paginated content.",
    howToFix: "Add <a href> links for pagination alongside JavaScript."
  },
  PAGINATION_CANONICAL_ISSUE: {
    code: "PAGINATION_CANONICAL_ISSUE",
    severity: "error",
    category: "indexability",
    title: "Pagination canonical points to page 1",
    description: "Paginated pages have canonical pointing to page 1.",
    impact: "Paginated content may not be indexed properly.",
    howToFix: "Each paginated page should self-reference or use View All canonical."
  },
  INFINITE_SCROLL_NO_FALLBACK: {
    code: "INFINITE_SCROLL_NO_FALLBACK",
    severity: "warning",
    category: "crawlability",
    title: "Infinite scroll without fallback",
    description: "Infinite scroll detected without pagination links.",
    impact: "Search engines cannot access content loaded via infinite scroll.",
    howToFix: "Implement replaceState/pushState and provide pagination links."
  },
  // ==================== DUPLICATE/CANNIBALIZATION ====================
  NEAR_DUPLICATE: {
    code: "NEAR_DUPLICATE",
    severity: "warning",
    category: "content",
    title: "Near-duplicate content",
    description: "Page has 90%+ content similarity with another page.",
    impact: "May cause keyword cannibalization and dilute ranking signals.",
    howToFix: "Consolidate pages, differentiate content, or use canonical tags."
  },
  KEYWORD_CANNIBALIZATION: {
    code: "KEYWORD_CANNIBALIZATION",
    severity: "warning",
    category: "content",
    title: "Potential keyword cannibalization",
    description: "Multiple pages target the same primary keyword.",
    impact: "Pages compete against each other in search results.",
    howToFix: "Consolidate pages or differentiate keyword targeting."
  },
  // ==================== LINK ANALYSIS ADVANCED ====================
  LINK_DEPTH_TOO_DEEP: {
    code: "LINK_DEPTH_TOO_DEEP",
    severity: "warning",
    category: "links",
    title: "Page too deep in site structure",
    description: "Page requires more than 3 clicks from homepage.",
    impact: "Deep pages receive less link equity and may be crawled less frequently.",
    howToFix: "Improve internal linking to reduce click depth."
  },
  INTERNAL_REDIRECT: {
    code: "INTERNAL_REDIRECT",
    severity: "notice",
    category: "links",
    title: "Internal link to redirect",
    description: "Internal link points to a URL that redirects.",
    impact: "Wastes crawl budget and dilutes link equity.",
    howToFix: "Update internal links to point directly to final URLs."
  },
  // ==================== JAVASCRIPT SEO ====================
  JS_RENDERED_CONTENT: {
    code: "JS_RENDERED_CONTENT",
    severity: "notice",
    category: "content",
    title: "JavaScript-rendered content detected",
    description: "Significant content only visible after JavaScript execution.",
    impact: "Search engines may not see all content or delay indexing.",
    howToFix: "Consider server-side rendering or prerendering for critical content."
  },
  JS_LINKS_ONLY: {
    code: "JS_LINKS_ONLY",
    severity: "warning",
    category: "links",
    title: "Links only in JavaScript",
    description: "Internal links exist only in rendered DOM, not in source HTML.",
    impact: "Search engines may not discover these links.",
    howToFix: "Ensure important links are in static HTML or use server-side rendering."
  },
  // ==================== FAVICON & MISC ====================
  FAVICON_MISSING: {
    code: "FAVICON_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing favicon",
    description: 'No favicon.ico or link rel="icon" found.',
    impact: "Browser tabs show generic icon; poor brand presence.",
    howToFix: 'Add a favicon.ico or link rel="icon" to your pages.'
  },
  LANG_ATTR_MISSING: {
    code: "LANG_ATTR_MISSING",
    severity: "notice",
    category: "on-page",
    title: "Missing lang attribute",
    description: "HTML tag lacks lang attribute.",
    impact: "Accessibility issue; browsers/screen readers may use wrong language.",
    howToFix: 'Add lang attribute to HTML tag (e.g., <html lang="en">).'
  },
  // ==================== AI/LLM READINESS ====================
  LLMS_TXT_MISSING: {
    code: "LLMS_TXT_MISSING",
    severity: "notice",
    category: "ai-readiness",
    title: "Missing llms.txt file",
    description: "No llms.txt file found at the root of the domain.",
    impact: "AI crawlers like ChatGPT and Claude may not understand how to best use your content.",
    howToFix: "Create an llms.txt file at your domain root with guidance for AI systems. See llmstxt.org for format."
  },
  LLMS_TXT_INVALID: {
    code: "LLMS_TXT_INVALID",
    severity: "warning",
    category: "ai-readiness",
    title: "Invalid llms.txt format",
    description: "The llms.txt file exists but has invalid format or syntax.",
    impact: "AI crawlers may not be able to parse your AI guidance properly.",
    howToFix: "Validate your llms.txt file format against the specification at llmstxt.org."
  },
  AI_BOT_BLOCKED_ALL: {
    code: "AI_BOT_BLOCKED_ALL",
    severity: "notice",
    category: "ai-readiness",
    title: "All AI bots blocked in robots.txt",
    description: "robots.txt blocks all major AI crawlers (GPTBot, Claude-Web, PerplexityBot, etc.).",
    impact: "Your content will not appear in AI-powered search and assistants.",
    howToFix: "Consider allowing some AI bots if you want visibility in AI-generated responses."
  },
  AI_BOT_GPTBOT_BLOCKED: {
    code: "AI_BOT_GPTBOT_BLOCKED",
    severity: "notice",
    category: "ai-readiness",
    title: "GPTBot blocked in robots.txt",
    description: "robots.txt blocks OpenAI's GPTBot crawler.",
    impact: "Your content will not be used to train or cited by ChatGPT.",
    howToFix: 'Remove "User-agent: GPTBot Disallow: /" if you want ChatGPT visibility.'
  },
  AI_BOT_CLAUDEBOT_BLOCKED: {
    code: "AI_BOT_CLAUDEBOT_BLOCKED",
    severity: "notice",
    category: "ai-readiness",
    title: "ClaudeBot blocked in robots.txt",
    description: "robots.txt blocks Anthropic's ClaudeBot crawler.",
    impact: "Your content will not be used by Claude AI.",
    howToFix: 'Remove "User-agent: ClaudeBot Disallow: /" if you want Claude visibility.'
  },
  AI_BOT_PERPLEXITY_BLOCKED: {
    code: "AI_BOT_PERPLEXITY_BLOCKED",
    severity: "notice",
    category: "ai-readiness",
    title: "PerplexityBot blocked in robots.txt",
    description: "robots.txt blocks Perplexity AI's crawler.",
    impact: "Your content will not appear in Perplexity AI search results.",
    howToFix: 'Remove "User-agent: PerplexityBot Disallow: /" if you want Perplexity visibility.'
  },
  AI_BOT_GOOGLE_EXTENDED_BLOCKED: {
    code: "AI_BOT_GOOGLE_EXTENDED_BLOCKED",
    severity: "notice",
    category: "ai-readiness",
    title: "Google-Extended blocked in robots.txt",
    description: "robots.txt blocks Google's AI training crawler (Google-Extended).",
    impact: "Your content will not be used for Bard/Gemini AI training (regular search unaffected).",
    howToFix: 'Remove "User-agent: Google-Extended Disallow: /" if you want Google AI visibility.'
  },
  HIGH_JS_RENDERING_RATIO: {
    code: "HIGH_JS_RENDERING_RATIO",
    severity: "warning",
    category: "ai-readiness",
    title: "High JavaScript rendering required",
    description: "More than 50% of page content requires JavaScript to render.",
    impact: "AI crawlers may not see all content; they often use static HTML only.",
    howToFix: "Implement server-side rendering or prerendering for critical content."
  },
  // ==================== PIXEL-BASED META CHECKS ====================
  TITLE_TRUNCATED_SERP: {
    code: "TITLE_TRUNCATED_SERP",
    severity: "warning",
    category: "on-page",
    title: "Title will be truncated in SERP",
    description: "Title exceeds 580 pixels and will be cut off in Google search results.",
    impact: "Important information at the end of your title will not be visible.",
    howToFix: "Shorten title to fit within 580 pixel width (approximately 50-60 characters)."
  },
  META_DESC_TRUNCATED_SERP: {
    code: "META_DESC_TRUNCATED_SERP",
    severity: "notice",
    category: "on-page",
    title: "Meta description will be truncated in SERP",
    description: "Meta description exceeds 920 pixels on desktop.",
    impact: "Your description may be cut off in search results.",
    howToFix: "Shorten description to fit within 920 pixels (approximately 150-160 characters)."
  },
  // ==================== SOCIAL META TAGS (Enhanced) ====================
  TWITTER_TITLE_MISSING: {
    code: "TWITTER_TITLE_MISSING",
    severity: "notice",
    category: "social",
    title: "Missing Twitter Card title",
    description: "No twitter:title meta tag found.",
    impact: "Twitter/X shares will use og:title or page title as fallback.",
    howToFix: 'Add <meta name="twitter:title" content="Your Title">'
  },
  TWITTER_DESCRIPTION_MISSING: {
    code: "TWITTER_DESCRIPTION_MISSING",
    severity: "notice",
    category: "social",
    title: "Missing Twitter Card description",
    description: "No twitter:description meta tag found.",
    impact: "Twitter/X shares will use og:description or meta description as fallback.",
    howToFix: 'Add <meta name="twitter:description" content="Your description">'
  },
  OG_IMAGE_WRONG_DIMENSIONS: {
    code: "OG_IMAGE_WRONG_DIMENSIONS",
    severity: "notice",
    category: "social",
    title: "Open Graph image wrong aspect ratio",
    description: "OG image is not the recommended 1.91:1 aspect ratio (1200x630).",
    impact: "Image may be cropped awkwardly on social platforms.",
    howToFix: "Use an image with 1200x630 pixels (1.91:1 aspect ratio)."
  },
  OG_IMAGE_TOO_LARGE: {
    code: "OG_IMAGE_TOO_LARGE",
    severity: "warning",
    category: "social",
    title: "Open Graph image file too large",
    description: "OG image exceeds 5MB file size limit.",
    impact: "Social platforms may not display the image.",
    howToFix: "Compress the image to under 5MB while maintaining quality."
  },
  SOCIAL_PROFILES_NOT_LINKED: {
    code: "SOCIAL_PROFILES_NOT_LINKED",
    severity: "notice",
    category: "social",
    title: "No social profile links found",
    description: "Page has no links to social media profiles.",
    impact: "Missed opportunity for social proof and brand presence.",
    howToFix: "Add links to your social media profiles (Facebook, Twitter, LinkedIn, etc.)."
  },
  // ==================== LOCAL SEO ====================
  LOCAL_BUSINESS_SCHEMA_MISSING: {
    code: "LOCAL_BUSINESS_SCHEMA_MISSING",
    severity: "notice",
    category: "local-seo",
    title: "Missing LocalBusiness schema",
    description: "No LocalBusiness structured data found.",
    impact: "Local business information won't appear in Google's local knowledge panel.",
    howToFix: "Add LocalBusiness schema with name, address, phone, and hours."
  },
  ORGANIZATION_SCHEMA_MISSING: {
    code: "ORGANIZATION_SCHEMA_MISSING",
    severity: "notice",
    category: "local-seo",
    title: "Missing Organization schema",
    description: "No Organization or Person structured data found.",
    impact: "Search engines may not understand your brand identity.",
    howToFix: "Add Organization schema with logo, contact info, and social profiles."
  },
  NAP_INCONSISTENT: {
    code: "NAP_INCONSISTENT",
    severity: "warning",
    category: "local-seo",
    title: "Inconsistent NAP information",
    description: "Name, Address, Phone detected in multiple formats on page.",
    impact: "Inconsistent business info can hurt local search rankings.",
    howToFix: "Use consistent NAP format across all pages and match your Google Business Profile."
  },
  ADDRESS_NOT_DETECTED: {
    code: "ADDRESS_NOT_DETECTED",
    severity: "notice",
    category: "local-seo",
    title: "No business address detected",
    description: "Could not find a physical address on this page.",
    impact: "Local businesses should display their address for local SEO.",
    howToFix: "Add your business address in a visible location and in LocalBusiness schema."
  },
  PHONE_NOT_DETECTED: {
    code: "PHONE_NOT_DETECTED",
    severity: "notice",
    category: "local-seo",
    title: "No phone number detected",
    description: "Could not find a phone number on this page.",
    impact: "Contact information helps with local SEO and user trust.",
    howToFix: "Add your phone number in visible location and in LocalBusiness schema."
  },
  // ==================== SECURITY HEADERS ====================
  CSP_MISSING: {
    code: "CSP_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing Content-Security-Policy header",
    description: "No Content-Security-Policy (CSP) header found.",
    impact: "Site is more vulnerable to XSS and code injection attacks.",
    howToFix: "Add a Content-Security-Policy header to control which resources can be loaded."
  },
  X_FRAME_OPTIONS_MISSING: {
    code: "X_FRAME_OPTIONS_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing X-Frame-Options header",
    description: "No X-Frame-Options header found.",
    impact: "Site may be vulnerable to clickjacking attacks.",
    howToFix: "Add X-Frame-Options: DENY or SAMEORIGIN header."
  },
  X_CONTENT_TYPE_OPTIONS_MISSING: {
    code: "X_CONTENT_TYPE_OPTIONS_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing X-Content-Type-Options header",
    description: "No X-Content-Type-Options header found.",
    impact: "Browser may MIME-sniff content types, potentially executing malicious files.",
    howToFix: "Add X-Content-Type-Options: nosniff header."
  },
  REFERRER_POLICY_MISSING: {
    code: "REFERRER_POLICY_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing Referrer-Policy header",
    description: "No Referrer-Policy header found.",
    impact: "Browser may leak referrer information to third-party sites.",
    howToFix: "Add Referrer-Policy: strict-origin-when-cross-origin header."
  },
  PERMISSIONS_POLICY_MISSING: {
    code: "PERMISSIONS_POLICY_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing Permissions-Policy header",
    description: "No Permissions-Policy (formerly Feature-Policy) header found.",
    impact: "Cannot control which browser features your site can use.",
    howToFix: "Add Permissions-Policy header to control camera, microphone, geolocation, etc."
  },
  // ==================== CONTENT FRESHNESS ====================
  CONTENT_STALE: {
    code: "CONTENT_STALE",
    severity: "notice",
    category: "content",
    title: "Content appears stale",
    description: "Last-Modified header shows content over 1 year old.",
    impact: "Search engines may prioritize fresher content in results.",
    howToFix: "Update content regularly and ensure Last-Modified header is accurate."
  },
  NO_LAST_MODIFIED: {
    code: "NO_LAST_MODIFIED",
    severity: "notice",
    category: "content",
    title: "No Last-Modified header",
    description: "Server does not send Last-Modified header.",
    impact: "Browsers and CDNs cannot efficiently cache content.",
    howToFix: "Configure your server to send Last-Modified headers."
  },
  OG_UPDATED_TIME_MISSING: {
    code: "OG_UPDATED_TIME_MISSING",
    severity: "notice",
    category: "content",
    title: "Missing article:modified_time",
    description: "No article:modified_time Open Graph tag found.",
    impact: "Social platforms may not show content update dates.",
    howToFix: 'Add <meta property="article:modified_time" content="2024-01-01T12:00:00Z">'
  },
  // ==================== PERFORMANCE (Enhanced) ====================
  RENDER_BLOCKING_RESOURCES: {
    code: "RENDER_BLOCKING_RESOURCES",
    severity: "warning",
    category: "performance",
    title: "Render-blocking resources detected",
    description: "CSS or JavaScript files block initial page render.",
    impact: "Delays First Contentful Paint and user perception of speed.",
    howToFix: "Inline critical CSS, defer non-critical JS, or use async/defer attributes."
  },
  DOM_SIZE_EXCESSIVE: {
    code: "DOM_SIZE_EXCESSIVE",
    severity: "warning",
    category: "performance",
    title: "Excessive DOM size",
    description: "Page has more than 1500 DOM nodes.",
    impact: "Large DOM increases memory usage and slows style calculations.",
    howToFix: "Simplify page structure, lazy-load content, or paginate long lists."
  },
  DOM_DEPTH_EXCESSIVE: {
    code: "DOM_DEPTH_EXCESSIVE",
    severity: "notice",
    category: "performance",
    title: "Excessive DOM depth",
    description: "DOM tree is more than 32 levels deep.",
    impact: "Deep nesting slows CSS selector matching and layout calculations.",
    howToFix: "Flatten your HTML structure where possible."
  },
  IMAGE_NOT_WEBP_AVIF: {
    code: "IMAGE_NOT_WEBP_AVIF",
    severity: "notice",
    category: "images",
    title: "Images not using modern formats",
    description: "Images use JPEG/PNG instead of WebP/AVIF.",
    impact: "Modern formats provide 25-50% smaller file sizes.",
    howToFix: "Convert images to WebP or AVIF format with fallbacks."
  },
  NO_CDN_DETECTED: {
    code: "NO_CDN_DETECTED",
    severity: "notice",
    category: "performance",
    title: "No CDN detected",
    description: "Static resources are not served from a CDN.",
    impact: "Users far from your server experience slower load times.",
    howToFix: "Use a CDN like Cloudflare, Fastly, or AWS CloudFront."
  },
  // ==================== TECHNOLOGY DETECTION ====================
  WORDPRESS_DETECTED: {
    code: "WORDPRESS_DETECTED",
    severity: "notice",
    category: "on-page",
    title: "WordPress detected",
    description: "Site is built with WordPress CMS.",
    impact: "Informational - WordPress powers 40% of the web.",
    howToFix: "Ensure WordPress core, themes, and plugins are up to date."
  },
  OUTDATED_JQUERY: {
    code: "OUTDATED_JQUERY",
    severity: "warning",
    category: "security",
    title: "Outdated jQuery version detected",
    description: "Page uses a jQuery version with known vulnerabilities.",
    impact: "Site may be vulnerable to security exploits.",
    howToFix: "Update jQuery to the latest version (3.x or higher)."
  },
  OUTDATED_FRAMEWORK: {
    code: "OUTDATED_FRAMEWORK",
    severity: "warning",
    category: "security",
    title: "Outdated JavaScript framework detected",
    description: "Page uses an outdated version of a JavaScript framework.",
    impact: "May have security vulnerabilities or performance issues.",
    howToFix: "Update to the latest stable version of the framework."
  },
  // ==================== KEYWORD DENSITY ====================
  KEYWORD_STUFFING: {
    code: "KEYWORD_STUFFING",
    severity: "warning",
    category: "content",
    title: "Potential keyword stuffing detected",
    description: "A keyword appears more than 3% of total word count.",
    impact: "May trigger search engine spam filters.",
    howToFix: "Write naturally and use keyword variations instead of repetition."
  },
  NO_KEYWORDS_IN_TITLE: {
    code: "NO_KEYWORDS_IN_TITLE",
    severity: "warning",
    category: "on-page",
    title: "Top keywords not in title",
    description: "Most common page keywords are not present in the title tag.",
    impact: "Title may not accurately reflect page content for search engines.",
    howToFix: "Include your primary keyword in the title tag."
  },
  NO_KEYWORDS_IN_H1: {
    code: "NO_KEYWORDS_IN_H1",
    severity: "notice",
    category: "on-page",
    title: "Top keywords not in H1",
    description: "Most common page keywords are not present in the H1 heading.",
    impact: "H1 may not signal page topic effectively.",
    howToFix: "Include your primary keyword in the H1 heading."
  },
  // ==================== ADDITIONAL CHECKS ====================
  AMP_MISSING: {
    code: "AMP_MISSING",
    severity: "notice",
    category: "mobile",
    title: "No AMP version detected",
    description: "Page does not have an Accelerated Mobile Page version.",
    impact: "May load slower on mobile and miss Top Stories carousel eligibility.",
    howToFix: "Consider implementing AMP for content-heavy pages."
  },
  AMP_INVALID: {
    code: "AMP_INVALID",
    severity: "warning",
    category: "mobile",
    title: "Invalid AMP markup",
    description: "AMP page contains validation errors.",
    impact: "Invalid AMP pages may not be served from Google AMP cache.",
    howToFix: "Validate and fix AMP errors using the AMP Validator."
  },
  ADS_TXT_MISSING: {
    code: "ADS_TXT_MISSING",
    severity: "notice",
    category: "crawlability",
    title: "Missing ads.txt file",
    description: "No ads.txt file found for ad inventory authorization.",
    impact: "If running ads, unauthorized sellers may claim your inventory.",
    howToFix: "Create an ads.txt file listing authorized ad sellers."
  },
  ADS_TXT_INVALID: {
    code: "ADS_TXT_INVALID",
    severity: "warning",
    category: "crawlability",
    title: "Invalid ads.txt format",
    description: "ads.txt file contains syntax errors.",
    impact: "Ad platforms may not recognize your authorized sellers.",
    howToFix: "Validate ads.txt format using IAB ads.txt validator."
  },
  DMARC_MISSING: {
    code: "DMARC_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing DMARC record",
    description: "No DMARC DNS record found for email authentication.",
    impact: "Emails from your domain may be spoofed or marked as spam.",
    howToFix: 'Add a DMARC record to your DNS: _dmarc.yourdomain.com TXT "v=DMARC1; p=none"'
  },
  SPF_MISSING: {
    code: "SPF_MISSING",
    severity: "notice",
    category: "security",
    title: "Missing SPF record",
    description: "No SPF DNS record found for email authentication.",
    impact: "Emails from your domain may be marked as spam.",
    howToFix: "Add an SPF record to your DNS with authorized mail servers."
  },
  SAFE_BROWSING_FLAGGED: {
    code: "SAFE_BROWSING_FLAGGED",
    severity: "error",
    category: "security",
    title: "Site flagged by Google Safe Browsing",
    description: "Google has flagged this site for malware or phishing.",
    impact: "Browsers will show warnings and traffic will plummet.",
    howToFix: "Remove malware/phishing content and request review in Search Console."
  },
  PLAINTEXT_EMAIL: {
    code: "PLAINTEXT_EMAIL",
    severity: "notice",
    category: "security",
    title: "Email addresses in plain text",
    description: "Email addresses found in page HTML without obfuscation.",
    impact: "Email addresses can be harvested by spam bots.",
    howToFix: "Use contact forms or obfuscate emails (e.g., name[at]domain.com)."
  },
  DIRECTORY_LISTING_ENABLED: {
    code: "DIRECTORY_LISTING_ENABLED",
    severity: "warning",
    category: "security",
    title: "Directory listing enabled",
    description: "Web server is configured to list directory contents.",
    impact: "Exposes file structure and potentially sensitive files.",
    howToFix: "Disable directory listing in your web server configuration."
  },
  FAVICON_NOT_ICO: {
    code: "FAVICON_NOT_ICO",
    severity: "notice",
    category: "on-page",
    title: "Favicon not in ICO format",
    description: "Favicon is not in the traditional .ico format.",
    impact: "Some older browsers may not display the favicon.",
    howToFix: "Provide favicon.ico at site root in addition to PNG/SVG versions."
  },
  APPLE_TOUCH_ICON_MISSING: {
    code: "APPLE_TOUCH_ICON_MISSING",
    severity: "notice",
    category: "mobile",
    title: "Missing Apple Touch Icon",
    description: "No apple-touch-icon link found.",
    impact: "iOS users adding site to home screen will see a generic icon.",
    howToFix: 'Add <link rel="apple-touch-icon" href="/apple-touch-icon.png">'
  },
  // ==================== ADVANCED SEO CHECKS ====================
  // Featured Snippet Optimization
  FAQ_SCHEMA_MISSING: {
    code: "FAQ_SCHEMA_MISSING",
    severity: "warning",
    category: "structured-data",
    title: "FAQ content without FAQPage schema",
    description: "Question-format headings found but no FAQPage schema markup.",
    impact: "Missing out on FAQ rich results and PAA box opportunities.",
    howToFix: "Add FAQPage structured data for your Q&A content."
  },
  INVERTED_PYRAMID_MISSING: {
    code: "INVERTED_PYRAMID_MISSING",
    severity: "notice",
    category: "content",
    title: "Content not structured for featured snippets",
    description: "First paragraph does not contain a direct answer or summary.",
    impact: "Featured snippets pull from early content; burying answers reduces snippet capture rate.",
    howToFix: "Start with a concise answer (40-80 words) that directly addresses the page topic."
  },
  NO_SNIPPET_BAIT_HEADERS: {
    code: "NO_SNIPPET_BAIT_HEADERS",
    severity: "notice",
    category: "on-page",
    title: "No snippet-targeting headers found",
    description: "Headings do not use patterns that commonly trigger featured snippets.",
    impact: "Missing opportunities for high-visibility snippet placements.",
    howToFix: 'Use headers like "What is [topic]?", "How to [action]", or "X Ways to [achieve goal]".'
  },
  // Internal Link Graph
  NO_CONTEXTUAL_INTERNAL_LINKS: {
    code: "NO_CONTEXTUAL_INTERNAL_LINKS",
    severity: "warning",
    category: "links",
    title: "No contextual internal links",
    description: "All internal links are in navigation/footer. No editorial links in content.",
    impact: "Editorial links in content pass more SEO value than navigational links.",
    howToFix: "Add relevant internal links within your main content to related pages."
  },
  LOW_EDITORIAL_LINKS: {
    code: "LOW_EDITORIAL_LINKS",
    severity: "notice",
    category: "links",
    title: "Few editorial internal links",
    description: "Only a few editorial (in-content) internal links found.",
    impact: "Editorial links with surrounding context provide stronger topical signals.",
    howToFix: "Add 2-5 relevant internal links within your body content."
  },
  FIRST_LINK_GENERIC_ANCHOR: {
    code: "FIRST_LINK_GENERIC_ANCHOR",
    severity: "notice",
    category: "links",
    title: "First link uses generic anchor text",
    description: 'First link to a page uses generic anchor like "click here" or "read more".',
    impact: "Google may prioritize first link anchor for topic signals.",
    howToFix: "Use descriptive, keyword-relevant anchor text for internal links."
  },
  TOO_MANY_INTERNAL_LINKS: {
    code: "TOO_MANY_INTERNAL_LINKS",
    severity: "warning",
    category: "links",
    title: "Excessive internal links",
    description: "Page has over 100 internal links, which may dilute PageRank distribution.",
    impact: "Too many links reduce the value passed to each linked page.",
    howToFix: "Reduce internal links to the most important and relevant pages."
  },
  NO_INTERNAL_LINKS: {
    code: "NO_INTERNAL_LINKS",
    severity: "error",
    category: "links",
    title: "No internal links found",
    description: "Page has no internal links to other pages on the site.",
    impact: "Creates a dead end for users and search engine crawlers.",
    howToFix: "Add relevant internal links to related content."
  },
  // Resource Hints
  MISSING_PRECONNECT: {
    code: "MISSING_PRECONNECT",
    severity: "warning",
    category: "performance",
    title: "Missing preconnect hints for third-party origins",
    description: "Third-party origins used without preconnect hints.",
    impact: "Connection setup to third-party origins adds latency to resource loading.",
    howToFix: "Add preconnect hints for critical third-party origins."
  },
  GOOGLE_FONTS_NO_PRECONNECT: {
    code: "GOOGLE_FONTS_NO_PRECONNECT",
    severity: "warning",
    category: "performance",
    title: "Google Fonts without preconnect",
    description: "Google Fonts are used but preconnect hints are missing.",
    impact: "Adds significant latency to font loading, affecting LCP.",
    howToFix: "Add preconnect hints for fonts.googleapis.com and fonts.gstatic.com."
  },
  HERO_IMAGE_NOT_PRELOADED: {
    code: "HERO_IMAGE_NOT_PRELOADED",
    severity: "notice",
    category: "performance",
    title: "Hero image not preloaded",
    description: "Page has images but none are preloaded for faster LCP.",
    impact: "Preloading LCP images can improve Largest Contentful Paint.",
    howToFix: 'Add <link rel="preload" href="hero-image.jpg" as="image"> for your LCP image.'
  },
  NO_CRITICAL_RESOURCE_PRELOAD: {
    code: "NO_CRITICAL_RESOURCE_PRELOAD",
    severity: "notice",
    category: "performance",
    title: "No critical resources preloaded",
    description: "Page has render-blocking resources but no preload hints.",
    impact: "Preloading critical resources can improve initial render time.",
    howToFix: "Consider preloading critical CSS, fonts, or hero images."
  },
  EXCESSIVE_PRELOADS: {
    code: "EXCESSIVE_PRELOADS",
    severity: "warning",
    category: "performance",
    title: "Too many preload hints",
    description: "Page has more than 10 preload hints.",
    impact: "Preloading too many resources competes for bandwidth and can delay critical resources.",
    howToFix: "Limit preloads to truly critical resources (2-5 maximum)."
  },
  ES_MODULES_NO_MODULEPRELOAD: {
    code: "ES_MODULES_NO_MODULEPRELOAD",
    severity: "notice",
    category: "performance",
    title: "ES modules without modulepreload",
    description: "Page uses ES modules but no modulepreload hints are present.",
    impact: "Modulepreload can parallelize module loading for faster execution.",
    howToFix: 'Add <link rel="modulepreload" href="critical-module.js"> for critical modules.'
  },
  // E-E-A-T Signals
  YMYL_NO_AUTHOR: {
    code: "YMYL_NO_AUTHOR",
    severity: "warning",
    category: "content",
    title: "YMYL content without author information",
    description: "This appears to be YMYL (Your Money Your Life) content but has no visible author.",
    impact: "Google prioritizes E-E-A-T signals heavily for YMYL topics.",
    howToFix: "Add author byline with credentials, bio, and author schema."
  },
  YMYL_NO_EXPERTISE: {
    code: "YMYL_NO_EXPERTISE",
    severity: "warning",
    category: "content",
    title: "YMYL content without expertise signals",
    description: "YMYL content lacks visible expertise indicators (credentials, qualifications).",
    impact: "Expertise is crucial for YMYL content ranking.",
    howToFix: 'Include author credentials, "reviewed by" statements, or cite expert sources.'
  },
  YMYL_NO_CITATIONS: {
    code: "YMYL_NO_CITATIONS",
    severity: "warning",
    category: "content",
    title: "YMYL content without authoritative citations",
    description: "YMYL content has no links to authoritative sources (.gov, .edu, etc.).",
    impact: "Citing authoritative sources builds trust for sensitive topics.",
    howToFix: "Add citations to government, academic, or recognized industry sources."
  },
  NO_ENTITY_IDENTIFIED: {
    code: "NO_ENTITY_IDENTIFIED",
    severity: "notice",
    category: "content",
    title: "No author or organization identified",
    description: "Page lacks clear attribution to an author or organization.",
    impact: "Anonymous content may be seen as less trustworthy.",
    howToFix: "Add author byline or organization information with structured data."
  },
  NO_ORGANIZATION_SCHEMA: {
    code: "NO_ORGANIZATION_SCHEMA",
    severity: "notice",
    category: "structured-data",
    title: "Missing Organization schema",
    description: "No Organization structured data found.",
    impact: "Missed opportunity to establish organizational identity for E-E-A-T.",
    howToFix: "Add Organization schema with name, logo, contact, and social profiles."
  },
  AUTHOR_NO_SCHEMA: {
    code: "AUTHOR_NO_SCHEMA",
    severity: "notice",
    category: "structured-data",
    title: "Author without Person schema",
    description: "Author name is present but no Person structured data.",
    impact: "Person schema helps Google understand author entity relationships.",
    howToFix: "Add Person schema with sameAs links to author profiles."
  },
  NO_MODIFIED_DATE: {
    code: "NO_MODIFIED_DATE",
    severity: "notice",
    category: "content",
    title: "No content modification date",
    description: "Content has published date but no last-modified date.",
    impact: "Modified dates signal content freshness to search engines.",
    howToFix: "Add article:modified_time meta tag or dateModified in schema."
  },
  NO_EXPERIENCE_SIGNALS: {
    code: "NO_EXPERIENCE_SIGNALS",
    severity: "notice",
    category: "content",
    title: "No first-hand experience signals detected",
    description: "Content lacks indicators of personal/first-hand experience.",
    impact: 'The "Experience" in E-E-A-T values authentic, first-hand knowledge.',
    howToFix: "Add personal insights, original photos, or hands-on testing details."
  },
  // IndexNow
  INDEXNOW_NOT_IMPLEMENTED: {
    code: "INDEXNOW_NOT_IMPLEMENTED",
    severity: "notice",
    category: "crawlability",
    title: "IndexNow not implemented",
    description: "Site does not appear to have IndexNow instant indexing set up.",
    impact: "Content changes may take longer to appear in Bing, Yandex, and other search engines.",
    howToFix: "Create a key at indexnow.org and implement the IndexNow protocol."
  },
  INDEXNOW_INVALID_KEY: {
    code: "INDEXNOW_INVALID_KEY",
    severity: "warning",
    category: "crawlability",
    title: "IndexNow key format invalid",
    description: "The IndexNow key does not match expected formats.",
    impact: "IndexNow submissions may fail with invalid key format.",
    howToFix: "Use a valid key format: 32-character hex or UUID format."
  },
  // Content Science (Novel Checks)
  ZIPF_KEYWORD_STUFFING: {
    code: "ZIPF_KEYWORD_STUFFING",
    severity: "warning",
    category: "content",
    title: "Unnatural keyword distribution detected",
    description: "Content deviates from natural language patterns (Zipf's law). Possible keyword stuffing.",
    impact: "Search engines can detect unnatural text patterns, potentially triggering spam filters.",
    howToFix: "Reduce repetition of over-used keywords and use more natural language."
  },
  LOW_CONTENT_ENTROPY: {
    code: "LOW_CONTENT_ENTROPY",
    severity: "warning",
    category: "content",
    title: "Low vocabulary diversity (thin content signal)",
    description: "Content entropy is low, indicating repetitive or thin content.",
    impact: "Low diversity content may be seen as low-quality by search engines.",
    howToFix: "Expand vocabulary, add more unique insights, and reduce repetitive phrases."
  },
  HIGH_CONTENT_REPETITION: {
    code: "HIGH_CONTENT_REPETITION",
    severity: "notice",
    category: "content",
    title: "High content repetition detected",
    description: "Content shows high repetition pattern.",
    impact: "Highly repetitive content provides less value and may hurt engagement.",
    howToFix: "Vary your vocabulary and sentence structures. Avoid repeating the same phrases."
  },
  BM25_KEYWORD_MISSING: {
    code: "BM25_KEYWORD_MISSING",
    severity: "warning",
    category: "on-page",
    title: "Target keyword not found",
    description: "A target keyword is not present in your content at all.",
    impact: "Page unlikely to rank for this keyword without any mention of it.",
    howToFix: "Add natural mentions of the target keyword in your content."
  },
  BM25_KEYWORD_SATURATED: {
    code: "BM25_KEYWORD_SATURATED",
    severity: "notice",
    category: "on-page",
    title: "Keyword over-optimized",
    description: "Keyword found many times. Additional mentions provide diminishing returns.",
    impact: "Over-optimization can trigger spam signals.",
    howToFix: "Use semantic variations and related terms instead of exact repetition."
  },
  // Site Maturity
  NEW_SITE_STRATEGY: {
    code: "NEW_SITE_STRATEGY",
    severity: "notice",
    category: "content",
    title: "New website detected - Authority-first strategy recommended",
    description: "Your site appears to be new (<90 days). Standard SEO advice won't work well.",
    impact: "Creating lots of content without authority is wasted effort.",
    howToFix: "Focus on building 10+ quality backlinks to ONE great page before expanding content."
  },
  CONTENT_AUTHORITY_IMBALANCE: {
    code: "CONTENT_AUTHORITY_IMBALANCE",
    severity: "warning",
    category: "content",
    title: "Content-to-authority imbalance",
    description: "Site has many pages but limited backlink signals. Content is unlikely to rank.",
    impact: "Most of your content may be invisible to search engines due to low domain authority.",
    howToFix: "Stop publishing new content. Focus 100% on link building until you see ranking improvements."
  },
  GROWING_SITE_NO_BLOG: {
    code: "GROWING_SITE_NO_BLOG",
    severity: "notice",
    category: "content",
    title: "Growing site without blog/content hub",
    description: "Site is in growth phase but lacks a blog or content section.",
    impact: "Blog content is essential for attracting backlinks and building topical authority.",
    howToFix: "Create a blog section with linkable content assets (guides, research, tools)."
  },
  // Keyword Cannibalization
  INTERNAL_CANNIBALIZATION_SIGNAL: {
    code: "INTERNAL_CANNIBALIZATION_SIGNAL",
    severity: "warning",
    category: "content",
    title: "Duplicate H1 tags on page",
    description: "Page has multiple H1 tags with duplicates, which can dilute keyword focus.",
    impact: "Multiple similar H1s can confuse search engines about page topic.",
    howToFix: "Use a single, unique H1 that clearly defines the page topic."
  },
  TITLE_H1_KEYWORD_MISMATCH: {
    code: "TITLE_H1_KEYWORD_MISMATCH",
    severity: "warning",
    category: "on-page",
    title: "Title and H1 target different keywords",
    description: "The title tag and H1 heading have no overlapping keywords.",
    impact: "Search engines may be confused about the primary topic of the page.",
    howToFix: "Align title and H1 to target the same primary keyword or topic."
  },
  // ==================== ASSET MINIFICATION ====================
  CSS_NOT_MINIFIED: {
    code: "CSS_NOT_MINIFIED",
    severity: "warning",
    category: "performance",
    title: "CSS files not minified",
    description: "CSS files contain unnecessary whitespace, comments, or unoptimized code.",
    impact: "Unminified CSS increases file size and page load time.",
    howToFix: "Use a CSS minifier (cssnano, clean-css) or ensure build tools minify CSS in production."
  },
  JS_NOT_MINIFIED: {
    code: "JS_NOT_MINIFIED",
    severity: "warning",
    category: "performance",
    title: "JavaScript files not minified",
    description: "JavaScript files contain unnecessary whitespace, comments, or long variable names.",
    impact: "Unminified JavaScript increases file size, parse time, and page load time.",
    howToFix: "Use a JS minifier (Terser, UglifyJS) or ensure build tools minify JS in production."
  },
  // ==================== PAGE RESOURCES ====================
  PAGE_RESOURCES_EXCESSIVE: {
    code: "PAGE_RESOURCES_EXCESSIVE",
    severity: "error",
    category: "performance",
    title: "Excessive number of page resources",
    description: "Page makes over 100 HTTP requests for resources.",
    impact: "Too many HTTP requests cause slow page loads due to connection overhead and browser limits.",
    howToFix: "Combine CSS/JS files, use image sprites, lazy-load resources, remove unused dependencies."
  },
  PAGE_RESOURCES_HIGH: {
    code: "PAGE_RESOURCES_HIGH",
    severity: "warning",
    category: "performance",
    title: "High number of page resources",
    description: "Page makes over 50 HTTP requests for resources.",
    impact: "Many HTTP requests increase page load time, especially on mobile networks.",
    howToFix: "Bundle CSS/JS files, lazy-load images below the fold, consider critical CSS inlining."
  },
  PAGE_RESOURCES_THIRD_PARTY_HIGH: {
    code: "PAGE_RESOURCES_THIRD_PARTY_HIGH",
    severity: "warning",
    category: "performance",
    title: "Many third-party resources",
    description: "Page loads many resources from third-party domains.",
    impact: "Third-party resources add latency and are outside your control.",
    howToFix: "Self-host critical third-party resources when possible. Use preconnect hints for remaining."
  },
  PAGE_RESOURCES_MANY_IFRAMES: {
    code: "PAGE_RESOURCES_MANY_IFRAMES",
    severity: "warning",
    category: "performance",
    title: "Multiple iframes detected",
    description: "Page contains multiple iframes, each loading its own document.",
    impact: "Iframes significantly increase page weight and can block the main thread.",
    howToFix: "Lazy-load iframes below the fold. Consider native embeds or facade patterns."
  },
  // ==================== RESPONSIVE CSS ====================
  RESPONSIVE_NO_VIEWPORT: {
    code: "RESPONSIVE_NO_VIEWPORT",
    severity: "error",
    category: "mobile",
    title: "Missing viewport meta tag",
    description: "No viewport meta tag found for responsive design.",
    impact: "Without viewport meta, mobile browsers render at desktop width and scale down.",
    howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head>.'
  },
  RESPONSIVE_NO_MEDIA_QUERIES: {
    code: "RESPONSIVE_NO_MEDIA_QUERIES",
    severity: "warning",
    category: "mobile",
    title: "No CSS media queries detected",
    description: "No @media queries found in stylesheets.",
    impact: "Without media queries, the site uses fixed layouts that do not adapt to screen sizes.",
    howToFix: "Add CSS media queries for different screen sizes. Use mobile-first approach."
  },
  RESPONSIVE_NO_MOBILE_BREAKPOINT: {
    code: "RESPONSIVE_NO_MOBILE_BREAKPOINT",
    severity: "warning",
    category: "mobile",
    title: "No mobile breakpoints detected",
    description: "Media queries exist but none target mobile screen sizes.",
    impact: "Site may not be optimized for mobile devices, hurting majority of traffic.",
    howToFix: "Add media queries for mobile: @media (max-width: 768px) { ... }"
  },
  // ==================== LINKS RATIO ====================
  LINKS_NO_INTERNAL: {
    code: "LINKS_NO_INTERNAL",
    severity: "warning",
    category: "links",
    title: "No internal links found",
    description: "Page has no internal links to other pages on the site.",
    impact: "Internal links help search engines discover pages and distribute link equity.",
    howToFix: "Add relevant internal links to related content or navigation."
  },
  LINKS_NO_EXTERNAL: {
    code: "LINKS_NO_EXTERNAL",
    severity: "notice",
    category: "links",
    title: "No external links found",
    description: "Page has no links to external websites.",
    impact: "Linking to authoritative sources improves credibility and content context.",
    howToFix: "Add links to high-quality external sources that support your content."
  },
  LINKS_RATIO_POOR: {
    code: "LINKS_RATIO_POOR",
    severity: "warning",
    category: "links",
    title: "Poor internal-to-external link ratio",
    description: "Page has more external links than internal links.",
    impact: "Too many external links can dilute page authority and may look spammy.",
    howToFix: "Add more internal links. Aim for at least 2 internal links per external link."
  },
  // ==================== URL SAFETY (Local Hash Database) ====================
  URL_SAFETY_KNOWN_THREAT: {
    code: "URL_SAFETY_KNOWN_THREAT",
    severity: "error",
    category: "security",
    title: "Website URL matches known threat database",
    description: "Your website URL matches entries in the local threat database.",
    impact: "Browsers and security tools may block access to your site. Search engines may remove you from results.",
    howToFix: "Scan your site for malware, remove any malicious content, and request removal from threat databases."
  },
  URL_SAFETY_EXTERNAL_THREAT: {
    code: "URL_SAFETY_EXTERNAL_THREAT",
    severity: "error",
    category: "security",
    title: "External links to known malicious URLs",
    description: "External links point to URLs flagged in threat databases.",
    impact: "Linking to malicious sites harms visitors and damages your reputation and rankings.",
    howToFix: "Remove all links to flagged URLs immediately."
  },
  URL_SAFETY_SUSPICIOUS_DOMAIN: {
    code: "URL_SAFETY_SUSPICIOUS_DOMAIN",
    severity: "warning",
    category: "security",
    title: "Website URL has suspicious characteristics",
    description: "Your URL shows patterns commonly associated with phishing or malicious sites.",
    impact: "Users and security tools may distrust your site.",
    howToFix: "Use a trustworthy domain structure. Avoid patterns that mimic other brands or use suspicious TLDs."
  },
  URL_SAFETY_SUSPICIOUS_EXTERNAL: {
    code: "URL_SAFETY_SUSPICIOUS_EXTERNAL",
    severity: "warning",
    category: "security",
    title: "External links with suspicious characteristics",
    description: "External links show patterns associated with phishing or malicious sites.",
    impact: "Linking to suspicious sites can harm visitors and rankings.",
    howToFix: "Review and remove or replace suspicious external links."
  },
  URL_SAFETY_SHORTENERS: {
    code: "URL_SAFETY_SHORTENERS",
    severity: "notice",
    category: "security",
    title: "External links use URL shorteners",
    description: "External links use URL shorteners, hiding the actual destination.",
    impact: "URL shorteners reduce trust and SEO link value.",
    howToFix: "Replace shortened URLs with direct links to the destination."
  },
  // ==================== FRAMEWORK-SPECIFIC SEO ====================
  REACT_CSR_DETECTED: {
    code: "REACT_CSR_DETECTED",
    severity: "error",
    category: "framework",
    title: "Client-side rendered React app detected",
    description: "React apps without SSR send empty HTML to crawlers. Search engines may not index your content.",
    impact: "Critical - your content is likely invisible to Google.",
    howToFix: "Migrate to Next.js for automatic SSR/SSG, add prerendering with react-snap, or use react-helmet-async with a prerender service."
  },
  NEXTJS_NO_METADATA_API: {
    code: "NEXTJS_NO_METADATA_API",
    severity: "warning",
    category: "framework",
    title: "Not using Next.js Metadata API",
    description: "Next.js 13+ has a built-in Metadata API that is more reliable than third-party solutions.",
    impact: "Missing out on Next.js optimized SEO features.",
    howToFix: "Use export const metadata or generateMetadata in your page/layout files."
  },
  VUE_CSR_DETECTED: {
    code: "VUE_CSR_DETECTED",
    severity: "error",
    category: "framework",
    title: "Client-side rendered Vue app detected",
    description: "Vue apps without SSR send empty HTML to crawlers.",
    impact: "Your content may not be indexed by search engines.",
    howToFix: "Migrate to Nuxt for automatic SSR/SSG, or add SSR with @vue/server-renderer."
  },
  ANGULAR_NO_UNIVERSAL: {
    code: "ANGULAR_NO_UNIVERSAL",
    severity: "error",
    category: "framework",
    title: "Angular app without Universal (SSR)",
    description: "Client-side Angular apps send empty HTML to crawlers.",
    impact: "Your content may not be indexed by search engines.",
    howToFix: "Add Angular Universal for SSR: ng add @angular/ssr"
  },
  WORDPRESS_NO_SEO_PLUGIN: {
    code: "WORDPRESS_NO_SEO_PLUGIN",
    severity: "warning",
    category: "framework",
    title: "No SEO plugin detected",
    description: "WordPress benefits greatly from an SEO plugin like Yoast or Rank Math.",
    impact: "Missing automated SEO features like sitemaps, schema, and meta tag management.",
    howToFix: "Install Yoast SEO or Rank Math plugin."
  },
  WORDPRESS_NO_CACHING: {
    code: "WORDPRESS_NO_CACHING",
    severity: "warning",
    category: "framework",
    title: "No caching plugin detected",
    description: "WordPress without caching is slow, hurting Core Web Vitals.",
    impact: "Poor performance affects user experience and rankings.",
    howToFix: "Install WP Super Cache, W3 Total Cache, or LiteSpeed Cache."
  },
  SPA_EMPTY_BODY: {
    code: "SPA_EMPTY_BODY",
    severity: "error",
    category: "framework",
    title: "Single Page App with empty body",
    description: "Page body contains minimal content, suggesting client-side rendering without SSR.",
    impact: "Search engines see an empty page and cannot index your content.",
    howToFix: "Implement server-side rendering, static site generation, or prerendering."
  },
  FRAMEWORK_OUTDATED: {
    code: "FRAMEWORK_OUTDATED",
    severity: "warning",
    category: "framework",
    title: "Outdated framework version detected",
    description: "Running an outdated version of your framework may have security vulnerabilities and SEO bugs.",
    impact: "Potential security issues and missing SEO improvements.",
    howToFix: "Update to the latest stable version of your framework."
  }
};

// src/utils/http.ts
var DEFAULT_TIMEOUT = 3e4;
var DEFAULT_USER_AGENT = "RankCLI/1.0 (+https://rankcli.dev)";
function createTimeoutController(timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
}
function headersToObject(headers) {
  const obj = {};
  headers.forEach((value, key) => {
    obj[key.toLowerCase()] = value;
  });
  return obj;
}
async function httpGet(url, config = {}) {
  const {
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    validateStatus = (status) => status >= 200 && status < 300,
    maxRedirects = 5,
    params
  } = config;
  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, String(value));
    }
    const separator = url.includes("?") ? "&" : "?";
    finalUrl = `${url}${separator}${searchParams.toString()}`;
  }
  const { controller, timeoutId } = createTimeoutController(timeout);
  try {
    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        ...headers
      },
      signal: controller.signal,
      redirect: maxRedirects > 0 ? "follow" : "manual"
    });
    clearTimeout(timeoutId);
    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    if (!validateStatus(response.status)) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: headersToObject(response.headers)
      };
      throw error;
    }
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: headersToObject(response.headers)
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
async function httpHead(url, config = {}) {
  const {
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    validateStatus = (status) => status >= 200 && status < 300,
    maxRedirects = 5
  } = config;
  const { controller, timeoutId } = createTimeoutController(timeout);
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        ...headers
      },
      signal: controller.signal,
      redirect: maxRedirects > 0 ? "follow" : "manual"
    });
    clearTimeout(timeoutId);
    if (!validateStatus(response.status)) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = {
        data: null,
        status: response.status,
        statusText: response.statusText,
        headers: headersToObject(response.headers)
      };
      throw error;
    }
    return {
      data: null,
      status: response.status,
      statusText: response.statusText,
      headers: headersToObject(response.headers)
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
async function httpPost(url, data, config = {}) {
  const {
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    validateStatus = (status) => status >= 200 && status < 300,
    auth
  } = config;
  const { controller, timeoutId } = createTimeoutController(timeout);
  const requestHeaders = {
    "User-Agent": DEFAULT_USER_AGENT,
    "Content-Type": "application/json",
    ...headers
  };
  if (auth) {
    const credentials = btoa(`${auth.username}:${auth.password}`);
    requestHeaders["Authorization"] = `Basic ${credentials}`;
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : void 0,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const contentType = response.headers.get("content-type") || "";
    let responseData;
    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    if (!validateStatus(response.status)) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: headersToObject(response.headers)
      };
      throw error;
    }
    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: headersToObject(response.headers)
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// src/audit/checks/crawlability.ts
async function checkRobotsTxt(baseUrl) {
  const issues = [];
  const url = new URL("/robots.txt", baseUrl).href;
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 404) {
      issues.push({
        ...ISSUE_DEFINITIONS.ROBOTS_TXT_MISSING,
        affectedUrls: [url]
      });
      return {
        issues,
        data: { exists: false, blocksAll: false, hasSitemap: false, sitemapUrls: [] }
      };
    }
    const content = response.data;
    const lines = content.toLowerCase().split("\n");
    let blocksAll = false;
    let currentUserAgent = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("user-agent:")) {
        currentUserAgent = trimmed.split(":")[1].trim();
      }
      if (trimmed === "disallow: /" && currentUserAgent === "*") {
        blocksAll = true;
      }
    }
    if (blocksAll) {
      issues.push({
        ...ISSUE_DEFINITIONS.ROBOTS_TXT_BLOCKS_ALL,
        affectedUrls: [url]
      });
    }
    const sitemapUrls = [];
    for (const line of content.split("\n")) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith("sitemap:")) {
        const sitemapUrl = line.trim().substring(8).trim();
        sitemapUrls.push(sitemapUrl);
      }
    }
    return {
      issues,
      data: {
        exists: true,
        content,
        blocksAll,
        hasSitemap: sitemapUrls.length > 0,
        sitemapUrls
      }
    };
  } catch (error) {
    issues.push({
      ...ISSUE_DEFINITIONS.ROBOTS_TXT_MISSING,
      affectedUrls: [url],
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    });
    return {
      issues,
      data: { exists: false, blocksAll: false, hasSitemap: false, sitemapUrls: [] }
    };
  }
}
async function checkSitemap(baseUrl, robotsData) {
  const issues = [];
  const sitemapUrls = robotsData.sitemapUrls.length > 0 ? robotsData.sitemapUrls : [
    new URL("/sitemap.xml", baseUrl).href,
    new URL("/sitemap_index.xml", baseUrl).href
  ];
  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await httpGet(sitemapUrl, {
        timeout: 1e4,
        validateStatus: () => true
      });
      if (response.status === 200 && response.data.includes("<urlset") || response.data.includes("<sitemapindex")) {
        const content = response.data;
        const urlMatches = content.match(/<loc>/g);
        const urlCount = urlMatches ? urlMatches.length : 0;
        if (!robotsData.hasSitemap) {
          issues.push({
            ...ISSUE_DEFINITIONS.SITEMAP_NOT_IN_ROBOTS,
            affectedUrls: [sitemapUrl]
          });
        }
        return {
          issues,
          data: { exists: true, url: sitemapUrl, urlCount, errors: [] }
        };
      }
    } catch {
    }
  }
  issues.push({
    ...ISSUE_DEFINITIONS.SITEMAP_MISSING,
    affectedUrls: [new URL("/sitemap.xml", baseUrl).href]
  });
  return {
    issues,
    data: { exists: false, urlCount: 0, errors: ["No sitemap found"] }
  };
}
async function checkRedirects(url) {
  const issues = [];
  const chain = [url];
  let currentUrl = url;
  let maxRedirects = 10;
  while (maxRedirects > 0) {
    try {
      const response = await httpGet(currentUrl, {
        timeout: 1e4,
        maxRedirects: 0,
        validateStatus: () => true
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.location;
        if (!location)
          break;
        const nextUrl = new URL(location, currentUrl).href;
        if (chain.includes(nextUrl)) {
          issues.push({
            ...ISSUE_DEFINITIONS.REDIRECT_LOOP,
            affectedUrls: chain,
            details: { chain, loopTo: nextUrl }
          });
          break;
        }
        chain.push(nextUrl);
        currentUrl = nextUrl;
        maxRedirects--;
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  if (chain.length > 2) {
    issues.push({
      ...ISSUE_DEFINITIONS.REDIRECT_CHAIN,
      affectedUrls: chain,
      details: { chain, hops: chain.length - 1 }
    });
  }
  return { issues, chain, finalUrl: currentUrl };
}
async function runCrawlabilityChecks(baseUrl) {
  const allIssues = [];
  const robotsResult = await checkRobotsTxt(baseUrl);
  allIssues.push(...robotsResult.issues);
  const sitemapResult = await checkSitemap(baseUrl, robotsResult.data);
  allIssues.push(...sitemapResult.issues);
  const redirectResult = await checkRedirects(baseUrl);
  allIssues.push(...redirectResult.issues);
  return allIssues;
}

// src/audit/checks/on-page.ts
import * as cheerio from "https://esm.sh/cheerio@1.0.0";
function analyzeOnPage(html, url) {
  const issues = [];
  const $ = cheerio.load(html);
  const title = $("title").text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim();
  const canonical = $('link[rel="canonical"]').attr("href");
  const metaRobots = $('meta[name="robots"]').attr("content");
  const hasNoindex = metaRobots?.toLowerCase().includes("noindex") || false;
  const h1s = [];
  $("h1").each((_, el) => {
    h1s.push($(el).text().trim());
  });
  const headings = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const level = parseInt(el.tagName.charAt(1), 10);
    headings.push({ level, text: $(el).text().trim() });
  });
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
  const textLength = bodyText.length;
  const htmlLength = html.length;
  const textToHtmlRatio = htmlLength > 0 ? textLength / htmlLength * 100 : 0;
  const data = {
    title: title || void 0,
    titleLength: title?.length || 0,
    description,
    descriptionLength: description?.length || 0,
    canonical,
    h1s,
    headings,
    wordCount,
    textToHtmlRatio,
    hasNoindex,
    metaRobots
  };
  if (!title) {
    issues.push({
      ...ISSUE_DEFINITIONS.TITLE_MISSING,
      affectedUrls: [url]
    });
  } else {
    if (title.length < 30) {
      issues.push({
        ...ISSUE_DEFINITIONS.TITLE_TOO_SHORT,
        affectedUrls: [url],
        details: { title, length: title.length }
      });
    } else if (title.length > 60) {
      issues.push({
        ...ISSUE_DEFINITIONS.TITLE_TOO_LONG,
        affectedUrls: [url],
        details: { title, length: title.length }
      });
    }
  }
  if (!description) {
    issues.push({
      ...ISSUE_DEFINITIONS.META_DESC_MISSING,
      affectedUrls: [url]
    });
  } else {
    if (description.length < 120) {
      issues.push({
        ...ISSUE_DEFINITIONS.META_DESC_TOO_SHORT,
        affectedUrls: [url],
        details: { description, length: description.length }
      });
    } else if (description.length > 160) {
      issues.push({
        ...ISSUE_DEFINITIONS.META_DESC_TOO_LONG,
        affectedUrls: [url],
        details: { description, length: description.length }
      });
    }
  }
  if (!canonical) {
    issues.push({
      ...ISSUE_DEFINITIONS.CANONICAL_MISSING,
      affectedUrls: [url]
    });
  }
  const canonicalCount = $('link[rel="canonical"]').length;
  if (canonicalCount > 1) {
    issues.push({
      ...ISSUE_DEFINITIONS.MULTIPLE_CANONICALS,
      affectedUrls: [url],
      details: { count: canonicalCount }
    });
  }
  if (h1s.length === 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.H1_MISSING,
      affectedUrls: [url]
    });
  } else if (h1s.length > 1) {
    issues.push({
      ...ISSUE_DEFINITIONS.H1_MULTIPLE,
      affectedUrls: [url],
      details: { h1s, count: h1s.length }
    });
  }
  if (h1s.length === 1 && title && h1s[0].toLowerCase() === title.toLowerCase()) {
    issues.push({
      ...ISSUE_DEFINITIONS.H1_DUPLICATE_OF_TITLE,
      affectedUrls: [url],
      details: { h1: h1s[0], title }
    });
  }
  const h2Count = headings.filter((h) => h.level === 2).length;
  if (h2Count === 0 && wordCount > 100) {
    issues.push({
      code: "H2_MISSING",
      severity: "warning",
      category: "on-page",
      title: "No H2 headings found",
      description: "No H2 tags were found on the page. H2 headings help structure content and improve readability.",
      impact: "Without H2 headings, search engines and users may find it harder to understand content structure. H2s are important for featuring in search results.",
      howToFix: "Break your content into logical sections using H2 headings. Include relevant keywords naturally in your H2 tags.",
      affectedUrls: [url]
    });
  }
  let previousLevel = 0;
  for (const heading of headings) {
    if (heading.level > previousLevel + 1 && previousLevel > 0) {
      issues.push({
        ...ISSUE_DEFINITIONS.HEADING_SKIP,
        affectedUrls: [url],
        details: { from: previousLevel, to: heading.level }
      });
      break;
    }
    previousLevel = heading.level;
  }
  if (wordCount < 300) {
    issues.push({
      ...ISSUE_DEFINITIONS.THIN_CONTENT,
      affectedUrls: [url],
      details: { wordCount }
    });
  }
  if (textToHtmlRatio < 10) {
    issues.push({
      ...ISSUE_DEFINITIONS.LOW_TEXT_HTML_RATIO,
      affectedUrls: [url],
      details: { ratio: textToHtmlRatio.toFixed(1) + "%" }
    });
  }
  if (hasNoindex) {
    issues.push({
      ...ISSUE_DEFINITIONS.NOINDEX_TAG,
      affectedUrls: [url],
      details: { metaRobots }
    });
  }
  return { issues, data };
}

// src/audit/checks/links.ts
import * as cheerio2 from "https://esm.sh/cheerio@1.0.0";
async function analyzeLinks(html, baseUrl, checkBroken = false) {
  const issues = [];
  const $ = cheerio2.load(html);
  const baseHostname = new URL(baseUrl).hostname;
  const internal = [];
  const external = [];
  const brokenInternal = [];
  const brokenExternal = [];
  const jsOnlyNavigation = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    const rel = $(el).attr("rel") || "";
    const nofollow = rel.includes("nofollow");
    if (href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
      return;
    }
    try {
      const fullUrl = new URL(href, baseUrl).href;
      const linkHostname = new URL(fullUrl).hostname;
      const isInternal = linkHostname === baseHostname;
      if (isInternal) {
        internal.push({ href: fullUrl, text, nofollow });
        if (nofollow) {
          issues.push({
            ...ISSUE_DEFINITIONS.NOFOLLOW_INTERNAL,
            affectedUrls: [baseUrl],
            details: { link: fullUrl, anchorText: text }
          });
        }
      } else {
        external.push({ href: fullUrl, text, nofollow });
      }
    } catch {
    }
  });
  const totalLinks = internal.length + external.length;
  const navPatterns = /navigate|router|history\.push|location\.href|window\.location|goto|redirect/i;
  const navTextPatterns = /^(home|about|contact|pricing|blog|docs|features|products?|services?|sign\s*up|log\s*in|register|dashboard|account|settings|help|faq|support|menu|nav)$/i;
  $("button[onclick], div[onclick], span[onclick], li[onclick]").each((_, el) => {
    const $el = $(el);
    const onclick = $el.attr("onclick") || "";
    const text = $el.text().trim().substring(0, 50);
    if (navPatterns.test(onclick) || navTextPatterns.test(text)) {
      jsOnlyNavigation.push({
        element: el.tagName.toLowerCase(),
        text: text || "(no text)",
        reason: "Element uses onClick for navigation instead of <a href>"
      });
    }
  });
  $("a[onclick]").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href") || "";
    const onclick = $el.attr("onclick") || "";
    const text = $el.text().trim().substring(0, 50);
    if ((href === "#" || href === "" || href.startsWith("javascript:")) && onclick) {
      jsOnlyNavigation.push({
        element: "a",
        text: text || "(no text)",
        reason: `Link has href="${href}" with onClick - crawlers cannot follow this`
      });
    }
  });
  $("[data-href], [data-to], [data-link], [data-route]").each((_, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();
    const text = $el.text().trim().substring(0, 50);
    if (tagName !== "a" || !$el.attr("href") || $el.attr("href") === "#") {
      jsOnlyNavigation.push({
        element: tagName,
        text: text || "(no text)",
        reason: "Uses data attribute for routing instead of real href"
      });
    }
  });
  if (jsOnlyNavigation.length > 0) {
    const uniqueNav = jsOnlyNavigation.slice(0, 10);
    issues.push({
      ...ISSUE_DEFINITIONS.JS_ONLY_NAVIGATION,
      affectedUrls: [baseUrl],
      details: {
        count: jsOnlyNavigation.length,
        examples: uniqueNav
      }
    });
  }
  const internalCount = internal.length;
  const externalCount = external.length;
  const internalToExternalRatio = externalCount > 0 ? internalCount / externalCount : null;
  if (totalLinks > 100) {
    issues.push({
      ...ISSUE_DEFINITIONS.TOO_MANY_LINKS,
      affectedUrls: [baseUrl],
      details: { totalLinks, internal: internalCount, external: externalCount }
    });
  }
  if (internalCount === 0 && totalLinks > 0) {
    issues.push({
      code: "LINKS_NO_INTERNAL",
      severity: "warning",
      category: "links",
      title: "No internal links found",
      description: "This page has no internal links to other pages on your site.",
      impact: "Internal links are crucial for SEO. They help search engines discover pages and distribute link equity throughout your site.",
      howToFix: "Add relevant internal links to related content, navigation, or related articles section.",
      affectedUrls: [baseUrl],
      details: { totalLinks, external: externalCount }
    });
  }
  if (externalCount === 0 && totalLinks > 5) {
    issues.push({
      code: "LINKS_NO_EXTERNAL",
      severity: "notice",
      category: "links",
      title: "No external links found",
      description: "This page has no links to external websites.",
      impact: "Linking to high-quality external sources can improve credibility and help search engines understand your content context.",
      howToFix: "Add links to authoritative external sources that support your content. This builds trust and provides value to readers.",
      affectedUrls: [baseUrl],
      details: { totalLinks, internal: internalCount }
    });
  }
  if (externalCount > internalCount && externalCount > 5 && internalCount < 3) {
    issues.push({
      code: "LINKS_RATIO_POOR",
      severity: "warning",
      category: "links",
      title: "Poor internal-to-external link ratio",
      description: `Page has ${externalCount} external links but only ${internalCount} internal links.`,
      impact: "A healthy page should have more internal links than external links. Too many external links can dilute page authority and may look spammy.",
      howToFix: "Add more relevant internal links to balance the ratio. Aim for at least 2-3 internal links for every external link.",
      affectedUrls: [baseUrl],
      details: {
        internal: internalCount,
        external: externalCount,
        ratio: internalToExternalRatio ? `1:${(1 / internalToExternalRatio).toFixed(1)}` : "N/A",
        recommendation: "Aim for a ratio of at least 2:1 (internal:external)"
      }
    });
  }
  if (checkBroken) {
    const internalToCheck = internal.slice(0, 10);
    for (const link of internalToCheck) {
      try {
        const response = await httpHead(link.href, {
          timeout: 5e3,
          maxRedirects: 5,
          validateStatus: () => true
        });
        if (response.status >= 400) {
          brokenInternal.push(link.href);
        }
      } catch {
        brokenInternal.push(link.href);
      }
    }
    const externalToCheck = external.slice(0, 5);
    for (const link of externalToCheck) {
      try {
        const response = await httpHead(link.href, {
          timeout: 5e3,
          maxRedirects: 5,
          validateStatus: () => true
        });
        if (response.status >= 400) {
          brokenExternal.push(link.href);
        }
      } catch {
      }
    }
    for (const brokenLink of brokenInternal) {
      issues.push({
        ...ISSUE_DEFINITIONS.BROKEN_INTERNAL_LINK,
        affectedUrls: [baseUrl],
        details: { brokenLink }
      });
    }
    for (const brokenLink of brokenExternal) {
      issues.push({
        ...ISSUE_DEFINITIONS.BROKEN_EXTERNAL_LINK,
        affectedUrls: [baseUrl],
        details: { brokenLink }
      });
    }
  }
  return {
    issues,
    data: {
      internal,
      external,
      totalLinks,
      brokenInternal,
      brokenExternal,
      jsOnlyNavigation,
      ratio: {
        internal: internalCount,
        external: externalCount,
        internalToExternalRatio
      }
    }
  };
}

// src/audit/checks/images.ts
import * as cheerio3 from "https://esm.sh/cheerio@1.0.0";
async function analyzeImages(html, baseUrl, checkBroken = false) {
  const issues = [];
  const $ = cheerio3.load(html);
  const missingAlt = [];
  const emptyAlt = [];
  const missingDimensions = [];
  const largeImages = [];
  const brokenImages = [];
  let lazyLoaded = 0;
  let withDimensions = 0;
  let total = 0;
  const images = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const alt = $(el).attr("alt");
    const width = $(el).attr("width");
    const height = $(el).attr("height");
    const loading = $(el).attr("loading");
    if (!src || src.startsWith("data:"))
      return;
    total++;
    images.push({ src, alt: alt === void 0 ? null : alt, width, height, loading });
    if (alt === void 0 || alt === null) {
      missingAlt.push({ src });
    } else if (alt === "") {
      emptyAlt.push({ src });
    }
    if (!width || !height) {
      missingDimensions.push({ src });
    } else {
      withDimensions++;
    }
    if (loading === "lazy") {
      lazyLoaded++;
    }
  });
  if (checkBroken) {
    const imagesToCheck = images.slice(0, 10);
    for (const img of imagesToCheck) {
      try {
        const fullUrl = new URL(img.src, baseUrl).href;
        const response = await httpHead(fullUrl, {
          timeout: 5e3,
          validateStatus: () => true
        });
        if (response.status >= 400) {
          brokenImages.push({ src: img.src });
        } else {
          const contentLength = parseInt(response.headers["content-length"] || "0", 10);
          if (contentLength > 200 * 1024) {
            largeImages.push({ src: img.src, size: contentLength });
          }
        }
      } catch {
      }
    }
  }
  if (missingAlt.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_ALT_MISSING,
      affectedUrls: [baseUrl],
      details: {
        count: missingAlt.length,
        images: missingAlt.slice(0, 5).map((i) => i.src)
      }
    });
  }
  if (emptyAlt.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_ALT_EMPTY,
      affectedUrls: [baseUrl],
      details: {
        count: emptyAlt.length,
        images: emptyAlt.slice(0, 5).map((i) => i.src)
      }
    });
  }
  if (missingDimensions.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_NO_DIMENSIONS,
      affectedUrls: [baseUrl],
      details: {
        count: missingDimensions.length,
        images: missingDimensions.slice(0, 5).map((i) => i.src)
      }
    });
  }
  for (const img of largeImages) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_TOO_LARGE,
      affectedUrls: [baseUrl],
      details: {
        src: img.src,
        size: img.size ? `${(img.size / 1024).toFixed(0)}KB` : "Unknown"
      }
    });
  }
  for (const img of brokenImages) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_BROKEN,
      affectedUrls: [baseUrl],
      details: { src: img.src }
    });
  }
  return {
    issues,
    data: {
      total,
      missingAlt,
      emptyAlt,
      missingDimensions,
      largImages: largeImages,
      brokenImages,
      lazyLoaded,
      withDimensions
    }
  };
}

// src/audit/checks/performance.ts
async function analyzePerformance(url) {
  const issues = [];
  const startTime = Date.now();
  try {
    const response = await httpGet(url, {
      headers: {
        "Accept-Encoding": "gzip, deflate, br"
      },
      timeout: 3e4,
      validateStatus: () => true
    });
    const loadTime = Date.now() - startTime;
    const ttfbTime = Math.min(loadTime, loadTime * 0.3);
    const htmlSize = typeof response.data === "string" ? response.data.length : 0;
    const contentEncoding = response.headers["content-encoding"];
    const cacheControl = response.headers["cache-control"];
    const compressed = !!contentEncoding && ["gzip", "deflate", "br"].some((e) => contentEncoding.includes(e));
    const data = {
      loadTime,
      ttfb: ttfbTime || loadTime,
      htmlSize,
      compressed,
      cacheControl,
      contentEncoding
    };
    if (loadTime > 3e3) {
      issues.push({
        ...ISSUE_DEFINITIONS.SLOW_PAGE,
        affectedUrls: [url],
        details: { loadTime: `${(loadTime / 1e3).toFixed(1)}s` }
      });
    }
    if (ttfbTime > 600) {
      issues.push({
        ...ISSUE_DEFINITIONS.SLOW_TTFB,
        affectedUrls: [url],
        details: { ttfb: `${ttfbTime}ms` }
      });
    }
    if (htmlSize > 100 * 1024) {
      issues.push({
        ...ISSUE_DEFINITIONS.HTML_TOO_LARGE,
        affectedUrls: [url],
        details: { size: `${(htmlSize / 1024).toFixed(0)}KB` }
      });
    }
    if (!compressed && htmlSize > 1024) {
      issues.push({
        ...ISSUE_DEFINITIONS.UNCOMPRESSED,
        affectedUrls: [url],
        details: { htmlSize: `${(htmlSize / 1024).toFixed(0)}KB` }
      });
    }
    if (!cacheControl) {
      issues.push({
        ...ISSUE_DEFINITIONS.NO_CACHE,
        affectedUrls: [url]
      });
    }
    return { issues, data };
  } catch (error) {
    return {
      issues: [{
        ...ISSUE_DEFINITIONS.SLOW_PAGE,
        affectedUrls: [url],
        details: { error: error instanceof Error ? error.message : "Request failed" }
      }],
      data: {
        loadTime: 0,
        ttfb: 0,
        htmlSize: 0,
        compressed: false
      }
    };
  }
}
async function fetchCoreWebVitals(url, apiKey) {
  if (!apiKey)
    return null;
  try {
    const response = await httpPost(
      `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${apiKey}`,
      { url },
      { timeout: 1e4 }
    );
    const metrics = response.data?.record?.metrics;
    if (!metrics)
      return null;
    const getRating = (value, thresholds) => {
      if (value <= thresholds[0])
        return "good";
      if (value <= thresholds[1])
        return "needs-improvement";
      return "poor";
    };
    return {
      lcp: metrics.largest_contentful_paint?.percentiles?.p75 ? {
        value: metrics.largest_contentful_paint.percentiles.p75,
        rating: getRating(metrics.largest_contentful_paint.percentiles.p75, [2500, 4e3])
      } : void 0,
      fid: metrics.first_input_delay?.percentiles?.p75 ? {
        value: metrics.first_input_delay.percentiles.p75,
        rating: getRating(metrics.first_input_delay.percentiles.p75, [100, 300])
      } : void 0,
      cls: metrics.cumulative_layout_shift?.percentiles?.p75 ? {
        value: metrics.cumulative_layout_shift.percentiles.p75,
        rating: getRating(metrics.cumulative_layout_shift.percentiles.p75, [0.1, 0.25])
      } : void 0,
      inp: metrics.interaction_to_next_paint?.percentiles?.p75 ? {
        value: metrics.interaction_to_next_paint.percentiles.p75,
        rating: getRating(metrics.interaction_to_next_paint.percentiles.p75, [200, 500])
      } : void 0
    };
  } catch {
    return null;
  }
}

// src/audit/checks/security.ts
import * as cheerio4 from "https://esm.sh/cheerio@1.0.0";
async function analyzeSecurity(html, url, headers) {
  const issues = [];
  const $ = cheerio4.load(html);
  const parsedUrl = new URL(url);
  const isHttps = parsedUrl.protocol === "https:";
  if (!isHttps) {
    issues.push({
      ...ISSUE_DEFINITIONS.NOT_HTTPS,
      affectedUrls: [url]
    });
  }
  const mixedContentUrls = [];
  if (isHttps) {
    $("script[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src?.startsWith("http://")) {
        mixedContentUrls.push(src);
      }
    });
    $('link[rel="stylesheet"][href]').each((_, el) => {
      const href = $(el).attr("href");
      if (href?.startsWith("http://")) {
        mixedContentUrls.push(href);
      }
    });
    $("img[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src?.startsWith("http://")) {
        mixedContentUrls.push(src);
      }
    });
    $("iframe[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src?.startsWith("http://")) {
        mixedContentUrls.push(src);
      }
    });
    if (mixedContentUrls.length > 0) {
      issues.push({
        ...ISSUE_DEFINITIONS.MIXED_CONTENT,
        affectedUrls: [url],
        details: {
          count: mixedContentUrls.length,
          resources: mixedContentUrls.slice(0, 5)
        }
      });
    }
  }
  const hstsHeader = headers["strict-transport-security"];
  const hasHsts = !!hstsHeader;
  let hstsMaxAge;
  if (hstsHeader) {
    const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      hstsMaxAge = parseInt(maxAgeMatch[1], 10);
    }
  } else if (isHttps) {
    issues.push({
      ...ISSUE_DEFINITIONS.HSTS_MISSING,
      affectedUrls: [url]
    });
  }
  const data = {
    isHttps,
    hasMixedContent: mixedContentUrls.length > 0,
    mixedContentUrls,
    hasHsts,
    hstsMaxAge
  };
  return { issues, data };
}
async function checkCertificate(url) {
  const issues = [];
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "https:") {
    return { valid: false, issues };
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5e3);
    await fetch(url, {
      method: "HEAD",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return { valid: true, issues };
  } catch (error) {
    return { valid: false, issues };
  }
}

// src/audit/checks/structured-data.ts
import * as cheerio5 from "https://esm.sh/cheerio@1.0.0";
var SCHEMA_REQUIRED_PROPERTIES = {
  "Organization": ["name", "url"],
  "WebSite": ["name", "url"],
  "WebPage": ["name"],
  "Article": ["headline", "author", "datePublished"],
  "BlogPosting": ["headline", "author", "datePublished"],
  "NewsArticle": ["headline", "author", "datePublished"],
  "Product": ["name", "image"],
  "LocalBusiness": ["name", "address"],
  "Person": ["name"],
  "Event": ["name", "startDate", "location"],
  "Recipe": ["name", "image", "recipeIngredient"],
  "FAQPage": ["mainEntity"],
  "HowTo": ["name", "step"],
  "BreadcrumbList": ["itemListElement"],
  "SoftwareApplication": ["name", "operatingSystem"],
  "VideoObject": ["name", "description", "thumbnailUrl", "uploadDate"],
  "ImageObject": ["contentUrl"],
  "Review": ["itemReviewed", "author"],
  "AggregateRating": ["ratingValue", "reviewCount"],
  "Offer": ["price", "priceCurrency"]
};
var SCHEMA_RECOMMENDED_PROPERTIES = {
  "Organization": ["logo", "sameAs", "contactPoint"],
  "Article": ["image", "publisher", "dateModified"],
  "Product": ["description", "offers", "brand", "review", "aggregateRating"],
  "LocalBusiness": ["telephone", "openingHours", "geo"],
  "SoftwareApplication": ["applicationCategory", "offers", "aggregateRating"],
  "VideoObject": ["duration", "embedUrl"]
};
function analyzeStructuredData(html, url) {
  const issues = [];
  const $ = cheerio5.load(html);
  const schemas = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html();
    if (!content)
      return;
    try {
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@graph"]) {
          for (const graphItem of item["@graph"]) {
            const schemaItem = validateSchemaItem(graphItem);
            schemas.push(schemaItem);
          }
        } else {
          const schemaItem = validateSchemaItem(item);
          schemas.push(schemaItem);
        }
      }
    } catch (e) {
      issues.push({
        ...ISSUE_DEFINITIONS.SCHEMA_INVALID,
        affectedUrls: [url],
        details: {
          error: e instanceof Error ? e.message : "Invalid JSON",
          content: content.substring(0, 200)
        }
      });
    }
  });
  if (schemas.length === 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.SCHEMA_MISSING,
      affectedUrls: [url]
    });
  }
  for (const schema of schemas) {
    if (schema.errors.length > 0) {
      issues.push({
        ...ISSUE_DEFINITIONS.SCHEMA_MISSING_REQUIRED,
        affectedUrls: [url],
        details: {
          type: schema.type,
          missingProperties: schema.errors
        }
      });
    }
  }
  const schemaTypes = schemas.map((s) => s.type).filter(Boolean);
  return {
    issues,
    data: {
      schemas,
      hasSchema: schemas.length > 0,
      schemaTypes
    }
  };
}
function validateSchemaItem(item) {
  const type = item["@type"] || "Unknown";
  const errors = [];
  const warnings = [];
  const required = SCHEMA_REQUIRED_PROPERTIES[type] || [];
  for (const prop of required) {
    if (!item[prop]) {
      errors.push(`Missing required property: ${prop}`);
    }
  }
  const recommended = SCHEMA_RECOMMENDED_PROPERTIES[type] || [];
  for (const prop of recommended) {
    if (!item[prop]) {
      warnings.push(`Missing recommended property: ${prop}`);
    }
  }
  if (type === "BreadcrumbList") {
    const items = item["itemListElement"];
    if (items && Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        const crumb = items[i];
        if (!crumb["position"]) {
          errors.push(`Breadcrumb item ${i + 1} missing position`);
        }
        if (!crumb["name"] && !crumb["item"]) {
          errors.push(`Breadcrumb item ${i + 1} missing name or item`);
        }
      }
    }
  }
  if (type === "FAQPage") {
    const mainEntity = item["mainEntity"];
    if (!mainEntity || !Array.isArray(mainEntity) || mainEntity.length === 0) {
      errors.push("FAQPage must have at least one question in mainEntity");
    } else {
      for (let i = 0; i < mainEntity.length; i++) {
        const qa = mainEntity[i];
        if (!qa["name"]) {
          errors.push(`FAQ item ${i + 1} missing question (name)`);
        }
        if (!qa["acceptedAnswer"]) {
          errors.push(`FAQ item ${i + 1} missing answer (acceptedAnswer)`);
        }
      }
    }
  }
  if (type === "Product" && item["offers"]) {
    const offers = item["offers"];
    if (!offers["price"] && !offers["lowPrice"]) {
      warnings.push("Product offers should include price");
    }
    if (!offers["availability"]) {
      warnings.push("Product offers should include availability");
    }
  }
  return {
    type,
    data: item,
    errors,
    warnings
  };
}
function suggestSchemaTypes(html, url) {
  const $ = cheerio5.load(html);
  const suggestions = [];
  const path = new URL(url).pathname.toLowerCase();
  if (path === "/" || path === "") {
    suggestions.push("Organization", "WebSite");
  }
  if (path.includes("/blog") || path.includes("/article") || path.includes("/post") || path.includes("/news")) {
    suggestions.push("Article", "BlogPosting");
  }
  if (path.includes("/product") || path.includes("/shop") || path.includes("/item")) {
    suggestions.push("Product");
  }
  if (path.includes("/faq") || path.includes("/help") || $('h2:contains("FAQ"), h3:contains("FAQ")').length > 0) {
    suggestions.push("FAQPage");
  }
  if (path.includes("/contact") || path.includes("/about")) {
    suggestions.push("Organization", "LocalBusiness");
  }
  if (path.includes("/pricing") || $('meta[name="application-name"]').length > 0) {
    suggestions.push("SoftwareApplication");
  }
  if ($('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]').length > 0) {
    suggestions.push("BreadcrumbList");
  }
  return [...new Set(suggestions)];
}

// src/audit/checks/mobile.ts
import * as cheerio6 from "https://esm.sh/cheerio@1.0.0";
function analyzeMobile(html, url) {
  const issues = [];
  const $ = cheerio6.load(html);
  const viewportMeta = $('meta[name="viewport"]');
  const hasViewport = viewportMeta.length > 0;
  const viewportContent = viewportMeta.attr("content");
  if (!hasViewport) {
    issues.push({
      ...ISSUE_DEFINITIONS.VIEWPORT_MISSING,
      affectedUrls: [url]
    });
  } else if (viewportContent) {
    const isResponsive = viewportContent.includes("width=device-width");
    if (!isResponsive) {
      const widthMatch = viewportContent.match(/width=(\d+)/);
      if (widthMatch) {
        issues.push({
          ...ISSUE_DEFINITIONS.VIEWPORT_NOT_RESPONSIVE,
          affectedUrls: [url],
          details: {
            viewport: viewportContent,
            fixedWidth: widthMatch[1]
          }
        });
      }
    }
    if (viewportContent.includes("user-scalable=no") || viewportContent.includes("user-scalable=0")) {
      issues.push({
        code: "VIEWPORT_NO_ZOOM",
        severity: "warning",
        category: "mobile",
        title: "Viewport prevents zooming",
        description: "The viewport meta tag disables user scaling.",
        impact: "Users with visual impairments cannot zoom the page.",
        howToFix: "Remove user-scalable=no from the viewport meta tag.",
        affectedUrls: [url]
      });
    }
  }
  let tapTargetIssues = 0;
  $("a, button, input, select, textarea").each((_, el) => {
    const style = $(el).attr("style") || "";
    const heightMatch = style.match(/height:\s*(\d+)px/);
    const widthMatch = style.match(/width:\s*(\d+)px/);
    if (heightMatch && parseInt(heightMatch[1], 10) < 44) {
      tapTargetIssues++;
    }
    if (widthMatch && parseInt(widthMatch[1], 10) < 44) {
      tapTargetIssues++;
    }
  });
  if (tapTargetIssues > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.TAP_TARGETS_TOO_SMALL,
      affectedUrls: [url],
      details: { count: tapTargetIssues }
    });
  }
  let fontSizeIssues = 0;
  $("body *").each((_, el) => {
    const style = $(el).attr("style") || "";
    const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
    if (fontSizeMatch && parseInt(fontSizeMatch[1], 10) < 12) {
      fontSizeIssues++;
    }
  });
  return {
    issues,
    data: {
      hasViewport,
      viewportContent,
      isResponsive: hasViewport && (viewportContent?.includes("width=device-width") || false),
      tapTargetIssues,
      fontSizeIssues
    }
  };
}
function checkMobileResources(html, url) {
  const issues = [];
  const $ = cheerio6.load(html);
  if ($('object[type*="flash"], embed[type*="flash"]').length > 0) {
    issues.push({
      code: "FLASH_CONTENT",
      severity: "error",
      category: "mobile",
      title: "Flash content detected",
      description: "Page contains Flash content which is not supported on mobile devices.",
      impact: "Content is inaccessible on mobile devices and most modern browsers.",
      howToFix: "Replace Flash content with HTML5 alternatives.",
      affectedUrls: [url]
    });
  }
  if ($("object, embed, applet").length > 0) {
    issues.push({
      code: "PLUGINS_DETECTED",
      severity: "notice",
      category: "mobile",
      title: "Plugins detected",
      description: "Page uses plugins which may not work on mobile devices.",
      impact: "Some content may not be accessible on mobile.",
      howToFix: "Consider replacing plugins with standard web technologies.",
      affectedUrls: [url]
    });
  }
  let fixedWidthElements = 0;
  $("*").each((_, el) => {
    const style = $(el).attr("style") || "";
    const widthMatch = style.match(/width:\s*(\d+)px/);
    if (widthMatch && parseInt(widthMatch[1], 10) > 320) {
      fixedWidthElements++;
    }
  });
  if (fixedWidthElements > 5) {
    issues.push({
      code: "POSSIBLE_HORIZONTAL_SCROLL",
      severity: "notice",
      category: "mobile",
      title: "Possible horizontal scrolling",
      description: "Multiple elements have fixed widths that may cause horizontal scrolling on mobile.",
      impact: "Poor mobile user experience.",
      howToFix: "Use responsive widths (percentages, max-width) instead of fixed pixel widths.",
      affectedUrls: [url],
      details: { count: fixedWidthElements }
    });
  }
  return issues;
}

// src/audit/checks/hreflang.ts
import * as cheerio7 from "https://esm.sh/cheerio@1.0.0";
var VALID_LANG_CODES = /* @__PURE__ */ new Set([
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "ja",
  "zh",
  "ko",
  "ar",
  "hi",
  "nl",
  "sv",
  "pl",
  "tr",
  "da",
  "fi",
  "no",
  "cs",
  "el",
  "he",
  "hu",
  "id",
  "ms",
  "th",
  "vi",
  "uk",
  "ro",
  "bg",
  "hr",
  "sk",
  "sl",
  "et",
  "lv",
  "lt",
  "sr",
  "ca",
  "eu",
  "gl",
  "af",
  "sw",
  "x-default"
]);
function isValidHreflang(lang) {
  const parts = lang.toLowerCase().split("-");
  if (parts[0] === "x" && parts[1] === "default")
    return true;
  if (!VALID_LANG_CODES.has(parts[0]))
    return false;
  if (parts[1] && parts[1].length !== 2)
    return false;
  return true;
}
async function analyzeHreflang(html, url, options = {}) {
  const issues = [];
  const $ = cheerio7.load(html);
  const entries = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const lang = $(el).attr("hreflang") || "";
    const href = $(el).attr("href") || "";
    const isValid = isValidHreflang(lang);
    const isSelfReference = normalizeUrl(href) === normalizeUrl(url);
    entries.push({ lang, href, isValid, isSelfReference });
  });
  const hasHreflang = entries.length > 0;
  const hasSelfReference = entries.some((e) => e.isSelfReference);
  const hasXDefault = entries.some((e) => e.lang.toLowerCase() === "x-default");
  const data = {
    hasHreflang,
    entries,
    hasSelfReference,
    hasXDefault
  };
  if (!hasHreflang) {
    return { issues, data };
  }
  const invalidEntries = entries.filter((e) => !e.isValid);
  if (invalidEntries.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.HREFLANG_INVALID,
      affectedUrls: [url],
      details: { invalidLanguages: invalidEntries.map((e) => e.lang) }
    });
  }
  if (!hasSelfReference) {
    issues.push({
      ...ISSUE_DEFINITIONS.HREFLANG_SELF_MISSING,
      affectedUrls: [url]
    });
  }
  if (!hasXDefault && entries.length > 1) {
    issues.push({
      ...ISSUE_DEFINITIONS.HREFLANG_X_DEFAULT_MISSING,
      affectedUrls: [url]
    });
  }
  if (options.validateUrls) {
    for (const entry of entries) {
      if (!entry.isSelfReference && entry.href) {
        try {
          const response = await httpHead(entry.href, {
            timeout: 5e3,
            maxRedirects: 0,
            validateStatus: () => true
          });
          entry.statusCode = response.status;
          if (response.status >= 300) {
            issues.push({
              ...ISSUE_DEFINITIONS.HREFLANG_TO_NON_200,
              affectedUrls: [url],
              details: {
                targetUrl: entry.href,
                lang: entry.lang,
                statusCode: response.status
              }
            });
          }
        } catch {
          entry.statusCode = 0;
          issues.push({
            ...ISSUE_DEFINITIONS.HREFLANG_TO_NON_200,
            affectedUrls: [url],
            details: {
              targetUrl: entry.href,
              lang: entry.lang,
              statusCode: "unreachable"
            }
          });
        }
      }
    }
    for (const entry of entries) {
      if (!entry.isSelfReference && entry.href && entry.statusCode === 200) {
        try {
          const response = await httpGet(entry.href, { timeout: 5e3 });
          const $target = cheerio7.load(response.data);
          const hasReturnLink = $target(`link[rel="alternate"][hreflang][href*="${new URL(url).hostname}"]`).length > 0;
          if (!hasReturnLink) {
            issues.push({
              ...ISSUE_DEFINITIONS.HREFLANG_NO_RETURN,
              affectedUrls: [url],
              details: {
                targetUrl: entry.href,
                lang: entry.lang
              }
            });
          }
        } catch {
        }
      }
    }
  }
  return { issues, data };
}
function normalizeUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return urlStr;
  }
}

// src/audit/checks/social-meta.ts
import * as cheerio8 from "https://esm.sh/cheerio@1.0.0";
function analyzeSocialMeta(html, url) {
  const issues = [];
  const $ = cheerio8.load(html);
  const openGraph = {
    title: $('meta[property="og:title"]').attr("content"),
    description: $('meta[property="og:description"]').attr("content"),
    image: $('meta[property="og:image"]').attr("content"),
    url: $('meta[property="og:url"]').attr("content"),
    type: $('meta[property="og:type"]').attr("content"),
    siteName: $('meta[property="og:site_name"]').attr("content")
  };
  const twitter = {
    card: $('meta[name="twitter:card"]').attr("content"),
    title: $('meta[name="twitter:title"]').attr("content"),
    description: $('meta[name="twitter:description"]').attr("content"),
    image: $('meta[name="twitter:image"]').attr("content"),
    site: $('meta[name="twitter:site"]').attr("content"),
    creator: $('meta[name="twitter:creator"]').attr("content")
  };
  const hasFavicon = $('link[rel="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0 || $('link[rel="apple-touch-icon"]').length > 0;
  const langAttribute = $("html").attr("lang");
  const data = {
    openGraph,
    twitter,
    hasFavicon,
    langAttribute
  };
  if (!openGraph.title) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_TITLE_MISSING,
      affectedUrls: [url]
    });
  }
  if (!openGraph.description) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_DESCRIPTION_MISSING,
      affectedUrls: [url]
    });
  }
  if (!openGraph.image) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_IMAGE_MISSING,
      affectedUrls: [url]
    });
  }
  if (!openGraph.url) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_URL_MISSING,
      affectedUrls: [url]
    });
  }
  if (!openGraph.type) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_TYPE_MISSING,
      affectedUrls: [url]
    });
  }
  if (!twitter.card) {
    issues.push({
      ...ISSUE_DEFINITIONS.TWITTER_CARD_MISSING,
      affectedUrls: [url]
    });
  }
  if (!twitter.image && !openGraph.image) {
    issues.push({
      ...ISSUE_DEFINITIONS.TWITTER_IMAGE_MISSING,
      affectedUrls: [url]
    });
  }
  if (!hasFavicon) {
    issues.push({
      ...ISSUE_DEFINITIONS.FAVICON_MISSING,
      affectedUrls: [url]
    });
  }
  if (!langAttribute) {
    issues.push({
      ...ISSUE_DEFINITIONS.LANG_ATTR_MISSING,
      affectedUrls: [url]
    });
  }
  return { issues, data };
}

// src/audit/checks/soft-404.ts
import * as cheerio9 from "https://esm.sh/cheerio@1.0.0";
var ERROR_PHRASES = [
  "page not found",
  "404",
  "not found",
  "page doesn't exist",
  "page does not exist",
  "no longer available",
  "has been removed",
  "has been deleted",
  "couldn't find",
  "could not find",
  "doesn't exist",
  "does not exist",
  "no results found",
  "nothing found",
  "sorry, we couldn't find",
  "oops",
  "error occurred",
  "something went wrong",
  "page you requested",
  "page you were looking for",
  "this page isn't available",
  "this page is not available",
  "we can't find",
  "we cannot find"
];
var ERROR_TITLE_PATTERNS = [
  /404/i,
  /not found/i,
  /page.*not.*found/i,
  /error/i,
  /oops/i
];
function detectSoft404(html, url, statusCode = 200) {
  const issues = [];
  const $ = cheerio9.load(html);
  const signals = [];
  let score = 0;
  if (statusCode !== 200) {
    return {
      issues,
      data: { isSoft404: false, confidence: 0, signals: [] }
    };
  }
  const title = $("title").text().toLowerCase();
  const bodyText = $("body").text().toLowerCase().replace(/\s+/g, " ");
  const h1 = $("h1").first().text().toLowerCase();
  for (const pattern of ERROR_TITLE_PATTERNS) {
    if (pattern.test(title)) {
      score += 30;
      signals.push(`Title matches error pattern: "${title.substring(0, 50)}"`);
      break;
    }
  }
  for (const pattern of ERROR_TITLE_PATTERNS) {
    if (pattern.test(h1)) {
      score += 25;
      signals.push(`H1 matches error pattern: "${h1.substring(0, 50)}"`);
      break;
    }
  }
  let errorPhraseCount = 0;
  for (const phrase of ERROR_PHRASES) {
    if (bodyText.includes(phrase)) {
      errorPhraseCount++;
      if (errorPhraseCount <= 3) {
        signals.push(`Body contains error phrase: "${phrase}"`);
      }
    }
  }
  score += Math.min(errorPhraseCount * 10, 30);
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount < 100) {
    score += 15;
    signals.push(`Very thin content: ${wordCount} words`);
  }
  const hasSearchForm = $('form[action*="search"]').length > 0 || $('input[type="search"]').length > 0 || $('input[name="q"]').length > 0 || $('input[name="search"]').length > 0;
  if (hasSearchForm && score > 20) {
    score += 10;
    signals.push("Page has search form (common on 404 pages)");
  }
  const errorClasses = ["error", "404", "not-found", "notfound", "page-error"];
  for (const cls of errorClasses) {
    if ($(`[class*="${cls}"]`).length > 0) {
      score += 10;
      signals.push(`Found error-related CSS class containing "${cls}"`);
      break;
    }
  }
  const confidence = Math.min(score, 100);
  const isSoft404 = confidence >= 50;
  const data = {
    isSoft404,
    confidence,
    signals
  };
  if (isSoft404) {
    issues.push({
      ...ISSUE_DEFINITIONS.SOFT_404,
      affectedUrls: [url],
      details: {
        confidence: `${confidence}%`,
        signals: signals.slice(0, 5)
      }
    });
  }
  return { issues, data };
}

// src/audit/checks/anchor-text.ts
import * as cheerio10 from "https://esm.sh/cheerio@1.0.0";
var GENERIC_ANCHORS = /* @__PURE__ */ new Set([
  "click here",
  "click",
  "here",
  "read more",
  "more",
  "learn more",
  "see more",
  "view more",
  "continue",
  "continue reading",
  "link",
  "this",
  "this link",
  "go",
  "details",
  "more details",
  "more info",
  "info",
  "read",
  "view",
  "see",
  "download",
  "get it",
  "get"
]);
function analyzeAnchorText(html, url) {
  const issues = [];
  const $ = cheerio10.load(html);
  const baseUrl = new URL(url);
  const anchorCounts = {};
  let totalLinks = 0;
  let internalLinks = 0;
  let externalLinks = 0;
  let emptyAnchors = 0;
  let genericAnchors = 0;
  const emptyAnchorUrls = [];
  const genericAnchorExamples = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim().toLowerCase();
    const ariaLabel = $(el).attr("aria-label")?.trim();
    const title = $(el).attr("title")?.trim();
    if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }
    totalLinks++;
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === baseUrl.hostname) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      internalLinks++;
    }
    const hasAccessibleText = text.length > 0 || ariaLabel || title;
    if (!hasAccessibleText) {
      emptyAnchors++;
      if (emptyAnchorUrls.length < 5) {
        emptyAnchorUrls.push(href);
      }
      return;
    }
    if (GENERIC_ANCHORS.has(text)) {
      genericAnchors++;
      if (genericAnchorExamples.length < 5) {
        genericAnchorExamples.push(text);
      }
    }
    if (text.length > 0) {
      anchorCounts[text] = (anchorCounts[text] || 0) + 1;
    }
  });
  const topAnchors = Object.entries(anchorCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([text, count]) => ({ text, count }));
  const data = {
    totalLinks,
    internalLinks,
    externalLinks,
    emptyAnchors,
    genericAnchors,
    anchorDistribution: anchorCounts,
    topAnchors
  };
  if (emptyAnchors > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.ANCHOR_TEXT_EMPTY,
      affectedUrls: [url],
      details: {
        count: emptyAnchors,
        examples: emptyAnchorUrls
      }
    });
  }
  const genericRatio = totalLinks > 0 ? genericAnchors / totalLinks : 0;
  if (genericAnchors >= 3 && genericRatio > 0.2) {
    issues.push({
      ...ISSUE_DEFINITIONS.ANCHOR_TEXT_GENERIC,
      affectedUrls: [url],
      details: {
        count: genericAnchors,
        ratio: `${(genericRatio * 100).toFixed(1)}%`,
        examples: genericAnchorExamples
      }
    });
  }
  const overOptimizedAnchors = [];
  for (const [text, count] of Object.entries(anchorCounts)) {
    if (text.length < 3 || text.length > 50)
      continue;
    if (["home", "about", "contact", "blog", "services", "products"].includes(text))
      continue;
    if (count > 5 && count / internalLinks > 0.15) {
      overOptimizedAnchors.push(`"${text}" (${count} times)`);
    }
  }
  if (overOptimizedAnchors.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.ANCHOR_TEXT_OVER_OPTIMIZED,
      affectedUrls: [url],
      details: {
        overOptimized: overOptimizedAnchors
      }
    });
  }
  return { issues, data };
}

// src/audit/checks/canonical-advanced.ts
import * as cheerio11 from "https://esm.sh/cheerio@1.0.0";
async function analyzeCanonicalAdvanced(html, url, options = {}) {
  const issues = [];
  const $ = cheerio11.load(html);
  const canonicalLink = $('link[rel="canonical"]').attr("href");
  const baseUrl = new URL(url);
  const data = {
    canonical: canonicalLink,
    isSelfReferencing: false,
    isCrossDomain: false
  };
  if (!canonicalLink) {
    return { issues, data };
  }
  let canonicalUrl;
  try {
    canonicalUrl = new URL(canonicalLink, url);
  } catch {
    return { issues, data };
  }
  const normalizedUrl = normalizeUrl2(url);
  const normalizedCanonical = normalizeUrl2(canonicalUrl.href);
  data.isSelfReferencing = normalizedUrl === normalizedCanonical;
  if (canonicalUrl.hostname !== baseUrl.hostname) {
    data.isCrossDomain = true;
    issues.push({
      ...ISSUE_DEFINITIONS.CANONICAL_CROSS_DOMAIN,
      affectedUrls: [url],
      details: {
        canonical: canonicalUrl.href,
        sourceDomain: baseUrl.hostname,
        targetDomain: canonicalUrl.hostname
      }
    });
  }
  if (options.checkChain && !data.isSelfReferencing) {
    const chain = await followCanonicalChain(canonicalUrl.href, [url]);
    if (chain.length > 2) {
      data.canonicalChain = chain;
      data.finalCanonical = chain[chain.length - 1];
      issues.push({
        ...ISSUE_DEFINITIONS.CANONICAL_CHAIN,
        affectedUrls: [url],
        details: {
          chain,
          depth: chain.length
        }
      });
    }
  }
  if (options.sitemapUrls && options.sitemapUrls.length > 0) {
    const sitemapNormalized = options.sitemapUrls.map(normalizeUrl2);
    const urlInSitemap = sitemapNormalized.includes(normalizedUrl);
    const canonicalInSitemap = sitemapNormalized.includes(normalizedCanonical);
    if (urlInSitemap && !canonicalInSitemap && !data.isSelfReferencing) {
      issues.push({
        ...ISSUE_DEFINITIONS.CANONICAL_MISMATCH_SITEMAP,
        affectedUrls: [url],
        details: {
          pageUrl: url,
          canonical: canonicalUrl.href,
          message: "Page is in sitemap but its canonical URL is not"
        }
      });
    }
  }
  return { issues, data };
}
async function followCanonicalChain(url, chain = [], maxDepth = 5) {
  if (chain.length >= maxDepth)
    return chain;
  try {
    const response = await httpGet(url, {
      timeout: 5e3,
      maxRedirects: 5,
      validateStatus: (status) => status < 400
    });
    const $ = cheerio11.load(response.data);
    const nextCanonical = $('link[rel="canonical"]').attr("href");
    if (!nextCanonical) {
      return [...chain, url];
    }
    const resolvedCanonical = new URL(nextCanonical, url).href;
    const normalizedCurrent = normalizeUrl2(url);
    const normalizedNext = normalizeUrl2(resolvedCanonical);
    if (normalizedCurrent === normalizedNext) {
      return [...chain, url];
    }
    if (chain.some((u) => normalizeUrl2(u) === normalizedNext)) {
      return [...chain, url, resolvedCanonical + " (circular)"];
    }
    return followCanonicalChain(resolvedCanonical, [...chain, url], maxDepth);
  } catch {
    return [...chain, url];
  }
}
function normalizeUrl2(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/$/, "")}`;
  } catch {
    return urlStr.toLowerCase().replace(/\/$/, "");
  }
}

// src/audit/checks/pagination.ts
import * as cheerio12 from "https://esm.sh/cheerio@1.0.0";
function analyzePagination(html, url, canonical) {
  const issues = [];
  const $ = cheerio12.load(html);
  const nextLink = $('link[rel="next"]').attr("href");
  const prevLink = $('link[rel="prev"]').attr("href");
  const paginationLinks = [];
  const paginationPatterns = [
    /[?&]page=\d+/,
    /[?&]p=\d+/,
    /\/page\/\d+/,
    /\/p\/\d+/,
    /-page-\d+/,
    /\/\d+\/?$/
  ];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const pattern of paginationPatterns) {
      if (pattern.test(href)) {
        try {
          const fullUrl = new URL(href, url).href;
          if (!paginationLinks.includes(fullUrl)) {
            paginationLinks.push(fullUrl);
          }
        } catch {
        }
        break;
      }
    }
  });
  const hasInfiniteScrollScript = html.includes("infinite-scroll") || html.includes("infiniteScroll") || html.includes("infinite_scroll") || $("[data-infinite-scroll]").length > 0 || $("[data-infinite]").length > 0 || $(".infinite-scroll").length > 0;
  const loadMoreSelectors = [
    'button:contains("Load More")',
    'button:contains("Load more")',
    'button:contains("Show More")',
    'button:contains("Show more")',
    'a:contains("Load More")',
    'a:contains("Load more")',
    '[class*="load-more"]',
    '[class*="loadmore"]',
    "[data-load-more]"
  ];
  let hasLoadMoreButton = false;
  for (const selector of loadMoreSelectors) {
    try {
      if ($(selector).length > 0) {
        hasLoadMoreButton = true;
        break;
      }
    } catch {
    }
  }
  let currentPage;
  let totalPages;
  const pageMatch = url.match(/[?&]page=(\d+)|\/page\/(\d+)|[?&]p=(\d+)/);
  if (pageMatch) {
    currentPage = parseInt(pageMatch[1] || pageMatch[2] || pageMatch[3], 10);
  }
  const pageOfPattern = /page\s*(\d+)\s*of\s*(\d+)/i;
  const pageOfMatch = $("body").text().match(pageOfPattern);
  if (pageOfMatch) {
    currentPage = parseInt(pageOfMatch[1], 10);
    totalPages = parseInt(pageOfMatch[2], 10);
  }
  const hasPagination = paginationLinks.length > 0 || nextLink !== void 0 || prevLink !== void 0 || currentPage !== void 0;
  const hasHtmlPaginationLinks = paginationLinks.length > 0;
  const data = {
    hasPagination,
    hasHtmlPaginationLinks,
    hasInfiniteScroll: hasInfiniteScrollScript,
    hasLoadMoreButton,
    paginationLinks,
    relNextPrev: {
      hasNext: !!nextLink,
      hasPrev: !!prevLink,
      nextUrl: nextLink,
      prevUrl: prevLink
    },
    currentPage,
    totalPages
  };
  if (hasInfiniteScrollScript && !hasHtmlPaginationLinks) {
    issues.push({
      ...ISSUE_DEFINITIONS.INFINITE_SCROLL_NO_FALLBACK,
      affectedUrls: [url],
      details: {
        hasLoadMore: hasLoadMoreButton,
        suggestion: "Add <a href> pagination links alongside infinite scroll for SEO"
      }
    });
  }
  if (hasLoadMoreButton && !hasHtmlPaginationLinks && !hasInfiniteScrollScript) {
    issues.push({
      ...ISSUE_DEFINITIONS.PAGINATION_NO_LINKS,
      affectedUrls: [url],
      details: {
        suggestion: 'Ensure "Load More" button also has underlying <a> links'
      }
    });
  }
  if (hasPagination && currentPage && currentPage > 1 && canonical) {
    const isCanonicalToPage1 = !paginationPatterns.some((p) => p.test(canonical));
    const urlHasPageNumber = paginationPatterns.some((p) => p.test(url));
    if (isCanonicalToPage1 && urlHasPageNumber) {
      issues.push({
        ...ISSUE_DEFINITIONS.PAGINATION_CANONICAL_ISSUE,
        affectedUrls: [url],
        details: {
          currentPage,
          canonical,
          suggestion: "Paginated pages should self-reference or point to a View All page"
        }
      });
    }
  }
  return { issues, data };
}

// src/audit/checks/redirect-analysis.ts
async function analyzeRedirects(url, maxHops = 10) {
  const issues = [];
  const chain = [];
  const visitedUrls = /* @__PURE__ */ new Set();
  let currentUrl = url;
  let isLoop = false;
  while (chain.length < maxHops) {
    if (visitedUrls.has(currentUrl)) {
      isLoop = true;
      break;
    }
    visitedUrls.add(currentUrl);
    try {
      const response = await httpHead(currentUrl, {
        timeout: 5e3,
        maxRedirects: 0,
        validateStatus: () => true
      });
      const hop = {
        url: currentUrl,
        statusCode: response.status
      };
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers["location"];
        if (location) {
          hop.location = location;
          chain.push(hop);
          currentUrl = new URL(location, currentUrl).href;
          continue;
        }
      }
      chain.push(hop);
      break;
    } catch (error) {
      chain.push({
        url: currentUrl,
        statusCode: 0
      });
      break;
    }
  }
  const hasRedirect = chain.length > 1;
  const finalUrl = chain.length > 0 ? chain[chain.length - 1].url : url;
  const data = {
    hasRedirect,
    redirectChain: chain,
    isLoop,
    finalUrl,
    totalHops: chain.length - 1
  };
  if (isLoop) {
    issues.push({
      ...ISSUE_DEFINITIONS.REDIRECT_LOOP,
      affectedUrls: [url],
      details: {
        chain: chain.map((h) => `${h.url} (${h.statusCode})`)
      }
    });
  }
  if (!isLoop && chain.length > 2) {
    issues.push({
      ...ISSUE_DEFINITIONS.REDIRECT_CHAIN,
      affectedUrls: [url],
      details: {
        chain: chain.map((h) => `${h.url} (${h.statusCode})`),
        hops: chain.length - 1,
        finalUrl
      }
    });
  }
  return { issues, data };
}

// src/audit/checks/ai-readiness.ts
import * as cheerio13 from "https://esm.sh/cheerio@1.0.0";
var AI_BOTS = {
  GPTBot: "GPTBot",
  "ChatGPT-User": "ChatGPT-User",
  "OAI-SearchBot": "OAI-SearchBot",
  ClaudeBot: "ClaudeBot",
  "Claude-Web": "Claude-Web",
  "anthropic-ai": "anthropic-ai",
  PerplexityBot: "PerplexityBot",
  "Google-Extended": "Google-Extended",
  Bytespider: "Bytespider",
  CCBot: "CCBot"
};
async function checkLlmsTxt(baseUrl) {
  const issues = [];
  const url = new URL("/llms.txt", baseUrl).href;
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 404 || response.status >= 400) {
      issues.push({
        ...ISSUE_DEFINITIONS.LLMS_TXT_MISSING,
        affectedUrls: [url]
      });
      return {
        issues,
        data: { exists: false, valid: false, errors: ["File not found"] }
      };
    }
    const content = response.data;
    const lines = content.split("\n").filter((line) => line.trim());
    const errors = [];
    let valid = true;
    if (lines.length === 0) {
      errors.push("File is empty");
      valid = false;
    } else if (!lines[0].startsWith("#")) {
      errors.push("File should start with a markdown heading (# Site Name)");
      valid = false;
    }
    const hasDescription = content.toLowerCase().includes("## ") || content.length > 50;
    if (!hasDescription) {
      errors.push("File should contain meaningful content describing your site for AI");
      valid = false;
    }
    if (!valid) {
      issues.push({
        ...ISSUE_DEFINITIONS.LLMS_TXT_INVALID,
        affectedUrls: [url],
        details: { errors }
      });
    }
    return {
      issues,
      data: { exists: true, content, valid, errors }
    };
  } catch (error) {
    issues.push({
      ...ISSUE_DEFINITIONS.LLMS_TXT_MISSING,
      affectedUrls: [url],
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    });
    return {
      issues,
      data: { exists: false, valid: false, errors: ["Failed to fetch"] }
    };
  }
}
async function checkAIBotBlocking(baseUrl) {
  const issues = [];
  const url = new URL("/robots.txt", baseUrl).href;
  const blockedBots = [];
  const allowedBots = [];
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 404 || response.status >= 400) {
      return {
        issues,
        data: {
          robotsExists: false,
          blockedBots: [],
          allowedBots: Object.keys(AI_BOTS),
          allBlocked: false
        }
      };
    }
    const content = response.data;
    const lines = content.split("\n");
    let currentUserAgent = "";
    const botRules = {};
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith("user-agent:")) {
        currentUserAgent = trimmed.split(":")[1].trim();
      } else if (trimmed.startsWith("disallow:")) {
        const path = trimmed.split(":")[1]?.trim() || "";
        for (const [botKey, botName] of Object.entries(AI_BOTS)) {
          if (currentUserAgent === "*" || currentUserAgent === botKey.toLowerCase() || currentUserAgent === botName.toLowerCase()) {
            if (path === "/" || path === "/*") {
              if (!botRules[botKey]) {
                botRules[botKey] = { allowed: false, disallowAll: false };
              }
              if (currentUserAgent !== "*" || currentUserAgent === "*" && !botRules[botKey].allowed) {
                botRules[botKey].disallowAll = true;
              }
            }
          }
        }
      } else if (trimmed.startsWith("allow:")) {
        for (const [botKey] of Object.entries(AI_BOTS)) {
          if (currentUserAgent === botKey.toLowerCase()) {
            if (!botRules[botKey]) {
              botRules[botKey] = { allowed: true, disallowAll: false };
            }
            botRules[botKey].allowed = true;
          }
        }
      }
    }
    for (const [botKey] of Object.entries(AI_BOTS)) {
      const rules = botRules[botKey];
      if (rules?.disallowAll && !rules?.allowed) {
        blockedBots.push(botKey);
      } else {
        allowedBots.push(botKey);
      }
    }
    if (blockedBots.length === Object.keys(AI_BOTS).length) {
      issues.push({
        ...ISSUE_DEFINITIONS.AI_BOT_BLOCKED_ALL,
        affectedUrls: [url],
        details: { blockedBots }
      });
    } else {
      if (blockedBots.includes("GPTBot") || blockedBots.includes("ChatGPT-User")) {
        issues.push({
          ...ISSUE_DEFINITIONS.AI_BOT_GPTBOT_BLOCKED,
          affectedUrls: [url]
        });
      }
      if (blockedBots.includes("ClaudeBot") || blockedBots.includes("Claude-Web") || blockedBots.includes("anthropic-ai")) {
        issues.push({
          ...ISSUE_DEFINITIONS.AI_BOT_CLAUDEBOT_BLOCKED,
          affectedUrls: [url]
        });
      }
      if (blockedBots.includes("PerplexityBot")) {
        issues.push({
          ...ISSUE_DEFINITIONS.AI_BOT_PERPLEXITY_BLOCKED,
          affectedUrls: [url]
        });
      }
      if (blockedBots.includes("Google-Extended")) {
        issues.push({
          ...ISSUE_DEFINITIONS.AI_BOT_GOOGLE_EXTENDED_BLOCKED,
          affectedUrls: [url]
        });
      }
    }
    return {
      issues,
      data: {
        robotsExists: true,
        blockedBots,
        allowedBots,
        allBlocked: blockedBots.length === Object.keys(AI_BOTS).length
      }
    };
  } catch (error) {
    return {
      issues,
      data: {
        robotsExists: false,
        blockedBots: [],
        allowedBots: Object.keys(AI_BOTS),
        allBlocked: false
      }
    };
  }
}
function checkJSRenderingRatio(html, url) {
  const issues = [];
  const $ = cheerio13.load(html);
  $("script, style, noscript").remove();
  const staticText = $("body").text().replace(/\s+/g, " ").trim();
  const staticWordCount = staticText.split(/\s+/).filter((word) => word.length > 0).length;
  const hasReactRoot = $("#root, #app, #__next, [data-reactroot]").length > 0;
  const hasVueApp = $("#app[data-v-app], [data-v-]").length > 0;
  const hasAngularApp = $("[ng-app], [data-ng-app]").length > 0;
  const hasEmptyBody = staticWordCount < 50;
  let ratio = 0;
  if (hasEmptyBody && (hasReactRoot || hasVueApp || hasAngularApp)) {
    ratio = 90;
  } else if (hasReactRoot || hasVueApp || hasAngularApp) {
    ratio = 50;
  } else if (staticWordCount < 100) {
    ratio = 60;
  } else {
    ratio = 10;
  }
  const hasNoScript = $("noscript").length > 0;
  if (hasNoScript && ratio > 50) {
    ratio -= 20;
  }
  if (ratio > 50) {
    issues.push({
      ...ISSUE_DEFINITIONS.HIGH_JS_RENDERING_RATIO,
      affectedUrls: [url],
      details: { ratio: `${ratio}%`, staticWordCount }
    });
  }
  return {
    issues,
    data: { ratio, staticWordCount }
  };
}
async function runAIReadinessChecks(baseUrl, html) {
  const allIssues = [];
  const llmsResult = await checkLlmsTxt(baseUrl);
  allIssues.push(...llmsResult.issues);
  const botResult = await checkAIBotBlocking(baseUrl);
  allIssues.push(...botResult.issues);
  const jsResult = checkJSRenderingRatio(html, baseUrl);
  allIssues.push(...jsResult.issues);
  return {
    issues: allIssues,
    data: {
      llmsTxt: llmsResult.data,
      botBlocking: botResult.data,
      jsRenderingRatio: jsResult.data.ratio
    }
  };
}

// src/audit/checks/serp-preview.ts
import * as cheerio14 from "https://esm.sh/cheerio@1.0.0";
var CHAR_WIDTHS = {
  // Lowercase letters
  a: 9,
  b: 9,
  c: 8,
  d: 9,
  e: 9,
  f: 5,
  g: 9,
  h: 9,
  i: 4,
  j: 4,
  k: 8,
  l: 4,
  m: 14,
  n: 9,
  o: 9,
  p: 9,
  q: 9,
  r: 6,
  s: 8,
  t: 5,
  u: 9,
  v: 8,
  w: 12,
  x: 8,
  y: 8,
  z: 7,
  // Uppercase letters
  A: 11,
  B: 10,
  C: 10,
  D: 11,
  E: 9,
  F: 9,
  G: 11,
  H: 11,
  I: 4,
  J: 8,
  K: 10,
  L: 8,
  M: 13,
  N: 11,
  O: 12,
  P: 10,
  Q: 12,
  R: 10,
  S: 10,
  T: 9,
  U: 11,
  V: 10,
  W: 14,
  X: 10,
  Y: 10,
  Z: 9,
  // Numbers
  "0": 9,
  "1": 9,
  "2": 9,
  "3": 9,
  "4": 9,
  "5": 9,
  "6": 9,
  "7": 9,
  "8": 9,
  "9": 9,
  // Common punctuation and spaces
  " ": 4,
  ".": 4,
  ",": 4,
  "!": 4,
  "?": 8,
  "-": 5,
  "_": 8,
  ":": 4,
  ";": 4,
  "'": 3,
  '"': 6,
  "(": 5,
  ")": 5,
  "[": 5,
  "]": 5,
  "/": 5,
  "|": 4,
  "&": 10,
  "@": 14,
  "#": 9,
  "$": 9,
  "%": 12,
  "^": 7,
  "*": 6,
  "+": 9,
  "=": 9
};
var DEFAULT_CHAR_WIDTH = 9;
var TITLE_MAX_PIXELS = 580;
var DESCRIPTION_MAX_PIXELS_DESKTOP = 920;
var DESCRIPTION_MAX_PIXELS_MOBILE = 680;
function calculatePixelWidth(text) {
  let width = 0;
  for (const char of text) {
    width += CHAR_WIDTHS[char] ?? DEFAULT_CHAR_WIDTH;
  }
  return width;
}
function truncateToPixels(text, maxPixels) {
  let width = 0;
  let truncated = false;
  for (let i = 0; i < text.length; i++) {
    const charWidth = CHAR_WIDTHS[text[i]] ?? DEFAULT_CHAR_WIDTH;
    if (width + charWidth > maxPixels - 20) {
      truncated = true;
      return { text: text.substring(0, i) + "...", truncated };
    }
    width += charWidth;
  }
  return { text, truncated };
}
function formatSERPUrl(url) {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, "");
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const breadcrumbs = [domain, ...pathParts];
    const display = breadcrumbs.join(" \u203A ");
    return { display, breadcrumbs };
  } catch {
    return { display: url, breadcrumbs: [url] };
  }
}
function analyzeSERPPreview(html, url) {
  const issues = [];
  const $ = cheerio14.load(html);
  const rawTitle = $("title").text().trim() || "";
  const titlePixels = calculatePixelWidth(rawTitle);
  const titleTruncated = truncateToPixels(rawTitle, TITLE_MAX_PIXELS);
  const rawDescription = $('meta[name="description"]').attr("content")?.trim() || $('meta[property="og:description"]').attr("content")?.trim() || "";
  const descPixelsDesktop = calculatePixelWidth(rawDescription);
  const descPixelsMobile = calculatePixelWidth(rawDescription);
  const descTruncatedDesktop = truncateToPixels(rawDescription, DESCRIPTION_MAX_PIXELS_DESKTOP);
  const descTruncatedMobile = truncateToPixels(rawDescription, DESCRIPTION_MAX_PIXELS_MOBILE);
  const urlData = formatSERPUrl(url);
  if (titleTruncated.truncated) {
    issues.push({
      ...ISSUE_DEFINITIONS.TITLE_TRUNCATED_SERP,
      affectedUrls: [url],
      details: {
        pixelWidth: titlePixels,
        maxPixels: TITLE_MAX_PIXELS,
        charLength: rawTitle.length,
        displayPreview: titleTruncated.text
      }
    });
  }
  if (descTruncatedDesktop.truncated) {
    issues.push({
      ...ISSUE_DEFINITIONS.META_DESC_TRUNCATED_SERP,
      affectedUrls: [url],
      details: {
        pixelWidth: descPixelsDesktop,
        maxPixels: DESCRIPTION_MAX_PIXELS_DESKTOP,
        charLength: rawDescription.length,
        displayPreview: descTruncatedDesktop.text
      }
    });
  }
  const data = {
    title: {
      text: rawTitle,
      charLength: rawTitle.length,
      pixelWidth: titlePixels,
      truncated: titleTruncated.truncated,
      displayText: titleTruncated.text
    },
    description: {
      text: rawDescription,
      charLength: rawDescription.length,
      pixelWidthDesktop: descPixelsDesktop,
      pixelWidthMobile: descPixelsMobile,
      truncatedDesktop: descTruncatedDesktop.truncated,
      truncatedMobile: descTruncatedMobile.truncated,
      displayTextDesktop: descTruncatedDesktop.text,
      displayTextMobile: descTruncatedMobile.text
    },
    url: urlData,
    preview: {
      desktop: generateDesktopPreview(titleTruncated.text, descTruncatedDesktop.text, urlData.display),
      mobile: generateMobilePreview(titleTruncated.text, descTruncatedMobile.text, urlData.display)
    }
  };
  return { issues, data };
}
function generateDesktopPreview(title, description, url) {
  const maxWidth = 60;
  const titleLine = title.length > maxWidth ? title.substring(0, maxWidth - 3) + "..." : title;
  const urlLine = url.length > maxWidth ? url.substring(0, maxWidth - 3) + "..." : url;
  const descLines = wrapText(description, maxWidth);
  return [
    "\u250C" + "\u2500".repeat(maxWidth + 2) + "\u2510",
    "\u2502 " + titleLine.padEnd(maxWidth) + " \u2502",
    "\u2502 " + urlLine.padEnd(maxWidth) + " \u2502",
    ...descLines.map((line) => "\u2502 " + line.padEnd(maxWidth) + " \u2502"),
    "\u2514" + "\u2500".repeat(maxWidth + 2) + "\u2518"
  ].join("\n");
}
function generateMobilePreview(title, description, url) {
  const maxWidth = 40;
  const titleLine = title.length > maxWidth ? title.substring(0, maxWidth - 3) + "..." : title;
  const urlLine = url.length > maxWidth ? url.substring(0, maxWidth - 3) + "..." : url;
  const descLines = wrapText(description, maxWidth);
  return [
    "\u250C" + "\u2500".repeat(maxWidth + 2) + "\u2510",
    "\u2502 " + titleLine.padEnd(maxWidth) + " \u2502",
    "\u2502 " + urlLine.padEnd(maxWidth) + " \u2502",
    ...descLines.slice(0, 2).map((line) => "\u2502 " + line.padEnd(maxWidth) + " \u2502"),
    "\u2514" + "\u2500".repeat(maxWidth + 2) + "\u2518"
  ].join("\n");
}
function wrapText(text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxWidth) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine)
        lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine)
    lines.push(currentLine);
  return lines;
}

// src/audit/checks/local-seo.ts
import * as cheerio15 from "https://esm.sh/cheerio@1.0.0";
var PHONE_PATTERNS = [
  /\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  // US/Canada
  /\+?[0-9]{1,3}[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g,
  // International
  /\b[0-9]{3}[-.\s][0-9]{3}[-.\s][0-9]{4}\b/g
  // Simple US format
];
var ADDRESS_PATTERNS = [
  /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|circle|cir|place|pl)[\s,]+[\w\s]+,?\s*(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\s*\d{5}/gi,
  /\d+\s+[\w\s]+,\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}/gi
  // Generic US address
];
function extractSchema(html) {
  const $ = cheerio15.load(html);
  let hasLocalBusiness = false;
  let hasOrganization = false;
  let schemaData = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (!content)
        return;
      const jsonData = JSON.parse(content);
      const schemas = Array.isArray(jsonData) ? jsonData : [jsonData];
      for (const schema of schemas) {
        const items = schema["@graph"] || [schema];
        for (const item of items) {
          const type = item["@type"];
          const localBusinessTypes = [
            "LocalBusiness",
            "Restaurant",
            "Store",
            "MedicalBusiness",
            "FinancialService",
            "FoodEstablishment",
            "HealthAndBeautyBusiness",
            "HomeAndConstructionBusiness",
            "LegalService",
            "RealEstateAgent",
            "SportsActivityLocation"
          ];
          if (localBusinessTypes.some((t) => type === t || Array.isArray(type) && type.includes(t))) {
            hasLocalBusiness = true;
            schemaData = {
              name: item.name,
              address: formatAddress(item.address),
              phone: item.telephone,
              hours: item.openingHours,
              geo: item.geo ? { lat: item.geo.latitude, lng: item.geo.longitude } : void 0
            };
          }
          if (type === "Organization" || type === "Corporation" || type === "Person") {
            hasOrganization = true;
            if (!schemaData) {
              schemaData = {
                name: item.name,
                address: formatAddress(item.address),
                phone: item.telephone
              };
            }
          }
        }
      }
    } catch {
    }
  });
  return { hasLocalBusiness, hasOrganization, schemaData };
}
function formatAddress(address) {
  if (!address)
    return void 0;
  if (typeof address === "string")
    return address;
  if (typeof address === "object" && address !== null) {
    const a = address;
    return [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry].filter(Boolean).join(", ");
  }
  return void 0;
}
function detectPhones(html) {
  const $ = cheerio15.load(html);
  const text = $("body").text();
  const phones = /* @__PURE__ */ new Set();
  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      phones.add(href.replace("tel:", "").trim());
    }
  });
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => phones.add(m.trim()));
    }
  }
  return Array.from(phones).filter((phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  });
}
function detectAddresses(html) {
  const $ = cheerio15.load(html);
  const text = $("body").text();
  const addresses = /* @__PURE__ */ new Set();
  for (const pattern of ADDRESS_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => addresses.add(m.trim()));
    }
  }
  $('[itemprop="address"]').each((_, el) => {
    const addr = $(el).text().trim();
    if (addr)
      addresses.add(addr);
  });
  return Array.from(addresses);
}
function detectSocialProfiles(html) {
  const $ = cheerio15.load(html);
  const profiles = [];
  const socialDomains = [
    "facebook.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "instagram.com",
    "youtube.com",
    "tiktok.com",
    "pinterest.com",
    "github.com"
  ];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href)
      return;
    for (const domain of socialDomains) {
      if (href.includes(domain)) {
        try {
          const url = new URL(href);
          if (!profiles.includes(url.href)) {
            profiles.push(url.href);
          }
        } catch {
        }
        break;
      }
    }
  });
  return profiles;
}
function analyzeLocalSEO(html, url) {
  const issues = [];
  const { hasLocalBusiness, hasOrganization, schemaData } = extractSchema(html);
  const detectedPhones = detectPhones(html);
  const detectedAddresses = detectAddresses(html);
  const socialProfiles = detectSocialProfiles(html);
  if (!hasLocalBusiness) {
    issues.push({
      ...ISSUE_DEFINITIONS.LOCAL_BUSINESS_SCHEMA_MISSING,
      affectedUrls: [url]
    });
  }
  if (!hasOrganization && !hasLocalBusiness) {
    issues.push({
      ...ISSUE_DEFINITIONS.ORGANIZATION_SCHEMA_MISSING,
      affectedUrls: [url]
    });
  }
  const $ = cheerio15.load(html);
  const isBusinessPage = $('a[href^="tel:"]').length > 0 || $('a[href^="mailto:"]').length > 0 || html.toLowerCase().includes("contact") || html.toLowerCase().includes("about us");
  if (isBusinessPage) {
    if (detectedAddresses.length === 0 && !schemaData?.address) {
      issues.push({
        ...ISSUE_DEFINITIONS.ADDRESS_NOT_DETECTED,
        affectedUrls: [url]
      });
    }
    if (detectedPhones.length === 0 && !schemaData?.phone) {
      issues.push({
        ...ISSUE_DEFINITIONS.PHONE_NOT_DETECTED,
        affectedUrls: [url]
      });
    }
  }
  if (socialProfiles.length === 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.SOCIAL_PROFILES_NOT_LINKED,
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      hasLocalBusinessSchema: hasLocalBusiness,
      hasOrganizationSchema: hasOrganization,
      detectedPhones,
      detectedAddresses,
      schemaData,
      socialProfiles
    }
  };
}

// src/audit/checks/security-headers.ts
function parseHSTS(header) {
  if (!header) {
    return { maxAge: null, includeSubdomains: false, preload: false };
  }
  const result = { maxAge: null, includeSubdomains: false, preload: false };
  const maxAgeMatch = header.match(/max-age=(\d+)/i);
  if (maxAgeMatch) {
    result.maxAge = parseInt(maxAgeMatch[1], 10);
  }
  result.includeSubdomains = /includesubdomains/i.test(header);
  result.preload = /preload/i.test(header);
  return result;
}
async function analyzeSecurityHeaders(url) {
  const issues = [];
  try {
    const response = await httpGet(url, {
      timeout: 15e3,
      validateStatus: () => true,
      maxRedirects: 5
    });
    const headers = response.headers;
    const isHttps = url.startsWith("https://");
    const getHeader = (name) => {
      const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
      return key ? headers[key] : null;
    };
    const hsts = getHeader("strict-transport-security");
    const csp = getHeader("content-security-policy");
    const xFrameOptions = getHeader("x-frame-options");
    const xContentTypeOptions = getHeader("x-content-type-options");
    const referrerPolicy = getHeader("referrer-policy");
    const permissionsPolicy = getHeader("permissions-policy") || getHeader("feature-policy");
    const hstsData = parseHSTS(hsts);
    if (!isHttps) {
      issues.push({
        ...ISSUE_DEFINITIONS.NOT_HTTPS,
        affectedUrls: [url]
      });
    }
    if (isHttps && !hsts) {
      issues.push({
        ...ISSUE_DEFINITIONS.HSTS_MISSING,
        affectedUrls: [url]
      });
    }
    if (!csp) {
      issues.push({
        ...ISSUE_DEFINITIONS.CSP_MISSING,
        affectedUrls: [url]
      });
    }
    if (!xFrameOptions) {
      issues.push({
        ...ISSUE_DEFINITIONS.X_FRAME_OPTIONS_MISSING,
        affectedUrls: [url]
      });
    }
    if (!xContentTypeOptions) {
      issues.push({
        ...ISSUE_DEFINITIONS.X_CONTENT_TYPE_OPTIONS_MISSING,
        affectedUrls: [url]
      });
    }
    if (!referrerPolicy) {
      issues.push({
        ...ISSUE_DEFINITIONS.REFERRER_POLICY_MISSING,
        affectedUrls: [url]
      });
    }
    if (!permissionsPolicy) {
      issues.push({
        ...ISSUE_DEFINITIONS.PERMISSIONS_POLICY_MISSING,
        affectedUrls: [url]
      });
    }
    return {
      issues,
      data: {
        https: isHttps,
        headers: {
          hsts,
          csp,
          xFrameOptions,
          xContentTypeOptions,
          referrerPolicy,
          permissionsPolicy
        },
        hstsMaxAge: hstsData.maxAge,
        hstsIncludesSubdomains: hstsData.includeSubdomains,
        hstsPreload: hstsData.preload
      }
    };
  } catch (error) {
    return {
      issues,
      data: {
        https: url.startsWith("https://"),
        headers: {
          hsts: null,
          csp: null,
          xFrameOptions: null,
          xContentTypeOptions: null,
          referrerPolicy: null,
          permissionsPolicy: null
        },
        hstsMaxAge: null,
        hstsIncludesSubdomains: false,
        hstsPreload: false
      }
    };
  }
}

// src/audit/checks/content-freshness.ts
import * as cheerio16 from "https://esm.sh/cheerio@1.0.0";
var ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1e3;
function parseDate(dateStr) {
  if (!dateStr)
    return null;
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch {
  }
  return null;
}
function calculateAgeInDays(date) {
  if (!date)
    return null;
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1e3));
}
function extractDatesFromHtml(html) {
  const $ = cheerio16.load(html);
  const articleModifiedTime = parseDate(
    $('meta[property="article:modified_time"]').attr("content") || $('meta[name="article:modified_time"]').attr("content")
  );
  const articlePublishedTime = parseDate(
    $('meta[property="article:published_time"]').attr("content") || $('meta[name="article:published_time"]').attr("content")
  );
  const ogUpdatedTime = parseDate(
    $('meta[property="og:updated_time"]').attr("content") || $('meta[name="og:updated_time"]').attr("content")
  );
  return {
    articleModifiedTime,
    articlePublishedTime,
    ogUpdatedTime
  };
}
async function analyzeContentFreshness(url, html) {
  const issues = [];
  let lastModified = null;
  try {
    const response = await httpHead(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    const lastModifiedHeader = response.headers["last-modified"];
    lastModified = parseDate(lastModifiedHeader);
  } catch {
  }
  const htmlDates = extractDatesFromHtml(html);
  const dates = [];
  if (lastModified) {
    dates.push({ date: lastModified, source: "last-modified" });
  }
  if (htmlDates.articleModifiedTime) {
    dates.push({ date: htmlDates.articleModifiedTime, source: "article-modified-time" });
  }
  if (htmlDates.ogUpdatedTime) {
    dates.push({ date: htmlDates.ogUpdatedTime, source: "og-updated-time" });
  }
  dates.sort((a, b) => b.date.getTime() - a.date.getTime());
  const mostRecent = dates[0] || null;
  const ageInDays = mostRecent ? calculateAgeInDays(mostRecent.date) : null;
  const isStale = ageInDays !== null && ageInDays > 365;
  if (!lastModified) {
    issues.push({
      ...ISSUE_DEFINITIONS.NO_LAST_MODIFIED,
      affectedUrls: [url]
    });
  }
  if (isStale) {
    issues.push({
      ...ISSUE_DEFINITIONS.CONTENT_STALE,
      affectedUrls: [url],
      details: {
        ageInDays,
        lastModified: mostRecent?.date.toISOString(),
        source: mostRecent?.source
      }
    });
  }
  const $ = cheerio16.load(html);
  const isArticle = $("article").length > 0 || $('meta[property="og:type"][content="article"]').length > 0 || $('meta[property="article:published_time"]').length > 0;
  if (isArticle && !htmlDates.articleModifiedTime && !htmlDates.ogUpdatedTime) {
    issues.push({
      ...ISSUE_DEFINITIONS.OG_UPDATED_TIME_MISSING,
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      lastModified,
      articleModifiedTime: htmlDates.articleModifiedTime,
      articlePublishedTime: htmlDates.articlePublishedTime,
      ogUpdatedTime: htmlDates.ogUpdatedTime,
      ageInDays,
      isStale,
      source: mostRecent?.source || "none"
    }
  };
}

// src/audit/checks/dom-analysis.ts
import * as cheerio17 from "https://esm.sh/cheerio@1.0.0";
var DOM_SIZE_WARNING = 1500;
var DOM_SIZE_ERROR = 3e3;
var DOM_DEPTH_WARNING = 32;
function countNodes($) {
  let count = 0;
  function traverse(element) {
    count++;
    const el = element;
    if (el.children) {
      for (const child of el.children) {
        traverse(child);
      }
    }
  }
  const root = $.root();
  root.each((_, el) => traverse(el));
  return count;
}
function calculateMaxDepth($) {
  let maxDepth = 0;
  function traverse(element, depth) {
    maxDepth = Math.max(maxDepth, depth);
    const el = element;
    if (el.children) {
      for (const child of el.children) {
        traverse(child, depth + 1);
      }
    }
  }
  const root = $.root();
  root.each((_, el) => traverse(el, 0));
  return maxDepth;
}
function findRenderBlockingResources($) {
  const css = [];
  const js = [];
  $('head link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr("href");
    const media = $(el).attr("media");
    const disabled = $(el).attr("disabled");
    if (href && media !== "print" && !disabled) {
      css.push(href);
    }
  });
  $("head style").each((_, el) => {
    const content = $(el).html();
    if (content && content.trim().length > 100) {
      css.push("[inline-style]");
    }
  });
  $("head script[src]").each((_, el) => {
    const src = $(el).attr("src");
    const async = $(el).attr("async");
    const defer = $(el).attr("defer");
    const type = $(el).attr("type");
    if (type === "module" || type && !type.includes("javascript")) {
      return;
    }
    if (src && !async && !defer) {
      js.push(src);
    }
  });
  return { css, js };
}
function analyzeDOMStructure(html, url) {
  const issues = [];
  const $ = cheerio17.load(html);
  const nodeCount = countNodes($);
  const maxDepth = calculateMaxDepth($);
  const renderBlockingResources = findRenderBlockingResources($);
  const criticalPathLength = renderBlockingResources.css.length + renderBlockingResources.js.length;
  if (nodeCount > DOM_SIZE_ERROR) {
    issues.push({
      ...ISSUE_DEFINITIONS.DOM_SIZE_EXCESSIVE,
      severity: "error",
      affectedUrls: [url],
      details: {
        nodeCount,
        threshold: DOM_SIZE_WARNING,
        recommendation: "Reduce DOM size to under 1500 nodes"
      }
    });
  } else if (nodeCount > DOM_SIZE_WARNING) {
    issues.push({
      ...ISSUE_DEFINITIONS.DOM_SIZE_EXCESSIVE,
      affectedUrls: [url],
      details: {
        nodeCount,
        threshold: DOM_SIZE_WARNING,
        recommendation: "Consider simplifying page structure"
      }
    });
  }
  if (maxDepth > DOM_DEPTH_WARNING) {
    issues.push({
      ...ISSUE_DEFINITIONS.DOM_DEPTH_EXCESSIVE,
      affectedUrls: [url],
      details: {
        maxDepth,
        threshold: DOM_DEPTH_WARNING
      }
    });
  }
  if (criticalPathLength > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.RENDER_BLOCKING_RESOURCES,
      affectedUrls: [url],
      details: {
        cssFiles: renderBlockingResources.css,
        jsFiles: renderBlockingResources.js,
        totalCount: criticalPathLength,
        recommendation: criticalPathLength > 3 ? "Inline critical CSS and defer non-critical resources" : "Consider using async/defer for scripts"
      }
    });
  }
  return {
    issues,
    data: {
      nodeCount,
      maxDepth,
      renderBlockingResources,
      totalRenderBlockingSize: 0,
      // Would need to fetch resources to calculate
      criticalPathLength
    }
  };
}

// src/audit/checks/modern-images.ts
import * as cheerio18 from "https://esm.sh/cheerio@1.0.0";
var MODERN_FORMATS = [".webp", ".avif"];
var LEGACY_FORMATS = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
function getImageFormat(url) {
  try {
    const pathname = new URL(url, "https://example.com").pathname.toLowerCase();
    const formatMatch = url.match(/[?&](?:format|f)=(\w+)/i);
    if (formatMatch) {
      return "." + formatMatch[1].toLowerCase();
    }
    const extMatch = pathname.match(/\.([a-z0-9]+)$/i);
    if (extMatch) {
      return "." + extMatch[1].toLowerCase();
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}
function isModernFormat(format) {
  return MODERN_FORMATS.includes(format.toLowerCase());
}
function extractImages($, baseUrl) {
  const images = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const srcset = $(el).attr("srcset") || "";
    const alt = $(el).attr("alt") || null;
    const width = $(el).attr("width") ? parseInt($(el).attr("width"), 10) : null;
    const height = $(el).attr("height") ? parseInt($(el).attr("height"), 10) : null;
    const loading = $(el).attr("loading") || null;
    if (!src || src.startsWith("data:"))
      return;
    let fullSrc = src;
    try {
      fullSrc = new URL(src, baseUrl).href;
    } catch {
    }
    const format = getImageFormat(fullSrc);
    images.push({
      src: fullSrc,
      alt,
      width,
      height,
      loading,
      format,
      isModernFormat: isModernFormat(format),
      hasDimensions: width !== null && height !== null,
      isLazyLoaded: loading === "lazy" || $(el).attr("data-src") !== void 0
    });
    if (srcset) {
      const srcsetUrls = srcset.split(",").map((s) => s.trim().split(" ")[0]);
      for (const srcsetUrl of srcsetUrls) {
        const srcsetFormat = getImageFormat(srcsetUrl);
        if (isModernFormat(srcsetFormat) && !images.some((img) => img.src === srcsetUrl)) {
          images.push({
            src: srcsetUrl,
            alt,
            width: null,
            height: null,
            loading,
            format: srcsetFormat,
            isModernFormat: true,
            hasDimensions: false,
            isLazyLoaded: loading === "lazy"
          });
        }
      }
    }
  });
  $("picture source").each((_, el) => {
    const srcset = $(el).attr("srcset") || "";
    const type = $(el).attr("type") || "";
    if (type.includes("webp") || type.includes("avif")) {
      const srcsetUrls = srcset.split(",").map((s) => s.trim().split(" ")[0]);
      for (const srcsetUrl of srcsetUrls) {
        if (!images.some((img) => img.src === srcsetUrl)) {
          images.push({
            src: srcsetUrl,
            alt: null,
            width: null,
            height: null,
            loading: null,
            format: type.includes("webp") ? ".webp" : ".avif",
            isModernFormat: true,
            hasDimensions: false,
            isLazyLoaded: false
          });
        }
      }
    }
  });
  return images;
}
function analyzeModernImages(html, url) {
  const issues = [];
  const $ = cheerio18.load(html);
  const images = extractImages($, url);
  const uniqueImages = images.filter((img, idx, arr) => arr.findIndex((i) => i.src === img.src) === idx);
  const modernFormatCount = uniqueImages.filter((img) => img.isModernFormat).length;
  const legacyFormatCount = uniqueImages.filter(
    (img) => !img.isModernFormat && LEGACY_FORMATS.includes(img.format)
  ).length;
  const hasPictureElements = $("picture").length > 0;
  const hasSourceSet = $("img[srcset]").length > 0 || $("picture source[srcset]").length > 0;
  const totalRelevantImages = modernFormatCount + legacyFormatCount;
  const modernFormatPercentage = totalRelevantImages > 0 ? Math.round(modernFormatCount / totalRelevantImages * 100) : 100;
  if (legacyFormatCount > 0 && !hasPictureElements && !hasSourceSet) {
    const legacyImages = uniqueImages.filter((img) => !img.isModernFormat && LEGACY_FORMATS.includes(img.format));
    issues.push({
      ...ISSUE_DEFINITIONS.IMAGE_NOT_WEBP_AVIF,
      affectedUrls: legacyImages.slice(0, 10).map((img) => img.src),
      details: {
        legacyImageCount: legacyFormatCount,
        modernImageCount: modernFormatCount,
        modernFormatPercentage,
        recommendation: "Convert images to WebP or AVIF format for 25-50% smaller file sizes"
      }
    });
  }
  const imagesWithoutDimensions = uniqueImages.filter(
    (img) => !img.hasDimensions && !img.isLazyLoaded && LEGACY_FORMATS.includes(img.format)
  );
  if (imagesWithoutDimensions.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.IMG_NO_DIMENSIONS,
      affectedUrls: imagesWithoutDimensions.slice(0, 10).map((img) => img.src),
      details: {
        count: imagesWithoutDimensions.length
      }
    });
  }
  return {
    issues,
    data: {
      totalImages: uniqueImages.length,
      modernFormatCount,
      legacyFormatCount,
      modernFormatPercentage,
      images: uniqueImages,
      hasSourceSet,
      hasPictureElements
    }
  };
}

// src/audit/checks/tech-detection.ts
import * as cheerio19 from "https://esm.sh/cheerio@1.0.0";
var VULNERABLE_JQUERY = ["1.", "2.0", "2.1", "2.2", "3.0", "3.1", "3.2", "3.3", "3.4"];
function detectTechnologies(html, url, headers) {
  const issues = [];
  const $ = cheerio19.load(html);
  const technologies = [];
  detectCMS($, technologies);
  detectFrameworks($, html, technologies);
  detectLibraries($, html, technologies, issues, url);
  detectAnalytics($, html, technologies);
  if (headers) {
    detectCDN(headers, technologies);
  }
  const cms = technologies.find((t) => t.category === "cms")?.name || null;
  const framework = technologies.find((t) => t.category === "framework")?.name || null;
  const jsLibraries = technologies.filter((t) => t.category === "library").map((t) => t.name);
  const analytics = technologies.filter((t) => t.category === "analytics").map((t) => t.name);
  const cdn = technologies.find((t) => t.category === "cdn")?.name || null;
  return {
    issues,
    data: {
      technologies,
      cms,
      framework,
      jsLibraries,
      analytics,
      cdn,
      serverHeaders: headers || {}
    }
  };
}
function detectCMS($, technologies) {
  if ($('meta[name="generator"][content*="WordPress"]').length > 0 || $('link[href*="wp-content"]').length > 0 || $('script[src*="wp-content"]').length > 0) {
    const version = $('meta[name="generator"]').attr("content")?.match(/WordPress\s+([\d.]+)/)?.[1];
    technologies.push({
      name: "WordPress",
      version,
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Drupal"]').length > 0 || $('script[src*="/drupal"]').length > 0 || $("[data-drupal-selector]").length > 0) {
    technologies.push({
      name: "Drupal",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Joomla"]').length > 0 || $('script[src*="/joomla"]').length > 0) {
    technologies.push({
      name: "Joomla",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="shopify-digital-wallet"]').length > 0 || $('link[href*="cdn.shopify.com"]').length > 0) {
    technologies.push({
      name: "Shopify",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('script[src*="squarespace"]').length > 0 || $('meta[content*="Squarespace"]').length > 0) {
    technologies.push({
      name: "Squarespace",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Wix"]').length > 0 || $('script[src*="wix.com"]').length > 0) {
    technologies.push({
      name: "Wix",
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Ghost"]').length > 0) {
    const version = $('meta[name="generator"]').attr("content")?.match(/Ghost\s+([\d.]+)/)?.[1];
    technologies.push({
      name: "Ghost",
      version,
      category: "cms",
      confidence: "high"
    });
  }
  if ($('meta[name="generator"][content*="Hugo"]').length > 0) {
    technologies.push({
      name: "Hugo",
      category: "cms",
      confidence: "high"
    });
  }
}
function detectFrameworks($, html, technologies) {
  if ($("[data-reactroot]").length > 0 || $("[data-react-helmet]").length > 0 || html.includes("__REACT_DEVTOOLS")) {
    technologies.push({
      name: "React",
      category: "framework",
      confidence: "high"
    });
  }
  if ($("#__next").length > 0 || $('script[src*="/_next/"]').length > 0) {
    technologies.push({
      name: "Next.js",
      category: "framework",
      confidence: "high"
    });
  }
  if ($("[data-v-]").length > 0 || html.includes("Vue.js") || $('script[src*="vue"]').length > 0) {
    technologies.push({
      name: "Vue.js",
      category: "framework",
      confidence: "medium"
    });
  }
  if ($("#__nuxt").length > 0 || $('script[src*="/_nuxt/"]').length > 0) {
    technologies.push({
      name: "Nuxt.js",
      category: "framework",
      confidence: "high"
    });
  }
  if ($("[ng-app]").length > 0 || $("[data-ng-app]").length > 0 || $("app-root").length > 0) {
    technologies.push({
      name: "Angular",
      category: "framework",
      confidence: "high"
    });
  }
  if ($('script[src*="svelte"]').length > 0 || html.includes("__svelte")) {
    technologies.push({
      name: "Svelte",
      category: "framework",
      confidence: "medium"
    });
  }
  if ($("[data-astro-source-file]").length > 0 || $('script[src*="/_astro/"]').length > 0) {
    technologies.push({
      name: "Astro",
      category: "framework",
      confidence: "high"
    });
  }
  if ($("#___gatsby").length > 0 || $('script[src*="/gatsby"]').length > 0) {
    technologies.push({
      name: "Gatsby",
      category: "framework",
      confidence: "high"
    });
  }
  if (html.includes("__remixContext") || $('script[src*="remix"]').length > 0) {
    technologies.push({
      name: "Remix",
      category: "framework",
      confidence: "medium"
    });
  }
}
function detectLibraries($, html, technologies, issues, url) {
  const jqueryScript = $('script[src*="jquery"]').attr("src") || "";
  const jqueryVersionMatch = jqueryScript.match(/jquery[.-]?([\d.]+)/i) || html.match(/jQuery\s+v?([\d.]+)/);
  if (jqueryScript || html.includes("jQuery")) {
    const version = jqueryVersionMatch?.[1];
    technologies.push({
      name: "jQuery",
      version,
      category: "library",
      confidence: "high"
    });
    if (version && VULNERABLE_JQUERY.some((v) => version.startsWith(v))) {
      issues.push({
        ...ISSUE_DEFINITIONS.OUTDATED_JQUERY,
        affectedUrls: [url],
        details: { version, recommendation: "Update to jQuery 3.5.0 or later" }
      });
    }
  }
  if ($('link[href*="bootstrap"]').length > 0 || $('script[src*="bootstrap"]').length > 0) {
    const version = ($('link[href*="bootstrap"]').attr("href") || "").match(/bootstrap[.-]?([\d.]+)/)?.[1];
    technologies.push({
      name: "Bootstrap",
      version,
      category: "library",
      confidence: "high"
    });
  }
  if (html.includes("tailwind") || $('[class*="tw-"]').length > 0 || $("style").text().includes("--tw-")) {
    technologies.push({
      name: "Tailwind CSS",
      category: "library",
      confidence: "medium"
    });
  }
  if ($('script[src*="lodash"]').length > 0 || html.includes("_.VERSION")) {
    technologies.push({
      name: "Lodash",
      category: "library",
      confidence: "medium"
    });
  }
  if ($('script[src*="gsap"]').length > 0 || html.includes("gsap")) {
    technologies.push({
      name: "GSAP",
      category: "library",
      confidence: "medium"
    });
  }
  if ($('script[src*="three"]').length > 0 || html.includes("THREE.")) {
    technologies.push({
      name: "Three.js",
      category: "library",
      confidence: "medium"
    });
  }
}
function detectAnalytics($, html, technologies) {
  if (html.includes("gtag") || html.includes("googletagmanager") || $('script[src*="google-analytics"]').length > 0 || $('script[src*="gtag"]').length > 0) {
    technologies.push({
      name: "Google Analytics",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("GTM-") || $('script[src*="googletagmanager.com/gtm"]').length > 0) {
    technologies.push({
      name: "Google Tag Manager",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("fbq(") || $('script[src*="connect.facebook"]').length > 0) {
    technologies.push({
      name: "Facebook Pixel",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("hotjar") || $('script[src*="hotjar"]').length > 0) {
    technologies.push({
      name: "Hotjar",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("mixpanel") || $('script[src*="mixpanel"]').length > 0) {
    technologies.push({
      name: "Mixpanel",
      category: "analytics",
      confidence: "high"
    });
  }
  if (html.includes("analytics.js") || $('script[src*="segment"]').length > 0) {
    technologies.push({
      name: "Segment",
      category: "analytics",
      confidence: "medium"
    });
  }
  if ($('script[src*="plausible"]').length > 0) {
    technologies.push({
      name: "Plausible",
      category: "analytics",
      confidence: "high"
    });
  }
  if ($('script[src*="usefathom"]').length > 0) {
    technologies.push({
      name: "Fathom Analytics",
      category: "analytics",
      confidence: "high"
    });
  }
}
function detectCDN(headers, technologies) {
  const serverHeader = headers["server"]?.toLowerCase() || "";
  const viaHeader = headers["via"]?.toLowerCase() || "";
  const cdnHeaders = [
    headers["x-cdn"],
    headers["x-cache"],
    headers["cf-ray"],
    headers["x-amz-cf-id"],
    headers["x-vercel-cache"],
    headers["x-served-by"]
  ].filter(Boolean).join(" ").toLowerCase();
  if (headers["cf-ray"] || serverHeader.includes("cloudflare")) {
    technologies.push({
      name: "Cloudflare",
      category: "cdn",
      confidence: "high"
    });
  }
  if (headers["x-amz-cf-id"] || viaHeader.includes("cloudfront")) {
    technologies.push({
      name: "AWS CloudFront",
      category: "cdn",
      confidence: "high"
    });
  }
  if (headers["x-vercel-cache"] || serverHeader.includes("vercel")) {
    technologies.push({
      name: "Vercel",
      category: "cdn",
      confidence: "high"
    });
  }
  if (cdnHeaders.includes("fastly") || viaHeader.includes("fastly")) {
    technologies.push({
      name: "Fastly",
      category: "cdn",
      confidence: "high"
    });
  }
  if (serverHeader.includes("akamai") || headers["x-akamai-request-id"]) {
    technologies.push({
      name: "Akamai",
      category: "cdn",
      confidence: "high"
    });
  }
  if (serverHeader.includes("netlify") || headers["x-nf-request-id"]) {
    technologies.push({
      name: "Netlify",
      category: "cdn",
      confidence: "high"
    });
  }
  if (serverHeader.includes("github")) {
    technologies.push({
      name: "GitHub Pages",
      category: "cdn",
      confidence: "high"
    });
  }
}

// src/audit/checks/keyword-analysis.ts
import * as cheerio20 from "https://esm.sh/cheerio@1.0.0";
var STOP_WORDS = /* @__PURE__ */ new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "been",
  "be",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "they",
  "them",
  "their",
  "we",
  "us",
  "our",
  "you",
  "your",
  "i",
  "me",
  "my",
  "he",
  "she",
  "him",
  "her",
  "his",
  "not",
  "no",
  "nor",
  "so",
  "if",
  "then",
  "else",
  "when",
  "where",
  "why",
  "how",
  "what",
  "who",
  "which",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "only",
  "own",
  "same",
  "than",
  "too",
  "very",
  "just",
  "also",
  "now",
  "here",
  "there",
  "about",
  "after",
  "before",
  "above",
  "below",
  "between",
  "into",
  "through",
  "during",
  "under",
  "again",
  "further",
  "once",
  "any",
  "being",
  "because",
  "while"
]);
function extractText($, selector) {
  return $(selector).text().toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}
function tokenize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((word) => word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));
}
function countWords(words) {
  const counts = /* @__PURE__ */ new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return counts;
}
function extractNGrams(words, n) {
  const ngrams = /* @__PURE__ */ new Map();
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(" ");
    const ngramWords = ngram.split(" ");
    if (ngramWords.some((w) => STOP_WORDS.has(w)))
      continue;
    ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
  }
  return ngrams;
}
function analyzeKeywords(html, url) {
  const issues = [];
  const $ = cheerio20.load(html);
  const title = extractText($, "title");
  const h1 = extractText($, "h1");
  const h2 = extractText($, "h2");
  const metaDesc = $('meta[name="description"]').attr("content")?.toLowerCase() || "";
  $("script, style, noscript").remove();
  const bodyText = extractText($, "body");
  const bodyWords = tokenize(bodyText);
  const titleWords = tokenize(title);
  const h1Words = tokenize(h1);
  const h2Words = tokenize(h2);
  const metaDescWords = tokenize(metaDesc);
  const wordCounts = countWords(bodyWords);
  const totalWords = bodyWords.length;
  const topKeywordsMap = [];
  for (const [word, count] of wordCounts) {
    const density = count / totalWords * 100;
    topKeywordsMap.push({
      word,
      count,
      density: Math.round(density * 100) / 100,
      inTitle: titleWords.includes(word),
      inH1: h1Words.includes(word),
      inH2: h2Words.includes(word),
      inMetaDesc: metaDescWords.includes(word)
    });
  }
  topKeywordsMap.sort((a, b) => b.count - a.count);
  const topKeywords = topKeywordsMap.slice(0, 20);
  const twoWordPhrases = extractNGrams(bodyWords, 2);
  const threeWordPhrases = extractNGrams(bodyWords, 3);
  const fourWordPhrases = extractNGrams(bodyWords, 4);
  const sortPhrases = (phrases, n) => {
    return Array.from(phrases).filter(([_, count]) => count >= 2).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([phrase, count]) => ({ phrase, count, wordCount: n }));
  };
  const potentialStuffing = topKeywords.filter((k) => k.density > 3).map((k) => k.word);
  if (potentialStuffing.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.KEYWORD_STUFFING,
      affectedUrls: [url],
      details: {
        keywords: potentialStuffing,
        densities: potentialStuffing.map((k) => {
          const info = topKeywords.find((tk) => tk.word === k);
          return { word: k, density: info?.density };
        })
      }
    });
  }
  const topBodyKeywords = topKeywords.slice(0, 5).map((k) => k.word);
  const keywordsInTitle = topBodyKeywords.filter((k) => titleWords.includes(k));
  if (keywordsInTitle.length === 0 && topBodyKeywords.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.NO_KEYWORDS_IN_TITLE,
      affectedUrls: [url],
      details: {
        topKeywords: topBodyKeywords,
        title,
        recommendation: `Consider including "${topBodyKeywords[0]}" in your title`
      }
    });
  }
  const keywordsInH1 = topBodyKeywords.filter((k) => h1Words.includes(k));
  if (keywordsInH1.length === 0 && topBodyKeywords.length > 0 && h1) {
    issues.push({
      ...ISSUE_DEFINITIONS.NO_KEYWORDS_IN_H1,
      affectedUrls: [url],
      details: {
        topKeywords: topBodyKeywords,
        h1,
        recommendation: `Consider including "${topBodyKeywords[0]}" in your H1`
      }
    });
  }
  return {
    issues,
    data: {
      totalWords,
      uniqueWords: wordCounts.size,
      topKeywords,
      topPhrases: {
        twoWord: sortPhrases(twoWordPhrases, 2),
        threeWord: sortPhrases(threeWordPhrases, 3),
        fourWord: sortPhrases(fourWordPhrases, 4)
      },
      keywordDistribution: {
        title: titleWords,
        h1: h1Words,
        h2: h2Words,
        metaDesc: metaDescWords
      },
      potentialStuffing
    }
  };
}

// src/audit/checks/additional-checks.ts
import * as cheerio21 from "https://esm.sh/cheerio@1.0.0";
async function resolveTxtDoH(domain) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT`;
  const response = await fetch(url, {
    headers: {
      "Accept": "application/dns-json"
    }
  });
  if (!response.ok) {
    throw new Error(`DNS lookup failed: ${response.status}`);
  }
  const data = await response.json();
  if (!data.Answer || data.Answer.length === 0) {
    return [];
  }
  return data.Answer.map((record) => {
    const txt = record.data.replace(/^"|"$/g, "");
    return [txt];
  });
}
async function checkAdsTxt(baseUrl) {
  const issues = [];
  const url = new URL("/ads.txt", baseUrl).href;
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 404 || response.status >= 400) {
      return {
        issues,
        data: { exists: false, valid: false, entries: 0, errors: [] }
      };
    }
    const content = response.data;
    const lines = content.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#"));
    const errors = [];
    let validEntries = 0;
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 3) {
        validEntries++;
      } else if (line.trim()) {
        errors.push(`Invalid line format: ${line.substring(0, 50)}`);
      }
    }
    const valid = errors.length === 0 && validEntries > 0;
    if (!valid && validEntries > 0) {
      issues.push({
        ...ISSUE_DEFINITIONS.ADS_TXT_INVALID,
        affectedUrls: [url],
        details: { errors, validEntries }
      });
    }
    return {
      issues,
      data: { exists: true, valid, entries: validEntries, errors }
    };
  } catch {
    return {
      issues,
      data: { exists: false, valid: false, entries: 0, errors: ["Failed to fetch"] }
    };
  }
}
async function checkDMARC(domain) {
  const issues = [];
  try {
    let cleanDomain = domain;
    try {
      cleanDomain = new URL(domain).hostname;
    } catch {
    }
    cleanDomain = cleanDomain.replace(/^www\./, "");
    const dmarcDomain = `_dmarc.${cleanDomain}`;
    const records = await resolveTxtDoH(dmarcDomain);
    const dmarcRecord = records.flat().find((r) => r.startsWith("v=DMARC1"));
    if (dmarcRecord) {
      const policyMatch = dmarcRecord.match(/p=(\w+)/);
      const policy = policyMatch ? policyMatch[1] : null;
      return {
        issues,
        data: { exists: true, policy, record: dmarcRecord }
      };
    } else {
      issues.push({
        ...ISSUE_DEFINITIONS.DMARC_MISSING,
        affectedUrls: [domain]
      });
      return {
        issues,
        data: { exists: false, policy: null, record: null }
      };
    }
  } catch {
    issues.push({
      ...ISSUE_DEFINITIONS.DMARC_MISSING,
      affectedUrls: [domain]
    });
    return {
      issues,
      data: { exists: false, policy: null, record: null }
    };
  }
}
async function checkSPF(domain) {
  const issues = [];
  try {
    let cleanDomain = domain;
    try {
      cleanDomain = new URL(domain).hostname;
    } catch {
    }
    cleanDomain = cleanDomain.replace(/^www\./, "");
    const records = await resolveTxtDoH(cleanDomain);
    const spfRecord = records.flat().find((r) => r.startsWith("v=spf1"));
    if (spfRecord) {
      return {
        issues,
        data: { exists: true, record: spfRecord }
      };
    } else {
      issues.push({
        ...ISSUE_DEFINITIONS.SPF_MISSING,
        affectedUrls: [domain]
      });
      return {
        issues,
        data: { exists: false, record: null }
      };
    }
  } catch {
    return {
      issues,
      data: { exists: false, record: null }
    };
  }
}
function checkAMP(html, url) {
  const issues = [];
  const $ = cheerio21.load(html);
  const ampLink = $('link[rel="amphtml"]').attr("href");
  if (ampLink) {
    return {
      issues,
      data: {
        hasAmpLink: true,
        ampUrl: ampLink,
        ampValid: null
        // Would need to validate the AMP page
      }
    };
  }
  const isAmpPage = $("html[amp]").length > 0 || $("html[\u26A1]").length > 0;
  if (isAmpPage) {
    return {
      issues,
      data: {
        hasAmpLink: false,
        ampUrl: url,
        ampValid: null
      }
    };
  }
  const isArticle = $("article").length > 0 || $('meta[property="og:type"][content="article"]').length > 0 || html.toLowerCase().includes("blog") || html.toLowerCase().includes("news");
  if (isArticle) {
    issues.push({
      ...ISSUE_DEFINITIONS.AMP_MISSING,
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      hasAmpLink: false,
      ampUrl: null,
      ampValid: null
    }
  };
}
function checkPlaintextEmails(html, url) {
  const issues = [];
  const $ = cheerio21.load(html);
  $("script, style").remove();
  const text = $("body").text();
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex) || [];
  const filteredEmails = emails.filter((email) => {
    const lowerEmail = email.toLowerCase();
    return !lowerEmail.includes("example.com") && !lowerEmail.includes("yoursite.com") && !lowerEmail.includes("yourdomain") && !lowerEmail.endsWith(".png") && !lowerEmail.endsWith(".jpg");
  });
  const uniqueEmails = [...new Set(filteredEmails)];
  if (uniqueEmails.length > 0) {
    issues.push({
      ...ISSUE_DEFINITIONS.PLAINTEXT_EMAIL,
      affectedUrls: [url],
      details: {
        emails: uniqueEmails,
        count: uniqueEmails.length
      }
    });
  }
  return { issues, emails: uniqueEmails };
}
function checkAppleTouchIcon(html, url) {
  const issues = [];
  const $ = cheerio21.load(html);
  const hasAppleTouchIcon = $('link[rel="apple-touch-icon"]').length > 0 || $('link[rel="apple-touch-icon-precomposed"]').length > 0;
  if (!hasAppleTouchIcon) {
    issues.push({
      ...ISSUE_DEFINITIONS.APPLE_TOUCH_ICON_MISSING,
      affectedUrls: [url]
    });
  }
  return { issues, exists: hasAppleTouchIcon };
}
function checkFaviconFormat(html, url) {
  const issues = [];
  const $ = cheerio21.load(html);
  const faviconLink = $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href") || null;
  if (!faviconLink) {
    return { issues, format: null };
  }
  let format = null;
  const lowerHref = faviconLink.toLowerCase();
  if (lowerHref.endsWith(".ico")) {
    format = "ico";
  } else if (lowerHref.endsWith(".png")) {
    format = "png";
  } else if (lowerHref.endsWith(".svg")) {
    format = "svg";
  } else if (lowerHref.includes("data:image/")) {
    format = "inline";
  } else {
    format = "unknown";
  }
  return { issues, format };
}
async function runAdditionalChecks(url, html) {
  const allIssues = [];
  const [adsTxtResult, dmarcResult, spfResult] = await Promise.all([
    checkAdsTxt(url),
    checkDMARC(url),
    checkSPF(url)
  ]);
  allIssues.push(...adsTxtResult.issues);
  allIssues.push(...dmarcResult.issues);
  allIssues.push(...spfResult.issues);
  const ampResult = checkAMP(html, url);
  allIssues.push(...ampResult.issues);
  const emailResult = checkPlaintextEmails(html, url);
  allIssues.push(...emailResult.issues);
  const touchIconResult = checkAppleTouchIcon(html, url);
  allIssues.push(...touchIconResult.issues);
  const faviconResult = checkFaviconFormat(html, url);
  allIssues.push(...faviconResult.issues);
  return {
    issues: allIssues,
    data: {
      adsTxt: adsTxtResult.data,
      dmarc: dmarcResult.data,
      spf: spfResult.data,
      amp: ampResult.data,
      plaintextEmails: emailResult.emails,
      hasAppleTouchIcon: touchIconResult.exists,
      faviconFormat: faviconResult.format
    }
  };
}

// src/audit/checks/featured-snippet.ts
import * as cheerio22 from "https://esm.sh/cheerio@1.0.0";
function detectDefinitionFormat(html) {
  const $ = cheerio22.load(html);
  const definitions = [];
  $("dfn").each((_, el) => {
    const term = $(el).text().trim();
    const parent = $(el).parent().text().trim();
    if (term && parent) {
      definitions.push({ term, definition: parent });
    }
  });
  $("h2, h3").each((_, el) => {
    const heading = $(el).text().trim();
    const nextP = $(el).next("p").text().trim();
    const definitionPattern = /^([\w\s]+)\s+is\s+(?:a|an|the)\s+[\w\s]+(?:that|which|who)/i;
    const match = nextP.match(definitionPattern);
    if (match) {
      definitions.push({ term: match[1].trim(), definition: nextP.substring(0, 200) });
    }
  });
  return { found: definitions.length > 0, definitions };
}
function detectListFormat(html) {
  const $ = cheerio22.load(html);
  const lists = [];
  $("h2, h3").each((_, el) => {
    const heading = $(el).text().trim();
    const nextEl = $(el).next();
    if (nextEl.is("ol")) {
      const items = nextEl.find("li").length;
      if (items >= 3 && items <= 10) {
        lists.push({ type: "ol", itemCount: items, context: heading });
      }
    } else if (nextEl.is("ul")) {
      const items = nextEl.find("li").length;
      if (items >= 3 && items <= 10) {
        lists.push({ type: "ul", itemCount: items, context: heading });
      }
    }
  });
  return { found: lists.length > 0, lists };
}
function detectTableFormat(html) {
  const $ = cheerio22.load(html);
  const tables = [];
  $("table").each((_, el) => {
    const $table = $(el);
    const hasHeaders = $table.find("th").length > 0 || $table.find("thead").length > 0;
    const rows = $table.find("tr").length;
    const cols = $table.find("tr").first().find("td, th").length;
    if (cols >= 2 && cols <= 6 && rows >= 3 && rows <= 15) {
      tables.push({ hasHeaders, rows, cols });
    }
  });
  return { found: tables.length > 0, tables };
}
function detectQAFormat(html) {
  const $ = cheerio22.load(html);
  const questions = [];
  const questionPatterns = [
    /^what\s+/i,
    /^how\s+/i,
    /^why\s+/i,
    /^when\s+/i,
    /^where\s+/i,
    /^who\s+/i,
    /^which\s+/i,
    /^can\s+/i,
    /^does\s+/i,
    /^is\s+/i,
    /^are\s+/i,
    /^should\s+/i,
    /\?$/
  ];
  $("h2, h3, h4").each((_, el) => {
    const text = $(el).text().trim();
    for (const pattern of questionPatterns) {
      if (pattern.test(text)) {
        questions.push(text);
        break;
      }
    }
  });
  const hasFaqSection = $("section.faq, div.faq, #faq, .faqs, [data-faq]").length > 0 || $("h2, h3").text().toLowerCase().includes("faq") || $("h2, h3").text().toLowerCase().includes("frequently asked");
  $("details summary").each((_, el) => {
    const text = $(el).text().trim();
    if (text.endsWith("?") || questionPatterns.some((p) => p.test(text))) {
      questions.push(text);
    }
  });
  return { found: questions.length > 0 || hasFaqSection, qaCount: questions.length, questions };
}
function detectInvertedPyramid(html) {
  const $ = cheerio22.load(html);
  $("script, style, nav, header, footer, aside").remove();
  const h1 = $("h1").first();
  const firstContent = h1.nextAll("p").first().text().trim();
  if (!firstContent) {
    return { found: false, score: 0 };
  }
  const answerPatterns = [
    /^the\s+answer\s+is/i,
    /^yes[,\s]/i,
    /^no[,\s]/i,
    /^in\s+short/i,
    /^to\s+summarize/i,
    /^([\w\s]+)\s+is\s+/i,
    // Definition pattern
    /^\d+/i,
    // Starts with number
    /^the\s+best\s+/i,
    /^you\s+(can|should|need)/i
  ];
  let score = 0;
  for (const pattern of answerPatterns) {
    if (pattern.test(firstContent)) {
      score += 30;
      break;
    }
  }
  const wordCount = firstContent.split(/\s+/).length;
  if (wordCount >= 40 && wordCount <= 100) {
    score += 30;
  } else if (wordCount > 0 && wordCount < 40) {
    score += 15;
  }
  const title = $("title").text().toLowerCase();
  const titleWords = title.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
  const firstParaLower = firstContent.toLowerCase();
  const matchingWords = titleWords.filter((w) => firstParaLower.includes(w));
  const titleMatchRatio = titleWords.length > 0 ? matchingWords.length / titleWords.length : 0;
  if (titleMatchRatio > 0.5) {
    score += 40;
  } else if (titleMatchRatio > 0.25) {
    score += 20;
  }
  return { found: score >= 50, score: Math.min(score, 100) };
}
function detectSnippetSchema(html) {
  const $ = cheerio22.load(html);
  let hasFaqSchema = false;
  let hasHowToSchema = false;
  let hasQASchema = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "");
      const types = Array.isArray(data) ? data.map((d) => d["@type"]) : [data["@type"]];
      if (types.includes("FAQPage") || types.some((t) => t?.includes?.("FAQPage"))) {
        hasFaqSchema = true;
      }
      if (types.includes("HowTo") || types.some((t) => t?.includes?.("HowTo"))) {
        hasHowToSchema = true;
      }
      if (types.includes("QAPage") || types.some((t) => t?.includes?.("QAPage"))) {
        hasQASchema = true;
      }
    } catch {
    }
  });
  return { hasFaqSchema, hasHowToSchema, hasQASchema };
}
function analyzeSnippetBaitHeaders(html) {
  const $ = cheerio22.load(html);
  const snippetBaitHeaders = [];
  const triggerPatterns = [
    /^what\s+is\s+/i,
    /^how\s+to\s+/i,
    /^how\s+do\s+/i,
    /^how\s+does\s+/i,
    /^why\s+is\s+/i,
    /^why\s+do\s+/i,
    /^why\s+does\s+/i,
    /^when\s+to\s+/i,
    /^where\s+to\s+/i,
    /^\d+\s+(ways|tips|steps|reasons|benefits|examples)/i,
    /^(best|top)\s+\d+/i,
    /^(guide|tutorial):/i,
    /\s+vs\s+/i,
    /^definition\s+of/i
  ];
  $("h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    for (const pattern of triggerPatterns) {
      if (pattern.test(text)) {
        snippetBaitHeaders.push(text);
        break;
      }
    }
  });
  return snippetBaitHeaders;
}
function analyzeFeaturedSnippet(html, url) {
  const issues = [];
  const definitions = detectDefinitionFormat(html);
  const lists = detectListFormat(html);
  const tables = detectTableFormat(html);
  const qa = detectQAFormat(html);
  const invertedPyramid = detectInvertedPyramid(html);
  const schema = detectSnippetSchema(html);
  const snippetBaitHeaders = analyzeSnippetBaitHeaders(html);
  const opportunities = [];
  if (!definitions.found) {
    opportunities.push({
      type: "definition",
      heading: "Missing definition format",
      score: 0,
      issues: ["No clear definition patterns found"],
      suggestions: [
        'Add a paragraph starting with "[Topic] is a [noun] that..." after your main heading',
        "Use <dfn> tags for key term definitions",
        "Keep definitions concise (40-60 words)"
      ]
    });
  }
  if (lists.found) {
    for (const list of lists.lists) {
      if (!list.context.toLowerCase().match(/^\d+|^(how|steps|tips|ways)/)) {
        opportunities.push({
          type: "list",
          heading: list.context,
          score: 70,
          issues: ["List heading could be more snippet-friendly"],
          suggestions: [
            'Consider rephrasing to "X Steps to..." or "Top X Tips for..."',
            "Ensure list items are parallel in structure"
          ]
        });
      }
    }
  } else {
    opportunities.push({
      type: "list",
      heading: "Missing list content",
      score: 0,
      issues: ["No optimized lists found for snippet targeting"],
      suggestions: [
        "Add numbered or bulleted lists with 4-8 items",
        'Use headers like "Steps to...", "Ways to...", or "Top X..."',
        "Keep list items concise and parallel in structure"
      ]
    });
  }
  if (!tables.found) {
    opportunities.push({
      type: "table",
      heading: "No comparison tables",
      score: 0,
      issues: ["No tables optimized for comparison snippets"],
      suggestions: [
        "Add comparison tables with clear headers",
        "Use 3-5 columns and 4-10 rows for optimal snippet display",
        "Include thead with th elements for proper table structure"
      ]
    });
  }
  if (qa.found && qa.qaCount > 0) {
    if (!schema.hasFaqSchema && qa.qaCount >= 3) {
      issues.push({
        code: "FAQ_SCHEMA_MISSING",
        severity: "warning",
        category: "structured-data",
        title: "FAQ content without FAQPage schema",
        description: `Found ${qa.qaCount} question-format headings but no FAQPage schema markup.`,
        impact: "Missing out on FAQ rich results and PAA box opportunities.",
        howToFix: "Add FAQPage structured data for your Q&A content.",
        affectedUrls: [url],
        details: { questions: qa.questions.slice(0, 5) }
      });
    }
  } else {
    opportunities.push({
      type: "qa",
      heading: "Missing Q&A content",
      score: 0,
      issues: ["No question-format headers found"],
      suggestions: [
        "Add H2/H3 headings in question format (What is..., How to..., Why does...)",
        "Follow each question heading with a direct answer paragraph",
        "Consider adding a FAQ section with 3-5 common questions"
      ]
    });
  }
  if (!invertedPyramid.found) {
    issues.push({
      code: "INVERTED_PYRAMID_MISSING",
      severity: "notice",
      category: "content",
      title: "Content not structured for featured snippets",
      description: "First paragraph does not contain a direct answer or summary.",
      impact: "Featured snippets pull from early content; burying answers reduces snippet capture rate.",
      howToFix: "Start with a concise answer (40-80 words) that directly addresses the page topic.",
      affectedUrls: [url],
      details: { invertedPyramidScore: invertedPyramid.score }
    });
  }
  if (snippetBaitHeaders.length === 0) {
    issues.push({
      code: "NO_SNIPPET_BAIT_HEADERS",
      severity: "notice",
      category: "on-page",
      title: "No snippet-targeting headers found",
      description: "Headings do not use patterns that commonly trigger featured snippets.",
      impact: "Missing opportunities for high-visibility snippet placements.",
      howToFix: 'Use headers like "What is [topic]?", "How to [action]", or "X Ways to [achieve goal]".',
      affectedUrls: [url],
      details: { suggestedPatterns: ["What is X?", "How to X", "X Steps to Y", "Best X for Y"] }
    });
  }
  return {
    issues,
    data: {
      hasDefinitionFormat: definitions.found,
      hasListFormat: lists.found,
      hasTableFormat: tables.found,
      hasQAFormat: qa.found,
      hasInvertedPyramid: invertedPyramid.found,
      opportunities,
      faqSchemaPresent: schema.hasFaqSchema,
      howToSchemaPresent: schema.hasHowToSchema,
      questionHeadingsCount: qa.qaCount
    }
  };
}

// src/audit/checks/internal-link-graph.ts
import * as cheerio23 from "https://esm.sh/cheerio@1.0.0";
function extractInternalLinks(html, pageUrl) {
  const $ = cheerio23.load(html);
  const links = [];
  const baseUrl = new URL(pageUrl);
  $("a[href]").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href") || "";
    const anchor = $el.text().trim();
    if (!href || href.startsWith("javascript:") || href.startsWith("#")) {
      return;
    }
    let targetUrl;
    try {
      targetUrl = new URL(href, pageUrl);
    } catch {
      return;
    }
    if (targetUrl.hostname !== baseUrl.hostname) {
      return;
    }
    let context = "content";
    const parents = $el.parents();
    for (let i = 0; i < parents.length; i++) {
      const parent = parents.eq(i);
      const tagName = parent.prop("tagName")?.toLowerCase() || "";
      const className = parent.attr("class")?.toLowerCase() || "";
      const id = parent.attr("id")?.toLowerCase() || "";
      if (tagName === "nav" || className.includes("nav") || className.includes("menu") || id.includes("nav") || id.includes("menu")) {
        context = "navigation";
        break;
      }
      if (tagName === "footer" || className.includes("footer") || id.includes("footer")) {
        context = "footer";
        break;
      }
      if (tagName === "aside" || className.includes("sidebar") || className.includes("widget") || id.includes("sidebar")) {
        context = "sidebar";
        break;
      }
    }
    let isEditorial = context === "content";
    if (isEditorial) {
      const parent = $el.parent();
      const parentText = parent.text().trim();
      isEditorial = parentText.length > anchor.length + 10;
    }
    links.push({
      source: pageUrl,
      target: targetUrl.href.split("#")[0],
      // Remove fragment
      anchor,
      context,
      isEditorial
    });
  });
  return links;
}
function analyzeFirstLinkPriority(links) {
  const firstLinks = /* @__PURE__ */ new Map();
  for (const link of links) {
    if (!firstLinks.has(link.target)) {
      firstLinks.set(link.target, {
        anchor: link.anchor,
        context: link.context
      });
    }
  }
  return firstLinks;
}
function analyzeInternalLinkGraph(html, url) {
  const issues = [];
  const links = extractInternalLinks(html, url);
  const navigationLinks = links.filter((l) => l.context === "navigation").length;
  const contentLinks = links.filter((l) => l.context === "content").length;
  const footerLinks = links.filter((l) => l.context === "footer").length;
  const editorialLinks = links.filter((l) => l.isEditorial).length;
  const totalLinks = links.length;
  const contextualLinkRatio = totalLinks > 0 ? contentLinks / totalLinks : 0;
  const navigationVsContentRatio = contentLinks > 0 ? navigationLinks / contentLinks : 0;
  if (contentLinks === 0 && totalLinks > 0) {
    issues.push({
      code: "NO_CONTEXTUAL_INTERNAL_LINKS",
      severity: "warning",
      category: "links",
      title: "No contextual internal links",
      description: "All internal links are in navigation/footer. No editorial links in content.",
      impact: "Editorial links in content pass more SEO value than navigational links.",
      howToFix: "Add relevant internal links within your main content to related pages.",
      affectedUrls: [url],
      details: { navigationLinks, contentLinks, footerLinks }
    });
  }
  if (editorialLinks < 2 && contentLinks > 0) {
    issues.push({
      code: "LOW_EDITORIAL_LINKS",
      severity: "notice",
      category: "links",
      title: "Few editorial internal links",
      description: `Only ${editorialLinks} editorial (in-content) internal links found.`,
      impact: "Editorial links with surrounding context provide stronger topical signals.",
      howToFix: "Add 2-5 relevant internal links within your body content.",
      affectedUrls: [url]
    });
  }
  const firstLinks = analyzeFirstLinkPriority(links);
  const genericAnchors = ["click here", "read more", "learn more", "here", "this"];
  for (const [target, linkInfo] of firstLinks) {
    if (genericAnchors.some((g) => linkInfo.anchor.toLowerCase().includes(g))) {
      issues.push({
        code: "FIRST_LINK_GENERIC_ANCHOR",
        severity: "notice",
        category: "links",
        title: "First link uses generic anchor text",
        description: `First link to ${target} uses generic anchor "${linkInfo.anchor}".`,
        impact: "Google may prioritize first link anchor for topic signals.",
        howToFix: "Use descriptive, keyword-relevant anchor text for internal links.",
        affectedUrls: [url],
        details: { target, anchor: linkInfo.anchor }
      });
    }
  }
  if (totalLinks > 100) {
    issues.push({
      code: "TOO_MANY_INTERNAL_LINKS",
      severity: "warning",
      category: "links",
      title: "Excessive internal links",
      description: `Page has ${totalLinks} internal links, which may dilute PageRank distribution.`,
      impact: "Too many links reduce the value passed to each linked page.",
      howToFix: "Reduce internal links to the most important and relevant pages.",
      affectedUrls: [url],
      details: { totalLinks, navigationLinks, contentLinks, footerLinks }
    });
  }
  if (totalLinks === 0) {
    issues.push({
      code: "NO_INTERNAL_LINKS",
      severity: "error",
      category: "links",
      title: "No internal links found",
      description: "Page has no internal links to other pages on the site.",
      impact: "Creates a dead end for users and search engine crawlers.",
      howToFix: "Add relevant internal links to related content.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      totalInternalLinks: totalLinks,
      contextualLinkRatio,
      navigationVsContentRatio,
      firstLinkAnchors: new Map(
        [...firstLinks.entries()].map(([k, v]) => [k, v.anchor])
      ),
      linkDistribution: [{ url, links: totalLinks }]
    }
  };
}

// src/audit/checks/resource-hints.ts
import * as cheerio24 from "https://esm.sh/cheerio@1.0.0";
function extractResourceHints(html) {
  const $ = cheerio24.load(html);
  const hints = [];
  $('link[rel="dns-prefetch"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({ type: "dns-prefetch", href });
    }
  });
  $('link[rel="preconnect"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({
        type: "preconnect",
        href,
        crossorigin: $(el).attr("crossorigin")
      });
    }
  });
  $('link[rel="prefetch"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({
        type: "prefetch",
        href,
        as: $(el).attr("as")
      });
    }
  });
  $('link[rel="preload"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({
        type: "preload",
        href,
        as: $(el).attr("as"),
        crossorigin: $(el).attr("crossorigin")
      });
    }
  });
  $('link[rel="modulepreload"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      hints.push({ type: "modulepreload", href });
    }
  });
  return hints;
}
function detectThirdPartyDomains(html, pageUrl) {
  const $ = cheerio24.load(html);
  const baseDomain = new URL(pageUrl).hostname;
  const domains = /* @__PURE__ */ new Set();
  $("script[src]").each((_, el) => {
    try {
      const src = $(el).attr("src");
      const url = new URL(src, pageUrl);
      if (url.hostname !== baseDomain) {
        domains.add(url.origin);
      }
    } catch {
    }
  });
  $('link[rel="stylesheet"][href]').each((_, el) => {
    try {
      const href = $(el).attr("href");
      const url = new URL(href, pageUrl);
      if (url.hostname !== baseDomain) {
        domains.add(url.origin);
      }
    } catch {
    }
  });
  $("img[src]").each((_, el) => {
    try {
      const src = $(el).attr("src");
      const url = new URL(src, pageUrl);
      if (url.hostname !== baseDomain) {
        domains.add(url.origin);
      }
    } catch {
    }
  });
  const styleContent = $("style").text();
  const fontUrlMatches = styleContent.match(/url\(['"]?(https?:\/\/[^'")\s]+)/g) || [];
  for (const match of fontUrlMatches) {
    try {
      const url = match.replace(/url\(['"]?/, "");
      const parsed = new URL(url);
      if (parsed.hostname !== baseDomain) {
        domains.add(parsed.origin);
      }
    } catch {
    }
  }
  return [...domains];
}
var CRITICAL_THIRD_PARTIES = {
  "fonts.googleapis.com": ["https://fonts.googleapis.com", "https://fonts.gstatic.com"],
  "fonts.gstatic.com": ["https://fonts.googleapis.com", "https://fonts.gstatic.com"],
  "www.google-analytics.com": ["https://www.google-analytics.com"],
  "www.googletagmanager.com": ["https://www.googletagmanager.com"],
  "cdn.jsdelivr.net": ["https://cdn.jsdelivr.net"],
  "unpkg.com": ["https://unpkg.com"],
  "cdnjs.cloudflare.com": ["https://cdnjs.cloudflare.com"],
  "ajax.googleapis.com": ["https://ajax.googleapis.com"],
  "connect.facebook.net": ["https://connect.facebook.net"],
  "platform.twitter.com": ["https://platform.twitter.com"],
  "www.youtube.com": ["https://www.youtube.com", "https://i.ytimg.com"],
  "player.vimeo.com": ["https://player.vimeo.com"],
  "js.stripe.com": ["https://js.stripe.com"]
};
function findMissingPreconnects(thirdPartyDomains, existingHints) {
  const preconnected = new Set(
    existingHints.filter((h) => h.type === "preconnect" || h.type === "dns-prefetch").map((h) => {
      try {
        return new URL(h.href).origin;
      } catch {
        return h.href;
      }
    })
  );
  const missing = [];
  for (const domain of thirdPartyDomains) {
    try {
      const hostname = new URL(domain).hostname;
      const recommended = CRITICAL_THIRD_PARTIES[hostname] || [domain];
      for (const rec of recommended) {
        if (!preconnected.has(rec)) {
          missing.push(rec);
        }
      }
    } catch {
    }
  }
  return [...new Set(missing)];
}
function analyzeResourceHints(html, url) {
  const issues = [];
  const hints = extractResourceHints(html);
  const thirdPartyDomains = detectThirdPartyDomains(html, url);
  const missingPreconnects = findMissingPreconnects(thirdPartyDomains, hints);
  const dnsPrefetch = hints.filter((h) => h.type === "dns-prefetch").map((h) => h.href);
  const preconnect = hints.filter((h) => h.type === "preconnect").map((h) => h.href);
  const prefetch = hints.filter((h) => h.type === "prefetch").map((h) => h.href);
  const preload = hints.filter((h) => h.type === "preload");
  const modulepreload = hints.filter((h) => h.type === "modulepreload").map((h) => h.href);
  if (missingPreconnects.length > 0) {
    issues.push({
      code: "MISSING_PRECONNECT",
      severity: "warning",
      category: "performance",
      title: "Missing preconnect hints for third-party origins",
      description: `${missingPreconnects.length} third-party origins used without preconnect hints.`,
      impact: "Connection setup to third-party origins adds latency to resource loading.",
      howToFix: `Add preconnect hints: ${missingPreconnects.slice(0, 3).map((d) => `<link rel="preconnect" href="${d}">`).join(" ")}`,
      affectedUrls: [url],
      details: { missingPreconnects: missingPreconnects.slice(0, 5) }
    });
  }
  const usesGoogleFonts = thirdPartyDomains.some(
    (d) => d.includes("fonts.googleapis.com") || d.includes("fonts.gstatic.com")
  );
  const hasGoogleFontsPreconnect = preconnect.some((h) => h.includes("fonts.googleapis.com")) && preconnect.some((h) => h.includes("fonts.gstatic.com"));
  if (usesGoogleFonts && !hasGoogleFontsPreconnect) {
    issues.push({
      code: "GOOGLE_FONTS_NO_PRECONNECT",
      severity: "warning",
      category: "performance",
      title: "Google Fonts without preconnect",
      description: "Google Fonts are used but preconnect hints are missing.",
      impact: "Adds significant latency to font loading, affecting LCP.",
      howToFix: 'Add: <link rel="preconnect" href="https://fonts.googleapis.com"> and <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      affectedUrls: [url]
    });
  }
  const $ = cheerio24.load(html);
  const hasHeroImage = $("img").first().length > 0;
  const hasImagePreload = preload.some((p) => p.as === "image");
  if (hasHeroImage && !hasImagePreload) {
    issues.push({
      code: "HERO_IMAGE_NOT_PRELOADED",
      severity: "notice",
      category: "performance",
      title: "Hero image not preloaded",
      description: "Page has images but none are preloaded for faster LCP.",
      impact: "Preloading LCP images can improve Largest Contentful Paint.",
      howToFix: 'Add <link rel="preload" href="hero-image.jpg" as="image"> for your LCP image.',
      affectedUrls: [url]
    });
  }
  const hasRenderBlockingCSS = $('link[rel="stylesheet"]').filter((_, el) => !$(el).attr("media") || $(el).attr("media") === "all").length > 0;
  const hasCSSPreload = preload.some((p) => p.as === "style");
  if (hasRenderBlockingCSS && !hasCSSPreload && preload.length === 0) {
    issues.push({
      code: "NO_CRITICAL_RESOURCE_PRELOAD",
      severity: "notice",
      category: "performance",
      title: "No critical resources preloaded",
      description: "Page has render-blocking resources but no preload hints.",
      impact: "Preloading critical resources can improve initial render time.",
      howToFix: "Consider preloading critical CSS, fonts, or hero images.",
      affectedUrls: [url]
    });
  }
  if (preload.length > 10) {
    issues.push({
      code: "EXCESSIVE_PRELOADS",
      severity: "warning",
      category: "performance",
      title: "Too many preload hints",
      description: `Page has ${preload.length} preload hints, which can degrade performance.`,
      impact: "Preloading too many resources competes for bandwidth and can delay critical resources.",
      howToFix: "Limit preloads to truly critical resources (2-5 maximum).",
      affectedUrls: [url]
    });
  }
  const hasESModules = $('script[type="module"]').length > 0;
  if (hasESModules && modulepreload.length === 0) {
    issues.push({
      code: "ES_MODULES_NO_MODULEPRELOAD",
      severity: "notice",
      category: "performance",
      title: "ES modules without modulepreload",
      description: "Page uses ES modules but no modulepreload hints are present.",
      impact: "Modulepreload can parallelize module loading for faster execution.",
      howToFix: 'Add <link rel="modulepreload" href="critical-module.js"> for critical modules.',
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      dnsPrefetch,
      preconnect,
      prefetch,
      preload,
      modulepreload,
      thirdPartyDomains,
      missingPreconnects,
      earlyHints: false,
      http2Push: false
    }
  };
}

// src/audit/checks/eeat-signals.ts
import * as cheerio25 from "https://esm.sh/cheerio@1.0.0";
var CREDENTIAL_PATTERNS = [
  /\b(MD|M\.D\.|Dr\.|Doctor)\b/i,
  /\b(PhD|Ph\.D\.|Doctorate)\b/i,
  /\b(JD|J\.D\.|Attorney|Lawyer|Esq\.)\b/i,
  /\b(CPA|Certified Public Accountant)\b/i,
  /\b(CFP|Certified Financial Planner)\b/i,
  /\b(RN|Registered Nurse)\b/i,
  /\b(PE|Professional Engineer)\b/i,
  /\b(MBA|Master of Business)\b/i,
  /\b(Professor|Prof\.)\b/i,
  /\b(Licensed|Certified|Accredited)\b/i,
  /\b(\d+\+?\s*years?\s*(of\s+)?experience)\b/i
];
var TRUST_BADGE_PATTERNS = [
  /BBB\s*(Accredited|A\+|Rating)/i,
  /Norton\s*Secure/i,
  /McAfee\s*Secure/i,
  /TRUSTe/i,
  /SSL\s*(Secure|Certified)/i,
  /Verified\s*(by|Business)/i,
  /Award[\-\s]*(Winning|Winner)/i,
  /ISO\s*\d+/i,
  /HIPAA\s*Compliant/i,
  /GDPR\s*Compliant/i,
  /PCI[\-\s]*(DSS|Compliant)/i,
  /SOC\s*2/i
];
var AUTHORITATIVE_DOMAINS = [
  "wikipedia.org",
  "gov",
  "edu",
  "nytimes.com",
  "wsj.com",
  "bbc.com",
  "reuters.com",
  "nature.com",
  "science.org",
  "pubmed.ncbi.nlm.nih.gov",
  "who.int",
  "cdc.gov",
  "nih.gov",
  "harvard.edu",
  "stanford.edu",
  "mit.edu"
];
var YMYL_PATTERNS = [
  /\b(medical|health|disease|treatment|symptom|diagnosis|medication|drug)\b/i,
  /\b(financial|investment|tax|insurance|mortgage|credit|loan|retirement)\b/i,
  /\b(legal|attorney|lawyer|lawsuit|court|divorce|custody)\b/i,
  /\b(safety|emergency|danger|warning|crisis)\b/i,
  /\b(government|voting|election|law|regulation)\b/i,
  /\b(religion|ethnic|race|gender|sexuality)\b/i,
  /\b(buy|purchase|price|cost|shop)\b/i
];
function extractAuthorInfo(html) {
  const $ = cheerio25.load(html);
  const info = {
    name: null,
    bio: null,
    credentials: [],
    socialLinks: [],
    hasSchema: false,
    photoPresent: false
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "");
      const checkAuthor = (obj) => {
        if (obj["@type"] === "Person" || obj.author) {
          info.hasSchema = true;
          const author = obj.author || obj;
          if (typeof author === "object" && author !== null) {
            info.name = author.name || info.name;
          }
        }
      };
      if (Array.isArray(data)) {
        data.forEach(checkAuthor);
      } else {
        checkAuthor(data);
      }
    } catch {
    }
  });
  const authorMeta = $('meta[name="author"]').attr("content");
  if (authorMeta) {
    info.name = info.name || authorMeta;
  }
  const authorLink = $('link[rel="author"]').attr("href");
  if (authorLink) {
    info.socialLinks.push(authorLink);
  }
  const bylineSelectors = [
    ".author",
    ".byline",
    '[rel="author"]',
    ".post-author",
    ".article-author",
    ".author-name",
    ".written-by",
    '[itemprop="author"]'
  ];
  for (const selector of bylineSelectors) {
    const el = $(selector).first();
    if (el.length) {
      const text = el.text().trim();
      if (text && text.length < 100) {
        info.name = info.name || text.replace(/^(by|written by|author:)\s*/i, "");
      }
      break;
    }
  }
  const bioSelectors = [".author-bio", ".author-description", ".about-author", '[itemprop="description"]'];
  for (const selector of bioSelectors) {
    const el = $(selector).first();
    if (el.length) {
      info.bio = el.text().trim().substring(0, 500);
      break;
    }
  }
  info.photoPresent = $('img.author-photo, img.author-image, .author img, [itemprop="image"]').length > 0 || $('img[alt*="author"], img[alt*="Author"]').length > 0;
  const textToCheck = `${info.name || ""} ${info.bio || ""}`;
  for (const pattern of CREDENTIAL_PATTERNS) {
    const match = textToCheck.match(pattern);
    if (match) {
      info.credentials.push(match[0]);
    }
  }
  $(".author a, .byline a, .author-social a").each((_, el) => {
    const href = $(el).attr("href");
    if (href && (href.includes("linkedin.com") || href.includes("twitter.com") || href.includes("github.com") || href.includes("medium.com"))) {
      info.socialLinks.push(href);
    }
  });
  return info;
}
function extractOrganizationInfo(html) {
  const $ = cheerio25.load(html);
  const info = {
    name: null,
    type: null,
    hasSchema: false,
    hasContactInfo: false,
    hasSocialProfiles: false,
    trustBadges: []
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "");
      const checkOrg = (obj) => {
        const type = obj["@type"];
        if (type === "Organization" || type === "LocalBusiness" || type === "Corporation") {
          info.hasSchema = true;
          info.name = obj.name || info.name;
          info.type = type;
          if (obj.contactPoint || obj.telephone || obj.email) {
            info.hasContactInfo = true;
          }
          if (obj.sameAs && Array.isArray(obj.sameAs) && obj.sameAs.length > 0) {
            info.hasSocialProfiles = true;
          }
        }
      };
      if (Array.isArray(data)) {
        data.forEach(checkOrg);
      } else {
        checkOrg(data);
      }
    } catch {
    }
  });
  const hasContact = $('a[href^="tel:"]').length > 0 || $('a[href^="mailto:"]').length > 0 || $('.contact, #contact, [class*="contact"]').length > 0;
  info.hasContactInfo = info.hasContactInfo || hasContact;
  const socialLinks = $('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="instagram.com"]');
  info.hasSocialProfiles = info.hasSocialProfiles || socialLinks.length > 0;
  const pageText = $.text();
  for (const pattern of TRUST_BADGE_PATTERNS) {
    const match = pageText.match(pattern);
    if (match) {
      info.trustBadges.push(match[0]);
    }
  }
  return info;
}
function detectExperienceSignals(html) {
  const $ = cheerio25.load(html);
  $("script, style").remove();
  const text = $("body").text();
  const signals = [];
  const experiencePatterns = [
    /\bI (tested|tried|used|reviewed|experienced|personally)\b/i,
    /\bin my experience\b/i,
    /\bwe (tested|tried|used|reviewed|found)\b/i,
    /\bfirst-hand\b/i,
    /\bhands-on\b/i,
    /\bI've been (using|doing|working)\b/i,
    /\bfor (\d+) years? I've\b/i,
    /\bour team (tested|reviewed|evaluated)\b/i
  ];
  for (const pattern of experiencePatterns) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) {
        signals.push(match[0]);
      }
    }
  }
  const hasOriginalImages = $('img[src*="author"], img[src*="team"], img[src*="review"], img[src*="test"]').length > 0;
  if (hasOriginalImages) {
    signals.push("Original images present");
  }
  const hasReviews = $('[class*="review"], [class*="testimonial"], [itemtype*="Review"]').length > 0;
  if (hasReviews) {
    signals.push("User reviews/testimonials present");
  }
  return signals;
}
function detectExpertiseSignals(html) {
  const $ = cheerio25.load(html);
  const text = $("body").text();
  const signals = [];
  const technicalPatterns = [
    /\b(methodology|analysis|research|study|data)\b/i,
    /\b(according to|based on|supported by)\b/i,
    /\b(statistics|metrics|measurements)\b/i
  ];
  for (const pattern of technicalPatterns) {
    if (pattern.test(text)) {
      signals.push("Technical/research depth");
      break;
    }
  }
  for (const pattern of CREDENTIAL_PATTERNS) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) {
        signals.push(`Credential: ${match[0]}`);
      }
    }
  }
  if (/\b(reviewed by|fact-checked by|medically reviewed|expert reviewed)\b/i.test(text)) {
    signals.push("Expert review indicated");
  }
  return signals;
}
function analyzeCitations(html) {
  const $ = cheerio25.load(html);
  const authoritativeSources = [];
  let citationCount = 0;
  $('a[href^="http"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase();
      for (const domain of AUTHORITATIVE_DOMAINS) {
        if (hostname.includes(domain) || hostname.endsWith(`.${domain}`)) {
          authoritativeSources.push(hostname);
          citationCount++;
          break;
        }
      }
    } catch {
    }
  });
  return { count: citationCount, authoritativeSources: [...new Set(authoritativeSources)] };
}
function extractReviewerInfo(html) {
  const $ = cheerio25.load(html);
  const text = $("body").text();
  const info = {
    hasReviewer: false,
    reviewerName: null,
    reviewerCredentials: [],
    reviewDate: null,
    nextReviewDate: null,
    reviewType: null
  };
  const reviewPatterns = [
    /medically reviewed by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /reviewed by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /fact[- ]checked by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /verified by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /expert reviewed by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
  ];
  for (const pattern of reviewPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.hasReviewer = true;
      info.reviewerName = match[1];
      if (/medical/i.test(match[0])) {
        info.reviewType = "medical";
      } else if (/fact[- ]check/i.test(match[0])) {
        info.reviewType = "fact-check";
      } else if (/expert/i.test(match[0])) {
        info.reviewType = "expert";
      } else {
        info.reviewType = "editorial";
      }
      for (const credPattern of CREDENTIAL_PATTERNS) {
        const credMatch = text.substring(match.index || 0, (match.index || 0) + 200).match(credPattern);
        if (credMatch) {
          info.reviewerCredentials.push(credMatch[0]);
        }
      }
      break;
    }
  }
  const reviewDatePatterns = [
    /last reviewed[:\s]+(\w+\s+\d{1,2},?\s+\d{4})/i,
    /reviewed on[:\s]+(\w+\s+\d{1,2},?\s+\d{4})/i,
    /review date[:\s]+(\d{4}-\d{2}-\d{2})/i
  ];
  for (const pattern of reviewDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      info.reviewDate = match[1];
      break;
    }
  }
  const nextReviewPatterns = [
    /next review[:\s]+(\w+\s+\d{4})/i,
    /due for review[:\s]+(\w+\s+\d{4})/i,
    /review due[:\s]+(\w+\s+\d{4})/i
  ];
  for (const pattern of nextReviewPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.nextReviewDate = match[1];
      break;
    }
  }
  const reviewerSelectors = [
    ".reviewed-by",
    ".fact-checker",
    ".medical-reviewer",
    '[class*="reviewer"]',
    '[class*="fact-check"]'
  ];
  for (const selector of reviewerSelectors) {
    const el = $(selector).first();
    if (el.length) {
      info.hasReviewer = true;
      const elText = el.text().trim();
      if (elText.length < 100 && !info.reviewerName) {
        info.reviewerName = elText.replace(/^(reviewed by|fact-checked by|verified by)\s*/i, "");
      }
      break;
    }
  }
  return info;
}
function extractTrustBadges(html) {
  const $ = cheerio25.load(html);
  const text = $("body").text().toLowerCase();
  const htmlLower = html.toLowerCase();
  const info = {
    pressFeatures: [],
    certifications: [],
    awards: [],
    partnerships: []
  };
  const pressPatterns = [
    /as seen (?:in|on)\s+([^.]+)/gi,
    /featured (?:in|on)\s+([^.]+)/gi,
    /covered by\s+([^.]+)/gi,
    /mentioned (?:in|by)\s+([^.]+)/gi
  ];
  for (const pattern of pressPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const publications = match[1].split(/,|\band\b/).map((p) => p.trim()).filter((p) => p.length > 2 && p.length < 50);
      info.pressFeatures.push(...publications);
    }
  }
  const pressSelectors = [
    ".as-seen-in",
    ".featured-in",
    ".press-logos",
    ".media-logos",
    '[class*="press"]',
    '[class*="featured"]',
    ".trust-badges"
  ];
  for (const selector of pressSelectors) {
    if ($(selector).length > 0) {
      $(`${selector} img`).each((_, el) => {
        const alt = $(el).attr("alt") || "";
        const src = $(el).attr("src") || "";
        const combined = (alt + src).toLowerCase();
        const outlets = ["forbes", "nytimes", "wsj", "bbc", "cnn", "techcrunch", "wired", "bloomberg"];
        for (const outlet of outlets) {
          if (combined.includes(outlet) && !info.pressFeatures.includes(outlet)) {
            info.pressFeatures.push(outlet);
          }
        }
      });
    }
  }
  const certPatterns = [
    { pattern: /clinically (?:studied|proven|tested)/gi, type: "Clinically studied" },
    { pattern: /fda[- ](?:approved|cleared|registered)/gi, type: "FDA approved" },
    { pattern: /dermatologist[- ](?:tested|recommended)/gi, type: "Dermatologist tested" },
    { pattern: /doctor[- ](?:recommended|approved)/gi, type: "Doctor recommended" },
    { pattern: /lab[- ]tested/gi, type: "Lab tested" },
    { pattern: /third[- ]party[- ]tested/gi, type: "Third-party tested" },
    { pattern: /scientifically[- ](?:proven|backed)/gi, type: "Scientifically proven" },
    { pattern: /peer[- ]reviewed/gi, type: "Peer reviewed" },
    { pattern: /iso[- ]\d+[- ]certified/gi, type: "ISO certified" },
    { pattern: /organic[- ]certified/gi, type: "Organic certified" },
    { pattern: /usda[- ]organic/gi, type: "USDA Organic" }
  ];
  for (const { pattern, type } of certPatterns) {
    if (pattern.test(text)) {
      info.certifications.push(type);
    }
  }
  const awardPatterns = [
    /(?:won|received|awarded)\s+(?:the\s+)?([^.]+award)/gi,
    /award[- ]winning/gi,
    /best (?:of|in) \d{4}/gi,
    /editor'?s? choice/gi,
    /top[- ]rated/gi,
    /#1 (?:rated|ranked|best)/gi
  ];
  for (const pattern of awardPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.awards.push(match[0]);
    }
  }
  const partnerPatterns = [
    /trusted by\s+([^.]+)/gi,
    /used by\s+([^.]+)/gi,
    /partnered? with\s+([^.]+)/gi,
    /official partner/gi
  ];
  for (const pattern of partnerPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.partnerships.push(match[0].substring(0, 100));
    }
  }
  info.pressFeatures = [...new Set(info.pressFeatures)].slice(0, 10);
  info.certifications = [...new Set(info.certifications)];
  info.awards = [...new Set(info.awards)].slice(0, 5);
  info.partnerships = [...new Set(info.partnerships)].slice(0, 5);
  return info;
}
function detectVideoExperienceSignals(html) {
  const $ = cheerio25.load(html);
  const signals = [];
  const hasVideoElement = $("video").length > 0;
  const hasYouTubeEmbed = $('iframe[src*="youtube"], iframe[src*="youtu.be"]').length > 0;
  const hasVimeoEmbed = $('iframe[src*="vimeo"]').length > 0;
  const hasWistiaEmbed = $('script[src*="wistia"], [class*="wistia"]').length > 0;
  const hasVideoSchema = html.includes('"@type":"VideoObject"') || html.includes('"@type": "VideoObject"');
  const hasVideo = hasVideoElement || hasYouTubeEmbed || hasVimeoEmbed || hasWistiaEmbed;
  if (hasVideo) {
    signals.push("Video content present");
    if (hasVideoSchema) {
      signals.push("VideoObject schema present");
    }
    const videoContextSelectors = [
      ".video-demo",
      ".product-video",
      ".review-video",
      ".tutorial-video",
      '[class*="demo"]',
      '[class*="walkthrough"]',
      '[class*="how-to"]'
    ];
    for (const selector of videoContextSelectors) {
      if ($(selector).length > 0) {
        signals.push("Demonstration/tutorial video present");
        break;
      }
    }
    const videoTitles = $("video, iframe").map((_, el) => {
      return $(el).attr("title") || $(el).attr("aria-label") || "";
    }).get().join(" ").toLowerCase();
    if (/review|test|demo|hands-on|unboxing|how-to|tutorial/.test(videoTitles)) {
      signals.push("Experience-based video content");
    }
  }
  if ($('[class*="video-testimonial"], [class*="video-review"]').length > 0) {
    signals.push("Video testimonials present");
  }
  return { hasVideo, signals };
}
function extractContentDates(html) {
  const $ = cheerio25.load(html);
  let published = null;
  let modified = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "");
      const checkDates = (obj) => {
        published = published || obj.datePublished || null;
        modified = modified || obj.dateModified || null;
      };
      if (Array.isArray(data)) {
        data.forEach(checkDates);
      } else {
        checkDates(data);
      }
    } catch {
    }
  });
  published = published || $('meta[property="article:published_time"]').attr("content") || null;
  modified = modified || $('meta[property="article:modified_time"]').attr("content") || null;
  if (!published) {
    const timeEl = $("time[datetime]").first();
    published = timeEl.attr("datetime") || null;
  }
  return { published, modified };
}
function detectYMYL(html, url) {
  const $ = cheerio25.load(html);
  const text = ($("title").text() + " " + $("h1").text() + " " + $("body").text()).toLowerCase();
  for (const pattern of YMYL_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  const urlLower = url.toLowerCase();
  if (urlLower.includes("/health") || urlLower.includes("/finance") || urlLower.includes("/legal") || urlLower.includes("/medical") || urlLower.includes("/money")) {
    return true;
  }
  return false;
}
function analyzeEEATSignals(html, url) {
  const issues = [];
  const author = extractAuthorInfo(html);
  const organization = extractOrganizationInfo(html);
  const reviewer = extractReviewerInfo(html);
  const trustBadges = extractTrustBadges(html);
  const experienceSignals = detectExperienceSignals(html);
  const expertiseSignals = detectExpertiseSignals(html);
  const citations = analyzeCitations(html);
  const contentDate = extractContentDates(html);
  const videoExperience = detectVideoExperienceSignals(html);
  const isYMYL = detectYMYL(html, url);
  const authoritySignals = [];
  if (organization.hasSchema)
    authoritySignals.push("Organization schema present");
  if (author.hasSchema)
    authoritySignals.push("Author schema present");
  if (citations.authoritativeSources.length > 0) {
    authoritySignals.push(`Citations to ${citations.authoritativeSources.length} authoritative sources`);
  }
  const trustSignals = [];
  if (organization.hasContactInfo)
    trustSignals.push("Contact information present");
  if (organization.trustBadges.length > 0) {
    trustSignals.push(`Trust badges: ${organization.trustBadges.join(", ")}`);
  }
  if (url.startsWith("https://"))
    trustSignals.push("HTTPS enabled");
  if (isYMYL) {
    if (!author.name && !author.hasSchema) {
      issues.push({
        code: "YMYL_NO_AUTHOR",
        severity: "warning",
        category: "content",
        title: "YMYL content without author information",
        description: "This appears to be YMYL (Your Money Your Life) content but has no visible author.",
        impact: "Google prioritizes E-E-A-T signals heavily for YMYL topics.",
        howToFix: "Add author byline with credentials, bio, and author schema.",
        affectedUrls: [url]
      });
    }
    if (author.credentials.length === 0 && expertiseSignals.length === 0) {
      issues.push({
        code: "YMYL_NO_EXPERTISE",
        severity: "warning",
        category: "content",
        title: "YMYL content without expertise signals",
        description: "YMYL content lacks visible expertise indicators (credentials, qualifications).",
        impact: "Expertise is crucial for YMYL content ranking.",
        howToFix: 'Include author credentials, "reviewed by" statements, or cite expert sources.',
        affectedUrls: [url]
      });
    }
    if (citations.authoritativeSources.length === 0) {
      issues.push({
        code: "YMYL_NO_CITATIONS",
        severity: "warning",
        category: "content",
        title: "YMYL content without authoritative citations",
        description: "YMYL content has no links to authoritative sources (.gov, .edu, etc.).",
        impact: "Citing authoritative sources builds trust for sensitive topics.",
        howToFix: "Add citations to government, academic, or recognized industry sources.",
        affectedUrls: [url]
      });
    }
  }
  if (!author.name && !organization.name) {
    issues.push({
      code: "NO_ENTITY_IDENTIFIED",
      severity: "notice",
      category: "content",
      title: "No author or organization identified",
      description: "Page lacks clear attribution to an author or organization.",
      impact: "Anonymous content may be seen as less trustworthy.",
      howToFix: "Add author byline or organization information with structured data.",
      affectedUrls: [url]
    });
  }
  if (!organization.hasSchema) {
    issues.push({
      code: "NO_ORGANIZATION_SCHEMA",
      severity: "notice",
      category: "structured-data",
      title: "Missing Organization schema",
      description: "No Organization structured data found.",
      impact: "Missed opportunity to establish organizational identity for E-E-A-T.",
      howToFix: "Add Organization schema with name, logo, contact, and social profiles.",
      affectedUrls: [url]
    });
  }
  if (!author.hasSchema && author.name) {
    issues.push({
      code: "AUTHOR_NO_SCHEMA",
      severity: "notice",
      category: "structured-data",
      title: "Author without Person schema",
      description: "Author name is present but no Person structured data.",
      impact: "Person schema helps Google understand author entity relationships.",
      howToFix: "Add Person schema with sameAs links to author profiles.",
      affectedUrls: [url]
    });
  }
  if (!contentDate.modified && contentDate.published) {
    issues.push({
      code: "NO_MODIFIED_DATE",
      severity: "notice",
      category: "content",
      title: "No content modification date",
      description: "Content has published date but no last-modified date.",
      impact: "Modified dates signal content freshness to search engines.",
      howToFix: "Add article:modified_time meta tag or dateModified in schema.",
      affectedUrls: [url]
    });
  }
  if (experienceSignals.length === 0 && !isYMYL) {
    issues.push({
      code: "NO_EXPERIENCE_SIGNALS",
      severity: "notice",
      category: "content",
      title: "No first-hand experience signals detected",
      description: "Content lacks indicators of personal/first-hand experience.",
      impact: 'The "Experience" in E-E-A-T values authentic, first-hand knowledge.',
      howToFix: "Add personal insights, original photos, or hands-on testing details.",
      affectedUrls: [url]
    });
  }
  if (isYMYL && !reviewer.hasReviewer) {
    const $ = cheerio25.load(html);
    const isHealthContent = /health|medical|disease|symptom|treatment/i.test($("title").text() + $("h1").text());
    if (isHealthContent) {
      issues.push({
        code: "YMYL_NO_MEDICAL_REVIEWER",
        severity: "warning",
        category: "content",
        title: "Health content without medical reviewer",
        description: 'Health-related content lacks "medically reviewed by" or expert reviewer information.',
        impact: "Google strongly prefers health content reviewed by qualified medical professionals.",
        howToFix: 'Add "Medically reviewed by [Name, Credentials]" with reviewer bio and review date.',
        affectedUrls: [url]
      });
    }
  }
  if (reviewer.hasReviewer && !reviewer.reviewDate) {
    issues.push({
      code: "REVIEWER_NO_DATE",
      severity: "notice",
      category: "content",
      title: "Reviewer present but no review date",
      description: "Content shows a reviewer but does not display when the review was conducted.",
      impact: "Review dates help establish content freshness and credibility.",
      howToFix: 'Add "Last reviewed: [Date]" near the reviewer attribution.',
      affectedUrls: [url]
    });
  }
  const isCommercial = /buy|price|shop|product|service/i.test(html);
  if (isCommercial && trustBadges.pressFeatures.length === 0 && trustBadges.certifications.length === 0) {
    issues.push({
      code: "COMMERCIAL_NO_TRUST_BADGES",
      severity: "notice",
      category: "content",
      title: "Commercial content without trust signals",
      description: 'Product/service page lacks "As seen in", certifications, or trust badges.',
      impact: "Trust badges and press features build credibility and influence AI recommendations.",
      howToFix: 'Add "As seen in [Press]" logos, certifications, or customer testimonials with ratings.',
      affectedUrls: [url]
    });
  }
  const isReviewContent = /review|comparison|best|top \d+/i.test(html);
  if (isReviewContent && !videoExperience.hasVideo) {
    issues.push({
      code: "REVIEW_NO_VIDEO",
      severity: "notice",
      category: "content",
      title: "Review content without video",
      description: "Product review or comparison content lacks video demonstrations.",
      impact: "Video content signals first-hand experience, highly valued by Google and AI tools.",
      howToFix: "Add hands-on video reviews showing actual product testing and demonstration.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      author,
      organization,
      reviewer,
      trustBadges,
      experienceSignals: [...experienceSignals, ...videoExperience.signals],
      expertiseSignals,
      authoritySignals,
      trustSignals,
      citationCount: citations.count,
      authoritativeSources: citations.authoritativeSources,
      contentDate,
      hasVideoContent: videoExperience.hasVideo,
      videoExperienceSignals: videoExperience.signals,
      isYMYL
    }
  };
}

// src/audit/checks/indexnow.ts
import * as cheerio26 from "https://esm.sh/cheerio@1.0.0";
async function checkRobotsTxtForIndexNow(baseUrl) {
  try {
    const response = await httpGet(`${new URL(baseUrl).origin}/robots.txt`, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status !== 200) {
      return { found: false, key: null };
    }
    const content = response.data;
    const indexNowPattern = /indexnow[:\s]+([a-f0-9-]+)/i;
    const match = content.match(indexNowPattern);
    if (match) {
      return { found: true, key: match[1] };
    }
    return { found: false, key: null };
  } catch {
    return { found: false, key: null };
  }
}
function isValidIndexNowKey(key) {
  if (key.length < 8 || key.length > 128)
    return false;
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key)) {
    return true;
  }
  if (/^[a-f0-9]{32}$/i.test(key)) {
    return true;
  }
  if (/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
    return true;
  }
  return false;
}
async function findIndexNowKeyFile(baseUrl, possibleKeys) {
  const origin = new URL(baseUrl).origin;
  for (const key of possibleKeys) {
    if (!isValidIndexNowKey(key))
      continue;
    const keyUrl = `${origin}/${key}.txt`;
    try {
      const response = await httpGet(keyUrl, {
        timeout: 5e3,
        validateStatus: () => true
      });
      if (response.status === 200) {
        const content = response.data.trim();
        if (content === key) {
          return { found: true, url: keyUrl, key };
        }
      }
    } catch {
    }
  }
  return { found: false, url: null, key: null };
}
function checkIndexNowLinkTag(html) {
  const $ = cheerio26.load(html);
  const indexNowLink = $('link[rel="indexnow"]').attr("href") || $('link[rel="index-now"]').attr("href") || $('meta[name="indexnow-key"]').attr("content") || null;
  return { found: !!indexNowLink, href: indexNowLink };
}
function detectIndexNowCMSSupport(html, headers) {
  const $ = cheerio26.load(html);
  const isWordPress = html.includes("wp-content") || html.includes("wp-includes") || $('meta[name="generator"][content*="WordPress"]').length > 0;
  if (isWordPress) {
    if (html.includes("yoast-seo") || html.includes("wordpress-seo")) {
      return "WordPress + Yoast SEO (may have IndexNow)";
    }
    if (html.includes("rank-math") || html.includes("rankmath")) {
      return "WordPress + Rank Math (has IndexNow)";
    }
    return "WordPress (IndexNow plugins available)";
  }
  if (html.includes("wix.com") || html.includes("_wix_browser_sess")) {
    return "Wix (IndexNow built-in)";
  }
  if (headers["cf-ray"] || headers["server"]?.includes("cloudflare")) {
    return "Cloudflare (IndexNow integration available)";
  }
  return null;
}
async function analyzeIndexNow(html, url, headers = {}) {
  const issues = [];
  const origin = new URL(url).origin;
  const linkTag = checkIndexNowLinkTag(html);
  const robotsCheck = await checkRobotsTxtForIndexNow(url);
  const possibleKeys = [];
  if (linkTag.href)
    possibleKeys.push(linkTag.href);
  if (robotsCheck.key)
    possibleKeys.push(robotsCheck.key);
  const keyFile = await findIndexNowKeyFile(url, possibleKeys);
  const cmsPlugin = detectIndexNowCMSSupport(html, headers);
  const data = {
    hasKey: keyFile.found,
    keyFileUrl: keyFile.url,
    keyValue: keyFile.key,
    keyValid: keyFile.key ? isValidIndexNowKey(keyFile.key) : false,
    hasLinkTag: linkTag.found,
    inRobotsTxt: robotsCheck.found,
    cmsPlugin
  };
  if (!keyFile.found && !linkTag.found && !robotsCheck.found) {
    const suggestion = cmsPlugin ? `Your platform (${cmsPlugin}) may support IndexNow. Check for built-in support or plugins.` : "Create a key at indexnow.org, add the key file to your root directory, and submit URLs via the IndexNow API.";
    issues.push({
      code: "INDEXNOW_NOT_IMPLEMENTED",
      severity: "notice",
      category: "crawlability",
      title: "IndexNow not implemented",
      description: "Site does not appear to have IndexNow instant indexing set up.",
      impact: "Content changes may take longer to appear in Bing, Yandex, and other IndexNow-supporting search engines.",
      howToFix: suggestion,
      affectedUrls: [url],
      details: { cmsPlugin }
    });
  } else if (keyFile.found && !data.keyValid) {
    issues.push({
      code: "INDEXNOW_INVALID_KEY",
      severity: "warning",
      category: "crawlability",
      title: "IndexNow key format invalid",
      description: `The IndexNow key "${keyFile.key}" does not match expected formats.`,
      impact: "IndexNow submissions may fail with invalid key format.",
      howToFix: "Use a valid key format: 32-character hex or UUID format.",
      affectedUrls: [keyFile.url || url]
    });
  }
  if (keyFile.found && data.keyValid) {
  }
  return { issues, data };
}

// src/audit/checks/content-science.ts
import * as cheerio27 from "https://esm.sh/cheerio@1.0.0";
function analyzeZipfDistribution(html) {
  const $ = cheerio27.load(html);
  $("script, style, nav, footer, header").remove();
  const text = $("body").text().toLowerCase();
  const words = text.match(/\b[a-z]{3,}\b/g) || [];
  if (words.length < 100) {
    return {
      alpha: 1,
      isNatural: true,
      rSquared: 0,
      stuffedKeywords: [],
      missingMidTail: []
    };
  }
  const freq = /* @__PURE__ */ new Map();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  const topWords = sorted.slice(0, Math.min(100, sorted.length));
  const logRanks = topWords.map((_, i) => Math.log(i + 1));
  const logFreqs = topWords.map(([_, f]) => Math.log(f));
  const { slope, intercept, rSquared } = linearRegression(logRanks, logFreqs);
  const alpha = -slope;
  const stuffedKeywords = [];
  const expectedC = Math.exp(intercept);
  for (let i = 0; i < topWords.length; i++) {
    const [word, actualFreq] = topWords[i];
    const expectedFreq = expectedC * Math.pow(i + 1, -alpha);
    const deviation = (actualFreq - expectedFreq) / expectedFreq;
    if (deviation > 0.5 && word.length > 4 && i > 5) {
      stuffedKeywords.push({ word, deviation: Math.round(deviation * 100) });
    }
  }
  const missingMidTail = [];
  for (let i = 20; i < Math.min(50, topWords.length); i++) {
    const [word, actualFreq] = topWords[i];
    const expectedFreq = expectedC * Math.pow(i + 1, -alpha);
    const deviation = (actualFreq - expectedFreq) / expectedFreq;
    if (deviation < -0.3) {
      missingMidTail.push(word);
    }
  }
  return {
    alpha,
    isNatural: alpha >= 0.8 && alpha <= 1.2 && rSquared > 0.85,
    rSquared,
    stuffedKeywords: stuffedKeywords.slice(0, 10),
    missingMidTail: missingMidTail.slice(0, 5)
  };
}
function analyzeEntropy(html) {
  const $ = cheerio27.load(html);
  $("script, style, nav, footer, header").remove();
  const text = $("body").text().toLowerCase();
  const words = text.match(/\b[a-z]{2,}\b/g) || [];
  if (words.length < 50) {
    return {
      wordEntropy: 0,
      normalizedEntropy: 0,
      vocabularyRichness: 0,
      repetitionScore: 1,
      bigramEntropy: 0,
      qualityIndicator: "poor"
    };
  }
  const wordFreq = /* @__PURE__ */ new Map();
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }
  const bigramFreq = /* @__PURE__ */ new Map();
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    bigramFreq.set(bigram, (bigramFreq.get(bigram) || 0) + 1);
  }
  const wordEntropy = calculateShannonEntropy(wordFreq, words.length);
  const bigramEntropy = calculateShannonEntropy(bigramFreq, words.length - 1);
  const maxEntropy = Math.log2(wordFreq.size);
  const normalizedEntropy = maxEntropy > 0 ? wordEntropy / maxEntropy : 0;
  const vocabularyRichness = wordFreq.size / words.length;
  const repetitionScore = 1 - normalizedEntropy;
  let qualityIndicator;
  if (normalizedEntropy > 0.85 && vocabularyRichness > 0.4) {
    qualityIndicator = "excellent";
  } else if (normalizedEntropy > 0.75 && vocabularyRichness > 0.3) {
    qualityIndicator = "good";
  } else if (normalizedEntropy > 0.6 && vocabularyRichness > 0.2) {
    qualityIndicator = "average";
  } else {
    qualityIndicator = "poor";
  }
  return {
    wordEntropy,
    normalizedEntropy,
    vocabularyRichness,
    repetitionScore,
    bigramEntropy,
    qualityIndicator
  };
}
function calculateShannonEntropy(freq, total) {
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}
function calculateBM25(html, keywords, avgDocLength = 1500, k1 = 1.5, b = 0.75) {
  const $ = cheerio27.load(html);
  $("script, style").remove();
  const text = $("body").text().toLowerCase();
  const words = text.match(/\b[a-z]+\b/g) || [];
  const docLength = words.length;
  const results = [];
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    const keywordWords = keywordLower.split(/\s+/);
    let tf;
    if (keywordWords.length > 1) {
      const regex = new RegExp(keywordLower.replace(/\s+/g, "\\s+"), "gi");
      tf = (text.match(regex) || []).length;
    } else {
      tf = words.filter((w) => w === keywordLower).length;
    }
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
    const score = numerator / denominator;
    const nextTF = tf + 1;
    const nextScore = nextTF * (k1 + 1) / (nextTF + k1 * (1 - b + b * (docLength / avgDocLength)));
    const marginalGain = (nextScore - score) / (score || 1);
    const saturationPoint = marginalGain < 0.1;
    const lengthPenalty = b * (docLength / avgDocLength - 1);
    let recommendation;
    if (tf === 0) {
      recommendation = `Add "${keyword}" to your content`;
    } else if (saturationPoint) {
      recommendation = `Keyword "${keyword}" is saturated (${tf} occurrences). Focus on semantic variations.`;
    } else if (lengthPenalty > 0.3) {
      recommendation = `Content is ${Math.round(lengthPenalty * 100)}% longer than average. Consider tightening.`;
    } else if (tf < 3) {
      recommendation = `Consider adding 1-2 more natural mentions of "${keyword}"`;
    } else {
      recommendation = `Good keyword presence for "${keyword}"`;
    }
    results.push({
      keyword,
      score: Math.round(score * 100) / 100,
      termFrequency: tf,
      saturationPoint,
      lengthPenalty: Math.round(lengthPenalty * 100) / 100,
      recommendation
    });
  }
  return results;
}
function linearRegression(x, y) {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
    sumYY += y[i] * y[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * x[i] + intercept;
    ssRes += (y[i] - predicted) ** 2;
    ssTot += (y[i] - yMean) ** 2;
  }
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  return { slope, intercept, rSquared };
}
function analyzeContentScience(html, url, targetKeywords = []) {
  const issues = [];
  const zipf = analyzeZipfDistribution(html);
  if (!zipf.isNatural && zipf.stuffedKeywords.length > 0) {
    issues.push({
      code: "ZIPF_KEYWORD_STUFFING",
      severity: "warning",
      category: "content",
      title: "Unnatural keyword distribution detected",
      description: `Content deviates from natural language patterns (Zipf \u03B1=${zipf.alpha.toFixed(2)}, expected ~1.0). Possible keyword stuffing detected.`,
      impact: "Search engines can detect unnatural text patterns, potentially triggering spam filters.",
      howToFix: `Reduce repetition of: ${zipf.stuffedKeywords.map((k) => `"${k.word}" (+${k.deviation}%)`).join(", ")}`,
      affectedUrls: [url],
      details: {
        alpha: zipf.alpha,
        rSquared: zipf.rSquared,
        stuffedKeywords: zipf.stuffedKeywords
      }
    });
  }
  const entropy = analyzeEntropy(html);
  if (entropy.qualityIndicator === "poor") {
    issues.push({
      code: "LOW_CONTENT_ENTROPY",
      severity: "warning",
      category: "content",
      title: "Low vocabulary diversity (thin content signal)",
      description: `Content entropy is low (${entropy.normalizedEntropy.toFixed(2)}). This indicates repetitive or thin content.`,
      impact: "Low diversity content may be seen as low-quality by search engines.",
      howToFix: "Expand vocabulary, add more unique insights, and reduce repetitive phrases.",
      affectedUrls: [url],
      details: {
        normalizedEntropy: entropy.normalizedEntropy,
        vocabularyRichness: entropy.vocabularyRichness,
        repetitionScore: entropy.repetitionScore
      }
    });
  }
  if (entropy.repetitionScore > 0.7) {
    issues.push({
      code: "HIGH_CONTENT_REPETITION",
      severity: "notice",
      category: "content",
      title: "High content repetition detected",
      description: `Content shows ${Math.round(entropy.repetitionScore * 100)}% repetition pattern.`,
      impact: "Highly repetitive content provides less value and may hurt engagement.",
      howToFix: "Vary your vocabulary and sentence structures. Avoid repeating the same phrases.",
      affectedUrls: [url]
    });
  }
  const bm25 = targetKeywords.length > 0 ? calculateBM25(html, targetKeywords) : [];
  for (const result of bm25) {
    if (result.termFrequency === 0) {
      issues.push({
        code: "BM25_KEYWORD_MISSING",
        severity: "warning",
        category: "on-page",
        title: `Target keyword "${result.keyword}" not found`,
        description: "This keyword is not present in your content at all.",
        impact: "Page unlikely to rank for this keyword without any mention of it.",
        howToFix: `Add natural mentions of "${result.keyword}" in your content.`,
        affectedUrls: [url],
        details: { keyword: result.keyword, bm25Score: 0 }
      });
    } else if (result.saturationPoint && result.termFrequency > 10) {
      issues.push({
        code: "BM25_KEYWORD_SATURATED",
        severity: "notice",
        category: "on-page",
        title: `Keyword "${result.keyword}" over-optimized`,
        description: `Found ${result.termFrequency} times. Additional mentions provide diminishing returns.`,
        impact: "Over-optimization can trigger spam signals.",
        howToFix: "Use semantic variations and related terms instead of exact repetition.",
        affectedUrls: [url],
        details: { keyword: result.keyword, termFrequency: result.termFrequency }
      });
    }
  }
  let overallQuality;
  const qualityScore = (zipf.isNatural ? 30 : 0) + (entropy.qualityIndicator === "excellent" ? 40 : entropy.qualityIndicator === "good" ? 30 : entropy.qualityIndicator === "average" ? 20 : 0) + bm25.filter((b) => b.termFrequency > 0 && !b.saturationPoint).length / Math.max(bm25.length, 1) * 30;
  if (qualityScore >= 80) {
    overallQuality = "excellent";
  } else if (qualityScore >= 60) {
    overallQuality = "good";
  } else if (qualityScore >= 40) {
    overallQuality = "needs-work";
  } else {
    overallQuality = "poor";
  }
  return {
    issues,
    data: {
      zipf,
      entropy,
      bm25,
      overallQuality
    }
  };
}

// src/audit/checks/site-maturity.ts
import * as cheerio28 from "https://esm.sh/cheerio@1.0.0";
async function getSSLCertificateAge(url) {
  let https;
  try {
    https = await import("https");
  } catch {
    return null;
  }
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const options = {
        host: parsedUrl.hostname,
        port: 443,
        method: "GET",
        rejectUnauthorized: false
        // Accept self-signed for checking
      };
      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate?.();
        if (cert && cert.valid_from) {
          const validFrom = new Date(cert.valid_from);
          const now = /* @__PURE__ */ new Date();
          const ageDays = Math.floor((now.getTime() - validFrom.getTime()) / (1e3 * 60 * 60 * 24));
          resolve(ageDays);
        } else {
          resolve(null);
        }
      });
      req.on("error", () => resolve(null));
      req.setTimeout(5e3, () => {
        req.destroy();
        resolve(null);
      });
      req.end();
    } catch {
      resolve(null);
    }
  });
}
async function checkWaybackMachine(domain) {
  try {
    const response = await httpGet(
      `https://web.archive.org/cdx/search/cdx?url=${domain}&output=json&limit=1&from=1990`,
      {
        timeout: 1e4,
        validateStatus: () => true
      }
    );
    if (response.status === 200 && Array.isArray(response.data) && response.data.length > 1) {
      const timestamp = response.data[1]?.[1];
      if (timestamp) {
        const year = parseInt(timestamp.substring(0, 4));
        const month = parseInt(timestamp.substring(4, 6)) - 1;
        const day = parseInt(timestamp.substring(6, 8));
        return { firstSeen: new Date(year, month, day), snapshots: response.data.length - 1 };
      }
    }
    return { firstSeen: null, snapshots: 0 };
  } catch {
    return { firstSeen: null, snapshots: 0 };
  }
}
async function estimateIndexedPages(url) {
  const origin = new URL(url).origin;
  try {
    const sitemapUrls = [
      `${origin}/sitemap.xml`,
      `${origin}/sitemap_index.xml`,
      `${origin}/sitemap-index.xml`
    ];
    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await httpGet(sitemapUrl, {
          timeout: 1e4,
          validateStatus: () => true
        });
        if (response.status === 200) {
          const $ = cheerio28.load(response.data, { xmlMode: true });
          const sitemaps = $("sitemap").length;
          if (sitemaps > 0) {
            return sitemaps * 500;
          }
          const urls = $("url").length;
          if (urls > 0) {
            return urls;
          }
        }
      } catch {
      }
    }
    return 0;
  } catch {
    return 0;
  }
}
function analyzeHTMLMaturitySignals(html, url) {
  const $ = cheerio28.load(html);
  const text = $("body").text().toLowerCase();
  const htmlLower = html.toLowerCase();
  const hasBlog = $('a[href*="/blog"]').length > 0 || $('a[href*="/posts"]').length > 0 || $('a[href*="/articles"]').length > 0 || htmlLower.includes("/blog") || $('[class*="blog"]').length > 0;
  const contentIndicators = [];
  if (hasBlog)
    contentIndicators.push("blog");
  if ($('a[href*="/products"], [class*="product"]').length > 0)
    contentIndicators.push("products");
  if ($('a[href*="/services"], [class*="service"]').length > 0)
    contentIndicators.push("services");
  if ($('a[href*="/portfolio"], [class*="portfolio"]').length > 0)
    contentIndicators.push("portfolio");
  if ($('a[href*="/case-stud"], [class*="case"]').length > 0)
    contentIndicators.push("case-studies");
  if ($('a[href*="/testimonial"], [class*="testimonial"]').length > 0)
    contentIndicators.push("testimonials");
  if ($('a[href*="/resource"], [class*="resource"]').length > 0)
    contentIndicators.push("resources");
  const hasMultipleContentTypes = contentIndicators.length >= 3;
  const hasEstablishedBrand = (
    // Social proof
    $('[class*="trust"], [class*="partner"], [class*="client"]').length > 0 || // Press/media mentions
    text.includes("featured in") || text.includes("as seen") || text.includes("trusted by") || // Awards/certifications
    text.includes("award") || text.includes("certified") || // Copyright with year range
    /©\s*\d{4}\s*-\s*\d{4}/.test(text) || // Multiple social links
    $('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="facebook.com"]').length >= 2
  );
  return {
    hasBlog,
    hasMultipleContentTypes,
    hasEstablishedBrand,
    contentIndicators
  };
}
function determineStrategy(maturity, authorityIndicators, contentMetrics) {
  const recommendations = [];
  if (maturity === "new") {
    recommendations.push(
      "\u{1F3AF} PRIORITY: Build site authority before creating more content",
      "\u{1F4DD} Create ONE exceptional linkable asset (ultimate guide, original research, tool)",
      "\u{1F517} Focus 80% of effort on link acquisition to your best page",
      "\u23F3 Wait until you have 10+ quality backlinks before content expansion",
      "\u274C AVOID: Publishing lots of content that won't rank without authority"
    );
    return { strategy: "authority-first", recommendations };
  }
  if (maturity === "growing") {
    if (contentMetrics.contentToAuthorityRatio === "content-heavy") {
      recommendations.push(
        "\u26A0\uFE0F Content-to-authority imbalance detected",
        "\u{1F517} Pause content creation and focus on link building",
        "\u{1F4CA} Your content won't rank well without more domain authority",
        "\u{1F3AF} Build 20-50 quality backlinks before adding more pages",
        '\u{1F4A1} Consider "Reverse Silo": Drive links to content assets, then internal link to money pages'
      );
      return { strategy: "authority-first", recommendations };
    }
    recommendations.push(
      "\u{1F680} You're in the growth phase - balance content and links",
      "\u{1F4DD} Create pillar content around 3-5 main topics",
      "\u{1F517} Build 5-10 quality backlinks per month",
      "\u{1F3D7}\uFE0F Establish topic clusters with internal linking",
      "\u{1F4C8} Monitor rankings - optimize pages stuck on page 2"
    );
    return { strategy: "content-expansion", recommendations };
  }
  if (maturity === "established") {
    recommendations.push(
      "\u2705 Site has established authority - focus on optimization",
      "\u{1F50D} Audit existing content for improvement opportunities",
      "\u{1F4CA} Use data to find underperforming pages to refresh",
      "\u{1F3AF} Target more competitive keywords",
      "\u{1F4BC} Consider merger technique: Acquire relevant expired domains",
      "\u{1F517} Focus on earning links naturally through quality content"
    );
    return { strategy: "optimization", recommendations };
  }
  recommendations.push(
    "\u{1F451} Mature site - maintain and defend rankings",
    "\u{1F504} Regularly refresh top-performing content",
    "\u{1F6E1}\uFE0F Monitor for ranking drops and algorithm impacts",
    "\u{1F4C8} Expand into adjacent topics and markets",
    "\u{1F3C6} Focus on brand building and E-E-A-T signals",
    "\u26A1 Optimize for Core Web Vitals and user experience"
  );
  return { strategy: "maintenance", recommendations };
}
async function analyzeSiteMaturity(html, url) {
  const issues = [];
  const domain = new URL(url).hostname;
  const [sslAge, wayback, indexedPages] = await Promise.all([
    getSSLCertificateAge(url),
    checkWaybackMachine(domain),
    estimateIndexedPages(url)
  ]);
  const htmlSignals = analyzeHTMLMaturitySignals(html, url);
  let estimatedAgeDays = null;
  let ageSource = "estimated";
  let ageConfidence = "low";
  if (wayback.firstSeen) {
    estimatedAgeDays = Math.floor((Date.now() - wayback.firstSeen.getTime()) / (1e3 * 60 * 60 * 24));
    ageSource = "wayback";
    ageConfidence = wayback.snapshots > 10 ? "high" : "medium";
  } else if (sslAge !== null && sslAge > 0) {
    estimatedAgeDays = sslAge;
    ageSource = "ssl";
    ageConfidence = "low";
  }
  let maturityLevel;
  if (estimatedAgeDays === null || estimatedAgeDays < 90) {
    maturityLevel = "new";
  } else if (estimatedAgeDays < 365) {
    maturityLevel = "growing";
  } else if (estimatedAgeDays < 730) {
    maturityLevel = "established";
  } else {
    maturityLevel = "mature";
  }
  if (htmlSignals.hasEstablishedBrand && indexedPages > 100) {
    if (maturityLevel === "new")
      maturityLevel = "growing";
    if (maturityLevel === "growing")
      maturityLevel = "established";
  }
  const authorityIndicators = {
    hasBacklinks: wayback.snapshots > 5,
    // Rough proxy
    estimatedBacklinks: wayback.snapshots * 2,
    // Very rough estimate
    hasIndexedPages: indexedPages > 0,
    indexedPagesEstimate: indexedPages,
    hasBrandMentions: htmlSignals.hasEstablishedBrand,
    sslAge
  };
  const contentToAuthorityRatio = indexedPages > 50 && !authorityIndicators.hasBacklinks ? "content-heavy" : indexedPages < 10 && authorityIndicators.hasBacklinks ? "authority-heavy" : "balanced";
  const contentMetrics = {
    pageCount: indexedPages,
    hasMultipleContentTypes: htmlSignals.hasMultipleContentTypes,
    hasBlog: htmlSignals.hasBlog,
    contentToAuthorityRatio
  };
  const { strategy, recommendations } = determineStrategy(maturityLevel, authorityIndicators, contentMetrics);
  if (maturityLevel === "new") {
    issues.push({
      code: "NEW_SITE_STRATEGY",
      severity: "notice",
      category: "content",
      title: "New website detected - Authority-first strategy recommended",
      description: "Your site appears to be new (<90 days). Standard SEO advice won't work well for new sites.",
      impact: "Creating lots of content without authority is wasted effort. Content from new sites rarely ranks.",
      howToFix: "Focus on building 10+ quality backlinks to ONE great page before expanding content. See strategic recommendations.",
      affectedUrls: [url],
      details: {
        estimatedAge: estimatedAgeDays,
        recommendedStrategy: strategy,
        recommendations
      }
    });
  }
  if (contentToAuthorityRatio === "content-heavy") {
    issues.push({
      code: "CONTENT_AUTHORITY_IMBALANCE",
      severity: "warning",
      category: "content",
      title: "Content-to-authority imbalance",
      description: `Site has ~${indexedPages} pages but limited backlink signals. Content is unlikely to rank.`,
      impact: "Most of your content may be invisible to search engines due to low domain authority.",
      howToFix: "Stop publishing new content. Focus 100% on link building until you see ranking improvements.",
      affectedUrls: [url],
      details: {
        indexedPages,
        contentToAuthorityRatio,
        maturityLevel
      }
    });
  }
  if (maturityLevel === "growing" && !htmlSignals.hasBlog) {
    issues.push({
      code: "GROWING_SITE_NO_BLOG",
      severity: "notice",
      category: "content",
      title: "Growing site without blog/content hub",
      description: "Site is in growth phase but lacks a blog or content section.",
      impact: "Blog content is essential for attracting backlinks and building topical authority.",
      howToFix: "Create a blog section with linkable content assets (guides, research, tools).",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      estimatedAge: {
        days: estimatedAgeDays,
        source: ageSource,
        confidence: ageConfidence
      },
      maturityLevel,
      authorityIndicators,
      contentMetrics,
      recommendedStrategy: strategy,
      strategicRecommendations: recommendations
    }
  };
}

// src/audit/checks/keyword-cannibalization.ts
import * as cheerio29 from "https://esm.sh/cheerio@1.0.0";
function extractPageKeywords(html, url) {
  const $ = cheerio29.load(html);
  const title = $("title").text().trim() || "";
  const h1s = [];
  $("h1").each((_, el) => {
    h1s.push($(el).text().trim());
  });
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || "";
  $("script, style, nav, footer, header").remove();
  const bodyText = $("body").text().toLowerCase();
  const words = bodyText.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3);
  const wordCount = /* @__PURE__ */ new Map();
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }
  const totalWords = words.length;
  const keywordDensity = /* @__PURE__ */ new Map();
  for (const [word, count] of wordCount) {
    keywordDensity.set(word, count / totalWords);
  }
  const titleWords = title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3);
  const h1Words = h1s.join(" ").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3);
  const primaryKeywords = [];
  const seen = /* @__PURE__ */ new Set();
  for (const word of titleWords) {
    if (h1Words.includes(word) && !seen.has(word)) {
      primaryKeywords.push(word);
      seen.add(word);
    }
  }
  for (const word of titleWords) {
    const density = keywordDensity.get(word) || 0;
    if (density > 0.01 && !seen.has(word)) {
      primaryKeywords.push(word);
      seen.add(word);
    }
  }
  return {
    url,
    title,
    h1: h1s,
    metaDescription,
    primaryKeywords,
    keywordDensity
  };
}
function analyzeKeywordCannibalizationSinglePage(html, url) {
  const issues = [];
  const pageData = extractPageKeywords(html, url);
  if (pageData.h1.length > 1) {
    const h1Texts = pageData.h1.map((h) => h.toLowerCase().trim());
    const uniqueH1s = new Set(h1Texts);
    if (uniqueH1s.size < h1Texts.length) {
      issues.push({
        code: "INTERNAL_CANNIBALIZATION_SIGNAL",
        severity: "warning",
        category: "content",
        title: "Duplicate H1 tags on page",
        description: `Page has ${h1Texts.length} H1 tags with duplicates, which can dilute keyword focus.`,
        impact: "Multiple similar H1s can confuse search engines about page topic.",
        howToFix: "Use a single, unique H1 that clearly defines the page topic.",
        affectedUrls: [url],
        details: { h1s: pageData.h1 }
      });
    }
  }
  const titleKeywords = new Set(
    pageData.title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3)
  );
  const h1Keywords = new Set(
    pageData.h1.join(" ").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3)
  );
  const intersection = new Set([...titleKeywords].filter((x) => h1Keywords.has(x)));
  if (titleKeywords.size > 0 && h1Keywords.size > 0 && intersection.size === 0) {
    issues.push({
      code: "TITLE_H1_KEYWORD_MISMATCH",
      severity: "warning",
      category: "on-page",
      title: "Title and H1 target different keywords",
      description: "The title tag and H1 heading have no overlapping keywords.",
      impact: "Search engines may be confused about the primary topic of the page.",
      howToFix: "Align title and H1 to target the same primary keyword or topic.",
      affectedUrls: [url],
      details: {
        titleKeywords: [...titleKeywords],
        h1Keywords: [...h1Keywords]
      }
    });
  }
  return { issues, data: pageData };
}

// src/audit/checks/tracker-bloat.ts
import * as cheerio30 from "https://esm.sh/cheerio@1.0.0";
var KNOWN_TRACKERS = [
  // Analytics
  { name: "Google Analytics (GA4)", domain: "googletagmanager.com", type: "analytics", impact: "medium" },
  { name: "Google Analytics (Universal)", domain: "google-analytics.com", type: "analytics", impact: "medium" },
  { name: "Google Tag Manager", domain: "googletagmanager.com", type: "analytics", impact: "medium" },
  { name: "Segment", domain: "segment.com", type: "analytics", impact: "medium" },
  { name: "Mixpanel", domain: "mixpanel.com", type: "analytics", impact: "medium" },
  { name: "Amplitude", domain: "amplitude.com", type: "analytics", impact: "medium" },
  { name: "Heap", domain: "heap.io", type: "analytics", impact: "medium" },
  { name: "Plausible", domain: "plausible.io", type: "analytics", impact: "low" },
  { name: "Fathom", domain: "usefathom.com", type: "analytics", impact: "low" },
  { name: "Simple Analytics", domain: "simpleanalytics.com", type: "analytics", impact: "low" },
  { name: "PostHog", domain: "posthog.com", type: "analytics", impact: "medium" },
  // Advertising pixels
  { name: "Facebook Pixel", domain: "connect.facebook.net", type: "advertising", impact: "high" },
  { name: "Meta Pixel", domain: "facebook.com/tr", type: "advertising", impact: "high" },
  { name: "TikTok Pixel", domain: "analytics.tiktok.com", type: "advertising", impact: "high" },
  { name: "Twitter/X Pixel", domain: "static.ads-twitter.com", type: "advertising", impact: "high" },
  { name: "LinkedIn Insight", domain: "snap.licdn.com", type: "advertising", impact: "high" },
  { name: "Pinterest Tag", domain: "pintrk", type: "advertising", impact: "high" },
  { name: "Snapchat Pixel", domain: "sc-static.net", type: "advertising", impact: "high" },
  { name: "Google Ads", domain: "googleadservices.com", type: "advertising", impact: "high" },
  { name: "Google Ads Conversion", domain: "googleads.g.doubleclick.net", type: "advertising", impact: "high" },
  { name: "Microsoft/Bing Ads", domain: "bat.bing.com", type: "advertising", impact: "high" },
  { name: "Criteo", domain: "criteo.com", type: "advertising", impact: "high" },
  { name: "Taboola", domain: "taboola.com", type: "advertising", impact: "high" },
  { name: "Outbrain", domain: "outbrain.com", type: "advertising", impact: "high" },
  // Marketing automation
  { name: "HubSpot", domain: "js.hs-scripts.com", type: "marketing", impact: "high" },
  { name: "HubSpot Analytics", domain: "js.hs-analytics.net", type: "marketing", impact: "high" },
  { name: "Marketo", domain: "munchkin.marketo.net", type: "marketing", impact: "high" },
  { name: "Pardot", domain: "pardot.com", type: "marketing", impact: "high" },
  { name: "ActiveCampaign", domain: "trackcmp.net", type: "marketing", impact: "medium" },
  { name: "Klaviyo", domain: "klaviyo.com", type: "marketing", impact: "medium" },
  { name: "Mailchimp", domain: "chimpstatic.com", type: "marketing", impact: "medium" },
  { name: "Drip", domain: "getdrip.com", type: "marketing", impact: "medium" },
  // Heatmaps & Session Recording
  { name: "Hotjar", domain: "hotjar.com", type: "heatmap", impact: "high" },
  { name: "Crazy Egg", domain: "crazyegg.com", type: "heatmap", impact: "high" },
  { name: "FullStory", domain: "fullstory.com", type: "heatmap", impact: "high" },
  { name: "Lucky Orange", domain: "luckyorange.com", type: "heatmap", impact: "high" },
  { name: "Mouseflow", domain: "mouseflow.com", type: "heatmap", impact: "high" },
  { name: "Clarity", domain: "clarity.ms", type: "heatmap", impact: "medium" },
  { name: "LogRocket", domain: "logrocket.com", type: "heatmap", impact: "high" },
  // Chat widgets
  { name: "Intercom", domain: "intercom.io", type: "chat", impact: "high" },
  { name: "Drift", domain: "drift.com", type: "chat", impact: "high" },
  { name: "Zendesk Chat", domain: "zopim.com", type: "chat", impact: "high" },
  { name: "Crisp", domain: "crisp.chat", type: "chat", impact: "medium" },
  { name: "Tidio", domain: "tidio.co", type: "chat", impact: "medium" },
  { name: "LiveChat", domain: "livechatinc.com", type: "chat", impact: "high" },
  { name: "Freshchat", domain: "freshchat.com", type: "chat", impact: "high" },
  // Social widgets
  { name: "Twitter Widget", domain: "platform.twitter.com", type: "social", impact: "medium" },
  { name: "Facebook SDK", domain: "connect.facebook.net/en_US/sdk.js", type: "social", impact: "high" },
  { name: "Instagram Embed", domain: "instagram.com/embed.js", type: "social", impact: "medium" },
  { name: "LinkedIn Badge", domain: "platform.linkedin.com", type: "social", impact: "medium" },
  { name: "AddThis", domain: "addthis.com", type: "social", impact: "high" },
  { name: "ShareThis", domain: "sharethis.com", type: "social", impact: "high" },
  // Other
  { name: "Cloudflare Web Analytics", domain: "cloudflareinsights.com", type: "analytics", impact: "low" },
  { name: "Sentry", domain: "sentry.io", type: "other", impact: "low" },
  { name: "DataDog RUM", domain: "datadoghq.com", type: "other", impact: "medium" },
  { name: "New Relic", domain: "newrelic.com", type: "other", impact: "medium" },
  { name: "Optimizely", domain: "optimizely.com", type: "other", impact: "high" },
  { name: "VWO", domain: "visualwebsiteoptimizer.com", type: "other", impact: "high" },
  { name: "Google Optimize", domain: "googleoptimize.com", type: "other", impact: "medium" }
];
function detectTrackers(html) {
  const $ = cheerio30.load(html);
  const trackers = [];
  const scripts = $("script");
  scripts.each((_, el) => {
    const $script = $(el);
    const src = $script.attr("src") || "";
    const inlineContent = $script.html() || "";
    if (src) {
      const tracker = identifyTracker(src);
      if (tracker) {
        trackers.push({
          ...tracker,
          scriptUrl: src,
          loadMethod: $script.attr("async") !== void 0 ? "async" : $script.attr("defer") !== void 0 ? "defer" : "sync"
        });
      }
    }
    if (inlineContent) {
      const inlineTrackers = identifyInlineTrackers(inlineContent);
      trackers.push(...inlineTrackers);
    }
  });
  $("img[src], iframe[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    const tracker = identifyTracker(src);
    if (tracker) {
      trackers.push({
        ...tracker,
        scriptUrl: src,
        loadMethod: "sync"
      });
    }
  });
  const uniqueTrackers = Array.from(
    new Map(trackers.map((t) => [t.name, t])).values()
  );
  const byType = {};
  const byImpact = {};
  for (const tracker of uniqueTrackers) {
    byType[tracker.type] = (byType[tracker.type] || 0) + 1;
    byImpact[tracker.impact] = (byImpact[tracker.impact] || 0) + 1;
  }
  const impactScore = calculateImpactScore(uniqueTrackers);
  const recommendations = generateRecommendations(uniqueTrackers, byType);
  return {
    trackers: uniqueTrackers,
    totalCount: uniqueTrackers.length,
    byType,
    byImpact,
    estimatedImpactScore: impactScore,
    recommendations
  };
}
function identifyTracker(url) {
  const urlLower = url.toLowerCase();
  for (const tracker of KNOWN_TRACKERS) {
    if (urlLower.includes(tracker.domain.toLowerCase())) {
      return tracker;
    }
  }
  return null;
}
function identifyInlineTrackers(content) {
  const trackers = [];
  const contentLower = content.toLowerCase();
  if (contentLower.includes("fbq(") || contentLower.includes("facebook-jssdk")) {
    trackers.push({
      name: "Facebook Pixel (inline)",
      domain: "facebook.com",
      type: "advertising",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("gtag(") && contentLower.includes("config")) {
    trackers.push({
      name: "Google Analytics (inline)",
      domain: "google-analytics.com",
      type: "analytics",
      impact: "medium",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("ttq.") || contentLower.includes("tiktok")) {
    trackers.push({
      name: "TikTok Pixel (inline)",
      domain: "tiktok.com",
      type: "advertising",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("_linkedin_partner_id") || contentLower.includes("linkedin")) {
    trackers.push({
      name: "LinkedIn Insight (inline)",
      domain: "linkedin.com",
      type: "advertising",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("hotjar") || contentLower.includes("hjid")) {
    trackers.push({
      name: "Hotjar (inline)",
      domain: "hotjar.com",
      type: "heatmap",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("intercom") && contentLower.includes("app_id")) {
    trackers.push({
      name: "Intercom (inline)",
      domain: "intercom.io",
      type: "chat",
      impact: "high",
      loadMethod: "inline"
    });
  }
  if (contentLower.includes("_hsq") || contentLower.includes("hubspot")) {
    trackers.push({
      name: "HubSpot (inline)",
      domain: "hubspot.com",
      type: "marketing",
      impact: "high",
      loadMethod: "inline"
    });
  }
  return trackers;
}
function calculateImpactScore(trackers) {
  let score = 0;
  for (const tracker of trackers) {
    const baseImpact = tracker.impact === "high" ? 15 : tracker.impact === "medium" ? 8 : 3;
    const loadPenalty = tracker.loadMethod === "sync" ? 1.5 : tracker.loadMethod === "inline" ? 1.2 : 1;
    score += baseImpact * loadPenalty;
  }
  return Math.min(100, Math.round(score));
}
function generateRecommendations(trackers, byType) {
  const recommendations = [];
  if (trackers.length > 5) {
    recommendations.push(
      `Reduce tracker count from ${trackers.length} to 5 or fewer for better page speed`
    );
  }
  if ((byType.advertising || 0) > 2) {
    recommendations.push(
      `Consider consolidating ${byType.advertising} advertising pixels - each one significantly impacts First Input Delay`
    );
  }
  if ((byType.analytics || 0) > 1) {
    recommendations.push(
      `You have ${byType.analytics} analytics tools - consider using just one comprehensive solution`
    );
  }
  if ((byType.heatmap || 0) > 0) {
    recommendations.push(
      `Session recording tools (${byType.heatmap} found) significantly impact performance - use sparingly and only on specific pages`
    );
  }
  if ((byType.chat || 0) > 1) {
    recommendations.push(
      `Multiple chat widgets detected (${byType.chat}) - consolidate to one solution`
    );
  }
  const syncTrackers = trackers.filter((t) => t.loadMethod === "sync");
  if (syncTrackers.length > 0) {
    recommendations.push(
      `${syncTrackers.length} tracker(s) loaded synchronously - add async/defer to improve page load`
    );
  }
  const heavyAnalytics = trackers.filter(
    (t) => t.type === "analytics" && t.impact !== "low"
  );
  if (heavyAnalytics.length > 0 && !trackers.some((t) => t.impact === "low")) {
    recommendations.push(
      "Consider privacy-friendly, lightweight analytics like Plausible, Fathom, or Simple Analytics"
    );
  }
  return recommendations;
}
function analyzeTrackerBloat(html, url) {
  const issues = [];
  const analysis = detectTrackers(html);
  if (analysis.totalCount > 8) {
    issues.push({
      code: "EXCESSIVE_TRACKERS",
      severity: "error",
      category: "performance",
      title: `Excessive third-party trackers (${analysis.totalCount} detected)`,
      description: `Found ${analysis.totalCount} third-party trackers/scripts. Each one adds to page weight and processing time.`,
      impact: `Estimated ${analysis.estimatedImpactScore}% negative impact on Core Web Vitals (First Input Delay, LCP).`,
      howToFix: "Audit your trackers and remove any that are not providing value. Consolidate analytics tools and limit advertising pixels.",
      affectedUrls: [url],
      details: {
        trackers: analysis.trackers.map((t) => t.name),
        byType: analysis.byType,
        impactScore: analysis.estimatedImpactScore
      }
    });
  } else if (analysis.totalCount > 5) {
    issues.push({
      code: "MANY_TRACKERS",
      severity: "warning",
      category: "performance",
      title: `Many third-party trackers (${analysis.totalCount} detected)`,
      description: `Found ${analysis.totalCount} third-party trackers. This may be impacting page performance.`,
      impact: `Estimated ${analysis.estimatedImpactScore}% negative impact on page interactivity.`,
      howToFix: "Review tracker necessity and consider removing underused ones. Prioritize essential analytics and business tools.",
      affectedUrls: [url],
      details: {
        trackers: analysis.trackers.map((t) => t.name),
        byType: analysis.byType
      }
    });
  }
  const syncHighImpact = analysis.trackers.filter(
    (t) => t.loadMethod === "sync" && t.impact === "high"
  );
  if (syncHighImpact.length > 0) {
    issues.push({
      code: "SYNC_TRACKER_LOADING",
      severity: "warning",
      category: "performance",
      title: `High-impact trackers loading synchronously`,
      description: `${syncHighImpact.length} high-impact tracker(s) are loading synchronously, blocking page rendering.`,
      impact: "Synchronous scripts block the parser and significantly delay First Contentful Paint.",
      howToFix: "Add async or defer attributes to tracker scripts, or load them after user interaction.",
      affectedUrls: [url],
      details: {
        scripts: syncHighImpact.map((t) => t.name)
      }
    });
  }
  if ((analysis.byType.heatmap || 0) > 1) {
    issues.push({
      code: "MULTIPLE_SESSION_RECORDERS",
      severity: "warning",
      category: "performance",
      title: `Multiple session recording tools detected`,
      description: `Found ${analysis.byType.heatmap} session recording/heatmap tools. These are among the heaviest trackers.`,
      impact: "Session recorders capture every user interaction and can add 100-500ms to page load time each.",
      howToFix: "Use only one session recording tool, and consider enabling it only for specific pages or user segments.",
      affectedUrls: [url],
      details: {
        tools: analysis.trackers.filter((t) => t.type === "heatmap").map((t) => t.name)
      }
    });
  }
  if ((analysis.byType.advertising || 0) > 3) {
    issues.push({
      code: "TOO_MANY_AD_PIXELS",
      severity: "warning",
      category: "performance",
      title: `Too many advertising pixels (${analysis.byType.advertising} found)`,
      description: `Found ${analysis.byType.advertising} advertising/conversion pixels. Each one makes network requests and runs JavaScript.`,
      impact: "Ad pixels are often the heaviest trackers. More than 3 can add 1-2 seconds to page load time.",
      howToFix: "Consolidate pixels using a tag manager with server-side tracking, or prioritize only your most important ad platforms.",
      affectedUrls: [url],
      details: {
        pixels: analysis.trackers.filter((t) => t.type === "advertising").map((t) => t.name)
      }
    });
  }
  return { issues, data: analysis };
}

// src/audit/checks/client-rendering.ts
import * as cheerio31 from "https://esm.sh/cheerio@1.0.0";
var FRAMEWORK_PATTERNS = {
  "Next.js": [/__NEXT_DATA__/, /next\//, /_next\//],
  "Nuxt": [/__NUXT__/, /nuxt/, /_nuxt\//],
  "Gatsby": [/___gatsby/, /gatsby-/, /gatsby-image/],
  "Remix": [/__remix/, /remix/],
  "SvelteKit": [/__sveltekit/, /svelte/],
  "Angular Universal": [/ng-version/, /angular/],
  "React": [/react-root/, /data-reactroot/, /__REACT/],
  "Vue": [/data-v-/, /Vue\./, /__VUE/],
  "Astro": [/astro-/, /astro:/]
};
var META_MANAGEMENT_PATTERNS = [
  { name: "React Helmet", pattern: /data-react-helmet/i },
  { name: "Next.js Head", pattern: /__NEXT_DATA__.*"head"/i },
  { name: "Vue Meta", pattern: /data-vue-meta/i },
  { name: "Nuxt Head", pattern: /__NUXT__.*"head"/i },
  { name: "Remix Meta", pattern: /__remix_meta/i }
];
var CSR_INDICATORS = [
  // Empty root elements waiting for JS to populate
  { pattern: /<div id="root"><\/div>/i, weight: 3 },
  { pattern: /<div id="app"><\/div>/i, weight: 3 },
  { pattern: /<div id="__next"><\/div>/i, weight: 2 },
  // Empty Next.js (should have content)
  { pattern: /<div id="__nuxt"><\/div>/i, weight: 2 },
  // Empty Nuxt
  { pattern: /<main><\/main>/i, weight: 2 },
  { pattern: /<article><\/article>/i, weight: 2 },
  // Noscript warnings indicating JS dependency
  { pattern: /<noscript>.*(?:enable|require|need).*javascript/i, weight: 3 },
  { pattern: /<noscript>.*(?:won't work|doesn't work)/i, weight: 3 },
  // Very minimal HTML body
  { pattern: /<body[^>]*>\s*<(?:div|script)[^>]*>\s*<\/(?:div|script)>\s*<\/body>/i, weight: 4 },
  // Loading spinners/states in initial HTML
  { pattern: /class="[^"]*loading[^"]*"/i, weight: 1 },
  { pattern: /Loading\.\.\./i, weight: 1 },
  // Client-only component indicators
  { pattern: /data-client-only/i, weight: 2 },
  { pattern: /client:only/i, weight: 2 }
  // Astro client:only
];
var SSR_INDICATORS = [
  // Hydration markers (content was rendered server-side)
  { pattern: /__NEXT_DATA__/, weight: 3 },
  { pattern: /__NUXT__/, weight: 3 },
  { pattern: /data-reactroot/, weight: 2 },
  { pattern: /data-server-rendered/, weight: 3 },
  // Pre-rendered content indicators
  { pattern: /<h1[^>]*>[^<]+<\/h1>/i, weight: 2 },
  { pattern: /<article[^>]*>[^<]{100,}/i, weight: 3 },
  { pattern: /<main[^>]*>[^<]{100,}/i, weight: 3 },
  // Meta content (usually server-rendered)
  { pattern: /<meta property="og:title"[^>]*content="[^"]+"/, weight: 1 },
  { pattern: /<meta name="description"[^>]*content="[^"]+"/, weight: 1 },
  // Structured data
  { pattern: /<script type="application\/ld\+json">/, weight: 2 }
];
function detectFramework(html) {
  for (const [framework, patterns] of Object.entries(FRAMEWORK_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(html)) {
        return framework;
      }
    }
  }
  return null;
}
function analyzeRendering(html) {
  const $ = cheerio31.load(html);
  const signals = [];
  const frameworkDetected = detectFramework(html);
  let csrScore = 0;
  for (const indicator of CSR_INDICATORS) {
    if (indicator.pattern.test(html)) {
      csrScore += indicator.weight;
      signals.push({
        indicator: indicator.pattern.toString(),
        suggests: "csr",
        weight: indicator.weight
      });
    }
  }
  let ssrScore = 0;
  for (const indicator of SSR_INDICATORS) {
    if (indicator.pattern.test(html)) {
      ssrScore += indicator.weight;
      signals.push({
        indicator: indicator.pattern.toString(),
        suggests: "ssr",
        weight: indicator.weight
      });
    }
  }
  const mainContent = $('main, article, [role="main"], .content, #content').text();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const mainContentCharCount = mainContent.length || bodyText.length;
  const hasContentInHTML = mainContentCharCount > 200;
  if (!hasContentInHTML) {
    csrScore += 4;
    signals.push({
      indicator: `Body text only ${mainContentCharCount} chars`,
      suggests: "csr",
      weight: 4
    });
  } else {
    ssrScore += 2;
  }
  const hasHydrationMarkers = /__NEXT_DATA__|__NUXT__|data-reactroot|data-server-rendered/.test(html);
  const hasClientOnlyIndicators = $("[data-client-only], [client\\:only]").length > 0;
  let metaManagement = null;
  for (const { name, pattern } of META_MANAGEMENT_PATTERNS) {
    if (pattern.test(html)) {
      metaManagement = name;
      break;
    }
  }
  const hasDynamicMetaTags = metaManagement !== null || $("meta[data-react-helmet]").length > 0 || $("meta[data-vue-meta]").length > 0;
  const hasH1 = $("h1").length > 0 && $("h1").text().trim().length > 0;
  const hasH2 = $("h2").length > 0;
  const hasMain = $('main, [role="main"]').length > 0;
  const hasArticle = $("article").length > 0;
  const hasSemanticStructure = hasH1 && (hasMain || hasArticle);
  const title = $("title").text().trim();
  const h1Text = $("h1").first().text().trim();
  const firstParagraph = $("p").first().text().trim();
  const keyContentInHTML = title.length > 10 && h1Text.length > 5 && firstParagraph.length > 50;
  const EXPECTED_MIN_CONTENT = 1e3;
  const htmlContentRatio = Math.min(100, mainContentCharCount / EXPECTED_MIN_CONTENT * 100);
  let aiReadableScore = 50;
  if (mainContentCharCount > 2e3)
    aiReadableScore += 20;
  else if (mainContentCharCount > 1e3)
    aiReadableScore += 15;
  else if (mainContentCharCount > 500)
    aiReadableScore += 10;
  else if (mainContentCharCount < 200)
    aiReadableScore -= 20;
  if (hasSemanticStructure)
    aiReadableScore += 15;
  if (hasH1 && hasH2)
    aiReadableScore += 5;
  if (keyContentInHTML)
    aiReadableScore += 15;
  else
    aiReadableScore -= 10;
  if (hasHydrationMarkers || ssrScore > csrScore)
    aiReadableScore += 10;
  if (csrScore > ssrScore + 3)
    aiReadableScore -= 20;
  aiReadableScore = Math.max(0, Math.min(100, aiReadableScore));
  const aiAccessibility = {
    htmlContentRatio: Math.round(htmlContentRatio),
    hasSemanticStructure,
    keyContentInHTML,
    aiReadableScore
  };
  let renderingMethod;
  let confidence;
  if (csrScore > ssrScore + 3) {
    renderingMethod = "csr";
    confidence = csrScore - ssrScore > 6 ? "high" : "medium";
  } else if (ssrScore > csrScore + 3) {
    const isLikelyStatic = html.includes("data-gatsby") || html.includes("astro-") || !html.includes("__NEXT_DATA__") && !html.includes("__NUXT__");
    renderingMethod = isLikelyStatic ? "ssg" : "ssr";
    confidence = ssrScore - csrScore > 6 ? "high" : "medium";
  } else if (hasHydrationMarkers && hasClientOnlyIndicators) {
    renderingMethod = "hybrid";
    confidence = "medium";
  } else {
    renderingMethod = "unknown";
    confidence = "low";
  }
  const recommendations = generateRecommendations2(
    renderingMethod,
    hasContentInHTML,
    mainContentCharCount,
    frameworkDetected
  );
  return {
    renderingMethod,
    confidence,
    signals,
    frameworkDetected,
    hasContentInHTML,
    hasHydrationMarkers,
    hasClientOnlyIndicators,
    mainContentCharCount,
    recommendations,
    metaManagement,
    hasDynamicMetaTags,
    aiAccessibility
  };
}
function generateRecommendations2(renderingMethod, hasContentInHTML, charCount, framework) {
  const recommendations = [];
  if (renderingMethod === "csr") {
    recommendations.push(
      "Critical: Pre-render your pages so crawlers see actual content in the HTML"
    );
    if (framework === "React") {
      recommendations.push(
        'Quick fix: Add react-snap to pre-render pages at build time (npm install -D react-snap, add "postbuild": "react-snap" to scripts)'
      );
      recommendations.push(
        "Alternative: Use Vike (vite-plugin-ssr) for SSR/SSG without changing frameworks"
      );
    } else if (framework === "Vue") {
      recommendations.push(
        "Quick fix: Add prerender-spa-plugin to pre-render pages at build time"
      );
      recommendations.push(
        "Alternative: Use Vike (vite-plugin-ssr) for SSR/SSG without changing frameworks"
      );
    } else if (framework === "Angular Universal") {
      recommendations.push(
        "Enable Angular Universal for server-side rendering"
      );
    } else {
      recommendations.push(
        "Quick fix: Use a pre-rendering tool like react-snap or prerender-spa-plugin"
      );
    }
    recommendations.push(
      "Google can render JavaScript, but pre-rendered HTML is more reliable and faster to index"
    );
  }
  if (!hasContentInHTML) {
    recommendations.push(
      `Very little content in initial HTML (${charCount} chars). Search engines may not see your content.`
    );
  }
  if (renderingMethod === "hybrid") {
    recommendations.push(
      "Hybrid rendering detected. Ensure critical SEO content is server-rendered, not client-only."
    );
  }
  return recommendations;
}
function analyzeClientRendering(html, url) {
  const $ = cheerio31.load(html);
  const issues = [];
  const analysis = analyzeRendering(html);
  if (analysis.renderingMethod === "csr" && analysis.confidence !== "low") {
    const howToFixByFramework = analysis.frameworkDetected === "React" ? 'Add react-snap to pre-render pages: npm install -D react-snap, then add "postbuild": "react-snap" to package.json scripts. No code changes needed.' : analysis.frameworkDetected === "Vue" ? "Add prerender-spa-plugin to pre-render pages at build time. Alternatively, use Vike for SSR/SSG." : "Pre-render your pages using react-snap, prerender-spa-plugin, or similar build-time tools.";
    issues.push({
      code: "CLIENT_SIDE_RENDERING",
      severity: "error",
      category: "crawlability",
      title: "Page relies on client-side rendering",
      description: "This page appears to render content primarily via JavaScript. Search engines may not see your content.",
      impact: "Google can execute JavaScript but it's slower and less reliable. Content may not be indexed properly.",
      howToFix: howToFixByFramework,
      affectedUrls: [url],
      details: {
        confidence: analysis.confidence,
        framework: analysis.frameworkDetected,
        signals: analysis.signals.filter((s) => s.suggests === "csr").slice(0, 5)
      }
    });
  }
  if (!analysis.hasContentInHTML) {
    issues.push({
      code: "EMPTY_BODY_CONTENT",
      severity: "error",
      category: "content",
      title: "Very little content in initial HTML",
      description: `Only ${analysis.mainContentCharCount} characters of text found in the HTML. Content may be loaded via JavaScript.`,
      impact: "Search engines prioritize content in the initial HTML response. JavaScript-loaded content may be missed or delayed.",
      howToFix: "Ensure main page content is present in the server-rendered HTML, not loaded via JavaScript after page load.",
      affectedUrls: [url],
      details: {
        charCount: analysis.mainContentCharCount,
        renderingMethod: analysis.renderingMethod
      }
    });
  }
  if (analysis.frameworkDetected && ["React", "Vue"].includes(analysis.frameworkDetected) && !analysis.hasHydrationMarkers && analysis.mainContentCharCount < 500) {
    issues.push({
      code: "SPA_WITHOUT_SSR",
      severity: "warning",
      category: "crawlability",
      title: `${analysis.frameworkDetected} detected without SSR markers`,
      description: `This appears to be a ${analysis.frameworkDetected} SPA without server-side rendering enabled.`,
      impact: "Single Page Applications without SSR have slower time-to-content for search crawlers.",
      howToFix: analysis.frameworkDetected === "React" ? "Quick fix: Add react-snap (npm install -D react-snap) to pre-render at build time. Alternative: Use Vike for SSR/SSG." : "Quick fix: Add prerender-spa-plugin to pre-render at build time. Alternative: Use Vike for SSR/SSG.",
      affectedUrls: [url],
      details: {
        framework: analysis.frameworkDetected,
        hasHydrationMarkers: analysis.hasHydrationMarkers
      }
    });
  }
  if (analysis.renderingMethod === "ssr" && analysis.confidence !== "low") {
  }
  if (analysis.frameworkDetected && ["React", "Vue"].includes(analysis.frameworkDetected) && !analysis.hasDynamicMetaTags && analysis.renderingMethod !== "csr") {
    const helmetLib = analysis.frameworkDetected === "React" ? "React Helmet" : "Vue Meta";
    const metaTagsPresent = $('meta[name="description"], meta[property="og:title"]').length > 0;
    if (!metaTagsPresent) {
      issues.push({
        code: "SPA_NO_META_MANAGEMENT",
        severity: "warning",
        category: "on-page",
        title: `${analysis.frameworkDetected} app may lack dynamic meta tag management`,
        description: `No ${helmetLib} or similar library detected for managing meta tags in this SPA.`,
        impact: "SPAs need dynamic meta tag management for proper page-specific titles, descriptions, and social tags.",
        howToFix: analysis.frameworkDetected === "React" ? "Use React Helmet, Next.js Head, or Remix meta exports for dynamic meta tags." : "Use Vue Meta, Nuxt Head, or vue-head for dynamic meta tags.",
        affectedUrls: [url],
        details: {
          framework: analysis.frameworkDetected,
          metaManagement: analysis.metaManagement
        }
      });
    }
  }
  if (analysis.aiAccessibility.aiReadableScore < 50) {
    issues.push({
      code: "AI_LOW_HTML_READABILITY",
      severity: "warning",
      category: "ai-readiness",
      title: "Content not optimally accessible to AI systems",
      description: `AI readability score: ${analysis.aiAccessibility.aiReadableScore}/100. AI systems like ChatGPT primarily read raw HTML and may miss JavaScript-rendered content.`,
      impact: "Content may not be properly indexed by AI search systems (ChatGPT, Perplexity, etc.), reducing AI citation likelihood.",
      howToFix: "Ensure key content is in the initial HTML response: 1) Use SSR/SSG, 2) Include title, H1, and main content in HTML, 3) Don't hide content behind JavaScript interactions.",
      affectedUrls: [url],
      details: {
        aiReadableScore: analysis.aiAccessibility.aiReadableScore,
        htmlContentRatio: analysis.aiAccessibility.htmlContentRatio,
        hasSemanticStructure: analysis.aiAccessibility.hasSemanticStructure,
        keyContentInHTML: analysis.aiAccessibility.keyContentInHTML
      }
    });
  }
  if (!analysis.aiAccessibility.hasSemanticStructure && analysis.mainContentCharCount > 500) {
    issues.push({
      code: "AI_NO_SEMANTIC_STRUCTURE",
      severity: "notice",
      category: "ai-readiness",
      title: "Content lacks semantic HTML structure for AI parsing",
      description: "Missing semantic landmarks (<main>, <article>) or heading hierarchy. AI systems use these to identify and extract key content.",
      impact: "AI may not correctly identify the main content area, potentially extracting navigation or footer text instead.",
      howToFix: "Add semantic HTML: wrap main content in <main> or <article>, ensure H1 exists and heading hierarchy is logical (H1 \u2192 H2 \u2192 H3).",
      affectedUrls: [url]
    });
  }
  if (!analysis.aiAccessibility.keyContentInHTML && analysis.renderingMethod !== "csr") {
    issues.push({
      code: "AI_KEY_CONTENT_NOT_IN_HTML",
      severity: "warning",
      category: "ai-readiness",
      title: "Key content elements missing from initial HTML",
      description: "Title, H1, or opening paragraph content is missing or too short in the HTML. AI systems extract these first.",
      impact: "AI may not have access to your primary message, reducing chances of accurate citation.",
      howToFix: "Ensure the initial HTML contains: meaningful <title>, descriptive <h1>, and a substantial first paragraph with your key message.",
      affectedUrls: [url],
      details: {
        hasTitle: $("title").text().trim().length > 10,
        hasH1: $("h1").text().trim().length > 5,
        hasFirstParagraph: $("p").first().text().trim().length > 50
      }
    });
  }
  return { issues, data: analysis };
}

// src/audit/checks/redirect-chain.ts
var MAX_REDIRECTS = 10;
async function traceRedirectChain(url, options = {}) {
  const hops = [];
  let currentUrl = url;
  let chainLength = 0;
  let totalTime = 0;
  const visitedUrls = /* @__PURE__ */ new Set();
  const timeout = options.timeout || 1e4;
  while (chainLength < MAX_REDIRECTS) {
    if (visitedUrls.has(currentUrl)) {
      break;
    }
    visitedUrls.add(currentUrl);
    try {
      const startTime = Date.now();
      const response = await httpGet(currentUrl, {
        timeout,
        maxRedirects: 0,
        // Don't auto-follow, we want to trace manually
        validateStatus: () => true
        // Accept all status codes
      });
      const responseTime = Date.now() - startTime;
      totalTime += responseTime;
      const statusCode = response.status;
      const locationHeader = response.headers.location;
      let redirectTo = null;
      if (locationHeader) {
        try {
          redirectTo = new URL(locationHeader, currentUrl).toString();
        } catch {
          redirectTo = locationHeader;
        }
      }
      hops.push({
        url: currentUrl,
        statusCode,
        statusText: response.statusText || getStatusText(statusCode),
        redirectTo,
        responseTime
      });
      if (statusCode >= 300 && statusCode < 400 && redirectTo) {
        chainLength++;
        currentUrl = redirectTo;
      } else {
        break;
      }
    } catch (error) {
      hops.push({
        url: currentUrl,
        statusCode: 0,
        statusText: error instanceof Error ? error.message : "Network error",
        redirectTo: null,
        responseTime: 0
      });
      break;
    }
  }
  const finalUrl = hops.length > 0 ? hops[hops.length - 1].url : url;
  const issues = analyzeChainIssues(url, hops);
  return {
    originalUrl: url,
    finalUrl,
    hops,
    chainLength: hops.length - 1,
    // Number of redirects (not including final destination)
    totalTime,
    hasHttpsUpgrade: detectHttpsUpgrade(hops),
    hasWwwNormalization: detectWwwNormalization(hops),
    hasTrailingSlashIssue: detectTrailingSlashIssue(hops),
    isInternalLoop: visitedUrls.size !== hops.length,
    issues
  };
}
function getStatusText(code) {
  const statusTexts = {
    200: "OK",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    404: "Not Found",
    500: "Internal Server Error"
  };
  return statusTexts[code] || "Unknown";
}
function detectHttpsUpgrade(hops) {
  for (let i = 0; i < hops.length - 1; i++) {
    const current = hops[i].url;
    const next = hops[i].redirectTo;
    if (current.startsWith("http://") && next?.startsWith("https://")) {
      return true;
    }
  }
  return false;
}
function detectWwwNormalization(hops) {
  for (let i = 0; i < hops.length - 1; i++) {
    const currentHost = extractHost(hops[i].url);
    const nextHost = hops[i].redirectTo ? extractHost(hops[i].redirectTo) : null;
    if (currentHost && nextHost) {
      const hasWwwChange = currentHost.startsWith("www.") && !nextHost.startsWith("www.") || !currentHost.startsWith("www.") && nextHost.startsWith("www.");
      if (hasWwwChange) {
        return true;
      }
    }
  }
  return false;
}
function detectTrailingSlashIssue(hops) {
  for (let i = 0; i < hops.length - 1; i++) {
    const current = new URL(hops[i].url);
    const next = hops[i].redirectTo ? new URL(hops[i].redirectTo) : null;
    if (next && current.pathname !== next.pathname) {
      const pathDiff = current.pathname.endsWith("/") && !next.pathname.endsWith("/") || !current.pathname.endsWith("/") && next.pathname.endsWith("/");
      const normalizedCurrent = current.pathname.replace(/\/$/, "");
      const normalizedNext = next.pathname.replace(/\/$/, "");
      if (pathDiff && normalizedCurrent === normalizedNext) {
        return true;
      }
    }
  }
  return false;
}
function extractHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
function analyzeChainIssues(originalUrl, hops) {
  const issues = [];
  const redirectCount = hops.filter((h) => h.statusCode >= 300 && h.statusCode < 400).length;
  if (redirectCount > 1) {
    issues.push(`Redirect chain detected: ${redirectCount} hops`);
  }
  const has301 = hops.some((h) => h.statusCode === 301 || h.statusCode === 308);
  const has302 = hops.some((h) => h.statusCode === 302 || h.statusCode === 307);
  if (has301 && has302) {
    issues.push("Mixed permanent and temporary redirects");
  }
  const uses302 = hops.some((h) => h.statusCode === 302);
  if (uses302 && redirectCount === 1) {
    issues.push("Consider using 301 (permanent) instead of 302 (temporary)");
  }
  for (const hop of hops) {
    if (hop.responseTime > 500) {
      issues.push(`Slow redirect: ${hop.url} took ${hop.responseTime}ms`);
    }
  }
  if (originalUrl.startsWith("http://")) {
    const finalHop = hops[hops.length - 1];
    if (finalHop && !finalHop.url.startsWith("https://")) {
      issues.push("HTTP URL does not redirect to HTTPS");
    }
  }
  const httpAndWwwRedirects = hops.filter(
    (h) => h.statusCode >= 300 && h.statusCode < 400
  );
  if (httpAndWwwRedirects.length > 1) {
    issues.push("Multiple normalizations (consider combining HTTPS + www redirects)");
  }
  return issues;
}
async function analyzeRedirectChain(url) {
  const issues = [];
  const result = await traceRedirectChain(url);
  if (result.isInternalLoop) {
    issues.push({
      code: "REDIRECT_LOOP",
      severity: "error",
      category: "crawlability",
      title: "Redirect loop detected",
      description: "The URL redirects to itself or creates a circular redirect chain.",
      impact: "Search engines cannot index pages with redirect loops. Users will see an error.",
      howToFix: "Review redirect rules and ensure each URL points to a single final destination.",
      affectedUrls: [url],
      details: {
        chain: result.hops.map((h) => h.url)
      }
    });
  }
  if (result.chainLength >= 3) {
    issues.push({
      code: "LONG_REDIRECT_CHAIN",
      severity: "error",
      category: "crawlability",
      title: `Long redirect chain (${result.chainLength} hops)`,
      description: `URL requires ${result.chainLength} redirects before reaching the final destination.`,
      impact: "Long redirect chains slow page load, waste crawl budget, and may lose link equity.",
      howToFix: "Update internal links to point directly to the final URL. Combine redirect rules.",
      affectedUrls: [url],
      details: {
        chain: result.hops.map((h) => ({ url: h.url, status: h.statusCode })),
        totalTime: result.totalTime
      }
    });
  } else if (result.chainLength === 2) {
    issues.push({
      code: "REDIRECT_CHAIN",
      severity: "warning",
      category: "crawlability",
      title: "Redirect chain detected (2 hops)",
      description: "URL has an intermediate redirect before reaching the final destination.",
      impact: "Each redirect adds latency and may dilute link equity slightly.",
      howToFix: "Combine redirects into a single hop from source to final destination.",
      affectedUrls: [url],
      details: {
        chain: result.hops.map((h) => ({ url: h.url, status: h.statusCode }))
      }
    });
  }
  const uses302 = result.hops.some((h) => h.statusCode === 302 || h.statusCode === 307);
  if (uses302 && result.chainLength > 0) {
    issues.push({
      code: "TEMPORARY_REDIRECT",
      severity: "warning",
      category: "crawlability",
      title: "Temporary redirect (302/307) used",
      description: "URL uses a temporary redirect instead of a permanent redirect.",
      impact: "Temporary redirects may not pass full link equity. Use 301/308 for permanent moves.",
      howToFix: "Change 302/307 redirects to 301/308 if the redirect is permanent.",
      affectedUrls: [url],
      details: {
        redirectType: result.hops.find((h) => h.statusCode === 302 || h.statusCode === 307)?.statusCode
      }
    });
  }
  if (result.hasHttpsUpgrade && result.chainLength === 1) {
  }
  if (result.hasWwwNormalization && result.hasHttpsUpgrade && result.chainLength > 1) {
    issues.push({
      code: "INEFFICIENT_NORMALIZATION",
      severity: "notice",
      category: "crawlability",
      title: "Inefficient HTTP/www normalization",
      description: "Multiple redirects for HTTPS upgrade and www normalization that could be combined.",
      impact: "Extra redirect adds unnecessary latency and server load.",
      howToFix: "Configure server to redirect directly from http://domain to https://www.domain (or vice versa) in one hop.",
      affectedUrls: [url]
    });
  }
  if (result.totalTime > 1e3 && result.chainLength > 0) {
    issues.push({
      code: "SLOW_REDIRECTS",
      severity: "notice",
      category: "performance",
      title: `Slow redirect chain (${result.totalTime}ms total)`,
      description: `Redirect chain took ${result.totalTime}ms to complete.`,
      impact: "Slow redirects negatively impact Time to First Byte and user experience.",
      howToFix: "Optimize server response times and reduce redirect chain length.",
      affectedUrls: [url],
      details: {
        totalTime: result.totalTime,
        hops: result.hops.map((h) => ({ url: h.url, time: h.responseTime }))
      }
    });
  }
  return { issues, data: result };
}

// src/audit/checks/responsive-images.ts
import * as cheerio32 from "https://esm.sh/cheerio@1.0.0";
var MODERN_FORMATS2 = [".webp", ".avif"];
function analyzeImage($, img, index) {
  const $img = $(img);
  const issues = [];
  const src = $img.attr("src") || $img.attr("data-src") || "";
  const alt = $img.attr("alt");
  const width = $img.attr("width");
  const height = $img.attr("height");
  const loading = $img.attr("loading");
  const decoding = $img.attr("decoding");
  const srcset = $img.attr("srcset");
  const sizes = $img.attr("sizes");
  const hasExplicitDimensions = !!(width && height || $img.css("width") || $img.css("height") || $img.attr("style")?.includes("width") || $img.attr("style")?.includes("height"));
  const hasResponsiveSrcset = !!(srcset && srcset.includes("w"));
  const srcLower = src.toLowerCase();
  const usesModernFormat = MODERN_FORMATS2.some((fmt) => srcLower.includes(fmt));
  const isInHeader = $img.closest('header, [class*="hero"], [class*="banner"], [class*="jumbotron"]').length > 0;
  const isAboveFold = index < 3 || isInHeader;
  if (!hasExplicitDimensions) {
    issues.push("Missing width/height attributes (causes CLS)");
  }
  if (alt === void 0 || alt === null) {
    issues.push("Missing alt attribute");
  } else if (alt === "") {
  }
  if (!isAboveFold && loading !== "lazy") {
    issues.push("Below-fold image without lazy loading");
  }
  if (isAboveFold && loading === "lazy") {
    issues.push("Above-fold image with lazy loading (delays LCP)");
  }
  if (!hasResponsiveSrcset && src && !srcLower.includes(".svg")) {
    issues.push("No responsive srcset for different screen sizes");
  }
  if (srcset && !sizes) {
    issues.push("Has srcset but missing sizes attribute");
  }
  if (!usesModernFormat && src && !srcLower.includes(".svg")) {
    issues.push("Using legacy image format instead of WebP/AVIF");
  }
  return {
    src,
    alt: alt ?? null,
    width: width ?? null,
    height: height ?? null,
    loading: loading ?? null,
    decoding: decoding ?? null,
    srcset: srcset ?? null,
    sizes: sizes ?? null,
    isAboveFold,
    hasExplicitDimensions,
    hasResponsiveSrcset,
    usesModernFormat,
    issues
  };
}
function analyzePictureElements($) {
  const pictures = $("picture");
  const pictureCount = pictures.length;
  let hasFormatFallbacks = false;
  pictures.each((_, pic) => {
    const sources = $(pic).find("source");
    const hasWebP = sources.filter((_2, s) => {
      const type = $(s).attr("type") || "";
      const srcset = $(s).attr("srcset") || "";
      return type.includes("webp") || srcset.includes(".webp");
    }).length > 0;
    const hasAvif = sources.filter((_2, s) => {
      const type = $(s).attr("type") || "";
      const srcset = $(s).attr("srcset") || "";
      return type.includes("avif") || srcset.includes(".avif");
    }).length > 0;
    if (hasWebP || hasAvif) {
      hasFormatFallbacks = true;
    }
  });
  return {
    hasPictureElements: pictureCount > 0,
    pictureCount,
    hasFormatFallbacks
  };
}
function detectImageCDN(html) {
  const cdnPatterns = [
    { name: "Cloudinary", pattern: /cloudinary\.com|res\.cloudinary/i },
    { name: "imgix", pattern: /imgix\.net/i },
    { name: "Cloudflare Images", pattern: /imagedelivery\.net|cloudflare-images/i },
    { name: "AWS CloudFront", pattern: /cloudfront\.net/i },
    { name: "Fastly", pattern: /fastly\.net/i },
    { name: "ImageKit", pattern: /imagekit\.io|ik\.imagekit/i },
    { name: "Vercel Image Optimization", pattern: /_next\/image/i },
    { name: "Prismic", pattern: /images\.prismic\.io/i },
    { name: "Contentful", pattern: /images\.ctfassets\.net/i },
    { name: "Sanity", pattern: /cdn\.sanity\.io/i },
    { name: "Shopify CDN", pattern: /cdn\.shopify\.com/i },
    { name: "WordPress Jetpack", pattern: /i\d\.wp\.com/i }
  ];
  const detectedCDNs = [];
  for (const { name, pattern } of cdnPatterns) {
    if (pattern.test(html)) {
      detectedCDNs.push(name);
    }
  }
  return {
    detected: detectedCDNs.length > 0,
    cdns: detectedCDNs
  };
}
function analyzeResponsiveImages(html, url) {
  const $ = cheerio32.load(html);
  const issues = [];
  const images = [];
  const imgElements = $("img");
  imgElements.each((index, img) => {
    const analysis = analyzeImage($, img, index);
    images.push(analysis);
  });
  const pictureData = analyzePictureElements($);
  const cdnData = detectImageCDN(html);
  const totalImages = images.length;
  const imagesWithoutDimensions = images.filter((i) => !i.hasExplicitDimensions).length;
  const imagesWithoutLazyLoad = images.filter((i) => !i.isAboveFold && i.loading !== "lazy").length;
  const imagesWithoutSrcset = images.filter((i) => !i.hasResponsiveSrcset && i.src && !i.src.includes(".svg")).length;
  const imagesWithoutAlt = images.filter((i) => i.alt === null).length;
  const modernFormatCount = images.filter((i) => i.usesModernFormat).length;
  const legacyFormatCount = images.filter(
    (i) => !i.usesModernFormat && i.src && !i.src.includes(".svg")
  ).length;
  const recommendations = [];
  if (!cdnData.detected && totalImages > 3) {
    recommendations.push("Consider using an image CDN (Cloudinary, imgix, Vercel) for automatic optimization");
  }
  if (!pictureData.hasPictureElements && legacyFormatCount > 0) {
    recommendations.push("Use <picture> elements with WebP/AVIF sources and JPEG/PNG fallbacks");
  }
  if (imagesWithoutDimensions > 0) {
    recommendations.push("Add width and height attributes to all images to prevent layout shift");
  }
  if (imagesWithoutLazyLoad > 0) {
    recommendations.push('Add loading="lazy" to below-fold images');
  }
  if (imagesWithoutSrcset > 0) {
    recommendations.push("Add srcset with multiple sizes for responsive images");
  }
  if (imagesWithoutDimensions >= 3) {
    issues.push({
      code: "IMAGES_MISSING_DIMENSIONS",
      severity: "error",
      category: "performance",
      title: `${imagesWithoutDimensions} images missing width/height attributes`,
      description: `Found ${imagesWithoutDimensions} images without explicit dimensions.`,
      impact: "Missing dimensions cause Cumulative Layout Shift (CLS) when images load.",
      howToFix: "Add width and height attributes to all <img> tags, even with CSS sizing.",
      affectedUrls: [url],
      details: {
        count: imagesWithoutDimensions,
        images: images.filter((i) => !i.hasExplicitDimensions).slice(0, 5).map((i) => i.src)
      }
    });
  } else if (imagesWithoutDimensions > 0) {
    issues.push({
      code: "IMAGES_MISSING_DIMENSIONS",
      severity: "warning",
      category: "performance",
      title: `${imagesWithoutDimensions} image(s) missing width/height attributes`,
      description: `Found ${imagesWithoutDimensions} images without explicit dimensions.`,
      impact: "Missing dimensions cause Cumulative Layout Shift (CLS) when images load.",
      howToFix: "Add width and height attributes to all <img> tags.",
      affectedUrls: [url],
      details: {
        images: images.filter((i) => !i.hasExplicitDimensions).map((i) => i.src)
      }
    });
  }
  if (imagesWithoutLazyLoad >= 3) {
    issues.push({
      code: "IMAGES_WITHOUT_LAZY_LOAD",
      severity: "warning",
      category: "performance",
      title: `${imagesWithoutLazyLoad} below-fold images without lazy loading`,
      description: `Found ${imagesWithoutLazyLoad} images below the fold that load immediately.`,
      impact: "Eager-loading all images delays initial page load and wastes bandwidth.",
      howToFix: 'Add loading="lazy" to images below the fold. Keep loading="eager" for hero images.',
      affectedUrls: [url],
      details: {
        count: imagesWithoutLazyLoad,
        images: images.filter((i) => !i.isAboveFold && i.loading !== "lazy").slice(0, 5).map((i) => i.src)
      }
    });
  }
  if (imagesWithoutSrcset >= 5 && totalImages >= 5) {
    issues.push({
      code: "NO_RESPONSIVE_IMAGES",
      severity: "warning",
      category: "performance",
      title: "Images lack responsive srcset",
      description: `${imagesWithoutSrcset} of ${totalImages} images don't have srcset for different screen sizes.`,
      impact: "Mobile users download full-size images, wasting bandwidth and slowing load.",
      howToFix: "Add srcset attribute with multiple image sizes (e.g., 320w, 640w, 1280w).",
      affectedUrls: [url],
      details: {
        withoutSrcset: imagesWithoutSrcset,
        total: totalImages
      }
    });
  }
  if (imagesWithoutAlt > 0) {
    issues.push({
      code: "IMAGES_MISSING_ALT",
      severity: "warning",
      category: "on-page",
      // Alt text impacts both accessibility and SEO
      title: `${imagesWithoutAlt} image(s) missing alt attribute`,
      description: `Found ${imagesWithoutAlt} images without alt text.`,
      impact: "Missing alt text hurts accessibility and SEO. Screen readers cannot describe the image.",
      howToFix: 'Add descriptive alt text to all images. Use alt="" only for purely decorative images.',
      affectedUrls: [url],
      details: {
        count: imagesWithoutAlt,
        images: images.filter((i) => i.alt === null).slice(0, 5).map((i) => i.src)
      }
    });
  }
  if (legacyFormatCount > 3 && modernFormatCount === 0 && !pictureData.hasFormatFallbacks) {
    issues.push({
      code: "NO_MODERN_IMAGE_FORMATS",
      severity: "notice",
      category: "performance",
      title: "Not using modern image formats (WebP/AVIF)",
      description: `All ${legacyFormatCount} images use legacy formats (JPEG/PNG) instead of WebP/AVIF.`,
      impact: "WebP is 25-35% smaller than JPEG. AVIF is up to 50% smaller.",
      howToFix: "Use <picture> element to serve WebP/AVIF with JPEG fallback, or use an image CDN.",
      affectedUrls: [url],
      details: {
        legacyCount: legacyFormatCount,
        suggestion: cdnData.detected ? `Your CDN (${cdnData.cdns.join(", ")}) likely supports format conversion.` : "Consider using Cloudinary, imgix, or Vercel Image Optimization."
      }
    });
  }
  const aboveFoldLazy = images.filter((i) => i.isAboveFold && i.loading === "lazy");
  if (aboveFoldLazy.length > 0) {
    issues.push({
      code: "HERO_IMAGE_LAZY",
      severity: "notice",
      category: "performance",
      title: "Above-fold images have lazy loading",
      description: `${aboveFoldLazy.length} hero/above-fold image(s) use loading="lazy" which delays LCP.`,
      impact: "Lazy loading above-fold images increases Largest Contentful Paint time.",
      howToFix: 'Remove loading="lazy" from images visible on initial page load.',
      affectedUrls: [url],
      details: {
        images: aboveFoldLazy.map((i) => i.src)
      }
    });
  }
  return {
    issues,
    data: {
      totalImages,
      imagesWithoutDimensions,
      imagesWithoutLazyLoad,
      imagesWithoutSrcset,
      imagesWithoutAlt,
      modernFormatCount,
      legacyFormatCount,
      images,
      recommendations
    }
  };
}

// src/audit/checks/conversion-elements.ts
import * as cheerio33 from "https://esm.sh/cheerio@1.0.0";
var CTA_PATTERNS = [
  /get (started|quote|help|access|now)/i,
  /start (now|free|today|here)/i,
  /sign up/i,
  /subscribe/i,
  /contact us/i,
  /book (a |now|today|call|demo|meeting)/i,
  /schedule/i,
  /request (a |quote|demo|call)/i,
  /free (trial|quote|consultation|estimate)/i,
  /buy now/i,
  /add to cart/i,
  /shop now/i,
  /learn more/i,
  /download/i,
  /try (it |now|free)/i,
  /call (us|now|today)/i,
  /chat (with us|now)/i
];
var TESTIMONIAL_SELECTORS = [
  ".testimonial",
  ".testimonials",
  '[class*="testimonial"]',
  ".review",
  ".reviews",
  '[class*="review"]',
  ".quote",
  '[class*="customer-quote"]',
  ".client-feedback",
  '[class*="feedback"]',
  'blockquote[class*="testimonial"]'
];
var CLIENT_LOGO_SELECTORS = [
  ".client-logos",
  ".clients",
  '[class*="client-logo"]',
  ".partner-logos",
  ".partners",
  '[class*="partner"]',
  ".trusted-by",
  '[class*="trusted"]',
  ".as-seen-in",
  '[class*="featured-in"]',
  ".logo-wall",
  ".logo-carousel"
];
function analyzeAboveFold(html) {
  const $ = cheerio33.load(html);
  const header = $("header").first();
  const hero = $('.hero, [class*="hero"], .banner, [class*="banner"], .jumbotron, [class*="landing"]').first();
  const firstSection = $("main > section, main > div, body > section").first();
  const headerHtml = header.html() || "";
  const heroOrSectionHtml = hero.length ? hero.html() || "" : firstSection.html() || "";
  const aboveFoldHtml = headerHtml + heroOrSectionHtml;
  const $above = cheerio33.load(aboveFoldHtml);
  const h1 = $("h1").first();
  const hasHeadline = h1.length > 0;
  const headlineText = h1.text().trim() || null;
  const ctaTexts = [];
  $("a, button").each((_, el) => {
    const text = $(el).text().trim();
    for (const pattern of CTA_PATTERNS) {
      if (pattern.test(text)) {
        ctaTexts.push(text);
        break;
      }
    }
  });
  const forms = $("form");
  let formType = null;
  if (forms.length > 0) {
    const formHtml = forms.first().html()?.toLowerCase() || "";
    if (formHtml.includes("calculator") || formHtml.includes("estimate")) {
      formType = "calculator";
    } else if (formHtml.includes("search") || formHtml.includes("query")) {
      formType = "search";
    } else if (formHtml.includes("email") && formHtml.includes("subscribe")) {
      formType = "signup";
    } else if (formHtml.includes("phone") || formHtml.includes("contact") || formHtml.includes("message")) {
      formType = "contact";
    } else {
      formType = "other";
    }
  }
  const hasSocialProofAbove = $('[class*="testimonial"], [class*="review"], [class*="rating"], [class*="trust"]').length > 0;
  const socialProofTypes = [];
  if ($('[class*="rating"], [class*="star"]').length > 0)
    socialProofTypes.push("ratings");
  if ($('[class*="testimonial"]').length > 0)
    socialProofTypes.push("testimonials");
  if ($('[class*="client-logo"], [class*="trusted"]').length > 0)
    socialProofTypes.push("client-logos");
  const hasHeroImage = hero.find("img").length > 0 || $("header img").length > 0;
  const hasVideo = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;
  let score = 0;
  if (hasHeadline)
    score += 25;
  if (ctaTexts.length > 0)
    score += 25;
  if (forms.length > 0)
    score += 20;
  if (hasSocialProofAbove)
    score += 15;
  if (hasHeroImage || hasVideo)
    score += 15;
  return {
    hasHeadline,
    headlineText,
    hasCTA: ctaTexts.length > 0,
    ctaCount: ctaTexts.length,
    ctaTexts: [...new Set(ctaTexts)].slice(0, 5),
    hasForm: forms.length > 0,
    formType,
    hasSocialProof: hasSocialProofAbove,
    socialProofTypes,
    hasHeroImage,
    hasVideo,
    estimatedAboveFoldScore: score
  };
}
function analyzeSocialProof(html) {
  const $ = cheerio33.load(html);
  const text = $("body").text().toLowerCase();
  let testimonialCount = 0;
  for (const selector of TESTIMONIAL_SELECTORS) {
    testimonialCount += $(selector).length;
  }
  const hasTestimonials = testimonialCount > 0;
  const reviewElements = $('[class*="review"], [itemtype*="Review"]');
  const hasReviews = reviewElements.length > 0;
  const reviewCount = reviewElements.length;
  const ratingElements = $('[class*="rating"], [class*="star"], [itemprop="ratingValue"]');
  const hasRatings = ratingElements.length > 0;
  let averageRating = null;
  const ratingValue = $('[itemprop="ratingValue"]').first().text();
  if (ratingValue) {
    const parsed = parseFloat(ratingValue);
    if (!isNaN(parsed))
      averageRating = parsed;
  }
  let clientLogoCount = 0;
  for (const selector of CLIENT_LOGO_SELECTORS) {
    const container = $(selector);
    if (container.length > 0) {
      clientLogoCount = container.find("img").length || 1;
      break;
    }
  }
  const hasClientLogos = clientLogoCount > 0;
  const hasCaseStudies = $('a[href*="case-stud"], [class*="case-study"]').length > 0 || text.includes("case study") || text.includes("case studies");
  const hasAwards = $('[class*="award"]').length > 0 || text.includes("award-winning") || text.includes("winner");
  const hasCertifications = $('[class*="certif"], [class*="accredit"]').length > 0 || /certified|accredited|licensed/i.test(text);
  const hasTrustBadges = $('[class*="trust-badge"], [class*="security-badge"], [class*="guarantee"]').length > 0;
  const statisticsFound = [];
  const statPatterns = [
    /(\d+(?:,\d{3})*\+?)\s*(customers?|clients?|users?|businesses?)/gi,
    /(\d+(?:,\d{3})*\+?)\s*(years?)\s*(of experience|in business)/gi,
    /(\d+)%\s*(satisfaction|success|increase|growth)/gi,
    /\$(\d+(?:,\d{3})*(?:\.\d+)?[MBK]?)\s*(saved|recovered|generated)/gi
  ];
  for (const pattern of statPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      statisticsFound.push(...matches.slice(0, 3));
    }
  }
  const hasStatistics = statisticsFound.length > 0;
  let score = 0;
  if (hasTestimonials)
    score += 20;
  if (hasReviews)
    score += 15;
  if (hasRatings)
    score += 10;
  if (hasClientLogos)
    score += 15;
  if (hasCaseStudies)
    score += 15;
  if (hasAwards || hasCertifications)
    score += 10;
  if (hasTrustBadges)
    score += 5;
  if (hasStatistics)
    score += 10;
  return {
    hasTestimonials,
    testimonialCount,
    hasReviews,
    reviewCount,
    hasRatings,
    averageRating,
    hasClientLogos,
    clientLogoCount,
    hasCaseStudies,
    hasAwards,
    hasCertifications,
    hasTrustBadges,
    hasStatistics,
    statisticsFound: [...new Set(statisticsFound)].slice(0, 5),
    socialProofScore: Math.min(100, score)
  };
}
function detectEngagementTriggers(html) {
  const $ = cheerio33.load(html);
  const htmlLower = html.toLowerCase();
  const calculatorTypes = [];
  const calcPatterns = [
    { pattern: /calculator/i, type: "calculator" },
    { pattern: /estimator/i, type: "estimator" },
    { pattern: /roi.*calculator|calculator.*roi/i, type: "ROI calculator" },
    { pattern: /price.*calculator|cost.*calculator/i, type: "price calculator" },
    { pattern: /mortgage.*calculator/i, type: "mortgage calculator" },
    { pattern: /loan.*calculator/i, type: "loan calculator" },
    { pattern: /bmi.*calculator/i, type: "BMI calculator" },
    { pattern: /quote.*tool|instant.*quote/i, type: "quote tool" }
  ];
  for (const { pattern, type } of calcPatterns) {
    if (pattern.test(htmlLower)) {
      calculatorTypes.push(type);
    }
  }
  const hasCalculator = calculatorTypes.length > 0;
  const hasQuiz = $('[class*="quiz"], [id*="quiz"]').length > 0 || /quiz|assessment|self-test/i.test(htmlLower);
  const interactiveTypes = [];
  if ($('input[type="range"], .slider, [class*="slider"]').length > 0)
    interactiveTypes.push("slider");
  if ($('[class*="configurator"], [class*="customizer"]').length > 0)
    interactiveTypes.push("configurator");
  if ($('canvas, [class*="chart"], [class*="graph"]').length > 0)
    interactiveTypes.push("charts/graphs");
  if ($('[class*="map"], #map, .map').length > 0)
    interactiveTypes.push("interactive map");
  if ($('[class*="filter"], [class*="sort"]').length > 0)
    interactiveTypes.push("filters");
  const hasInteractiveElement = interactiveTypes.length > 0;
  const videos = $('video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="wistia"], [class*="video-embed"]');
  const hasEmbeddedVideo = videos.length > 0;
  const videoCount = videos.length;
  const hasExpandableContent = $('details, [class*="accordion"], [class*="collapsible"], [class*="expandable"]').length > 0;
  const hasTabsOrAccordion = $('[role="tablist"], [class*="tabs"], [class*="tab-content"]').length > 0;
  const hasChatWidget = $('[class*="chat-widget"], [class*="live-chat"], [id*="chat"]').length > 0 || /intercom|drift|crisp|zendesk|livechat|tidio/i.test(html);
  let score = 0;
  if (hasCalculator)
    score += 25;
  if (hasQuiz)
    score += 20;
  if (hasInteractiveElement)
    score += 15;
  if (hasEmbeddedVideo)
    score += 20;
  if (hasExpandableContent || hasTabsOrAccordion)
    score += 10;
  if (hasChatWidget)
    score += 10;
  return {
    hasCalculator,
    calculatorTypes,
    hasQuiz,
    hasInteractiveElement,
    interactiveTypes,
    hasEmbeddedVideo,
    videoCount,
    hasExpandableContent,
    hasTabsOrAccordion,
    hasChatWidget,
    engagementScore: Math.min(100, score)
  };
}
function detectPageType(html, url) {
  const $ = cheerio33.load(html);
  const text = $("body").text().toLowerCase();
  const urlLower = url.toLowerCase();
  let commercialSignals = 0;
  let informationalSignals = 0;
  if (/\/product|\/service|\/pricing|\/buy|\/shop|\/contact/i.test(urlLower))
    commercialSignals += 2;
  if (/\/blog|\/article|\/guide|\/how-to|\/what-is|\/learn/i.test(urlLower))
    informationalSignals += 2;
  if (/buy now|add to cart|get quote|contact us|free consultation/i.test(text))
    commercialSignals += 2;
  if ($("form").length > 0)
    commercialSignals += 1;
  if (/pricing|price|\$\d+/i.test(text))
    commercialSignals += 1;
  if (/table of contents|in this article|what you.ll learn/i.test(text))
    informationalSignals += 2;
  if ($("article").length > 0)
    informationalSignals += 1;
  if (text.length > 3e3)
    informationalSignals += 1;
  if (commercialSignals > informationalSignals + 1)
    return "commercial";
  if (informationalSignals > commercialSignals + 1)
    return "informational";
  if (commercialSignals > 0 && informationalSignals > 0)
    return "mixed";
  return "unknown";
}
function analyzeConversionElements(html, url) {
  const issues = [];
  const aboveFold = analyzeAboveFold(html);
  const socialProof = analyzeSocialProof(html);
  const engagementTriggers = detectEngagementTriggers(html);
  const pageType = detectPageType(html, url);
  const recommendations = [];
  if (pageType === "commercial" || pageType === "mixed") {
    if (!aboveFold.hasCTA) {
      issues.push({
        code: "COMMERCIAL_NO_CTA",
        severity: "warning",
        category: "content",
        title: "Commercial page without clear CTA",
        description: "This appears to be a commercial page but has no clear call-to-action.",
        impact: "Without a CTA, visitors have no clear next step. 80% of users only see above-the-fold content.",
        howToFix: 'Add a prominent CTA button above the fold (e.g., "Get Free Quote", "Contact Us", "Start Free Trial").',
        affectedUrls: [url],
        details: { pageType }
      });
      recommendations.push("Add prominent CTA button above the fold");
    }
    if (!aboveFold.hasForm && pageType === "commercial") {
      issues.push({
        code: "COMMERCIAL_NO_FORM",
        severity: "notice",
        category: "content",
        title: "Commercial page without lead capture form",
        description: "This commercial page lacks a visible form for lead capture.",
        impact: "Forms above the fold significantly increase conversion rates.",
        howToFix: "Add a contact form, quote request, or signup form visible without scrolling.",
        affectedUrls: [url]
      });
      recommendations.push("Add lead capture form above the fold");
    }
    if (!socialProof.hasTestimonials && !socialProof.hasReviews) {
      issues.push({
        code: "NO_SOCIAL_PROOF",
        severity: "warning",
        category: "content",
        title: "No testimonials or reviews found",
        description: "Page lacks testimonials, reviews, or other social proof.",
        impact: "97% of consumers look at reviews. Testimonials can increase conversions by 34%.",
        howToFix: "Add customer testimonials, reviews, ratings, or case studies to build trust.",
        affectedUrls: [url],
        details: { socialProofScore: socialProof.socialProofScore }
      });
      recommendations.push("Add customer testimonials or reviews");
    }
    if (!socialProof.hasClientLogos && pageType === "commercial") {
      recommendations.push('Add client/partner logos for credibility ("Trusted by...")');
    }
  }
  if (!engagementTriggers.hasEmbeddedVideo && !engagementTriggers.hasInteractiveElement) {
    issues.push({
      code: "NO_ENGAGEMENT_TRIGGERS",
      severity: "notice",
      category: "content",
      title: "No engagement triggers found",
      description: "Page lacks interactive elements, videos, or calculators.",
      impact: "Interactive content increases dwell time, a user signal that influences rankings.",
      howToFix: "Add video content, calculators, interactive tools, or expandable sections.",
      affectedUrls: [url],
      details: { engagementScore: engagementTriggers.engagementScore }
    });
    recommendations.push("Add video or interactive elements to increase engagement");
  }
  if (pageType === "commercial" && !engagementTriggers.hasCalculator) {
    const isServicePage = /service|pricing|quote|cost|estimate/i.test(url + html);
    if (isServicePage) {
      recommendations.push("Consider adding a calculator or instant quote tool");
    }
  }
  if (!aboveFold.hasHeadline) {
    issues.push({
      code: "NO_VISIBLE_HEADLINE",
      severity: "warning",
      category: "on-page",
      title: "No H1 headline visible",
      description: "Page appears to lack a visible H1 headline above the fold.",
      impact: "80% of visitors only read headlines. A strong headline is critical for engagement.",
      howToFix: "Add a clear, compelling H1 headline that communicates the page value proposition.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      aboveFold,
      socialProof,
      engagementTriggers,
      pageType,
      recommendations
    }
  };
}

// src/audit/checks/keyword-placement.ts
import * as cheerio34 from "https://esm.sh/cheerio@1.0.0";
function inferTargetKeywords(html, url) {
  const $ = cheerio34.load(html);
  const keywords = [];
  const title = $("title").text().trim();
  if (title) {
    const cleanTitle = title.split(/[|\-–—]/)[0]?.trim() || title;
    if (cleanTitle.length > 3 && cleanTitle.length < 100) {
      keywords.push(cleanTitle.toLowerCase());
    }
  }
  const h1 = $("h1").first().text().trim();
  if (h1 && h1.length > 3 && h1.length < 100) {
    keywords.push(h1.toLowerCase());
  }
  try {
    const urlPath = new URL(url).pathname;
    const slug = urlPath.split("/").filter((p) => p.length > 0).pop();
    if (slug) {
      const cleanSlug = slug.replace(/[-_]/g, " ").replace(/\.(html?|php|aspx?)$/i, "");
      if (cleanSlug.length > 3) {
        keywords.push(cleanSlug.toLowerCase());
      }
    }
  } catch {
  }
  const wordCounts = /* @__PURE__ */ new Map();
  for (const kw of keywords) {
    const words = kw.split(/\s+/).filter((w) => w.length > 2);
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  }
  return [...new Set(keywords)].slice(0, 3);
}
function analyzeUrlKeyword(url, keywords) {
  try {
    const parsedUrl = new URL(url);
    const urlSlug = parsedUrl.pathname.toLowerCase();
    const slugWords = urlSlug.replace(/[-_/]/g, " ").trim();
    let containsKeyword = false;
    let keywordInUrl = null;
    for (const keyword of keywords) {
      const kwWords = keyword.toLowerCase().split(/\s+/);
      const significantWords = kwWords.filter((w) => w.length > 2);
      const matchCount = significantWords.filter((w) => slugWords.includes(w)).length;
      if (matchCount >= Math.ceil(significantWords.length * 0.7)) {
        containsKeyword = true;
        keywordInUrl = keyword;
        break;
      }
    }
    const isCleanUrl = !urlSlug.includes("?") && !urlSlug.includes("=") && !/\d{5,}/.test(urlSlug) && // No long ID numbers
    urlSlug.length < 100;
    const hasDynamicParams = parsedUrl.search.length > 0;
    return {
      containsKeyword,
      keywordInUrl,
      urlSlug,
      isCleanUrl,
      hasDynamicParams
    };
  } catch {
    return {
      containsKeyword: false,
      keywordInUrl: null,
      urlSlug: "",
      isCleanUrl: false,
      hasDynamicParams: false
    };
  }
}
function analyzeTitleKeyword(html, keywords) {
  const $ = cheerio34.load(html);
  const title = $("title").text().trim().toLowerCase();
  if (!title) {
    return {
      hasExactMatch: false,
      hasPartialMatch: false,
      titleMatchScore: 0,
      position: "none"
    };
  }
  let hasExactMatch = false;
  let hasPartialMatch = false;
  let position = "none";
  for (const keyword of keywords) {
    const kwLower = keyword.toLowerCase();
    if (title.includes(kwLower)) {
      hasExactMatch = true;
      const index = title.indexOf(kwLower);
      if (index === 0 || index < 5) {
        position = "start";
      } else if (index > title.length - kwLower.length - 10) {
        position = "end";
      } else {
        position = "middle";
      }
      break;
    }
    const kwWords = kwLower.split(/\s+/).filter((w) => w.length > 2);
    const matchCount = kwWords.filter((w) => title.includes(w)).length;
    if (matchCount >= Math.ceil(kwWords.length * 0.6)) {
      hasPartialMatch = true;
      position = "middle";
    }
  }
  let titleMatchScore = 0;
  if (hasExactMatch) {
    titleMatchScore = position === "start" ? 100 : position === "middle" ? 80 : 60;
  } else if (hasPartialMatch) {
    titleMatchScore = 40;
  }
  return {
    hasExactMatch,
    hasPartialMatch,
    titleMatchScore,
    position
  };
}
function analyzeH1Keyword(html, keywords) {
  const $ = cheerio34.load(html);
  const h1 = $("h1").first().text().trim();
  const h1Lower = h1.toLowerCase();
  let hasExactMatch = false;
  let hasPartialMatch = false;
  for (const keyword of keywords) {
    const kwLower = keyword.toLowerCase();
    if (h1Lower.includes(kwLower)) {
      hasExactMatch = true;
      break;
    }
    const kwWords = kwLower.split(/\s+/).filter((w) => w.length > 2);
    const matchCount = kwWords.filter((w) => h1Lower.includes(w)).length;
    if (matchCount >= Math.ceil(kwWords.length * 0.6)) {
      hasPartialMatch = true;
    }
  }
  return {
    hasExactMatch,
    hasPartialMatch,
    h1Text: h1 || null
  };
}
function analyzeFirstParagraph(html, keywords) {
  const $ = cheerio34.load(html);
  const paragraphs = $("main p, article p, .content p, #content p, body > div p").toArray();
  let firstParagraph = "";
  for (const p of paragraphs) {
    const text = $(p).text().trim();
    if (text.length > 50) {
      firstParagraph = text;
      break;
    }
  }
  if (!firstParagraph) {
    firstParagraph = $("p").first().text().trim();
  }
  const firstParagraphLower = firstParagraph.toLowerCase();
  const words = firstParagraphLower.split(/\s+/);
  let hasKeyword = false;
  let keywordPosition = null;
  for (const keyword of keywords) {
    const kwLower = keyword.toLowerCase();
    const kwWords = kwLower.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (kwWords.some((kw) => words[i].includes(kw))) {
        hasKeyword = true;
        keywordPosition = i;
        break;
      }
    }
    if (hasKeyword)
      break;
  }
  return {
    hasKeyword,
    keywordPosition,
    firstParagraphPreview: firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? "..." : ""),
    isWithinFirst100Words: hasKeyword && keywordPosition !== null && keywordPosition < 100
  };
}
function analyzeMetaDescription(html, keywords) {
  const $ = cheerio34.load(html);
  const metaDesc = $('meta[name="description"]').attr("content")?.trim().toLowerCase() || "";
  if (!metaDesc) {
    return { hasKeyword: false, position: "none" };
  }
  let hasKeyword = false;
  let position = "none";
  for (const keyword of keywords) {
    const kwLower = keyword.toLowerCase();
    const kwWords = kwLower.split(/\s+/).filter((w) => w.length > 2);
    const matchCount = kwWords.filter((w) => metaDesc.includes(w)).length;
    if (matchCount >= Math.ceil(kwWords.length * 0.5)) {
      hasKeyword = true;
      const firstMatch = kwWords.find((w) => metaDesc.includes(w));
      if (firstMatch) {
        const index = metaDesc.indexOf(firstMatch);
        if (index < 30) {
          position = "start";
        } else if (index > metaDesc.length - 50) {
          position = "end";
        } else {
          position = "middle";
        }
      }
      break;
    }
  }
  return { hasKeyword, position };
}
function analyzeKeywordPlacement(html, url) {
  const issues = [];
  const detectedKeywords = inferTargetKeywords(html, url);
  const urlAnalysis = analyzeUrlKeyword(url, detectedKeywords);
  const titleAnalysis = analyzeTitleKeyword(html, detectedKeywords);
  const h1Analysis = analyzeH1Keyword(html, detectedKeywords);
  const firstParagraphAnalysis = analyzeFirstParagraph(html, detectedKeywords);
  const metaDescriptionAnalysis = analyzeMetaDescription(html, detectedKeywords);
  let overallPlacementScore = 0;
  if (urlAnalysis.containsKeyword)
    overallPlacementScore += 20;
  if (titleAnalysis.hasExactMatch)
    overallPlacementScore += 25;
  else if (titleAnalysis.hasPartialMatch)
    overallPlacementScore += 10;
  if (h1Analysis.hasExactMatch)
    overallPlacementScore += 20;
  else if (h1Analysis.hasPartialMatch)
    overallPlacementScore += 10;
  if (firstParagraphAnalysis.isWithinFirst100Words)
    overallPlacementScore += 20;
  else if (firstParagraphAnalysis.hasKeyword)
    overallPlacementScore += 10;
  if (metaDescriptionAnalysis.hasKeyword)
    overallPlacementScore += 15;
  if (!urlAnalysis.containsKeyword && urlAnalysis.urlSlug.length > 1) {
    issues.push({
      code: "URL_MISSING_KEYWORD",
      severity: "warning",
      category: "on-page",
      title: "URL does not contain target keyword",
      description: `The URL slug "${urlAnalysis.urlSlug}" doesn't include the apparent target keyword.`,
      impact: "URLs with keywords help Google understand page relevance. This is a ranking signal.",
      howToFix: "Include the primary keyword phrase in the URL (e.g., /keyword-phrase/ instead of /page123/).",
      affectedUrls: [url],
      details: {
        currentSlug: urlAnalysis.urlSlug,
        inferredKeywords: detectedKeywords
      }
    });
  }
  if (urlAnalysis.hasDynamicParams) {
    issues.push({
      code: "URL_HAS_PARAMS",
      severity: "notice",
      category: "on-page",
      title: "URL contains query parameters",
      description: "The URL has query parameters which create a less clean URL structure.",
      impact: "Clean, keyword-rich URLs are preferred by search engines and users.",
      howToFix: "Use URL rewriting to create clean, parameter-free URLs where possible.",
      affectedUrls: [url]
    });
  }
  if (!titleAnalysis.hasExactMatch && detectedKeywords.length > 0) {
    issues.push({
      code: "TITLE_KEYWORD_MISMATCH",
      severity: "warning",
      category: "on-page",
      title: "Title tag missing exact keyword match",
      description: "The title tag doesn't contain the exact target keyword phrase.",
      impact: `Google's leaked documents reveal a "title match score" that measures keyword alignment.`,
      howToFix: "Include the exact target keyword phrase in the title, preferably near the beginning.",
      affectedUrls: [url],
      details: {
        titleMatchScore: titleAnalysis.titleMatchScore,
        position: titleAnalysis.position
      }
    });
  }
  if (!firstParagraphAnalysis.hasKeyword) {
    issues.push({
      code: "FIRST_PARA_NO_KEYWORD",
      severity: "warning",
      category: "on-page",
      title: "Primary keyword not in first paragraph",
      description: "The target keyword doesn't appear in the opening paragraph.",
      impact: "Including keywords early in content signals relevance to search engines.",
      howToFix: "Add the primary keyword naturally within the first 100 words of your content.",
      affectedUrls: [url],
      details: {
        preview: firstParagraphAnalysis.firstParagraphPreview
      }
    });
  } else if (!firstParagraphAnalysis.isWithinFirst100Words) {
    issues.push({
      code: "KEYWORD_TOO_FAR",
      severity: "notice",
      category: "on-page",
      title: "Keyword appears late in first paragraph",
      description: `Keyword found at word position ${firstParagraphAnalysis.keywordPosition}, ideally should be in first 100 words.`,
      impact: "Earlier keyword placement may slightly improve relevance signals.",
      howToFix: "Move the keyword mention closer to the beginning of your content.",
      affectedUrls: [url]
    });
  }
  if (!h1Analysis.hasExactMatch && !h1Analysis.hasPartialMatch && h1Analysis.h1Text) {
    issues.push({
      code: "H1_MISSING_KEYWORD",
      severity: "notice",
      category: "on-page",
      title: "H1 doesn't contain target keyword",
      description: `The H1 "${h1Analysis.h1Text}" doesn't include the target keyword.`,
      impact: "H1 is a strong on-page signal for topic relevance.",
      howToFix: "Include the primary keyword in your H1 headline.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      detectedKeywords,
      urlAnalysis,
      titleAnalysis,
      h1Analysis,
      firstParagraphAnalysis,
      metaDescriptionAnalysis,
      overallPlacementScore
    }
  };
}

// src/audit/checks/topical-clusters.ts
import * as cheerio35 from "https://esm.sh/cheerio@1.0.0";
function getLinkContext($, link) {
  const parents = link.parents().toArray();
  for (const parent of parents) {
    const tagName = parent.tagName?.toLowerCase();
    const className = ($(parent).attr("class") || "").toLowerCase();
    const id = ($(parent).attr("id") || "").toLowerCase();
    if (tagName === "nav" || className.includes("nav") || className.includes("menu") || id.includes("nav") || id.includes("menu")) {
      return "navigation";
    }
    if (tagName === "footer" || className.includes("footer") || id.includes("footer")) {
      return "footer";
    }
    if (tagName === "aside" || className.includes("sidebar") || className.includes("widget") || id.includes("sidebar")) {
      return "sidebar";
    }
    if (tagName === "main" || tagName === "article" || className.includes("content") || className.includes("post") || className.includes("entry") || id.includes("content")) {
      return "content";
    }
  }
  return "content";
}
function getLinkDestination(href, baseUrl) {
  if (!href || href.startsWith("#")) {
    return "anchor";
  }
  try {
    const linkUrl = new URL(href, baseUrl);
    const currentUrl = new URL(baseUrl);
    if (linkUrl.hostname === currentUrl.hostname) {
      return "internal";
    }
    return "external";
  } catch {
    if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
      return "internal";
    }
    return "external";
  }
}
function isDoFollow(rel) {
  if (!rel)
    return true;
  const relValues = rel.toLowerCase().split(/\s+/);
  return !relValues.includes("nofollow") && !relValues.includes("sponsored") && !relValues.includes("ugc");
}
function extractLinks(html, url) {
  const $ = cheerio35.load(html);
  const internalLinks = [];
  const externalLinks = [];
  const anchorLinks = [];
  $("a[href]").each((_, element) => {
    const $link = $(element);
    const href = $link.attr("href") || "";
    const anchorText = $link.text().trim();
    const rel = $link.attr("rel");
    const destination = getLinkDestination(href, url);
    const context = getLinkContext($, $link);
    const doFollow = isDoFollow(rel);
    const link = {
      href,
      anchorText,
      context,
      isDoFollow: doFollow,
      destination
    };
    if (destination === "internal") {
      internalLinks.push(link);
    } else if (destination === "external") {
      externalLinks.push(link);
    } else {
      anchorLinks.push(link);
    }
  });
  return { internalLinks, externalLinks, anchorLinks };
}
function detectClusterSignals($) {
  const hasBreadcrumbs = $(
    '[class*="breadcrumb"], [id*="breadcrumb"], nav[aria-label*="breadcrumb"], [itemtype*="BreadcrumbList"], .breadcrumbs'
  ).length > 0;
  const hasRelatedPosts = $(
    '[class*="related"], [class*="similar"], [class*="recommended"], [id*="related"], h2:contains("Related"), h3:contains("Related"), h2:contains("You might also"), h2:contains("Similar")'
  ).length > 0;
  const hasCategoryLinks = $(
    '[class*="categor"], [class*="tag-"], [rel="tag"], a[href*="/category/"], a[href*="/tag/"], a[href*="/topic/"]'
  ).length > 0;
  return {
    hasHubStructure: false,
    // Calculated later
    hasSpokeLinks: false,
    // Calculated later
    hasBreadcrumbs,
    hasRelatedPosts,
    hasCategoryLinks,
    internalToExternalRatio: 0
    // Calculated later
  };
}
function calculateOrphanRisk(contentLinks, uniqueDestinations, clusterSignals) {
  let score = 0;
  if (contentLinks >= 5)
    score += 3;
  else if (contentLinks >= 2)
    score += 2;
  else if (contentLinks >= 1)
    score += 1;
  if (uniqueDestinations >= 5)
    score += 2;
  else if (uniqueDestinations >= 2)
    score += 1;
  if (clusterSignals.hasBreadcrumbs)
    score += 1;
  if (clusterSignals.hasRelatedPosts)
    score += 2;
  if (clusterSignals.hasCategoryLinks)
    score += 1;
  if (score >= 6)
    return "low";
  if (score >= 3)
    return "medium";
  return "high";
}
function analyzeTopicalClusters(html, url) {
  const $ = cheerio35.load(html);
  const issues = [];
  const { internalLinks, externalLinks, anchorLinks } = extractLinks(html, url);
  const contentInternalLinks = internalLinks.filter((l) => l.context === "content");
  const contentExternalLinks = externalLinks.filter((l) => l.context === "content");
  const uniqueInternalHrefs = new Set(
    internalLinks.map((l) => {
      try {
        return new URL(l.href, url).pathname;
      } catch {
        return l.href;
      }
    })
  );
  const anchorTexts = internalLinks.filter((l) => l.anchorText.length > 0);
  const avgAnchorTextLength = anchorTexts.length > 0 ? anchorTexts.reduce((sum, l) => sum + l.anchorText.length, 0) / anchorTexts.length : 0;
  const hasExactMatchAnchors = internalLinks.some((l) => {
    const text = l.anchorText.toLowerCase();
    return text.split(" ").length >= 3 && l.context === "content";
  });
  const clusterSignals = detectClusterSignals($);
  const totalContentLinks = contentInternalLinks.length + contentExternalLinks.length;
  clusterSignals.internalToExternalRatio = totalContentLinks > 0 ? contentInternalLinks.length / totalContentLinks : 1;
  clusterSignals.hasHubStructure = contentInternalLinks.length >= 5;
  clusterSignals.hasSpokeLinks = clusterSignals.hasRelatedPosts || clusterSignals.hasCategoryLinks;
  const orphanPageRisk = calculateOrphanRisk(
    contentInternalLinks.length,
    uniqueInternalHrefs.size,
    clusterSignals
  );
  const recommendations = [];
  if (contentInternalLinks.length < 3) {
    recommendations.push("Add more contextual internal links within your content");
  }
  if (!clusterSignals.hasBreadcrumbs) {
    recommendations.push("Add breadcrumb navigation for better site structure");
  }
  if (!clusterSignals.hasRelatedPosts) {
    recommendations.push('Add a "Related Posts" or "Similar Articles" section');
  }
  if (!clusterSignals.hasCategoryLinks) {
    recommendations.push("Link to category or topic pages to strengthen clusters");
  }
  if (clusterSignals.internalToExternalRatio < 0.5) {
    recommendations.push("Balance your link profile - add more internal links");
  }
  if (contentInternalLinks.length === 0) {
    issues.push({
      code: "NO_CONTENT_INTERNAL_LINKS",
      severity: "warning",
      category: "on-page",
      title: "No internal links in page content",
      description: "The main content area has no links to other pages on your site.",
      impact: "Internal links help search engines discover pages and understand site structure. They also pass PageRank.",
      howToFix: "Add 3-5 contextual internal links within your content to related pages.",
      affectedUrls: [url]
    });
  } else if (contentInternalLinks.length < 3) {
    issues.push({
      code: "FEW_CONTENT_INTERNAL_LINKS",
      severity: "notice",
      category: "on-page",
      title: "Few internal links in content",
      description: `Only ${contentInternalLinks.length} internal link(s) in the main content area.`,
      impact: "More contextual internal links strengthen topical clusters and help users discover content.",
      howToFix: "Add relevant internal links where they naturally fit in your content.",
      affectedUrls: [url],
      details: {
        currentCount: contentInternalLinks.length,
        recommended: "3-5 minimum"
      }
    });
  }
  if (!clusterSignals.hasBreadcrumbs) {
    issues.push({
      code: "NO_BREADCRUMBS",
      severity: "notice",
      category: "on-page",
      title: "No breadcrumb navigation detected",
      description: "Page lacks breadcrumb navigation for hierarchical context.",
      impact: "Breadcrumbs improve UX, help search engines understand site structure, and can appear in SERPs.",
      howToFix: "Add breadcrumb navigation with Schema.org BreadcrumbList markup.",
      affectedUrls: [url]
    });
  }
  if (!clusterSignals.hasRelatedPosts && !clusterSignals.hasCategoryLinks) {
    issues.push({
      code: "NO_RELATED_CONTENT",
      severity: "notice",
      category: "on-page",
      title: "No related content section",
      description: 'Page has no "Related Posts" or similar content discovery section.',
      impact: "Related content sections reduce bounce rate, increase pageviews, and strengthen topic clusters.",
      howToFix: "Add a section linking to related articles, products, or category pages.",
      affectedUrls: [url]
    });
  }
  if (orphanPageRisk === "high") {
    issues.push({
      code: "HIGH_ORPHAN_RISK",
      severity: "warning",
      category: "on-page",
      title: "Page may be an orphan page",
      description: "This page has very few internal links, making it hard to discover.",
      impact: "Orphan pages are difficult for search engines to find and may not get indexed.",
      howToFix: "Ensure this page is linked from navigation, category pages, or related content.",
      affectedUrls: [url],
      details: {
        contentLinks: contentInternalLinks.length,
        uniqueDestinations: uniqueInternalHrefs.size
      }
    });
  }
  if (contentExternalLinks.length > contentInternalLinks.length * 2 && contentExternalLinks.length >= 5) {
    issues.push({
      code: "EXTERNAL_LINK_HEAVY",
      severity: "notice",
      category: "on-page",
      title: "More external links than internal links",
      description: `${contentExternalLinks.length} external links vs ${contentInternalLinks.length} internal links in content.`,
      impact: "While citing sources is good, heavy external linking may dilute PageRank passed to your own pages.",
      howToFix: "Balance external citations with internal links to your own related content.",
      affectedUrls: [url],
      details: {
        externalLinks: contentExternalLinks.length,
        internalLinks: contentInternalLinks.length,
        ratio: clusterSignals.internalToExternalRatio.toFixed(2)
      }
    });
  }
  return {
    issues,
    data: {
      currentUrl: url,
      internalLinks,
      externalLinks,
      anchorLinks,
      linkMetrics: {
        totalLinks: internalLinks.length + externalLinks.length + anchorLinks.length,
        internalLinkCount: internalLinks.length,
        externalLinkCount: externalLinks.length,
        contentLinks: contentInternalLinks.length,
        uniqueInternalDestinations: uniqueInternalHrefs.size,
        avgAnchorTextLength: Math.round(avgAnchorTextLength),
        hasExactMatchAnchors
      },
      clusterSignals,
      orphanPageRisk,
      recommendations
    }
  };
}

// src/audit/checks/platform-presence.ts
import * as cheerio36 from "https://esm.sh/cheerio@1.0.0";
var PLATFORM_PATTERNS = [
  {
    name: "YouTube",
    urlPatterns: [/youtube\.com/, /youtu\.be/],
    embedPatterns: [/youtube\.com\/embed/, /youtube-nocookie\.com/],
    priority: "high"
  },
  {
    name: "TikTok",
    urlPatterns: [/tiktok\.com/],
    embedPatterns: [/tiktok\.com\/embed/],
    priority: "high"
  },
  {
    name: "Twitter/X",
    urlPatterns: [/twitter\.com/, /x\.com/],
    embedPatterns: [/platform\.twitter\.com/],
    priority: "high"
  },
  {
    name: "LinkedIn",
    urlPatterns: [/linkedin\.com/],
    priority: "high"
  },
  {
    name: "Reddit",
    urlPatterns: [/reddit\.com/, /redd\.it/],
    priority: "high"
  },
  {
    name: "Facebook",
    urlPatterns: [/facebook\.com/, /fb\.com/, /fb\.me/],
    embedPatterns: [/facebook\.com\/plugins/],
    priority: "medium"
  },
  {
    name: "Instagram",
    urlPatterns: [/instagram\.com/, /instagr\.am/],
    embedPatterns: [/instagram\.com\/embed/],
    priority: "medium"
  },
  {
    name: "Pinterest",
    urlPatterns: [/pinterest\.com/, /pin\.it/],
    priority: "medium"
  },
  {
    name: "GitHub",
    urlPatterns: [/github\.com/],
    priority: "medium"
  },
  {
    name: "Medium",
    urlPatterns: [/medium\.com/],
    priority: "low"
  },
  {
    name: "Spotify",
    urlPatterns: [/spotify\.com/, /open\.spotify\.com/],
    embedPatterns: [/open\.spotify\.com\/embed/],
    priority: "medium"
  },
  {
    name: "Apple Podcasts",
    urlPatterns: [/podcasts\.apple\.com/],
    priority: "medium"
  },
  {
    name: "Discord",
    urlPatterns: [/discord\.gg/, /discord\.com/],
    priority: "low"
  },
  {
    name: "Twitch",
    urlPatterns: [/twitch\.tv/],
    embedPatterns: [/player\.twitch\.tv/],
    priority: "low"
  },
  {
    name: "Vimeo",
    urlPatterns: [/vimeo\.com/],
    embedPatterns: [/player\.vimeo\.com/],
    priority: "low"
  },
  {
    name: "ProductHunt",
    urlPatterns: [/producthunt\.com/],
    priority: "medium"
  },
  {
    name: "Substack",
    urlPatterns: [/substack\.com/],
    priority: "low"
  },
  {
    name: "Amazon",
    urlPatterns: [/amazon\.com/, /amzn\.to/],
    priority: "medium"
  }
];
function getLinkLocation($, element) {
  const parents = element.parents().toArray();
  for (const parent of parents) {
    const tagName = parent.tagName?.toLowerCase();
    const className = ($(parent).attr("class") || "").toLowerCase();
    if (tagName === "header" || className.includes("header"))
      return "header";
    if (tagName === "footer" || className.includes("footer"))
      return "footer";
    if (tagName === "aside" || className.includes("sidebar"))
      return "sidebar";
    if (tagName === "main" || tagName === "article" || className.includes("content"))
      return "content";
  }
  return "content";
}
function detectPlatform(url) {
  const urlLower = url.toLowerCase();
  for (const platform of PLATFORM_PATTERNS) {
    if (platform.urlPatterns.some((p) => p.test(urlLower))) {
      return platform.name;
    }
  }
  return null;
}
function getLinkType(url, platform) {
  const urlLower = url.toLowerCase();
  const profilePatterns = [
    /youtube\.com\/@/,
    /youtube\.com\/c\//,
    /youtube\.com\/channel\//,
    /twitter\.com\/[^/]+$/,
    /x\.com\/[^/]+$/,
    /linkedin\.com\/company\//,
    /linkedin\.com\/in\//,
    /instagram\.com\/[^/]+\/?$/,
    /tiktok\.com\/@/,
    /facebook\.com\/[^/]+\/?$/,
    /github\.com\/[^/]+\/?$/,
    /reddit\.com\/user\//,
    /reddit\.com\/r\/[^/]+\/?$/,
    /pinterest\.com\/[^/]+\/?$/
  ];
  if (profilePatterns.some((p) => p.test(urlLower))) {
    return "profile";
  }
  const embedPatterns = [
    /embed/,
    /player\./,
    /plugins/
  ];
  if (embedPatterns.some((p) => p.test(urlLower))) {
    return "embed";
  }
  return "content";
}
function extractPlatformLinks(html) {
  const $ = cheerio36.load(html);
  const links = [];
  $("a[href]").each((_, element) => {
    const $el = $(element);
    const href = $el.attr("href") || "";
    const platform = detectPlatform(href);
    if (platform) {
      links.push({
        platform,
        url: href,
        type: getLinkType(href, platform),
        location: getLinkLocation($, $el)
      });
    }
  });
  return links;
}
function detectEmbeddedContent(html) {
  const $ = cheerio36.load(html);
  const embeds = /* @__PURE__ */ new Map();
  $("iframe[src]").each((_, element) => {
    const src = $(element).attr("src") || "";
    const platform = detectPlatform(src);
    if (platform) {
      embeds.set(platform, (embeds.get(platform) || 0) + 1);
    }
  });
  $("embed[src]").each((_, element) => {
    const src = $(element).attr("src") || "";
    const platform = detectPlatform(src);
    if (platform) {
      embeds.set(platform, (embeds.get(platform) || 0) + 1);
    }
  });
  if (html.includes("twitter-tweet") || html.includes("twitter-timeline")) {
    embeds.set("Twitter/X", (embeds.get("Twitter/X") || 0) + 1);
  }
  if (html.includes("tiktok-embed")) {
    embeds.set("TikTok", (embeds.get("TikTok") || 0) + 1);
  }
  return Array.from(embeds.entries()).map(([platform, count]) => ({ platform, count }));
}
function extractSchemaProfiles(html) {
  const $ = cheerio36.load(html);
  const sameAsUrls = [];
  let hasOrganizationSchema = false;
  let hasPersonSchema = false;
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const content = $(element).html() || "";
      const jsonData = JSON.parse(content);
      const processSchema = (schema) => {
        if (schema["@type"] === "Organization") {
          hasOrganizationSchema = true;
        }
        if (schema["@type"] === "Person") {
          hasPersonSchema = true;
        }
        if (schema.sameAs) {
          if (Array.isArray(schema.sameAs)) {
            sameAsUrls.push(...schema.sameAs);
          } else if (typeof schema.sameAs === "string") {
            sameAsUrls.push(schema.sameAs);
          }
        }
      };
      if (Array.isArray(jsonData)) {
        jsonData.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            processSchema(item);
          }
        });
      } else if (typeof jsonData === "object" && jsonData !== null) {
        processSchema(jsonData);
        if (Array.isArray(jsonData["@graph"])) {
          jsonData["@graph"].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              processSchema(item);
            }
          });
        }
      }
    } catch {
    }
  });
  return { sameAsUrls, hasOrganizationSchema, hasPersonSchema };
}
function calculateCrossPlatformScore(platformCount, hasHighPriorityPlatforms, hasSchemaProfiles, hasEmbeddedContent) {
  let score = 0;
  score += Math.min(platformCount * 10, 50);
  if (hasHighPriorityPlatforms) {
    score += 30;
  }
  if (hasSchemaProfiles) {
    score += 10;
  }
  if (hasEmbeddedContent) {
    score += 10;
  }
  return Math.min(score, 100);
}
function analyzePlatformPresence(html, url) {
  const issues = [];
  const platformLinks = extractPlatformLinks(html);
  const detectedPlatforms = [...new Set(platformLinks.map((l) => l.platform))];
  const socialProfiles = platformLinks.filter((l) => l.type === "profile").map((l) => ({
    platform: l.platform,
    url: l.url,
    hasSchemaMarkup: false
    // Updated below
  }));
  const embeddedContent = detectEmbeddedContent(html);
  const schemaData = extractSchemaProfiles(html);
  socialProfiles.forEach((profile) => {
    profile.hasSchemaMarkup = schemaData.sameAsUrls.some(
      (schemaUrl) => schemaUrl.toLowerCase().includes(profile.platform.toLowerCase())
    );
  });
  const hasHighPriority = (name) => detectedPlatforms.includes(name);
  const metrics = {
    totalPlatforms: detectedPlatforms.length,
    hasYouTube: hasHighPriority("YouTube"),
    hasTikTok: hasHighPriority("TikTok"),
    hasTwitter: hasHighPriority("Twitter/X"),
    hasLinkedIn: hasHighPriority("LinkedIn"),
    hasReddit: hasHighPriority("Reddit"),
    hasFacebook: hasHighPriority("Facebook"),
    hasInstagram: hasHighPriority("Instagram"),
    hasPinterest: hasHighPriority("Pinterest"),
    hasPodcast: hasHighPriority("Spotify") || hasHighPriority("Apple Podcasts"),
    hasGitHub: hasHighPriority("GitHub")
  };
  const highPriorityPlatforms = PLATFORM_PATTERNS.filter((p) => p.priority === "high").map((p) => p.name);
  const hasHighPriorityPlatforms = highPriorityPlatforms.some((p) => detectedPlatforms.includes(p));
  const crossPlatformScore = calculateCrossPlatformScore(
    detectedPlatforms.length,
    hasHighPriorityPlatforms,
    schemaData.sameAsUrls.length > 0,
    embeddedContent.length > 0
  );
  const recommendations = [];
  if (!metrics.hasYouTube) {
    recommendations.push("Add YouTube presence - video content ranks on both YouTube and Google");
  }
  if (!metrics.hasTikTok) {
    recommendations.push("Consider TikTok for short-form video discovery (high reach for B2C)");
  }
  if (!metrics.hasTwitter) {
    recommendations.push("Create Twitter/X presence for real-time engagement and brand visibility");
  }
  if (!metrics.hasLinkedIn) {
    recommendations.push("LinkedIn is essential for B2B - add company page link");
  }
  if (schemaData.sameAsUrls.length === 0) {
    recommendations.push("Add sameAs property to your Organization schema with social profile URLs");
  }
  if (socialProfiles.length === 0) {
    issues.push({
      code: "NO_SOCIAL_PROFILES",
      severity: "warning",
      category: "social",
      title: "No social media profile links detected",
      description: "Page has no visible links to social media profiles.",
      impact: "Cross-platform presence builds brand trust and provides additional discovery channels.",
      howToFix: "Add links to your social media profiles in the header, footer, or contact section.",
      affectedUrls: [url]
    });
  }
  if (!hasHighPriorityPlatforms && detectedPlatforms.length > 0) {
    issues.push({
      code: "NO_HIGH_PRIORITY_PLATFORMS",
      severity: "notice",
      category: "social",
      title: "Missing high-priority platform links",
      description: "No links to YouTube, TikTok, Twitter/X, LinkedIn, or Reddit detected.",
      impact: "These platforms have the highest reach and impact for SEO diversification.",
      howToFix: "Prioritize creating presence on YouTube, Twitter/X, and LinkedIn (using RICE framework).",
      affectedUrls: [url],
      details: {
        currentPlatforms: detectedPlatforms,
        recommendedPlatforms: highPriorityPlatforms
      }
    });
  }
  if (schemaData.sameAsUrls.length === 0 && socialProfiles.length > 0) {
    issues.push({
      code: "NO_SCHEMA_SAMEAS",
      severity: "notice",
      category: "social",
      title: "Social profiles not in schema.org markup",
      description: "Social media links found but not included in Organization/Person schema.",
      impact: "Schema sameAs helps search engines understand your brand's official social presence.",
      howToFix: "Add sameAs array to your Organization or Person schema with all social profile URLs.",
      affectedUrls: [url],
      details: {
        profilesFound: socialProfiles.map((p) => p.platform),
        schemaUrls: schemaData.sameAsUrls
      }
    });
  }
  if (!metrics.hasYouTube && detectedPlatforms.length >= 2) {
    issues.push({
      code: "NO_YOUTUBE_PRESENCE",
      severity: "notice",
      category: "social",
      title: "No YouTube channel linked",
      description: "Multiple social platforms linked but YouTube is missing.",
      impact: "YouTube is the second largest search engine. Video content ranks in both YouTube and Google.",
      howToFix: "Create a YouTube channel and link to it from your website.",
      affectedUrls: [url]
    });
  }
  if (embeddedContent.length === 0 && detectedPlatforms.length > 0) {
    issues.push({
      code: "NO_EMBEDDED_SOCIAL",
      severity: "notice",
      category: "social",
      title: "No embedded social content",
      description: "Social profiles linked but no embedded videos, tweets, or posts.",
      impact: "Embedded content increases engagement time and shows fresh, active social presence.",
      howToFix: "Embed relevant YouTube videos, Twitter feeds, or TikTok videos in your content.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      detectedPlatforms,
      platformLinks,
      socialProfiles,
      embeddedContent,
      metrics,
      schemaPresence: {
        hasSameAs: schemaData.sameAsUrls.length > 0,
        sameAsUrls: schemaData.sameAsUrls,
        hasOrganizationSchema: schemaData.hasOrganizationSchema,
        hasPersonSchema: schemaData.hasPersonSchema
      },
      crossPlatformScore,
      recommendations
    }
  };
}

// src/audit/checks/interactive-tools.ts
import * as cheerio37 from "https://esm.sh/cheerio@1.0.0";
var CALCULATOR_PATTERNS = [
  /calculator/i,
  /estimator/i,
  /cost-calc/i,
  /price-calc/i,
  /roi-calc/i,
  /savings/i,
  /compute/i
];
var WIDGET_PATTERNS = [
  /widget/i,
  /tool/i,
  /generator/i,
  /builder/i,
  /creator/i,
  /converter/i,
  /checker/i,
  /analyzer/i,
  /finder/i
];
var CONFIGURATOR_PATTERNS = [
  /configurator/i,
  /customizer/i,
  /designer/i,
  /planner/i,
  /selector/i,
  /picker/i
];
function detectCalculators($) {
  const calculators = [];
  const calcElements = $('[class*="calc"], [id*="calc"], [class*="estimat"], [id*="estimat"], [data-tool="calculator"]');
  calcElements.each((_, el) => {
    const $el = $(el);
    const hasInputs = $el.find('input, select, [type="range"]').length > 0;
    if (hasInputs) {
      calculators.push({
        type: "calculator",
        description: $el.attr("aria-label") || $el.find("h2, h3, h4").first().text().trim() || "Calculator widget",
        location: $el.attr("id") || $el.attr("class")?.split(" ")[0] || "unknown",
        hasUserInput: true
      });
    }
  });
  $("form").each((_, form) => {
    const $form = $(form);
    const formText = ($form.attr("class") || "") + ($form.attr("id") || "") + $form.text();
    if (CALCULATOR_PATTERNS.some((p) => p.test(formText))) {
      const hasInputs = $form.find('input[type="number"], input[type="range"], select').length > 0;
      if (hasInputs) {
        calculators.push({
          type: "calculator",
          description: $form.attr("aria-label") || $form.find("h2, h3, h4").first().text().trim() || "Calculator form",
          location: $form.attr("id") || "form",
          hasUserInput: true
        });
      }
    }
  });
  return calculators;
}
function detectQuizzes($) {
  const quizzes = [];
  const quizElements = $('[class*="quiz"], [id*="quiz"], [class*="assessment"], [data-component="quiz"]');
  quizElements.each((_, el) => {
    const $el = $(el);
    quizzes.push({
      type: "quiz",
      description: $el.attr("aria-label") || $el.find("h2, h3").first().text().trim() || "Quiz/Assessment",
      location: $el.attr("id") || $el.attr("class")?.split(" ")[0] || "unknown",
      hasUserInput: true
    });
  });
  const questionContainers = $('[class*="question"], [data-question]');
  if (questionContainers.length >= 3) {
    quizzes.push({
      type: "quiz",
      description: "Multi-question assessment",
      location: "multiple-questions",
      hasUserInput: true
    });
  }
  return quizzes;
}
function detectWidgets($, html) {
  const widgets = [];
  WIDGET_PATTERNS.forEach((pattern) => {
    const elements = $(`[class*="${pattern.source.replace(/\\i$/, "").toLowerCase()}"], [id*="${pattern.source.replace(/\\i$/, "").toLowerCase()}"]`);
    elements.each((_, el) => {
      const $el = $(el);
      const hasInteraction = $el.find('input, button, select, [onclick], [role="button"]').length > 0;
      if (hasInteraction) {
        widgets.push({
          type: "widget",
          description: $el.attr("aria-label") || $el.attr("title") || pattern.source,
          location: $el.attr("id") || $el.attr("class")?.split(" ")[0] || "unknown",
          hasUserInput: hasInteraction
        });
      }
    });
  });
  CONFIGURATOR_PATTERNS.forEach((pattern) => {
    if (pattern.test(html)) {
      const elements = $(`[class*="${pattern.source.replace(/\\i$/, "").toLowerCase()}"]`);
      elements.each((_, el) => {
        const $el = $(el);
        widgets.push({
          type: "tool",
          description: "Product configurator/customizer",
          location: $el.attr("id") || "configurator",
          hasUserInput: true
        });
      });
    }
  });
  return widgets;
}
function detectCodePlaygrounds($, html) {
  const playgrounds = [];
  const playgroundPatterns = [
    { name: "CodePen", pattern: /codepen\.io\/.*\/embed/i },
    { name: "CodeSandbox", pattern: /codesandbox\.io\/embed/i },
    { name: "JSFiddle", pattern: /jsfiddle\.net.*\/embed/i },
    { name: "Replit", pattern: /replit\.com.*embed/i },
    { name: "StackBlitz", pattern: /stackblitz\.com\/edit/i }
  ];
  for (const { name, pattern } of playgroundPatterns) {
    if (pattern.test(html)) {
      playgrounds.push({
        type: "interactive",
        description: `${name} code playground`,
        location: "embed",
        hasUserInput: true
      });
    }
  }
  if (html.includes("monaco-editor") || html.includes("CodeMirror")) {
    playgrounds.push({
      type: "interactive",
      description: "Code editor widget",
      location: "embedded",
      hasUserInput: true
    });
  }
  return playgrounds;
}
function detectChatWidgets(html) {
  const chatWidgets = [];
  const chatPatterns = [
    { name: "Intercom", pattern: /intercom\.com|intercomcdn/i },
    { name: "Drift", pattern: /drift\.com|js\.driftt/i },
    { name: "Zendesk", pattern: /zendesk\.com|zdassets/i },
    { name: "Crisp", pattern: /crisp\.chat/i },
    { name: "LiveChat", pattern: /livechat\.com|livechatinc/i },
    { name: "Tawk.to", pattern: /tawk\.to/i },
    { name: "HubSpot Chat", pattern: /hs-scripts\.com.*chat/i },
    { name: "Freshdesk", pattern: /freshdesk\.com/i }
  ];
  for (const { name, pattern } of chatPatterns) {
    if (pattern.test(html)) {
      chatWidgets.push({
        type: "widget",
        description: `${name} chat widget`,
        location: "global",
        hasUserInput: true
      });
    }
  }
  return chatWidgets;
}
function detectVideoEmbeds($, html) {
  const videos = [];
  if (html.includes("youtube.com/embed") || html.includes("youtube-nocookie.com/embed")) {
    const youtubeEmbeds = $('iframe[src*="youtube"]');
    videos.push({
      type: "embed",
      description: `${youtubeEmbeds.length} YouTube video(s) embedded`,
      location: "content",
      hasUserInput: false
    });
  }
  if (html.includes("player.vimeo.com")) {
    videos.push({
      type: "embed",
      description: "Vimeo video embedded",
      location: "content",
      hasUserInput: false
    });
  }
  if (html.includes("wistia.com") || html.includes("wistia.net")) {
    videos.push({
      type: "embed",
      description: "Wistia video embedded",
      location: "content",
      hasUserInput: false
    });
  }
  if (html.includes("loom.com/embed")) {
    videos.push({
      type: "embed",
      description: "Loom video embedded",
      location: "content",
      hasUserInput: false
    });
  }
  const html5Videos = $("video");
  if (html5Videos.length > 0) {
    videos.push({
      type: "embed",
      description: `${html5Videos.length} HTML5 video(s)`,
      location: "content",
      hasUserInput: false
    });
  }
  return videos;
}
function calculateDwellTimeScore(data) {
  let score = 0;
  if (data.dwellTimeSignals.hasCalculator)
    score += 25;
  if (data.dwellTimeSignals.hasQuiz)
    score += 20;
  if (data.dwellTimeSignals.hasConfigurator)
    score += 25;
  if (data.dwellTimeSignals.hasCodePlayground)
    score += 15;
  if (data.dwellTimeSignals.hasVideoEmbed)
    score += 15;
  if (data.dwellTimeSignals.hasInteractiveWidget)
    score += 10;
  if (data.dwellTimeSignals.hasChatWidget)
    score += 5;
  return Math.min(score, 100);
}
function analyzeInteractiveTools(html, url) {
  const $ = cheerio37.load(html);
  const issues = [];
  const calculators = detectCalculators($);
  const quizzes = detectQuizzes($);
  const widgets = detectWidgets($, html);
  const codePlaygrounds = detectCodePlaygrounds($, html);
  const chatWidgets = detectChatWidgets(html);
  const videoEmbeds = detectVideoEmbeds($, html);
  const allTools = [
    ...calculators,
    ...quizzes,
    ...widgets,
    ...codePlaygrounds,
    ...chatWidgets,
    ...videoEmbeds
  ];
  const uniqueTools = allTools.filter(
    (tool, index, self) => index === self.findIndex((t) => t.location === tool.location && t.type === tool.type)
  );
  const dwellTimeSignals = {
    hasCalculator: calculators.length > 0,
    hasQuiz: quizzes.length > 0,
    hasInteractiveWidget: widgets.length > 0,
    hasVideoEmbed: videoEmbeds.length > 0,
    hasCodePlayground: codePlaygrounds.length > 0,
    hasConfigurator: widgets.some((w) => w.description.toLowerCase().includes("configurator")),
    hasChatWidget: chatWidgets.length > 0
  };
  const partialData = {
    hasInteractiveTools: uniqueTools.length > 0,
    tools: uniqueTools,
    dwellTimeSignals,
    toolCount: uniqueTools.length
  };
  const dwellTimeScore = calculateDwellTimeScore(partialData);
  const recommendations = [];
  if (!dwellTimeSignals.hasCalculator && !dwellTimeSignals.hasQuiz) {
    recommendations.push("Add an interactive calculator or quiz to boost dwell time and generate backlinks");
  }
  if (!dwellTimeSignals.hasVideoEmbed) {
    recommendations.push("Embed a YouTube video to increase engagement and dwell time");
  }
  if (!dwellTimeSignals.hasInteractiveWidget && !dwellTimeSignals.hasConfigurator) {
    recommendations.push("Consider adding a free tool (generator, checker, converter) as a link magnet");
  }
  const isServicePage = /services?|pricing|product/i.test(url) || $("h1").text().toLowerCase().match(/service|pricing|product/);
  const isBlogPage = /blog|article|post/i.test(url);
  if (isServicePage && uniqueTools.length === 0) {
    issues.push({
      code: "NO_INTERACTIVE_TOOLS",
      severity: "notice",
      category: "content",
      title: "Service page lacks interactive tools",
      description: "This service/product page has no interactive elements like calculators or configurators.",
      impact: "Interactive tools increase dwell time by 2-3x and are powerful link magnets for backlink acquisition.",
      howToFix: "Add a relevant calculator (ROI, cost estimator, savings) or product configurator to the page.",
      affectedUrls: [url],
      details: {
        pageType: "service/product",
        recommendation: "Consider adding a pricing calculator, ROI estimator, or product configurator"
      }
    });
  }
  if (isBlogPage && !dwellTimeSignals.hasVideoEmbed) {
    issues.push({
      code: "BLOG_NO_VIDEO",
      severity: "notice",
      category: "content",
      title: "Blog post lacks video content",
      description: "This blog post has no embedded video content.",
      impact: "Embedded YouTube videos increase dwell time and can appear in video search results.",
      howToFix: "Create and embed a YouTube video that summarizes or expands on the blog content.",
      affectedUrls: [url]
    });
  }
  if (dwellTimeScore < 20 && uniqueTools.length === 0) {
    issues.push({
      code: "LOW_DWELL_TIME_SIGNALS",
      severity: "notice",
      category: "content",
      title: "Page lacks dwell time optimization",
      description: "No interactive tools, calculators, quizzes, or video embeds detected.",
      impact: "Interactive content significantly increases time on page, a user engagement signal.",
      howToFix: "Add at least one interactive element: calculator, quiz, embedded video, or free tool.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      hasInteractiveTools: uniqueTools.length > 0,
      tools: uniqueTools,
      dwellTimeSignals,
      toolCount: uniqueTools.length,
      dwellTimeScore,
      recommendations
    }
  };
}

// src/audit/checks/funnel-intent.ts
import * as cheerio38 from "https://esm.sh/cheerio@1.0.0";
var TOFU_PATTERNS = {
  url: [
    /\/blog\//i,
    /\/article/i,
    /\/guide/i,
    /\/tutorial/i,
    /\/how-to/i,
    /\/what-is/i,
    /\/learn/i,
    /\/tips/i,
    /\/explained/i,
    /\/introduction/i,
    /\/beginners?/i
  ],
  title: [
    /^how to/i,
    /^what is/i,
    /^what are/i,
    /^why /i,
    /^when /i,
    /^guide to/i,
    /complete guide/i,
    /beginner'?s? guide/i,
    /ultimate guide/i,
    /\d+ tips/i,
    /\d+ ways/i,
    /\d+ things/i,
    /explained/i,
    /introduction to/i,
    /learn /i,
    /understanding/i
  ],
  content: [
    /in this article/i,
    /in this guide/i,
    /we'll explain/i,
    /we'll cover/i,
    /you'll learn/i,
    /let's explore/i,
    /let's dive/i,
    /did you know/i,
    /according to/i,
    /research shows/i,
    /studies show/i
  ]
};
var MOFU_PATTERNS = {
  url: [
    /\/compare/i,
    /\/comparison/i,
    /\/vs/i,
    /\/versus/i,
    /\/alternative/i,
    /\/review/i,
    /\/pros-cons/i,
    /\/features/i,
    /\/solutions/i,
    /\/case-stud/i
  ],
  title: [
    /vs\.?$/i,
    /versus/i,
    /comparison/i,
    /compared/i,
    /alternative/i,
    /review/i,
    /pros and cons/i,
    /which is better/i,
    /best .* for/i,
    /top \d+/i,
    /\d+ best/i,
    /how .* compares/i,
    /should you/i
  ],
  content: [
    /let'?s compare/i,
    /in comparison/i,
    /alternative to/i,
    /pros:/i,
    /cons:/i,
    /advantages:/i,
    /disadvantages:/i,
    /key features/i,
    /feature comparison/i,
    /case study/i,
    /our client/i,
    /we helped/i
  ]
};
var BOFU_PATTERNS = {
  url: [
    /\/pricing/i,
    /\/buy/i,
    /\/purchase/i,
    /\/order/i,
    /\/sign-?up/i,
    /\/register/i,
    /\/demo/i,
    /\/trial/i,
    /\/quote/i,
    /\/contact/i,
    /\/get-started/i,
    /\/checkout/i,
    /\/hire/i,
    /\/services?$/i
  ],
  title: [
    /pricing/i,
    /buy /i,
    /purchase/i,
    /order /i,
    /sign up/i,
    /get started/i,
    /free trial/i,
    /request .* demo/i,
    /book .* call/i,
    /schedule/i,
    /get .* quote/i,
    /contact us/i,
    /hire /i,
    /\$\d+/,
    /per month/i,
    /\/mo\b/i
  ],
  content: [
    /add to cart/i,
    /buy now/i,
    /purchase now/i,
    /sign up now/i,
    /get started/i,
    /start.*trial/i,
    /request.*demo/i,
    /book.*call/i,
    /schedule.*meeting/i,
    /contact.*today/i,
    /limited.*offer/i,
    /special.*price/i,
    /money.*back.*guarantee/i,
    /free.*shipping/i,
    /plans.*pricing/i,
    /per user/i,
    /per month/i,
    /billed annually/i,
    /\$\d+/
  ],
  elements: [
    'form[action*="checkout"]',
    'form[action*="purchase"]',
    'form[action*="subscribe"]',
    'button[data-action="buy"]',
    '[class*="pricing-table"]',
    '[class*="price-card"]',
    '[class*="checkout"]',
    '[class*="add-to-cart"]'
  ]
};
function calculateStageScore(url, title, content, $, patterns) {
  let score = 0;
  const signals = [];
  for (const pattern of patterns.url) {
    if (pattern.test(url)) {
      score += 15;
      signals.push(`URL: ${pattern.source}`);
    }
  }
  for (const pattern of patterns.title) {
    if (pattern.test(title)) {
      score += 12;
      signals.push(`Title: ${pattern.source}`);
    }
  }
  for (const pattern of patterns.content) {
    if (pattern.test(content)) {
      score += 5;
      signals.push(`Content: ${pattern.source}`);
    }
  }
  if (patterns.elements) {
    for (const selector of patterns.elements) {
      if ($(selector).length > 0) {
        score += 10;
        signals.push(`Element: ${selector}`);
      }
    }
  }
  return { score, signals: signals.slice(0, 5) };
}
function determinePageType($, url) {
  if (/\/blog\//i.test(url))
    return "blog-post";
  if (/\/product/i.test(url))
    return "product-page";
  if (/\/services?/i.test(url))
    return "service-page";
  if (/\/pricing/i.test(url))
    return "pricing-page";
  if (/\/about/i.test(url))
    return "about-page";
  if (/\/contact/i.test(url))
    return "contact-page";
  if (/\/case-stud/i.test(url))
    return "case-study";
  if ($('[class*="pricing"]').length > 0)
    return "pricing-page";
  if ($('[class*="product"]').length > 0)
    return "product-page";
  if ($("article").length > 0)
    return "article";
  if ($('[class*="blog"]').length > 0)
    return "blog-post";
  if ($('[class*="cart"]').length > 0 || $('[class*="checkout"]').length > 0)
    return "e-commerce";
  return "general";
}
function calculateAIOverviewRisk(stage, pageType) {
  if (stage === "tofu") {
    return "high";
  }
  if (pageType === "blog-post" || pageType === "article") {
    return "high";
  }
  if (stage === "mofu") {
    return "medium";
  }
  return "low";
}
function analyzeFunnelIntent(html, url) {
  const $ = cheerio38.load(html);
  const issues = [];
  const title = $("title").text().trim() + " " + $("h1").first().text().trim();
  const bodyText = $("body").text().toLowerCase();
  const tofuResult = calculateStageScore(url, title, bodyText, $, TOFU_PATTERNS);
  const mofuResult = calculateStageScore(url, title, bodyText, $, MOFU_PATTERNS);
  const bofuResult = calculateStageScore(url, title, bodyText, $, BOFU_PATTERNS);
  const totalScore = tofuResult.score + mofuResult.score + bofuResult.score || 1;
  const informationalScore = Math.round(tofuResult.score / totalScore * 100);
  const considerationScore = Math.round(mofuResult.score / totalScore * 100);
  const conversionScore = Math.round(bofuResult.score / totalScore * 100);
  let detectedStage;
  let confidence;
  if (bofuResult.score > tofuResult.score && bofuResult.score > mofuResult.score) {
    detectedStage = "bofu";
    confidence = conversionScore;
  } else if (mofuResult.score > tofuResult.score) {
    detectedStage = "mofu";
    confidence = considerationScore;
  } else if (tofuResult.score > 0) {
    detectedStage = "tofu";
    confidence = informationalScore;
  } else {
    detectedStage = "mixed";
    confidence = 50;
  }
  const pageType = determinePageType($, url);
  const aiOverviewRisk = calculateAIOverviewRisk(detectedStage, pageType);
  const recommendations = [];
  if (detectedStage === "tofu") {
    recommendations.push("Consider adding conversion elements (CTAs, forms) to capture leads");
    recommendations.push("Link to MOFU/BOFU pages (comparisons, pricing) to guide users down the funnel");
    if (aiOverviewRisk === "high") {
      recommendations.push("Add unique data, case studies, or expert opinions that AI cannot replicate");
    }
  }
  if (detectedStage === "mofu") {
    recommendations.push("Add clear CTAs to BOFU pages (pricing, demos, trials)");
    recommendations.push("Include social proof (testimonials, case studies) to build trust");
  }
  if (detectedStage === "mixed") {
    recommendations.push("Clarify the page's primary intent - is this informational, comparison, or conversion focused?");
    recommendations.push("Consider splitting into multiple focused pages for better SEO");
  }
  if (aiOverviewRisk === "high" && detectedStage === "tofu") {
    issues.push({
      code: "TOFU_AI_OVERVIEW_RISK",
      severity: "notice",
      category: "content",
      title: "Content at risk of AI overview displacement",
      description: "This informational content may be answered directly by AI overviews, reducing click-through.",
      impact: "Google AI overviews are increasingly answering informational queries directly in SERPs.",
      howToFix: "Add unique value: original data, expert opinions, case studies, or interactive tools that AI cannot replicate.",
      affectedUrls: [url],
      details: {
        funnelStage: "tofu",
        aiOverviewRisk,
        recommendation: "Focus on MOFU/BOFU content or add unique differentiating content"
      }
    });
  }
  if (detectedStage === "tofu") {
    const hasConversionLinks = $('a[href*="pricing"], a[href*="demo"], a[href*="trial"], a[href*="contact"], a[href*="buy"]').length > 0;
    if (!hasConversionLinks) {
      issues.push({
        code: "TOFU_NO_FUNNEL_LINKS",
        severity: "notice",
        category: "content",
        title: "Informational page lacks conversion path",
        description: "This TOFU content has no links to pricing, demo, trial, or contact pages.",
        impact: "Users may leave without entering the sales funnel. Missing revenue opportunity.",
        howToFix: "Add contextual CTAs linking to MOFU/BOFU pages (comparisons, pricing, demos).",
        affectedUrls: [url]
      });
    }
  }
  if (detectedStage === "bofu") {
    const hasSocialProof = $('[class*="testimonial"], [class*="review"], [class*="case-study"], [class*="trust"]').length > 0 || bodyText.includes("testimonial") || bodyText.includes("customer said");
    if (!hasSocialProof) {
      issues.push({
        code: "BOFU_NO_SOCIAL_PROOF",
        severity: "warning",
        category: "content",
        title: "Conversion page lacks social proof",
        description: "This pricing/sales page has no visible testimonials, reviews, or case studies.",
        impact: "97% of consumers look at reviews before buying. Social proof can increase conversions by 34%.",
        howToFix: "Add customer testimonials, case study results, trust badges, or review ratings.",
        affectedUrls: [url],
        details: {
          funnelStage: "bofu",
          pageType
        }
      });
    }
  }
  if (detectedStage === "mixed" && confidence < 40) {
    issues.push({
      code: "MIXED_FUNNEL_INTENT",
      severity: "notice",
      category: "content",
      title: "Unclear page intent",
      description: "This page has mixed signals - unclear if informational, comparison, or conversion focused.",
      impact: "Mixed intent pages may rank poorly because search engines cannot determine primary purpose.",
      howToFix: "Focus on one primary intent per page. Create separate pages for different funnel stages.",
      affectedUrls: [url],
      details: {
        scores: { tofu: informationalScore, mofu: considerationScore, bofu: conversionScore }
      }
    });
  }
  return {
    issues,
    data: {
      detectedStage,
      confidence,
      signals: {
        tofu: tofuResult.signals,
        mofu: mofuResult.signals,
        bofu: bofuResult.signals
      },
      metrics: {
        informationalScore,
        considerationScore,
        conversionScore
      },
      pageType,
      aiOverviewRisk,
      recommendations
    }
  };
}

// src/audit/checks/navboost-signals.ts
import * as cheerio39 from "https://esm.sh/cheerio@1.0.0";
function analyzeClickOptimization($) {
  const title = $("title").text().trim();
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() || "";
  const hasClearTitle = title.length > 10 && title.length <= 60;
  const titleTruncated = title.length > 60;
  const hasCompellingMetaDesc = metaDesc.length >= 70 && metaDesc.length <= 160;
  const metaDescTruncated = metaDesc.length > 160;
  const hasPowerWords = /free|best|guide|how to|ultimate|proven|secret|new|exclusive/i.test(title + " " + metaDesc);
  const hasNumbers = /\d+/.test(title);
  const hasYear = /202[4-9]|203\d/.test(title + " " + metaDesc);
  let ctrScore = 0;
  if (hasClearTitle)
    ctrScore += 2;
  if (hasCompellingMetaDesc)
    ctrScore += 2;
  if (hasPowerWords)
    ctrScore += 1;
  if (hasNumbers)
    ctrScore += 1;
  if (hasYear)
    ctrScore += 1;
  const estimatedCTRPotential = ctrScore >= 5 ? "high" : ctrScore >= 3 ? "medium" : "low";
  return {
    hasClearTitle,
    hasCompellingMetaDesc,
    titleTruncated,
    metaDescTruncated,
    estimatedCTRPotential
  };
}
function analyzeEngagementSignals($, html) {
  const hasTableOfContents = $('[class*="toc"], [id*="toc"], [class*="table-of-contents"], nav[aria-label*="content"]').length > 0 || $('a[href^="#"]').filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return /^(\d+\.?\s*)?[a-z]/i.test(text) && text.length > 3;
  }).length >= 3;
  const hasJumpLinks = $('a[href^="#"]').length >= 3;
  const contentSections = $("h2, h3").length;
  const bodyText = $("body").text();
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
  const estimatedScrollDepth = wordCount > 2e3 ? "deep" : wordCount > 800 ? "medium" : "shallow";
  const hasProgressIndicator = $('[class*="progress"], [class*="reading-progress"], [role="progressbar"]').length > 0;
  const hasStickyNavigation = $('[class*="sticky"], [class*="fixed"], [style*="position: sticky"], [style*="position: fixed"]').filter((_, el) => {
    return $(el).find("nav, a").length > 0;
  }).length > 0;
  return {
    hasTableOfContents,
    hasJumpLinks,
    estimatedScrollDepth,
    hasProgressIndicator,
    hasStickyNavigation,
    contentSections
  };
}
function analyzeBounceRiskFactors($, html) {
  const title = $("title").text().toLowerCase();
  const h1 = $("h1").first().text().toLowerCase();
  const firstParagraph = $("p").first().text().toLowerCase();
  const hasAboveFoldContent = $("h1").length > 0 && ($("p").first().text().length > 50 || $("main, article, .content").first().text().length > 100);
  const hasSlowLoadingIndicators = $('script[src*="bundle"], script[src*="vendor"]').length > 5 || $('img:not([loading="lazy"])').length > 10;
  const hasPopupRisk = html.includes("modal") || html.includes("popup") || html.includes("newsletter-overlay") || $('[class*="popup"], [class*="modal"]').length > 0;
  const hasIntrusiveAds = $('[class*="ad-"], [id*="ad-"], [class*="advertisement"]').length > 3 || html.includes("interstitial");
  const titleWords = title.split(/\s+/).filter((w) => w.length > 3);
  const matchingWords = titleWords.filter(
    (w) => h1.includes(w) || firstParagraph.includes(w)
  );
  const contentMatchesTitle = matchingWords.length >= Math.ceil(titleWords.length * 0.5);
  const hasImmediateValue = firstParagraph.length > 100 || $("main p, article p").first().text().length > 100;
  return {
    hasAboveFoldContent,
    hasSlowLoadingIndicators,
    hasPopupRisk,
    hasIntrusiveAds,
    contentMatchesTitle,
    hasImmediateValue
  };
}
function analyzeDwellTimeFactors($, html) {
  const bodyText = $("main, article, .content, body").text();
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
  const estimatedReadTime = Math.ceil(wordCount / 200);
  const hasVideo = $('video, iframe[src*="youtube"], iframe[src*="vimeo"], [class*="video"]').length > 0;
  const hasInteractiveElements = $('form, [class*="calculator"], [class*="quiz"], [class*="interactive"], input, select').length > 0;
  const contentDepth = wordCount > 2e3 ? "comprehensive" : wordCount > 800 ? "moderate" : "thin";
  const hasRelatedContent = $('[class*="related"], [class*="recommended"], [class*="similar"]').length > 0 || $("a").filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes("related") || text.includes("see also") || text.includes("read next");
  }).length > 0;
  return {
    estimatedReadTime,
    hasVideo,
    hasInteractiveElements,
    contentDepth,
    hasRelatedContent
  };
}
function calculateNavBoostScore(click, engagement, bounce, dwell) {
  let score = 50;
  if (click.estimatedCTRPotential === "high")
    score += 20;
  else if (click.estimatedCTRPotential === "medium")
    score += 10;
  if (click.titleTruncated)
    score -= 5;
  if (click.metaDescTruncated)
    score -= 3;
  if (engagement.hasTableOfContents)
    score += 10;
  if (engagement.hasJumpLinks)
    score += 5;
  if (engagement.contentSections >= 5)
    score += 5;
  if (!bounce.hasAboveFoldContent)
    score -= 10;
  if (bounce.hasPopupRisk)
    score -= 5;
  if (bounce.hasIntrusiveAds)
    score -= 10;
  if (!bounce.contentMatchesTitle)
    score -= 5;
  if (bounce.hasImmediateValue)
    score += 5;
  if (dwell.hasVideo)
    score += 10;
  if (dwell.hasInteractiveElements)
    score += 5;
  if (dwell.contentDepth === "comprehensive")
    score += 5;
  else if (dwell.contentDepth === "thin")
    score -= 5;
  if (dwell.hasRelatedContent)
    score += 5;
  return Math.max(0, Math.min(100, score));
}
function analyzeNavBoostSignals(html, url) {
  const $ = cheerio39.load(html);
  const issues = [];
  const clickOptimization = analyzeClickOptimization($);
  const engagementSignals = analyzeEngagementSignals($, html);
  const bounceRiskFactors = analyzeBounceRiskFactors($, html);
  const dwellTimeFactors = analyzeDwellTimeFactors($, html);
  const overallNavBoostScore = calculateNavBoostScore(
    clickOptimization,
    engagementSignals,
    bounceRiskFactors,
    dwellTimeFactors
  );
  const recommendations = [];
  if (clickOptimization.estimatedCTRPotential !== "high") {
    recommendations.push("Optimize title/meta for higher CTR: use power words, numbers, or current year");
  }
  if (!engagementSignals.hasTableOfContents && engagementSignals.contentSections >= 5) {
    recommendations.push("Add table of contents for long-form content to improve engagement");
  }
  if (bounceRiskFactors.hasPopupRisk) {
    recommendations.push("Delay or remove popup modals to reduce bounce rate");
  }
  if (!dwellTimeFactors.hasRelatedContent) {
    recommendations.push("Add related content section to increase session duration");
  }
  if (clickOptimization.estimatedCTRPotential === "low") {
    issues.push({
      code: "LOW_CTR_POTENTIAL",
      severity: "warning",
      category: "on-page",
      title: "Title and meta description have low CTR potential",
      description: "The title and meta description lack compelling elements that drive clicks.",
      impact: "NavBoost uses click data as a ranking signal. Higher CTR improves rankings over time.",
      howToFix: "Add power words (free, best, ultimate), numbers, or current year to increase CTR.",
      affectedUrls: [url],
      details: {
        ctrPotential: clickOptimization.estimatedCTRPotential,
        titleTruncated: clickOptimization.titleTruncated
      }
    });
  }
  if (!bounceRiskFactors.hasAboveFoldContent || !bounceRiskFactors.hasImmediateValue) {
    issues.push({
      code: "HIGH_BOUNCE_RISK",
      severity: "warning",
      category: "content",
      title: "Page has high bounce risk signals",
      description: "The page lacks above-fold content or immediate value for visitors.",
      impact: "NavBoost tracks bounce rate. >70% bounce with <30s sessions hurts rankings.",
      howToFix: "Add compelling content above the fold that delivers immediate value to visitors.",
      affectedUrls: [url],
      details: {
        hasAboveFoldContent: bounceRiskFactors.hasAboveFoldContent,
        hasImmediateValue: bounceRiskFactors.hasImmediateValue
      }
    });
  }
  if (bounceRiskFactors.hasPopupRisk) {
    issues.push({
      code: "POPUP_BOUNCE_RISK",
      severity: "notice",
      category: "content",
      title: "Popup/modal detected - potential bounce risk",
      description: "Popups detected that may cause visitors to leave immediately.",
      impact: "Intrusive interstitials increase bounce rate and hurt NavBoost signals.",
      howToFix: "Delay popups by 30+ seconds, or use exit-intent only. Avoid fullscreen overlays.",
      affectedUrls: [url]
    });
  }
  if (dwellTimeFactors.contentDepth === "thin" && dwellTimeFactors.estimatedReadTime < 3) {
    issues.push({
      code: "LOW_DWELL_TIME_CONTENT",
      severity: "notice",
      category: "content",
      title: "Thin content may result in low dwell time",
      description: `Estimated read time is only ${dwellTimeFactors.estimatedReadTime} minute(s).`,
      impact: 'Google tracks "lastLongestClicks" - longer sessions signal quality content.',
      howToFix: "Add comprehensive content, videos, or interactive elements to increase time on page.",
      affectedUrls: [url],
      details: {
        estimatedReadTime: dwellTimeFactors.estimatedReadTime,
        contentDepth: dwellTimeFactors.contentDepth
      }
    });
  }
  if (engagementSignals.estimatedScrollDepth === "deep" && !engagementSignals.hasTableOfContents) {
    issues.push({
      code: "LONG_CONTENT_NO_TOC",
      severity: "notice",
      category: "content",
      title: "Long content lacks table of contents",
      description: "Long-form content without navigation aids may cause users to abandon the page.",
      impact: "Table of contents improves engagement signals by helping users find relevant sections.",
      howToFix: "Add a table of contents with jump links to major sections.",
      affectedUrls: [url],
      details: {
        contentSections: engagementSignals.contentSections,
        scrollDepth: engagementSignals.estimatedScrollDepth
      }
    });
  }
  return {
    issues,
    data: {
      clickOptimization,
      engagementSignals,
      bounceRiskFactors,
      dwellTimeFactors,
      overallNavBoostScore,
      recommendations
    }
  };
}

// src/audit/checks/entity-seo.ts
import * as cheerio40 from "https://esm.sh/cheerio@1.0.0";
function extractEntitySignals($, html) {
  let hasOrganizationSchema = false;
  let hasPersonSchema = false;
  let hasProductSchema = false;
  let hasSameAsReferences = false;
  let hasMainEntityOfPage = false;
  let hasAboutReference = false;
  const sameAsUrls = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html() || "";
      const data = JSON.parse(content);
      const processSchema = (schema) => {
        const type = schema["@type"];
        if (type === "Organization" || type === "Corporation" || type === "LocalBusiness") {
          hasOrganizationSchema = true;
        }
        if (type === "Person") {
          hasPersonSchema = true;
        }
        if (type === "Product" || type === "SoftwareApplication") {
          hasProductSchema = true;
        }
        if (schema.sameAs) {
          hasSameAsReferences = true;
          if (Array.isArray(schema.sameAs)) {
            sameAsUrls.push(...schema.sameAs);
          } else if (typeof schema.sameAs === "string") {
            sameAsUrls.push(schema.sameAs);
          }
        }
        if (schema.mainEntityOfPage) {
          hasMainEntityOfPage = true;
        }
        if (schema.about) {
          hasAboutReference = true;
        }
      };
      if (Array.isArray(data)) {
        data.forEach((item) => processSchema(item));
      } else if (data["@graph"]) {
        data["@graph"].forEach(processSchema);
      } else {
        processSchema(data);
      }
    } catch {
    }
  });
  return {
    hasOrganizationSchema,
    hasPersonSchema,
    hasProductSchema,
    hasSameAsReferences,
    sameAsUrls,
    hasMainEntityOfPage,
    hasAboutReference
  };
}
function analyzeEntityClarity($, html) {
  const title = $("title").text().trim();
  const h1 = $("h1").first().text().trim();
  const metaDesc = $('meta[name="description"]').attr("content") || "";
  const firstParagraph = $("p").first().text().trim();
  let primaryEntityType = null;
  const bodyText = $("body").text().toLowerCase();
  if (/company|corporation|business|agency|firm/i.test(bodyText)) {
    primaryEntityType = "Organization";
  } else if (/product|software|tool|app|service/i.test(h1 + " " + title)) {
    primaryEntityType = "Product/Software";
  } else if (/person|author|founder|ceo|expert/i.test(bodyText)) {
    primaryEntityType = "Person";
  }
  const titleWords = title.split(/[\s|—-]+/).filter((w) => w.length > 3);
  const h1Words = h1.split(/[\s|—-]+/).filter((w) => w.length > 3);
  const properNouns = [...title.matchAll(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g)].map((m) => m[0]);
  const entityNameConsistency = properNouns.length > 0 && properNouns.some((name) => h1.includes(name) || firstParagraph.includes(name));
  const hasWikipediaStyleIntro = /is (a|an|the)\s+\w+/i.test(firstParagraph) || /\w+ is (a|an) (software|company|tool|platform|service|agency)/i.test(firstParagraph);
  const hasEntityDefinition = hasWikipediaStyleIntro || firstParagraph.length > 100;
  const brandName = properNouns[0] || title.split(/[|—-]/)[0].trim();
  const entityMentionCount = brandName ? (bodyText.match(new RegExp(brandName.toLowerCase(), "g")) || []).length : 0;
  return {
    primaryEntityType,
    entityNameConsistency,
    hasEntityDefinition,
    hasWikipediaStyleIntro,
    entityMentionCount
  };
}
function analyzeTopicalCoverage($, html) {
  const bodyText = $("body").text();
  const relationshipPatterns = [
    /integrates? with/i,
    /works? with/i,
    /similar to/i,
    /alternative to/i,
    /compared to/i,
    /partner(s|ship)? with/i,
    /competitor/i,
    /used by/i,
    /trusted by/i
  ];
  const hasEntityRelationships = relationshipPatterns.some((p) => p.test(bodyText));
  const allProperNouns = bodyText.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  const uniqueEntities = [...new Set(allProperNouns)].filter((e) => e.length > 3);
  const relatedEntityCount = Math.min(uniqueEntities.length, 50);
  const hasRelatedEntities = relatedEntityCount > 5;
  let topicalDepthScore = 0;
  if (hasEntityRelationships)
    topicalDepthScore += 30;
  if (relatedEntityCount >= 10)
    topicalDepthScore += 30;
  else if (relatedEntityCount >= 5)
    topicalDepthScore += 15;
  if ($("h2, h3").length >= 5)
    topicalDepthScore += 20;
  if (bodyText.length > 5e3)
    topicalDepthScore += 20;
  return {
    hasRelatedEntities,
    relatedEntityCount,
    hasEntityRelationships,
    topicalDepthScore: Math.min(topicalDepthScore, 100)
  };
}
function analyzeKnowledgePanelSignals($, html) {
  const bodyText = $("body").text().toLowerCase();
  const schemaText = $('script[type="application/ld+json"]').text();
  return {
    hasCompanyInfo: /about us|about the company|our story|who we are/i.test(bodyText) || /Organization|Corporation/i.test(schemaText),
    hasFounderInfo: /founder|founded by|ceo|chief executive/i.test(bodyText),
    hasHeadquarters: /headquarters|based in|located in|office/i.test(bodyText) || /address/i.test(schemaText),
    hasIndustryMention: /industry|sector|market|specializ/i.test(bodyText),
    hasDateFounded: /founded in|established in|since \d{4}|founded \d{4}/i.test(bodyText) || /foundingDate/i.test(schemaText)
  };
}
function calculateEntitySEOScore(signals, clarity, coverage, kpSignals) {
  let score = 0;
  if (signals.hasOrganizationSchema || signals.hasPersonSchema)
    score += 10;
  if (signals.hasSameAsReferences)
    score += 10;
  if (signals.hasMainEntityOfPage)
    score += 5;
  if (signals.hasAboutReference)
    score += 5;
  if (clarity.primaryEntityType)
    score += 10;
  if (clarity.entityNameConsistency)
    score += 10;
  if (clarity.hasWikipediaStyleIntro)
    score += 10;
  score += Math.round(coverage.topicalDepthScore * 0.2);
  const kpCount = Object.values(kpSignals).filter(Boolean).length;
  score += kpCount * 4;
  return Math.min(score, 100);
}
function analyzeEntitySEO(html, url) {
  const $ = cheerio40.load(html);
  const issues = [];
  const entitySignals = extractEntitySignals($, html);
  const entityClarity = analyzeEntityClarity($, html);
  const topicalCoverage = analyzeTopicalCoverage($, html);
  const knowledgePanelSignals = analyzeKnowledgePanelSignals($, html);
  const entitySEOScore = calculateEntitySEOScore(
    entitySignals,
    entityClarity,
    topicalCoverage,
    knowledgePanelSignals
  );
  const recommendations = [];
  if (!entitySignals.hasOrganizationSchema && !entitySignals.hasPersonSchema) {
    recommendations.push("Add Organization or Person schema to establish entity identity");
  }
  if (!entitySignals.hasSameAsReferences) {
    recommendations.push("Add sameAs references to official social profiles and Wikipedia/Wikidata");
  }
  if (!entityClarity.hasWikipediaStyleIntro) {
    recommendations.push("Add a Wikipedia-style definition in the first paragraph (Entity is a...)");
  }
  if (!entitySignals.hasMainEntityOfPage) {
    recommendations.push("Specify mainEntityOfPage in schema to clarify what the page is about");
  }
  if (!entitySignals.hasOrganizationSchema && !entitySignals.hasPersonSchema && !entitySignals.hasProductSchema) {
    issues.push({
      code: "NO_ENTITY_SCHEMA",
      severity: "warning",
      category: "structured-data",
      title: "Missing entity schema (Organization/Person/Product)",
      description: "No schema markup defining the primary entity on this page.",
      impact: "Entity schema helps Google understand what/who this page is about for Knowledge Graph.",
      howToFix: "Add Organization, Person, or Product schema with complete properties.",
      affectedUrls: [url]
    });
  }
  if (!entitySignals.hasSameAsReferences && (entitySignals.hasOrganizationSchema || entitySignals.hasPersonSchema)) {
    issues.push({
      code: "NO_SAMEAS_REFERENCES",
      severity: "notice",
      category: "structured-data",
      title: "Entity schema missing sameAs references",
      description: "Entity schema found but no sameAs links to authoritative sources.",
      impact: "sameAs helps Google connect your entity to Knowledge Graph entries (Wikipedia, social profiles).",
      howToFix: "Add sameAs array with links to Wikipedia, Wikidata, LinkedIn, Twitter, Crunchbase, etc.",
      affectedUrls: [url],
      details: {
        hasOrganization: entitySignals.hasOrganizationSchema,
        hasPerson: entitySignals.hasPersonSchema
      }
    });
  }
  if (!entityClarity.hasWikipediaStyleIntro) {
    issues.push({
      code: "NO_ENTITY_DEFINITION",
      severity: "notice",
      category: "content",
      title: "Missing entity definition in content",
      description: "First paragraph lacks a clear definition of the primary entity.",
      impact: "Clear entity definitions help AI systems extract and cite your content correctly.",
      howToFix: 'Start content with "[Entity Name] is a [type] that [does what]" pattern.',
      affectedUrls: [url]
    });
  }
  if (!entityClarity.entityNameConsistency && entityClarity.entityMentionCount < 3) {
    issues.push({
      code: "LOW_ENTITY_CONSISTENCY",
      severity: "notice",
      category: "content",
      title: "Entity name not consistently used",
      description: "The primary entity name doesn't appear consistently across title, H1, and content.",
      impact: "Consistent entity naming strengthens topical signals for Knowledge Graph.",
      howToFix: "Ensure the exact entity name appears in title, H1, and first paragraph.",
      affectedUrls: [url],
      details: {
        entityMentionCount: entityClarity.entityMentionCount
      }
    });
  }
  if (!entitySignals.hasMainEntityOfPage && entitySignals.hasOrganizationSchema) {
    issues.push({
      code: "NO_MAIN_ENTITY_OF_PAGE",
      severity: "notice",
      category: "structured-data",
      title: "Schema missing mainEntityOfPage property",
      description: "Entity schema doesn't specify what the page is primarily about.",
      impact: "mainEntityOfPage helps Google understand the primary topic of each page.",
      howToFix: "Add mainEntityOfPage property pointing to the current URL or a @id reference.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      entitySignals,
      entityClarity,
      topicalCoverage,
      knowledgePanelSignals,
      entitySEOScore,
      recommendations
    }
  };
}

// src/audit/checks/freshness-signals.ts
import * as cheerio41 from "https://esm.sh/cheerio@1.0.0";
function extractDateSignals($, html) {
  const now = /* @__PURE__ */ new Date();
  let schemaDatePublished = null;
  let schemaDateModified = null;
  let hasSchemaDatePublished = false;
  let hasSchemaDateModified = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html() || "";
      const data = JSON.parse(content);
      const processSchema = (schema) => {
        if (schema.datePublished) {
          hasSchemaDatePublished = true;
          schemaDatePublished = schema.datePublished;
        }
        if (schema.dateModified) {
          hasSchemaDateModified = true;
          schemaDateModified = schema.dateModified;
        }
      };
      if (Array.isArray(data)) {
        data.forEach((item) => processSchema(item));
      } else if (data["@graph"]) {
        data["@graph"].forEach(processSchema);
      } else {
        processSchema(data);
      }
    } catch {
    }
  });
  const metaDatePublished = $('meta[property="article:published_time"], meta[name="date"], meta[name="pubdate"]').attr("content");
  const metaDateModified = $('meta[property="article:modified_time"], meta[name="lastmod"]').attr("content");
  const datePatterns = [
    /(?:published|posted|written|created)(?:\s+on)?:?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i,
    /(?:updated|modified|last\s+updated|revised)(?:\s+on)?:?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i,
    /(\w+\s+\d{1,2},?\s+\d{4})/,
    /(\d{4}-\d{2}-\d{2})/
  ];
  const bodyText = $("body").text();
  let visibleDateOnPage = null;
  for (const pattern of datePatterns) {
    const match = bodyText.match(pattern);
    if (match) {
      visibleDateOnPage = match[1] || match[0];
      break;
    }
  }
  let daysSincePublished = null;
  let daysSinceModified = null;
  const publishedDate = schemaDatePublished || metaDatePublished;
  if (publishedDate) {
    try {
      const date = new Date(publishedDate);
      daysSincePublished = Math.floor((now.getTime() - date.getTime()) / (1e3 * 60 * 60 * 24));
    } catch {
    }
  }
  const modifiedDate = schemaDateModified || metaDateModified;
  if (modifiedDate) {
    try {
      const date = new Date(modifiedDate);
      daysSinceModified = Math.floor((now.getTime() - date.getTime()) / (1e3 * 60 * 60 * 24));
    } catch {
    }
  }
  return {
    hasDatePublished: !!(metaDatePublished || schemaDatePublished),
    hasDateModified: !!(metaDateModified || schemaDateModified),
    hasSchemaDatePublished,
    hasSchemaDateModified,
    visibleDateOnPage,
    schemaDatePublished,
    schemaDateModified,
    daysSincePublished,
    daysSinceModified
  };
}
function analyzeFreshnessIndicators($, html) {
  const bodyText = $("body").text();
  const title = $("title").text();
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const hasCurrentYearMention = bodyText.includes(currentYear.toString()) || title.includes(currentYear.toString());
  const recentDatePatterns = [
    new RegExp(`(${currentYear}|${currentYear - 1})`),
    /this year|this month|recently|latest|newest|updated/i
  ];
  const hasRecentDateReferences = recentDatePatterns.some((p) => p.test(bodyText));
  const hasUpdateNotice = /updated?:?\s*(on|in)?\s*\w+\s+\d{1,2},?\s+\d{4}/i.test(bodyText) || /last\s+(?:updated|modified|revised)/i.test(bodyText) || $('[class*="update"], [class*="modified"]').length > 0;
  const hasChangeLog = /changelog|change\s+log|revision\s+history|update\s+history/i.test(bodyText) || $('[id*="changelog"], [class*="changelog"]').length > 0;
  const hasVersionNumber = /v?\d+\.\d+(\.\d+)?|version\s+\d+/i.test(bodyText);
  let contentFreshnessSignal = "unknown";
  if (hasCurrentYearMention && hasRecentDateReferences) {
    contentFreshnessSignal = "fresh";
  } else if (/\d{4}/.test(title) && !new RegExp(`(${currentYear}|${currentYear - 1})`).test(title)) {
    contentFreshnessSignal = "dated";
  } else if (/guide|tutorial|how\s+to|tips|basics|fundamentals/i.test(title)) {
    contentFreshnessSignal = "evergreen";
  }
  return {
    hasCurrentYearMention,
    hasRecentDateReferences,
    hasUpdateNotice,
    hasChangeLog,
    hasVersionNumber,
    contentFreshnessSignal
  };
}
function analyzeQDFRelevance($, html) {
  const title = $("title").text().toLowerCase();
  const bodyText = $("body").text().toLowerCase();
  const qdfIndicators = [];
  let updateFrequency = "monthly";
  if (/news|breaking|announcement|release|launch/i.test(title)) {
    qdfIndicators.push("News/announcement topic");
    updateFrequency = "daily";
  }
  if (/\d{4}|trends?|statistics?|data|report/i.test(title)) {
    qdfIndicators.push("Year-specific or data content");
    updateFrequency = "quarterly";
  }
  if (/review|comparison|vs\.?|alternative/i.test(title)) {
    qdfIndicators.push("Review/comparison content");
    updateFrequency = "monthly";
  }
  if (/price|pricing|cost/i.test(title)) {
    qdfIndicators.push("Pricing information");
    updateFrequency = "monthly";
  }
  if (/best|top\s+\d+/i.test(title)) {
    qdfIndicators.push("Best-of list content");
    updateFrequency = "quarterly";
  }
  if (/election|score|result|update/i.test(bodyText)) {
    qdfIndicators.push("Time-sensitive topic signals");
    updateFrequency = "weekly";
  }
  return {
    isLikelyQDFTopic: qdfIndicators.length > 0,
    qdfIndicators,
    updateFrequencyRecommendation: updateFrequency
  };
}
function analyzeAICitationOptimization(dateSignals, freshnessIndicators) {
  const hasLastUpdatedMeta = dateSignals.hasSchemaDateModified || dateSignals.hasDateModified;
  const hasClearDateFormat = !!(dateSignals.schemaDatePublished || dateSignals.schemaDateModified);
  const freshnessSchemaComplete = dateSignals.hasSchemaDatePublished && dateSignals.hasSchemaDateModified;
  let readinessScore = 0;
  if (hasLastUpdatedMeta)
    readinessScore += 30;
  if (hasClearDateFormat)
    readinessScore += 20;
  if (freshnessSchemaComplete)
    readinessScore += 30;
  if (freshnessIndicators.hasCurrentYearMention)
    readinessScore += 10;
  if (freshnessIndicators.hasUpdateNotice)
    readinessScore += 10;
  const aiCitationReadiness = readinessScore >= 70 ? "high" : readinessScore >= 40 ? "medium" : "low";
  return {
    hasLastUpdatedMeta,
    hasClearDateFormat,
    freshnessSchemaComplete,
    aiCitationReadiness
  };
}
function calculateFreshnessScore(dateSignals, freshnessIndicators, aiOptimization) {
  let score = 50;
  if (dateSignals.hasSchemaDatePublished)
    score += 10;
  if (dateSignals.hasSchemaDateModified)
    score += 15;
  if (dateSignals.visibleDateOnPage)
    score += 5;
  if (freshnessIndicators.hasCurrentYearMention)
    score += 10;
  if (freshnessIndicators.hasUpdateNotice)
    score += 10;
  if (freshnessIndicators.contentFreshnessSignal === "fresh")
    score += 10;
  else if (freshnessIndicators.contentFreshnessSignal === "dated")
    score -= 20;
  if (dateSignals.daysSinceModified !== null) {
    if (dateSignals.daysSinceModified < 30)
      score += 10;
    else if (dateSignals.daysSinceModified < 90)
      score += 5;
    else if (dateSignals.daysSinceModified > 365)
      score -= 10;
  }
  return Math.max(0, Math.min(100, score));
}
function analyzeFreshnessSignals(html, url) {
  const $ = cheerio41.load(html);
  const issues = [];
  const dateSignals = extractDateSignals($, html);
  const freshnessIndicators = analyzeFreshnessIndicators($, html);
  const qdfRelevance = analyzeQDFRelevance($, html);
  const aiCitationOptimization = analyzeAICitationOptimization(dateSignals, freshnessIndicators);
  const freshnessScore = calculateFreshnessScore(
    dateSignals,
    freshnessIndicators,
    aiCitationOptimization
  );
  const recommendations = [];
  if (!dateSignals.hasSchemaDateModified) {
    recommendations.push("Add dateModified to schema - boosts AI citation odds by ~18%");
  }
  if (qdfRelevance.isLikelyQDFTopic && !freshnessIndicators.hasUpdateNotice) {
    recommendations.push(`This QDF topic should be updated ${qdfRelevance.updateFrequencyRecommendation}`);
  }
  if (!freshnessIndicators.hasCurrentYearMention && /\d{4}/.test($("title").text())) {
    recommendations.push("Update year references in title and content for freshness signals");
  }
  if (!dateSignals.hasSchemaDateModified) {
    issues.push({
      code: "NO_DATE_MODIFIED_SCHEMA",
      severity: "warning",
      category: "structured-data",
      title: "Missing dateModified in schema",
      description: "Schema markup lacks dateModified property.",
      impact: "dateModified signals content freshness to search engines and AI assistants, boosting citation odds by ~18%.",
      howToFix: "Add dateModified property to your Article/WebPage schema with ISO 8601 format.",
      affectedUrls: [url],
      details: {
        hasDatePublished: dateSignals.hasSchemaDatePublished
      }
    });
  }
  if (qdfRelevance.isLikelyQDFTopic && dateSignals.daysSinceModified && dateSignals.daysSinceModified > 180) {
    issues.push({
      code: "STALE_QDF_CONTENT",
      severity: "warning",
      category: "content",
      title: "Time-sensitive content may be stale",
      description: `Content was last modified ${dateSignals.daysSinceModified} days ago on a topic that benefits from freshness.`,
      impact: "Query Deserves Freshness (QDF) prioritizes fresh content for this topic type.",
      howToFix: `Update this content ${qdfRelevance.updateFrequencyRecommendation}. Add new data, stats, or insights.`,
      affectedUrls: [url],
      details: {
        daysSinceModified: dateSignals.daysSinceModified,
        qdfIndicators: qdfRelevance.qdfIndicators,
        updateFrequency: qdfRelevance.updateFrequencyRecommendation
      }
    });
  }
  const title = $("title").text();
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const yearMatch = title.match(/20\d{2}/);
  if (yearMatch && parseInt(yearMatch[0]) < currentYear - 1) {
    issues.push({
      code: "OUTDATED_YEAR_IN_TITLE",
      severity: "warning",
      category: "on-page",
      title: "Title contains outdated year",
      description: `Title mentions ${yearMatch[0]} but current year is ${currentYear}.`,
      impact: "Outdated years in titles signal stale content and reduce CTR.",
      howToFix: `Update title to ${currentYear} and refresh the content to match.`,
      affectedUrls: [url],
      details: {
        yearInTitle: yearMatch[0],
        currentYear
      }
    });
  }
  if (!dateSignals.visibleDateOnPage && /blog|article|post|news/i.test(url)) {
    issues.push({
      code: "NO_VISIBLE_DATE",
      severity: "notice",
      category: "content",
      title: "No visible publish/update date",
      description: "Content page lacks a visible date for users.",
      impact: "Users prefer seeing when content was published/updated for credibility.",
      howToFix: "Display publish date and last updated date on the page.",
      affectedUrls: [url]
    });
  }
  if (aiCitationOptimization.aiCitationReadiness === "low" && qdfRelevance.isLikelyQDFTopic) {
    issues.push({
      code: "LOW_AI_CITATION_READINESS",
      severity: "notice",
      category: "content",
      title: "Low AI citation readiness for fresh content",
      description: "This page lacks freshness signals that AI assistants prioritize.",
      impact: "AI assistants cite content 25.7% fresher than organic results. Missing signals reduce citation odds.",
      howToFix: "Add dateModified schema, visible update date, and current year mentions.",
      affectedUrls: [url],
      details: {
        aiCitationReadiness: aiCitationOptimization.aiCitationReadiness,
        missingSignals: [
          !dateSignals.hasSchemaDateModified && "dateModified schema",
          !freshnessIndicators.hasUpdateNotice && "visible update notice",
          !freshnessIndicators.hasCurrentYearMention && "current year mention"
        ].filter(Boolean)
      }
    });
  }
  return {
    issues,
    data: {
      dateSignals,
      freshnessIndicators,
      qdfRelevance,
      aiCitationOptimization,
      freshnessScore,
      recommendations
    }
  };
}

// src/audit/checks/bing-optimization.ts
import * as cheerio42 from "https://esm.sh/cheerio@1.0.0";
async function analyzeBingOptimization(html, url) {
  const issues = [];
  const $ = cheerio42.load(html);
  const parsedUrl = new URL(url);
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
  const detectedIssues = [];
  const bingMetaTag = $('meta[name="msvalidate.01"]').attr("content");
  const hasBingMetaTag = !!bingMetaTag && bingMetaTag.length > 0;
  let hasBingSiteAuth = false;
  try {
    const authResponse = await httpGet(`${baseUrl}/BingSiteAuth.xml`, { timeout: 5e3 });
    hasBingSiteAuth = authResponse.status === 200 && authResponse.data.includes("<?xml") && authResponse.data.toLowerCase().includes("users");
  } catch {
  }
  let hasBingIndexNowKey = false;
  try {
    const keyPatterns = [
      `${baseUrl}/indexnow.txt`,
      `${baseUrl}/.well-known/indexnow`
    ];
    for (const keyUrl of keyPatterns) {
      try {
        const keyResponse = await httpGet(keyUrl, { timeout: 5e3 });
        if (keyResponse.status === 200 && keyResponse.data.length >= 8) {
          hasBingIndexNowKey = true;
          break;
        }
      } catch {
      }
    }
  } catch {
  }
  const scripts = $('script[type="application/ld+json"]');
  let bingPlacesDetected = false;
  scripts.each((_, el) => {
    try {
      const jsonText = $(el).html();
      if (jsonText) {
        const data = JSON.parse(jsonText);
        const schemas = Array.isArray(data) ? data : [data];
        for (const schema of schemas) {
          if (schema["@type"] === "LocalBusiness" || schema["@type"] === "Organization" && schema.address) {
            bingPlacesDetected = true;
          }
          if (schema.sameAs) {
            const sameAsUrls = Array.isArray(schema.sameAs) ? schema.sameAs : [schema.sameAs];
            if (sameAsUrls.some((u) => u.includes("bing.com/maps"))) {
              bingPlacesDetected = true;
            }
          }
        }
      }
    } catch {
    }
  });
  let bingSitemapAccessible = false;
  try {
    const sitemapResponse = await httpGet(`${baseUrl}/sitemap.xml`, { timeout: 5e3 });
    bingSitemapAccessible = sitemapResponse.status === 200 && sitemapResponse.data.includes("<?xml");
  } catch {
  }
  if (!hasBingMetaTag && !hasBingSiteAuth) {
    detectedIssues.push("No Bing site verification");
    issues.push({
      code: "BING_NOT_VERIFIED",
      severity: "warning",
      category: "ai-readiness",
      title: "Site not verified with Bing Webmaster Tools",
      description: "ChatGPT Search uses Bing's index. Verifying your site with Bing Webmaster Tools ensures proper indexing and access to Bing-specific SEO tools.",
      impact: "May reduce visibility in ChatGPT Search results and miss Bing-specific optimization opportunities.",
      howToFix: "Add Bing verification: 1) Go to Bing Webmaster Tools, 2) Add your site, 3) Choose verification method (meta tag or XML file), 4) Add the verification code to your site.",
      affectedUrls: [url],
      details: {
        hasBingMetaTag,
        hasBingSiteAuth,
        verificationMethods: [
          'Add <meta name="msvalidate.01" content="YOUR_CODE"> to <head>',
          "Upload BingSiteAuth.xml to root directory"
        ]
      }
    });
  }
  if (!hasBingIndexNowKey) {
    detectedIssues.push("No IndexNow key for Bing");
    issues.push({
      code: "BING_NO_INDEXNOW",
      severity: "notice",
      category: "ai-readiness",
      title: "IndexNow not configured for Bing instant indexing",
      description: "IndexNow enables instant content indexing by Bing (and subsequently ChatGPT Search). Without it, new content may take longer to appear in AI search results.",
      impact: "Content updates may be delayed in Bing's index and ChatGPT Search results.",
      howToFix: "Implement IndexNow: 1) Generate an API key, 2) Host the key file at /indexnow.txt or /.well-known/indexnow, 3) Notify Bing of URL changes via the IndexNow API.",
      affectedUrls: [url],
      details: {
        indexNowEndpoint: "https://www.bing.com/indexnow",
        documentation: "https://www.indexnow.org/documentation"
      }
    });
  }
  if (!bingSitemapAccessible) {
    detectedIssues.push("Sitemap not accessible");
    issues.push({
      code: "BING_SITEMAP_MISSING",
      severity: "warning",
      category: "ai-readiness",
      title: "XML sitemap not accessible for Bing crawling",
      description: "A sitemap helps Bing discover and index all your pages. Without it, some content may not be indexed and thus not appear in ChatGPT Search.",
      impact: "Bing may miss important pages, reducing your AI search coverage.",
      howToFix: "Create and submit an XML sitemap: 1) Generate sitemap.xml with all important URLs, 2) Submit it in Bing Webmaster Tools, 3) Reference it in robots.txt.",
      affectedUrls: [url]
    });
  }
  const hasLocalBusinessSchema = bingPlacesDetected;
  const hasAddressOnPage = $("address").length > 0 || html.toLowerCase().includes("street") || /\d{5}(-\d{4})?/.test(html);
  if (hasAddressOnPage && !hasLocalBusinessSchema) {
    detectedIssues.push("Local business may not be on Bing Places");
    issues.push({
      code: "BING_PLACES_MISSING",
      severity: "notice",
      category: "ai-readiness",
      title: "Local business not optimized for Bing Places",
      description: "Your site appears to have a physical location but may not be listed on Bing Places. Bing Places listings appear in Bing Maps and can be referenced by AI assistants.",
      impact: "Missing local search visibility in Bing and potential AI assistant recommendations for local queries.",
      howToFix: "Claim your Bing Places listing: 1) Go to bingplaces.com, 2) Claim or add your business, 3) Verify ownership, 4) Add complete business information.",
      affectedUrls: [url],
      details: {
        bingPlacesUrl: "https://www.bingplaces.com/",
        recommendation: "Also add sameAs link to your Bing Places listing in Organization schema"
      }
    });
  }
  return {
    issues,
    data: {
      hasBingSiteAuth,
      hasBingMetaTag,
      hasBingIndexNowKey,
      bingPlacesDetected,
      bingSitemapAccessible,
      issues: detectedIssues
    }
  };
}

// src/audit/checks/ai-content-structure.ts
import * as cheerio43 from "https://esm.sh/cheerio@1.0.0";
function analyzeAIContentStructure(html, url) {
  const issues = [];
  const $ = cheerio43.load(html);
  $("nav, footer, aside, script, style, noscript, header").remove();
  const tables = $("table");
  const tableCount = tables.length;
  let hasComparisonTable = false;
  let hasDataTable = false;
  tables.each((_, table) => {
    const $table = $(table);
    const headers = $table.find("th").length;
    const rows = $table.find("tr").length;
    const cells = $table.find("td").length;
    if (headers >= 2 && rows >= 3) {
      hasComparisonTable = true;
    }
    const cellTexts = $table.find("td").map((_2, td) => $(td).text()).get();
    const hasNumbers = cellTexts.some((text) => /\d+/.test(text));
    if (hasNumbers && cells >= 4) {
      hasDataTable = true;
    }
  });
  const orderedLists = $("ol").length;
  const unorderedLists = $("ul").not("nav ul").length;
  let hasStepByStep = false;
  $("ol").each((_, ol) => {
    const items = $(ol).find("> li").length;
    if (items >= 3) {
      hasStepByStep = true;
    }
  });
  let hasBulletedFeatures = false;
  $("ul").not("nav ul").each((_, ul) => {
    const items = $(ul).find("> li").length;
    if (items >= 3) {
      hasBulletedFeatures = true;
    }
  });
  const bodyText = $("body").text().toLowerCase();
  const headings = $("h1, h2, h3, h4, h5, h6");
  let questionCount = 0;
  let hasDirectAnswers = false;
  headings.each((_, heading) => {
    const text = $(heading).text();
    if (text.includes("?") || /^(what|how|why|when|where|who|which|can|does|is|are|should|will)\s/i.test(text)) {
      questionCount++;
      const nextP = $(heading).next("p");
      if (nextP.length) {
        const answerText = nextP.text();
        if (answerText.length > 20 && answerText.length < 300) {
          hasDirectAnswers = true;
        }
      }
    }
  });
  const hasExplicitQA = $('[itemtype*="FAQPage"]').length > 0 || $('[itemtype*="Question"]').length > 0 || $('.faq, #faq, [class*="faq"], [id*="faq"]').length > 0 || $("details summary").length >= 2 || $("dt").length >= 2;
  const paragraphs = $("p");
  let shortParagraphCount = 0;
  let totalParagraphs = 0;
  let hasDefinitions = false;
  let hasConciseStatements = false;
  paragraphs.each((_, p) => {
    const text = $(p).text().trim();
    if (text.length < 20)
      return;
    totalParagraphs++;
    if (text.length < 150) {
      shortParagraphCount++;
    }
    if (/^[A-Z][^.]+\s+(is|are|refers to|means|describes)\s+/i.test(text)) {
      hasDefinitions = true;
    }
    if (text.length < 200 && (text.includes(":") || /^(The|A|An)\s+\w+/.test(text) || /^\d+\.?\s+/.test(text))) {
      hasConciseStatements = true;
    }
  });
  const shortParagraphRatio = totalParagraphs > 0 ? shortParagraphCount / totalParagraphs : 0;
  let structureScore = 50;
  if (hasComparisonTable)
    structureScore += 10;
  if (hasDataTable)
    structureScore += 5;
  if (hasStepByStep)
    structureScore += 10;
  if (hasBulletedFeatures)
    structureScore += 5;
  if (hasExplicitQA)
    structureScore += 10;
  if (questionCount >= 3)
    structureScore += 5;
  if (hasDirectAnswers)
    structureScore += 5;
  if (hasDefinitions)
    structureScore += 5;
  if (hasConciseStatements)
    structureScore += 5;
  if (shortParagraphRatio > 0.3)
    structureScore += 5;
  if (tableCount === 0 && orderedLists === 0 && unorderedLists === 0) {
    structureScore -= 15;
  }
  if (questionCount === 0) {
    structureScore -= 5;
  }
  structureScore = Math.max(0, Math.min(100, structureScore));
  if (!hasComparisonTable && bodyText.includes("compar") || bodyText.includes("vs") || bodyText.includes("versus")) {
    issues.push({
      code: "AI_NO_COMPARISON_TABLE",
      severity: "notice",
      category: "ai-readiness",
      title: "Comparison content without table format",
      description: "Your content mentions comparisons but doesn't use a table format. AI systems can easily parse and quote table data.",
      impact: "AI may not accurately extract comparison data, reducing chances of being cited in AI-generated comparisons.",
      howToFix: "Convert comparison content to HTML tables with clear headers. Example: Feature | Option A | Option B",
      affectedUrls: [url]
    });
  }
  if (!hasStepByStep && (bodyText.includes("step") || bodyText.includes("how to") || bodyText.includes("guide"))) {
    issues.push({
      code: "AI_NO_NUMBERED_STEPS",
      severity: "notice",
      category: "ai-readiness",
      title: "Procedural content without numbered steps",
      description: "Your content appears to be a guide or how-to but doesn't use numbered lists. AI prefers numbered lists for step-by-step content.",
      impact: "AI may not accurately quote your steps in order, or may skip your content for better-structured alternatives.",
      howToFix: "Convert step-by-step instructions to <ol> (ordered list) format with clear, actionable items.",
      affectedUrls: [url]
    });
  }
  if (!hasExplicitQA && questionCount === 0) {
    issues.push({
      code: "AI_NO_QA_FORMAT",
      severity: "notice",
      category: "ai-readiness",
      title: "No question-and-answer format detected",
      description: "Content lacks explicit Q&A structure. AI systems often look for clear question-answer pairs to provide direct responses.",
      impact: "Lower chance of being featured in AI direct answers or FAQ-style responses.",
      howToFix: "Add FAQ section with common questions as headings (H2/H3) followed by concise answers. Implement FAQ schema markup.",
      affectedUrls: [url],
      details: {
        suggestions: [
          "Use question words in headings (What, How, Why, etc.)",
          "Follow questions with short, direct answer paragraphs",
          "Add FAQ schema markup for structured data",
          "Consider using <details>/<summary> for expandable Q&A"
        ]
      }
    });
  }
  if (questionCount >= 2 && !hasDirectAnswers) {
    issues.push({
      code: "AI_QUESTIONS_NO_DIRECT_ANSWERS",
      severity: "notice",
      category: "ai-readiness",
      title: "Questions in headings lack direct answers",
      description: `Found ${questionCount} question-style headings but answers are too long or not immediately following. AI prefers concise answers right after questions.`,
      impact: "AI may struggle to extract clear answers, reducing citation likelihood.",
      howToFix: "Start each answer section with a 1-2 sentence direct answer, then expand with details. First sentence should standalone as a complete answer.",
      affectedUrls: [url]
    });
  }
  if (!hasDefinitions && (bodyText.includes("what is") || bodyText.includes("definition"))) {
    issues.push({
      code: "AI_NO_DEFINITIONS",
      severity: "notice",
      category: "ai-readiness",
      title: "Missing clear definitions",
      description: 'Content discusses concepts but lacks Wikipedia-style definitions. AI loves clear "X is a..." statements.',
      impact: "Less likely to be cited for definitional queries in AI search.",
      howToFix: 'Add clear definitions early in content: "[Term] is a [category] that [distinguishing features]." Make first paragraph a complete definition.',
      affectedUrls: [url]
    });
  }
  if (structureScore < 50) {
    issues.push({
      code: "AI_LOW_STRUCTURE_SCORE",
      severity: "warning",
      category: "ai-readiness",
      title: "Content structure not optimized for AI parsing",
      description: `AI structure score: ${structureScore}/100. Content lacks structured elements that AI can easily parse and quote.`,
      impact: "Lower likelihood of being cited in AI-generated answers due to poor content structure.",
      howToFix: "Improve content structure: add tables for data, numbered lists for steps, bullet points for features, Q&A sections for common questions.",
      affectedUrls: [url],
      details: {
        structureScore,
        hasTable: tableCount > 0,
        hasOrderedList: orderedLists > 0,
        hasUnorderedList: unorderedLists > 0,
        hasQAFormat: hasExplicitQA || questionCount > 0
      }
    });
  }
  return {
    issues,
    data: {
      tables: {
        count: tableCount,
        hasComparisonTable,
        hasDataTable
      },
      lists: {
        orderedLists,
        unorderedLists,
        hasStepByStep,
        hasBulletedFeatures
      },
      qaFormat: {
        hasExplicitQA,
        questionCount,
        hasDirectAnswers
      },
      quotability: {
        hasDefinitions,
        hasConciseStatements,
        shortParagraphRatio
      },
      structureScore
    }
  };
}

// src/audit/checks/citation-quality.ts
import * as cheerio44 from "https://esm.sh/cheerio@1.0.0";
var REPUTABLE_SOURCES = {
  academic: [
    "scholar.google.com",
    "pubmed.ncbi.nlm.nih.gov",
    "ncbi.nlm.nih.gov",
    "arxiv.org",
    "jstor.org",
    "researchgate.net",
    "sciencedirect.com",
    "nature.com",
    "science.org",
    "springer.com",
    "wiley.com"
  ],
  government: [
    "gov",
    "gov.uk",
    "europa.eu",
    "un.org",
    "who.int",
    "cdc.gov",
    "nih.gov",
    "fda.gov",
    "epa.gov",
    "sec.gov",
    "ftc.gov"
  ],
  educational: [
    ".edu",
    "mit.edu",
    "stanford.edu",
    "harvard.edu",
    "oxford.ac.uk",
    "cambridge.org",
    "coursera.org",
    "khanacademy.org"
  ],
  authoritative: [
    "wikipedia.org",
    "britannica.com",
    "statista.com",
    "pewresearch.org",
    "gallup.com",
    "mckinsey.com",
    "hbr.org",
    "forbes.com",
    "reuters.com",
    "apnews.com",
    "bbc.com",
    "nytimes.com",
    "wsj.com",
    "economist.com"
  ],
  technical: [
    "github.com",
    "stackoverflow.com",
    "developer.mozilla.org",
    "w3.org",
    "ietf.org",
    "rfc-editor.org",
    "docs.google.com",
    "developers.google.com"
  ]
};
function analyzeCitationQuality(html, url) {
  const issues = [];
  const $ = cheerio44.load(html);
  const parsedUrl = new URL(url);
  const currentDomain = parsedUrl.hostname;
  const $content = $("body").clone();
  $content.find("nav, footer, aside, script, style, noscript").remove();
  const links = $content.find("a[href]");
  let totalLinks = 0;
  let externalLinks = 0;
  let citationLinks = 0;
  const reputableSources = {
    academic: [],
    government: [],
    educational: [],
    authoritative: [],
    technical: []
  };
  links.each((_, link) => {
    const href = $(link).attr("href");
    if (!href)
      return;
    totalLinks++;
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === currentDomain || linkUrl.hostname.endsWith(`.${currentDomain}`)) {
        return;
      }
      if (linkUrl.hostname.includes("facebook.com") || linkUrl.hostname.includes("twitter.com") || linkUrl.hostname.includes("instagram.com") || linkUrl.hostname.includes("linkedin.com/share") || linkUrl.hostname.includes("pinterest.com")) {
        return;
      }
      externalLinks++;
      const hostname = linkUrl.hostname.toLowerCase();
      for (const source of REPUTABLE_SOURCES.academic) {
        if (hostname.includes(source)) {
          reputableSources.academic.push(hostname);
          citationLinks++;
          return;
        }
      }
      for (const source of REPUTABLE_SOURCES.government) {
        if (hostname.endsWith(source) || hostname.includes(`.${source}`)) {
          reputableSources.government.push(hostname);
          citationLinks++;
          return;
        }
      }
      for (const source of REPUTABLE_SOURCES.educational) {
        if (hostname.endsWith(source) || hostname.includes(source)) {
          reputableSources.educational.push(hostname);
          citationLinks++;
          return;
        }
      }
      for (const source of REPUTABLE_SOURCES.authoritative) {
        if (hostname.includes(source)) {
          reputableSources.authoritative.push(hostname);
          citationLinks++;
          return;
        }
      }
      for (const source of REPUTABLE_SOURCES.technical) {
        if (hostname.includes(source)) {
          reputableSources.technical.push(hostname);
          citationLinks++;
          return;
        }
      }
    } catch {
    }
  });
  const bodyText = $content.text();
  const bodyHtml = $content.html() || "";
  const hasInlineCitations = /\[\d+\]/.test(bodyText) || /\(Source:/i.test(bodyText) || /\(Citation:/i.test(bodyText) || /according to/i.test(bodyText) || /study (by|from|shows|found)/i.test(bodyText);
  const hasReferencesSection = /(references|sources|citations|bibliography|works cited)/i.test(
    $("h2, h3, h4, h5, h6").text()
  ) || $("#references, .references, #sources, .sources, #citations").length > 0;
  const statisticPatterns = [
    /(\d+(?:\.\d+)?)\s*%/g,
    // Percentages
    /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(million|billion|trillion)/gi,
    // Large numbers
    /\$(\d+(?:,\d{3})*(?:\.\d+)?)/g,
    // Dollar amounts
    /(\d+)\s*out of\s*(\d+)/gi,
    // Ratios
    /(\d+)x\s/gi
    // Multipliers
  ];
  let statisticsWithSources = 0;
  let statisticsWithoutSources = 0;
  $content.find("p").each((_, p) => {
    const pText = $(p).text();
    const pHtml = $(p).html() || "";
    let hasStatistic = false;
    for (const pattern of statisticPatterns) {
      if (pattern.test(pText)) {
        hasStatistic = true;
        pattern.lastIndex = 0;
        break;
      }
    }
    if (hasStatistic) {
      const hasLink = $(p).find("a[href]").length > 0;
      const hasCitationText = /\(.*\d{4}\)|according to|source:|study/i.test(pText);
      if (hasLink || hasCitationText) {
        statisticsWithSources++;
      } else {
        statisticsWithoutSources++;
      }
    }
  });
  const hasStatistics = statisticsWithSources + statisticsWithoutSources > 0;
  let citationScore = 30;
  if (reputableSources.academic.length > 0)
    citationScore += 15;
  if (reputableSources.government.length > 0)
    citationScore += 15;
  if (reputableSources.educational.length > 0)
    citationScore += 10;
  if (reputableSources.authoritative.length > 0)
    citationScore += 10;
  if (reputableSources.technical.length > 0)
    citationScore += 5;
  if (hasInlineCitations)
    citationScore += 10;
  if (hasReferencesSection)
    citationScore += 10;
  if (hasStatistics) {
    const citedRatio = statisticsWithSources / (statisticsWithSources + statisticsWithoutSources);
    if (citedRatio >= 0.8)
      citationScore += 10;
    else if (citedRatio >= 0.5)
      citationScore += 5;
    else if (citedRatio < 0.3)
      citationScore -= 10;
  }
  if (externalLinks === 0)
    citationScore -= 20;
  citationScore = Math.max(0, Math.min(100, citationScore));
  const totalReputable = Object.values(reputableSources).flat().length;
  if (totalReputable === 0 && externalLinks > 0) {
    issues.push({
      code: "AI_NO_REPUTABLE_CITATIONS",
      severity: "warning",
      category: "ai-readiness",
      title: "No reputable sources cited",
      description: "Content has external links but none to recognized authoritative sources. AI prioritizes content that cites reputable sources.",
      impact: "Lower E-E-A-T signals and reduced likelihood of AI citing your content.",
      howToFix: "Add citations to reputable sources: academic papers, government sites (.gov), educational institutions (.edu), or established publications.",
      affectedUrls: [url],
      details: {
        externalLinks,
        reputableLinks: 0,
        suggestedSources: [
          "Academic: scholar.google.com, pubmed.ncbi.nlm.nih.gov",
          "Government: .gov, who.int, cdc.gov",
          "Technical: developer.mozilla.org, w3.org"
        ]
      }
    });
  }
  if (externalLinks === 0 && totalLinks > 0) {
    issues.push({
      code: "AI_NO_EXTERNAL_CITATIONS",
      severity: "warning",
      category: "ai-readiness",
      title: "No external sources linked",
      description: "Content has no external links. AI values content that references and links to authoritative sources.",
      impact: "Appears self-contained without external validation, reducing trust signals for AI.",
      howToFix: "Add relevant external links to support your claims. Link to studies, official documentation, or authoritative sources.",
      affectedUrls: [url]
    });
  }
  if (statisticsWithoutSources > 0) {
    issues.push({
      code: "AI_UNCITED_STATISTICS",
      severity: "warning",
      category: "ai-readiness",
      title: "Statistics without source citations",
      description: `Found ${statisticsWithoutSources} statistic(s) without linked sources. AI is trained to prefer claims backed by citations.`,
      impact: "Uncited statistics reduce content credibility and E-E-A-T signals.",
      howToFix: 'Add source links or citations for all statistics. Include the source name and year when possible (e.g., "according to [Source, 2024]").',
      affectedUrls: [url],
      details: {
        statisticsWithSources,
        statisticsWithoutSources,
        citedRatio: statisticsWithSources / (statisticsWithSources + statisticsWithoutSources)
      }
    });
  }
  const wordCount = bodyText.split(/\s+/).length;
  if (wordCount > 1e3 && !hasReferencesSection && citationLinks > 0) {
    issues.push({
      code: "AI_NO_REFERENCES_SECTION",
      severity: "notice",
      category: "ai-readiness",
      title: "No dedicated references section",
      description: "Long-form content with citations but no dedicated references section. A references section signals academic rigor.",
      impact: "Missing opportunity to demonstrate comprehensive research and boost E-E-A-T.",
      howToFix: 'Add a "References" or "Sources" section at the end listing all cited sources with full attribution.',
      affectedUrls: [url]
    });
  }
  if (citationScore < 40) {
    issues.push({
      code: "AI_LOW_CITATION_QUALITY",
      severity: "warning",
      category: "ai-readiness",
      title: "Content citation quality needs improvement",
      description: `Citation quality score: ${citationScore}/100. Well-cited content ranks higher in AI search results.`,
      impact: "Low citation quality signals reduce E-E-A-T and AI citation likelihood.",
      howToFix: "Improve citations: 1) Link to reputable sources, 2) Cite statistics with sources, 3) Add a references section, 4) Use inline citations for claims.",
      affectedUrls: [url],
      details: {
        citationScore,
        externalLinks,
        reputableSources: totalReputable,
        statisticsWithSources,
        statisticsWithoutSources
      }
    });
  }
  return {
    issues,
    data: {
      totalLinks,
      externalLinks,
      citationLinks,
      reputableSources,
      citationPatterns: {
        hasInlineCitations,
        hasReferencesSection,
        hasStatistics,
        statisticsWithSources,
        statisticsWithoutSources
      },
      citationScore
    }
  };
}

// src/audit/checks/answer-conciseness.ts
import * as cheerio45 from "https://esm.sh/cheerio@1.0.0";
var IDEAL_ANSWER_LENGTH = { min: 40, max: 150 };
var MAX_FIRST_SENTENCE = 200;
function analyzeAnswerConciseness(html, url) {
  const issues = [];
  const $ = cheerio45.load(html);
  $("nav, footer, aside, script, style, noscript, header").remove();
  const headings = $("h1, h2, h3, h4, h5, h6");
  let totalHeadings = 0;
  let questionHeadings = 0;
  let headingsWithDirectAnswers = 0;
  const firstSentenceLengths = [];
  let shortAnswersCount = 0;
  let longAnswersCount = 0;
  const quotableAnswers = [];
  const questionPatterns = [
    /\?$/,
    /^(what|how|why|when|where|who|which|can|does|is|are|should|will|would|could)\s/i
  ];
  headings.each((_, heading) => {
    const $heading = $(heading);
    const headingText2 = $heading.text().trim();
    totalHeadings++;
    const isQuestion = questionPatterns.some((p) => p.test(headingText2));
    if (isQuestion) {
      questionHeadings++;
      let $next = $heading.next();
      let answerText = "";
      while ($next.length && !$next.is("h1, h2, h3, h4, h5, h6")) {
        if ($next.is("p")) {
          answerText += $next.text().trim() + " ";
        }
        $next = $next.next();
      }
      if (answerText) {
        const firstSentenceMatch = answerText.match(/^[^.!?]+[.!?]/);
        const firstSentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : "";
        if (firstSentence) {
          firstSentenceLengths.push(firstSentence.length);
          const isDirectAnswer = firstSentence.length <= MAX_FIRST_SENTENCE && !firstSentence.toLowerCase().startsWith("well,") && !firstSentence.toLowerCase().startsWith("so,") && !firstSentence.toLowerCase().startsWith("basically,") && (/^(yes|no|the|a|an|it|they|this|there|you|we)/i.test(firstSentence) || /^[A-Z][a-z]+\s+(is|are|was|were|can|should|will)/i.test(firstSentence));
          if (isDirectAnswer) {
            headingsWithDirectAnswers++;
            if (firstSentence.length >= IDEAL_ANSWER_LENGTH.min && firstSentence.length <= IDEAL_ANSWER_LENGTH.max) {
              shortAnswersCount++;
              quotableAnswers.push(firstSentence);
            } else if (firstSentence.length > IDEAL_ANSWER_LENGTH.max) {
              longAnswersCount++;
            }
          }
        }
      }
    }
  });
  const definitions = [];
  $("p").each((_, p) => {
    const text = $(p).text().trim();
    const defMatch = text.match(/^([A-Z][^.]{0,50})\s+(is|are|refers to|means|describes|represents)\s+([^.]+\.)/);
    if (defMatch) {
      definitions.push(defMatch[0]);
    }
  });
  const bodyText = $("body").text().toLowerCase();
  const headingText = headings.map((_, h) => $(h).text().toLowerCase()).get().join(" ");
  const hasSummary = headingText.includes("summary") || headingText.includes("conclusion") || headingText.includes("key takeaways") || $('[class*="summary"], [id*="summary"]').length > 0;
  const hasTLDR = bodyText.includes("tl;dr") || bodyText.includes("tldr") || bodyText.includes("in short") || bodyText.includes("in summary") || headingText.includes("tl;dr");
  const hasKeyPoints = headingText.includes("key points") || headingText.includes("main points") || headingText.includes("highlights") || $('[class*="key-points"], [class*="highlights"]').length > 0;
  const averageFirstSentenceLength = firstSentenceLengths.length > 0 ? firstSentenceLengths.reduce((a, b) => a + b, 0) / firstSentenceLengths.length : 0;
  let concisenessScore = 50;
  if (questionHeadings > 0) {
    const answerRatio = headingsWithDirectAnswers / questionHeadings;
    concisenessScore += answerRatio * 20;
  }
  if (shortAnswersCount >= 3)
    concisenessScore += 15;
  else if (shortAnswersCount >= 1)
    concisenessScore += 10;
  if (longAnswersCount > shortAnswersCount)
    concisenessScore -= 10;
  if (definitions.length >= 2)
    concisenessScore += 10;
  else if (definitions.length === 1)
    concisenessScore += 5;
  if (hasSummary)
    concisenessScore += 5;
  if (hasTLDR)
    concisenessScore += 5;
  if (hasKeyPoints)
    concisenessScore += 5;
  if (averageFirstSentenceLength > 0 && averageFirstSentenceLength <= 150) {
    concisenessScore += 5;
  } else if (averageFirstSentenceLength > 200) {
    concisenessScore -= 10;
  }
  concisenessScore = Math.max(0, Math.min(100, concisenessScore));
  if (questionHeadings > 0 && headingsWithDirectAnswers < questionHeadings * 0.5) {
    issues.push({
      code: "AI_INDIRECT_ANSWERS",
      severity: "warning",
      category: "ai-readiness",
      title: "Questions lack direct, quotable answers",
      description: `${questionHeadings} question headings found but only ${headingsWithDirectAnswers} have direct answers. AI prefers content that answers questions immediately.`,
      impact: "AI may skip your content for sources with clearer, more direct answers.",
      howToFix: 'Start answer paragraphs with a direct 1-2 sentence answer. Avoid filler words like "Well," "So," "Basically." Lead with the answer, then explain.',
      affectedUrls: [url],
      details: {
        questionHeadings,
        directAnswers: headingsWithDirectAnswers,
        examples: quotableAnswers.slice(0, 3)
      }
    });
  }
  if (longAnswersCount > 0 && longAnswersCount > shortAnswersCount) {
    issues.push({
      code: "AI_VERBOSE_ANSWERS",
      severity: "notice",
      category: "ai-readiness",
      title: "Answer opening sentences are too long",
      description: `Found ${longAnswersCount} answers with opening sentences over 150 characters. AI quotes shorter, punchier statements.`,
      impact: "Long opening sentences are less likely to be quoted verbatim by AI.",
      howToFix: 'Keep first sentences under 150 characters. Move details to subsequent sentences. Think "tweet-length" for opening answers.',
      affectedUrls: [url],
      details: {
        averageLength: Math.round(averageFirstSentenceLength),
        idealLength: `${IDEAL_ANSWER_LENGTH.min}-${IDEAL_ANSWER_LENGTH.max} characters`
      }
    });
  }
  const hasDefinitionalQueries = bodyText.includes("what is") || bodyText.includes("what are") || bodyText.includes("definition") || bodyText.includes("meaning of");
  if (hasDefinitionalQueries && definitions.length === 0) {
    issues.push({
      code: "AI_NO_CLEAR_DEFINITIONS",
      severity: "notice",
      category: "ai-readiness",
      title: "Definitional content lacks clear definitions",
      description: 'Content discusses "what is" topics but lacks Wikipedia-style definitions. AI heavily favors clear "[Term] is a [definition]" patterns.',
      impact: "Missing out on definitional search citations and AI answer boxes.",
      howToFix: 'Add clear definitions: "[Term] is a [category] that [key characteristics]." Place definitions early in content or in dedicated sections.',
      affectedUrls: [url],
      details: {
        suggestion: 'Example: "SEO is the practice of optimizing websites to rank higher in search engine results."'
      }
    });
  }
  const wordCount = $("body").text().split(/\s+/).length;
  if (wordCount > 1500 && !hasSummary && !hasTLDR && !hasKeyPoints) {
    issues.push({
      code: "AI_NO_SUMMARY",
      severity: "notice",
      category: "ai-readiness",
      title: "Long content lacks summary or key takeaways",
      description: "Content is over 1500 words but has no summary, TL;DR, or key points section. AI often pulls from summary sections.",
      impact: "Harder for AI to extract key points; may cite competitors with better-structured summaries.",
      howToFix: 'Add a "Key Takeaways" section at the top or a "Summary" at the bottom. Use bullet points for scannable key points.',
      affectedUrls: [url]
    });
  }
  if (concisenessScore < 50) {
    issues.push({
      code: "AI_LOW_CONCISENESS",
      severity: "warning",
      category: "ai-readiness",
      title: "Content lacks concise, quotable answers",
      description: `Conciseness score: ${concisenessScore}/100. AI prefers content with clear, succinct answers it can quote directly.`,
      impact: "Reduced likelihood of AI citing your content in direct answers.",
      howToFix: "Restructure content: lead with direct answers, add definitions, include TL;DR sections, keep opening sentences short.",
      affectedUrls: [url],
      details: {
        concisenessScore,
        quotableAnswers: quotableAnswers.length,
        definitions: definitions.length,
        hasSummary,
        hasTLDR
      }
    });
  }
  return {
    issues,
    data: {
      headings: {
        total: totalHeadings,
        questions: questionHeadings,
        withDirectAnswers: headingsWithDirectAnswers
      },
      answers: {
        averageFirstSentenceLength: Math.round(averageFirstSentenceLength),
        shortAnswersCount,
        longAnswersCount,
        quotableAnswers: quotableAnswers.slice(0, 5)
      },
      definitions: {
        count: definitions.length,
        examples: definitions.slice(0, 3)
      },
      keyTakeaways: {
        hasSummary,
        hasTLDR,
        hasKeyPoints
      },
      concisenessScore
    }
  };
}

// src/audit/checks/brand-mention-optimization.ts
import * as cheerio46 from "https://esm.sh/cheerio@1.0.0";
var BRAND_DEFINITION_PATTERNS = [
  /(?:we are|we're|is a|is the|is an)\s+(?:leading|premier|top|best|trusted|innovative|professional)/i,
  /(?:our mission|our vision|we help|we provide|we offer|we specialize)/i,
  /(?:founded in|established in|since \d{4}|for over \d+)/i
];
var USP_PATTERNS = [
  /(?:only|unique|exclusive|proprietary|patented|first|original)/i,
  /(?:unlike|different from|better than|compared to)/i,
  /(?:guarantee|warranty|promise|commitment)/i,
  /(?:free|no cost|complimentary|included)/i,
  /(?:\d+%|\d+x|\d+ times|faster|cheaper|easier)/i
];
var VALUE_PROP_PATTERNS = [
  /(?:save|reduce|increase|improve|boost|grow|maximize|minimize)/i,
  /(?:get|achieve|reach|attain|unlock|discover)/i,
  /(?:without|no need|don't have to|eliminates|removes)/i
];
var REVIEW_PLATFORMS = [
  "trustpilot.com",
  "g2.com",
  "capterra.com",
  "yelp.com",
  "bbb.org",
  "glassdoor.com",
  "indeed.com",
  "tripadvisor.com",
  "angi.com",
  "homeadvisor.com",
  "avvo.com",
  "healthgrades.com",
  "zocdoc.com",
  "clutch.co",
  "producthunt.com",
  "getapp.com"
];
function analyzeBrandMentionOptimization(html, url) {
  const issues = [];
  const $ = cheerio46.load(html);
  const parsedUrl = new URL(url);
  const $content = $("body").clone();
  $content.find("nav, footer, script, style, noscript").remove();
  const bodyText = $content.text();
  const bodyHtml = $content.html() || "";
  const domainParts = parsedUrl.hostname.replace("www.", "").split(".");
  const potentialBrandName = domainParts[0];
  const title = $("title").text();
  const ogSiteName = $('meta[property="og:site_name"]').attr("content") || "";
  const brandNameRegex = new RegExp(potentialBrandName, "gi");
  const brandMentionCount = (bodyText.match(brandNameRegex) || []).length;
  let hasBrandDefinition = false;
  let hasUSP = false;
  let hasValueProposition = false;
  let hasBrandStatement = false;
  const quotableBrandStatements = [];
  $content.find("p, li, h1, h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length < 20 || text.length > 300)
      return;
    for (const pattern of BRAND_DEFINITION_PATTERNS) {
      if (pattern.test(text)) {
        hasBrandDefinition = true;
        if (text.length <= 200 && quotableBrandStatements.length < 5) {
          quotableBrandStatements.push(text);
        }
        break;
      }
    }
    for (const pattern of USP_PATTERNS) {
      if (pattern.test(text)) {
        hasUSP = true;
        break;
      }
    }
    for (const pattern of VALUE_PROP_PATTERNS) {
      if (pattern.test(text)) {
        hasValueProposition = true;
        break;
      }
    }
  });
  hasBrandStatement = $('[class*="hero"] p, [class*="about"] p, [id*="hero"] p, [id*="about"] p').length > 0 || $("main > section:first-child p").length > 0;
  const headingText = $("h1, h2, h3, h4").map((_, h) => $(h).text().toLowerCase()).get().join(" ");
  const linkText = $("a").map((_, a) => $(a).text().toLowerCase()).get().join(" ");
  const allLinks = $("a[href]").map((_, a) => $(a).attr("href") || "").get();
  const hasPricingInfo = headingText.includes("pricing") || headingText.includes("plans") || headingText.includes("cost") || linkText.includes("pricing") || allLinks.some((href) => href.includes("pricing") || href.includes("plans"));
  const hasAboutSection = headingText.includes("about") || headingText.includes("who we are") || headingText.includes("our story") || allLinks.some((href) => href.includes("about"));
  const hasFAQSection = headingText.includes("faq") || headingText.includes("frequently asked") || headingText.includes("questions") || $('[itemtype*="FAQPage"]').length > 0 || $("details summary").length >= 2;
  const hasTestimonials = headingText.includes("testimonial") || headingText.includes("review") || headingText.includes("what our") || headingText.includes("customer") || $('[class*="testimonial"], [class*="review"], [id*="testimonial"]').length > 0 || $("blockquote").length >= 2;
  const hasProofPoints = headingText.includes("case stud") || headingText.includes("success") || headingText.includes("results") || /\d+\+?\s*(customers|clients|users|companies|businesses)/i.test(bodyText) || /\d+%\s*(increase|decrease|improvement|growth)/i.test(bodyText);
  const hasConsistentNaming = brandMentionCount >= 3 && ogSiteName.length > 0;
  const hasContactInfo = $('a[href^="tel:"], a[href^="mailto:"]').length > 0 || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(bodyText) || bodyText.toLowerCase().includes("contact");
  const socialLinks = $('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="instagram.com"]');
  const hasSocialLinks = socialLinks.length >= 2;
  const hasReviewLinks = allLinks.some((href) => {
    const lowerHref = href.toLowerCase();
    return REVIEW_PLATFORMS.some((platform) => lowerHref.includes(platform));
  });
  let brandScore = 30;
  if (hasBrandDefinition)
    brandScore += 15;
  if (hasUSP)
    brandScore += 10;
  if (hasValueProposition)
    brandScore += 10;
  if (brandMentionCount >= 5)
    brandScore += 5;
  if (hasPricingInfo)
    brandScore += 5;
  if (hasAboutSection)
    brandScore += 5;
  if (hasFAQSection)
    brandScore += 5;
  if (hasTestimonials)
    brandScore += 10;
  if (hasProofPoints)
    brandScore += 10;
  if (hasConsistentNaming)
    brandScore += 5;
  if (hasContactInfo)
    brandScore += 3;
  if (hasSocialLinks)
    brandScore += 3;
  if (hasReviewLinks)
    brandScore += 5;
  brandScore = Math.min(100, Math.max(0, brandScore));
  if (!hasBrandDefinition) {
    issues.push({
      code: "AI_NO_BRAND_DEFINITION",
      severity: "warning",
      category: "ai-readiness",
      title: "No clear brand definition for AI to extract",
      description: 'AI systems look for clear "Brand X is..." statements to quote when recommending brands. Your page lacks quotable brand definitions.',
      impact: "AI cannot accurately describe your brand, reducing recommendation likelihood.",
      howToFix: 'Add a clear brand definition early in your content: "[Brand] is a [category] that [key benefit]." Make it quotable (under 200 characters).',
      affectedUrls: [url],
      details: {
        suggestion: `Example: "${potentialBrandName.charAt(0).toUpperCase() + potentialBrandName.slice(1)} is a [category] that helps [audience] [achieve benefit]."`
      }
    });
  }
  if (!hasUSP) {
    issues.push({
      code: "AI_NO_USP",
      severity: "notice",
      category: "ai-readiness",
      title: "No unique selling proposition (USP) detected",
      description: "AI needs clear differentiators to recommend your brand over competitors. No USP patterns found.",
      impact: "AI may not distinguish your brand from competitors when making recommendations.",
      howToFix: 'Add clear differentiators: "The only...", "Unlike competitors...", "Guaranteed...", specific numbers (e.g., "50% faster").',
      affectedUrls: [url]
    });
  }
  const missingTopics = [];
  if (!hasPricingInfo)
    missingTopics.push("pricing");
  if (!hasFAQSection)
    missingTopics.push("FAQ");
  if (!hasTestimonials)
    missingTopics.push("testimonials/reviews");
  if (!hasProofPoints)
    missingTopics.push("proof points/case studies");
  if (missingTopics.length >= 2) {
    issues.push({
      code: "AI_INCOMPLETE_BRAND_COVERAGE",
      severity: "notice",
      category: "ai-readiness",
      title: "Incomplete brand topic coverage",
      description: `Missing key brand topics that AI uses to answer queries: ${missingTopics.join(", ")}. AI may rely on third-party sources instead.`,
      impact: "Third-party sites may define your brand narrative instead of you.",
      howToFix: "Cover key brand topics on your site: pricing, positioning, proof (testimonials, case studies), and FAQs.",
      affectedUrls: [url],
      details: {
        missingTopics,
        recommendation: "Control your brand narrative by having authoritative content on these topics on your own site."
      }
    });
  }
  if (!hasReviewLinks && !hasTestimonials) {
    issues.push({
      code: "AI_NO_REVIEW_INTEGRATION",
      severity: "notice",
      category: "ai-readiness",
      title: "No review platform integration",
      description: "No links to review platforms or testimonial sections found. AI uses review signals from multiple platforms for trust.",
      impact: "Missing review diversity signals that AI uses for brand trust assessment.",
      howToFix: "Link to your profiles on relevant review platforms (G2, Capterra, Trustpilot, etc.) and display testimonials with attribution.",
      affectedUrls: [url],
      details: {
        relevantPlatforms: [
          "B2B SaaS: G2, Capterra, TrustRadius",
          "Local: Google Business, Yelp, BBB",
          "Professional: Clutch, UpCity"
        ]
      }
    });
  }
  if (brandScore < 50) {
    issues.push({
      code: "AI_LOW_BRAND_SCORE",
      severity: "warning",
      category: "ai-readiness",
      title: "Brand is not well-optimized for AI extraction",
      description: `Brand optimization score: ${brandScore}/100. AI may struggle to accurately describe and recommend your brand.`,
      impact: "Low likelihood of being recommended in AI answers for brand-related queries.",
      howToFix: "Improve brand clarity: add quotable definitions, USPs, testimonials, proof points, and link to review platforms.",
      affectedUrls: [url],
      details: {
        brandScore,
        hasBrandDefinition,
        hasUSP,
        hasTestimonials,
        hasProofPoints,
        hasReviewLinks,
        quotableBrandStatements: quotableBrandStatements.slice(0, 3)
      }
    });
  }
  return {
    issues,
    data: {
      brandSignals: {
        hasBrandDefinition,
        hasUSP,
        hasValueProposition,
        hasBrandStatement,
        brandMentionCount
      },
      brandCoverage: {
        hasPricingInfo,
        hasAboutSection,
        hasFAQSection,
        hasTestimonials,
        hasProofPoints
      },
      brandConsistency: {
        hasConsistentNaming,
        hasContactInfo,
        hasSocialLinks,
        hasReviewLinks
      },
      quotableBrandStatements,
      brandScore
    }
  };
}

// src/audit/checks/ai-citation-worthiness.ts
import * as cheerio47 from "https://esm.sh/cheerio@1.0.0";
var ORIGINAL_DATA_PATTERNS = [
  /(?:our data|our research|our study|our analysis|we found|we discovered)/i,
  /(?:survey of|surveyed|interviewed|analyzed)\s+\d+/i,
  /(?:based on|from)\s+\d+[,\d]*\s+(?:data points|samples|responses|users|customers)/i,
  /(?:internal data|proprietary data|our database)/i
];
var EXPERIENCE_PATTERNS = [
  /(?:in my experience|from my experience|i've found|i've seen|i've learned)/i,
  /(?:when i|after i|before i|i personally|i tested|i tried|i used)/i,
  /(?:our team|we tested|we tried|we implemented|we built)/i,
  /(?:case study|real example|actual example|here's what happened)/i
];
var EXPERT_QUOTE_PATTERNS = [
  /(?:according to|says|said|explains|notes)\s+[A-Z][a-z]+\s+[A-Z][a-z]+/,
  /"[^"]{20,}"\s*[-–—]\s*[A-Z]/,
  /[A-Z][a-z]+\s+[A-Z][a-z]+,?\s+(?:CEO|CTO|founder|director|manager|expert|analyst|researcher)/i
];
var SPECIFIC_NUMBER_PATTERNS = [
  /\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|k|m|b))?/i,
  // Dollar amounts
  /\d+(?:\.\d+)?%/,
  // Percentages
  /\d{1,2}\/\d{1,2}\/\d{2,4}/,
  // Dates
  /(?:in|since|from)\s+(?:19|20)\d{2}/,
  // Years
  /\d+(?:,\d{3})+/,
  // Large numbers with commas
  /(?:increased|decreased|grew|dropped)\s+(?:by\s+)?\d+/i
];
var STOCK_IMAGE_DOMAINS = [
  "unsplash.com",
  "pexels.com",
  "shutterstock.com",
  "istockphoto.com",
  "gettyimages.com",
  "stock.adobe.com",
  "depositphotos.com",
  "pixabay.com",
  "freepik.com",
  "rawpixel.com",
  "123rf.com",
  "stocksy.com"
];
function analyzeAICitationWorthiness(html, url) {
  const issues = [];
  const $ = cheerio47.load(html);
  const $content = $("body").clone();
  $content.find("nav, footer, script, style, noscript, aside").remove();
  const bodyText = $content.text();
  const aiProofElements = [];
  let hasOriginalData = false;
  for (const pattern of ORIGINAL_DATA_PATTERNS) {
    if (pattern.test(bodyText)) {
      hasOriginalData = true;
      aiProofElements.push("Original data/research");
      break;
    }
  }
  const images = $content.find("img");
  let hasScreenshots = false;
  let hasOriginalImages = false;
  let stockImageCount = 0;
  let totalImages = 0;
  images.each((_, img) => {
    const src = $(img).attr("src") || "";
    const alt = $(img).attr("alt") || "";
    const srcLower = src.toLowerCase();
    const altLower = alt.toLowerCase();
    totalImages++;
    if (srcLower.includes("screenshot") || srcLower.includes("screen-") || altLower.includes("screenshot") || srcLower.includes("capture") || /screen[_-]?\d+/i.test(src)) {
      hasScreenshots = true;
      aiProofElements.push("Screenshots");
    }
    const isStockImage = STOCK_IMAGE_DOMAINS.some((domain) => srcLower.includes(domain));
    if (isStockImage) {
      stockImageCount++;
    }
  });
  if (totalImages > 0 && stockImageCount < totalImages * 0.5) {
    hasOriginalImages = true;
    if (totalImages >= 3 && stockImageCount === 0) {
      aiProofElements.push("Original images");
    }
  }
  const datePatterns = [
    /(?:updated|published|written|posted)\s+(?:on\s+)?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    /(?:last updated|originally published):\s*\d/i,
    /<time[^>]*datetime/i
  ];
  const hasDatedContent = datePatterns.some((p) => p.test(html));
  if (hasDatedContent) {
    aiProofElements.push("Dated/timestamped content");
  }
  let hasFirstPersonExperience = false;
  for (const pattern of EXPERIENCE_PATTERNS) {
    if (pattern.test(bodyText)) {
      hasFirstPersonExperience = true;
      aiProofElements.push("First-person experience");
      break;
    }
  }
  const hasAuthorByline = $('[class*="author"], [rel="author"], [itemprop="author"], .byline').length > 0 || /by\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i.test(bodyText);
  const credentialPatterns = [
    /(?:PhD|Ph\.D|MD|M\.D|MBA|CPA|JD|J\.D)/,
    /(?:certified|licensed|accredited)\s+\w+/i,
    /\d+\+?\s*years?\s+(?:of\s+)?experience/i,
    /(?:expert|specialist|professional)\s+in/i
  ];
  const hasAuthorCredentials = credentialPatterns.some((p) => p.test(bodyText));
  if (hasAuthorCredentials) {
    aiProofElements.push("Expert credentials");
  }
  let hasExpertQuotes = false;
  for (const pattern of EXPERT_QUOTE_PATTERNS) {
    if (pattern.test(bodyText)) {
      hasExpertQuotes = true;
      aiProofElements.push("Expert quotes");
      break;
    }
  }
  const hasMethodology = /(?:methodology|method|approach|how we|our process)/i.test(
    $("h2, h3, h4").text()
  ) || /(?:we measured|we calculated|we analyzed|data was collected)/i.test(bodyText);
  const hasPrimaryResearch = /(?:original research|primary research|we conducted|our study found)/i.test(bodyText) || /(?:sample size|n\s*=\s*\d+|participants|respondents)/i.test(bodyText);
  if (hasPrimaryResearch) {
    aiProofElements.push("Primary research");
  }
  let specificNumberCount = 0;
  for (const pattern of SPECIFIC_NUMBER_PATTERNS) {
    const matches = bodyText.match(pattern);
    if (matches) {
      specificNumberCount += matches.length;
    }
  }
  const hasSpecificNumbers = specificNumberCount >= 5;
  if (hasSpecificNumbers) {
    aiProofElements.push("Specific data points");
  }
  const hasCaseStudies = /(?:case study|case studies|success story|client story)/i.test(bodyText) || $('[class*="case-study"], [id*="case-study"]').length > 0;
  if (hasCaseStudies) {
    aiProofElements.push("Case studies");
  }
  const hasBeforeAfter = /(?:before and after|before\/after|before vs|the results)/i.test(bodyText) || $('[class*="before-after"], [class*="comparison"]').length > 0;
  const hasDocumentation = $("pre code, .highlight, .code-block").length > 0 || /```[\s\S]*?```/.test(bodyText) || $('[class*="documentation"]').length > 0;
  if (hasDocumentation) {
    aiProofElements.push("Code/documentation");
  }
  const hasRealExamples = /(?:for example|here's an example|real example|actual example|let me show)/i.test(bodyText) || /(?:example:|e\.g\.,|such as:)/i.test(bodyText);
  let citationWorthinessScore = 20;
  if (hasOriginalData)
    citationWorthinessScore += 15;
  if (hasScreenshots)
    citationWorthinessScore += 5;
  if (hasOriginalImages)
    citationWorthinessScore += 5;
  if (hasDatedContent)
    citationWorthinessScore += 5;
  if (hasFirstPersonExperience)
    citationWorthinessScore += 5;
  if (hasAuthorByline)
    citationWorthinessScore += 5;
  if (hasAuthorCredentials)
    citationWorthinessScore += 10;
  if (hasExpertQuotes)
    citationWorthinessScore += 5;
  if (hasMethodology)
    citationWorthinessScore += 5;
  if (hasPrimaryResearch)
    citationWorthinessScore += 10;
  if (hasSpecificNumbers)
    citationWorthinessScore += 5;
  if (hasCaseStudies)
    citationWorthinessScore += 5;
  if (hasBeforeAfter)
    citationWorthinessScore += 3;
  if (hasDocumentation)
    citationWorthinessScore += 4;
  if (hasRealExamples)
    citationWorthinessScore += 3;
  citationWorthinessScore = Math.min(100, Math.max(0, citationWorthinessScore));
  if (!hasOriginalData && !hasPrimaryResearch) {
    issues.push({
      code: "AI_NO_ORIGINAL_DATA",
      severity: "notice",
      category: "ai-readiness",
      title: "No original data or research signals",
      description: "Content lacks original data, surveys, or research findings. AI prefers citing sources with unique, first-party data.",
      impact: "Generic content without original data is less likely to be cited as a source.",
      howToFix: 'Add original data: survey results, internal analytics, case study numbers, or primary research findings. Use phrases like "Our data shows..." or "We surveyed X users...".',
      affectedUrls: [url]
    });
  }
  if (!hasFirstPersonExperience && !hasCaseStudies) {
    issues.push({
      code: "AI_NO_EXPERIENCE_SIGNALS",
      severity: "notice",
      category: "ai-readiness",
      title: "No first-hand experience signals",
      description: 'Content reads like it could be AI-generated. No "I tested...", "We implemented...", or case study language found.',
      impact: "AI may prefer sources that demonstrate real-world experience over generic explanations.",
      howToFix: `Add personal experience: "In my experience...", "When we tested...", "Here's what happened when...". Include specific scenarios you've encountered.`,
      affectedUrls: [url]
    });
  }
  if (stockImageCount > 0 && stockImageCount >= totalImages * 0.5) {
    issues.push({
      code: "AI_STOCK_IMAGE_HEAVY",
      severity: "notice",
      category: "ai-readiness",
      title: "Heavy use of stock images",
      description: `${stockImageCount} of ${totalImages} images appear to be from stock photo sites. Original visuals signal authenticity.`,
      impact: "Stock-heavy content appears less authentic and expert to both users and AI.",
      howToFix: "Replace stock photos with original screenshots, diagrams, photos, or custom graphics that AI cannot easily replicate.",
      affectedUrls: [url],
      details: {
        stockImageCount,
        totalImages
      }
    });
  }
  if (!hasAuthorByline && !hasAuthorCredentials) {
    issues.push({
      code: "AI_NO_AUTHOR_EXPERTISE",
      severity: "notice",
      category: "ai-readiness",
      title: "No author expertise signals",
      description: "No author byline or credentials found. AI values content from identifiable experts.",
      impact: "Anonymous content is less trustworthy for AI citation purposes.",
      howToFix: "Add author byline with credentials: name, title, years of experience, certifications, or relevant expertise.",
      affectedUrls: [url]
    });
  }
  if (citationWorthinessScore < 40) {
    issues.push({
      code: "AI_LOW_CITATION_WORTHINESS",
      severity: "warning",
      category: "ai-readiness",
      title: "Content lacks AI-proof originality signals",
      description: `Citation worthiness score: ${citationWorthinessScore}/100. Content appears generic and could be easily replicated by AI.`,
      impact: "AI may not cite this content as it lacks unique value that AI cannot generate itself.",
      howToFix: "Add what AI can't fake: original data, real screenshots, dated experiences, expert quotes, case studies, and specific proof points.",
      affectedUrls: [url],
      details: {
        citationWorthinessScore,
        aiProofElements: aiProofElements.length > 0 ? aiProofElements : ["None detected"],
        missing: [
          !hasOriginalData && "Original data/research",
          !hasFirstPersonExperience && "First-person experience",
          !hasAuthorCredentials && "Expert credentials",
          !hasSpecificNumbers && "Specific data points"
        ].filter(Boolean)
      }
    });
  }
  return {
    issues,
    data: {
      originalitySignals: {
        hasOriginalData,
        hasScreenshots,
        hasOriginalImages,
        hasDatedContent,
        hasFirstPersonExperience
      },
      expertiseSignals: {
        hasAuthorByline,
        hasAuthorCredentials,
        hasExpertQuotes,
        hasMethodology,
        hasPrimaryResearch
      },
      proofSignals: {
        hasSpecificNumbers,
        hasCaseStudies,
        hasBeforeAfter,
        hasDocumentation,
        hasRealExamples
      },
      citationWorthinessScore,
      aiProofElements
    }
  };
}

// src/audit/checks/review-ecosystem.ts
import * as cheerio48 from "https://esm.sh/cheerio@1.0.0";
var REVIEW_PLATFORMS2 = {
  general: [
    { name: "Google Business", domain: "google.com/maps", aliases: ["goo.gl/maps", "maps.google"] },
    { name: "Trustpilot", domain: "trustpilot.com", aliases: [] },
    { name: "BBB", domain: "bbb.org", aliases: [] },
    { name: "Yelp", domain: "yelp.com", aliases: [] }
  ],
  saas: [
    { name: "G2", domain: "g2.com", aliases: ["g2crowd.com"] },
    { name: "Capterra", domain: "capterra.com", aliases: [] },
    { name: "TrustRadius", domain: "trustradius.com", aliases: [] },
    { name: "GetApp", domain: "getapp.com", aliases: [] },
    { name: "Software Advice", domain: "softwareadvice.com", aliases: [] },
    { name: "Product Hunt", domain: "producthunt.com", aliases: [] }
  ],
  professional: [
    { name: "Clutch", domain: "clutch.co", aliases: [] },
    { name: "UpCity", domain: "upcity.com", aliases: [] },
    { name: "GoodFirms", domain: "goodfirms.co", aliases: [] },
    { name: "Expertise", domain: "expertise.com", aliases: [] }
  ],
  local: [
    { name: "Angi", domain: "angi.com", aliases: ["angieslist.com"] },
    { name: "HomeAdvisor", domain: "homeadvisor.com", aliases: [] },
    { name: "Thumbtack", domain: "thumbtack.com", aliases: [] },
    { name: "Houzz", domain: "houzz.com", aliases: [] }
  ],
  healthcare: [
    { name: "Healthgrades", domain: "healthgrades.com", aliases: [] },
    { name: "Zocdoc", domain: "zocdoc.com", aliases: [] },
    { name: "Vitals", domain: "vitals.com", aliases: [] },
    { name: "WebMD", domain: "webmd.com", aliases: [] }
  ],
  legal: [
    { name: "Avvo", domain: "avvo.com", aliases: [] },
    { name: "Martindale", domain: "martindale.com", aliases: [] },
    { name: "FindLaw", domain: "findlaw.com", aliases: [] },
    { name: "Justia", domain: "justia.com", aliases: [] }
  ],
  hospitality: [
    { name: "TripAdvisor", domain: "tripadvisor.com", aliases: [] },
    { name: "Booking.com", domain: "booking.com", aliases: [] },
    { name: "OpenTable", domain: "opentable.com", aliases: [] },
    { name: "Zomato", domain: "zomato.com", aliases: [] }
  ],
  ecommerce: [
    { name: "Amazon", domain: "amazon.com", aliases: [] },
    { name: "Shopify Reviews", domain: "apps.shopify.com", aliases: [] },
    { name: "Yotpo", domain: "yotpo.com", aliases: [] },
    { name: "Judge.me", domain: "judge.me", aliases: [] }
  ]
};
var TRUST_BADGE_PATTERNS2 = [
  /ssl|secure|verified|certified|accredited|licensed/i,
  /money.back|guarantee|satisfaction/i,
  /bbb|iso|soc\s*2|hipaa|gdpr|pci/i
];
function analyzeReviewEcosystem(html, url) {
  const issues = [];
  const $ = cheerio48.load(html);
  const allLinks = $("a[href]").map((_, a) => $(a).attr("href") || "").get();
  const allLinksLower = allLinks.map((l) => l.toLowerCase());
  const linkedPlatforms = [];
  const allPlatforms = Object.values(REVIEW_PLATFORMS2).flat();
  for (const platform of allPlatforms) {
    const isLinked = allLinksLower.some(
      (href) => href.includes(platform.domain) || platform.aliases.some((alias) => href.includes(alias))
    );
    if (isLinked) {
      linkedPlatforms.push(platform.name);
    }
  }
  const embeddedPlatforms = [];
  const embedPatterns = [
    { name: "Trustpilot", pattern: /trustpilot/i },
    { name: "G2", pattern: /g2\.com|g2crowd/i },
    { name: "Yotpo", pattern: /yotpo/i },
    { name: "Judge.me", pattern: /judgeme|judge\.me/i },
    { name: "Google Reviews", pattern: /google.*review|elfsight/i }
  ];
  const htmlLower = html.toLowerCase();
  for (const { name, pattern } of embedPatterns) {
    if (pattern.test(htmlLower) && !linkedPlatforms.includes(name)) {
      embeddedPlatforms.push(name);
    }
  }
  const sameAsLinks = [];
  const scripts = $('script[type="application/ld+json"]');
  scripts.each((_, script) => {
    try {
      const json = JSON.parse($(script).html() || "{}");
      const sameAs = json.sameAs || json["@graph"] && json["@graph"][0]?.sameAs;
      if (Array.isArray(sameAs)) {
        for (const link of sameAs) {
          if (typeof link === "string") {
            for (const platform of allPlatforms) {
              if (link.toLowerCase().includes(platform.domain)) {
                sameAsLinks.push(platform.name);
              }
            }
          }
        }
      }
    } catch {
    }
  });
  const testimonialSelectors = [
    '[class*="testimonial"]',
    '[class*="review"]',
    '[class*="quote"]',
    '[id*="testimonial"]',
    "blockquote"
  ];
  let testimonialCount = 0;
  let hasAttribution = false;
  let hasPhotos = false;
  let hasCompanyNames = false;
  for (const selector of testimonialSelectors) {
    const elements = $(selector);
    elements.each((_, el) => {
      const text = $(el).text();
      if (text.length > 50 && text.length < 1e3) {
        testimonialCount++;
        if (/[-–—]\s*[A-Z][a-z]+\s+[A-Z]/.test(text) || $(el).find('[class*="name"], [class*="author"]').length > 0) {
          hasAttribution = true;
        }
        if ($(el).find("img").length > 0 || $(el).siblings("img").length > 0) {
          hasPhotos = true;
        }
        if (/(?:CEO|CTO|founder|director|manager)\s+(?:at|of)\s+[A-Z]/i.test(text) || $(el).find('[class*="company"], [class*="title"]').length > 0) {
          hasCompanyNames = true;
        }
      }
    });
  }
  let hasAggregateRating = false;
  let hasReviewSchema = false;
  let ratingValue;
  let reviewCount;
  scripts.each((_, script) => {
    try {
      const json = JSON.parse($(script).html() || "{}");
      const checkSchema = (obj) => {
        if (obj["@type"] === "AggregateRating" || obj.aggregateRating) {
          hasAggregateRating = true;
          const rating = obj.aggregateRating || obj;
          if (typeof rating === "object" && rating !== null) {
            const r = rating;
            ratingValue = parseFloat(String(r.ratingValue)) || void 0;
            reviewCount = parseInt(String(r.reviewCount || r.ratingCount)) || void 0;
          }
        }
        if (obj["@type"] === "Review" || Array.isArray(obj.review)) {
          hasReviewSchema = true;
        }
      };
      checkSchema(json);
      if (json["@graph"] && Array.isArray(json["@graph"])) {
        for (const item of json["@graph"]) {
          checkSchema(item);
        }
      }
    } catch {
    }
  });
  const bodyText = $("body").text();
  const imgAlts = $("img").map((_, img) => $(img).attr("alt") || "").get().join(" ");
  const allText = bodyText + " " + imgAlts;
  const hasTrustBadges = TRUST_BADGE_PATTERNS2.some((p) => p.test(allText)) || $('[class*="trust"], [class*="badge"], [class*="seal"]').length > 0;
  const hasCertifications = /(?:certified|certification|accredited|compliance)/i.test(allText) || $('[class*="certification"], [class*="accredit"]').length > 0;
  const hasAwards = /(?:award|winner|recognized|featured in|as seen)/i.test(allText) || $('[class*="award"], [class*="recognition"], [class*="featured"]').length > 0;
  const hasMediaMentions = /(?:featured in|as seen in|mentioned in|press|media)/i.test(allText) || $('[class*="press"], [class*="media"], [class*="featured"]').length > 0;
  let reviewEcosystemScore = 20;
  if (linkedPlatforms.length >= 3)
    reviewEcosystemScore += 15;
  else if (linkedPlatforms.length >= 1)
    reviewEcosystemScore += 10;
  if (embeddedPlatforms.length > 0)
    reviewEcosystemScore += 10;
  if (sameAsLinks.length > 0)
    reviewEcosystemScore += 5;
  if (testimonialCount >= 5)
    reviewEcosystemScore += 10;
  else if (testimonialCount >= 2)
    reviewEcosystemScore += 5;
  if (hasAttribution)
    reviewEcosystemScore += 5;
  if (hasPhotos)
    reviewEcosystemScore += 5;
  if (hasCompanyNames)
    reviewEcosystemScore += 5;
  if (hasAggregateRating)
    reviewEcosystemScore += 10;
  if (hasReviewSchema)
    reviewEcosystemScore += 5;
  if (hasTrustBadges)
    reviewEcosystemScore += 3;
  if (hasCertifications)
    reviewEcosystemScore += 3;
  if (hasAwards)
    reviewEcosystemScore += 2;
  if (hasMediaMentions)
    reviewEcosystemScore += 2;
  reviewEcosystemScore = Math.min(100, Math.max(0, reviewEcosystemScore));
  if (linkedPlatforms.length === 0 && embeddedPlatforms.length === 0) {
    issues.push({
      code: "AI_NO_REVIEW_PLATFORMS",
      severity: "warning",
      category: "ai-readiness",
      title: "No review platform integration",
      description: "No links or embeds from review platforms detected. AI uses review signals from multiple platforms to assess brand trust.",
      impact: "Missing review diversity signals that AI uses when recommending brands.",
      howToFix: "Link to your profiles on 2-3 relevant review platforms. Consider embedding review widgets for social proof.",
      affectedUrls: [url],
      details: {
        suggestedPlatforms: {
          "All businesses": ["Google Business", "Trustpilot", "BBB"],
          "SaaS/Software": ["G2", "Capterra", "Product Hunt"],
          "Professional services": ["Clutch", "UpCity"],
          "Local services": ["Angi", "HomeAdvisor", "Yelp"]
        }
      }
    });
  }
  if (testimonialCount === 0) {
    issues.push({
      code: "AI_NO_TESTIMONIALS",
      severity: "notice",
      category: "ai-readiness",
      title: "No testimonials or reviews on page",
      description: "No customer testimonials found on the page. AI looks for social proof when evaluating brand trustworthiness.",
      impact: "Missing on-page social proof that strengthens brand authority.",
      howToFix: "Add customer testimonials with: name attribution, company/title, and optionally photos. Use blockquote elements for semantic markup.",
      affectedUrls: [url]
    });
  }
  if (testimonialCount > 0 && !hasAttribution) {
    issues.push({
      code: "AI_UNATTRIBUTED_TESTIMONIALS",
      severity: "notice",
      category: "ai-readiness",
      title: "Testimonials lack proper attribution",
      description: "Testimonials found but missing name attribution. Anonymous testimonials have less trust weight.",
      impact: "Unattributed reviews are less credible for AI trust assessment.",
      howToFix: 'Add author names to testimonials: "Great service! - John Smith, CEO at Acme Corp"',
      affectedUrls: [url],
      details: {
        testimonialCount,
        hasAttribution,
        hasPhotos,
        hasCompanyNames
      }
    });
  }
  if (!hasAggregateRating && testimonialCount > 0) {
    issues.push({
      code: "AI_NO_REVIEW_SCHEMA",
      severity: "notice",
      category: "ai-readiness",
      title: "Missing review/rating schema markup",
      description: "Page has testimonials but no AggregateRating or Review schema. Structured data helps AI understand review context.",
      impact: "Missing rich snippet opportunity and AI-readable review data.",
      howToFix: "Add AggregateRating schema with ratingValue, ratingCount, and bestRating. This enables star ratings in search results.",
      affectedUrls: [url]
    });
  }
  if (reviewEcosystemScore < 40) {
    issues.push({
      code: "AI_WEAK_REVIEW_ECOSYSTEM",
      severity: "warning",
      category: "ai-readiness",
      title: "Weak review ecosystem integration",
      description: `Review ecosystem score: ${reviewEcosystemScore}/100. AI uses review diversity across platforms to assess brand trust.`,
      impact: "Low review presence may result in AI recommending better-reviewed competitors.",
      howToFix: "Build review diversity: 1) Link to review platforms, 2) Add testimonials with attribution, 3) Implement review schema, 4) Display trust badges.",
      affectedUrls: [url],
      details: {
        reviewEcosystemScore,
        linkedPlatforms,
        testimonialCount,
        hasAggregateRating
      }
    });
  }
  return {
    issues,
    data: {
      reviewPlatforms: {
        linked: linkedPlatforms,
        embedded: embeddedPlatforms,
        sameAsLinks: [...new Set(sameAsLinks)]
      },
      testimonials: {
        count: testimonialCount,
        hasAttribution,
        hasPhotos,
        hasCompanyNames
      },
      reviewSchema: {
        hasAggregateRating,
        hasReviewSchema,
        ratingValue,
        reviewCount
      },
      trustSignals: {
        hasTrustBadges,
        hasCertifications,
        hasAwards,
        hasMediaMentions
      },
      reviewEcosystemScore
    }
  };
}

// src/audit/checks/robots-validation.ts
var STANDARD_DIRECTIVES = [
  "user-agent",
  "disallow",
  "allow",
  "sitemap"
];
var EXTENDED_DIRECTIVES = [
  "crawl-delay",
  "host",
  "clean-param",
  // Yandex
  "request-rate"
  // Some crawlers
];
var ALL_DIRECTIVES = [...STANDARD_DIRECTIVES, ...EXTENDED_DIRECTIVES];
async function validateRobotsTxt(url) {
  const issues = [];
  const parsedUrl = new URL(url);
  const robotsUrl = new URL("/robots.txt", parsedUrl.origin).href;
  try {
    const response = await httpGet(robotsUrl, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 404) {
      return {
        issues,
        data: {
          exists: false,
          isValid: true,
          // Missing is not invalid
          lineCount: 0,
          errors: [],
          warnings: [],
          directives: {
            userAgents: [],
            sitemaps: [],
            hasWildcardAgent: false,
            hasCrawlDelay: false
          }
        }
      };
    }
    const content = response.data;
    const validation = parseAndValidate(content);
    if (validation.errors.length > 0) {
      issues.push({
        code: "ROBOTS_TXT_INVALID_SYNTAX",
        severity: "warning",
        category: "crawlability",
        title: "robots.txt contains syntax errors",
        description: `Found ${validation.errors.length} syntax error(s) in robots.txt. Invalid syntax may cause crawlers to misinterpret your rules.`,
        impact: "Search engines may not properly understand your crawling rules, potentially blocking or allowing unintended pages.",
        howToFix: 'Fix the syntax errors in robots.txt. Each directive should be on its own line with format "Directive: value".',
        affectedUrls: [robotsUrl],
        details: {
          errors: validation.errors.map((e) => ({
            line: e.line,
            content: e.content,
            message: e.message
          }))
        }
      });
    }
    if (validation.warnings.length > 0) {
      issues.push({
        code: "ROBOTS_TXT_WARNINGS",
        severity: "notice",
        category: "crawlability",
        title: "robots.txt has potential issues",
        description: `Found ${validation.warnings.length} warning(s) in robots.txt.`,
        impact: "Some crawlers may not recognize non-standard directives.",
        howToFix: "Review the warnings and update if needed.",
        affectedUrls: [robotsUrl],
        details: {
          warnings: validation.warnings.map((w) => ({
            line: w.line,
            content: w.content,
            message: w.message
          }))
        }
      });
    }
    return {
      issues,
      data: {
        exists: true,
        isValid: validation.errors.length === 0,
        lineCount: content.split("\n").length,
        errors: validation.errors,
        warnings: validation.warnings,
        directives: validation.directives
      }
    };
  } catch (error) {
    return {
      issues,
      data: {
        exists: false,
        isValid: true,
        lineCount: 0,
        errors: [],
        warnings: [],
        directives: {
          userAgents: [],
          sitemaps: [],
          hasWildcardAgent: false,
          hasCrawlDelay: false
        }
      }
    };
  }
}
function parseAndValidate(content) {
  const errors = [];
  const warnings = [];
  const userAgents = [];
  const sitemaps = [];
  let hasWildcardAgent = false;
  let hasCrawlDelay = false;
  const lines = content.split("\n");
  let currentUserAgent = null;
  let hasDirectiveAfterUserAgent = false;
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (line === "") {
      continue;
    }
    if (line.startsWith("#")) {
      continue;
    }
    const commentIndex = line.indexOf("#");
    const effectiveLine = commentIndex > 0 ? line.substring(0, commentIndex).trim() : line;
    if (effectiveLine === "") {
      continue;
    }
    const colonIndex = effectiveLine.indexOf(":");
    if (colonIndex === -1) {
      errors.push({
        line: lineNum,
        content: rawLine,
        message: 'Missing colon separator. Format should be "Directive: value"'
      });
      continue;
    }
    const directive = effectiveLine.substring(0, colonIndex).trim().toLowerCase();
    const value = effectiveLine.substring(colonIndex + 1).trim();
    if (!ALL_DIRECTIVES.includes(directive)) {
      errors.push({
        line: lineNum,
        content: rawLine,
        message: `Unknown directive "${directive}". Valid directives: User-agent, Disallow, Allow, Sitemap`
      });
      continue;
    }
    if (EXTENDED_DIRECTIVES.includes(directive) && !STANDARD_DIRECTIVES.includes(directive)) {
      warnings.push({
        line: lineNum,
        content: rawLine,
        message: `"${directive}" is a non-standard directive. Not all crawlers support it.`
      });
    }
    switch (directive) {
      case "user-agent":
        if (value === "") {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: "User-agent value cannot be empty"
          });
        } else {
          currentUserAgent = value;
          hasDirectiveAfterUserAgent = false;
          if (!userAgents.includes(value)) {
            userAgents.push(value);
          }
          if (value === "*") {
            hasWildcardAgent = true;
          }
        }
        break;
      case "disallow":
      case "allow":
        if (currentUserAgent === null) {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: `${directive} must come after a User-agent directive`
          });
        } else {
          hasDirectiveAfterUserAgent = true;
          if (value && !isValidPath(value)) {
            warnings.push({
              line: lineNum,
              content: rawLine,
              message: `Path "${value}" contains unusual characters`
            });
          }
        }
        break;
      case "sitemap":
        if (value === "") {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: "Sitemap URL cannot be empty"
          });
        } else if (!isValidUrl(value)) {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: `Invalid sitemap URL: "${value}"`
          });
        } else {
          sitemaps.push(value);
        }
        break;
      case "crawl-delay":
        hasCrawlDelay = true;
        if (currentUserAgent === null) {
          warnings.push({
            line: lineNum,
            content: rawLine,
            message: "Crawl-delay should come after a User-agent directive"
          });
        }
        if (value === "" || isNaN(parseFloat(value))) {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: "Crawl-delay must be a number"
          });
        }
        break;
      case "host":
        if (value === "") {
          errors.push({
            line: lineNum,
            content: rawLine,
            message: "Host value cannot be empty"
          });
        }
        break;
    }
  }
  return {
    errors,
    warnings,
    directives: {
      userAgents,
      sitemaps,
      hasWildcardAgent,
      hasCrawlDelay
    }
  };
}
function isValidPath(path) {
  if (path === "" || path === "*" || path === "$") {
    return true;
  }
  if (!path.startsWith("/") && !path.startsWith("*")) {
    return false;
  }
  if (/[\x00-\x1f]/.test(path)) {
    return false;
  }
  return true;
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// src/audit/checks/llms-txt.ts
async function analyzeLlmsTxt(url) {
  const issues = [];
  const parsedUrl = new URL(url);
  const baseUrl = parsedUrl.origin;
  const llmsTxtUrl = new URL("/llms.txt", baseUrl).href;
  const llmsFullUrl = new URL("/llms-full.txt", baseUrl).href;
  let exists = false;
  let fullVersionExists = false;
  let content;
  let structure = {
    hasTitle: false,
    hasDescription: false,
    hasSections: false,
    hasLinks: false,
    linkCount: 0
  };
  let contentLength = 0;
  try {
    const response = await httpGet(llmsTxtUrl, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (response.status === 200) {
      exists = true;
      content = response.data;
      contentLength = content.length;
      structure = analyzeStructure(content);
    }
    const fullResponse = await httpGet(llmsFullUrl, {
      timeout: 1e4,
      validateStatus: () => true
    });
    if (fullResponse.status === 200) {
      fullVersionExists = true;
    }
  } catch {
  }
  if (!exists) {
    issues.push({
      code: "AI_NO_LLMS_TXT",
      severity: "notice",
      category: "ai-readiness",
      title: "No llms.txt file found",
      description: "llms.txt is a proposed standard for providing context to LLMs about your website. Having one helps AI systems better understand and represent your site.",
      impact: "AI systems may have less context about your site, potentially leading to less accurate representations.",
      howToFix: "Create an /llms.txt file with a Markdown description of your site. Include: site name, brief description, and links to key pages. See https://llmstxt.org/ for the specification.",
      affectedUrls: [llmsTxtUrl],
      details: {
        specification: "https://llmstxt.org/",
        exampleFormat: `# Site Name

> Brief description of your site

## About
- [About Us](/about): Learn more about our company

## Products
- [Product A](/products/a): Description of product A
- [Product B](/products/b): Description of product B

## Documentation
- [Docs](/docs): Full documentation`
      }
    });
  } else {
    if (!structure.hasTitle) {
      issues.push({
        code: "AI_LLMS_TXT_NO_TITLE",
        severity: "notice",
        category: "ai-readiness",
        title: "llms.txt missing title heading",
        description: "Your llms.txt file should start with a # heading containing your site/organization name.",
        impact: "LLMs may not properly identify your site.",
        howToFix: "Add a title heading at the top: # Your Site Name",
        affectedUrls: [llmsTxtUrl]
      });
    }
    if (!structure.hasDescription) {
      issues.push({
        code: "AI_LLMS_TXT_NO_DESCRIPTION",
        severity: "notice",
        category: "ai-readiness",
        title: "llms.txt missing description",
        description: "Your llms.txt should include a brief description (blockquote starting with >) explaining what your site/organization does.",
        impact: "LLMs may not understand your site's purpose.",
        howToFix: "Add a description blockquote after the title: > Brief description of your site",
        affectedUrls: [llmsTxtUrl]
      });
    }
    if (!structure.hasLinks || structure.linkCount < 3) {
      issues.push({
        code: "AI_LLMS_TXT_FEW_LINKS",
        severity: "notice",
        category: "ai-readiness",
        title: "llms.txt has few navigation links",
        description: `Your llms.txt only has ${structure.linkCount} link(s). Include links to your most important pages to help LLMs navigate your content.`,
        impact: "LLMs may miss important content on your site.",
        howToFix: "Add more links in Markdown format: - [Page Title](/path): Brief description",
        affectedUrls: [llmsTxtUrl]
      });
    }
    if (contentLength < 200) {
      issues.push({
        code: "AI_LLMS_TXT_TOO_SHORT",
        severity: "notice",
        category: "ai-readiness",
        title: "llms.txt content is very short",
        description: `Your llms.txt is only ${contentLength} characters. Consider adding more context about your site.`,
        impact: "LLMs may not have enough context to properly represent your site.",
        howToFix: "Expand your llms.txt with more sections, descriptions, and links to key content.",
        affectedUrls: [llmsTxtUrl]
      });
    }
  }
  return {
    issues,
    data: {
      exists,
      fullVersionExists,
      content: content?.substring(0, 1e3),
      // Truncate for data
      structure,
      contentLength
    }
  };
}
function analyzeStructure(content) {
  const lines = content.split("\n");
  let hasTitle = false;
  let hasDescription = false;
  let hasSections = false;
  let hasLinks = false;
  let linkCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      hasTitle = true;
    }
    if (trimmed.startsWith(">")) {
      hasDescription = true;
    }
    if (trimmed.startsWith("## ")) {
      hasSections = true;
    }
    const linkMatches = trimmed.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (linkMatches) {
      hasLinks = true;
      linkCount += linkMatches.length;
    }
  }
  return {
    hasTitle,
    hasDescription,
    hasSections,
    hasLinks,
    linkCount
  };
}

// src/audit/checks/html-compliance.ts
import * as cheerio49 from "https://esm.sh/cheerio@1.0.0";
async function analyzeHtmlCompliance(html, url, headers) {
  const issues = [];
  const $ = cheerio49.load(html);
  const parsedUrl = new URL(url);
  const doctypeMatch = html.match(/<!DOCTYPE\s+([^>]+)>/i);
  const hasDoctype = doctypeMatch !== null;
  const doctypeValue = doctypeMatch ? doctypeMatch[0] : void 0;
  const isHtml5 = hasDoctype && /<!DOCTYPE\s+html\s*>/i.test(html);
  if (!hasDoctype) {
    issues.push({
      code: "HTML_NO_DOCTYPE",
      severity: "warning",
      category: "on-page",
      title: "Missing DOCTYPE declaration",
      description: "Page is missing a DOCTYPE declaration. This puts browsers in quirks mode and may cause rendering issues.",
      impact: "Browsers may render the page inconsistently. Search engines expect valid HTML.",
      howToFix: "Add <!DOCTYPE html> as the very first line of your HTML document.",
      affectedUrls: [url]
    });
  } else if (!isHtml5) {
    issues.push({
      code: "HTML_OLD_DOCTYPE",
      severity: "notice",
      category: "on-page",
      title: "Using older DOCTYPE",
      description: `Page uses "${doctypeValue}" instead of HTML5 DOCTYPE. HTML5 is the current standard.`,
      impact: "Older doctypes may limit modern HTML features.",
      howToFix: "Change your DOCTYPE to the HTML5 declaration: <!DOCTYPE html>",
      affectedUrls: [url]
    });
  }
  let charsetPresent = false;
  let charsetValue;
  let charsetSource = "none";
  const metaCharset = $("meta[charset]").attr("charset");
  const metaContentType = $('meta[http-equiv="Content-Type"]').attr("content");
  if (metaCharset) {
    charsetPresent = true;
    charsetValue = metaCharset;
    charsetSource = "meta";
  } else if (metaContentType) {
    const charsetMatch = metaContentType.match(/charset=([^\s;]+)/i);
    if (charsetMatch) {
      charsetPresent = true;
      charsetValue = charsetMatch[1];
      charsetSource = "meta";
    }
  }
  if (!charsetPresent && headers) {
    const contentType = headers["content-type"] || headers["Content-Type"];
    if (contentType) {
      const charsetMatch = contentType.match(/charset=([^\s;]+)/i);
      if (charsetMatch) {
        charsetPresent = true;
        charsetValue = charsetMatch[1];
        charsetSource = "header";
      }
    }
  }
  const isUtf8 = charsetValue?.toLowerCase().replace("-", "") === "utf8";
  if (!charsetPresent) {
    issues.push({
      code: "HTML_NO_CHARSET",
      severity: "warning",
      category: "on-page",
      title: "Missing character encoding declaration",
      description: "Page does not specify character encoding. This can cause text display issues.",
      impact: "Characters may display incorrectly. Search engines may misinterpret content.",
      howToFix: 'Add <meta charset="UTF-8"> in the <head> section, before any other elements.',
      affectedUrls: [url]
    });
  } else if (!isUtf8) {
    issues.push({
      code: "HTML_NOT_UTF8",
      severity: "notice",
      category: "on-page",
      title: "Not using UTF-8 encoding",
      description: `Page uses "${charsetValue}" encoding. UTF-8 is recommended for universal character support.`,
      impact: "Some characters may not display correctly. UTF-8 is the web standard.",
      howToFix: 'Change your charset to UTF-8: <meta charset="UTF-8">',
      affectedUrls: [url]
    });
  }
  const faviconLocations = [];
  const faviconFormats = [];
  let hasAppleTouchIcon = false;
  $('link[rel*="icon"]').each((_, el) => {
    const href = $(el).attr("href");
    const rel = $(el).attr("rel") || "";
    const type = $(el).attr("type") || "";
    if (href) {
      faviconLocations.push(href);
      if (href.endsWith(".ico"))
        faviconFormats.push("ico");
      else if (href.endsWith(".png"))
        faviconFormats.push("png");
      else if (href.endsWith(".svg"))
        faviconFormats.push("svg");
      else if (type)
        faviconFormats.push(type);
    }
    if (rel.includes("apple-touch-icon")) {
      hasAppleTouchIcon = true;
    }
  });
  if ($('link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]').length > 0) {
    hasAppleTouchIcon = true;
  }
  const hasFavicon = faviconLocations.length > 0;
  if (!hasFavicon) {
    try {
      const faviconUrl = new URL("/favicon.ico", parsedUrl.origin).href;
      const response = await httpGet(faviconUrl, {
        timeout: 5e3,
        validateStatus: () => true
      });
      if (response.status === 200) {
        faviconLocations.push("/favicon.ico");
        faviconFormats.push("ico");
      }
    } catch {
    }
  }
  if (faviconLocations.length === 0) {
    issues.push({
      code: "HTML_NO_FAVICON",
      severity: "notice",
      category: "on-page",
      title: "No favicon found",
      description: "Page does not have a favicon defined. Favicons help with brand recognition and browser tab identification.",
      impact: "Missing favicon affects brand visibility in browser tabs, bookmarks, and search results.",
      howToFix: 'Add a favicon link in <head>: <link rel="icon" href="/favicon.ico"> and consider adding multiple sizes.',
      affectedUrls: [url],
      details: {
        recommendation: "Include multiple formats: ICO for legacy browsers, PNG for modern browsers, and SVG for scalability."
      }
    });
  }
  if (!hasAppleTouchIcon && faviconLocations.length > 0) {
    issues.push({
      code: "HTML_NO_APPLE_TOUCH_ICON",
      severity: "notice",
      category: "mobile",
      title: "No Apple Touch Icon",
      description: "Page does not define an Apple Touch Icon. This icon is used when users add your site to their iOS home screen.",
      impact: "iOS users who bookmark your site won't see a proper app icon.",
      howToFix: 'Add: <link rel="apple-touch-icon" href="/apple-touch-icon.png"> with a 180x180 PNG image.',
      affectedUrls: [url]
    });
  }
  const htmlLang = $("html").attr("lang");
  const langPresent = Boolean(htmlLang);
  if (!langPresent) {
    issues.push({
      code: "HTML_NO_LANG",
      severity: "warning",
      category: "on-page",
      title: "Missing language attribute",
      description: "The <html> element does not have a lang attribute. This helps search engines and screen readers.",
      impact: "Search engines may not properly identify the page language. Accessibility is reduced.",
      howToFix: 'Add lang attribute to <html>: <html lang="en"> (use appropriate language code).',
      affectedUrls: [url]
    });
  }
  const viewportMeta = $('meta[name="viewport"]').attr("content");
  const hasViewport = Boolean(viewportMeta);
  const isResponsive = viewportMeta?.includes("width=device-width") || false;
  if (!hasViewport) {
    issues.push({
      code: "HTML_NO_VIEWPORT",
      severity: "warning",
      category: "mobile",
      title: "Missing viewport meta tag",
      description: "Page does not have a viewport meta tag. This is required for proper mobile rendering.",
      impact: "Page will not render correctly on mobile devices. Fails mobile-friendliness test.",
      howToFix: 'Add: <meta name="viewport" content="width=device-width, initial-scale=1">',
      affectedUrls: [url]
    });
  } else if (!isResponsive) {
    issues.push({
      code: "HTML_FIXED_VIEWPORT",
      severity: "notice",
      category: "mobile",
      title: "Viewport not responsive",
      description: `Viewport is set to "${viewportMeta}" but doesn't include width=device-width for responsive design.`,
      impact: "Page may not scale properly on different screen sizes.",
      howToFix: 'Update viewport to: <meta name="viewport" content="width=device-width, initial-scale=1">',
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      doctype: {
        present: hasDoctype,
        isHtml5,
        value: doctypeValue
      },
      charset: {
        present: charsetPresent,
        isUtf8,
        value: charsetValue,
        source: charsetSource
      },
      favicon: {
        present: faviconLocations.length > 0,
        locations: faviconLocations,
        hasAppleTouchIcon,
        formats: [...new Set(faviconFormats)]
      },
      language: {
        present: langPresent,
        value: htmlLang
      },
      viewport: {
        present: hasViewport,
        value: viewportMeta,
        isResponsive
      }
    }
  };
}

// src/audit/checks/canonical-domain.ts
async function analyzeCanonicalDomain(url) {
  const issues = [];
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;
  const isWww = hostname.startsWith("www.");
  const wwwHostname = isWww ? hostname : `www.${hostname}`;
  const nonWwwHostname = isWww ? hostname.substring(4) : hostname;
  const parts = nonWwwHostname.split(".");
  if (parts.length > 2 && !nonWwwHostname.match(/\.(co|com|org|net|gov)\.[a-z]{2}$/i)) {
    return {
      issues: [],
      data: {
        primaryDomain: hostname,
        wwwVersion: { url: "", status: null, accessible: false },
        nonWwwVersion: { url: "", status: null, accessible: false },
        hasProperRedirect: true,
        // N/A for subdomains
        preferredVersion: "unknown",
        httpsRedirect: { httpToHttps: false, httpsStatus: null }
      }
    };
  }
  const wwwUrl = `https://${wwwHostname}${parsedUrl.pathname}`;
  const nonWwwUrl = `https://${nonWwwHostname}${parsedUrl.pathname}`;
  const [wwwResult, nonWwwResult] = await Promise.all([
    testUrl(wwwUrl),
    testUrl(nonWwwUrl)
  ]);
  let hasProperRedirect = false;
  let preferredVersion = "unknown";
  if (wwwResult.status && wwwResult.status >= 300 && wwwResult.status < 400) {
    if (wwwResult.redirectsTo?.includes(nonWwwHostname)) {
      hasProperRedirect = true;
      preferredVersion = "non-www";
    }
  }
  if (nonWwwResult.status && nonWwwResult.status >= 300 && nonWwwResult.status < 400) {
    if (nonWwwResult.redirectsTo?.includes(wwwHostname)) {
      hasProperRedirect = true;
      preferredVersion = "www";
    }
  }
  const bothAccessible = wwwResult.accessible && nonWwwResult.accessible && wwwResult.status === 200 && nonWwwResult.status === 200;
  if (bothAccessible && !hasProperRedirect) {
    issues.push({
      code: "CANONICAL_WWW_DUPLICATE",
      severity: "warning",
      category: "crawlability",
      title: "Both www and non-www versions accessible",
      description: `Both ${wwwUrl} and ${nonWwwUrl} return 200 OK. This creates duplicate content.`,
      impact: "Search engines may index both versions, diluting page authority and causing ranking issues.",
      howToFix: "Set up a 301 redirect from one version to the other. Most sites prefer non-www, but either works. Configure at server/CDN level.",
      affectedUrls: [wwwUrl, nonWwwUrl],
      details: {
        wwwStatus: wwwResult.status,
        nonWwwStatus: nonWwwResult.status,
        recommendation: "Choose one version as canonical and 301 redirect the other."
      }
    });
  }
  const httpUrl = `http://${hostname}${parsedUrl.pathname}`;
  const httpResult = await testUrl(httpUrl);
  let httpToHttps = false;
  if (httpResult.status && httpResult.status >= 300 && httpResult.status < 400) {
    if (httpResult.redirectsTo?.startsWith("https://")) {
      httpToHttps = true;
    }
  }
  if (!httpToHttps && httpResult.accessible && httpResult.status === 200) {
    issues.push({
      code: "CANONICAL_NO_HTTPS_REDIRECT",
      severity: "warning",
      category: "security",
      title: "HTTP does not redirect to HTTPS",
      description: "The HTTP version of the site is accessible without redirecting to HTTPS.",
      impact: "Duplicate content issues and security concerns. Users may access insecure version.",
      howToFix: "Configure a 301 redirect from HTTP to HTTPS at the server or CDN level.",
      affectedUrls: [httpUrl]
    });
  }
  return {
    issues,
    data: {
      primaryDomain: hostname,
      wwwVersion: {
        url: wwwUrl,
        status: wwwResult.status,
        redirectsTo: wwwResult.redirectsTo,
        accessible: wwwResult.accessible
      },
      nonWwwVersion: {
        url: nonWwwUrl,
        status: nonWwwResult.status,
        redirectsTo: nonWwwResult.redirectsTo,
        accessible: nonWwwResult.accessible
      },
      hasProperRedirect,
      preferredVersion,
      httpsRedirect: {
        httpToHttps,
        httpsStatus: httpResult.status
      }
    }
  };
}
async function testUrl(url) {
  try {
    const response = await httpGet(url, {
      timeout: 1e4,
      maxRedirects: 0,
      // Don't follow redirects
      validateStatus: () => true
    });
    const status = response.status;
    const location = response.headers.location || response.headers.Location;
    return {
      status,
      redirectsTo: location,
      accessible: status !== null && status < 500
    };
  } catch (error) {
    return {
      status: null,
      accessible: false
    };
  }
}

// src/audit/checks/caching-headers.ts
var CACHE_RECOMMENDATIONS = {
  html: 0,
  // HTML should generally not be cached or have short TTL
  css: 31536e3,
  // 1 year for versioned assets
  js: 31536e3,
  images: 31536e3,
  fonts: 31536e3,
  minimum: 86400
  // 1 day minimum for static assets
};
async function analyzeCachingHeaders(url, headers) {
  const issues = [];
  let htmlHeaders = headers;
  if (!htmlHeaders) {
    try {
      const response = await httpGet(url, {
        timeout: 1e4,
        validateStatus: () => true
      });
      htmlHeaders = response.headers;
    } catch {
      htmlHeaders = {};
    }
  }
  const htmlCaching = parseCacheHeaders(htmlHeaders);
  if (htmlCaching.maxAge && htmlCaching.maxAge > 3600) {
    issues.push({
      code: "CACHING_HTML_TOO_LONG",
      severity: "notice",
      category: "performance",
      title: "HTML page has long cache duration",
      description: `HTML page has Cache-Control max-age of ${htmlCaching.maxAge} seconds (${Math.round(htmlCaching.maxAge / 3600)} hours). HTML content changes frequently.`,
      impact: "Users may see stale content. Content updates may not appear immediately.",
      howToFix: "Set shorter cache duration for HTML: Cache-Control: no-cache or max-age=0, must-revalidate",
      affectedUrls: [url]
    });
  }
  const staticAssets = [];
  const assetUrls = await getStaticAssetUrls(url);
  let noCaching = 0;
  let shortTtl = 0;
  let properlyConfigured = 0;
  const assetsToCheck = assetUrls.slice(0, 5);
  for (const assetUrl of assetsToCheck) {
    try {
      const assetResponse = await httpGet(assetUrl, {
        timeout: 5e3,
        validateStatus: () => true
      });
      const assetCaching = parseCacheHeaders(assetResponse.headers);
      const type = getAssetType(assetUrl);
      const assetInfo = {
        url: assetUrl,
        type,
        cacheControl: assetCaching.cacheControl,
        maxAge: assetCaching.maxAge,
        hasCaching: Boolean(assetCaching.cacheControl || assetCaching.expires)
      };
      staticAssets.push(assetInfo);
      if (!assetInfo.hasCaching) {
        noCaching++;
      } else if (assetCaching.maxAge && assetCaching.maxAge < CACHE_RECOMMENDATIONS.minimum) {
        shortTtl++;
      } else {
        properlyConfigured++;
      }
    } catch {
    }
  }
  if (noCaching > 0) {
    issues.push({
      code: "CACHING_STATIC_NO_CACHE",
      severity: "warning",
      category: "performance",
      title: "Static assets missing cache headers",
      description: `${noCaching} static asset(s) have no Cache-Control header. This forces browsers to re-download on every visit.`,
      impact: "Slower page loads for repeat visitors. Increased bandwidth usage.",
      howToFix: "Add Cache-Control headers to static assets. For versioned files (with hash in filename), use: Cache-Control: public, max-age=31536000, immutable",
      affectedUrls: staticAssets.filter((a) => !a.hasCaching).map((a) => a.url),
      details: {
        recommendation: {
          "versioned assets (with hash)": "Cache-Control: public, max-age=31536000, immutable",
          "non-versioned assets": "Cache-Control: public, max-age=86400"
        }
      }
    });
  }
  if (shortTtl > 0) {
    issues.push({
      code: "CACHING_STATIC_SHORT_TTL",
      severity: "notice",
      category: "performance",
      title: "Static assets have short cache duration",
      description: `${shortTtl} static asset(s) have cache duration under 1 day. Consider longer caching for better performance.`,
      impact: "Assets are re-downloaded more often than necessary.",
      howToFix: "Increase max-age for static assets. Use versioned filenames (hash in filename) to enable long-term caching.",
      affectedUrls: staticAssets.filter((a) => a.maxAge && a.maxAge < CACHE_RECOMMENDATIONS.minimum).map((a) => a.url)
    });
  }
  if (!htmlCaching.etag && !htmlCaching.lastModified) {
    issues.push({
      code: "CACHING_NO_VALIDATORS",
      severity: "notice",
      category: "performance",
      title: "Missing cache validators (ETag/Last-Modified)",
      description: "Page is missing both ETag and Last-Modified headers. These allow efficient cache validation.",
      impact: "Browsers cannot efficiently validate if cached content is still fresh.",
      howToFix: "Configure your server to send ETag or Last-Modified headers. Most web servers do this automatically for static files.",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      htmlCaching,
      staticAssets,
      issues: {
        noCaching,
        shortTtl,
        properlyConfigured
      }
    }
  };
}
function parseCacheHeaders(headers) {
  const cacheControl = headers["cache-control"] || headers["Cache-Control"];
  const expires = headers["expires"] || headers["Expires"];
  const etag = headers["etag"] || headers["ETag"];
  const lastModified = headers["last-modified"] || headers["Last-Modified"];
  let maxAge;
  let isPublic = false;
  let isPrivate = false;
  let noStore = false;
  let noCache = false;
  if (cacheControl) {
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
    if (maxAgeMatch) {
      maxAge = parseInt(maxAgeMatch[1], 10);
    }
    const lowerCC = cacheControl.toLowerCase();
    isPublic = lowerCC.includes("public");
    isPrivate = lowerCC.includes("private");
    noStore = lowerCC.includes("no-store");
    noCache = lowerCC.includes("no-cache");
  }
  return {
    cacheControl,
    expires,
    etag,
    lastModified,
    maxAge,
    isPublic,
    isPrivate,
    noStore,
    noCache
  };
}
async function getStaticAssetUrls(pageUrl) {
  const assets = [];
  try {
    const response = await httpGet(pageUrl, {
      timeout: 1e4,
      validateStatus: () => true
    });
    const html = response.data;
    const baseUrl = new URL(pageUrl);
    const cssMatches = html.match(/href="([^"]+\.css[^"]*)"/gi);
    if (cssMatches) {
      for (const match of cssMatches.slice(0, 2)) {
        const href = match.match(/href="([^"]+)"/)?.[1];
        if (href) {
          try {
            assets.push(new URL(href, baseUrl).href);
          } catch {
          }
        }
      }
    }
    const jsMatches = html.match(/src="([^"]+\.js[^"]*)"/gi);
    if (jsMatches) {
      for (const match of jsMatches.slice(0, 2)) {
        const src = match.match(/src="([^"]+)"/)?.[1];
        if (src) {
          try {
            assets.push(new URL(src, baseUrl).href);
          } catch {
          }
        }
      }
    }
    const imgMatches = html.match(/src="([^"]+\.(png|jpg|jpeg|gif|webp|svg)[^"]*)"/gi);
    if (imgMatches) {
      for (const match of imgMatches.slice(0, 1)) {
        const src = match.match(/src="([^"]+)"/)?.[1];
        if (src) {
          try {
            assets.push(new URL(src, baseUrl).href);
          } catch {
          }
        }
      }
    }
  } catch {
  }
  return assets;
}
function getAssetType(url) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes(".css"))
    return "css";
  if (lowerUrl.includes(".js"))
    return "javascript";
  if (lowerUrl.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)/))
    return "image";
  if (lowerUrl.match(/\.(woff|woff2|ttf|otf|eot)/))
    return "font";
  return "other";
}

// src/audit/checks/dom-size.ts
import * as cheerio50 from "https://esm.sh/cheerio@1.0.0";
var THRESHOLDS = {
  totalElements: {
    warning: 1500,
    error: 3e3
  },
  maxDepth: {
    warning: 32,
    error: 64
  },
  maxChildren: {
    warning: 60,
    error: 120
  }
};
function analyzeDomSize(html, url) {
  const issues = [];
  const $ = cheerio50.load(html);
  const allElements = $("*");
  const totalElements = allElements.length;
  let maxDepth = 0;
  let deepestPath = [];
  function getDepth(element, path) {
    const children = element.children();
    if (children.length === 0) {
      if (path.length > maxDepth) {
        maxDepth = path.length;
        deepestPath = [...path];
      }
      return path.length;
    }
    let maxChildDepth = path.length;
    children.each((_, child) => {
      const $child = $(child);
      const tagName = child.type === "tag" ? child.name : "";
      if (tagName) {
        const childPath = [...path, tagName];
        const childDepth = getDepth($child, childPath);
        if (childDepth > maxChildDepth) {
          maxChildDepth = childDepth;
        }
      }
    });
    return maxChildDepth;
  }
  const $body = $("body");
  if ($body.length > 0) {
    getDepth($body, ["body"]);
  }
  let maxChildren = 0;
  let widestSelector = "";
  allElements.each((_, element) => {
    const $el = $(element);
    const directChildren = $el.children().length;
    if (directChildren > maxChildren) {
      maxChildren = directChildren;
      const tagName = element.type === "tag" ? element.name : "";
      const id = $el.attr("id");
      const className = $el.attr("class")?.split(" ")[0];
      widestSelector = id ? `#${id}` : className ? `${tagName}.${className}` : tagName;
    }
  });
  const elementBreakdown = {
    divs: $("div").length,
    spans: $("span").length,
    tables: $("table").length,
    lists: $("ul, ol, li").length,
    forms: $("form").length,
    inputs: $("input, select, textarea").length,
    images: $("img").length,
    scripts: $("script").length,
    svgs: $("svg").length
  };
  if (totalElements > THRESHOLDS.totalElements.error) {
    issues.push({
      code: "DOM_SIZE_EXCESSIVE",
      severity: "error",
      category: "performance",
      title: "Excessive DOM size",
      description: `Page has ${totalElements.toLocaleString()} DOM elements (threshold: ${THRESHOLDS.totalElements.error.toLocaleString()}). This severely impacts performance.`,
      impact: "Significantly slower rendering, increased memory usage, and degraded interactivity. Users on low-end devices will experience major lag.",
      howToFix: "Reduce DOM complexity: virtualize long lists, lazy-load content, remove unnecessary wrapper elements, use CSS instead of extra markup.",
      affectedUrls: [url],
      details: {
        totalElements,
        breakdown: elementBreakdown,
        suggestions: getDomReductionSuggestions(elementBreakdown)
      }
    });
  } else if (totalElements > THRESHOLDS.totalElements.warning) {
    issues.push({
      code: "DOM_SIZE_LARGE",
      severity: "warning",
      category: "performance",
      title: "Large DOM size",
      description: `Page has ${totalElements.toLocaleString()} DOM elements (recommended: <${THRESHOLDS.totalElements.warning.toLocaleString()}).`,
      impact: "Slower style calculations, layout operations, and JavaScript performance.",
      howToFix: "Consider reducing DOM size: remove unnecessary elements, lazy-load off-screen content, virtualize long lists.",
      affectedUrls: [url],
      details: {
        totalElements,
        threshold: THRESHOLDS.totalElements.warning
      }
    });
  }
  if (maxDepth > THRESHOLDS.maxDepth.warning) {
    issues.push({
      code: "DOM_DEPTH_EXCESSIVE",
      severity: maxDepth > THRESHOLDS.maxDepth.error ? "error" : "warning",
      category: "performance",
      title: "Excessive DOM depth",
      description: `Maximum DOM depth is ${maxDepth} levels (recommended: <${THRESHOLDS.maxDepth.warning}).`,
      impact: "Deep nesting increases style calculation time and can cause stack overflow in some browsers.",
      howToFix: "Flatten your HTML structure. Remove unnecessary wrapper divs. Use CSS flexbox/grid instead of nested containers.",
      affectedUrls: [url],
      details: {
        maxDepth,
        deepestPath: deepestPath.slice(0, 10).join(" > ") + (deepestPath.length > 10 ? "..." : "")
      }
    });
  }
  if (maxChildren > THRESHOLDS.maxChildren.warning) {
    issues.push({
      code: "DOM_CHILDREN_EXCESSIVE",
      severity: maxChildren > THRESHOLDS.maxChildren.error ? "error" : "warning",
      category: "performance",
      title: "Element has too many children",
      description: `An element has ${maxChildren} direct children (recommended: <${THRESHOLDS.maxChildren.warning}).`,
      impact: "Adding/removing children triggers expensive layout recalculations.",
      howToFix: "Break large lists into smaller chunks. Use virtual scrolling for long lists. Group items into sections.",
      affectedUrls: [url],
      details: {
        maxChildren,
        element: widestSelector
      }
    });
  }
  return {
    issues,
    data: {
      totalElements,
      maxDepth,
      maxChildren,
      deepestPath,
      widestElement: {
        selector: widestSelector,
        childCount: maxChildren
      },
      elementBreakdown
    }
  };
}
function getDomReductionSuggestions(breakdown) {
  const suggestions = [];
  if (breakdown.divs > 500) {
    suggestions.push(`High div count (${breakdown.divs}): Review wrapper divs that may be unnecessary`);
  }
  if (breakdown.spans > 200) {
    suggestions.push(`High span count (${breakdown.spans}): Consider if all spans are needed for styling`);
  }
  if (breakdown.tables > 10) {
    suggestions.push(`Multiple tables (${breakdown.tables}): Consider CSS grid/flexbox for layouts`);
  }
  if (breakdown.lists > 100) {
    suggestions.push(`Many list items (${breakdown.lists}): Consider virtualizing long lists`);
  }
  if (breakdown.svgs > 50) {
    suggestions.push(`Many SVGs (${breakdown.svgs}): Consider SVG sprites or icon fonts`);
  }
  return suggestions;
}

// src/audit/checks/image-dimensions.ts
import * as cheerio51 from "https://esm.sh/cheerio@1.0.0";
function analyzeImageDimensions(html, url) {
  const issues = [];
  const $ = cheerio51.load(html);
  const images = $("img");
  const totalImages = images.length;
  let withDimensions = 0;
  let withoutDimensions = 0;
  let aspectRatioSet = 0;
  const missingDimensions = [];
  images.each((_, img) => {
    const $img = $(img);
    const src = $img.attr("src") || $img.attr("data-src") || "";
    const widthAttr = $img.attr("width");
    const heightAttr = $img.attr("height");
    const style = $img.attr("style") || "";
    const hasWidthAttr = Boolean(widthAttr);
    const hasHeightAttr = Boolean(heightAttr);
    const hasStyleWidth = /width\s*:/i.test(style);
    const hasStyleHeight = /height\s*:/i.test(style);
    const hasAspectRatio = /aspect-ratio\s*:/i.test(style);
    const className = $img.attr("class") || "";
    const hasWidth = hasWidthAttr || hasStyleWidth;
    const hasHeight = hasHeightAttr || hasStyleHeight;
    const hasBothDimensions = hasWidth && hasHeight || hasAspectRatio;
    if (hasBothDimensions) {
      withDimensions++;
      if (hasAspectRatio) {
        aspectRatioSet++;
      }
    } else {
      withoutDimensions++;
      if (src && !src.includes("data:image/") && !src.includes("placeholder")) {
        const parent = $img.parent();
        const parentTag = parent.length > 0 ? parent[0].name || "" : "";
        const parentClass = parent.attr("class")?.split(" ")[0] || "";
        const context = parentClass ? `${parentTag}.${parentClass}` : parentTag;
        missingDimensions.push({
          src: truncateSrc(src),
          hasWidth,
          hasHeight,
          hasAspectRatio,
          context
        });
      }
    }
  });
  if (withoutDimensions > 0) {
    const percentage = Math.round(withoutDimensions / totalImages * 100);
    if (percentage > 50) {
      issues.push({
        code: "IMAGES_MANY_MISSING_DIMENSIONS",
        severity: "warning",
        category: "performance",
        title: "Most images missing explicit dimensions",
        description: `${withoutDimensions} of ${totalImages} images (${percentage}%) don't have width and height attributes. This causes layout shifts.`,
        impact: "High Cumulative Layout Shift (CLS). Content jumps around as images load, frustrating users.",
        howToFix: 'Add width and height attributes to all <img> tags. Use CSS aspect-ratio for responsive images. Example: <img src="..." width="800" height="600">',
        affectedUrls: [url],
        details: {
          totalImages,
          withDimensions,
          withoutDimensions,
          examples: missingDimensions.slice(0, 5)
        }
      });
    } else if (withoutDimensions > 0) {
      issues.push({
        code: "IMAGES_MISSING_DIMENSIONS",
        severity: "notice",
        category: "performance",
        title: "Some images missing explicit dimensions",
        description: `${withoutDimensions} of ${totalImages} image(s) don't have width and height attributes.`,
        impact: "May cause layout shifts when images load, affecting CLS score.",
        howToFix: 'Add width and height attributes: <img src="..." width="800" height="600">. For responsive images, also use CSS: img { max-width: 100%; height: auto; }',
        affectedUrls: [url],
        details: {
          images: missingDimensions.slice(0, 10)
        }
      });
    }
  }
  if (withDimensions > 0 && aspectRatioSet === 0) {
    issues.push({
      code: "IMAGES_NO_ASPECT_RATIO",
      severity: "notice",
      category: "performance",
      title: "Consider using CSS aspect-ratio for images",
      description: "Images have width/height but no CSS aspect-ratio. The aspect-ratio property provides better responsive behavior.",
      impact: "Minor - existing dimensions prevent CLS, but aspect-ratio offers better control.",
      howToFix: "Add CSS aspect-ratio for responsive images: img { aspect-ratio: 16/9; width: 100%; height: auto; }",
      affectedUrls: [url]
    });
  }
  return {
    issues,
    data: {
      totalImages,
      withDimensions,
      withoutDimensions,
      missingDimensions: missingDimensions.slice(0, 20),
      aspectRatioSet
    }
  };
}
function truncateSrc(src) {
  const cleanSrc = src.split("?")[0];
  if (cleanSrc.length > 60) {
    return cleanSrc.substring(0, 30) + "..." + cleanSrc.substring(cleanSrc.length - 25);
  }
  return cleanSrc;
}

// src/audit/checks/color-contrast.ts
import * as cheerio52 from "https://esm.sh/cheerio@1.0.0";
var KNOWN_LOW_CONTRAST_PAIRS = [
  { fg: "#999999", bg: "#ffffff", ratio: 2.85 },
  { fg: "#888888", bg: "#ffffff", ratio: 3.54 },
  { fg: "#aaaaaa", bg: "#ffffff", ratio: 2.32 },
  { fg: "#cccccc", bg: "#ffffff", ratio: 1.61 },
  { fg: "#666666", bg: "#000000", ratio: 5.74 },
  { fg: "#777777", bg: "#000000", ratio: 4.48 },
  { fg: "gray", bg: "white", ratio: 3.95 },
  { fg: "silver", bg: "white", ratio: 1.77 },
  { fg: "lightgray", bg: "white", ratio: 1.46 }
];
var NAMED_COLORS = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  silver: [192, 192, 192],
  navy: [0, 0, 128],
  yellow: [255, 255, 0],
  orange: [255, 165, 0],
  purple: [128, 0, 128],
  pink: [255, 192, 203],
  lightgray: [211, 211, 211],
  lightgrey: [211, 211, 211],
  darkgray: [169, 169, 169],
  darkgrey: [169, 169, 169],
  transparent: [255, 255, 255]
  // Treat as white for calculation
};
function analyzeColorContrast(html, url) {
  const issues = [];
  const $ = cheerio52.load(html);
  const potentialIssues = [];
  let elementsAnalyzed = 0;
  let passedChecks = 0;
  let failedChecks = 0;
  let cannotDetermine = 0;
  const textElements = $("p, span, a, button, h1, h2, h3, h4, h5, h6, li, td, th, label, div");
  textElements.each((_, element) => {
    const $el = $(element);
    const style = $el.attr("style") || "";
    if (!style) {
      cannotDetermine++;
      return;
    }
    elementsAnalyzed++;
    const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    const bgMatch = style.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i);
    const foreground = colorMatch ? colorMatch[1].trim() : null;
    const background = bgMatch ? bgMatch[1].trim() : null;
    if (!foreground) {
      cannotDetermine++;
      return;
    }
    const bgColor = background || "white";
    const fgRgb = parseColor(foreground);
    const bgRgb = parseColor(bgColor);
    if (!fgRgb || !bgRgb) {
      cannotDetermine++;
      return;
    }
    const ratio = calculateContrastRatio(fgRgb, bgRgb);
    const fontSize = style.match(/font-size\s*:\s*(\d+)(?:px|pt)?/i);
    const fontWeight = style.match(/font-weight\s*:\s*(\d+|bold)/i);
    const isLargeText = fontSize && parseInt(fontSize[1]) >= 18 || fontSize && parseInt(fontSize[1]) >= 14 && fontWeight && (fontWeight[1] === "bold" || parseInt(fontWeight[1]) >= 700);
    const aaThreshold = isLargeText ? 3 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7;
    let wcagLevel = "none";
    if (ratio >= aaaThreshold) {
      wcagLevel = "AAA";
      passedChecks++;
    } else if (ratio >= aaThreshold) {
      wcagLevel = "AA";
      passedChecks++;
    } else {
      failedChecks++;
      const tagName = element.name;
      const id = $el.attr("id");
      const className = $el.attr("class")?.split(" ")[0];
      const selector = id ? `#${id}` : className ? `${tagName}.${className}` : tagName;
      potentialIssues.push({
        selector,
        foreground,
        background: bgColor,
        contrastRatio: Math.round(ratio * 100) / 100,
        wcagLevel,
        isLargeText: isLargeText || false
      });
    }
  });
  const styleTag = $("style").text();
  for (const pair of KNOWN_LOW_CONTRAST_PAIRS) {
    if (styleTag.includes(pair.fg) && styleTag.includes(pair.bg)) {
    }
  }
  if (potentialIssues.length > 0) {
    const criticalIssues = potentialIssues.filter((i) => i.contrastRatio < 3);
    const moderateIssues = potentialIssues.filter((i) => i.contrastRatio >= 3 && i.contrastRatio < 4.5);
    if (criticalIssues.length > 0) {
      issues.push({
        code: "A11Y_CONTRAST_CRITICAL",
        severity: "error",
        category: "accessibility",
        title: "Critical color contrast issues",
        description: `Found ${criticalIssues.length} element(s) with very low contrast (below 3:1). This text may be unreadable for many users.`,
        impact: "Users with low vision or color blindness cannot read this content. Fails WCAG accessibility requirements.",
        howToFix: "Increase contrast by using darker text on light backgrounds or lighter text on dark backgrounds. Use a contrast checker tool to verify 4.5:1 ratio minimum.",
        affectedUrls: [url],
        details: {
          issues: criticalIssues.slice(0, 5),
          recommendation: "WCAG AA requires 4.5:1 contrast for normal text, 3:1 for large text."
        }
      });
    }
    if (moderateIssues.length > 0) {
      issues.push({
        code: "A11Y_CONTRAST_LOW",
        severity: "warning",
        category: "accessibility",
        title: "Low color contrast detected",
        description: `Found ${moderateIssues.length} element(s) with contrast below WCAG AA standard (4.5:1).`,
        impact: "May be difficult to read for users with visual impairments.",
        howToFix: "Adjust colors to achieve at least 4.5:1 contrast ratio for normal text.",
        affectedUrls: [url],
        details: {
          issues: moderateIssues.slice(0, 5)
        }
      });
    }
  }
  if (cannotDetermine > elementsAnalyzed * 0.8) {
    issues.push({
      code: "A11Y_CONTRAST_UNDETERMINED",
      severity: "notice",
      category: "accessibility",
      title: "Color contrast could not be fully analyzed",
      description: "Most text colors are set via CSS stylesheets rather than inline styles. Full contrast checking requires browser rendering.",
      impact: "Potential contrast issues may exist that were not detected.",
      howToFix: "Use browser DevTools (Lighthouse accessibility audit) or dedicated tools like axe-core for comprehensive contrast checking.",
      affectedUrls: [url],
      details: {
        elementsAnalyzed,
        cannotDetermine,
        recommendation: "Run Lighthouse accessibility audit for complete contrast analysis."
      }
    });
  }
  return {
    issues,
    data: {
      elementsAnalyzed,
      potentialIssues,
      passedChecks,
      failedChecks,
      cannotDetermine
    }
  };
}
function parseColor(color) {
  const trimmed = color.trim().toLowerCase();
  if (NAMED_COLORS[trimmed]) {
    return NAMED_COLORS[trimmed];
  }
  const hexMatch = trimmed.match(/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    ];
  }
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]),
      parseInt(rgbMatch[2]),
      parseInt(rgbMatch[3])
    ];
  }
  const hslMatch = trimmed.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/i);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    return hslToRgb(h, s, l);
  }
  return null;
}
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p2, q2, t) => {
      if (t < 0)
        t += 1;
      if (t > 1)
        t -= 1;
      if (t < 1 / 6)
        return p2 + (q2 - p2) * 6 * t;
      if (t < 1 / 2)
        return q2;
      if (t < 2 / 3)
        return p2 + (q2 - p2) * (2 / 3 - t) * 6;
      return p2;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function getRelativeLuminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function calculateContrastRatio(fg, bg) {
  const l1 = getRelativeLuminance(fg);
  const l2 = getRelativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// src/audit/checks/asset-minification.ts
import * as cheerio53 from "https://esm.sh/cheerio@1.0.0";
function isMinified(content, type) {
  const lines = content.split("\n");
  const totalLines = lines.length;
  const avgLineLength = totalLines > 0 ? content.length / totalLines : 0;
  const whitespaceCount = (content.match(/\s/g) || []).length;
  const whitespaceRatio = content.length > 0 ? whitespaceCount / content.length : 0;
  let hasComments = false;
  if (type === "css") {
    hasComments = /\/\*[\s\S]*?\*\//.test(content);
  } else {
    hasComments = /\/\/[^\n]*|\/\*[\s\S]*?\*\//.test(content);
  }
  const isMinifiedByLineLength = avgLineLength > 500;
  const isMinifiedByWhitespace = whitespaceRatio < 0.1;
  const isMinifiedByComments = !hasComments;
  const score = (isMinifiedByLineLength ? 1 : 0) + (isMinifiedByWhitespace ? 1 : 0) + (isMinifiedByComments ? 1 : 0);
  const isSingleLineMinified = totalLines <= 2 && avgLineLength > 100;
  return {
    isMinified: score >= 2 || isSingleLineMinified,
    indicators: {
      avgLineLength: Math.round(avgLineLength),
      whitespaceRatio: Math.round(whitespaceRatio * 100) / 100,
      hasComments
    }
  };
}
function extractAssetUrls(html, baseUrl) {
  const $ = cheerio53.load(html);
  const base = new URL(baseUrl);
  const css = [];
  const js = [];
  $('link[rel="stylesheet"][href]').each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("data:")) {
      try {
        const fullUrl = new URL(href, base).href;
        if (new URL(fullUrl).hostname === base.hostname) {
          css.push(fullUrl);
        }
      } catch {
      }
    }
  });
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      try {
        const fullUrl = new URL(src, base).href;
        if (new URL(fullUrl).hostname === base.hostname) {
          js.push(fullUrl);
        }
      } catch {
      }
    }
  });
  return { css, js };
}
async function analyzeAssetMinification(html, url) {
  const issues = [];
  const assetUrls = extractAssetUrls(html, url);
  const cssFiles = [];
  const jsFiles = [];
  const cssToCheck = assetUrls.css.slice(0, 3);
  const cssPromises = cssToCheck.map(async (cssUrl) => {
    try {
      const response = await httpGet(cssUrl, {
        timeout: 3e3,
        // Reduced timeout
        validateStatus: () => true
      });
      if (response.status === 200 && typeof response.data === "string") {
        const content = response.data;
        const { isMinified: minified, indicators } = isMinified(content, "css");
        cssFiles.push({
          url: cssUrl,
          size: content.length,
          isMinified: minified,
          indicators
        });
      }
    } catch {
    }
  });
  const jsToCheck = assetUrls.js.slice(0, 3);
  const jsPromises = jsToCheck.map(async (jsUrl) => {
    try {
      const response = await httpGet(jsUrl, {
        timeout: 3e3,
        // Reduced timeout
        validateStatus: () => true
      });
      if (response.status === 200 && typeof response.data === "string") {
        const content = response.data;
        const { isMinified: minified, indicators } = isMinified(content, "js");
        jsFiles.push({
          url: jsUrl,
          size: content.length,
          isMinified: minified,
          indicators
        });
      }
    } catch {
    }
  });
  await Promise.race([
    Promise.all([...cssPromises, ...jsPromises]),
    new Promise((resolve) => setTimeout(resolve, 8e3))
    // 8s overall timeout
  ]);
  const unminifiedCss = cssFiles.filter((f) => !f.isMinified);
  const unminifiedJs = jsFiles.filter((f) => !f.isMinified);
  const cssSavings = unminifiedCss.reduce((sum, f) => sum + Math.round(f.size * 0.4), 0);
  const jsSavings = unminifiedJs.reduce((sum, f) => sum + Math.round(f.size * 0.4), 0);
  if (unminifiedCss.length > 0) {
    issues.push({
      code: "CSS_NOT_MINIFIED",
      severity: "warning",
      category: "performance",
      title: "CSS files not minified",
      description: `${unminifiedCss.length} CSS file(s) appear to not be minified. Minification removes whitespace and comments to reduce file size.`,
      impact: `Unminified CSS increases page load time. Potential savings: ~${Math.round(cssSavings / 1024)}KB.`,
      howToFix: "Use a CSS minifier like cssnano, clean-css, or build tools (Vite, Webpack) to minify CSS files. Most bundlers do this automatically in production builds.",
      affectedUrls: unminifiedCss.map((f) => f.url),
      details: {
        files: unminifiedCss.map((f) => ({
          url: f.url,
          size: `${Math.round(f.size / 1024)}KB`,
          avgLineLength: f.indicators.avgLineLength,
          whitespaceRatio: `${Math.round(f.indicators.whitespaceRatio * 100)}%`,
          hasComments: f.indicators.hasComments
        }))
      }
    });
  }
  if (unminifiedJs.length > 0) {
    issues.push({
      code: "JS_NOT_MINIFIED",
      severity: "warning",
      category: "performance",
      title: "JavaScript files not minified",
      description: `${unminifiedJs.length} JavaScript file(s) appear to not be minified. Minification removes whitespace, comments, and shortens variable names.`,
      impact: `Unminified JavaScript increases page load time and parsing time. Potential savings: ~${Math.round(jsSavings / 1024)}KB.`,
      howToFix: "Use a JS minifier like Terser, UglifyJS, or build tools (Vite, Webpack, esbuild) to minify JavaScript. Most bundlers do this automatically in production builds.",
      affectedUrls: unminifiedJs.map((f) => f.url),
      details: {
        files: unminifiedJs.map((f) => ({
          url: f.url,
          size: `${Math.round(f.size / 1024)}KB`,
          avgLineLength: f.indicators.avgLineLength,
          whitespaceRatio: `${Math.round(f.indicators.whitespaceRatio * 100)}%`,
          hasComments: f.indicators.hasComments
        }))
      }
    });
  }
  return {
    issues,
    data: {
      cssFiles,
      jsFiles,
      totalCssFiles: assetUrls.css.length,
      totalJsFiles: assetUrls.js.length,
      unminifiedCss: unminifiedCss.length,
      unminifiedJs: unminifiedJs.length,
      potentialSavings: {
        css: cssSavings,
        js: jsSavings
      }
    }
  };
}

// src/audit/checks/page-resources.ts
import * as cheerio54 from "https://esm.sh/cheerio@1.0.0";
function analyzePageResources(html, url) {
  const issues = [];
  const $ = cheerio54.load(html);
  const baseUrl = new URL(url);
  const baseHostname = baseUrl.hostname;
  const stylesheets = [];
  const scripts = [];
  const images = [];
  const fonts = [];
  const iframes = [];
  const thirdPartyDomains = /* @__PURE__ */ new Set();
  let firstParty = 0;
  let thirdParty = 0;
  function isFirstParty(resourceUrl) {
    try {
      const resourceHostname = new URL(resourceUrl, url).hostname;
      return resourceHostname === baseHostname || resourceHostname.endsWith(`.${baseHostname}`);
    } catch {
      return true;
    }
  }
  function trackOrigin(resourceUrl) {
    if (isFirstParty(resourceUrl)) {
      firstParty++;
    } else {
      thirdParty++;
      try {
        const domain = new URL(resourceUrl, url).hostname;
        thirdPartyDomains.add(domain);
      } catch {
      }
    }
  }
  $('link[rel="stylesheet"][href]').each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("data:")) {
      stylesheets.push(href);
      trackOrigin(href);
    }
  });
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      scripts.push(src);
      trackOrigin(src);
    }
  });
  $("img[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      images.push(src);
      trackOrigin(src);
    }
  });
  $("img[srcset], source[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset");
    if (srcset) {
      const urls = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]);
      for (const srcUrl of urls) {
        if (srcUrl && !srcUrl.startsWith("data:") && !images.includes(srcUrl)) {
          images.push(srcUrl);
          trackOrigin(srcUrl);
        }
      }
    }
  });
  $('link[rel="preload"][as="font"], link[href*=".woff"], link[href*=".woff2"], link[href*=".ttf"], link[href*=".otf"]').each(
    (_, el) => {
      const href = $(el).attr("href");
      if (href && !href.startsWith("data:")) {
        fonts.push(href);
        trackOrigin(href);
      }
    }
  );
  $("iframe[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("about:") && !src.startsWith("javascript:")) {
      iframes.push(src);
      trackOrigin(src);
    }
  });
  let other = 0;
  $('link[rel="preload"], link[rel="prefetch"], link[rel="modulepreload"]').each((_, el) => {
    const href = $(el).attr("href");
    const as = $(el).attr("as");
    if (href && !href.startsWith("data:")) {
      if (as !== "font" && as !== "style" && !stylesheets.includes(href) && !fonts.includes(href)) {
        other++;
        trackOrigin(href);
      }
    }
  });
  const total = stylesheets.length + scripts.length + images.length + fonts.length + iframes.length + other;
  if (total > 100) {
    issues.push({
      code: "PAGE_RESOURCES_EXCESSIVE",
      severity: "error",
      category: "performance",
      title: "Excessive number of page resources",
      description: `Page requests ${total} resources. This significantly impacts load time due to connection overhead and browser limits.`,
      impact: "Too many HTTP requests cause slow page loads, poor Core Web Vitals, and high bounce rates. Each request has DNS, TCP, and TLS overhead.",
      howToFix: "Combine CSS/JS files, use image sprites or inline small images, lazy-load non-critical resources, remove unused dependencies.",
      affectedUrls: [url],
      details: {
        total,
        breakdown: {
          stylesheets: stylesheets.length,
          scripts: scripts.length,
          images: images.length,
          fonts: fonts.length,
          iframes: iframes.length,
          other
        },
        recommendation: "Aim for under 50 total requests for optimal performance."
      }
    });
  } else if (total > 50) {
    issues.push({
      code: "PAGE_RESOURCES_HIGH",
      severity: "warning",
      category: "performance",
      title: "High number of page resources",
      description: `Page requests ${total} resources. Consider reducing for better performance.`,
      impact: "Many HTTP requests increase page load time, especially on mobile networks.",
      howToFix: "Bundle CSS/JS files, lazy-load images below the fold, consider critical CSS inlining.",
      affectedUrls: [url],
      details: {
        total,
        breakdown: {
          stylesheets: stylesheets.length,
          scripts: scripts.length,
          images: images.length,
          fonts: fonts.length,
          iframes: iframes.length,
          other
        }
      }
    });
  }
  if (thirdParty > 20) {
    issues.push({
      code: "PAGE_RESOURCES_THIRD_PARTY_HIGH",
      severity: "warning",
      category: "performance",
      title: "Many third-party resources",
      description: `Page loads ${thirdParty} resources from ${thirdPartyDomains.size} third-party domains.`,
      impact: "Third-party resources are outside your control and add latency. They can also be a privacy/security concern.",
      howToFix: "Self-host critical third-party resources when possible. Use preconnect hints for remaining third-party origins.",
      affectedUrls: [url],
      details: {
        thirdPartyCount: thirdParty,
        domains: Array.from(thirdPartyDomains).slice(0, 10)
      }
    });
  }
  if (iframes.length > 3) {
    issues.push({
      code: "PAGE_RESOURCES_MANY_IFRAMES",
      severity: "warning",
      category: "performance",
      title: "Multiple iframes detected",
      description: `Page contains ${iframes.length} iframes. Each iframe loads its own document and resources.`,
      impact: "Iframes significantly increase page weight and can block the main thread.",
      howToFix: "Lazy-load iframes that are below the fold. Consider native embeds or facade patterns for video/widget iframes.",
      affectedUrls: [url],
      details: {
        iframeCount: iframes.length,
        iframes: iframes.slice(0, 5)
      }
    });
  }
  return {
    issues,
    data: {
      total,
      byType: {
        stylesheets: stylesheets.length,
        scripts: scripts.length,
        images: images.length,
        fonts: fonts.length,
        iframes: iframes.length,
        other
      },
      byOrigin: {
        firstParty,
        thirdParty
      },
      thirdPartyDomains: Array.from(thirdPartyDomains),
      details: {
        stylesheets,
        scripts,
        images: images.slice(0, 20),
        // Limit for data size
        fonts,
        iframes
      }
    }
  };
}

// src/audit/checks/responsive-css.ts
import * as cheerio55 from "https://esm.sh/cheerio@1.0.0";
function extractMediaQueries(css) {
  const mediaQueries = [];
  const regex = /@media\s*([^{]+)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    mediaQueries.push(match[1].trim());
  }
  return mediaQueries;
}
function classifyBreakpoints(mediaQueries) {
  const breakpoints = /* @__PURE__ */ new Set();
  let hasMobile = false;
  let hasTablet = false;
  let hasDesktop = false;
  for (const query of mediaQueries) {
    const widthMatches = query.match(/(?:min|max)-width\s*:\s*(\d+)(?:px|em|rem)?/gi);
    if (widthMatches) {
      for (const match of widthMatches) {
        const valueMatch = match.match(/(\d+)/);
        if (valueMatch) {
          const value = parseInt(valueMatch[1], 10);
          breakpoints.add(`${value}px`);
          if (value <= 480) {
            hasMobile = true;
          } else if (value <= 768) {
            hasMobile = true;
          } else if (value <= 1024) {
            hasTablet = true;
          } else {
            hasDesktop = true;
          }
        }
      }
    }
    if (/screen\s+and/i.test(query)) {
    }
    if (/print/i.test(query)) {
      continue;
    }
  }
  return {
    hasMobile,
    hasTablet,
    hasDesktop,
    breakpoints: Array.from(breakpoints).sort((a, b) => parseInt(a) - parseInt(b))
  };
}
async function analyzeResponsiveCss(html, url) {
  const issues = [];
  const $ = cheerio55.load(html);
  const baseUrl = new URL(url);
  const viewportMeta = $('meta[name="viewport"]').attr("content");
  const hasViewport = !!viewportMeta;
  const allMediaQueries = [];
  const externalSources = [];
  let inlineCount = 0;
  $("style").each((_, el) => {
    const css = $(el).text();
    const queries = extractMediaQueries(css);
    if (queries.length > 0) {
      allMediaQueries.push(...queries);
      inlineCount += queries.length;
    }
  });
  const cssLinks = $('link[rel="stylesheet"][href]').toArray().slice(0, 3).map((el) => $(el).attr("href")).filter((href) => {
    if (!href || href.startsWith("data:"))
      return false;
    try {
      const cssHostname = new URL(href, url).hostname;
      return cssHostname === baseUrl.hostname;
    } catch {
      return false;
    }
  });
  const cssPromises = cssLinks.map(async (cssUrl) => {
    try {
      const fullUrl = new URL(cssUrl, url).href;
      const response = await httpGet(fullUrl, {
        timeout: 3e3,
        // Reduced timeout
        validateStatus: () => true
      });
      if (response.status === 200 && typeof response.data === "string") {
        const queries = extractMediaQueries(response.data);
        if (queries.length > 0) {
          allMediaQueries.push(...queries);
          externalSources.push(cssUrl);
        }
      }
    } catch {
    }
  });
  await Promise.race([
    Promise.all(cssPromises),
    new Promise((resolve) => setTimeout(resolve, 6e3))
    // 6s overall timeout
  ]);
  const hasMediaQueries = allMediaQueries.length > 0;
  const { hasMobile, hasTablet, hasDesktop, breakpoints } = classifyBreakpoints(allMediaQueries);
  if (!hasViewport) {
    issues.push({
      code: "RESPONSIVE_NO_VIEWPORT",
      severity: "error",
      category: "mobile",
      title: "Missing viewport meta tag",
      description: "No viewport meta tag found. This is required for responsive design to work properly.",
      impact: "Without a viewport meta tag, mobile browsers will render the page at desktop width and scale down, making it unusable.",
      howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head> section.',
      affectedUrls: [url]
    });
  }
  if (!hasMediaQueries) {
    issues.push({
      code: "RESPONSIVE_NO_MEDIA_QUERIES",
      severity: "warning",
      category: "mobile",
      title: "No CSS media queries detected",
      description: "No @media queries found in inline styles or first-party stylesheets.",
      impact: "Without media queries, the site likely uses fixed layouts that do not adapt to different screen sizes. This hurts mobile usability and SEO.",
      howToFix: "Add CSS media queries to adapt layout for different screen sizes. Consider using a mobile-first approach with min-width breakpoints.",
      affectedUrls: [url],
      details: {
        suggestion: "Common breakpoints: 480px (mobile), 768px (tablet), 1024px (desktop)"
      }
    });
  } else if (!hasMobile && !hasTablet) {
    issues.push({
      code: "RESPONSIVE_NO_MOBILE_BREAKPOINT",
      severity: "warning",
      category: "mobile",
      title: "No mobile breakpoints detected",
      description: `Found ${allMediaQueries.length} media queries but none target mobile screen sizes (\u2264768px).`,
      impact: "Site may not be optimized for mobile devices, which affects majority of web traffic and Google mobile-first indexing.",
      howToFix: "Add media queries for mobile devices. Example: @media (max-width: 768px) { ... } or use min-width for mobile-first.",
      affectedUrls: [url],
      details: {
        detectedBreakpoints: breakpoints
      }
    });
  }
  return {
    issues,
    data: {
      hasViewport,
      viewportContent: viewportMeta,
      hasMediaQueries,
      mediaQueryCount: allMediaQueries.length,
      mediaQuerySources: {
        inline: inlineCount,
        external: externalSources
      },
      breakpoints,
      hasMobileBreakpoint: hasMobile,
      hasTabletBreakpoint: hasTablet,
      hasDesktopBreakpoint: hasDesktop
    }
  };
}

// src/audit/checks/directory-listing.ts
var COMMON_DIRECTORIES = [
  "/images/",
  "/img/",
  "/assets/",
  "/static/",
  "/uploads/",
  "/files/",
  "/media/",
  "/css/",
  "/js/",
  "/scripts/",
  "/fonts/",
  "/backup/",
  "/temp/",
  "/tmp/"
];
var DIRECTORY_LISTING_PATTERNS = [
  // Apache
  /<title>Index of/i,
  /Parent Directory/i,
  /<h1>Index of/i,
  /\[DIR\]/i,
  /\[PARENTDIR\]/i,
  // Nginx
  /<title>Index of.*<\/title>/i,
  /autoindex/i,
  // IIS
  /\[To Parent Directory\]/i,
  /<title>.*- \/<\/title>/i,
  // Generic
  /Directory listing for/i,
  /<pre>.*<a href="[^"]*">[^<]*<\/a>.*<\/pre>/is
];
function isDirectoryListing(html) {
  return DIRECTORY_LISTING_PATTERNS.some((pattern) => pattern.test(html));
}
function detectServerType(headers) {
  const server = headers.server || headers.Server;
  if (server) {
    if (/apache/i.test(server))
      return "Apache";
    if (/nginx/i.test(server))
      return "Nginx";
    if (/iis/i.test(server))
      return "IIS";
    if (/cloudflare/i.test(server))
      return "Cloudflare";
    return server;
  }
  return void 0;
}
async function analyzeDirectoryListing(url) {
  const issues = [];
  const baseUrl = new URL(url);
  const baseOrigin = baseUrl.origin;
  const vulnerableDirectories = [];
  const checkedDirectories = [];
  let serverType;
  const directoriesToCheck = COMMON_DIRECTORIES.slice(0, 6);
  const checkPromises = directoriesToCheck.map(async (dir) => {
    const dirUrl = `${baseOrigin}${dir}`;
    checkedDirectories.push(dir);
    try {
      const response = await httpGet(dirUrl, {
        timeout: 3e3,
        // Reduced timeout
        validateStatus: () => true
      });
      if (response.headers) {
        const detectedServer = detectServerType(response.headers);
        if (detectedServer && !serverType) {
          serverType = detectedServer;
        }
      }
      if (response.status === 200 && typeof response.data === "string") {
        if (isDirectoryListing(response.data)) {
          vulnerableDirectories.push(dir);
        }
      }
    } catch {
    }
  });
  await Promise.race([
    Promise.all(checkPromises),
    new Promise((resolve) => setTimeout(resolve, 8e3))
    // 8s overall timeout
  ]);
  const directoryListingEnabled = vulnerableDirectories.length > 0;
  if (directoryListingEnabled) {
    issues.push({
      code: "DIRECTORY_LISTING_ENABLED",
      severity: "warning",
      category: "security",
      title: "Directory listing enabled",
      description: `${vulnerableDirectories.length} director${vulnerableDirectories.length === 1 ? "y" : "ies"} expose file listings. This reveals your site structure and potentially sensitive files.`,
      impact: "Attackers can discover backup files, configuration files, or hidden content. This is a security vulnerability and information disclosure risk.",
      howToFix: serverType === "Apache" ? 'Add "Options -Indexes" to your .htaccess file or Apache configuration.' : serverType === "Nginx" ? 'Remove or set "autoindex off" in your Nginx configuration.' : "Disable directory listing in your web server configuration. Add index files to directories.",
      affectedUrls: vulnerableDirectories.map((dir) => `${baseOrigin}${dir}`),
      details: {
        vulnerableDirectories,
        serverType,
        checkedCount: checkedDirectories.length,
        recommendation: "Ensure all directories have an index.html or index.php, or disable directory listing at the server level."
      }
    });
  }
  return {
    issues,
    data: {
      directoryListingEnabled,
      vulnerableDirectories,
      checkedDirectories,
      serverType
    }
  };
}

// src/audit/checks/url-safety.ts
function fnv1aHash(str) {
  let hash = 2166136261;
  const FNV_PRIME = 16777619;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
var ThreatDatabase = class {
  hashPrefixes = /* @__PURE__ */ new Set();
  domainPrefixes = /* @__PURE__ */ new Set();
  lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  sources = ["builtin-patterns"];
  constructor() {
    this.initializeBuiltinData();
  }
  /**
   * Initialize with built-in threat patterns
   * These are hashes of known malicious URL patterns
   */
  initializeBuiltinData() {
    const knownBadPatterns = [
      // Example pattern hashes - in production, load from file or Supabase
      // Format: FNV-1a hash prefix of canonical URL
    ];
    for (const prefix of knownBadPatterns) {
      this.hashPrefixes.add(prefix);
    }
  }
  /**
   * Compute canonical form of URL (similar to Google Safe Browsing)
   * - Lowercase hostname
   * - Remove default ports
   * - Normalize path
   * - Remove fragments
   */
  canonicalizeUrl(urlString) {
    try {
      const url = new URL(urlString);
      let canonical = url.protocol + "//" + url.hostname.toLowerCase();
      if (url.port && !(url.protocol === "http:" && url.port === "80" || url.protocol === "https:" && url.port === "443")) {
        canonical += ":" + url.port;
      }
      let path = url.pathname;
      if (path === "/") {
        canonical += "/";
      } else {
        path = path.replace(/\/+/g, "/");
        canonical += path;
      }
      if (url.search) {
        canonical += url.search;
      }
      return canonical;
    } catch {
      return null;
    }
  }
  /**
   * Compute hash of URL and return prefix
   * Uses FNV-1a for cross-platform compatibility (Node.js, Deno, browser)
   */
  computeHashPrefix(url) {
    return fnv1aHash(url);
  }
  /**
   * Compute hash prefix for domain only
   */
  computeDomainHashPrefix(hostname) {
    return fnv1aHash(hostname.toLowerCase());
  }
  /**
   * Check if URL matches any hash in the database
   */
  checkUrl(urlString) {
    const canonical = this.canonicalizeUrl(urlString);
    if (!canonical) {
      return { matched: false };
    }
    const urlPrefix = this.computeHashPrefix(canonical);
    if (this.hashPrefixes.has(urlPrefix)) {
      return { matched: true, prefix: urlPrefix, matchType: "exact" };
    }
    try {
      const url = new URL(urlString);
      const domainPrefix = this.computeDomainHashPrefix(url.hostname);
      if (this.domainPrefixes.has(domainPrefix)) {
        return { matched: true, prefix: domainPrefix, matchType: "domain" };
      }
    } catch {
    }
    return { matched: false };
  }
  /**
   * Add hashes from URLhaus CSV data
   * Format: id,dateadded,url,url_status,last_online,threat,tags,urlhaus_link,reporter
   */
  loadFromUrlhausCsv(csvData) {
    const lines = csvData.split("\n");
    let added = 0;
    for (const line of lines) {
      if (line.startsWith("#") || line.startsWith("id,"))
        continue;
      const parts = line.split(",");
      if (parts.length >= 3) {
        const url = parts[2].replace(/"/g, "");
        const canonical = this.canonicalizeUrl(url);
        if (canonical) {
          const prefix = this.computeHashPrefix(canonical);
          this.hashPrefixes.add(prefix);
          added++;
        }
      }
    }
    this.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    if (!this.sources.includes("urlhaus")) {
      this.sources.push("urlhaus");
    }
    return added;
  }
  /**
   * Add a list of URLs to the database
   */
  addUrls(urls) {
    let added = 0;
    for (const url of urls) {
      const canonical = this.canonicalizeUrl(url);
      if (canonical) {
        const prefix = this.computeHashPrefix(canonical);
        if (!this.hashPrefixes.has(prefix)) {
          this.hashPrefixes.add(prefix);
          added++;
        }
      }
    }
    return added;
  }
  /**
   * Add domains to the blocklist
   */
  addDomains(domains) {
    let added = 0;
    for (const domain of domains) {
      const prefix = this.computeDomainHashPrefix(domain);
      if (!this.domainPrefixes.has(prefix)) {
        this.domainPrefixes.add(prefix);
        added++;
      }
    }
    return added;
  }
  /**
   * Bulk load hash prefixes directly (for Supabase integration)
   * This is used when loading from the threat_hashes table
   */
  loadHashPrefixes(hashes) {
    let added = 0;
    for (const hash of hashes) {
      if (hash.hash_type === "url") {
        if (!this.hashPrefixes.has(hash.hash_prefix)) {
          this.hashPrefixes.add(hash.hash_prefix);
          added++;
        }
      } else if (hash.hash_type === "domain") {
        if (!this.domainPrefixes.has(hash.hash_prefix)) {
          this.domainPrefixes.add(hash.hash_prefix);
          added++;
        }
      }
    }
    this.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    if (!this.sources.includes("supabase")) {
      this.sources.push("supabase");
    }
    return added;
  }
  /**
   * Clear all hashes (useful before reloading)
   */
  clear() {
    this.hashPrefixes.clear();
    this.domainPrefixes.clear();
    this.sources = [];
  }
  /**
   * Check if database has been populated
   */
  isPopulated() {
    return this.hashPrefixes.size > 0 || this.domainPrefixes.size > 0;
  }
  /**
   * Get database statistics
   */
  getStats() {
    return {
      prefixCount: this.hashPrefixes.size + this.domainPrefixes.size,
      lastUpdated: this.lastUpdated,
      sources: this.sources
    };
  }
};
var threatDb = new ThreatDatabase();
var POPULAR_DOMAINS = [
  "google",
  "facebook",
  "amazon",
  "apple",
  "microsoft",
  "paypal",
  "netflix",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
  "github",
  "dropbox",
  "adobe",
  "salesforce",
  "stripe",
  "shopify",
  "wordpress",
  "cloudflare",
  "aws",
  "azure",
  "slack",
  "zoom",
  "docusign"
];
var SUSPICIOUS_TLDS = [
  ".tk",
  ".ml",
  ".ga",
  ".cf",
  ".gq",
  // Free TLDs abused for phishing
  ".xyz",
  ".top",
  ".work",
  ".click",
  ".link",
  ".download",
  ".zip",
  ".mov"
  // New TLDs that can be confusing
];
var SUSPICIOUS_EXTENSIONS = [
  ".exe",
  ".msi",
  ".bat",
  ".cmd",
  ".ps1",
  ".vbs",
  ".jar",
  ".scr",
  ".pif",
  ".application",
  ".hta",
  ".cpl",
  ".msc",
  ".wsf"
];
var HOMOGRAPH_CHARS = {
  "a": ["\u0430", "\u0251", "\u03B1"],
  // Cyrillic а, Latin alpha
  "c": ["\u0441", "\u03F2"],
  // Cyrillic с
  "e": ["\u0435", "\u0451"],
  // Cyrillic е
  "o": ["\u043E", "\u03BF"],
  // Cyrillic о, Greek omicron
  "p": ["\u0440"],
  // Cyrillic р
  "x": ["\u0445"],
  // Cyrillic х
  "y": ["\u0443"]
  // Cyrillic у
};
function containsHomographs(str) {
  for (const [_, lookalikes] of Object.entries(HOMOGRAPH_CHARS)) {
    for (const char of lookalikes) {
      if (str.includes(char))
        return true;
    }
  }
  return false;
}
function levenshteinDistance(a, b) {
  if (a.length === 0)
    return b.length;
  if (b.length === 0)
    return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++)
    matrix[i] = [i];
  for (let j = 0; j <= a.length; j++)
    matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
function checkTyposquatting(hostname) {
  const parts = hostname.toLowerCase().split(".");
  const mainDomain = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  for (const popular of POPULAR_DOMAINS) {
    if (mainDomain === popular)
      continue;
    const distance = levenshteinDistance(mainDomain, popular);
    if (distance > 0 && distance <= 2) {
      return `Possible typosquat of "${popular}"`;
    }
    if (mainDomain.includes(popular) && mainDomain !== popular) {
      if (mainDomain.includes("-") || mainDomain.includes("secure") || mainDomain.includes("login") || mainDomain.includes("account")) {
        return `Suspicious variation of "${popular}"`;
      }
    }
  }
  return null;
}
function analyzeUrlPatterns(urlString) {
  const reasons = [];
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      reasons.push("Uses IP address instead of domain");
    }
    for (const tld of SUSPICIOUS_TLDS) {
      if (hostname.endsWith(tld)) {
        reasons.push(`Suspicious TLD: ${tld}`);
        break;
      }
    }
    if (hostname.split(".").length > 4) {
      reasons.push("Excessive subdomains");
    }
    const typosquat = checkTyposquatting(hostname);
    if (typosquat)
      reasons.push(typosquat);
    if (containsHomographs(hostname)) {
      reasons.push("Contains look-alike Unicode characters");
    }
    for (const ext of SUSPICIOUS_EXTENSIONS) {
      if (pathname.endsWith(ext)) {
        reasons.push(`Dangerous file type: ${ext}`);
        break;
      }
    }
    if (urlString.includes("@")) {
      reasons.push("Contains @ symbol (may obscure destination)");
    }
    const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd"];
    if (shorteners.some((s) => hostname === s || hostname.endsWith("." + s))) {
      reasons.push("URL shortener (destination hidden)");
    }
  } catch {
    reasons.push("Malformed URL");
  }
  if (reasons.length === 0)
    return null;
  let riskLevel = "medium";
  const highRisk = ["homograph", "IP address", "typosquat", "Dangerous file"];
  if (reasons.some((r) => highRisk.some((h) => r.toLowerCase().includes(h.toLowerCase())))) {
    riskLevel = "high";
  }
  if (reasons.length >= 3)
    riskLevel = "high";
  return { url: urlString, reasons, riskLevel };
}
function analyzeUrlSafety(url, externalLinks = []) {
  const issues = [];
  const matchedUrls = [];
  const patternMatches = [];
  const allUrls = [url, ...externalLinks];
  for (const checkUrl of allUrls) {
    const hashResult = threatDb.checkUrl(checkUrl);
    if (hashResult.matched) {
      matchedUrls.push({
        url: checkUrl,
        hashPrefix: hashResult.prefix,
        matchType: hashResult.matchType
      });
    }
    const patternResult = analyzeUrlPatterns(checkUrl);
    if (patternResult) {
      patternMatches.push(patternResult);
    }
  }
  if (matchedUrls.length > 0) {
    const mainSiteMatched = matchedUrls.some((m) => m.url === url);
    if (mainSiteMatched) {
      issues.push({
        code: "URL_SAFETY_KNOWN_THREAT",
        severity: "error",
        category: "security",
        title: "Website URL matches known threat database",
        description: "Your website URL matches entries in the threat database. This indicates your site may have been compromised or flagged.",
        impact: "Browsers and security tools will block access to your site. Search engines will remove you from results.",
        howToFix: "Scan your site for malware, remove any malicious content, and request removal from threat databases.",
        affectedUrls: [url],
        details: {
          matchedHash: matchedUrls.find((m) => m.url === url)?.hashPrefix
        }
      });
    }
    const externalMatches = matchedUrls.filter((m) => m.url !== url);
    if (externalMatches.length > 0) {
      issues.push({
        code: "URL_SAFETY_EXTERNAL_THREAT",
        severity: "error",
        category: "security",
        title: "External links to known malicious URLs",
        description: `${externalMatches.length} external link(s) point to URLs in the threat database.`,
        impact: "Linking to malicious sites harms visitors and damages your reputation and rankings.",
        howToFix: "Remove all links to flagged URLs immediately.",
        affectedUrls: externalMatches.map((m) => m.url)
      });
    }
  }
  const highRiskPatterns = patternMatches.filter((p) => p.riskLevel === "high");
  if (highRiskPatterns.some((p) => p.url === url)) {
    const mainPattern = highRiskPatterns.find((p) => p.url === url);
    issues.push({
      code: "URL_SAFETY_SUSPICIOUS_DOMAIN",
      severity: "warning",
      category: "security",
      title: "Website URL has suspicious characteristics",
      description: `Your URL shows patterns associated with malicious sites: ${mainPattern.reasons.join("; ")}`,
      impact: "Users and security tools may distrust your site.",
      howToFix: "Use a trustworthy domain structure. Avoid patterns that mimic other brands.",
      affectedUrls: [url],
      details: { reasons: mainPattern.reasons }
    });
  }
  const suspiciousExternal = highRiskPatterns.filter((p) => p.url !== url);
  if (suspiciousExternal.length > 0) {
    issues.push({
      code: "URL_SAFETY_SUSPICIOUS_EXTERNAL",
      severity: "warning",
      category: "security",
      title: "External links with suspicious characteristics",
      description: `${suspiciousExternal.length} external link(s) show suspicious patterns.`,
      impact: "Linking to suspicious sites can harm visitors and rankings.",
      howToFix: "Review and remove or replace suspicious external links.",
      affectedUrls: suspiciousExternal.map((p) => p.url),
      details: {
        suspiciousLinks: suspiciousExternal.map((p) => ({
          url: p.url,
          reasons: p.reasons
        }))
      }
    });
  }
  const shortenerMatches = patternMatches.filter(
    (p) => p.reasons.some((r) => r.includes("shortener"))
  );
  if (shortenerMatches.length > 0) {
    issues.push({
      code: "URL_SAFETY_SHORTENERS",
      severity: "notice",
      category: "security",
      title: "External links use URL shorteners",
      description: `${shortenerMatches.length} link(s) use URL shorteners, hiding destinations.`,
      impact: "URL shorteners reduce trust and SEO link value.",
      howToFix: "Replace shortened URLs with direct links.",
      affectedUrls: shortenerMatches.map((p) => p.url)
    });
  }
  return {
    issues,
    data: {
      checkedUrls: allUrls.length,
      matchedUrls,
      databaseInfo: threatDb.getStats(),
      patternMatches
    }
  };
}
var urlSafetyDatabase = {
  /**
   * Load URLs from URLhaus CSV format
   */
  loadFromUrlhausCsv: (csv) => threatDb.loadFromUrlhausCsv(csv),
  /**
   * Add URLs to the blocklist
   */
  addUrls: (urls) => threatDb.addUrls(urls),
  /**
   * Add domains to the blocklist
   */
  addDomains: (domains) => threatDb.addDomains(domains),
  /**
   * Bulk load hash prefixes (for Supabase integration)
   * Call this with data from: SELECT hash_prefix, hash_type FROM threat_hashes WHERE is_active = TRUE
   */
  loadHashPrefixes: (hashes) => threatDb.loadHashPrefixes(hashes),
  /**
   * Clear all hashes (useful before reloading from fresh data)
   */
  clear: () => threatDb.clear(),
  /**
   * Check if database has been populated with threat data
   */
  isPopulated: () => threatDb.isPopulated(),
  /**
   * Get database statistics
   */
  getStats: () => threatDb.getStats()
};

// src/audit/checks/tracking-verification.ts
import * as cheerio56 from "https://esm.sh/cheerio@1.0.0";
function analyzeTrackingVerification(html, url) {
  const issues = [];
  const $ = cheerio56.load(html);
  const ga4Match = html.match(/gtag\s*\(\s*['"]config['"]\s*,\s*['"](G-[A-Z0-9]+)['"]/i) || html.match(/googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)/i);
  const hasGa4 = !!ga4Match;
  const ga4MeasurementId = ga4Match ? ga4Match[1] : void 0;
  const gtmMatch = html.match(/googletagmanager\.com\/gtm\.js\?id=(GTM-[A-Z0-9]+)/i);
  const hasGtm = !!gtmMatch;
  const gtmContainerId = gtmMatch ? gtmMatch[1] : void 0;
  const hasGtmNoscript = /googletagmanager\.com\/ns\.html\?id=GTM-[A-Z0-9]+/i.test(html);
  const gscMeta = $('meta[name="google-site-verification"]').attr("content");
  const hasGscVerification = !!(gscMeta && gscMeta.length > 10);
  const bingMeta = $('meta[name="msvalidate.01"]').attr("content");
  const hasBingVerification = !!(bingMeta && bingMeta.length > 10);
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const hasMicrodata = $('[itemtype*="schema.org"]').length > 0;
  const hasJsonLd = jsonLdScripts.length > 0;
  const schemaTypes = [];
  let hasValidJson = true;
  jsonLdScripts.each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed["@type"]) {
          schemaTypes.push(parsed["@type"]);
        }
      }
    } catch {
      hasValidJson = false;
    }
  });
  const data = {
    ga4: { detected: hasGa4, measurementId: ga4MeasurementId },
    gtm: { detected: hasGtm, containerId: gtmContainerId, hasNoscript: hasGtmNoscript },
    gsc: { verified: hasGscVerification, verificationCode: gscMeta },
    bing: { verified: hasBingVerification, verificationCode: bingMeta },
    schemaOrg: { detected: hasJsonLd || hasMicrodata, types: schemaTypes, hasValidJson },
    sitemap: { inRobotsTxt: false }
    // Set later if we check robots.txt
  };
  if (!hasGa4 && !hasGtm) {
    issues.push({
      code: "GA4_MISSING",
      severity: "warning",
      category: "on-page",
      title: "Google Analytics 4 not detected",
      description: "No GA4 tracking code found. GA4 is essential for measuring organic traffic and conversions.",
      impact: "Cannot measure SEO impact without analytics tracking.",
      howToFix: "Add GA4 tracking code to your site. Get your measurement ID from analytics.google.com.",
      affectedUrls: [url]
    });
  }
  if (!hasGscVerification) {
    issues.push({
      code: "GSC_VERIFICATION_MISSING",
      severity: "warning",
      category: "on-page",
      title: "Google Search Console verification not found",
      description: "No GSC verification meta tag detected. GSC provides essential data about your search performance.",
      impact: "Missing critical insights into Google search visibility, impressions, and clicks.",
      howToFix: "Add your GSC verification meta tag to the <head> section. Get it from search.google.com/search-console.",
      affectedUrls: [url]
    });
  }
  if (!hasBingVerification) {
    issues.push({
      code: "BING_VERIFICATION_MISSING",
      severity: "notice",
      category: "on-page",
      title: "Bing Webmaster Tools verification not found",
      description: "No Bing verification meta tag detected. Bing/Yahoo account for 5-8% of search traffic.",
      impact: "Missing insights on Bing/Yahoo search traffic.",
      howToFix: "Add Bing Webmaster Tools verification for insights on Bing/Yahoo traffic. Get it from bing.com/webmasters.",
      affectedUrls: [url]
    });
  }
  if (!hasGtm) {
    issues.push({
      code: "GTM_MISSING",
      severity: "notice",
      category: "on-page",
      title: "Google Tag Manager not detected",
      description: "GTM not found. While not required, GTM makes it easier to manage tracking tags without code changes.",
      impact: "Tag management requires developer involvement for each change.",
      howToFix: "Consider using GTM for easier tag management. It allows marketing to add tags without developer help.",
      affectedUrls: [url]
    });
  } else if (!hasGtmNoscript) {
    issues.push({
      code: "GTM_NOSCRIPT_MISSING",
      severity: "notice",
      category: "on-page",
      title: "GTM noscript fallback missing",
      description: "GTM is installed but the noscript fallback is missing. This is needed for users with JavaScript disabled.",
      impact: "Users with JS disabled won't be tracked.",
      howToFix: "Add the GTM noscript tag immediately after the opening <body> tag.",
      affectedUrls: [url]
    });
  }
  if (!hasJsonLd && !hasMicrodata) {
    issues.push({
      code: "SCHEMA_ORG_MISSING",
      severity: "warning",
      category: "structured-data",
      title: "No structured data found",
      description: "No Schema.org structured data detected. Structured data helps search engines understand your content and can enable rich snippets.",
      impact: "Missing opportunity for rich results in search (stars, images, FAQs, etc.).",
      howToFix: "Add JSON-LD structured data for your content type (Organization, Product, Article, etc.).",
      affectedUrls: [url]
    });
  } else if (hasJsonLd && !hasValidJson) {
    issues.push({
      code: "SCHEMA_ORG_INVALID",
      severity: "error",
      category: "structured-data",
      title: "Invalid JSON-LD structured data",
      description: "One or more JSON-LD scripts contain invalid JSON. This will prevent search engines from parsing your structured data.",
      impact: "Structured data is being ignored due to syntax errors.",
      howToFix: "Fix the JSON syntax errors in your structured data. Use the Rich Results Test to validate.",
      affectedUrls: [url]
    });
  }
  return { issues, data };
}

// src/audit/engine.ts
async function runFullAudit(options) {
  const { url, checkBrokenLinks = false, checkHreflangUrls = false, checkCanonicalChain = false, cruxApiKey, checksLimit = 280 } = options;
  const allIssues = [];
  const pages = [];
  const tier = checksLimit <= 50 ? "free" : checksLimit <= 100 ? "registered" : "paid";
  const runPremiumChecks = tier === "paid";
  const runExtendedChecks = tier !== "free";
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;
  console.log(`
\u{1F50D} Running comprehensive SEO audit on ${url}...
`);
  console.log("\u{1F4CB} Phase 1: Crawlability checks + page fetch (parallel)...");
  const [crawlabilityResult, fetchResult] = await Promise.all([
    runCrawlabilityChecks(url).catch((err) => {
      console.error("Crawlability check failed:", err);
      return [];
    }),
    httpGet(url, {
      timeout: 3e4,
      validateStatus: () => true
    }).catch((err) => {
      return { error: err, data: "", headers: {} };
    })
  ]);
  allIssues.push(...crawlabilityResult);
  if ("error" in fetchResult) {
    allIssues.push({
      code: "FETCH_ERROR",
      severity: "error",
      category: "crawlability",
      title: "Failed to fetch page",
      description: `Could not fetch the page: ${fetchResult.error instanceof Error ? fetchResult.error.message : "Unknown error"}`,
      impact: "Cannot perform full audit without page content.",
      howToFix: "Ensure the URL is accessible and the server is responding.",
      affectedUrls: [url]
    });
    return createReport(url, domain, allIssues, pages);
  }
  const html = fetchResult.data;
  const headers = fetchResult.headers;
  console.log(`\u{1F4DD} Phase 2: Running synchronous HTML checks (tier: ${tier}, limit: ${checksLimit})...`);
  const onPageResult = analyzeOnPage(html, url);
  const structuredDataResult = analyzeStructuredData(html, url);
  const mobileResult = analyzeMobile(html, url);
  const mobileResourceIssues = checkMobileResources(html, url);
  const socialResult = analyzeSocialMeta(html, url);
  const soft404Result = detectSoft404(html, url, 200);
  const serpResult = analyzeSERPPreview(html, url);
  const domResult = analyzeDOMStructure(html, url);
  const techResult = detectTechnologies(html, url, headers);
  const keywordResult = analyzeKeywords(html, url);
  const paginationResult = analyzePagination(html, url, onPageResult.data.canonical);
  const urlSafetyResult = analyzeUrlSafety(url);
  const domSizeResult = analyzeDomSize(html, url);
  const imageDimensionsResult = analyzeImageDimensions(html, url);
  const trackingResult = analyzeTrackingVerification(html, url);
  const anchorResult = runExtendedChecks ? analyzeAnchorText(html, url) : { issues: [], data: {} };
  const localSeoResult = runExtendedChecks ? analyzeLocalSEO(html, url) : { issues: [], data: {} };
  const modernImageResult = runExtendedChecks ? analyzeModernImages(html, url) : { issues: [], data: {} };
  const resourceHintResult = runExtendedChecks ? analyzeResourceHints(html, url) : { issues: [], data: {} };
  const trackerResult = runExtendedChecks ? analyzeTrackerBloat(html, url) : { issues: [], data: {} };
  const csrResult = runExtendedChecks ? analyzeClientRendering(html, url) : { issues: [], data: {} };
  const responsiveImgResult = runExtendedChecks ? analyzeResponsiveImages(html, url) : { issues: [], data: {} };
  const colorContrastResult = runExtendedChecks ? analyzeColorContrast(html, url) : { issues: [], data: {} };
  const pageResourcesResult = runExtendedChecks ? analyzePageResources(html, url) : { issues: [], data: {} };
  const snippetResult = runPremiumChecks ? analyzeFeaturedSnippet(html, url) : { issues: [], data: {} };
  const linkGraphResult = runPremiumChecks ? analyzeInternalLinkGraph(html, url) : { issues: [], data: {} };
  const eeatResult = runPremiumChecks ? analyzeEEATSignals(html, url) : { issues: [], data: {} };
  const contentScienceResult = runPremiumChecks ? analyzeContentScience(html, url) : { issues: [], data: {} };
  const cannibalizationResult = runPremiumChecks ? analyzeKeywordCannibalizationSinglePage(html, url) : { issues: [], data: {} };
  const conversionResult = runPremiumChecks ? analyzeConversionElements(html, url) : { issues: [], data: {} };
  const keywordPlacementResult = runPremiumChecks ? analyzeKeywordPlacement(html, url) : { issues: [], data: {} };
  const clusterResult = runPremiumChecks ? analyzeTopicalClusters(html, url) : { issues: [], data: {} };
  const platformResult = runPremiumChecks ? analyzePlatformPresence(html, url) : { issues: [], data: {} };
  const toolResult = runPremiumChecks ? analyzeInteractiveTools(html, url) : { issues: [], data: {} };
  const funnelResult = runPremiumChecks ? analyzeFunnelIntent(html, url) : { issues: [], data: {} };
  const navboostResult = runPremiumChecks ? analyzeNavBoostSignals(html, url) : { issues: [], data: {} };
  const entityResult = runPremiumChecks ? analyzeEntitySEO(html, url) : { issues: [], data: {} };
  const qdfFreshnessResult = runPremiumChecks ? analyzeFreshnessSignals(html, url) : { issues: [], data: {} };
  const aiContentStructureResult = runPremiumChecks ? analyzeAIContentStructure(html, url) : { issues: [], data: {} };
  const citationQualityResult = runPremiumChecks ? analyzeCitationQuality(html, url) : { issues: [], data: {} };
  const answerConcisenessResult = runPremiumChecks ? analyzeAnswerConciseness(html, url) : { issues: [], data: {} };
  const brandMentionResult = runPremiumChecks ? analyzeBrandMentionOptimization(html, url) : { issues: [], data: {} };
  const citationWorthinessResult = runPremiumChecks ? analyzeAICitationWorthiness(html, url) : { issues: [], data: {} };
  const reviewEcosystemResult = runPremiumChecks ? analyzeReviewEcosystem(html, url) : { issues: [], data: {} };
  allIssues.push(
    ...onPageResult.issues,
    ...structuredDataResult.issues,
    ...mobileResult.issues,
    ...mobileResourceIssues,
    ...socialResult.issues,
    ...soft404Result.issues,
    ...anchorResult.issues,
    ...serpResult.issues,
    ...localSeoResult.issues,
    ...domResult.issues,
    ...modernImageResult.issues,
    ...techResult.issues,
    ...keywordResult.issues,
    ...snippetResult.issues,
    ...linkGraphResult.issues,
    ...resourceHintResult.issues,
    ...eeatResult.issues,
    ...contentScienceResult.issues,
    ...cannibalizationResult.issues,
    ...trackerResult.issues,
    ...csrResult.issues,
    ...responsiveImgResult.issues,
    ...conversionResult.issues,
    ...keywordPlacementResult.issues,
    ...clusterResult.issues,
    ...platformResult.issues,
    ...toolResult.issues,
    ...funnelResult.issues,
    ...navboostResult.issues,
    ...entityResult.issues,
    ...qdfFreshnessResult.issues,
    ...aiContentStructureResult.issues,
    ...citationQualityResult.issues,
    ...answerConcisenessResult.issues,
    ...brandMentionResult.issues,
    ...citationWorthinessResult.issues,
    ...reviewEcosystemResult.issues,
    ...domSizeResult.issues,
    ...imageDimensionsResult.issues,
    ...colorContrastResult.issues,
    ...pageResourcesResult.issues,
    ...urlSafetyResult.issues,
    ...paginationResult.issues,
    ...trackingResult.issues
  );
  if (!structuredDataResult.data.hasSchema) {
    const suggestions = suggestSchemaTypes(html, url);
    if (suggestions.length > 0 && structuredDataResult.issues.length > 0) {
      const lastSchemaIssue = structuredDataResult.issues[structuredDataResult.issues.length - 1];
      lastSchemaIssue.details = {
        ...lastSchemaIssue.details,
        suggestedTypes: suggestions
      };
    }
  }
  console.log("\u{1F517} Phase 3: Running async checks (parallel)...");
  const safeAsync = async (name, fn, timeoutMs = 1e4) => {
    try {
      const resultPromise = fn();
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error(`${name} timed out`)), timeoutMs)
      );
      const result = await Promise.race([resultPromise, timeoutPromise]);
      return result.issues;
    } catch (err) {
      console.error(`${name} failed:`, err);
      return [];
    }
  };
  const safeAsyncIssues = async (name, fn, timeoutMs = 1e4) => {
    try {
      const resultPromise = fn();
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error(`${name} timed out`)), timeoutMs)
      );
      return await Promise.race([resultPromise, timeoutPromise]);
    } catch (err) {
      console.error(`${name} failed:`, err);
      return [];
    }
  };
  let perfData = { loadTime: 0 };
  const performancePromise = analyzePerformance(url).then((result) => {
    perfData = result.data;
    return result.issues;
  }).catch((err) => {
    console.error("Performance check failed:", err);
    return [];
  });
  const asyncChecks = [];
  asyncChecks.push(safeAsync("Links", () => analyzeLinks(html, url, checkBrokenLinks)));
  asyncChecks.push(safeAsync("Images", () => analyzeImages(html, url, checkBrokenLinks)));
  asyncChecks.push(performancePromise);
  asyncChecks.push(safeAsync("Security", () => analyzeSecurity(html, url, headers)));
  asyncChecks.push(safeAsyncIssues("Certificate", async () => (await checkCertificate(url)).issues));
  asyncChecks.push(safeAsync("Redirects", () => analyzeRedirects(url)));
  asyncChecks.push(safeAsync("Robots Validation", () => validateRobotsTxt(url)));
  asyncChecks.push(safeAsync("Canonical Domain", () => analyzeCanonicalDomain(url)));
  if (runExtendedChecks) {
    asyncChecks.push(safeAsync("Hreflang", () => analyzeHreflang(html, url, { validateUrls: checkHreflangUrls })));
    asyncChecks.push(safeAsync("Canonical Advanced", () => analyzeCanonicalAdvanced(html, url, { checkChain: checkCanonicalChain })));
    asyncChecks.push(safeAsync("Security Headers", () => analyzeSecurityHeaders(url)));
    asyncChecks.push(safeAsync("Caching Headers", () => analyzeCachingHeaders(url, headers)));
    asyncChecks.push(safeAsync("HTML Compliance", () => analyzeHtmlCompliance(html, url, headers)));
    asyncChecks.push(safeAsync("Redirect Chain", () => analyzeRedirectChain(url)));
    asyncChecks.push(safeAsync("Asset Minification", () => analyzeAssetMinification(html, url)));
    asyncChecks.push(safeAsync("Responsive CSS", () => analyzeResponsiveCss(html, url)));
    asyncChecks.push(safeAsync("Directory Listing", () => analyzeDirectoryListing(url)));
  }
  if (runPremiumChecks) {
    asyncChecks.push(safeAsync("AI Readiness", () => runAIReadinessChecks(url, html)));
    asyncChecks.push(safeAsync("Content Freshness", () => analyzeContentFreshness(url, html)));
    asyncChecks.push(safeAsync("Additional Checks", () => runAdditionalChecks(url, html)));
    asyncChecks.push(safeAsync("IndexNow", () => analyzeIndexNow(html, url, headers)));
    asyncChecks.push(safeAsync("Site Maturity", () => analyzeSiteMaturity(html, url)));
    asyncChecks.push(safeAsync("Bing Optimization", () => analyzeBingOptimization(html, url)));
    asyncChecks.push(safeAsync("LLMs.txt", () => analyzeLlmsTxt(url)));
    if (cruxApiKey) {
      asyncChecks.push(safeAsyncIssues("Core Web Vitals", async () => {
        const cwv = await fetchCoreWebVitals(url, cruxApiKey);
        const issues = [];
        if (cwv) {
          if (cwv.lcp?.rating === "poor") {
            issues.push({
              code: "LCP_POOR",
              severity: "error",
              category: "performance",
              title: "Poor Largest Contentful Paint (LCP)",
              description: `LCP is ${cwv.lcp.value}ms (should be under 2500ms)`,
              impact: "Direct Core Web Vitals ranking factor.",
              howToFix: "Optimize hero images, preload critical resources, improve server response time.",
              affectedUrls: [url],
              details: { lcp: cwv.lcp }
            });
          }
          if (cwv.cls?.rating === "poor") {
            issues.push({
              code: "CLS_POOR",
              severity: "error",
              category: "performance",
              title: "Poor Cumulative Layout Shift (CLS)",
              description: `CLS is ${cwv.cls.value} (should be under 0.1)`,
              impact: "Direct Core Web Vitals ranking factor.",
              howToFix: "Set image dimensions, avoid inserting content above existing content.",
              affectedUrls: [url],
              details: { cls: cwv.cls }
            });
          }
        }
        return issues;
      }));
    }
  }
  const asyncResults = await Promise.all(asyncChecks);
  for (const issues of asyncResults) {
    allIssues.push(...issues);
  }
  pages.push({
    url,
    statusCode: 200,
    title: onPageResult.data.title,
    description: onPageResult.data.description,
    canonical: onPageResult.data.canonical,
    h1: onPageResult.data.h1s,
    wordCount: onPageResult.data.wordCount,
    loadTime: perfData.loadTime,
    issues: allIssues.map((i) => i.code)
  });
  console.log("\n\u2705 Audit complete!\n");
  return createReport(url, domain, allIssues, pages);
}
function createReport(url, domain, issues, pages) {
  const healthScore = calculateHealthScore(issues);
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const notices = issues.filter((i) => i.severity === "notice").length;
  const totalPossibleChecks = 310;
  const passed = Math.max(0, totalPossibleChecks - errors - warnings);
  return {
    url,
    domain,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    crawlStats: {
      totalUrls: 1,
      crawledUrls: 1,
      errorUrls: 0,
      redirectUrls: 0,
      blockedUrls: 0
    },
    healthScore,
    issues,
    pages,
    summary: {
      errors,
      warnings,
      notices,
      passed
    }
  };
}
function calculateHealthScore(issues) {
  const weights = { error: 10, warning: 3, notice: 1 };
  const categoryDeductions = {
    crawlability: 0,
    indexability: 0,
    "on-page": 0,
    content: 0,
    links: 0,
    images: 0,
    "structured-data": 0,
    performance: 0,
    security: 0,
    mobile: 0,
    international: 0,
    "ai-readiness": 0,
    "social": 0,
    "local-seo": 0,
    "accessibility": 0
  };
  for (const issue of issues) {
    const deduction = weights[issue.severity];
    categoryDeductions[issue.category] = (categoryDeductions[issue.category] || 0) + deduction;
  }
  const crawlability = Math.max(0, 100 - categoryDeductions.crawlability * 5);
  const indexability = Math.max(0, 100 - categoryDeductions.indexability * 5);
  const onPage = Math.max(0, 100 - categoryDeductions["on-page"] * 3);
  const content = Math.max(0, 100 - categoryDeductions.content * 3);
  const links = Math.max(0, 100 - categoryDeductions.links * 3);
  const performance = Math.max(0, 100 - categoryDeductions.performance * 4);
  const security = Math.max(0, 100 - categoryDeductions.security * 5);
  const aiReadiness = Math.max(0, 100 - categoryDeductions["ai-readiness"] * 3);
  const social = Math.max(0, 100 - categoryDeductions.social * 2);
  const localSeo = Math.max(0, 100 - categoryDeductions["local-seo"] * 2);
  const accessibility = Math.max(0, 100 - categoryDeductions.accessibility * 4);
  const overall = Math.round(
    crawlability * 0.11 + indexability * 0.11 + onPage * 0.16 + content * 0.07 + links * 0.07 + performance * 0.11 + security * 0.11 + aiReadiness * 0.06 + social * 0.05 + localSeo * 0.05 + accessibility * 0.1
  );
  return {
    overall,
    crawlability,
    indexability,
    onPage,
    content,
    links,
    performance,
    security,
    aiReadiness,
    social,
    localSeo,
    accessibility
  };
}
function formatReport(report) {
  const lines = [];
  lines.push("");
  lines.push("\u2550".repeat(70));
  lines.push("  SEO AUDIT REPORT");
  lines.push("\u2550".repeat(70));
  lines.push(`  URL: ${report.url}`);
  lines.push(`  Domain: ${report.domain}`);
  lines.push(`  Time: ${report.timestamp}`);
  lines.push("\u2550".repeat(70));
  lines.push("");
  lines.push("\u{1F4CA} HEALTH SCORE");
  lines.push("\u2500".repeat(70));
  lines.push(`  Overall: ${report.healthScore.overall}/100 ${getScoreEmoji(report.healthScore.overall)}`);
  lines.push("");
  lines.push("  Category Scores:");
  lines.push(`    Crawlability:  ${report.healthScore.crawlability}/100`);
  lines.push(`    Indexability:  ${report.healthScore.indexability}/100`);
  lines.push(`    On-Page SEO:   ${report.healthScore.onPage}/100`);
  lines.push(`    Content:       ${report.healthScore.content}/100`);
  lines.push(`    Links:         ${report.healthScore.links}/100`);
  lines.push(`    Performance:   ${report.healthScore.performance}/100`);
  lines.push(`    Security:      ${report.healthScore.security}/100`);
  lines.push(`    AI Readiness:  ${report.healthScore.aiReadiness}/100`);
  lines.push(`    Social:        ${report.healthScore.social}/100`);
  lines.push(`    Local SEO:     ${report.healthScore.localSeo}/100`);
  lines.push(`    Accessibility: ${report.healthScore.accessibility}/100`);
  lines.push("");
  lines.push("\u{1F4CB} SUMMARY");
  lines.push("\u2500".repeat(70));
  lines.push(`  \u274C Errors:   ${report.summary.errors}`);
  lines.push(`  \u26A0\uFE0F  Warnings: ${report.summary.warnings}`);
  lines.push(`  \u2139\uFE0F  Notices:  ${report.summary.notices}`);
  lines.push(`  \u2705 Passed:   ${report.summary.passed}`);
  lines.push("");
  const issuesByCategory = groupIssuesByCategory(report.issues);
  for (const [category, issues] of Object.entries(issuesByCategory)) {
    if (issues.length === 0)
      continue;
    lines.push(`\u{1F4C1} ${category.toUpperCase()}`);
    lines.push("\u2500".repeat(70));
    for (const issue of issues) {
      const icon = issue.severity === "error" ? "\u274C" : issue.severity === "warning" ? "\u26A0\uFE0F" : "\u2139\uFE0F";
      lines.push(`  ${icon} ${issue.title}`);
      lines.push(`     ${issue.description}`);
      if (issue.howToFix) {
        lines.push(`     \u2192 ${issue.howToFix}`);
      }
      lines.push("");
    }
  }
  lines.push("\u2550".repeat(70));
  return lines.join("\n");
}
function getScoreEmoji(score) {
  if (score >= 90)
    return "\u{1F7E2} Excellent";
  if (score >= 70)
    return "\u{1F7E1} Good";
  if (score >= 50)
    return "\u{1F7E0} Needs Work";
  return "\u{1F534} Poor";
}
function groupIssuesByCategory(issues) {
  const grouped = {};
  for (const issue of issues) {
    if (!grouped[issue.category]) {
      grouped[issue.category] = [];
    }
    grouped[issue.category].push(issue);
  }
  for (const category of Object.keys(grouped)) {
    grouped[category].sort((a, b) => {
      const order = { error: 0, warning: 1, notice: 2 };
      return order[a.severity] - order[b.severity];
    });
  }
  return grouped;
}

// src/audit/discovery/link-crawler.ts
var HIGH_PRIORITY_PATTERNS = [
  /^\/(pricing|about|features|contact|demo|signup|login|blog)\/?$/i,
  /^\/(products?|services?|solutions?|plans?)\/?$/i,
  /^\/(docs?|documentation|help|support|faq)\/?$/i,
  /^\/(careers?|jobs?|team|company)\/?$/i
];
var MEDIUM_PRIORITY_PATTERNS = [
  /^\/(privacy|terms|legal|security)\/?$/i,
  /^\/[a-z0-9-]+\/?$/i
  // Top-level pages
];
var EXCLUDE_PATTERNS = [
  /\.(png|jpg|jpeg|gif|svg|webp|ico|pdf|zip|tar|gz)$/i,
  // Files
  /^(mailto:|tel:|javascript:|#)/i,
  // Non-HTTP
  /\/(api|_next|static|assets|cdn)\//i,
  // Technical paths
  /[?&](utm_|ref=|source=)/i
  // Tracking params
];
function extractLinks2(html, baseUrl) {
  const base = new URL(baseUrl);
  const links = /* @__PURE__ */ new Set();
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    try {
      const href = match[1];
      if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(href))) {
        continue;
      }
      let url;
      if (href.startsWith("http://") || href.startsWith("https://")) {
        url = new URL(href);
      } else if (href.startsWith("/")) {
        url = new URL(href, base);
      } else {
        continue;
      }
      if (url.hostname !== base.hostname) {
        continue;
      }
      const normalized = normalizeUrl3(url);
      if (normalized) {
        links.add(normalized);
      }
    } catch {
    }
  }
  return Array.from(links);
}
function normalizeUrl3(url) {
  url.hash = "";
  const paramsToRemove = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "source"];
  for (const param of paramsToRemove) {
    url.searchParams.delete(param);
  }
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  if (pathname === "" || pathname === "/") {
    return null;
  }
  return `${url.protocol}//${url.hostname}${pathname}${url.search}`;
}
function calculatePriority(url) {
  try {
    const pathname = new URL(url).pathname;
    for (const pattern of HIGH_PRIORITY_PATTERNS) {
      if (pattern.test(pathname)) {
        return 9;
      }
    }
    for (const pattern of MEDIUM_PRIORITY_PATTERNS) {
      if (pattern.test(pathname)) {
        return 6;
      }
    }
    const depth = (pathname.match(/\//g) || []).length;
    if (depth >= 3) {
      return 2;
    }
    if (depth === 2) {
      return 4;
    }
    return 5;
  } catch {
    return 1;
  }
}
function discoverPagesFromLinks(baseUrl, html, maxPages = 5) {
  const links = extractLinks2(html, baseUrl);
  const pages = links.map((url) => ({
    url,
    source: "internal-link",
    priority: calculatePriority(url)
  }));
  pages.sort((a, b) => b.priority - a.priority);
  return pages.slice(0, maxPages);
}
function parseSitemap(xml, baseUrl) {
  const pages = [];
  const base = new URL(baseUrl);
  const locRegex = /<loc>([^<]+)<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    try {
      const url = new URL(match[1]);
      if (url.hostname !== base.hostname) {
        continue;
      }
      if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
        continue;
      }
      pages.push({
        url: url.href,
        source: "sitemap",
        priority: calculatePriority(url.href)
      });
    } catch {
    }
  }
  return pages;
}
function mergePages(...pageSets) {
  const seen = /* @__PURE__ */ new Map();
  for (const pages of pageSets) {
    for (const page of pages) {
      const existing = seen.get(page.url);
      if (!existing || page.priority > existing.priority) {
        seen.set(page.url, page);
      }
    }
  }
  return Array.from(seen.values()).sort((a, b) => b.priority - a.priority);
}

// src/audit/discovery/repo-routes.ts
function detectFramework2(packageJson, files) {
  if (!packageJson)
    return "unknown";
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (deps["next"]) {
    return "nextjs";
  }
  if (deps["astro"]) {
    return "astro";
  }
  if (deps["@sveltejs/kit"]) {
    return "sveltekit";
  }
  if (deps["vue-router"] || deps["@vue/router"]) {
    return "vue";
  }
  if (deps["react"] && deps["vite"]) {
    return "react-vite";
  }
  if (deps["react"] || deps["react-dom"]) {
    const hasRouterFile = files.some(
      (f) => f.match(/routes?\.(tsx?|jsx?)$/) || f.includes("router") || f.endsWith("App.tsx") || f.endsWith("App.jsx")
    );
    if (hasRouterFile) {
      return "react";
    }
  }
  return "unknown";
}
async function discoverRoutesFromRepo(files, framework, fetchFile) {
  switch (framework) {
    case "nextjs":
      return discoverNextRoutes(files);
    case "astro":
      return discoverAstroRoutes(files);
    case "react":
    case "react-vite":
      return discoverReactRouterRoutes(files, fetchFile);
    case "vue":
      return discoverVueRouterRoutes(files, fetchFile);
    case "sveltekit":
      return discoverSvelteRoutes(files);
    default:
      return [];
  }
}
function discoverNextRoutes(files) {
  const routes = [];
  for (const file of files) {
    const appMatch = file.match(/^app\/(.*)\/page\.(tsx?|jsx?)$/);
    if (appMatch) {
      let path = "/" + appMatch[1];
      path = path.replace(/\/\([^)]+\)/g, "");
      if (path === "/")
        path = "/";
      const isDynamic = path.includes("[");
      routes.push({
        path,
        type: isDynamic ? "dynamic" : "static",
        sourceFile: file
      });
      continue;
    }
    if (file.match(/^app\/page\.(tsx?|jsx?)$/)) {
      routes.push({
        path: "/",
        type: "static",
        sourceFile: file
      });
      continue;
    }
    const pagesMatch = file.match(/^pages\/(.+)\.(tsx?|jsx?)$/);
    if (pagesMatch) {
      const pagePath = pagesMatch[1];
      if (pagePath.startsWith("_") || pagePath.startsWith("api/")) {
        continue;
      }
      let path = "/" + pagePath;
      path = path.replace(/\/index$/, "");
      if (path === "")
        path = "/";
      const isDynamic = path.includes("[");
      routes.push({
        path,
        type: isDynamic ? "dynamic" : "static",
        sourceFile: file
      });
    }
  }
  const seen = /* @__PURE__ */ new Map();
  for (const route of routes) {
    if (!seen.has(route.path)) {
      seen.set(route.path, route);
    }
  }
  return Array.from(seen.values());
}
function discoverAstroRoutes(files) {
  const routes = [];
  for (const file of files) {
    const match = file.match(/^src\/pages\/(.+)\.(astro|md|mdx)$/);
    if (match) {
      let path = "/" + match[1];
      path = path.replace(/\/index$/, "");
      if (path === "")
        path = "/";
      const isDynamic = path.includes("[");
      routes.push({
        path,
        type: isDynamic ? "dynamic" : "static",
        sourceFile: file
      });
    }
  }
  return routes;
}
function discoverSvelteRoutes(files) {
  const routes = [];
  for (const file of files) {
    const match = file.match(/^src\/routes\/(.*)\/?\+page\.svelte$/);
    if (match) {
      let path = "/" + (match[1] || "");
      path = path.replace(/\/\([^)]+\)/g, "");
      path = path.replace(/\/+/g, "/");
      if (path === "")
        path = "/";
      const isDynamic = path.includes("[");
      routes.push({
        path,
        type: isDynamic ? "dynamic" : "static",
        sourceFile: file
      });
    }
  }
  return routes;
}
async function discoverReactRouterRoutes(files, fetchFile) {
  const routerFiles = files.filter(
    (f) => f.match(/routes?\.(tsx?|jsx?)$/) || f.includes("router") || f.endsWith("App.tsx") || f.endsWith("App.jsx") || f.includes("Router")
  );
  const routes = [];
  for (const file of routerFiles) {
    const content = await fetchFile(file);
    if (!content)
      continue;
    const patterns = [
      /<Route[^>]*\spath=["']([^"']+)["']/g,
      /{\s*path:\s*["']([^"']+)["']/g,
      /createBrowserRouter\([^)]*path:\s*["']([^"']+)["']/g
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const path = match[1];
        if (path === "*" || path.includes("*"))
          continue;
        routes.push({
          path,
          type: path.includes(":") ? "dynamic" : "static",
          sourceFile: file
        });
      }
    }
  }
  const seen = /* @__PURE__ */ new Set();
  return routes.filter((r) => {
    if (seen.has(r.path))
      return false;
    seen.add(r.path);
    return true;
  });
}
async function discoverVueRouterRoutes(files, fetchFile) {
  const routerFiles = files.filter(
    (f) => f.match(/router\/index\.(ts|js)$/) || f.match(/router\.(ts|js)$/) || f.includes("routes")
  );
  const routes = [];
  for (const file of routerFiles) {
    const content = await fetchFile(file);
    if (!content)
      continue;
    const pathRegex = /path:\s*["']([^"']+)["']/g;
    let match;
    while ((match = pathRegex.exec(content)) !== null) {
      const path = match[1];
      if (path.includes("*") || path === "/:pathMatch(.*)")
        continue;
      routes.push({
        path,
        type: path.includes(":") ? "dynamic" : "static",
        sourceFile: file
      });
    }
  }
  const seen = /* @__PURE__ */ new Set();
  return routes.filter((r) => {
    if (seen.has(r.path))
      return false;
    seen.add(r.path);
    return true;
  });
}
function routesToUrls(routes, baseUrl, maxUrls = 5) {
  const base = new URL(baseUrl);
  return routes.filter((r) => r.type === "static").slice(0, maxUrls).map((r) => {
    const url = new URL(r.path, base);
    return url.href;
  });
}
export {
  ISSUE_DEFINITIONS,
  analyzeAnchorText,
  analyzeCanonicalAdvanced,
  analyzeClientRendering,
  analyzeContentFreshness,
  analyzeConversionElements,
  analyzeDOMStructure,
  analyzeEntitySEO,
  analyzeFreshnessSignals,
  analyzeFunnelIntent,
  analyzeHreflang,
  analyzeImages,
  analyzeInteractiveTools,
  analyzeKeywordPlacement,
  analyzeKeywords,
  analyzeLinks,
  analyzeLocalSEO,
  analyzeMobile,
  analyzeModernImages,
  analyzeNavBoostSignals,
  analyzeOnPage,
  analyzePagination,
  analyzePerformance,
  analyzePlatformPresence,
  analyzeRedirectChain,
  analyzeRedirects,
  analyzeResponsiveImages,
  analyzeSERPPreview,
  analyzeSecurity,
  analyzeSecurityHeaders,
  analyzeSocialMeta,
  analyzeStructuredData,
  analyzeTopicalClusters,
  analyzeTrackerBloat,
  analyzeUrlSafety,
  checkAIBotBlocking,
  checkCertificate,
  checkLlmsTxt,
  checkMobileResources,
  checkRedirects,
  checkRobotsTxt,
  checkSitemap,
  detectFramework2 as detectFramework,
  detectSoft404,
  detectTechnologies,
  discoverPagesFromLinks,
  discoverRoutesFromRepo,
  formatReport,
  mergePages,
  parseSitemap,
  routesToUrls,
  runAIReadinessChecks,
  runCrawlabilityChecks,
  runFullAudit,
  suggestSchemaTypes,
  urlSafetyDatabase
};
