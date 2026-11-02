# Selling the outcome: a plan for the product and the advertising

**Written 2026-11-02. Status at the end of this file.** Source: Jason Lemkin, SaaStr, "SaaS isn't dead. Old SaaS is dead"
(Sierra vs ServiceNow). This plan takes the article's five lessons and turns the ones that fit
RankCLI into work. Nothing here has been run yet.

## The argument in one paragraph

Software budgets are being re-split, not grown. Money moves from tools priced per seat, which
help a person do a task, to agents priced per result, which do the task. The article's advice
to founders: name the budget line you replace, price on the outcome when it can be measured,
count absolute dollars rather than percentages, shorten the time to a working deployment, and
watch gross margin as AI ships.

## Where RankCLI already stands

| Lesson | Today | Gap |
|---|---|---|
| Name the line item you replace | The pitch lists features (checks, PRs, integrations). The agency angle in `launch/zeely-production-2026-09.md` and Reddit ad B1 do name it: the audit write-up | The landing and pricing pages don't say what RankCLI replaces |
| Price on the outcome | Plans meter sites and automation depth. No seats. AI runs on the user's own key | The one attributable outcome, a merged fix PR, isn't measured, isn't shown to the user, and the quota charges for rejected PRs |
| Count absolute numbers | `launch/ACTIVITY-LOG.md` and `launch/VERIFIED-NUMBERS.md` already do | None |
| Shorten time to deployment | First audit is one `npx` command | Nobody measures the time from first audit to first merged PR |
| Watch margin | Bring-your-own-key, one cheap hosted PR per account | None. Keep it |

**What does not transfer.** Sierra sells to enterprises, so its deal sizes and deployment
story don't apply. The article's Gartner and IDC forecasts and Sierra's ARR figures are
projections or company-reported. None of them go into our copy.

**What we will never price or advertise on: rankings or traffic.** They lag by weeks and have
many causes, so no audit tool can honestly claim them. The outcome we can attribute is narrow:
an issue the audit found, fixed by a PR the user merged, and gone on the next audit.

---

## Phase 0. Measure the outcome (blocks everything else)

Every later phase depends on two numbers we don't have. Get them first.

**0.1 PR outcome report.** Add a step to `.github/workflows/e2e-check-auth-config.yml`. That
workflow already runs SQL against production through the Supabase management API. The new
step reads `github_prs` where `kind = 'auto_fix'`, joined to `projects` and `profiles`. It
excludes `@integrallis.com` accounts and the `integrallis-test` repositories. It reports:

- PRs opened, merged, closed unmerged, and still open, all-time and in the last 30 days
- Merge rate: merged ÷ (merged + closed unmerged)
- Median time from PR opened to merged
- **Time to first outcome:** for each user with a merged PR, signup to first audit to first
  PR opened to first merge

The repository is public and so are its run logs, so the workflow prints aggregates only, the
same rule as its signup-funnel step. Individual rejected PRs are read from the Supabase SQL
editor with this query, never from a log:

```sql
SELECT g.created_at::date, g.closed_at::date, g.pr_url, g.pr_title, cardinality(g.issue_ids) AS issues
FROM github_prs g JOIN projects p ON p.id = g.project_id
WHERE g.kind = 'auto_fix' AND g.pr_state = 'closed'
  AND COALESCE(p.github_repo_url, '') !~* '^https://github\.com/(integrallis|integrallis-test|bsbodden)/'
ORDER BY g.closed_at DESC;
```

The data exists already. The webhook in `supabase/functions/github-webhook/index.ts` writes
`pr_state`, `merged_at` and `closed_at`, and marks the PR's issues fixed on merge.

**0.2 Read the small sample by hand.** External users are few. The 2026-10-13 log counts 1 to
5 real ones. A rate over three PRs means nothing, so until at least twenty external auto-fix
PRs exist, the report is a case list. Read every closed-unmerged PR and record why it was
rejected.

