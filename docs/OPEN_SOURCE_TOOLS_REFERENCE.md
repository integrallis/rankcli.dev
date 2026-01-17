# Open Source SEO Tools Reference

A curated list of open source tools that can be leveraged, integrated, or used as inspiration for our SEO automation platform.

---

## Site Audit & Crawling Tools

### SEOnaut
- **URL**: https://github.com/StJudeWasHere/seonaut
- **Language**: Go (78.9%), HTML, CSS
- **Database**: MySQL
- **License**: MIT
- **Features**:
  - Comprehensive site scanning with severity-based issue reporting
  - Detects broken links (404 errors)
  - Identifies redirect issues including loops
  - Finds missing or duplicate meta tags
  - Checks heading hierarchy
  - Interactive dashboard using Apache ECharts
  - Multi-user support
- **Installation**: Docker Compose recommended
- **Use Case**: Core site audit functionality

### SEO Audits Toolkit
- **URL**: https://github.com/StanGirard/seo-audits-toolkit
- **Language**: Python/Django (57.8%), JavaScript/React (28.2%)
- **Database**: PostgreSQL
- **License**: MIT
- **Features**:
  - Lighthouse auditing with score tracking over time
  - SERP ranking tracking
  - Keyword extraction from content
  - Site header/link/image analysis
  - Sitemap parsing
  - Text summarization
  - Security header assessment
- **Installation**: Docker Compose
- **Use Case**: Multi-tool audit suite, Lighthouse integration

### Python SEO Analyzer
- **URL**: https://github.com/sethblack/python-seo-analyzer
- **Language**: Python
- **Features**:
  - Site structure analysis
  - Site crawling
  - Word counting in body content
  - Technical SEO issue warnings
- **Use Case**: Lightweight Python-based analysis

### Greenflare
- **URL**: https://github.com/beb7/gflare-tk
- **Language**: Python
- **Features**:
  - Fast technical SEO crawling
  - Large-scale site audits
  - Cross-platform GUI
- **Use Case**: Screaming Frog alternative

---

## Rank Tracking

### SerpBear
- **URL**: https://github.com/towfiqi/serpbear
- **Language**: TypeScript/Next.js
- **License**: MIT
- **Stars**: 1,600+
- **Features**:
  - Unlimited domains and keywords
  - Email notifications (daily/weekly/monthly)
  - Built-in API for integrations
  - Google Search Console integration
  - Keyword research with Google Ads integration
  - PWA mobile app
  - Multi-language and Google domain support
  - Zero-cost deployment options (Fly.io, mogenius)
- **Scraping**: ScrapingRobot, ScrapingAnt, SerpApi, or custom proxies
- **Use Case**: Core rank tracking functionality

---

## Content Optimization

### ContentSwift
- **URL**: https://github.com/hilmanski/contentswift
- **Language**: Python (FastAPI), Golang, Next.js
- **Database**: PostgreSQL
- **Features**:
  - Keyword research and SERP analysis
  - Content optimization based on top-ranking pages
  - Word frequency analysis
  - Alternative to Surfer SEO, Frase, NeuronWriter
- **Dependencies**: SerpAPI for Google results
- **Status**: Active development, not production-ready
- **Use Case**: Content optimization recommendations

---

## CLI Tools

### SEO Bhishma CLI
- **URL**: https://github.com/anonymousraft/seo-bhishma-cli
- **Language**: Python
- **License**: MIT
- **Installation**: `pipx install seo-bhishma-cli`
- **Features**:
  - **LinkSniper**: Backlink validation with anchor text checking
  - **SiteMapper**: Sitemap download/parse (image, video, news)
  - **IndexSpy**: Bulk indexing status with proxy support
  - **KeywordSorcerer**: GPT-4 semantic keyword clustering
  - **Sitemap Generator**: XML sitemap creation
  - **GSC Probe**: Google Search Console data extraction
  - **Redirect Genius**: NLP-powered URL mapping
  - **Domain Insights**: WHOIS, reverse IP, subdomain enumeration
- **Stack**: Click, Requests, BeautifulSoup, Pandas, TQDM
- **Use Case**: Primary CLI inspiration/integration

### Site-Audit-SEO
- **URL**: https://github.com/viasite/site-audit-seo
- **Features**:
  - CLI for SEO site audit
  - Crawl + Lighthouse each page
  - Output to CSV, XLSX, JSON, web, or Google Drive
- **Use Case**: Batch audit with multiple output formats

---

## Analytics & Tracking

### Umami
- **URL**: https://github.com/umami-software/umami
- **Language**: TypeScript/Next.js
- **Features**:
  - Privacy-focused web analytics
  - Custom event tracking
  - Trend analysis
  - Page views, unique visitors, bounce rate, sessions
  - Traffic source tracking
