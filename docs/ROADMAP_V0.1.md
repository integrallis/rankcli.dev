# RankCLI v0.1 Roadmap: Competitive Catch-Up

**Date:** 2026-03-04
**Competitor:** HikeSEO (hikeseo.co)
**Goal:** Close the feature gap while staying true to CLI-first, developer-focused identity

---

## Executive Summary

HikeSEO targets non-technical SMBs at $149/mo with "done-for-you" AI SEO.
RankCLI targets developers at $15/mo with CLI-first tooling.

**We don't need to become them.** We need to steal their best ideas and make them developer-native.

---

## Feature Gap Analysis

| Feature | Hike | RankCLI (current) | Priority |
|---------|------|-------------------|----------|
| Agentic implementation (auto-fix) | Kit fixes via JS | Generates fixes, manual apply | **P0** |
| Keyword rank tracking | 300 keywords tracked | ❌ | **P0** |
| AI/LLM search optimization | ChatGPT findability | ❌ | **P1** |
| Progress dashboard | Monthly reports | ❌ | **P1** |
| Content generation | Blog posts created | ❌ | P2 |
| Local SEO (GBP, directories) | 50+ directories | ❌ | P2 |

---

## P0: Must Ship (v0.0.20-0.0.22)

### 1. Agentic Fixer (`rankcli fix`)

**What:** Transform current `apply` command into full agentic fixer that:
- Detects issues
- Generates fixes
- Applies changes
- Commits with conventional commit messages
- Optionally pushes

**CLI Interface:**
```bash
# Interactive mode (default)
rankcli fix --url https://mysite.com

# Full auto mode
rankcli fix --url https://mysite.com --auto --commit --push

# Dry run
rankcli fix --url https://mysite.com --dry-run

# Specific issues only
rankcli fix --url https://mysite.com --only TITLE_MISSING,META_DESC_MISSING
```

**Implementation:**
- New `packages/cli/src/commands/fix.ts`
- Extend `applyFixes()` in agent-runtime to support git operations
- Add `--commit` flag that generates conventional commit message
- Add `--push` flag for CI/CD integration
- Add `--only` flag for selective fixing

**Database:**
- Track fix history in `fix_runs` table
- Link to audit that triggered fixes

---

### 2. Keyword Rank Tracking (`rankcli track`)

**What:** Track keyword positions over time using SERP API or scraping.

**CLI Interface:**
```bash
# Add keywords to track
rankcli track add "seo cli tool" "developer seo" --url https://rankcli.dev

# Check current positions
rankcli track status

# View history
rankcli track history --keyword "seo cli tool" --days 30

# Export data
rankcli track export --format csv
```

**Implementation:**
- New `packages/agent-runtime/src/ranking/` module
- SERP data source: Start with ValueSERP API ($50/mo for 5k queries)
- Fallback: Direct Google scraping with rotating proxies
- Store results in Supabase `keyword_rankings` table

**Data Model:**
```sql
-- Keyword definitions
CREATE TABLE tracked_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  keyword TEXT NOT NULL,
  search_engine TEXT DEFAULT 'google',
  country TEXT DEFAULT 'US',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Position history
CREATE TABLE keyword_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID REFERENCES tracked_keywords(id),
  position INT, -- NULL = not in top 100
  url TEXT, -- Which URL ranked
  serp_features JSONB, -- Featured snippet, PAA, etc.
  checked_at TIMESTAMPTZ DEFAULT now()
);
```

**Tier Limits:**
- Free: 10 keywords, daily checks
- Solo ($15): 100 keywords, daily checks
- Pro ($49): 500 keywords, 2x daily
- Agency ($149): 2000 keywords, 4x daily

---

## P1: Should Ship (v0.0.23-0.0.25)

### 3. AI/LLM Search Optimization (`rankcli llm`)

**What:** Optimize content for AI search engines (ChatGPT, Perplexity, Claude).

**CLI Interface:**
```bash
# Analyze LLM visibility
rankcli llm check --url https://mysite.com

# Generate LLM-optimized structured data
rankcli llm optimize --generate-faq --generate-howto

# Test with AI models
rankcli llm test "What is the best SEO CLI tool?"
```

