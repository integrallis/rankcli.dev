// The free tools: one indexed page per question a developer searches, each running the same
// free audit and showing the findings that answer that question. What established SEO tools
// do (Ahrefs 18 pages, SE Ranking about 30, Seobility 9), with the checks only RankCLI has.
export interface FreeTool {
  slug: string;
  /** Page name, used in <title> and the tools index. */
  name: string;
  h1: string;
  description: string;
  intro: string;
  /** Finding codes (exact) or prefixes (ending with *) this page shows. */
  codes: string[];
  /** Categories shown too, as the audit labels them. */
  categories?: string[];
  /** The crawler-access table leads the result. */
  crawlerTable?: boolean;
  faq: { q: string; a: string }[];
}

export const FREE_TOOLS: FreeTool[] = [
  {
    slug: 'ai-crawler-access',
    name: 'AI crawler access checker',
    h1: 'Can ChatGPT, Claude and Perplexity read your site?',
    description: 'Fetches a page as Googlebot, OAI-SearchBot, Claude-SearchBot, PerplexityBot, the user-triggered fetchers and the training crawlers, and reports which get in, by name. Free, no sign-up.',
    intro: 'robots.txt is not the whole story: a CDN or WAF rule can answer 403 to a crawler while a browser gets the page. This check fetches the page as each crawler and reports what each received, by bot class, the way OpenAI and Anthropic document them.',
    codes: ['SEARCH_CRAWLER_BLOCKED_AT_EDGE', 'AI_SEARCH_CRAWLER_BLOCKED_AT_EDGE', 'AI_USER_FETCH_BLOCKED_AT_EDGE', 'AI_TRAINING_CRAWLER_BLOCKED_AT_EDGE', 'AI_SEARCH_BOTS_DISALLOWED', 'AI_USER_FETCH_DISALLOWED', 'AI_TRAINING_BOTS_DISALLOWED', 'CLOUDFLARE_AI_CRAWLER_GATE_AMBIGUOUS', 'ROBOTS_*'],
    crawlerTable: true,
    faq: [
      { q: 'Which crawlers does it fetch as?', a: 'Googlebot and bingbot (search); OAI-SearchBot, Claude-SearchBot and PerplexityBot (AI search); ChatGPT-User, Claude-User and Perplexity-User (user-triggered fetchers); GPTBot, ClaudeBot and CCBot (training). Each class is reported separately because blocking each costs something different.' },
      { q: 'What does blocking a training crawler cost?', a: 'Nothing a user sees. OpenAI documents GPTBot as training-only and OAI-SearchBot as the crawler whose opt-out removes a site from ChatGPT search answers; Anthropic documents the same split. Disallowing the training crawlers is a policy choice, and the check reports it as one.' },
      { q: 'Why did a crawler get a 403 when robots.txt allows it?', a: 'Bot protection at the edge. Cloudflare blocks AI crawlers by default on new zones, and many WAF rules challenge anything that is not a browser. The fix is a rule for the crawlers you want, not a robots.txt line.' },
    ],
  },
  {
    slug: 'robots-txt-ai-crawlers',
    name: 'robots.txt AI crawler checker',
    h1: 'What does your robots.txt tell the AI crawlers?',
    description: 'Reads a site\'s robots.txt the way each crawler does and reports which AI search crawlers, user-triggered fetchers and training crawlers are disallowed, and what each costs. Free, no sign-up.',
    intro: 'A robots.txt group for "*" with Disallow: / blocks every crawler that has no group of its own, including OAI-SearchBot and Claude-SearchBot. This check parses the file as each bot does and names the crawlers that are disallowed, by class.',
    codes: ['ROBOTS_*', 'AI_SEARCH_BOTS_DISALLOWED', 'AI_USER_FETCH_DISALLOWED', 'AI_TRAINING_BOTS_DISALLOWED', 'SITEMAP_NOT_IN_ROBOTS', 'CLOUDFLARE_AI_CRAWLER_GATE_AMBIGUOUS'],
    crawlerTable: true,
    faq: [
      { q: 'Does a crawler obey robots.txt?', a: 'The search and AI search crawlers from Google, Microsoft, OpenAI, Anthropic and Perplexity document that they do. robots.txt is necessary and not sufficient: a crawler the file allows can still be refused at the edge, which the AI crawler access checker tests.' },
      { q: 'Should I disallow GPTBot?', a: 'That is a policy choice about training, not visibility: GPTBot is training-only and OAI-SearchBot is the crawler behind ChatGPT search answers. Disallow GPTBot if you do not want your content used for training; keep OAI-SearchBot allowed if you want to appear in answers.' },
      { q: 'What is the right robots.txt for AI crawlers?', a: 'One group per class: allow the search and AI search crawlers and the user-triggered fetchers; decide the training group as policy. RankCLI generates that file from the audit, and the MCP server\'s seo_generate_robots tool writes it.' },
    ],
  },
  {
    slug: 'llms-txt-checker',
    name: 'llms.txt checker',
    h1: 'Does your site have a valid llms.txt?',
    description: 'Checks whether a site publishes llms.txt and llms-full.txt, whether they are valid, and says what the evidence says the file is for. Free, no sign-up.',
    intro: 'llms.txt is a convention for coding agents reading documentation sites. No search or answer engine reads it; Google says it neither helps nor harms, and in a 137,000-domain study 97 percent of these files received no request in a month. The check reports whether yours exists and is well-formed, and frames it for what it is.',
    codes: ['LLMS_TXT_*', 'AI_NO_LLMS_TXT', 'LLMS_FULL_*'],
    faq: [
      { q: 'Does llms.txt help SEO or AI visibility?', a: 'Not by any published evidence. Half of the 400 most popular npm packages\' sites publish one, and the share tracks the tools people use to build agents, not any ranking lever. It is useful for coding agents reading your docs.' },
      { q: 'What should llms.txt contain?', a: 'An H1 with the project name, a one-paragraph summary, and sections of Markdown links to the pages an agent should read, with a line on each. llms-full.txt is the full documentation in one Markdown file.' },
      { q: 'Should a product site publish one?', a: 'If the site is documentation that agents read, yes; it costs little. A marketing site gains nothing from it. RankCLI reports a missing file as a notice framed for docs sites, never as an error.' },
    ],
  },
  {
    slug: 'sitemap-checker',
    name: 'Sitemap checker',
    h1: 'Is your sitemap doing its job?',
    description: 'Checks whether a site has a sitemap, whether robots.txt points to it, whether it answers as XML rather than an app shell, and whether every lastmod carries the same build time. Free, no sign-up.',
    intro: 'Four in ten of the 400 most popular npm packages\' sites have no sitemap, and one in eleven stamps every URL with the same date, which Google stops trusting. This check fetches the sitemap the way a crawler does and reports what it found.',
    codes: ['SITEMAP_*', 'INDEXNOW_NOT_IMPLEMENTED'],
    faq: [
      { q: 'Why does a uniform lastmod matter?', a: 'Google uses lastmod only while it proves accurate and ignores it once it does not. A sitemap whose every URL carries the build time carries no freshness signal at all.' },
      { q: 'My sitemap answers 200 but the check says it is missing.', a: 'Single-page apps often answer every path with the app shell, so /sitemap.xml returns HTML with a 200. The check reads the body, not the status.' },
      { q: 'Do I need IndexNow?', a: 'Only with a sitemap whose dates are right: Bing\'s advice is an accurate lastmod paired with IndexNow. Google does not use it. The check reports it as a notice, and only when the site has a sitemap.' },
    ],
  },
  {
    slug: 'structured-data-checker',
    name: 'Structured data checker',
    h1: 'What structured data does your page carry?',
    description: 'Finds the JSON-LD, microdata and RDFa on a page, validates the required properties per type, and reports what is missing for rich results. Free, no sign-up.',
    intro: 'Structured data is one of the few page signals both search engines and answer engines read directly. This check parses what the page declares, checks each type\'s required and recommended properties, and reports what is missing, including the Organization and WebSite blocks a site should carry once.',
    codes: ['SCHEMA_*', 'NO_*_SCHEMA', '*_SCHEMA_MISSING', 'FAQ_SCHEMA_MISSING', 'NO_MAIN_ENTITY_OF_PAGE', 'NO_SCHEMA_SAMEAS', 'NO_DATE_MODIFIED_SCHEMA', 'INVALID_JSON_LD', 'STRUCTURED_DATA_*'],
    categories: ['structured-data', 'Structured Data'],
    faq: [
      { q: 'Which type should a page use?', a: 'The one that describes it: WebSite and Organization for the site, Article or BlogPosting for a post, Product with real Offer data for a product, FAQPage only for genuine question-and-answer content. Fabricated types and offers are a manual-action risk; RankCLI\'s auto-fix writes WebSite or WebPage from the page\'s own title and description, never an Offer.' },
      { q: 'Does structured data affect the RankCLI score?', a: 'Yes, in the on-page category at a third of the weight of the on-page essentials, measured on six reference sites as 0 to 1 overall point.' },
      { q: 'Is JSON-LD better than microdata?', a: 'Google recommends JSON-LD; both are read. The check validates either.' },
    ],
  },
  {
    slug: 'security-headers-checker',
    name: 'Security headers checker',
    h1: 'Which security headers is your site missing?',
    description: 'Checks a page for Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy, and reports each one missing. Free, no sign-up.',
    intro: 'Six response headers that a standard asks for and a server can add in a line each. The check reads the response as a crawler would and reports the ones that are missing, with the value to add.',
    codes: ['CSP_MISSING', 'HSTS_MISSING', 'X_CONTENT_TYPE_OPTIONS_MISSING', 'X_FRAME_OPTIONS_MISSING', 'REFERRER_POLICY_MISSING', 'PERMISSIONS_POLICY_MISSING', 'SECURITY_*', 'HTTPS_*', 'MIXED_CONTENT*', 'DMARC_MISSING', 'SPF_MISSING'],
    categories: ['security', 'Security'],
    faq: [
      { q: 'Do security headers affect SEO?', a: 'HTTPS does directly; the rest affect trust and the browser\'s protection of your users. They sit in the audit\'s security category, which is part of the overall score.' },
      { q: 'Which one matters most?', a: 'Strict-Transport-Security on any site that serves HTTPS, and a Content-Security-Policy on any site that runs third-party scripts. The rest are one line each.' },
      { q: 'Why are DMARC and SPF here?', a: 'They are DNS records for the domain\'s mail, not response headers, but a site without them has its domain spoofable in email, and the audit reports them in the same category.' },
    ],
  },
];

export function findFreeTool(slug: string): FreeTool | undefined {
  return FREE_TOOLS.find((t) => t.slug === slug);
}

/** Does a finding belong on this tool's page? Codes match exactly or by prefix (TRAILING *). */
export function toolShowsFinding(tool: FreeTool, finding: { code: string; category?: string }): boolean {
  const code = finding.code || '';
  for (const pattern of tool.codes) {
    if (pattern.endsWith('*')) {
      const stem = pattern.slice(0, -1);
      if (stem.startsWith('*') ? code.includes(stem.slice(1)) : code.startsWith(stem)) return true;
    } else if (pattern.startsWith('*')) {
      if (code.endsWith(pattern.slice(1))) return true;
    } else if (code === pattern) return true;
  }
  if (tool.categories && finding.category && tool.categories.some((c) => c.toLowerCase() === finding.category!.toLowerCase())) return true;
  return false;
}
