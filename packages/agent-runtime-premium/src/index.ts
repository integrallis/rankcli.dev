/**
 * Paid-tier SEO checks. Never published - see package.json.
 *
 * Consumed two ways:
 * - audit-worker imports `premiumChecks` directly and passes it into
 *   agent-runtime's runFullAudit({ premiumChecks }) - server-side,
 *   first-party, so plain unencrypted access is fine.
 * - agent-runtime's wasm-adapter.ts imports these same functions, bundles
 *   them into a single IIFE (`pnpm build:wasm`), which the CLI's build.rs
 *   then AES-encrypts and embeds in the WASM binary - decryptable only
 *   with a valid paid-tier license.
 */

export { analyzeFeaturedSnippet } from './checks/featured-snippet.js';
export { analyzeInternalLinkGraph } from './checks/internal-link-graph.js';
export { analyzeEEATSignals } from './checks/eeat-signals.js';
export { analyzeContentScience } from './checks/content-science.js';
export { analyzeKeywordCannibalizationSinglePage } from './checks/keyword-cannibalization.js';
export { analyzeConversionElements } from './checks/conversion-elements.js';
export { analyzeKeywordPlacement } from './checks/keyword-placement.js';
export { analyzeTopicalClusters } from './checks/topical-clusters.js';
export { analyzePlatformPresence } from './checks/platform-presence.js';
export { analyzeInteractiveTools } from './checks/interactive-tools.js';
export { analyzeFunnelIntent } from './checks/funnel-intent.js';
export { analyzeNavBoostSignals } from './checks/navboost-signals.js';
export { analyzeEntitySEO } from './checks/entity-seo.js';
export { analyzeFreshnessSignals } from './checks/freshness-signals.js';
export { analyzeAIContentStructure } from './checks/ai-content-structure.js';
export { analyzeRAGChunkReadiness } from './checks/rag-chunk-readiness.js';
export { analyzeCitationQuality } from './checks/citation-quality.js';
export { analyzeAnswerConciseness } from './checks/answer-conciseness.js';
export { analyzeBrandMentionOptimization } from './checks/brand-mention-optimization.js';
export { analyzeAICitationWorthiness } from './checks/ai-citation-worthiness.js';
export { analyzeReviewEcosystem } from './checks/review-ecosystem.js';

import { analyzeFeaturedSnippet } from './checks/featured-snippet.js';
import { analyzeInternalLinkGraph } from './checks/internal-link-graph.js';
import { analyzeEEATSignals } from './checks/eeat-signals.js';
import { analyzeContentScience } from './checks/content-science.js';
import { analyzeKeywordCannibalizationSinglePage } from './checks/keyword-cannibalization.js';
import { analyzeConversionElements } from './checks/conversion-elements.js';
import { analyzeKeywordPlacement } from './checks/keyword-placement.js';
import { analyzeTopicalClusters } from './checks/topical-clusters.js';
import { analyzePlatformPresence } from './checks/platform-presence.js';
import { analyzeInteractiveTools } from './checks/interactive-tools.js';
import { analyzeFunnelIntent } from './checks/funnel-intent.js';
import { analyzeNavBoostSignals } from './checks/navboost-signals.js';
import { analyzeEntitySEO } from './checks/entity-seo.js';
import { analyzeFreshnessSignals } from './checks/freshness-signals.js';
import { analyzeAIContentStructure } from './checks/ai-content-structure.js';
import { analyzeRAGChunkReadiness } from './checks/rag-chunk-readiness.js';
import { analyzeCitationQuality } from './checks/citation-quality.js';
import { analyzeAnswerConciseness } from './checks/answer-conciseness.js';
import { analyzeBrandMentionOptimization } from './checks/brand-mention-optimization.js';
import { analyzeAICitationWorthiness } from './checks/ai-citation-worthiness.js';
import { analyzeReviewEcosystem } from './checks/review-ecosystem.js';

/** Matches the PremiumChecks shape agent-runtime's engine.ts expects. */
export const premiumChecks = {
  analyzeFeaturedSnippet,
  analyzeInternalLinkGraph,
  analyzeEEATSignals,
  analyzeContentScience,
  analyzeKeywordCannibalizationSinglePage,
  analyzeConversionElements,
  analyzeKeywordPlacement,
  analyzeTopicalClusters,
  analyzePlatformPresence,
  analyzeInteractiveTools,
  analyzeFunnelIntent,
  analyzeNavBoostSignals,
  analyzeEntitySEO,
  analyzeFreshnessSignals,
  analyzeAIContentStructure,
  analyzeRAGChunkReadiness,
  analyzeCitationQuality,
  analyzeAnswerConciseness,
  analyzeBrandMentionOptimization,
  analyzeAICitationWorthiness,
  analyzeReviewEcosystem,
};
