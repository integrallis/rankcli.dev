# Missing Checks - Competitor Parity Analysis

This document tracks checks performed by competitor SEO tools that we may be missing.

## Sources Analyzed

1. **Seobility** (seobility.net)
2. **SEOptimer** (seoptimer.com)
3. **HubSpot Website Grader** (website.grader.com)
4. **Backlinko SEO Checker** (tools.backlinko.com)
5. **PageSpeed Insights / Lighthouse** (pagespeed.web.dev)

---

## Check Coverage Status

### Legend
- ✅ **Implemented** - We have this check
- ⚠️ **Partial** - We check something similar but not exactly
- ❌ **Missing** - We don't have this check
- 🔄 **External** - Requires external API/service

---

## Meta & Title Checks

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Title tag presence | ✅ | `on-page.ts` | |
| Title length (50-60 chars) | ✅ | `on-page.ts` | |
| Domain name in title | ❌ | - | Seobility flags this as bad practice |
| Duplicate words in title | ❌ | - | Seobility checks for repetition |
| Meta description presence | ✅ | `on-page.ts` | |
| Meta description length | ✅ | `on-page.ts` | |
| SERP snippet preview | ✅ | `serp-preview.ts` | |

---

## Heading Structure

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| H1 presence | ✅ | `on-page.ts` | |
| H1 length (5-70 chars) | ⚠️ | `on-page.ts` | May need length check |
| Multiple H1 tags | ✅ | `on-page.ts` | |
| H2-H6 hierarchy | ✅ | `dom-analysis.ts` | |
| Heading structure/order | ✅ | `dom-analysis.ts` | |

---

## Content Quality

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Word count | ✅ | `on-page.ts` | |
| Minimum content (250-800 words) | ✅ | `on-page.ts` | |
| Keyword consistency | ✅ | `keyword-analysis.ts` | |
| Keyword density | ✅ | `keyword-analysis.ts` | |
| 2/3/4-word phrase analysis | ✅ | `keyword-analysis.ts` | |
| Paragraph detection | ⚠️ | `content-science.ts` | Verify coverage |
| Strong/bold tag usage | ❌ | - | Seobility recommends up to 6 |
| Placeholder content detection | ❌ | - | Lorem ipsum, etc. |

---

## Crawlability & Indexing

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| robots.txt presence | ✅ | `crawlability.ts` | |
| robots.txt validity/syntax | ❌ | - | Backlinko/PSI flag syntax errors |
| Blocked by robots.txt | ✅ | `crawlability.ts` | |
| XML sitemap presence | ✅ | `crawlability.ts` | |
| Canonical tag | ✅ | `canonical-advanced.ts` | |
| Noindex meta tag | ✅ | `crawlability.ts` | |
| Noindex HTTP header | ⚠️ | `crawlability.ts` | Verify header check |
| llms.txt presence | ❌ | - | **NEW AI standard** |

---

## Language & International

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| HTML lang attribute | ✅ | `on-page.ts` | |
| Hreflang tags | ✅ | `hreflang.ts` | |
| Language/server location match | ❌ | - | Seobility checks this |
| rel=next/prev pagination | ✅ | `pagination.ts` | |

---

## URL & Domain

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| URL length | ⚠️ | `on-page.ts` | Verify length check |
| Friendly URLs | ❌ | - | No special chars, readable |
| Session ID in URL | ❌ | - | Bad for SEO |
| Parameters in URL | ❌ | - | Query strings |
| Subdirectory depth | ❌ | - | Too many levels |
| Subdomain check | ❌ | - | www vs non-www |
| Domain length | ❌ | - | |
| Non-Latin characters | ❌ | - | IDN domains |

---

## Technical HTML

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Doctype (HTML5) | ❌ | - | Simple check |
| Charset encoding (UTF-8) | ❌ | - | Simple check |
| Favicon presence | ❌ | - | Multiple tools check this |
| Apple Touch icon | ❌ | - | iOS app icon |
| Frames/frameset | ❌ | - | Deprecated |
| iFrames detection | ❌ | - | Can affect SEO |
| Deprecated HTML tags | ❌ | - | Old tags like `<center>` |
| Inline styles | ❌ | - | Should be external CSS |
| Flash/plugin detection | ❌ | - | Content plugins |

---

