# SEO Autopilot: Technical Specification

> Fast, automated, event-driven SEO for developers.

---

## Core Architecture

### Backend: Supabase

All backend services hosted on Supabase:

```
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  PostgreSQL │  │    Auth     │  │    Edge Functions       │ │
│  │  (Database) │  │   (Users)   │  │    (API endpoints)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Realtime   │  │   Storage   │  │    pg_cron              │ │
│  │  (Events)   │  │   (Assets)  │  │    (Scheduled jobs)     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why Supabase:**

- PostgreSQL with `pg_cron` for scheduled jobs
- Edge Functions for API endpoints
- Realtime subscriptions for event-driven updates
- Auth for user management
- Storage for generated assets
- Free tier for dogfooding

### Agentic AI System

Declarative agent configuration - just a model + environment:

```yaml
# agents/seo-analyzer.yaml
name: seo-analyzer
model: claude-sonnet-4-20250514
temperature: 0.1

tools:
  - crawl_page
  - analyze_meta
  - check_schema
  - get_lighthouse_score
  - search_keywords

system: |
  You are an SEO analyst. Given a URL or codebase:
  1. Crawl and analyze the content
  2. Identify SEO issues with severity
  3. Generate specific fixes with code
  4. Return structured JSON output

output_schema:
  type: object
  properties:
    score:
      type: integer
    issues:
      type: array
      items:
        type: object
        properties:
          severity: { enum: [critical, warning, info] }
          category: { type: string }
          message: { type: string }
          fix:
            type: object
            properties:
              file: { type: string }
              before: { type: string }
              after: { type: string }
```

**Agent Runtime:**

```typescript
// Simple agent executor
const agent = await loadAgent('seo-analyzer.yaml');
const result = await agent.run({
  url: 'https://my-site.com',
  codebase: '/path/to/project'
});
```

**Environment:**

```env
# .env - that's it
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

---

## Timeline: Minutes, Not Months

### Minute 0-1: Install & Init

```bash
npx seo-autopilot init
```

**What happens:**

- Detects framework (Next.js, Astro, etc.)
- Reads package.json, README
- Creates `.seo-autopilot.yaml` config
- Connects to Supabase (creates project record)

### Minute 1-3: Full Analysis

```bash
seo analyze
```

**What happens:**

- AI crawls all pages (parallel)
- Extracts all meta tags, headings, links
- Runs Lighthouse on key pages
- Identifies all SEO issues
- Generates fix code for each issue

**Output:**

```
Analysis complete in 47 seconds.

Score: 34/100

Critical (fix now):
  ❌ Missing meta descriptions (8 pages)
  ❌ No sitemap.xml
  ❌ Missing schema.org markup

Warnings:
  ⚠️ Title tags too generic (3 pages)
  ⚠️ Images missing alt text (12 images)
  ⚠️ No canonical URLs

Ready to apply 23 fixes. Continue? [Y/n]
```

### Minute 3-5: Apply All Fixes

```bash
seo apply
```

**What happens:**

- Generates all code changes
- Creates single PR with all fixes
- PR includes before/after for each change
- CI runs to validate changes

**That's it. Full SEO audit and fixes in 5 minutes.**

### Minute 5+: Continuous Automation

Now the system runs on autopilot:

| Trigger | Action | Frequency |
|---------|--------|-----------|
| Git push | Audit changed pages | Every push |
| Cron | Full site audit | Daily |
| Cron | Check rankings | Daily |
| Ranking drop | Alert + suggest fix | Real-time |
| New competitor page | Analyze + alert | Weekly |
| GSC data update | Process + insights | Daily |

---

## Event-Driven Architecture

### Events (Supabase Realtime)

```sql
-- All actions are events
CREATE TABLE seo.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES seo.projects(id),
    type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event types:
-- 'audit.started', 'audit.completed'
-- 'ranking.changed', 'ranking.dropped'
-- 'fix.proposed', 'fix.applied'
-- 'tool.generated', 'tool.deployed'
-- 'alert.triggered'
```

### Event Handlers (Edge Functions)

```typescript
// supabase/functions/handle-ranking-drop/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const { record } = await req.json()

  // Ranking dropped more than 5 positions
  if (record.previous_position - record.position > 5) {
    // Trigger analysis agent
    await analyzeRankingDrop(record)

    // Create alert
    await createAlert({
      type: 'ranking_drop',
      keyword: record.keyword,
      from: record.previous_position,
      to: record.position
    })
  }
})
```

### Scheduled Jobs (pg_cron)

