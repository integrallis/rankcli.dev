/**
 * Shared Audit Configuration
 * This module provides configuration for the SEO audit system.
 *
 * TODO: Once @rankcli/agent-runtime is published to npm, replace the
 * edge function audit logic with:
 * import { runFullAudit } from 'npm:@rankcli/agent-runtime';
 */

export const AUDIT_CONFIG = {
  // Total number of checks available in the full audit
  totalChecks: 280,

  // Checks per tier
  tierLimits: {
    free: 50,
    solo: 280,
    pro: 280,
    agency: 280,
  },

  // Check categories
  categories: [
    'crawlability',
    'on-page',
    'content',
    'performance',
    'security',
    'structured-data',
    'mobile',
    'links',
    'images',
    'social',
    'ai-readiness',
    'local-seo',
    'freshness',
    'entity-seo',
    'conversion',
  ],

  // User agent for requests
  userAgent: 'RankCLI/1.0 (+https://rankcli.dev)',

  // Timeouts
  defaultTimeout: 30000,
  headTimeout: 5000,
};

/**
 * Get the check limit for a subscription tier
 */
export function getCheckLimit(tier: string): number {
  return AUDIT_CONFIG.tierLimits[tier as keyof typeof AUDIT_CONFIG.tierLimits] || AUDIT_CONFIG.tierLimits.free;
}

/**
 * Calculate health scores from issues
 */
export function calculateHealthScores(issues: Array<{ category: string; severity: string }>): Record<string, number> {
  const categories = AUDIT_CONFIG.categories;
  const scores: Record<string, number> = {};

  for (const category of categories) {
    const categoryIssues = issues.filter(i => i.category === category);
    const errors = categoryIssues.filter(i => i.severity === 'error').length;
    const warnings = categoryIssues.filter(i => i.severity === 'warning').length;

    // Start with 100, deduct for issues
    let score = 100;
    score -= errors * 15;
    score -= warnings * 5;

    scores[category] = Math.max(0, Math.min(100, score));
  }

  return scores;
}

/**
 * Calculate overall score from category scores
 */
export function calculateOverallScore(healthScores: Record<string, number>): number {
  const values = Object.values(healthScores);
  if (values.length === 0) return 0;

  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
}