## Images

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Alt text presence | ✅ | `images.ts` | |
| Image optimization | ✅ | `images.ts` | |
| Modern formats (WebP/AVIF) | ✅ | `modern-images.ts` | |
| Responsive images | ✅ | `responsive-images.ts` | |
| Explicit width/height | ❌ | - | PSI flags this for CLS |
| Image sizing (served vs displayed) | ⚠️ | `responsive-images.ts` | |

---

## Links

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Internal links count | ✅ | `links.ts` | |
| External links count | ✅ | `links.ts` | |
| Broken links | ✅ | `links.ts` | |
| Nofollow ratio | ✅ | `links.ts` | |
| Descriptive link text | ✅ | `anchor-text.ts` | |
| Friendly URL structure | ❌ | - | |

---

## Performance

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Response time | ✅ | `performance.ts` | |
| Page size | ✅ | `performance.ts` | |
| Core Web Vitals (FCP, LCP, CLS, TBT) | ✅ | `performance.ts` | |
| Speed Index | ⚠️ | `performance.ts` | |
| Resource count (JS, CSS, images) | ❌ | - | HTTP request count |
| Browser caching | ❌ | - | Cache headers |
| Minification (JS/CSS) | ❌ | - | Code minified? |
| Compression (gzip/brotli) | ❌ | - | Transfer encoding |
| Render-blocking resources | ❌ | - | PSI diagnostic |
| Unused JavaScript | ❌ | - | PSI opportunity |
| Unused CSS | ❌ | - | PSI opportunity |
| Long main-thread tasks | ❌ | - | PSI diagnostic |
| Critical request chain | ❌ | - | PSI diagnostic |
| Forced reflow | ❌ | - | PSI diagnostic |
| DOM size | ❌ | - | Element count limit |
| Network payload size | ⚠️ | `performance.ts` | Total page weight |
| JavaScript errors | ❌ | - | Console errors during load |
| HTTP/2+ protocol | ❌ | - | Server protocol |

---

## Security

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| HTTPS | ✅ | `security.ts` | |
| SSL certificate | ✅ | `security.ts` | |
| HTTPS redirect | ⚠️ | `security.ts` | |
| HSTS header | ✅ | `security-headers.ts` | |
| CSP header | ✅ | `security-headers.ts` | |
| X-Frame-Options | ⚠️ | `security-headers.ts` | Clickjacking |
| COOP header | ❌ | - | Cross-origin opener |
| Trusted Types | ❌ | - | DOM XSS mitigation |
| X-Powered-By header | ❌ | - | Should not be sent |
| Secure JS libraries | ❌ | - | Vulnerable library detection |

---

## Mobile

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Viewport meta tag | ✅ | `mobile.ts` | |
| Mobile-friendliness | ✅ | `mobile.ts` | |
| Legible font sizes | ⚠️ | `mobile.ts` | |
| Tap target sizing | ⚠️ | `mobile.ts` | |
| Responsive design | ❌ | - | HubSpot specific test |

---

## Structured Data

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Schema.org presence | ✅ | `structured-data.ts` | |
| Schema validation | ⚠️ | `structured-data.ts` | |
| Organization schema | ⚠️ | `structured-data.ts` | |
| Person schema | ⚠️ | `structured-data.ts` | |
| Identity schema | ❌ | - | SEOptimer checks this |
| LocalBusiness schema | ✅ | `local-seo.ts` | |
| AggregateRating schema | ✅ | `review-ecosystem.ts` | |
| FAQ schema | ✅ | `featured-snippet.ts` | |
| BreadcrumbList schema | ⚠️ | `structured-data.ts` | |

---

## Social Media

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Open Graph tags | ✅ | `social-meta.ts` | |
| Twitter Cards | ✅ | `social-meta.ts` | |
| Facebook Page linked | ⚠️ | `platform-presence.ts` | |
| Twitter profile linked | ⚠️ | `platform-presence.ts` | |
| Instagram linked | ⚠️ | `platform-presence.ts` | |
| LinkedIn linked | ⚠️ | `platform-presence.ts` | |
| YouTube linked | ⚠️ | `platform-presence.ts` | |
| Facebook Pixel | ❌ | - | Tracking pixel |
| Social sharing buttons | ❌ | - | Share plugins |

---

## Local SEO

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| NAP (Name, Address, Phone) | ✅ | `local-seo.ts` | |
| LocalBusiness schema | ✅ | `local-seo.ts` | |
| Google Business Profile | 🔄 | - | Requires API |

---

