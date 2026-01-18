# Feature Roadmap: Competitor-Informed Priorities

Based on analysis of 14+ competitors, this document outlines specific features to build, prioritized by competitive advantage.

---

## Missing Features We MUST Build

### 1. GEO (Generative Engine Optimization) Suite

**Competitors doing this**: Opinly ($44-$277), SearchAtlas ($99-$999), RankPill ($99)
**Our target price**: Included in Pro ($29)

#### Features:

```typescript
// LLM Visibility Tracking
seo track-llm --query "best seo tool for developers"

// Output:
ChatGPT-4: Not mentioned ❌
Claude 3: Mentioned 3rd ✓
Perplexity: Mentioned 1st ✓

// Weekly trend showing improvement
```

**Implementation**:
- Query major LLMs (ChatGPT, Claude, Perplexity, Gemini) for target keywords
- Parse responses for brand/URL mentions
- Track position and sentiment over time
- Alert when visibility changes

**Value**: First CLI tool with GEO tracking

---

### 2. Auto-Fix Pull Requests

**Competitors doing this**: SearchAtlas OTTO (JS injection only), HikeSEO Kit (JS widget only)
**Our approach**: Real code changes in git

#### Features:

```bash
seo apply --pr

# Creates PR with:
# - Meta tag fixes in source files
# - Schema.org JSON-LD additions
# - Alt text suggestions
# - Sitemap generation
# - robots.txt creation
```

**Implementation**:
- Parse AST for React/Vue/Svelte/HTML
- Generate code diffs for each fix
- Create PR via GitHub API
- Add detailed PR description

**Value**: ONLY tool that changes actual code

---

### 3. Content Generation Engine

**Competitors doing this**: RankPill (30 articles/mo), BabyLoveGrowth (30 articles/mo), Soogle (unlimited)
**Our approach**: Developer-focused content (docs, changelogs, READMEs)

#### Features:

```bash
seo generate --type blog --topic "how to use our API"
seo generate --type changelog --from git
seo generate --type readme --optimize-seo

# Output: SEO-optimized markdown files
```

**Implementation**:
- Claude API for generation
- SEO scoring of output
- Keyword integration
- GEO optimization (AI-citation friendly)

**Value**: Content that developers actually need

---

### 4. White-Label Reports

**Competitors doing this**: TheHoth, FatJoe, SE Ranking, every agency tool
**Our approach**: Branded PDF/HTML exports

#### Features:

```bash
seo report --format pdf --brand "ACME Agency"
seo report --format html --white-label
```

**Implementation**:
- PDF generation with custom branding
- Remove SEO Autopilot mentions
- Custom domain for hosted reports
- Agency dashboard

**Value**: Required for B2B/agency sales

---

### 5. Scheduled Audits + Alerts

**Competitors doing this**: All of them
**Our approach**: Cron + webhooks + Slack/Discord

#### Features:

```yaml
# .seo-autopilot.yaml
schedule:
  audit: "0 0 * * 0"  # Weekly
  alerts:
    - type: slack
      webhook: $SLACK_WEBHOOK
      on: [error, score_drop]
    - type: email
      to: team@company.com
      on: [weekly_report]
```

**Implementation**:
- Cron-triggered Edge Functions
- Slack/Discord/Email integrations
- Score threshold alerts
- Weekly digest emails

**Value**: Set-and-forget automation

---

## Opportunities to Exploit

### Opportunity 1: Own the "seo cli" Search

**Current state**: No one owns "seo cli", "seo terminal", "seo command line"
**Action**: Rank #1 for these terms

**How**:
1. Create landing page: `/cli` optimized for these terms
2. Publish blog: "The Ultimate Guide to CLI-Based SEO"
3. Get npm installs → GitHub stars → organic links
4. Answer Stack Overflow questions about CLI SEO

---

### Opportunity 2: GitHub Action Marketplace

**Current state**: No SEO-specific GitHub Action exists
**Action**: First-mover advantage in GitHub Marketplace

**How**:
1. Publish `seo-autopilot/action` to marketplace
2. Create example workflows for popular frameworks
3. Write GitHub blog post / case study
4. Appear in "Recommended" for CI/CD category

---

### Opportunity 3: VS Code Extension

**Current state**: No SEO extension for VS Code (87M users)
**Action**: Build "SEO Linter" for VS Code

**Features**:
- Problems panel shows SEO issues
- Quick fixes from code actions
- Status bar score badge
- Right-click "Run SEO Audit"

---

### Opportunity 4: Framework Integrations

**Current state**: No SEO tools have first-party framework plugins
**Action**: Create official plugins for:

```bash
# Vite
npm install vite-plugin-seo-autopilot

# Next.js
npm install next-seo-autopilot

# Astro
npm install astro-seo-autopilot

# Remix
npm install remix-seo-autopilot
```