```sql
-- Daily rank check at 6 AM UTC
SELECT cron.schedule(
  'daily-rank-check',
  '0 6 * * *',
  $$SELECT seo.check_all_rankings()$$
);

-- Daily GSC sync at 7 AM UTC
SELECT cron.schedule(
  'daily-gsc-sync',
  '0 7 * * *',
  $$SELECT seo.sync_search_console()$$
);

-- Weekly competitor analysis on Sundays
SELECT cron.schedule(
  'weekly-competitor-scan',
  '0 8 * * 0',
  $$SELECT seo.analyze_competitors()$$
);
```

---

## Agent Definitions

All agents are YAML files with a model and tools:

### 1. Site Analyzer Agent

```yaml
# agents/site-analyzer.yaml
name: site-analyzer
model: claude-sonnet-4-20250514
max_tokens: 4096

tools:
  - name: crawl_url
    description: Fetch and parse a URL
  - name: run_lighthouse
    description: Run Lighthouse audit
  - name: extract_schema
    description: Extract JSON-LD schema
  - name: check_robots
    description: Check robots.txt
  - name: check_sitemap
    description: Check sitemap.xml

prompt: |
  Analyze {{url}} for SEO issues.

  Return JSON with:
  - score (0-100)
  - issues[] with severity, category, message, fix
  - recommendations[] for improvements
```

### 2. Content Optimizer Agent

```yaml
# agents/content-optimizer.yaml
name: content-optimizer
model: claude-sonnet-4-20250514

tools:
  - name: get_serp
    description: Get top 10 results for keyword
  - name: analyze_content
    description: Analyze page content
  - name: suggest_improvements
    description: Generate content improvements

prompt: |
  Optimize content at {{url}} for keyword "{{keyword}}".

  Analyze top-ranking competitors and suggest:
  - Title improvements
  - Meta description improvements
  - Content gaps to fill
  - Internal linking opportunities
```

### 3. Tool Generator Agent

```yaml
# agents/tool-generator.yaml
name: tool-generator
model: claude-sonnet-4-20250514
max_tokens: 8192

tools:
  - name: detect_framework
    description: Detect project framework
  - name: generate_component
    description: Generate framework-specific code
  - name: add_schema
    description: Add JSON-LD schema
  - name: create_pr
    description: Create GitHub PR

prompt: |
  Generate a free tool for "{{keyword}}" in {{framework}}.

  The tool should:
  - Be a single-page component
  - Include proper meta tags for the keyword
  - Have JSON-LD schema
  - Include a CTA for the main product

  Return the complete component code.
```

### 4. Fix Generator Agent

```yaml
# agents/fix-generator.yaml
name: fix-generator
model: claude-sonnet-4-20250514

tools:
  - name: read_file
    description: Read file from codebase
  - name: detect_framework
    description: Detect framework conventions

prompt: |
  Generate a fix for this SEO issue:

  Issue: {{issue.message}}
  Category: {{issue.category}}
  File: {{issue.file}}
  Current content: {{issue.current}}

  Return the exact code change needed for {{framework}}.
```

---

## Project Structure

```
seo-autopilot/
├── .env                          # API keys only
├── agents/                       # Agent YAML definitions
│   ├── site-analyzer.yaml
│   ├── content-optimizer.yaml
│   ├── tool-generator.yaml
│   └── fix-generator.yaml
├── packages/
│   ├── cli/                      # CLI tool
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── commands/
│   ├── agent-runtime/            # Agent executor
│   │   ├── package.json
│   │   └── src/
│   │       ├── loader.ts         # Load YAML agents
│   │       ├── executor.ts       # Run agents
│   │       └── tools/            # Tool implementations
│   └── supabase/                 # Supabase config
│       ├── migrations/           # Database migrations
│       └── functions/            # Edge functions
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── functions/
│       ├── audit/
│       ├── rank-check/
│       └── handle-events/
└── turbo.json
```

---

## Database Schema (Supabase)

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    domain TEXT,
    github_repo TEXT,
    framework TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keywords with tracking
CREATE TABLE keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    search_volume INT,
    difficulty INT,
    current_position INT,
    previous_position INT,
    best_position INT,
    last_checked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, keyword)
);

-- Ranking history (time-series)
CREATE TABLE rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    position INT,
    url TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast time-series queries
CREATE INDEX idx_rankings_keyword_time ON rankings(keyword_id, recorded_at DESC);

-- Audits
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    score INT,
    issues JSONB DEFAULT '[]',
    lighthouse JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixes (proposed and applied)
