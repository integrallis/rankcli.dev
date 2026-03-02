# RankCLI Manual Testing Guide

Comprehensive manual testing script covering all user personas and features.

---

## Table of Contents

1. [User Personas Overview](#user-personas-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Part 1: Free Users (No Login)](#part-1-free-users-no-login)
4. [Part 2: Free Registered Users](#part-2-free-registered-users)
5. [Part 3A: Paid Users - Web-Based](#part-3a-paid-users---web-based)
6. [Part 3B: Paid Users - CLI Power Users](#part-3b-paid-users---cli-power-users)
7. [Part 4: GitHub Integration](#part-4-github-integration)
8. [Part 5: MCP Server (AI Assistants)](#part-5-mcp-server-ai-assistants)
9. [Part 6: CI/CD Integration](#part-6-cicd-integration)
10. [Appendix: Test URLs & Data](#appendix-test-urls--data)

---

## User Personas Overview

| Persona | Access Level | Primary Interface | Key Features |
|---------|--------------|-------------------|--------------|
| **Free (No Login)** | Anonymous | Web | Free tools only, 280 checks (limited results shown) |
| **Free Registered** | Account | Web + CLI (limited) | 100 checks, 1 site, 2 domains/month, audit history |
| **Solo ($9/mo)** | Paid | Web + CLI | 3 sites, 280 checks, weekly audits, 5 domains/cycle |
| **Pro ($29/mo)** | Paid | Web + CLI | 10 sites, daily audits, GitHub PRs, Slack alerts, 15 domains/cycle |
| **Agency ($99/mo)** | Paid | Web + CLI | 50 sites, hourly audits, white-label, unlimited domains |

### Feature Matrix by Tier

| Feature | Free | Free Registered | Solo | Pro | Agency |
|---------|------|-----------------|------|-----|--------|
| SEO Checks | 280 (10 shown) | 100 | 280 | 280 | 280 |
| Sites/Projects | 0 | 1 | 3 | 10 | 50 |
| Domains/Cycle | N/A | 2/month | 5 | 15 | Unlimited |
| Audit Schedule | Manual only | Manual only | Weekly | Daily | Hourly |
| GitHub Connect | ❌ | ❌ | ❌ | ✅ | ✅ |
| Auto-Fix PRs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Slack/Discord Alerts | ❌ | ❌ | ❌ | ✅ | ✅ |
| White-Label Reports | ❌ | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ✅ | ✅ | ✅ | ✅ |
| AI Analysis | ❌ | ❌ | ✅ | ✅ | ✅ |
| Keyword Research | ❌ | ❌ | ✅ | ✅ | ✅ |
| Competitor Tracking | ❌ | ❌ | ❌ | 3 competitors | 10 competitors |

---

## Test Environment Setup

### Pre-Testing Checklist

Before starting manual testing, verify these items:

- [ ] Latest code is deployed (check GitHub Actions for recent successful deploy)
- [ ] No stuck audits in database (pending/running >10 min should auto-cleanup on deploy)
- [ ] Test accounts are accessible and in expected state
- [ ] Browser cache cleared or use incognito mode
- [ ] CLI is updated to latest version

### Prerequisites

```bash
# Install CLI globally
npm install -g @rankcli/cli

# Verify installation
rankcli --version
# Expected: 0.0.19 (or current version)

# For MCP testing, also install:
npm install -g @rankcli/mcp-server
```

### Database Health Check (Admin)

If you have database access, run these checks before testing:

```sql
-- Check for stuck audits (should be 0)
SELECT COUNT(*) FROM audits 
WHERE status IN ('pending', 'running') 
AND created_at < NOW() - INTERVAL '10 minutes';

-- Verify schedule_interval_hours is set correctly
SELECT plan_id, features->>'schedule_interval_hours' as interval_hours 
FROM subscription_plans;
-- Expected: solo=168, pro=24, agency=1

-- Clean up stuck audits if any
SELECT cleanup_stuck_audits();
```

### Test URLs (use these throughout testing)

| Purpose | URL | Notes |
|---------|-----|-------|
| **Production Site** | https://rankcli.dev | Our own site |
| **Good SEO Site** | https://example.com | Baseline reference |
| **SPA Site** | Pick a React/Vue SPA | Test JS rendering issues |
| **E-commerce** | Pick a product page | Test structured data |
| **Blog** | Pick an article page | Test content analysis |

### Test Accounts

| Type | Email | Notes |
|------|-------|-------|
| **Free Registered** | Create with `+free` suffix | e.g., `you+free@gmail.com` |
| **Pro Account** | `info@integrallis.com` | Existing Pro account |
| **New Paid** | Create fresh | Test checkout flow |

### Important Timing Constraints

| Plan | Audit Cooldown | Notes |
|------|----------------|-------|
| Free Registered | Manual only | No automatic scheduling |
| Solo | 168 hours (7 days) | Weekly audits |
| Pro | 24 hours | Daily audits |
| Agency | 1 hour | Hourly audits |

⚠️ **Note**: If you hit "Schedule limit reached", you must wait the cooldown period or use a different test project/domain.

---

## Part 1: Free Users (No Login)

### 1.1 Landing Page

**Location:** https://rankcli.dev

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.1.1 | Homepage loads | Navigate to https://rankcli.dev | Page loads with hero, features, pricing sections | ✅ 2026-03-02 |
| 1.1.2 | Hero URL input | Enter URL in hero input, click "Analyze" | Redirects to /free-audit with URL pre-filled | ⚠️ **NOT IMPLEMENTED** - Hero has CTA button only, no URL input |
| 1.1.3 | Navigation links | Click Docs, Pricing, Blog links | Navigate to correct pages | ✅ 2026-03-02 |
| 1.1.4 | Mobile responsive | View on mobile viewport (375px) | Layout adapts, menu collapses | ☐ |
| 1.1.5 | Footer links | Click all footer links | All work, external links open new tab | ✅ 2026-03-02 |

### 1.2 Free Audit Tool

**Location:** https://rankcli.dev/free-audit

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.2.1 | Valid URL audit | Enter `https://rankcli.dev`, submit | Audit runs, shows score 0-100, categories, issues | ✅ 2026-03-02 |
| 1.2.2 | URL without https | Enter `rankcli.dev`, submit | Auto-prepends https://, runs audit | ✅ 2026-03-02 |
| 1.2.3 | Invalid URL | Enter `notaurl`, submit | Shows validation error | ✅ 2026-03-02 |
| 1.2.4 | Loading state | Submit URL | Shows loading spinner during audit | ✅ 2026-03-02 |
| 1.2.5 | Score display | Complete audit | Shows overall score prominently | ✅ 2026-03-02 |
| 1.2.6 | Category breakdown | Complete audit | Shows 7 category scores (Crawlability, OnPage, Content, Performance, Security, Social, AI Readiness) | ✅ 2026-03-02 |
| 1.2.7 | Radar chart | Complete audit | Visual radar chart shows category distribution | ✅ 2026-03-02 |
| 1.2.8 | Issues list | Complete audit | Shows top 10 issues with severity (error/warning/notice) | ✅ 2026-03-02 |
| 1.2.9 | Hidden issues count | Complete audit | Shows "X more issues - sign up to see all" (if total > 10) | ✅ 2026-03-02 |
| 1.2.10 | SERP preview | Complete audit | Shows Google SERP preview with title/description | ✅ 2026-03-02 |
| 1.2.11 | Share results | Click share button | Opens share modal with URL/embed options | ✅ 2026-03-02 (inline buttons: X, LinkedIn, Copy Link - no modal) |
| 1.2.12 | Sign up CTA | Visible after results | Clear CTA to create account for full report | ✅ 2026-03-02 |
| 1.2.13 | Slow site handling | Audit a slow site | Doesn't timeout, shows results eventually | ✅ 2026-03-02 |
| 1.2.14 | Error handling | Audit unreachable URL | Shows helpful error message | ✅ 2026-03-02 |

### 1.3 AI Visibility Checker

**Location:** https://rankcli.dev/tools/ai-visibility

> **Note:** This tool checks if LLMs (ChatGPT, Claude, Gemini, Perplexity) **mention/recommend** your site.
> For **crawler access** checks (robots.txt, GPTBot), use the CLI: `rankcli geo -u <url>`

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.3.1 | AI Visibility Score | Enter URL, submit | Shows AI Visibility Score (0-100) | ✅ 2026-03-02 |
| 1.3.2 | LLM breakdown | Complete analysis | Shows ChatGPT, Claude, Gemini, Perplexity mention status | ✅ 2026-03-02 |
| 1.3.3 | Position & sentiment | Complete analysis | Shows position ranking and sentiment (positive/neutral/negative) | ✅ 2026-03-02 |
| 1.3.4 | Quote extraction | Complete analysis | Shows actual quote/snippet from LLM response | ✅ 2026-03-02 |
| 1.3.5 | Tracking CTA | Complete analysis | Shows "Start Tracking Free" / "View Plans" options | ✅ 2026-03-02 |

### 1.4 ChatGPT Checker

**Location:** https://rankcli.dev/tools/chatgpt-checker

> **Note:** This tool checks if **ChatGPT recommends** your site in its responses.
> For crawler access (GPTBot/robots.txt), use the CLI: `rankcli geo -u <url>`

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.4.1 | Recommendation check | Enter URL, submit | Shows if ChatGPT mentions/recommends your site | ✅ 2026-03-02 |
| 1.4.2 | Position & sentiment | Complete check | Shows position ranking (#1, #2, etc.) and sentiment (positive/neutral/negative) | ✅ 2026-03-02 |
| 1.4.3 | Response preview | Complete check | Shows actual ChatGPT response snippet/quote | ✅ 2026-03-02 |
| 1.4.4 | Other AI models | Complete check | Shows status for Claude, Gemini, Perplexity with link to full report | ✅ 2026-03-02 |
| 1.4.5 | Tracking CTA | Complete check | Shows "Check All AI Models" / "Track Continuously" options | ✅ 2026-03-02 |

### 1.5 OG Image Preview

**Location:** https://rankcli.dev/tools/og-image-preview

> **Note:** URL was corrected from `/tools/og-preview` to `/tools/og-image-preview`

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.5.1 | OG tags extraction | Enter URL, submit | Shows og:title, og:description, og:image | ✅ 2026-03-02 |
| 1.5.2 | Preview cards | Complete extraction | Shows Twitter/Facebook/LinkedIn/Slack previews | ✅ 2026-03-02 |
| 1.5.3 | Missing tags | Test page without OG tags | Clearly indicates what's missing (checkmarks/X icons) | ✅ 2026-03-02 |
| 1.5.4 | Recommendations | Complete extraction | Shows best practices (image size, title length, etc.) | ✅ 2026-03-02 |

### 1.6 Meta Tag Analyzer

**Location:** https://rankcli.dev/tools/meta-tag-analyzer

> **Note:** URL was corrected from `/tools/meta-analyzer` to `/tools/meta-tag-analyzer`

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.6.1 | Overall score | Enter URL, submit | Shows overall meta tag score (0-100) | ✅ 2026-03-02 |
| 1.6.2 | Core meta tags | Complete analysis | Shows title, description with status (good/bad) | ✅ 2026-03-02 |
| 1.6.3 | OG tags | Complete analysis | Shows og:title, og:description, og:image status | ✅ 2026-03-02 |
| 1.6.4 | Technical tags | Complete analysis | Shows canonical, robots, viewport, twitter:card | ✅ 2026-03-02 |

### 1.7 Competitor Analyzer

**Location:** https://rankcli.dev/tools/compare

> **Note:** URL was corrected from `/tools/competitor` to `/tools/compare`

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.7.1 | Compare two sites | Enter your site + competitor | Shows side-by-side scores (X/100 vs Y/100) | ✅ 2026-03-02 |
| 1.7.2 | Category breakdown | Complete analysis | Shows bars for Crawlability, Content, Performance, Security, Social, AI | ✅ 2026-03-02 |
| 1.7.3 | Win/Loss analysis | Complete analysis | Shows "Where You Win" and "Where Competitor Wins" sections | ✅ 2026-03-02 |

### 1.8 Documentation

**Location:** https://rankcli.dev/docs

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.8.1 | Docs page loads | Navigate to /docs | Shows documentation sections | ✅ 2026-03-02 |
| 1.8.2 | Navigation | Click sidebar sections | Smooth scrolling to sections | ✅ 2026-03-02 |
| 1.8.3 | Code examples | View CLI examples | Syntax highlighted, copyable | ✅ 2026-03-02 (no copy buttons) |
| 1.8.4 | GEO section | Navigate to GEO docs | Complete GEO documentation | ✅ 2026-03-02 |
| 1.8.5 | MCP section | Navigate to MCP docs | Complete MCP setup instructions | ✅ 2026-03-02 |

---

## Part 2: Free Registered Users

### 2.1 Signup Flow

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.1.1 | Signup page loads | Navigate to /signup | Shows signup form with OAuth options | ✅ 2026-03-02 |
| 2.1.2 | GitHub OAuth | Click "Continue with GitHub" | Redirects to GitHub, then back to dashboard | ✅ 2026-03-02 (redirect works) |
| 2.1.3 | Google OAuth | Click "Continue with Google" | Redirects to Google, then back to dashboard | ✅ 2026-03-02 (redirect works) |
| 2.1.4 | Email signup | Enter email/password | Account created, verification email sent | ☐ MANUAL |
| 2.1.5 | Email verification | Click link in email | Email verified, redirected to dashboard | ☐ MANUAL |
| 2.1.6 | Duplicate email | Try existing email | Shows "account exists" error | ☐ MANUAL |
| 2.1.7 | Weak password | Enter weak password | Shows password requirements | ☐ MANUAL |

### 2.2 Login Flow

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.2.1 | Login page loads | Navigate to /login | Shows login form with OAuth options | ✅ 2026-03-02 |
| 2.2.2 | Valid credentials | Enter correct email/password | Redirected to dashboard | ☐ MANUAL |
| 2.2.3 | Invalid credentials | Enter wrong password | Shows error message | ✅ 2026-03-02 |
| 2.2.4 | Forgot password | Click "Forgot password" | Shows password reset flow | ✅ 2026-03-02 |
| 2.2.5 | Password reset | Complete reset flow | Able to login with new password | ☐ MANUAL |

### 2.3 Dashboard (Free User)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.3.1 | Dashboard loads | Login, view dashboard | Shows empty state or existing projects | ✅ 2026-03-02 |
| 2.3.2 | Stats display | View dashboard | Shows stats: sites, issues, avg score, audits | ✅ 2026-03-02 |
| 2.3.3 | Add project button | Click "Add Project" | Opens add project modal | ✅ 2026-03-02 |
| 2.3.4 | Add first project | Enter URL, submit | Project created, first audit runs | ✅ 2026-03-02 (2-step wizard) |
| 2.3.5 | Site limit (1) | Try adding second project | Shows upgrade prompt (free = 1 project) | ✅ 2026-03-02 (fixed: commit 883c015) |
| 2.3.6 | Domain limit (2/mo) | Audit 3rd unique domain in a month | Shows "Domain limit reached" error | ☐ MANUAL |
| 2.3.7 | View project | Click project card | Navigates to project detail page | ✅ 2026-03-02 |

### 2.4 Project Page (Free User)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.4.1 | Project page loads | Navigate to project | Shows project info, score, issues | ✅ 2026-03-02 |
| 2.4.2 | Score display | View project | Shows overall score and category breakdown | ✅ 2026-03-02 (radar chart + 6 categories) |
| 2.4.3 | Issues list | View project | Shows all issues (up to 100 checks limit) | ✅ 2026-03-02 (shows after audit) |
| 2.4.4 | Issue details | Click on issue | Shows issue details with description | ☐ MANUAL |
| 2.4.5 | Run audit button | Click "Run Audit" | New audit runs, results update | ✅ 2026-03-02 (button present) |
| 2.4.5a | Audit in progress UI | While audit running | Shows spinner with progress (if SSE connected) | ☐ MANUAL |
| 2.4.5b | Audit completion | Audit finishes | Toast notification, results refresh | ☐ MANUAL |
| 2.4.6 | Audit history | View audit history | Shows past audits with dates/scores | ☐ MANUAL |
| 2.4.7 | Gated features | Try to access paid features | Shows upgrade prompts | ☐ MANUAL |
| 2.4.8 | Connect GitHub | Try "Connect GitHub" | Shows upgrade prompt (Pro feature) | ☐ MANUAL |

### 2.5 Account Page (Free User)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.5.1 | Account page loads | Navigate to /account | Shows account settings | ✅ 2026-03-02 |
| 2.5.2 | Profile info | View profile section | Shows email, name, avatar | ✅ 2026-03-02 |
| 2.5.3 | Current plan | View plan section | Shows "Free" plan with limits | ✅ 2026-03-02 (0/1 sites) |
| 2.5.4 | Upgrade CTA | View upgrade section | Clear upgrade options with pricing | ✅ 2026-03-02 (Solo/Pro/Agency) |
| 2.5.5 | API key | View API section | Can generate/view API key | ✅ 2026-03-02 |
| 2.5.6 | Logout | Click logout | Logged out, redirected to home | ✅ 2026-03-02 |

### 2.6 CLI (Free Registered User)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.6.1 | CLI login | `rankcli login` | Opens browser, completes auth | ☐ |
| 2.6.2 | Whoami | `rankcli whoami` | Shows logged-in user info | ☐ |
| 2.6.3 | Basic audit | `rankcli audit -u https://example.com` | Runs audit with 100 checks (free registered limit) | ☐ |
| 2.6.4 | Upgrade prompt | Complete audit | Shows "Upgrade to unlock X more checks" message | ☐ |
| 2.6.5 | CLI logout | `rankcli logout` | Logs out, confirms | ☐ |

---

## Part 3A: Paid Users - Web-Based

### 3A.1 Checkout Flow

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.1.1 | Pricing page | Navigate to /pricing | Shows all tiers with features | ✅ (tested in 1.x) |
| 3A.1.2 | Monthly/Annual toggle | Toggle billing period | Prices update with annual discount | ☐ MANUAL |
| 3A.1.3 | LTD view | Toggle to Lifetime Deals | Shows LTD options with remaining count | ☐ MANUAL |
| 3A.1.4 | Select Solo plan | Click "Get Started" on Solo | Redirects to checkout | ☐ MANUAL |
| 3A.1.5 | Select Pro plan | Click "Get Started" on Pro | Redirects to checkout | ☐ MANUAL |
| 3A.1.6 | Stripe checkout | Complete checkout | Stripe checkout loads, can enter card | ☐ SKIP (avoid real charges) |
| 3A.1.7 | Successful payment | Complete payment (test card) | Redirected to dashboard, plan upgraded | ☐ SKIP (DB upgrade used) |
| 3A.1.8 | LTD checkout | Select LTD tier | Shows LTD-specific checkout | ☐ MANUAL |
| 3A.1.9 | License count update | Complete LTD purchase | Remaining licenses decrease | ☐ MANUAL |

### 3A.2 Dashboard (Paid User)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.2.1 | Paid dashboard | Login as paid user | Dashboard shows full features | ✅ 2026-03-02 |
| 3A.2.2 | Multiple projects | Add multiple sites (up to plan limit) | All projects created successfully | ✅ 2026-03-02 (2 sites added) |
| 3A.2.3 | AI Visibility Card | View dashboard | Shows AI visibility metrics | ✅ 2026-03-02 (on project page) |
| 3A.2.4 | Widget generator | Click "Generate Widget" | Opens widget customization modal | ☐ MANUAL |

### 3A.3 Project Management (Paid User)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.3.1 | Full audit | Run audit on project | 280+ checks run | ☐ MANUAL (need to run audit) |
| 3A.3.2 | All issues visible | View issues | All issues shown (no "hidden" count) | ✅ 2026-03-02 |
| 3A.3.3 | Issue categories | Filter by category | Filtering works correctly | ☐ MANUAL |
| 3A.3.4 | Issue severity | Filter by severity | Shows errors/warnings/notices | ☐ MANUAL |
| 3A.3.5 | Project settings | Click settings gear | Opens project settings modal | ✅ 2026-03-02 |
| 3A.3.6 | Delete project | Delete a project | Project removed, confirmation shown | ☐ MANUAL |
| 3A.3.7 | Framework detection | View project | Shows detected framework (Next.js, etc.) | ⚠️ needs audit first |

### 3A.4 GitHub Integration (Pro & Agency ONLY)

⚠️ **Note**: GitHub integration is NOT available on Solo plan. Solo users should see an upgrade prompt.

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.4.0 | Solo user blocked | As Solo user, click "Connect GitHub" | Shows upgrade prompt to Pro | ☐ MANUAL |
| 3A.4.1 | Connect GitHub button | As Pro+ user, click "Connect GitHub" | Opens GitHub connection modal | ✅ 2026-03-02 |
| 3A.4.2 | Install GitHub App | Click "Install GitHub App" | Redirects to GitHub App installation | ☐ MANUAL |
| 3A.4.3 | Grant repo access | Select repos in GitHub | App installed with selected repos | ☐ MANUAL |
| 3A.4.4 | Select repository | Choose repo in modal | Repository connected to project | ☐ MANUAL |
| 3A.4.5 | Repo shows connected | View project | Shows connected repo badge | ☐ MANUAL |
| 3A.4.6 | Disconnect repo | Disconnect repository | Repo unlinked from project | ☐ MANUAL |

### 3A.5 Auto-Fix PRs (Pro & Agency ONLY)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.5.1 | Generate Fix button | Click "Generate Fix" on issue | Shows fix preview | ☐ |
| 3A.5.2 | Fix preview | View fix preview | Shows code changes for framework | ☐ |
| 3A.5.3 | Create PR | Click "Create PR" | PR created on GitHub | ☐ |
| 3A.5.4 | PR content | View PR on GitHub | Has proper title, description, co-author | ☐ |
| 3A.5.5 | Multiple fixes | Select multiple issues | Single PR with all fixes | ☐ |
| 3A.5.6 | Dry run | Preview without creating | Shows diff without creating PR | ☐ |

### 3A.6 Audit Throttling & Scheduling

⚠️ **Note**: "Scheduled audits" refers to the MINIMUM time between audits, not automatic execution. Users can run audits manually but must wait the cooldown period.

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.6.1 | Solo cooldown (168h) | Run audit, try again immediately | Shows "Schedule limit reached. Next audit in ~7 days" | ☐ |
| 3A.6.2 | Pro cooldown (24h) | Run audit, try again immediately | Shows "Schedule limit reached. Next audit in ~24 hours" | ☐ |
| 3A.6.3 | Agency cooldown (1h) | Run audit, try again immediately | Shows "Schedule limit reached. Next audit in ~1 hour" | ☐ |
| 3A.6.4 | Cooldown button | While on cooldown | Button shows "Available in Xd Xh Xm" and is disabled | ☐ |
| 3A.6.5 | Cooldown card | While on cooldown | Yellow card shows next available time in local timezone | ☐ |
| 3A.6.6 | Cooldown expired | Wait for cooldown to expire | Button re-enables, can run audit | ☐ |
| 3A.6.7 | Audit history | View history | Shows all past audits with dates/scores | ☐ |
| 3A.6.8 | Score trends | View trends | Shows score changes over time | ☐ |

### 3A.7 Alerts & Notifications (Pro & Agency ONLY)

⚠️ **Note**: Slack/Discord alerts are NOT available on Solo or Free plans.

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.7.0 | Solo user blocked | As Solo user, try to set up alerts | Shows upgrade prompt to Pro | ☐ |
| 3A.7.1 | Email notifications | Enable in settings | Receives email on new issues | ☐ |
| 3A.7.2 | Slack integration | CLI: `rankcli alerts --channel slack` | Prompts for webhook URL | ☐ |
| 3A.7.3 | Discord integration | CLI: `rankcli alerts --channel discord` | Prompts for webhook URL | ☐ |
| 3A.7.4 | Test webhook | CLI: `rankcli alerts --test --webhook <url>` | Sends test notification | ☐ |
| 3A.7.5 | Alert customization | Configure alert types | Only selected alerts fire | ☐ |

### 3A.8 Reports & Export

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.8.1 | Export PDF | Click "Export PDF" | PDF downloads with full report | ☐ |
| 3A.8.2 | Export JSON | Click "Export JSON" | JSON file downloads | ☐ |
| 3A.8.3 | White-label (Agency) | Enable white-label | Reports have custom branding | ☐ |

### 3A.9 Keywords & Content (Paid)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.9.1 | Keywords page | Navigate to /keywords | Shows keyword research interface | ☐ |
| 3A.9.2 | Seed keywords | Enter seed keywords | Generates keyword suggestions | ☐ |
| 3A.9.3 | Search volume | View results | Shows estimated search volume | ☐ |
| 3A.9.4 | Keyword difficulty | View results | Shows KD scores | ☐ |
| 3A.9.5 | Competitor keywords | Enter competitor | Shows competitor keyword gaps | ☐ |

### 3A.10 Account Management (Paid)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3A.10.1 | View subscription | Navigate to account | Shows current plan details | ☐ |
| 3A.10.2 | Usage stats | View usage | Shows limits and current usage | ☐ |
| 3A.10.3 | Upgrade plan | Click upgrade | Shows upgrade options | ☐ |
| 3A.10.4 | Downgrade plan | Click downgrade | Shows confirmation with implications | ☐ |
| 3A.10.5 | Cancel subscription | Click cancel | Shows cancellation flow | ☐ |
| 3A.10.6 | Billing history | View billing | Shows past invoices | ☐ |
| 3A.10.7 | Update payment | Update card | Can update payment method | ☐ |

---

## Part 3B: Paid Users - CLI Power Users

### 3B.1 Authentication

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.1.1 | Browser login | `rankcli login` | Opens browser, authenticates | ☐ MANUAL |
| 3B.1.2 | Token login | `rankcli login --token rankcli_xxx` | Authenticates with API key | ✅ 2026-03-02 |
| 3B.1.3 | Env var auth | `export RANKCLI_API_KEY=xxx` | Commands authenticate automatically | ✅ 2026-03-02 |
| 3B.1.4 | Whoami | `rankcli whoami` | Shows user info and plan | ✅ 2026-03-02 |
| 3B.1.5 | Multiple machines | Login on different machine | Both machines work | ☐ MANUAL |

### 3B.2 Audit Command

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.2.1 | Basic audit | `rankcli audit -u https://example.com` | Full 280+ check audit runs | ✅ 2026-03-02 |
| 3B.2.2 | Console output | Default output | Formatted console output with colors | ✅ 2026-03-02 |
| 3B.2.3 | JSON output | `rankcli audit -u https://example.com -o json` | Valid JSON output | ✅ 2026-03-02 |
| 3B.2.4 | Max pages | `rankcli audit -u https://example.com --max-pages 10` | Crawls up to 10 pages | ✅ 2026-03-02 |
| 3B.2.5 | Check links | `rankcli audit -u https://example.com --check-links` | Includes broken link checking | ☐ MANUAL |
| 3B.2.6 | AI analysis | `rankcli audit -u https://example.com --ai` | AI-enhanced analysis (requires API key) | ☐ MANUAL |
| 3B.2.7 | OpenAI provider | `rankcli audit --ai --ai-provider openai` | Uses OpenAI for AI analysis | ☐ MANUAL |
| 3B.2.8 | Anthropic provider | `rankcli audit --ai --ai-provider anthropic` | Uses Anthropic for AI analysis | ☐ MANUAL |
| 3B.2.9 | Score output | Complete audit | Shows score 0-100 prominently | ✅ 2026-03-02 |
| 3B.2.10 | Category scores | Complete audit | Shows all 7 category scores | ✅ 2026-03-02 |
| 3B.2.11 | Issues table | Complete audit | Shows issues in formatted table | ✅ 2026-03-02 |
| 3B.2.12 | Error handling | Audit unreachable URL | Shows clear error message | ✅ 2026-03-02 |

### 3B.3 GEO Command

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.3.1 | Basic GEO | `rankcli geo -u https://example.com` | Shows AI crawler analysis | ✅ 2026-03-02 |
| 3B.3.2 | Crawler status | Complete GEO | Shows GPTBot, ClaudeBot, PerplexityBot, Google-Extended | ✅ 2026-03-02 |
| 3B.3.3 | robots.txt analysis | Complete GEO | Shows what robots.txt allows/blocks | ✅ 2026-03-02 |
| 3B.3.4 | JS rendering | Complete GEO | Indicates SSR vs CSR | ✅ 2026-03-02 |
| 3B.3.5 | LLM signals | Complete GEO | Shows content structure analysis | ✅ 2026-03-02 |
| 3B.3.6 | JSON output | `rankcli geo -u https://example.com -o json` | Valid JSON output | ✅ 2026-03-02 |

### 3B.4 Apply Command (Auto-Fix)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.4.1 | Dry run | `rankcli apply -u https://mysite.com --dry-run` | Shows fixes without applying | ✅ 2026-03-02 |
| 3B.4.2 | Framework detection | Run apply | Detects framework (Next.js, etc.) | ☐ |
| 3B.4.3 | Fix preview | View dry run | Shows code diffs for each fix | ☐ |
| 3B.4.4 | Interactive apply | `rankcli apply -u https://mysite.com` | Prompts for confirmation | ☐ |
| 3B.4.5 | Auto apply | `rankcli apply -u https://mysite.com --auto` | Applies without prompts | ☐ |
| 3B.4.6 | Git changes | After apply | Creates proper git changes | ☐ |
| 3B.4.7 | Multiple frameworks | Test with Next.js, Astro, Rails | Framework-specific fixes | ☐ |

### 3B.5 Keywords Command

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.5.1 | Basic keywords | `rankcli keywords -u https://mysite.com` | Interactive keyword research | ☐ |
| 3B.5.2 | Quick mode | `rankcli keywords -u https://mysite.com --quick` | Skips prompts, uses defaults | ☐ |
| 3B.5.3 | Seed keywords | `rankcli keywords -u https://mysite.com -s "seo,tools"` | Uses provided seeds | ☐ |
| 3B.5.4 | Auto-extract | `rankcli keywords -u https://mysite.com --auto` | Extracts seeds from page | ☐ |
| 3B.5.5 | AI keywords | `rankcli keywords -u https://mysite.com --ai` | GPT-4 enhanced analysis | ☐ |
| 3B.5.6 | Competitor mode | `rankcli keywords -u https://mysite.com --competitor -c competitor.com -s seo` | Gap analysis | ☐ |
| 3B.5.7 | Local processing | `rankcli keywords -u https://mysite.com --ai --local` | Forces local processing | ☐ |

### 3B.6 Content Command

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.6.1 | Full analysis | `rankcli content -u https://mysite.com/blog` | Complete content analysis | ☐ |
| 3B.6.2 | With keyword | `rankcli content -u https://mysite.com/blog -k "seo tips"` | Keyword-targeted analysis | ☐ |
| 3B.6.3 | Readability mode | `rankcli content -u https://mysite.com --mode readability` | Readability scores only | ☐ |
| 3B.6.4 | Headline analysis | `rankcli content --headline "10 SEO Tips"` | Analyzes headline quality | ☐ |
| 3B.6.5 | Snippet mode | `rankcli content -u https://mysite.com --mode snippet` | Featured snippet analysis | ☐ |
| 3B.6.6 | Density mode | `rankcli content -u https://mysite.com --mode density` | Keyword density analysis | ☐ |

### 3B.7 Intent Command

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.7.1 | Intent classification | `rankcli intent "buy running shoes"` | Classifies as transactional | ☐ |
| 3B.7.2 | Informational intent | `rankcli intent "how to tie shoes"` | Classifies as informational | ☐ |
| 3B.7.3 | Navigational intent | `rankcli intent "nike website"` | Classifies as navigational | ☐ |

### 3B.8 Setup Command

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.8.1 | Setup wizard | `rankcli setup --all` | Interactive setup for all integrations | ☐ |
| 3B.8.2 | GA4 setup | `rankcli setup --ga4 G-XXXXXXXXXX` | Configures Google Analytics | ☐ |
| 3B.8.3 | GSC setup | `rankcli setup --gsc <code>` | Configures Search Console | ☐ |
| 3B.8.4 | GitHub Action | `rankcli setup --github-action` | Creates workflow file | ☐ |
| 3B.8.5 | Custom schedule | `rankcli setup --github-action --schedule daily` | Sets daily schedule | ☐ |
| 3B.8.6 | GSC instructions | `rankcli gsc-setup` | Shows GSC API setup steps | ☐ |

### 3B.9 Init Command

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.9.1 | Interactive init | `rankcli init` | Prompts for project config | ☐ |
| 3B.9.2 | Default init | `rankcli init -y` | Uses defaults, no prompts | ☐ |
| 3B.9.3 | Config file | After init | Creates rankcli.config.js or similar | ☐ |

### 3B.10 Analyze Command

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3B.10.1 | Codebase analysis | `rankcli analyze` | AI analyzes local codebase | ☐ |
| 3B.10.2 | Verbose mode | `rankcli analyze -v` | Shows detailed output | ☐ |
| 3B.10.3 | SEO opportunities | Complete analysis | Lists SEO improvement opportunities | ☐ |

---

## Part 4: GitHub Integration

### 4.1 GitHub App Installation

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.1.1 | App install page | Visit GitHub App install URL | Shows app permissions | ☐ |
| 4.1.2 | Select repositories | Choose repos during install | App installed on selected repos | ☐ |
| 4.1.3 | All repositories | Select "All repositories" | App installed on all repos | ☐ |
| 4.1.4 | Installation webhook | Complete install | Webhook fires to our backend | ☐ |

### 4.2 Webhook Events

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.2.1 | Push event | Push to connected repo | Audit triggers if SEO files changed | ☐ |
| 4.2.2 | PR opened | Open PR in repo | PR comment with audit results | ☐ |
| 4.2.3 | Deployment success | Vercel/Netlify deployment | Post-deployment audit runs | ☐ |
| 4.2.4 | Issue command | Comment `/rankcli audit` | Audit runs, posts results | ☐ |

### 4.3 Auto-Fix PR Creation

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.3.1 | Single issue fix | Generate fix for one issue | PR with single fix | ☐ |
| 4.3.2 | Multiple issues | Generate fix for multiple | PR with multiple commits | ☐ |
| 4.3.3 | PR title | View created PR | Follows convention: `fix(seo): description` | ☐ |
| 4.3.4 | PR description | View created PR | Detailed description with issue refs | ☐ |
| 4.3.5 | Co-author | View PR | Includes RankCLI as co-author | ☐ |
| 4.3.6 | Framework-specific | Test Next.js repo | Changes are Next.js-appropriate | ☐ |
| 4.3.7 | Framework-specific | Test Astro repo | Changes are Astro-appropriate | ☐ |

### 4.4 GitHub Action

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.4.1 | Action marketplace | Search for rankcli | Action listed and documented | ☐ |
| 4.4.2 | Basic workflow | Add workflow to repo | Action runs on push/PR | ☐ |
| 4.4.3 | PR comment | Run on PR | Posts comment with results | ☐ |
| 4.4.4 | Score threshold | Set threshold, score below | Workflow fails | ☐ |
| 4.4.5 | Score threshold | Set threshold, score above | Workflow passes | ☐ |
| 4.4.6 | Auto-fix PR | Enable create-pr | Creates fix PR automatically | ☐ |
| 4.4.7 | Slack notification | Configure webhook | Sends Slack alert | ☐ |
| 4.4.8 | GitHub summary | View workflow | Shows summary in Actions tab | ☐ |
| 4.4.9 | JSON output | View outputs | outputs.report-json is valid JSON | ☐ |

---

## Part 5: MCP Server (AI Assistants)

### 5.1 Installation

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.1.1 | npm install | `npm install -g @rankcli/mcp-server` | Installs successfully | ✅ 2026-03-02 |
| 5.1.2 | npx run | `npx @rankcli/mcp-server` | Server starts | ✅ 2026-03-02 |

### 5.2 Claude Desktop Integration

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.2.1 | Config file | Add to claude_desktop_config.json | Config accepted | ☐ |
| 5.2.2 | Claude restart | Restart Claude Desktop | MCP server loads | ☐ |
| 5.2.3 | Tools available | Check Claude tools | Shows 13 SEO tools | ☐ |

### 5.3 MCP Tools

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.3.1 | seo_analyze | Ask Claude to analyze site | Full audit results | ☐ |
| 5.3.2 | seo_geo_check | Ask about AI visibility | GEO analysis results | ☐ |
| 5.3.3 | seo_robots_ai | Ask about robots.txt | AI crawler analysis | ☐ |
| 5.3.4 | seo_generate_robots | Ask to generate robots.txt | AI-friendly robots.txt | ☐ |
| 5.3.5 | seo_core_web_vitals | Ask about CWV | LCP, CLS, INP, TTFB | ☐ |
| 5.3.6 | seo_structured_data | Ask about schema | JSON-LD validation | ☐ |
| 5.3.7 | seo_generate_schema | Ask to generate schema | Schema template | ☐ |
| 5.3.8 | seo_security_headers | Ask about security | Security header grades | ☐ |
| 5.3.9 | seo_generate_security_headers | Ask to generate headers | Recommended headers | ☐ |
| 5.3.10 | seo_images | Ask about images | Image optimization analysis | ☐ |
| 5.3.11 | seo_internal_links | Ask about links | Internal linking analysis | ☐ |
| 5.3.12 | seo_mobile | Ask about mobile | Mobile SEO analysis | ☐ |
| 5.3.13 | seo_ai_crawlers | Ask about AI crawlers | Crawler reference info | ☐ |

---

## Part 6: CI/CD Integration

### 6.1 Environment Variables

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 6.1.1 | RANKCLI_API_KEY | Set in CI | Commands authenticate | ☐ |
| 6.1.2 | OPENAI_API_KEY | Set for AI features | AI analysis works | ☐ |
| 6.1.3 | ANTHROPIC_API_KEY | Set for AI features | AI analysis works with Anthropic | ☐ |

### 6.2 CI Pipeline Integration

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 6.2.1 | GitHub Actions | Add audit step | Audit runs in CI | ☐ |
| 6.2.2 | GitLab CI | Add audit job | Audit runs in GitLab | ☐ |
| 6.2.3 | Circle CI | Add audit step | Audit runs in Circle | ☐ |
| 6.2.4 | JSON parsing | `jq '.issues | length'` | Can parse JSON output | ☐ |
| 6.2.5 | Exit codes | Audit with errors | Non-zero exit on critical errors | ☐ |
| 6.2.6 | Preview URLs | Audit Vercel preview | Works with dynamic URLs | ☐ |

### 6.3 Vercel Integration

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 6.3.1 | Deployment hook | Configure deployment_status trigger | Audit runs after deploy | ☐ |
| 6.3.2 | Preview URL | Use deployment target_url | Audits preview deployment | ☐ |
| 6.3.3 | Production only | Filter for production | Only audits production | ☐ |

### 6.4 Netlify Integration

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 6.4.1 | Build plugin | Install Netlify plugin | Audit runs post-build | ☐ |
| 6.4.2 | Deploy preview | Audit deploy preview | Works with preview URLs | ☐ |

---

## Appendix: Test URLs & Data

### Recommended Test Sites

| Type | URL | Why |
|------|-----|-----|
| Well-optimized | https://web.dev | Good SEO baseline |
| E-commerce | (pick one) | Test product schema |
| Blog/Article | (pick one) | Test article schema |
| SPA/React | (pick one) | Test JS rendering issues |
| Poor SEO | (pick one) | Verify issue detection |

### Test Stripe Cards

| Card Number | Result |
|-------------|--------|
| 4242424242424242 | Success |
| 4000000000000002 | Declined |
| 4000002500003155 | Requires authentication |

### API Key Format

- Pattern: `rankcli_` + 32 alphanumeric characters
- Example: `rankcli_abc123def456ghi789jkl012mno345pq`

### Issue Codes Reference

Common issue codes to verify detection:

| Code | Description |
|------|-------------|
| META_DESC_MISSING | No meta description |
| TITLE_MISSING | No title tag |
| H1_MISSING | No H1 tag |
| CANONICAL_MISSING | No canonical URL |
| VIEWPORT_MISSING | No viewport meta |
| SITEMAP_MISSING | No sitemap.xml |
| ROBOTS_MISSING | No robots.txt |
| OG_TAGS_MISSING | No Open Graph tags |
| IMG_ALT_MISSING | Images missing alt text |
| HTTPS_REDIRECT_MISSING | No HTTP → HTTPS redirect |

---

## Testing Checklist Summary

### Before Release

- [ ] All Part 1 (Free) tests pass
- [ ] All Part 2 (Free Registered) tests pass
- [ ] All Part 3A (Paid Web) tests pass
- [ ] All Part 3B (Paid CLI) tests pass
- [ ] All Part 4 (GitHub) tests pass
- [ ] All Part 5 (MCP) tests pass
- [ ] All Part 6 (CI/CD) tests pass

### Quick Smoke Test

For rapid validation, run these critical paths:

1. [x] Free audit works: `/free-audit` → enter URL → get results ✅ 2026-03-02
2. [ ] Signup works: Create account → land on dashboard  
3. [ ] Project creation works: Add project → first audit runs
4. [x] CLI works: `rankcli audit -u https://example.com` ✅ 2026-03-02
5. [x] GEO works: `rankcli geo -u https://example.com` ✅ 2026-03-02
6. [ ] Paid checkout works: Select plan → complete payment
7. [ ] Schedule limit works: Run audit → try again → see cooldown message with local time
8. [ ] GitHub PR works (Pro+): Connect repo → create fix PR
9. [ ] MCP works: Claude can run `seo_analyze`

### Critical Bug Checks

These are issues that have occurred before - verify they're fixed:

1. [ ] HTTPS detection: Audit `https://redis.io` → should NOT show "Page not served over HTTPS"
2. [ ] Schedule limit dates: Error message shows local timezone (e.g., "Feb 28, 2026, 3:00 PM"), NOT ISO format
3. [ ] Stuck audits: No audits stuck in "pending" or "running" state for >10 minutes
4. [ ] Pro schedule: Pro users get 24h cooldown, NOT 168h (weekly)

---

## Known Issues & Edge Cases

### Schedule Limit Edge Cases
- If an audit fails (e.g., site unreachable), it does NOT count against the schedule limit
- The schedule limit is per-project, not per-domain
- Dates shown in schedule limit messages should display in user's local timezone

### GitHub Integration Edge Cases
- If GitHub App is uninstalled, reconnection requires re-authentication
- PRs are created with `seo-fixes` branch name - may conflict if branch already exists
- Only public and private repos where the App is installed are accessible

### Rate Limits
- Free audit tool: 10 requests per IP per hour
- API: Varies by plan (see API documentation)

### Browser Compatibility
- Minimum supported: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- SSE for real-time updates requires stable connection

---

## Test Run Log

### 2026-03-02 - Automated Browser + CLI Testing (BSBot)

**Method:** Playwright headless Chromium + CLI execution

**Summary:** 24 tests executed, 21 passed, 3 failed

**Passed:**
- 1.1.1 Homepage loads ✅
- 1.1.3 Navigation links ✅
- 1.2.1-1.2.10 Free audit (full flow with results) ✅
- 1.3.1 AI Visibility Checker ✅
- 1.4.1 ChatGPT Checker ✅
- 1.8.1 Docs page ✅
- 2.1.1 Signup page loads ✅
- 2.2.1 Login page loads ✅
- 3B.1.4 CLI whoami ✅
- 3B.2.1-3B.2.11 CLI audit (all output formats) ✅
- 3B.3.1-3B.3.5 CLI GEO command ✅
- 3B.4.1 CLI apply --dry-run ✅
- 5.1.1-5.1.2 MCP server install/start ✅

**Failed (BUGS):**
- 1.5.1 OG Preview → **Page renders blank** (route exists, component broken)
- 1.6.1 Meta Analyzer → **Page renders blank**
- 1.7.1 Competitor Analyzer → **Page renders blank**

**Notes:**
- All 3 broken pages return HTTP 200 but render empty content
- Free audit UI works perfectly: score, radar chart, SERP preview, issues list
- CLI v0.0.19 fully functional

---

*Last Updated: 2026-03-02*
*Version: 1.2.0*