**0.3 Re-check the activation blockers.** `FOUNDER_CHECKLIST.md` had the Google OAuth and
GitHub App OAuth secrets unset as of 2026-10-13. If either is still unset, it is a hard
ceiling on time to first outcome, and it gets fixed before anything in Phase 2.

**Decision rules.** These are proposals. Freeze them, as in the experiment house style, before
reading the first report:

- Merge rate under 50% on the external sample: Phase 1 is the only product priority, and no
  ad claims auto-fix PRs get merged.
- No external merged PR at all: the outcome angle in Phase 4 is not supportable yet. The ads
  stay on the audit and CI-gate angles.
- Merge rate at or above 50% on twenty or more PRs: Phase 3 opens.

## Phase 1. Make the outcome trustworthy (product)

Outcome pricing and outcome advertising both rest on PRs people merge. Our own record says
that is not guaranteed. `integrallis/rankcli.dev#11` was closed because its shared canonical
tag would have deindexed the site and it invented contact details. The generator bugs behind
it are fixed. These items close the class of problem:

1. **Never invent business facts.** Address, phone, opening hours, prices, reviews and
   statistics come only from the site or from the user. A finding that needs a fact we don't
   have becomes a PR comment that asks for it, not a guess. Add a test that fails if
   generated JSON-LD contains a value absent from the page and the project settings.
2. **Smaller, reviewable PRs.** One theme per PR (metadata, structured data, crawl files,
   performance hints) instead of one PR with dozens of fixes. Reviewers merge what they can
   read. `autoFixPrsPerReport` already caps the count per report. This changes what goes in
   each PR.
3. **Prove the fix in the PR.** Re-run the checks the PR claims to fix against the PR branch,
   or its preview deploy when one exists. Post the before and after per issue in the PR
   body. A claimed fix that doesn't verify is removed before the PR opens.
4. **Engine false positive found on 2026-11-02.** `HERO_IMAGE_LAZY` fires on the footer
   ProgrammerNeeds badge. A footer image is not a hero image. Fix the check. Separately,
   decide whether the badge's `MISSING_PRECONNECT` warning is worth a preconnect hint.

## Phase 2. Shorten the time to the outcome (product)

The target is not time to first audit, which is seconds. It is time from first audit to first
merged fix.

1. **Map the current path and cut steps.** Walk free audit, signup, GitHub App install, first
   PR, with the 0.1 timings beside each step. Remove every step that isn't needed. Likely
   candidates: installing the GitHub App straight from the free-audit result, and opening
   the first PR without a dashboard detour.
2. **Make the free first PR the default first action.** Every account gets one auto-fix PR
   on RankCLI's own key. That removes the bring-your-own-key barrier for the first outcome,
   so it should be the default next step after an audit, not something to find.
3. **The agent path is the shortest path.** `rankcli fix` locally, or the MCP server inside a
   coding agent, applies fixes with no account at all. We can't measure it, and that's
   acceptable. It is the agent-native form of the product and gets equal billing with the PR
   path (Phase 4).

## Phase 3. Align pricing with the outcome (only after the Phase 0 gate)

Do not move to per-outcome pricing now. Plans are already seat-free and the base is too
small to learn anything from a pricing change. One change is justified today.

1. **Rejected PRs stop costing quota.** `create-seo-pr` counts every `auto_fix` PR opened this
   calendar month, whatever its state. A Free user who closes a bad PR has spent one of three.
   Count only PRs that are merged or still open. `create-seo-pr` already hands a closed PR's
   issues back for a retry, so this makes the quota agree. Say it on the pricing page: you
   are not charged for fixes you reject.
2. **Later, if the gate opens:** test merged fixes as the Free-to-Solo boundary, for example
   "3 merged fixes a month free". That decision waits for Phase 0 data. It is not made here.
