export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
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

The best developer tools don't just solve problems—they get discovered. Yet most engineering teams treat SEO like they treat documentation: something to add later, if there's time.

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

They've realized that every technical decision—from framework choice to URL structure to rendering strategy—has SEO implications. And they make those decisions with SEO in mind from day one.

The best time to think about SEO was when you started building. The second best time is now.

---

*RankCLI helps engineering teams build SEO into their development workflow. Run \`npx rankcli audit\` to start, or [add it to your CI/CD pipeline](/docs#ci-cd).*
`
  },
  {
    slug: 'react-seo-guide',
    title: 'React SEO Guide: Fixing the Client-Side Rendering Problem',
    excerpt: 'React apps are invisible to search engines by default. Learn the 5 critical SEO issues in React SPAs and how to fix them—from quick wins to full SSR migration.',
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

You have several options depending on your app's needs. There's no one-size-fits-all answer—pick what works for your situation.

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
Services like Prerender.io intercept crawler requests and serve pre-rendered HTML. Zero code changes required—just configure at the CDN/server level.

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
| Internal/dashboard app | React SPA is fine—no SEO needed |
| Existing app, limited engineering time | Rendering service (Prerender.io) |

The key question isn't "React vs Next.js"—it's "what pages need to be crawlable, and what's the simplest way to achieve that?"

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
    excerpt: 'Next.js has great SEO out of the box—but it\'s easy to mess up. Learn the 7 most common SEO mistakes in Next.js apps and how to avoid them.',
    publishedAt: '2026-01-22',
    author: 'RankCLI Team',
    readTime: 9,
    tags: ['Next.js', 'React', 'Technical SEO'],
    content: `
# Next.js SEO Guide: 7 Mistakes Even Experienced Developers Make

Next.js is the most SEO-friendly React framework. It gives you SSR, SSG, ISR, and the new App Router with built-in metadata support.

But even experienced developers make mistakes that hurt their SEO.

Here are 7 common ones—and how to fix them.

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
