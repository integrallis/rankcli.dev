# GEO coverage — what's covered, what's new, what's next

A feature-gap analysis of RankCLI's SEO + GEO (Generative Engine
Optimization / AI-search-visibility) coverage against the current (Sep
2026) state of the field, done by actually reading all ~90 check/module
files rather than assuming, and researching what a comprehensive tool
should cover beyond what RankCLI already does. Full findings below; the
short version: **classic SEO + GEO coverage is genuinely comprehensive and
mature — no stubs, no filler, across ~90 files.** The real gaps are all in
the *new* frontier past classic GEO. Built the two highest-priority ones —
Agent Experience readiness and RAG-chunk readiness — with the same
build-then-verify-against-the-real-site discipline as the rest of this
session; both caught real bugs in the process, documented below.

## What's already covered (confirmed by reading the code, not assuming)

**Technical SEO**: crawlability, robots.txt syntax validation, canonical
handling, redirect chains, pagination, hreflang, soft-404 detection,
duplicate-content hashing, IndexNow, malicious-URL screening.

**On-page/content**: title/meta/headings, structured data validation,
entity/knowledge-graph alignment, topical clustering, internal-link graph
analysis, keyword placement and cannibalization, featured-snippet
formatting, content freshness (including the "AI cites content ~26%
fresher" signal), and genuinely advanced content-science checks (Zipf's
Law, Shannon entropy, BM25, cosine similarity for naturalness detection).

**GEO / AI-citation** (the core differentiator, and already deep):
AI-crawler-access rules for GPTBot/ClaudeBot/PerplexityBot, the Cloudflare
mixed-use-crawler compliance check built earlier this session, llms.txt
format validation, AI-parseable content structure (tables/lists/Q&A),
originality/citation-worthiness signals, answer conciseness, outbound
citation quality (E-E-A-T proxy), brand-mention extractability, and —
notably — **real, live AI-visibility checks** that actually query
ChatGPT, Claude, Gemini, and Perplexity to see if a brand gets mentioned,
not just heuristics. That's the same core capability Profound/Peec/
AthenaHQ charge $99–$2,000+/mo for.

**Competitive GEO benchmarking**: already covered (`geo-history.ts` does
time-series LLM-visibility tracking with competitor comparison) — the
external research flagged this as "table stakes now," and it turned out
RankCLI already has it. Worth knowing this is parity, not a gap, so
nobody spends time rebuilding it.

**Performance, images, mobile, security**: Core Web Vitals estimation,
DOM/resource-hint analysis, minification/caching checks, responsive
images, WCAG contrast heuristics, security-header grading, CMS/framework
fingerprinting with known-vulnerable-version detection.

**Beyond audit checks**: a full keyword-research subsystem (AI-powered,
tiered free/paid, competitive gap analysis, TF-IDF/embeddings-based
clustering), a content-generation subsystem, and GSC/GA4 tracking
integrations. The product's "angles" extend well past pure auditing.

## New — built this session

### Agent Experience (AX) readiness
`packages/agent-runtime/src/audit/checks/agent-experience.ts`, wired into
`runAIReadinessChecks` (so it's live in the full audit engine, the
hosted `seo_audit` MCP tool, and the CLI — same reach as the Cloudflare
check).

The biggest confirmed gap, and the most defensible one to own: classic
GEO asks "can an AI crawler read this page and cite it in an answer?" —
**Agent Experience asks whether an AI *agent* (not just a chatbot
answering questions) can discover what a site can *do*.** This is a real,
named, actively-tooled discipline as of 2026 (AgentGrade and similar
agent-readiness scanners audit exactly this), and RankCLI is unusually
well-positioned to build it — it already ships its own MCP server.