## Server & Infrastructure

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Server response time | ✅ | `performance.ts` | |
| HTTP redirects | ✅ | `redirect-analysis.ts` | |
| www vs non-www redirect | ❌ | - | Canonical domain |
| Technology detection | ✅ | `tech-detection.ts` | |
| DNS servers | 🔄 | - | External lookup |
| Server location | 🔄 | - | External lookup |
| AMP detection | ❌ | - | Accelerated Mobile Pages |

---

## Email Authentication

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| DMARC record | 🔄 | - | DNS lookup required |
| SPF record | 🔄 | - | DNS lookup required |
| Email privacy (plain-text) | ❌ | - | Exposed emails |

---

## Analytics & Tracking

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Analytics tool detection | ❌ | - | GA, GTM, etc. |
| Tracking pixels | ❌ | - | Various pixels |
| Third-party script impact | ✅ | `tracker-bloat.ts` | |

---

## Accessibility (Lighthouse)

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Color contrast | ❌ | - | WCAG compliance |
| Video captions | ❌ | - | `<track kind="captions">` |
| Aria attributes | ❌ | - | Accessibility |
| Focus indicators | ❌ | - | Keyboard nav |
| Skip links | ❌ | - | Accessibility |

---

## AI-Specific Checks

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| GPTBot access | ✅ | `ai-readiness.ts` | |
| Bing verification | ✅ | `bing-optimization.ts` | |
| llms.txt | ❌ | - | New standard |
| AI visibility score | ⚠️ | Various | Backlinko has this |
| AI sentiment score | ❌ | - | Backlinko has this |
| Rendered content % | ✅ | `client-rendering.ts` | LLM readability |
| Identity schema | ❌ | - | Organization/Person |

---

## External/Backlink Metrics

| Check | Status | Our Module | Notes |
|-------|--------|------------|-------|
| Total backlinks | 🔄 | - | Requires Ahrefs/Moz API |
| Referring domains | 🔄 | - | External API |
| Dofollow/nofollow ratio | 🔄 | - | External API |
| Edu/gov backlinks | 🔄 | - | External API |
| Domain authority | 🔄 | - | External API |

---

## Priority Missing Checks

### High Priority (Frequently Checked by Competitors)

1. **robots.txt syntax validation** - PSI and Backlinko flag this
2. **llms.txt presence** - New AI standard
3. **Doctype/charset check** - Basic compliance
4. **Favicon check** - All tools check this
5. **www vs non-www redirect** - Duplicate content risk
6. **Browser caching** - Performance basic
7. **JavaScript errors detection** - Runtime errors
8. **DOM size limits** - Performance
9. **Explicit image dimensions** - CLS prevention
10. **Color contrast** - Accessibility

### Medium Priority

11. **Domain in title check** - Bad practice
12. **Session ID in URL** - Bad for SEO
13. **Analytics detection** - Tracking presence
14. **Email privacy** - Plain text emails
15. **HTTP/2 protocol** - Modern server
16. **AMP detection** - Mobile pages
17. **Social sharing buttons** - Engagement
18. **Minification check** - Optimization
19. **Compression check** - Transfer optimization
20. **Unused JS/CSS** - Performance

### Lower Priority (Nice to Have)

21. **DNS/DMARC/SPF** - Email auth (requires DNS lookup)
22. **Secure JS libraries** - Vulnerability scan
23. **Source maps** - Developer experience
24. **Deprecated HTML** - Code quality
25. **Inline styles** - Code quality
26. **iFrames detection** - SEO impact
27. **Strong/bold tag usage** - Content formatting
28. **Apple Touch icon** - iOS support

---

## Implementation Notes

### Quick Wins (Can add to existing modules)

- Favicon check → `on-page.ts`
- Doctype/charset → `on-page.ts`
- Domain in title → `on-page.ts`
- Explicit image dimensions → `images.ts` or `responsive-images.ts`
- HTTP/2 protocol → `security.ts` or `performance.ts`

### New Modules Needed

- `llms-txt.ts` - llms.txt standard check
- `code-quality.ts` - Minification, inline styles, deprecated HTML
- `accessibility.ts` - Color contrast, video captions, ARIA
- `url-hygiene.ts` - Session IDs, friendly URLs, parameters
- `caching.ts` - Browser caching, cache headers

### Requires External APIs

- Backlink metrics (Ahrefs, Moz, Majestic)
- DNS records (DNS lookup service)
- Secure JS libraries (Snyk, Retire.js)