CREATE TABLE fixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    audit_id UUID REFERENCES audits(id),
    issue_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    file_path TEXT,
    before_code TEXT,
    after_code TEXT,
    pr_url TEXT,
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events for event-driven processing
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime on events table
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users can access own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own keywords" ON keywords
    FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Similar policies for other tables...
```

---

## CLI Commands

```bash
# Initialize (30 seconds)
seo init                          # Detect framework, create config

# Analyze (1-2 minutes)
seo analyze                       # Full SEO analysis
seo analyze --url https://...     # Analyze specific URL

# Fix (instant)
seo apply                         # Apply all pending fixes
seo apply --auto                  # Auto-approve (for CI)
seo fix <issue-id>                # Fix specific issue

# Generate (1-2 minutes)
seo generate tool "calculator"    # Generate a free tool
seo generate sitemap              # Generate sitemap.xml
seo generate schema               # Generate JSON-LD schema

# Monitor
seo status                        # Current SEO status
seo rank                          # Check keyword rankings
seo rank --keyword "my keyword"   # Check specific keyword

# CI/CD
seo ci                            # Run in CI mode (exit codes)
seo validate                      # Validate config
```

---

## GitHub Action

```yaml
name: SEO
on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM

jobs:
  seo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: seo-autopilot/action@v1
        with:
          supabase-url: ${{ secrets.SUPABASE_URL }}
          supabase-key: ${{ secrets.SUPABASE_KEY }}
          anthropic-key: ${{ secrets.ANTHROPIC_API_KEY }}

          # Fail if score drops
          fail-on-regression: true

          # Auto-create fix PRs
          auto-fix: true
```

---

## Automation Flows

### Flow 1: On Push

```
Push to main
    │
    ▼
Audit changed files
    │
    ▼
Compare to previous audit
    │
    ├─── Score improved ──► Log success
    │
    └─── Score dropped ──► Create issue + suggest fixes
```

### Flow 2: Daily Rank Check

```
6 AM UTC (cron)
    │
    ▼
Check all tracked keywords
    │
    ▼
Compare to previous positions
    │
    ├─── Position improved ──► Log + celebrate
    │
    ├─── Position stable ──► Continue
    │
    └─── Position dropped ──► Trigger analysis agent
                                    │
                                    ▼
                              Identify cause
                                    │
                                    ▼
                              Suggest action
                                    │
                                    ▼
                              Create alert/PR
```

### Flow 3: Tool Generation

```
seo generate tool "invoice calculator"
    │
    ▼
Research keyword (volume, difficulty)
    │
    ▼
Analyze top-ranking tools
    │
    ▼
Generate component code
    │
    ▼
Add meta tags + schema
    │
    ▼
Create PR
    │
    ▼
Track performance
```

---

## Environment Variables

That's it. Just these:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (auto-configured on init)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Optional - for BYOK users
OPENAI_API_KEY=sk-...
SERPAPI_KEY=...
```

---

## Pricing (Simplified)

### Free

- CLI local analysis (no cloud)
- 1 project
- Manual rank checks

### Pro - $15/month

- Unlimited projects
- Daily automated rank checks
- Event-driven alerts
- GitHub Action
- Tool generation (3/month)

### Team - $49/month

- Everything in Pro
- Unlimited tool generation
- Competitor tracking
- API access
- Slack alerts

---

## Week 1 Deliverables

| Day | Deliverable |
|-----|-------------|
| 1 | Supabase project + schema deployed |
| 2 | Agent runtime (load YAML, execute) |
| 3 | `seo init` + `seo analyze` commands |
| 4 | `seo apply` + fix generation |
| 5 | GitHub Action (basic) |
| 6 | `seo generate tool` command |
| 7 | End-to-end test on real project |

**By end of Week 1:** Full working product that can:

1. Analyze any codebase in < 2 minutes
2. Generate and apply fixes automatically
3. Run in CI/CD on every push
4. Generate free marketing tools
5. Track keywords and alert on changes

---

## What This Is NOT

- ❌ A dashboard you have to check
- ❌ A tool that gives you "insights" without action
- ❌ Something that takes weeks to show value
- ❌ A manual process disguised as automation
- ❌ Enterprise software with 90-day implementations

## What This IS

- ✅ CLI that works in 5 minutes
- ✅ AI that proposes AND executes
- ✅ Event-driven automation
- ✅ Measurable results in days, not months
- ✅ Infrastructure that runs itself