**Implementation:**
- Extend `analyzers/geo-analyzer.ts` (already exists!)
- Add FAQ schema generator
- Add HowTo schema generator
- Add Speakable schema for voice search
- Test queries against Perplexity API

**Checks:**
- [ ] FAQ schema present and valid
- [ ] HowTo schema for tutorials
- [ ] Speakable schema for voice
- [ ] Entity markup (Organization, Product, etc.)
- [ ] Concise, quotable answer paragraphs
- [ ] Citation-worthy stats and claims

---

### 4. Progress Dashboard

**What:** Track scores and metrics over time in web UI.

**Implementation:**
- Already syncing audits to Supabase ✓
- Add `audit_trends` view for time-series queries
- Add dashboard component showing:
  - Score over time (line chart)
  - Issues open/fixed (stacked bar)
  - Keyword positions (sparklines)
  - Competitor comparison

**API Endpoints:**
```
GET /api/projects/:id/trends?days=30
GET /api/projects/:id/issues/history
GET /api/projects/:id/keywords/history
```

---

## P2: Nice to Have (v0.0.26+)

### 5. Content Generation (`rankcli content`)

```bash
# Generate blog post outline
rankcli content outline --topic "SEO for developers" --keywords "cli,automation"

# Generate full draft
rankcli content draft --outline outline.md --style technical

# Optimize existing content
rankcli content optimize --file blog-post.md --target-keyword "seo automation"
```

### 6. Local SEO (`rankcli local`)

```bash
# Submit to directories
rankcli local submit --nap "Business Name|123 Main St|555-1234"

# Check GBP health
rankcli local gbp check

# Monitor reviews
rankcli local reviews --alert-on-negative
```

---

## Implementation Order

### Week 1: Agentic Fixer (P0)
1. ✅ Write integration tests for `rankcli fix` command
2. ✅ Implement git commit generation
3. ✅ Add `--commit` and `--push` flags
4. ✅ Add `--only` flag for selective fixing
5. ✅ Update upsell logic

### Week 2: Rank Tracking (P0)
1. ✅ Write integration tests for `rankcli track` command
2. ✅ Create Supabase migrations
3. ✅ Implement ValueSERP integration
4. ✅ Add CLI commands (add, status, history, export)
5. ✅ Add tier limits

### Week 3: LLM Optimization (P1)
1. ✅ Extend GEO analyzer with new checks
2. ✅ Add schema generators (FAQ, HowTo, Speakable)
3. ✅ Add Perplexity API integration for testing
4. ✅ Write `rankcli llm` command

### Week 4: Progress Dashboard (P1)
1. ✅ Add audit_trends view to Supabase
2. ✅ Build dashboard API endpoints
3. ✅ Add frontend components
4. ✅ Add keyword sparklines

---

## Success Metrics

- **Agentic fixer:** 50% of users use `--auto` mode
- **Rank tracking:** 100 keywords tracked within 30 days of launch
- **LLM optimization:** 20% lift in AI search visibility for test sites
- **Progress dashboard:** 3+ return visits per user per week

---

## Technical Debt to Address

1. [ ] Extract common CLI patterns into shared utilities
2. [ ] Add E2E tests for full user flows
3. [ ] Improve error messages and recovery
4. [ ] Add telemetry for feature usage (opt-in)

---

## Appendix: HikeSEO Feature Deep-Dive

### Their "Kit" AI Agent
- Onboards by learning about business
- Creates SEO strategy automatically
- Implements changes via JS snippet (Onsite Optimizer)
- Monthly blog content creation
- GBP management
- Directory submissions
- Review tracking
- Monthly reporting with account manager

### Their Pricing
- Single Site: $149/mo ($90/mo annual)
- Multi-site: $299/mo ($180/mo annual)
- 14-day money-back guarantee
- Human account managers included

### Their Integrations
- WordPress, Webflow, Wix, Shopify, Squarespace, Framer, Magento
- (Not GoDaddy due to technical limitations)

### Key Differentiator
They're "done for you" — Kit implements changes without user involvement.
We're "done with you" — CLI empowers developers to own their SEO.
