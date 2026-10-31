export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  /** Set when a post is substantially revised (YYYY-MM-DD); feeds dateModified and the sitemap's lastmod. */
  updatedAt?: string;
  author: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'is-cloudflare-blocking-googlebot-on-your-site',
    title: 'Cloudflare May Be Blocking Googlebot On Your Site, And robots.txt Will Not Tell You',
    excerpt:
      'Since September 15 Cloudflare disallows AI crawlers by default on ad-supported pages. Googlebot is classed as mixed-use, so blocking AI training can block Search too. Googlebot crawl share fell from 57.20% to 27.49%. Here is how to check in one command.',
    publishedAt: '2026-09-30',
    author: 'RankCLI Team',
    readTime: 5,
    tags: ['SEO', 'Cloudflare', 'Engineering'],
    content: `
# Cloudflare May Be Blocking Googlebot On Your Site

On 2026-09-15 Cloudflare changed what "blocked" means for AI traffic. New domains, new sites on existing accounts, and free-tier accounts that had not changed the setting now start with **AI Training crawlers disallowed and AI Agents blocked on ad-bearing pages**. Search was supposed to stay open.

It did not, for a lot of people.

## The part that catches everyone: mixed-use crawlers

Googlebot crawls for Search **and** collects data that feeds AI training. Cloudflare classes it as *mixed-use*, and a mixed-use crawler is treated under whichever rule is most restrictive.

So if Training is blocked, including through the older "Block AI Bots" toggle, the block applies to **all** of Googlebot's functions on ad-supported pages. Googlebot starts getting 403 on pages and on sitemap fetches. The same applies to Bingbot and Applebot.

Your robots.txt still says \`Allow\`. Nothing in your repository changed. Search Console reports fetch failures and nobody can find the cause, because everyone looks at robots.txt first.

Cloudflare's own network data puts Googlebot's crawl share at **27.49% in Q2 2026, down from 57.20%** a year earlier.

## Why robots.txt checks cannot see this

This is the part worth internalising, because it applies well beyond Cloudflare.

**robots.txt is a request. A CDN rule is enforcement.** They live in different layers and they fail in different places. robots.txt is served by your origin and read by a crawler that chooses to obey it. A bot rule at the edge refuses the connection before your origin is ever consulted.

A crawler can be explicitly allowed in robots.txt and still receive a 403. Every "AI visibility" checker I know of, including ours until this week, stops at robots.txt and reports the site as open.

## Checking it by hand

Two curl requests, one as a browser and one as Googlebot:

\`\`\`bash
curl -s -o /dev/null -w "%{http_code}\\n" \\
  -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \\
  https://your-site.dev/

curl -s -o /dev/null -w "%{http_code}\\n" \\
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0" \\
  https://your-site.dev/
\`\`\`

Browser 200 and Googlebot 403 means an edge rule, not robots.txt. Check the sitemap the same way, because that is often where it shows first.

One honest caveat: real crawlers are verified by IP as well as user-agent, so a spoofed agent is indicative rather than conclusive. Confirm with Search Console's URL Inspection, which fetches as the verified Googlebot.

## Or in one command

\`\`\`bash
npx @rankcli/cli@latest audit -u https://your-site.dev
\`\`\`

It asks as Googlebot, bingbot, GPTBot, ClaudeBot and PerplexityBot, compares each against a browser request, and reports two separate findings:

- **\`SEARCH_CRAWLER_BLOCKED_AT_EDGE\`**, an error, when a search crawler is refused while a browser is served
- **\`AI_CRAWLER_BLOCKED_AT_EDGE\`**, a warning, for the AI crawlers

Separate because the costs are different. Losing Googlebot costs you the index. Losing GPTBot costs you citations in AI answers. One is an emergency, the other is a decision you might have made deliberately.

No signup, nothing leaves your machine.

## What it will not do

It will not report anything if a browser cannot fetch your site either. A site that is simply down is not a bot-rule problem, and turning one outage into six confident findings about rules that do not exist is exactly the kind of false alarm that teaches people to ignore their tools.

Tested against reddit.com, which refuses Googlebot, bingbot and GPTBot while serving browsers: it reports all three, split correctly. Tested against nytimes.com, which refuses browsers too: it reports nothing.

## The fix, if you are affected

It is in your CDN, not your repository. On Cloudflare: zone **Security → Bots**, and any "Block AI Bots" or AI Crawler Control toggle. Because Googlebot is mixed-use, you need to allow Search crawlers explicitly or opt out of the default on ad-supported pages.

Existing paid customers were notified in advance and can opt out in zone security settings. New domains and free-tier accounts got the default without asking for it, which is why this keeps surprising people who never changed a setting.
`,
  },
  {
    slug: 'framework-aware-seo-fixes-and-one-click-mcp',
    title: 'Your SEO Fixes Now Land Where Your Framework Actually Serves Them',
    excerpt:
      'Five releases in two days: framework detection rebuilt from 57% to 94% accuracy across 32 frameworks, auto-fix PRs that know static/ from wwwroot/ from priv/static/, a safety layer that refuses to commit invented content, and one-click install for Claude, Cursor and VS Code.',
    publishedAt: '2026-09-28',
    author: 'RankCLI Team',
    readTime: 7,
    tags: ['Release', 'Engineering', 'SEO'],
    content: `
# Your SEO Fixes Now Land Where Your Framework Actually Serves Them

Five releases went out over two days. Here is what changed, and why each one exists.

## Detection rebuilt: 57% to 94%

A \`robots.txt\` written to the wrong directory is worse than no \`robots.txt\` at all. The audit stops reporting it missing, while crawlers still never see it. So before an auto-fix can write a file, it has to know what it is looking at.

The old detector returned the first signal that matched. That is fast and wrong: signals conflict, and the first one to fire is not the most reliable one. It also matched on short substrings, which produced answers like classifying **nginx as Gin** because \`server\` contained "gin", and classifying any page with \`style="width: 50%"\` as Spring Boot because a Thymeleaf pattern matched \`th:\`.

Detection now weighs every signal on the page. Each contributes evidence at one of three strengths, the highest total wins, and a score below the floor returns \`unknown\` rather than a guess. On a 51-site corpus that moved accuracy from **57% to 94%**, with no incorrect claims. When it names a framework, it is right; when it is unsure, it says so.

It recognises **32 frameworks** now, including Docusaurus and Sphinx.

## Fixes land in the right directory

Knowing the framework is only useful if you then act on it. The served directory is a property of the framework, not of whether you happen to have created it yet:

| Framework | Static files go to |
|---|---|
| React, Vue, Next.js, Nuxt, Astro, Remix, Rails, Laravel | \`public/\` |
| SvelteKit, Hugo, Gatsby, Docusaurus, Fresh | \`static/\` |
| ASP.NET Core | \`wwwroot/\` |
| Phoenix | \`priv/static/\` |
| Spring Boot | \`src/main/resources/static/\` |
| Jekyll, Pelican | the app root itself |

An earlier version looked for an existing \`public/\` directory in your repository. That is right for a project that has one and wrong for every project that does not yet. A fresh Next.js app, a fresh Nuxt app and a Docusaurus site all resolved to the repository root, because the directory they serve from had not been created.

Monorepos work too: the app root is found by locating an \`index.html\` beside a \`package.json\`, so fixes land in the right package rather than at the top of the tree.

## A safety layer that refuses to commit

Generated file edits are now checked before they become a commit, and anything carrying a concern is dropped rather than committed. Among what it refuses:

- A replacement that lost a \`<script>\` tag, a stylesheet, or a search-console verification tag
- Invalid JSON, XML or JSON-LD
- A sitemap that came back shorter, or a \`lastmod\` moved backwards
- **Invented content**: a phone number in the reserved 555 range, "123 Main Street, Anytown", an unfilled \`your_...\` placeholder
- **A canonical added to a single-page-app shell**, which would make every route declare itself a duplicate of one URL

Those last two are there because a real generated pull request proposed both. We [wrote that one up separately](/blog/we-found-five-bugs-in-our-own-seo-tool), which is the more interesting story.

Files RankCLI owns from a template (\`robots.txt\`, \`sitemap.xml\`, \`llms.txt\`) may be created but never rewritten by a model. A template cannot hallucinate a date; a model can, and did.

## One-click install for Claude, Cursor and VS Code

The MCP server is the lowest-friction thing we ship: no signup, no API key, nothing leaves your machine. Every path we documented for it involved hand-editing a JSON config file, which is a strange way to introduce the easy option.

**Claude Desktop** now has a downloadable extension bundle. Grab the \`.mcpb\` from the [latest release](https://github.com/integrallis/rankcli/releases/latest) and double-click it.

**Claude Code** is one line:

\`\`\`bash
claude mcp add rankcli -- npx -y @rankcli/mcp-server
\`\`\`

**Cursor and VS Code** have one-click install links on [the docs page](/docs).

All of it drives the same **15 tools**: full audits, AI-crawler access checks, structured data validation, Core Web Vitals, security headers, and generators for the fixes.

## AI readiness that discriminates

The AI-readiness sub-score used to read near zero for essentially every site, including ones that do it well. A score that says zero for everyone looks like a harsh grader and is actually a broken instrument. It carried no information and could not be acted on.

It is recalibrated. Real sites now spread across a usable range and rank in a defensible order, so the number means something when it moves.

## A tier ladder with no flat rung

Auto-fix PR limits now scale properly across plans. The cap on how many pull requests one audit report can open was a flat 3 on every plan, which made the top tier identical to the free one on the limit its customers actually hit, working through a single large report across many sites. It is 3 / 3 / 5 / 10 now, and a test asserts it keeps rising: a rung that does not rise is a rung that means nothing.

## Try it

\`\`\`bash
npx @rankcli/cli audit -u https://your-site.dev
\`\`\`

No signup, no account, 280+ checks. The CLI, the MCP server and the GitHub Action are free forever.
`,
  },
  {
    slug: 'we-found-five-bugs-in-our-own-seo-tool',
    title: 'We Ran Our SEO Tool On Ourselves And Found Five Bugs. One Would Have Deindexed Our Site.',
    excerpt:
      'Our own audit said our site was invisible to Google, our text was unreadable, and our AI readiness was 1%. All three were wrong - and the auto-fix PR it generated would have taken the whole site out of the index. Here is what we found and what we changed.',
    publishedAt: '2026-09-28',
    author: 'RankCLI Team',
    readTime: 9,
    tags: ['Engineering', 'SEO', 'Dogfooding'],
    content: `
# We Ran Our SEO Tool On Ourselves And Found Five Bugs

We publish rankcli.dev's own audit score every week, whether it went up or not. This week we did something slightly different: instead of reading the number, we read every finding and asked whether it was actually true.

Five of them were not. Here they are, because the failures are more useful than the score.

## 1. A page that asked not to be indexed, faulted for not being indexed

For the same \`/login\` page, in the same run, the audit reported two things:

- \`NOINDEX_TAG\` - correct, it carries \`<meta name="robots" content="noindex, nofollow">\` on purpose
- \`REACT_CSR_DETECTED\`, severity **error**: *"Critical - your content is likely invisible to Google"*

It knew the page had opted out of search, then raised a critical error because search could not see it.

Every SaaS has a noindex \`/login\`, \`/signup\` and \`/account\`. They are all client-rendered shells. So every one of our users with a login page was collecting a critical SEO error that nobody should ever act on.

Framework checks now carry an \`indexable_only\` flag, and 19 of them across 9 frameworks are marked with it. Deliberately not marked: render-blocking scripts, which is about performance, and hydration mismatches, which break the page for real users too. Those still fire on a noindex page, because they are still true there.

## 2. Every dark-themed page failed colour contrast

The contrast checker read only an element's own inline style. If it found no background, it assumed white.

Our \`/login\` fallback is \`#a1a1aa\` text painted on \`#0a0a0a\`. That is about **9:1** - comfortably past WCAG AA. We reported **2.56:1** and called it critical.

It now reads the background from the nearest ancestor that paints one, and when nothing up the tree paints anything it records the element as undetermined rather than measuring against a guess. Inline styles only, deliberately: resolving a real CSS cascade without a browser is a much larger job, and half-doing it would reintroduce exactly the confident guess we were removing.

## 3. Our AI readiness score was 1%. So was everyone's.

This is the one that stung, because AI readiness is the thing people come to us for.

We assumed our content was bad. Then we ran the same check against sites that ought to score well:

| Site | AI Readiness (before) |
|---|---|
| stripe.com | 13 |
| vercel.com | 7 |
| cloudflare.com | 0 |
| docs.astro.build | 0 |
| rankcli.dev | 1 |

A documentation site - the ideal target for AI citation - scored zero. The metric was saturated. It carried no information at all.

The cause was a category multiplier copied from categories with a tenth of the checks. Between 15 and 27 AI-readiness checks fire on a typical page, most of them aspirational content notices: no comparison table, no testimonials, no original data. At one point per notice and three per warning, multiplied by three, any real page blew past 100 points of deduction before the interesting checks were counted.

The same five pages now spread **52-71**, and rank in a defensible order.

## 4. Whitespace could fail your build

\`--fail-on error\` exits 1. So an error in this tool is not a line in a report - it is somebody's broken build.

\`DOM_SIZE_EXCESSIVE\` counted every node the parser returns, while its thresholds (1,500 and 3,000) are Lighthouse's - and Lighthouse counts **elements**.

On tailwindcss.com that was **3,231 counted against 2,230 real elements**. The difference: 796 whitespace nodes and 205 comments. Enough to push a warning-sized DOM over the error line.

Which means re-indenting a template, or leaving comments in your output, could have failed your build. It counts elements now, and a test asserts that formatting a page cannot change its severity.

## 5. Missing image dimensions was rated "your site is broken"

\`IMAGES_MISSING_DIMENSIONS\` fired at **error** for three or more images. That failed svelte.dev, tailwindcss.com, rust-lang.org, laravel.com and fastapi.tiangolo.com - five of the ten well-built sites we swept.

Missing width and height is a real CLS cost and we still report it. It is not "your site is broken". Two other places in our own codebase already treated the same condition as a notice and as info; error was the outlier, not the consensus.

## And then the auto-fix PR tried to deindex us

While reviewing an open auto-fix pull request against our own repo before merging it, we found this:

\`\`\`html
<link rel="canonical" href="https://rankcli.dev/" />
\`\`\`

added to the Vite \`index.html\` - the shared shell that serves every route. The file carries a comment three lines above the insertion point explaining precisely why that must never happen: Helmet cannot remove static tags, so every page would inherit it.

Merged, every page on the site - pricing, docs, blog - would have declared itself a duplicate of the homepage.

The same PR proposed Organization structured data with a phone number of \`+1-800-555-0199\`, an address of "123 Main Street, Anytown, CA 90210", and a social profile of \`youtube.com/channel/your_youtube_channel\`. None of it real. It also linked \`/images/og-image.png\` and \`/search\`, both of which 404.

We closed it. Then we fixed the generator: our safety layer now refuses **placeholder content** and **a canonical added to a single-page-app shell**, and any file carrying a safety concern is dropped rather than committed. We tested the new guards against that pull request's actual diff - all six problems are caught, while a real phone number in ordinary prose still passes.

## What we actually learned

**A confident wrong "critical" is worse than a missing check.** A missing check costs you one finding. A false critical teaches people that the red ones are noise - and then the real one goes unread.

**Saturated metrics are invisible failures.** A score that reads zero for everyone looks like a harsh grader, not a broken instrument. The only way we caught it was running the same check against sites we already believed were good, and being surprised.

**Generated fixes need a human read.** Ours carry a disclaimer saying so. This week that disclaimer stopped being boilerplate.

## The numbers, today

rankcli.dev scores **75/100** with **0 errors** and **AI Readiness 67**, measured with the published CLI. Not because the site improved this week - it barely changed. Because the tool stopped lying about it.

You can run exactly the same audit, with no signup and no account:

\`\`\`bash
npx @rankcli/cli audit -u https://your-site.dev
\`\`\`

If it tells you something that is not true, we would genuinely like to know. That is how all five of these were found.
`,
  },
  {
    slug: 'engineering-as-marketing',
    title: 'Engineering as Marketing: Why SEO Should Be Part of Your Development Process',
    excerpt: 'Stop treating SEO as an afterthought. Learn why the best engineering teams build SEO into their development workflow from day one, and how it leads to better products and faster growth.',
    publishedAt: '2026-01-24',
    author: 'RankCLI Team',
    readTime: 8,
    tags: ['Engineering', 'Marketing', 'Strategy'],
    featured: true,
    content: `
# Engineering as Marketing: Why SEO Should Be Part of Your Development Process

The best developer tools don't just solve problems, they get discovered. Yet most engineering teams treat SEO like they treat documentation: something to add later, if there's time.

This is a mistake.

## The "We'll Add SEO Later" Fallacy

Every week, we see the same pattern:

1. Team builds amazing product
2. Team launches with zero SEO consideration
3. Team wonders why organic traffic is nonexistent
4. Team retrofits SEO months later, at 10x the cost

The problem isn't that teams don't care about SEO. It's that they see it as a marketing task, not an engineering one.

**But SEO is fundamentally an engineering problem.**

- Meta tags are just HTML
- Structured data is just JSON
- Performance optimization is just good engineering
- Crawlability is just URL architecture

These aren't "marketing things." They're technical decisions that should be made during development, not after.

## The Cost of Retrofitting SEO

When you ignore SEO during development, you accumulate technical debt:

### Client-Side Rendering (CSR)
You built a beautiful React SPA. Search engines see an empty \`<div id="root"></div>\`. Now you need to:
- Migrate to Next.js or add SSR
- Rewrite routing logic
- Handle hydration issues
- Re-test everything

**Cost: 2-4 weeks of engineering time**

### Missing Meta Infrastructure
Your pages all share the same title tag. To fix it, you need to:
- Add React Helmet or equivalent
- Create meta tag components
- Update every page
- Handle dynamic routes

**Cost: 3-5 days of engineering time**

### Poor URL Architecture
You used query parameters everywhere: \`/products?id=123\`. Now you need:
- URL rewriting
- Redirect maps
- Canonical tag logic
- Updated internal links

**Cost: 1-2 weeks of engineering time**

## The Engineering as Marketing Approach

The smartest teams treat SEO as a first-class engineering concern:

### 1. SEO in the Tech Stack Decision
When choosing between Vite (CSR) and Next.js (SSR), they consider SEO implications upfront:

\`\`\`
Decision: Landing page + docs + blog
SEO need: High (content needs to be indexed)
Choice: Next.js or Astro (SSR/SSG)
\`\`\`

\`\`\`
Decision: Internal dashboard
SEO need: None (behind auth)
Choice: Vite SPA is fine
\`\`\`

### 2. SEO in the Component Library
They create reusable SEO components from day one:

\`\`\`tsx
// components/SEO.tsx
export function SEO({ title, description, image }) {
  return (
    <Helmet>
      <title>{title} | YourApp</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
    </Helmet>
  );
}
\`\`\`

Every page uses it. SEO becomes automatic.

### 3. SEO in the CI/CD Pipeline
They add SEO checks to their build process:

\`\`\`yaml
# .github/workflows/seo.yml
- name: SEO Audit
  run: npx rankcli audit --url $PREVIEW_URL

- name: Fail on Critical Issues
  run: |
    if [ $(cat audit.json | jq '.errors') -gt 0 ]; then
      exit 1
    fi
\`\`\`

SEO regressions get caught before they ship.

### 4. SEO in Code Review
They add SEO to their PR checklist:

- [ ] Page has unique title and description
- [ ] Images have alt text
- [ ] Links are crawlable (not JavaScript-only)
- [ ] New pages added to sitemap
- [ ] Structured data updated if applicable

## Real Examples: Engineering Teams That Get It

### Stripe
Their documentation is a masterclass in SEO engineering:
- Every API method has its own URL
- Code examples are rendered server-side
- Structured data marks up code blocks
- Internal linking is systematic

Result: They rank for thousands of API-related queries.

### Vercel
Their templates and guides are SEO-optimized:
- Static generation for all content
- Dynamic OG images generated at build time
- Automatic sitemap generation
- Performance scores as a feature

Result: They own "deploy [framework]" for every major framework.

### Linear
Their changelog and blog are part of their marketing:
- Every feature has a shareable URL
- Keyboard shortcuts are documented pages
- Their roadmap is public and indexed

Result: They show up in "Jira alternative" queries.

## How to Start

You don't need to overhaul everything. Start with these high-impact changes:

### Week 1: Audit Current State
Run an SEO audit on your site:

\`\`\`bash
npx rankcli audit --url https://yoursite.com
\`\`\`

Identify the top 5 issues.

### Week 2: Fix Quick Wins
Address issues that don't require architecture changes:
- Add missing meta tags
- Fix broken links
- Add alt text to images
- Create robots.txt and sitemap.xml

### Week 3: Plan Architecture Changes
For issues that need bigger fixes:
- CSR to SSR migration plan
- URL restructuring strategy
- Structured data implementation

### Week 4: Add to CI/CD
Make SEO part of your development process:
- Add audit to PR checks
- Block deploys on critical issues
- Alert on SEO regressions

## The Mindset Shift

Stop thinking of SEO as "marketing stuff." Start thinking of it as:

- **Technical documentation** for search engines
- **API design** for crawlers
- **Performance optimization** for a specific client (Googlebot)
- **Accessibility** for non-JavaScript users

When you frame it this way, it becomes obvious: SEO is engineering work that engineers should own.

## Conclusion

The companies winning at organic search aren't doing more marketing. They're doing better engineering.

They've realized that every technical decision, from framework choice to URL structure to rendering strategy, has SEO implications. And they make those decisions with SEO in mind from day one.

The best time to think about SEO was when you started building. The second best time is now.

---

*RankCLI helps engineering teams build SEO into their development workflow. Run \`npx rankcli audit\` to start, or [add it to your CI/CD pipeline](/docs#ci-cd).*
`
  },
  {
    slug: 'react-seo-guide',
    title: 'React SEO Guide: Fixing the Client-Side Rendering Problem',
    excerpt: 'React apps are invisible to search engines by default. Learn the 5 critical SEO issues in React SPAs and how to fix them, from quick wins to full SSR migration.',
    publishedAt: '2026-01-23',
    author: 'RankCLI Team',
    readTime: 10,
    tags: ['React', 'JavaScript', 'Technical SEO'],
    content: `
# React SEO Guide: Fixing the Client-Side Rendering Problem

React is the most popular JavaScript framework. It's also one of the worst for SEO out of the box.

Here's the problem: when a search engine visits your React SPA, it sees this:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script>
</body>
</html>
\`\`\`

Your beautiful UI? Hidden inside JavaScript that may or may not get executed.

This guide covers the 5 critical SEO issues in React apps and how to fix them.

## Issue 1: Empty Body Content

**The Problem**

Search engines have limited JavaScript execution budgets. Google can render JavaScript, but:
- It's slower (days vs seconds for HTML)
- It's less reliable (timeouts, errors)
- Not all search engines do it (Bing is inconsistent)

**Detection**

RankCLI flags this as \`CLIENT_SIDE_RENDERING\` or \`EMPTY_BODY_CONTENT\`:

\`\`\`bash
rankcli audit --url https://your-react-app.com
# Error: Body appears empty without JavaScript execution
\`\`\`

**Solutions**

You have several options depending on your app's needs. There's no one-size-fits-all answer, so pick what works for your situation.

### Option A: Add Prerendering (Quick Win)
For apps with mostly static public pages, prerendering generates HTML at build time:

\`\`\`bash
npm install react-snap
\`\`\`

\`\`\`json
// package.json
{
  "scripts": {
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "include": ["/", "/about", "/pricing"]
  }
}
\`\`\`

This keeps your existing React setup and adds SEO for key pages.

### Option B: Use a Rendering Service
Services like Prerender.io intercept crawler requests and serve pre-rendered HTML. Zero code changes required, just configure at the CDN/server level.

### Option C: Add SSR to Your Existing App
If you need dynamic content rendered server-side, you can add SSR without migrating frameworks:
- **Vite SSR**: Vite has built-in SSR support. See [Vite SSR Guide](https://vitejs.dev/guide/ssr.html)
- **React Server Components**: Available in React 18+ with frameworks that support them

### Option D: Use a Meta-Framework
If you're starting fresh or doing a major rewrite, consider frameworks with SSR built-in:
- **Next.js**: Full-featured, large ecosystem
- **Remix**: Focus on web standards, great data loading
- **Astro**: Great for content-heavy sites, partial hydration

Note: Migrating an existing app to a new framework is a significant undertaking. Weigh the SEO benefits against the engineering cost for your specific situation.

## Issue 2: Missing or Duplicate Meta Tags

**The Problem**

React SPAs often have:
- One title tag for all pages
- No meta descriptions
- Missing Open Graph tags

**Detection**

\`\`\`bash
rankcli audit --url https://your-app.com/about
# Warning: Title tag matches homepage
# Error: Missing meta description
\`\`\`

**Solution: React Helmet**

\`\`\`bash
npm install react-helmet-async
\`\`\`

\`\`\`tsx
// main.tsx
import { HelmetProvider } from 'react-helmet-async';

root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
\`\`\`

\`\`\`tsx
// pages/About.tsx
import { Helmet } from 'react-helmet-async';

export function About() {
  return (
    <>
      <Helmet>
        <title>About Us | MyApp</title>
        <meta name="description" content="Learn about our mission..." />
        <meta property="og:title" content="About Us | MyApp" />
        <meta property="og:description" content="Learn about our mission..." />
        <link rel="canonical" href="https://myapp.com/about" />
      </Helmet>

      <h1>About Us</h1>
      {/* ... */}
    </>
  );
}
\`\`\`

**Best Practice: Create a Reusable Component**

\`\`\`tsx
// components/SEO.tsx
interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, image, url }: SEOProps) {
  const siteUrl = 'https://myapp.com';
  const fullUrl = url ? \`\${siteUrl}\${url}\` : siteUrl;
  const imageUrl = image || \`\${siteUrl}/og-default.png\`;

  return (
    <Helmet>
      <title>{\`\${title} | MyApp\`}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
\`\`\`

## Issue 3: JavaScript-Only Navigation

**The Problem**

React Router links work great for users, but crawlers may not follow them if they're not proper \`<a>\` tags with \`href\` attributes.

**Detection**

RankCLI automatically detects JavaScript-only navigation patterns:

\`\`\`bash
rankcli audit --url https://your-app.com
# Warning: JavaScript-only navigation detected
# Examples: button with onClick, <a href="#"> with onClick
\`\`\`

**Solution**

Always use \`<Link>\` from React Router, not \`onClick\` navigation:

\`\`\`tsx
// Bad - not crawlable
<button onClick={() => navigate('/about')}>About</button>

// Good - crawlable
<Link to="/about">About</Link>
\`\`\`

If you must use buttons, add a hidden link:

\`\`\`tsx
<button onClick={() => navigate('/about')}>
  About
  <Link to="/about" className="sr-only" tabIndex={-1}>About</Link>
</button>
\`\`\`

## Issue 4: Missing Structured Data

**The Problem**

React apps rarely include JSON-LD structured data, missing out on rich results.

**Solution**

Add JSON-LD in a script tag:

\`\`\`tsx
// components/StructuredData.tsx
interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
}
\`\`\`

\`\`\`tsx
// pages/Product.tsx
<StructuredData data={{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "USD"
  }
}} />
\`\`\`

## Issue 5: Poor Performance

**The Problem**

Large JavaScript bundles hurt both user experience and SEO. Core Web Vitals are a ranking factor.

**Detection**

\`\`\`bash
rankcli audit --url https://your-app.com
# Warning: JavaScript bundle exceeds 500KB
# Warning: Largest Contentful Paint is slow
\`\`\`

**Solutions**

### Code Splitting

\`\`\`tsx
// Use React.lazy for route-based splitting
const About = React.lazy(() => import('./pages/About'));
const Pricing = React.lazy(() => import('./pages/Pricing'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

### Optimize Images

\`\`\`tsx
// Use responsive images
<img
  src="/hero-800.jpg"
  srcSet="/hero-400.jpg 400w, /hero-800.jpg 800w, /hero-1200.jpg 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  alt="Hero image"
  loading="lazy"
/>
\`\`\`

### Preload Critical Resources

\`\`\`html
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />
<link rel="preload" href="/hero.jpg" as="image" />
\`\`\`

## The Rendering Decision

How do you decide what approach to take? Here's a framework:

| Situation | Recommendation |
|-----------|----------------|
| Static marketing pages | Prerendering (react-snap, Vite SSG) |
| Dynamic content that needs indexing | SSR via Vite SSR or rendering service |
| New project with heavy SEO needs | Consider SSR-first framework (Next, Remix, Astro) |
| Internal/dashboard app | React SPA is fine, no SEO needed |
| Existing app, limited engineering time | Rendering service (Prerender.io) |

The key question isn't "React vs Next.js", it's "what pages need to be crawlable, and what's the simplest way to achieve that?"

## Quick Wins Checklist

Before any big changes, implement these:

- [ ] Add React Helmet with unique meta tags per page
- [ ] Ensure all navigation uses \`<Link>\` components
- [ ] Add robots.txt and sitemap.xml to your public folder
- [ ] Add JSON-LD for your primary content type
- [ ] Enable gzip/brotli compression
- [ ] Add loading="lazy" to below-fold images

## Next Steps

1. **Run an audit**: \`npx rankcli audit --url https://your-site.com\`
2. **Fix quick wins**: Meta tags, robots.txt, sitemap
3. **Choose your rendering strategy**: Based on your needs, pick prerendering, SSR, or a rendering service
4. **Add to CI/CD**: Prevent SEO regressions

---

*Need help with React SEO? RankCLI detects all these issues automatically. [Try the free audit](/free-audit).*
`
  },
  {
    slug: 'nextjs-seo-guide',
    title: 'Next.js SEO Guide: 7 Mistakes Even Experienced Developers Make',
    excerpt: 'Next.js has great SEO out of the box, but it\'s easy to mess up. Learn the 7 most common SEO mistakes in Next.js apps and how to avoid them.',
    publishedAt: '2026-01-22',
    author: 'RankCLI Team',
    readTime: 9,
    tags: ['Next.js', 'React', 'Technical SEO'],
    content: `
# Next.js SEO Guide: 7 Mistakes Even Experienced Developers Make

Next.js is the most SEO-friendly React framework. It gives you SSR, SSG, ISR, and the new App Router with built-in metadata support.

But even experienced developers make mistakes that hurt their SEO.

Here are 7 common ones, and how to fix them.

## Mistake 1: Not Using the Metadata API (App Router)

**The Problem**

With the App Router, many developers still manually add meta tags instead of using the built-in Metadata API.

**The Fix**

\`\`\`tsx
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | MyApp',
  description: 'The best app for doing things',
  openGraph: {
    title: 'Home | MyApp',
    description: 'The best app for doing things',
    images: ['/og-home.png'],
  },
};

export default function Home() {
  return <main>...</main>;
}
\`\`\`

For dynamic pages:

\`\`\`tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}
\`\`\`

## Mistake 2: Forgetting generateStaticParams

**The Problem**

Dynamic routes like \`/blog/[slug]\` aren't statically generated unless you tell Next.js about them.

**The Fix**

\`\`\`tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
\`\`\`

This ensures all blog posts are pre-rendered at build time.

## Mistake 3: Using Client Components for SEO-Critical Content

**The Problem**

Adding \`'use client'\` to a component means it renders on the client. Meta tags in client components may not be picked up by crawlers.

**The Fix**

Keep SEO-critical content in Server Components:

\`\`\`tsx
// app/product/[id]/page.tsx (Server Component - no 'use client')
import { ProductDetails } from './ProductDetails'; // Client Component for interactivity

export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <ProductDetails product={product} /> {/* Interactive parts */}
    </main>
  );
}
\`\`\`

## Mistake 4: Not Setting Up next/image Properly

**The Problem**

Using regular \`<img>\` tags or misconfiguring \`next/image\`.

**The Fix**

\`\`\`tsx
import Image from 'next/image';

// Good - with proper sizing
<Image
  src="/hero.jpg"
  alt="Hero image showing our product"
  width={1200}
  height={630}
  priority // For above-the-fold images
/>

// For responsive images
<Image
  src="/hero.jpg"
  alt="Hero image"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
\`\`\`

Configure remote images in \`next.config.js\`:

\`\`\`js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
  },
};
\`\`\`

## Mistake 5: Missing robots.txt and sitemap.xml

**The Problem**

Next.js doesn't create these automatically.

**The Fix**

\`\`\`tsx
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'],
    },
    sitemap: 'https://yoursite.com/sitemap.xml',
  };
}
\`\`\`

\`\`\`tsx
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): MetadataRoute.Sitemap {
  const posts = await getAllPosts();

  const blogUrls = posts.map((post) => ({
    url: \`https://yoursite.com/blog/\${post.slug}\`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: 'https://yoursite.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://yoursite.com/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...blogUrls,
  ];
}
\`\`\`

## Mistake 6: Not Adding Structured Data

**The Problem**

Missing JSON-LD means missing rich results in search.

**The Fix**

\`\`\`tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.image,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>{post.title}</h1>
        {/* ... */}
      </article>
    </>
  );
}
\`\`\`

## Mistake 7: Ignoring Core Web Vitals

**The Problem**

Next.js is fast, but lazy loading everything or using heavy libraries can hurt LCP and CLS.

**The Fix**

\`\`\`tsx
// Preload critical resources
<link rel="preload" href="/fonts/inter.woff2" as="font" crossOrigin="anonymous" />

// Use next/dynamic for heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // If not needed for SEO
});

// Add priority to above-fold images
<Image src="/hero.jpg" priority alt="..." />

// Avoid layout shift with explicit dimensions
<div style={{ aspectRatio: '16/9' }}>
  <Image src="/video-thumb.jpg" fill alt="..." />
</div>
\`\`\`

## Quick Audit Checklist

Before you ship, verify:

- [ ] Every page has unique title and description via Metadata API
- [ ] Dynamic pages use generateMetadata
- [ ] Blog/product pages use generateStaticParams
- [ ] robots.ts and sitemap.ts exist
- [ ] JSON-LD on key pages (blog, products, FAQ)
- [ ] Images use next/image with proper sizing
- [ ] Above-fold images have priority prop
- [ ] No SEO-critical content in 'use client' components

## Automated Checking

Run this on every deploy:

\`\`\`bash
npx rankcli audit --url https://your-nextjs-site.com
\`\`\`

Or add to your build:

\`\`\`json
{
  "scripts": {
    "build": "next build",
    "postbuild": "rankcli audit --url $DEPLOY_URL --output json"
  }
}
\`\`\`

For CI/CD integration with error checking, use the JSON output and parse the result:

\`\`\`bash
# In your CI pipeline
RESULT=$(rankcli audit --url $DEPLOY_URL --output json)
ERRORS=$(echo $RESULT | jq '.issues | map(select(.severity == "error")) | length')
if [ "$ERRORS" -gt 0 ]; then
  echo "Found $ERRORS critical SEO errors"
  exit 1
fi
\`\`\`

---

*RankCLI detects all these Next.js SEO issues automatically. [Try the free audit](/free-audit).*
`
  },
  {
    slug: 'vue-nuxt-seo-guide',
    title: 'Vue & Nuxt SEO Guide: From CSR Pitfalls to SSR Success',
    excerpt: 'Vue.js apps face the same SEO challenges as React. Learn how to fix them with Nuxt, and the key differences that make Nuxt the SEO powerhouse of the Vue ecosystem.',
    publishedAt: '2026-01-21',
    author: 'RankCLI Team',
    readTime: 8,
    tags: ['Vue', 'Nuxt', 'Technical SEO'],
    content: `
# Vue & Nuxt SEO Guide: From CSR Pitfalls to SSR Success

Vue.js is fantastic for building interactive UIs. But like React, a vanilla Vue SPA is invisible to search engines.

This guide covers SEO for both Vue (with workarounds) and Nuxt (the proper solution).

## Part 1: Vue.js SPA SEO Challenges

### The Core Problem

A Vue CLI or Vite-created Vue app renders client-side:

\`\`\`html
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
\`\`\`

Search engines see an empty div.

### Workaround 1: Vue Meta

Add meta tag management with \`@vueuse/head\`:

\`\`\`bash
npm install @vueuse/head
\`\`\`

\`\`\`ts
// main.ts
import { createHead } from '@vueuse/head';

const head = createHead();
app.use(head);
\`\`\`

\`\`\`vue
<!-- pages/About.vue -->
<script setup>
import { useHead } from '@vueuse/head';

useHead({
  title: 'About Us | MyApp',
  meta: [
    { name: 'description', content: 'Learn about our mission' },
    { property: 'og:title', content: 'About Us' },
  ],
});
</script>
\`\`\`

### Workaround 2: Prerendering

Use \`vite-plugin-prerender\` for static pages:

\`\`\`ts
// vite.config.ts
import prerender from 'vite-plugin-prerender';

export default {
  plugins: [
    prerender({
      routes: ['/', '/about', '/pricing'],
    }),
  ],
};
\`\`\`

### When Workarounds Aren't Enough

If you need:
- Dynamic pages (blog posts, products)
- Real-time content updates
- Full SSR capabilities

It's time for Nuxt.

## Part 2: Nuxt - Vue's SEO Solution

Nuxt is to Vue what Next.js is to React: the full-stack framework with SSR built in.

### Setup

\`\`\`bash
npx nuxi init my-app
cd my-app
npm install
npm run dev
\`\`\`

### The Power of useSeoMeta

Nuxt's \`useSeoMeta\` composable is SEO perfection:

\`\`\`vue
<script setup>
useSeoMeta({
  title: 'About Us',
  description: 'Learn about our mission and team',
  ogTitle: 'About Us | MyApp',
  ogDescription: 'Learn about our mission and team',
  ogImage: '/og-about.png',
  twitterCard: 'summary_large_image',
});
</script>
\`\`\`

For dynamic pages:

\`\`\`vue
<!-- pages/blog/[slug].vue -->
<script setup>
const route = useRoute();
const { data: post } = await useFetch(\`/api/posts/\${route.params.slug}\`);

useSeoMeta({
  title: () => post.value?.title,
  description: () => post.value?.excerpt,
  ogTitle: () => post.value?.title,
  ogImage: () => post.value?.image,
});
</script>
\`\`\`

### Nuxt Image Optimization

Install the official module:

\`\`\`bash
npm install @nuxt/image
\`\`\`

\`\`\`ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
});
\`\`\`

\`\`\`vue
<template>
  <NuxtImg
    src="/hero.jpg"
    alt="Hero image"
    width="1200"
    height="630"
    loading="lazy"
    format="webp"
  />
</template>
\`\`\`

### Automatic Sitemap Generation

\`\`\`bash
npm install @nuxtjs/sitemap
\`\`\`

\`\`\`ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  sitemap: {
    hostname: 'https://mysite.com',
  },
});
\`\`\`

Dynamic routes are automatically included!

### robots.txt

\`\`\`ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/dashboard/**': { robots: false },
  },
});
\`\`\`

Or create \`public/robots.txt\` manually.

## Common Nuxt SEO Mistakes

### 1. Using \`<script>\` Instead of \`<script setup>\`

The \`<script setup>\` syntax ensures proper SSR hydration.

### 2. Fetching Data Client-Side Only

\`\`\`vue
<!-- Bad - won't be in initial HTML -->
<script setup>
const { data } = useFetch('/api/posts', { server: false });
</script>

<!-- Good - SSR'd -->
<script setup>
const { data } = await useFetch('/api/posts');
</script>
\`\`\`

### 3. Missing useHead for Static Meta

For truly static meta (like on the homepage):

\`\`\`ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      title: 'MyApp - The Best Thing',
      meta: [
        { name: 'description', content: 'Default description' },
      ],
      link: [
        { rel: 'canonical', href: 'https://myapp.com' },
      ],
    },
  },
});
\`\`\`

### 4. Not Using Nuxt Content for Blogs

If you have a blog, use Nuxt Content:

\`\`\`bash
npm install @nuxt/content
\`\`\`

\`\`\`md
---
title: My Blog Post
description: A great blog post
---

# My Blog Post

Content here...
\`\`\`

Automatic SEO, sitemap integration, and markdown rendering.

## Nuxt SEO Checklist

- [ ] Use \`useSeoMeta\` on every page
- [ ] Install @nuxt/image for image optimization
- [ ] Set up @nuxtjs/sitemap
- [ ] Add robots.txt with proper rules
- [ ] Use \`useFetch\` with SSR (not client-only)
- [ ] Add JSON-LD structured data
- [ ] Test with \`nuxi preview\` before deploying

## Quick Audit

\`\`\`bash
# Build and preview
npm run build
npm run preview

# Audit in another terminal
npx rankcli audit --url http://localhost:3000
\`\`\`

---

*RankCLI has built-in checks for Vue and Nuxt apps. [Run a free audit](/free-audit).*
`
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured);
}