- **Use Case**: Privacy-first analytics alternative to GA

### OpenPanel
- **URL**: https://github.com/Openpanel-dev/openpanel
- **Features**:
  - Real-time analytics
  - User tracking and event analysis
  - Comprehensive reporting
  - Privacy-prioritized data collection
- **Use Case**: Product analytics integration

---

## Backlink Analysis

### OpenLinkProfiler
- **URL**: https://openlinkprofiler.org (web-based, free)
- **Features**:
  - Backlink data analysis
  - Anchor text analysis
  - Link context examination
  - Competitor site analysis
  - CSV export
- **Use Case**: Free backlink research

---

## GitHub Actions & CI/CD

### Lighthouse CI
- **URL**: https://github.com/GoogleChrome/lighthouse-ci
- **Features**:
  - Automated Lighthouse audits on every commit
  - Performance regression prevention
  - Score tracking over time
  - Performance budgets
  - Version comparison
- **Use Case**: CI/CD integration for automated SEO audits

### Lighthouse CI Action
- **URL**: https://github.com/treosh/lighthouse-ci-action
- **Features**:
  - GitHub Actions integration
  - Parallel job execution
  - Failed test visibility
  - Result uploads
- **Use Case**: GitHub workflow integration

### Lighthouse Audit Action
- **URL**: https://github.com/jakejarvis/lighthouse-action
- **Features**:
  - Performance, Accessibility, Best Practices, SEO, PWA scoring
  - HTML and JSON report artifacts
- **Use Case**: Simple audit action

---

## Curated Tool Lists

### awesome-seo-tools
- **URL**: https://github.com/serpapi/awesome-seo-tools
- **Maintainer**: SerpApi team
- **Content**: Comprehensive categorized list of SEO tools
- **Use Case**: Discovery and feature inspiration

### search-solved-public-seo
- **URL**: https://github.com/searchsolved/search-solved-public-seo
- **Content**: 40+ SEO tools, Streamlit apps, APIs, Python scripts
- **Use Case**: Python-based tool reference

---

## APIs to Integrate

### Google Search Console API
- **Documentation**: https://developers.google.com/webmaster-tools
- **Capabilities**:
  - Search analytics queries
  - Sitemap management
  - URL inspection
  - Site management
- **Libraries**: Python, Node.js, Java, PHP, Ruby, .NET
- **Limits**: 2,000 URL inspections/day/property

### Bing Webmaster Tools API
- **Documentation**: https://www.bing.com/webmasters/about
- **Features**:
  - Submit URLs
  - Get URL info
  - Traffic data
- **Use Case**: Multi-search-engine support

### SerpAPI
- **URL**: https://serpapi.com
- **Use Case**: Google SERP data retrieval (used by ContentSwift, SerpBear)

### ScrapingRobot / ScrapingAnt
- **Use Case**: SERP scraping for rank tracking

---

## Free Tools to Integrate Via Web

| Tool | URL | Purpose |
|------|-----|---------|
| Google Search Console | search.google.com/search-console | Traffic, indexing |
| Bing Webmaster Tools | bing.com/webmasters | Bing SEO |
| Google Keyword Planner | ads.google.com/keyword-planner | Keyword research |
| MozCast | moz.com/mozcast | Algorithm tracking |
| Redirect Path (Chrome) | Chrome Extension | Redirect checking |
| PageSpeed Insights | pagespeed.web.dev | Performance |
| Rich Results Test | search.google.com/test/rich-results | Schema validation |
| Mobile-Friendly Test | search.google.com/test/mobile-friendly | Mobile UX |

---

## Technology Stack Recommendations

Based on the tools analyzed, the recommended stack for our platform:

### CLI
- **Language**: Python (ecosystem richness) or Go (performance)
- **Framework**: Click or Typer (Python), Cobra (Go)
- **Key Libraries**: Requests, BeautifulSoup, NLTK, Pandas

### Backend API
- **Language**: Python (FastAPI) or Node.js (Express/Fastify)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Queue**: Bull (Node) or Celery (Python)

### Frontend
- **Framework**: Next.js (React)
- **Charts**: Apache ECharts or Recharts
- **UI**: Tailwind CSS + shadcn/ui

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose (dev), Kubernetes (prod)
- **CI/CD**: GitHub Actions

---

## Priority Tools to Clone/Fork

1. **SerpBear** - Rank tracking foundation
2. **SEOnaut** - Site audit core
3. **SEO Bhishma CLI** - CLI command structure
4. **ContentSwift** - Content optimization
5. **Lighthouse CI** - CI/CD integration

These provide 80% of the core functionality we need.
