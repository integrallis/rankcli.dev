# SEO Autopilot UX Flow

## Overview

This document describes the complete user experience flow for SEO Autopilot, from discovery through ongoing monitoring.

---

## 1. Discovery & Lead Generation

```
┌─────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE (/)                          │
├─────────────────────────────────────────────────────────────────┤
│  Hero: "SEO that runs while you code."                          │
│  Terminal animation showing CLI commands                        │
│                                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │  Try Free Audit  [Enter URL] [Analyze]       │               │
│  └──────────────────────────────────────────────┘               │
│                                                                  │
│  Features → How It Works → Pricing → FAQ                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FREE AUDIT PAGE (/free-audit)                 │
├─────────────────────────────────────────────────────────────────┤
│  Enter URL → Run limited audit (50 checks)                      │
│                                                                  │
│  Results: Score 68/100                                          │
│  ├── 2 errors, 3 warnings (preview only)                        │
│  └── "Sign up to see all 200+ checks" [Get Full Report →]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Signup & Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│                      SIGNUP (/signup)                            │
├─────────────────────────────────────────────────────────────────┤
│  [Continue with GitHub]  ← preferred (we need repo access)      │
│  [Continue with Google]                                          │
│                                                                  │
│  OAuth flow → /auth/callback → /dashboard                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard - Project Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      DASHBOARD (/dashboard)                      │
├─────────────────────────────────────────────────────────────────┤
│  Welcome back, Developer                        [+ Add Project]  │
│                                                                  │
│  Stats: 3 Sites | 8 Critical Issues | Avg Score 78 | 24 Audits  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ My SaaS App  │  │ Company Blog │  │ + Add New    │           │
│  │ Score: 78    │  │ Score: 92    │  │   Project    │           │
│  │ 3 errors     │  │ 0 errors     │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Add Project Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       ADD PROJECT (Modal)                        │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Enter Website URL                                       │
│  ┌────────────────────────────────────────────────┐             │
│  │ https://myapp.com                              │             │
│  └────────────────────────────────────────────────┘             │
│                                                                  │
│  Step 2: Connect GitHub Repository (optional but recommended)   │
│  ┌────────────────────────────────────────────────┐             │
│  │ [Install GitHub App] or [Select from repos ▼] │             │
│  └────────────────────────────────────────────────┘             │
│                                                                  │
│  [Create Project & Run First Audit]                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Project View & Audit Results

```
┌─────────────────────────────────────────────────────────────────┐
│               PROJECT PAGE (/dashboard/projects/:id)             │
├─────────────────────────────────────────────────────────────────┤
│  My SaaS App  [Next.js]                                          │
│  https://myapp.com          [Connect GitHub] [⚙] [▶ Run Audit]  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  78  │ Crawl: 85 │ OnPage: 72 │ Content: 80 │ Perf: 75     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Issues Found                              [2 errors] [2 warns]  │
│  ├── ❌ META_DESC_MISSING - Missing meta description            │
│  │      Affected: /, /pricing                                   │
│  │      [View Details] [Generate Fix]                           │
│  ├── ❌ SITEMAP_MISSING - No sitemap.xml found                  │
│  │      [View Details] [Generate Fix]                           │
│  ├── ⚠️ IMG_ALT_MISSING - 12 images missing alt text            │
│  └── ⚠️ TITLE_TOO_LONG - Title tag too long (72 chars)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. GitHub Integration & Auto-Fix PRs

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONNECT GITHUB (Modal)                        │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Install GitHub App (if not installed)                  │
│  → Redirects to github.com/apps/seo-autopilot/installations     │
│  → User grants access to specific repos                         │
│  → Webhook installed for push/PR events                         │
│                                                                  │
│  Step 2: Select Repository                                       │
│  ┌────────────────────────────────────────────────┐             │
│  │ ▼ myorg/myapp-frontend                         │             │
│  └────────────────────────────────────────────────┘             │
│                                                                  │
│  [Connect Repository]                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. PR Generation Flow (Pro/Agency tiers)