Checks for: `llms-full.txt` (measured as fetched ~2x more often than
plain llms.txt — itself a gap, since only `llms.txt` was previously
checked), `SKILL.md` (Anthropic's Agent Skills manifest convention), a
discoverable MCP server (`/mcp`, `/.well-known/mcp.json`), and an
OpenAPI spec. Low severity (`notice`) — this is genuinely emerging, most
sites have none of it yet, so absence is an opportunity, not a failure.

**A real bug found and fixed while building this, worth flagging as a
general lesson**: the first version checked "HTTP status 200-399 = found."
Tested against rankcli.dev itself and it reported all 6 signals as
present — completely wrong, since rankcli.dev is a client-side-routed SPA
that serves its app shell with HTTP 200 for *any* unmatched path,
`/skill.md` included. Verified this directly: `/skill.md` and a
deliberately-random nonexistent path returned byte-identical bodies.
Fixed by fetching one definitely-nonexistent path first and comparing
every signal's response against that baseline — identical bytes back
means "this is the SPA fallback," regardless of status code. Re-verified
against the live site (correctly reports zero signals present now) and
against `/robots.txt` as a positive control (correctly distinguished from
the fallback, different body). This matters beyond this one check: **any
future well-known-path check needs the same baseline-diff treatment**,
not naive status-code checking — a lot of the modern web is SPA-routed.

### RAG-chunk readiness

`packages/agent-runtime/src/audit/checks/rag-chunk-readiness.ts`, wired
into the same premium-check phase as `ai-content-structure.ts` in
`engine.ts`, with 15 unit tests
(`rag-chunk-readiness.test.ts`, all passing).

The research called this "genuinely novel... currently unclaimed" as a
*site-auditing* category — RAG-chunking guidance that exists targets
people *building* RAG systems, not auditing whether a page's own
structure is chunk-friendly. Distinct from `ai-content-structure.ts`
(that's about formatting — tables/lists/Q&A; this is about **section
size and self-containment**). Checks two things: whether heading-
delimited sections fall in a range unlikely to need mid-thought splitting
by a RAG chunker (roughly 150-450 words, derived from the 2026
convergence benchmark of 400-512 token chunks), and whether sections open
with a dangling reference ("This approach...", "It also...") that loses
its antecedent the moment a retrieval system surfaces that section
standalone — which is exactly how retrieval works.

Built with real unit tests from the start this time (pure content
analysis, no network dependency, so — unlike the AX check — I could
write proper test coverage before ever touching a live site), including
one specifically constructed to catch the same class of bug the AX check
hit: sibling-only DOM traversal breaks on wrapper-div-heavy nesting
common in modern frameworks, so section-splitting walks all
heading/content elements in document order via one multi-tag cheerio
selector instead of relying on sibling relationships.

**A genuinely interesting finding from testing this against the live
site**, not a bug: `analyzeRAGChunkReadiness(rankcli.dev)` returns zero
sections. The raw HTML *does* have 5 real headings with real content —
but they live inside a `<noscript>` SEO-fallback block, and every premium
content check (`ai-content-structure.ts`, `citation-quality.ts`,
`entity-seo.ts`, and now this one) strips `<noscript>` before analysis,
following an established, consistent convention. That's defensible for
checks about the real user experience (JS-enabled users never see
noscript content) — but questionable specifically for GEO checks, since
many AI crawlers (GPTBot included) don't execute JavaScript and would see
exactly that fallback content, not the client-rendered app. Left the
convention as-is rather than unilaterally changing shared behavior across
multiple files in one pass — but this is a real, verified observation
(confirmed via direct inspection: the noscript block is genuine, well-
structured fallback content) worth a deliberate decision, not a silent
fix. Whoever picks this up: the question is whether GEO-category checks
specifically should treat `<noscript>` as primary content rather than
cruft to strip.

## Deferred — real gaps, not built yet, with why

- **C2PA / content-provenance / EU AI Act compliance flag** — C2PA moved
  from speculative to regulatory-relevant this year (EU AI Act, effective
  Aug 2026, requires AI-content transparency labeling that C2PA's AI
  assertion type satisfies). No evidence yet that AI search engines
  actually weight citations by provenance signal, so the payoff is
  compliance-exposure awareness, not GEO ranking — lower urgency than the
  items above, but real and worth a future pass, especially for EU-facing
  sites.
- **Multilingual GEO** — real gap (AI engines maintain per-language
  citation indexes; native-language content genuinely outperforms
  translated content), but under-tooled across the *entire* category, not
  just RankCLI — no competitor does this well either. Lower priority
  because it's not a competitive-parity gap, just an open opportunity.
- **Multimodal AI content readiness** — vision-capable models now read
  image pixels, not just alt text, but the actual practitioner guidance
  found was "write better alt text + more context" — not a genuinely
  distinct new practice yet. Modest gap, existing `images.ts` family
  already covers the fundamentals reasonably well.
- **Pay-Per-Crawl monetization *configuration detection*** — still
  deferred as an actual detection capability. Reliably determining
  whether Pay-Per-Crawl is *configured and working* from outside would
  mean spoofing an AI-crawler user-agent and interpreting HTTP 402
  responses — more fragile and harder to verify correctly than a
  straightforward path check, and I wasn't confident enough in that
  detection to ship it as a claim. Did add the **lighter, honest version**
  this pass: the existing Cloudflare access check's guidance now mentions
  Pay-Per-Crawl as an option (`types.ts`, `CLOUDFLARE_AI_CRAWLER_GATE_AMBIGUOUS`)
  — a copy improvement, not a new detection.

## A scoping note for whoever picks these up next

The Agent Experience check only lives in the full audit engine and the
hosted `seo_audit` MCP tool — not the local, zero-network `mcp-server`
package (the free front door). That's consistent with how the Cloudflare
check was scoped earlier: both require autonomously fetching multiple
URLs, which the local MCP server deliberately doesn't do (it works only
from HTML/robots.txt the caller already has). Any of the deferred items
above that also require live fetching will land in the same place.