3. **Margin stays protected.** Bring-your-own-key remains the default. Add the cost of the
   free hosted PR per account to the 0.1 report so it stays visible.

## Phase 4. Advertising and site copy

**Integrity fix, first.** The hero's animated terminal in
`packages/saas/src/components/terminal/TerminalOutput.tsx` shows invented output: a 78/100
score, "PR #127 created with 8 fixes", and GEO and CWV scores the CLI doesn't print in that
form. Replace it with the real recording from 2026-11-01
(`launch/ad-assets/programmerneeds-2026-11-01/rankcli-audit-2026-11-01.cast`, 90/100) or
label it as illustrative. This comes before any new creative.

1. **Name what it replaces, in words, not dollars.** We have no sourced savings figure, so we
   don't print one.
   - Agencies: the hours spent writing up an audit and turning findings into tickets.
     Reddit ad B1 already does this. Bring the same line to the Agency page and pricing.
   - Developers: the SEO audit you would otherwise pay a contractor for, or skip until
     traffic drops. The audit runs in the pipeline you already have.
2. **Lead with the outcome, not the dashboard.** The hero order becomes: the fix arrives as a
   pull request, then the checks behind it, then the dashboard as the record. The Product Hunt draft
   already says "instead of another dashboard alert nobody reads". Build on that.
3. **Agent-native positioning.** One line on the landing page and one ad variant: the SEO
   audit your coding agent can run and fix through MCP. squirrelscan already positions
   itself as "website QA for your coding agent", so ours has to differentiate on the PR and
   the CI gate rather than repeat theirs.
4. **Proof, in order of honesty.** Use a merged external PR, with the owner's permission,
   once one exists. Until then use our own merged PR (`integrallis/integrallis#3`, labelled
   as our own site) and the open smoketest PR, labelled as a test fixture. Never use an
   AI-generated customer or a testimonial we don't have. That rule is in
   `launch/zeely-production-2026-09.md`.
5. **New creative, gated on a real merge.** A 15-second clip: audit, PR opened, PR merged,
   re-audit with the issue gone. Record it only from a real run, on a site we own.
6. **Measure the new angle the way the old ones are measured.** UTM per angle, judged on cost
   per `/free-audit` view as the Reddit and Meta plans already say. Add a second measure,
   cost per GitHub App install, once 0.1 can count installs by source.

---

## Order, and what needs the founder

| Step | Who | Depends on |
|---|---|---|
| 0.1 report, 0.3 secrets check | Claude, then the founder approves the commit | Nothing |
| Freeze the Phase 0 decision rules | Founder | Reading this plan |
| Hero terminal integrity fix | Claude | Nothing |
| 1.4 engine false positive | Claude | Nothing |
| 3.1 rejected PRs stop costing quota | Claude | Nothing. It is correct regardless of the data |
| Phase 1 items 1 to 3 | Claude | 0.1 and 0.2, to aim at real rejection reasons |
| Phase 2 | Claude | 0.1 timings |
| Phase 4 copy items 1 to 3 | Claude drafts, founder approves | Hero fix |
| Phase 4 proof and creative | Founder for permissions and ad spend | A real external merge |
| Phase 3 item 2 | Founder decision | Phase 0 gate |

**Kill criterion for the outcome angle.** If, after Phase 1 and Phase 2 ship, external users
still produce no merged auto-fix PR, the product sells as an audit and a CI gate. The ads stay
there. That would be a result, and it gets logged in `launch/ACTIVITY-LOG.md`.

## Status

**2026-11-02.** Done: the 0.1 report (a step in `e2e-check-auth-config.yml`), 3.1 (PRs closed
unmerged no longer count against the Free allowance, server and dashboard alike, and the
pricing card, docs and limit message say so), 1.4 (footer images are no longer read as above
the fold), and the hero integrity fix (the landing terminal replays a recorded 0.0.53 run, its
lines selected from committed stdout at build time, with a test that every line is verbatim).