```
┌─────────────────────────────────────────────────────────────────┐
│           APPLY FIXES (/dashboard/projects/:id/apply)            │
├─────────────────────────────────────────────────────────────────┤
│  Generate Auto-Fix PR                                            │
│                                                                  │
│  Select issues to fix:                                           │
│  ☑ META_DESC_MISSING - Add meta descriptions                    │
│  ☑ SITEMAP_MISSING - Generate sitemap.xml                       │
│  ☐ IMG_ALT_MISSING - Add image alt text (requires review)       │
│  ☑ OG_TAGS_MISSING - Add Open Graph tags                        │
│                                                                  │
│  Framework detected: Next.js (App Router)                        │
│  Files to modify: app/layout.tsx, public/sitemap.xml            │
│                                                                  │
│  [Preview Changes] [Create PR]                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PR CREATED (Success)                        │
├─────────────────────────────────────────────────────────────────┤
│  ✓ PR #47 created: "fix(seo): add meta tags and sitemap"       │
│                                                                  │
│  Changes:                                                        │
│  ├── app/layout.tsx (+15 lines)                                 │
│  ├── public/sitemap.xml (new file)                              │
│  └── public/robots.txt (+2 lines)                               │
│                                                                  │
│  [View PR on GitHub →]                                           │
│                                                                  │
│  Co-Authored-By: SEO Autopilot <bot@seo-autopilot.dev>          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Ongoing Monitoring (Scheduled Audits)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATED WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Schedule (based on tier):                                       │
│  - Solo: Weekly audits                                           │
│  - Pro: Daily audits                                             │
│  - Agency: On-demand + webhooks on push                          │
│                                                                  │
│  On new issues detected:                                         │
│  ├── Email notification                                          │
│  ├── Slack alert (Pro+)                                          │
│  └── Auto-create PR if enabled (Pro+)                            │
│                                                                  │
│  On PR merged:                                                   │
│  └── Re-audit to verify fixes → Update score                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key User Journeys

### Journey A: Free Trial → Paid User
1. Land on homepage, see terminal demo
2. Try free audit → See partial results
3. Sign up to unlock full audit
4. Add project, run audit
5. See issues, want auto-fix PRs → Upgrade to Pro

### Journey B: Developer with CLI
1. Install CLI: `npm install -g seo-autopilot`
2. Generate API key in `/account/api-keys`
3. Auth CLI: `seo auth --token <key>`
4. Run locally: `seo audit ./my-project`
5. Apply fixes: `seo apply --auto` → Creates PR

### Journey C: GitHub-First Flow
1. Install GitHub App on repo
2. Push code → Webhook triggers audit
3. GitHub Check Run shows SEO score
4. If issues found → Auto-PR created
5. Merge PR → Score improves

---

## Implementation Status

| Component | Status | Priority |
|-----------|--------|----------|
| Landing Page | ✅ Built | - |
| Free Audit | ✅ Built (mock) | P1: Connect to real audit |
| Auth (Google/GitHub) | ✅ Built | - |
| Dashboard | ✅ Built (mock) | P1: Connect to Supabase |
| Project View | ✅ Built (mock) | P1: Connect to Supabase |
| Add Project Modal | ❌ Not built | P1 |
| Run Audit (Edge Function) | ❌ Not built | P1 |
| GitHub App Integration | ❌ Not built | P2 |
| Auto-fix PR Generation | ❌ Not built | P2 |
| API Keys Management | ❌ Not built | P2 |
| CLI with API auth | ❌ Not built | P2 |
| Scheduled Audits | ❌ Not built | P3 |
| Slack/Email Alerts | ❌ Not built | P3 |

---

## Database Tables Used

- `projects` - Sites being monitored
- `audits` - Audit runs and scores
- `audit_issues` - Individual issues found
- `github_installations` - GitHub App installations
- `api_keys` - CLI authentication tokens
- `user_subscriptions` - Stripe subscription status

---

## API Endpoints (Supabase Edge Functions)

| Endpoint | Purpose |
|----------|---------|
| `POST /free-audit` | Run limited audit (no auth) |
| `POST /run-audit` | Run full audit for project |
| `POST /create-checkout` | Stripe checkout session |
| `POST /stripe-webhook` | Handle Stripe events |
| `POST /github-webhook` | Handle GitHub App events |
| `POST /create-pr` | Generate fix PR via GitHub API |