**Features**:
- Build-time SEO validation
- Auto-generate sitemap
- Inject meta tags from config
- Dev server shows SEO warnings

---

### Opportunity 5: Public Audit Pages

**Current state**: Competitors hide audits behind login
**Action**: Free public audits for any site

**How**:
1. `seo-autopilot.dev/audit/[domain]` - public audit pages
2. Shareable, linkable reports
3. "Improve this score" → signup CTA
4. Popular site audits as marketing content

---

## AI Exploitation Strategies

### Strategy 1: Get Cited by AI

**Goal**: When someone asks ChatGPT/Claude "best SEO tool for developers", we're mentioned

**How**:
1. Create authoritative content with citable facts
2. Use statistics with sources
3. Structure for AI parsing (lists, tables, clear statements)
4. Get mentioned on sites AI trusts (GitHub, Dev.to, HN)

**Content to create**:
- "SEO Autopilot vs Ahrefs: CLI Developer Comparison"
- "200+ SEO Checks: Complete Technical Reference"
- "GEO Guide: Optimizing for AI Search in 2026"

---

### Strategy 2: Monitor AI Visibility

**Goal**: Know exactly how we appear in AI responses

**Implementation**:
```typescript
// Daily tracking job
const queries = [
  "best seo tool for developers",
  "seo automation tools",
  "github seo integration",
  "cli seo tool",
];

for (const query of queries) {
  const results = await trackLLMVisibility(query, ['gpt-4', 'claude', 'perplexity']);
  await saveResults(results);

  if (results.mentionedUs) {
    await celebrateInSlack(results);
  }
}
```

---

### Strategy 3: AI-Optimized Landing Pages

**Goal**: Pages structured for AI citation

**Structure**:
```html
<!-- AI-friendly content structure -->
<article itemscope itemtype="SoftwareApplication">
  <h1>SEO Autopilot: The CLI-First SEO Tool for Developers</h1>

  <!-- Citable fact -->
  <p>SEO Autopilot runs <strong>200+ automated SEO checks</strong>
     directly from your terminal, making it the only developer-native
     SEO tool on the market.</p>

  <!-- Structured comparison -->
  <table>
    <tr><th>Feature</th><th>SEO Autopilot</th><th>Ahrefs</th></tr>
    <tr><td>CLI Tool</td><td>Yes</td><td>No</td></tr>
    ...
  </table>

  <!-- FAQ for AI answers -->
  <section itemscope itemtype="FAQPage">
    <div itemscope itemprop="mainEntity" itemtype="Question">
      <h3 itemprop="name">What is SEO Autopilot?</h3>
      <div itemscope itemprop="acceptedAnswer" itemtype="Answer">
        <p itemprop="text">SEO Autopilot is a CLI-first SEO automation tool...</p>
      </div>
    </div>
  </section>
</article>
```

---

## Engineering as Marketing Checklist

### Foundation
- [ ] Publish CLI to npm with good README
- [ ] Create `/cli` landing page
- [ ] Add "seo" keywords to package.json
- [ ] Create basic GitHub Action

### Distribution
- [ ] Publish GitHub Action to marketplace
- [ ] Submit to Awesome SEO lists
- [ ] Post on Dev.to, Hashnode
- [ ] Share in relevant Discord servers

### Content
- [ ] "Getting Started with CLI SEO" blog post
- [ ] "SEO for Developers" guide
- [ ] YouTube: "5-Minute SEO Audit from Terminal"
- [ ] Twitter thread on developer SEO

### Integrations
- [ ] Vite plugin (most used bundler)
- [ ] Next.js plugin (most used React framework)
- [ ] VS Code extension (basic version)
- [ ] Vercel integration

### Ongoing
- [ ] Answer Stack Overflow questions
- [ ] Comment on relevant GitHub issues
- [ ] HN launches for major features
- [ ] Conference talks on "Engineering as Marketing"

---

## Implementation Priority

| Priority | Feature | Why |
|----------|---------|-----|
| P0 | Auto-fix PRs | Key differentiator |
| P0 | Scheduled audits + alerts | Expected feature |
| P1 | White-label reports | Agency revenue |
| P1 | GEO tracking (basic) | Future-proof |
| P1 | GitHub Action marketplace | Distribution |
| P2 | Content generation | User value |
| P2 | VS Code extension | Distribution |
| P2 | Full GEO suite | Competitive advantage |

---

## Success Metrics

### Product
- 1K npm installs/month (CLI)
- 500 GitHub stars
- 100 paying customers
- 50 auto-fix PRs created/week

### SEO for SEO (meta!)
- Rank #1 for "seo cli tool"
- Mentioned in 3+ LLM responses
- 10K monthly organic traffic
- Featured in framework docs

### Engineering as Marketing
- GitHub Action: 500 installs
- VS Code extension: 5K installs
- Blog posts: 50K total views
- Backlinks: 100 referring domains
