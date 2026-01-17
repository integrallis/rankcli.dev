# Project Goals

## Mission

Build a developer-first SEO automation tool that:
1. Works in 5 minutes, not 90 days
2. Does the work, doesn't just report problems
3. Fits into developer workflows (CLI, git, CI/CD)
4. Costs $15/month (10x cheaper than competitors)

## Immediate Goal

**Build a working CLI that can analyze and fix SEO on animerm.ai**

animerm.ai is a real SaaS (https://animerm.ai) with zero SEO. It's the perfect test case.

### What animerm.ai Is

- **Product**: Animate Mermaid diagrams with Keynote-style controls
- **Stack**: React + TypeScript + Vite + Tailwind + Supabase
- **URL**: https://animerm.ai (production), http://localhost:9000 (local)
- **Repo**: `test_repos/animerm.ai/`

### What animerm.ai Needs (SEO-wise)

1. **Meta Tags**
   - Title: "animerm.ai - Animate Mermaid Diagrams with Keynote-Style Controls"
   - Description: Compelling, keyword-rich, 150-160 chars
   - Open Graph tags for social sharing
   - Twitter Card tags

2. **Schema.org Markup**
   - SoftwareApplication schema
   - Organization schema
   - WebSite schema with search action

3. **Technical SEO**
   - sitemap.xml
   - robots.txt
   - Canonical URLs
   - Proper heading hierarchy (single H1 per page)

4. **Performance**
   - Image optimization
   - Lazy loading
   - Core Web Vitals

5. **Content**
   - Alt text on all images
   - Descriptive link text
   - Structured FAQ section

## CLI Commands to Build

### `seo init <path>`

Initialize SEO Autopilot in a project:
- Detect framework (Vite, Next.js, Astro, etc.)
- Create `.seo-autopilot.yaml` config
- Identify routes/pages
- Connect to Supabase (optional, for tracking)

### `seo analyze [--url <url>]`

Run full SEO analysis:
- Crawl all pages
- Check meta tags, headings, schema
- Run Lighthouse for performance/SEO scores
- Generate report with:
  - Overall score (0-100)
  - Issues by severity (critical, warning, info)
  - Specific fixes for each issue

### `seo apply [--auto]`

Apply fixes:
- Generate code changes
- Create git commits
- Or create PR if in GitHub repo

### `seo status`

Show current SEO status:
- Last audit score
- Pending fixes
- Keyword rankings (if tracking enabled)

## Technical Approach

### Agent-Based Architecture

Use YAML-defined agents (in `agents/`) with:
- Model configuration
- Tool definitions
- System prompts with SEO best practices
- Output schemas

### Tool Implementations

Build tools for agents to use:
- `crawl_url` - Fetch and parse HTML
- `run_lighthouse` - Run Lighthouse audit
- `extract_meta` - Get all meta tags
- `check_schema` - Find JSON-LD
- `analyze_headings` - Check H1/H2/H3 structure
- `read_file` / `write_file` - Modify codebase

### Framework Detection

Detect and handle:
- **Vite + React**: Modify `index.html`, add components
- **Next.js (App Router)**: Use metadata exports
- **Next.js (Pages)**: Use Head component
- **Astro**: Use frontmatter and BaseHead

## Success Metrics

### Week 1 Success

- [ ] `seo init` works on animerm.ai
- [ ] `seo analyze` generates accurate report
- [ ] `seo apply` creates valid commits
- [ ] animerm.ai SEO score goes from ~20 to 80+

### Month 1 Success

- [ ] CLI published to npm
- [ ] Works on 5 different frameworks
- [ ] GitHub Action available
- [ ] 10 beta users testing

## Constraints

- **Keep it simple**: No over-engineering
- **Ship fast**: Working code > perfect architecture
- **Test on real projects**: animerm.ai is the validation
- **Vite-first**: animerm.ai uses Vite, so that's the priority framework

## Environment

```bash
# .env contains:
ANTHROPIC_API_KEY=...  # For Claude API (agent execution)
OPENAI_API_KEY=...     # Available as fallback

# Supabase (optional, for tracking)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

## References

- `docs/CONSOLIDATED_PLAN.md` - Full technical spec
- `agents/*.yaml` - Agent definitions
- `test_repos/animerm.ai/` - Test target
- `test_repos/animerm.ai/ui/CLAUDE.md` - animerm.ai context
