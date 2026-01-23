import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import the shared audit engine (280+ checks)
import { runFullAudit, formatReport, urlSafetyDatabase } from '../_shared/audit/index.ts';
import type { AuditReport, AuditIssue as EngineIssue } from '../_shared/audit/index.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

// AI Analysis Types
interface AIContentAnalysis {
  overallScore: number;
  searchIntentMatch: number;
  contentDepth: 'shallow' | 'moderate' | 'comprehensive';
  keywordNaturalness: number;
  eeatSignals: {
    experience: string[];
    expertise: string[];
    authority: string[];
    trust: string[];
  };
  improvements: { priority: number; suggestion: string; impact: string }[];
  uniqueValue: string;
  missingTopics: string[];
  targetKeyword?: string;
}

interface AIMetaAnalysis {
  titleAnalysis: {
    effectiveness: number;
    clickPotential: number;
    suggestions: string[];
  };
  descriptionAnalysis: {
    effectiveness: number;
    suggestions: string[];
  };
  serpPrediction: {
    predictedCTR: number;
    improvements: string[];
  };
}

interface AIFixPrioritization {
  prioritizedIssues: {
    issueCode: string;
    impactScore: number;
    effortScore: number;
    roiScore: number;
    rationale: string;
  }[];
  fixBatches: {
    batch: number;
    theme: string;
    estimatedImpact: string;
    issueCodes: string[];
  }[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Flag to track if threat hashes have been loaded this session
let threatHashesLoaded = false;

/**
 * Load threat hashes from Supabase into the URL safety database
 * This only needs to be done once per function instance
 * Uses a small subset for performance - pattern detection handles the rest
 */
async function loadThreatHashes(supabase: ReturnType<typeof createClient>): Promise<number> {
  if (threatHashesLoaded && urlSafetyDatabase.isPopulated()) {
    return 0;
  }

  const startTime = Date.now();

  // Query only domain hashes (smaller set, more impactful)
  // URL hashes are too numerous - pattern detection handles most cases
  const { data: hashes, error } = await supabase
    .from('threat_hashes')
    .select('hash_prefix, hash_type')
    .eq('is_active', true)
    .eq('hash_type', 'domain')
    .limit(10000);

  if (error || !hashes || hashes.length === 0) {
    return 0;
  }

  const count = urlSafetyDatabase.loadHashPrefixes(hashes);
  threatHashesLoaded = true;

  console.log(`[AUDIT] Loaded ${count} domain hashes in ${Date.now() - startTime}ms`);
  return count;
}

// Database issue format
interface DbAuditIssue {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  category: string;
  title: string;
  description: string | null;
  impact: string | null;
  how_to_fix: string | null;
  affected_urls: string[];
  details: Record<string, unknown> | null;
}

interface HealthScores {
  crawlability: number;
  onPage: number;
  content: number;
  performance: number;
  security: number;
  socialMeta: number;
  aiReadiness: number;
  mobile: number;
}

// Convert engine issues to database format
function convertIssue(issue: EngineIssue): DbAuditIssue {
  return {
    code: issue.code,
    severity: issue.severity,
    category: issue.category,
    title: issue.title,
    description: issue.description || null,
    impact: issue.impact || null,
    how_to_fix: issue.howToFix || null,
    affected_urls: issue.affectedUrls || [],
    details: issue.details || null,
  };
}

serve(async (req) => {
  console.log('[AUDIT] Function invoked at:', new Date().toISOString());

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let userId: string | null = null;

    // Check for user auth (optional for API key access)
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { projectId, auditId } = await req.json();

    if (!projectId && !auditId) {
      return new Response(JSON.stringify({ error: 'Project ID or Audit ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the project
    let project;
    let audit;

    if (auditId) {
      // Get audit and project
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('*, projects(*)')
        .eq('id', auditId)
        .single();

      if (auditError || !auditData) {
        return new Response(JSON.stringify({ error: 'Audit not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      audit = auditData;
      project = auditData.projects;
    } else {
      // Get project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        return new Response(JSON.stringify({ error: 'Project not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      project = projectData;

      // Create new audit record
      const { data: newAudit, error: createError } = await supabase
        .from('audits')
        .insert({
          project_id: projectId,
          triggered_by: 'api',
          triggered_by_user: userId,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create audit: ${createError.message}`);
      }

      audit = newAudit;
    }

    // Update audit status to running
    await supabase
      .from('audits')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', audit.id);

    const startTime = Date.now();

    try {
      // ========== LOAD THREAT HASHES FOR URL SAFETY (with timeout) ==========
      const threatHashPromise = loadThreatHashes(supabase).catch(() => 0);
      const timeoutPromise = new Promise<number>(resolve => setTimeout(() => resolve(0), 3000));
      await Promise.race([threatHashPromise, timeoutPromise]);

      // ========== RUN FULL AUDIT ENGINE (280+ CHECKS) ==========
      console.log(`[AUDIT] Starting full audit on ${project.url}...`);
      console.log(`[AUDIT] Timestamp: ${new Date().toISOString()}`);

      let auditReport;
      try {
        // Call runFullAudit with options object and 45-second timeout
        // Edge functions have 60s max, so we timeout at 45s to leave room for cleanup
        const auditPromise = runFullAudit({
          url: project.url,
          maxPages: 1,
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Audit timed out after 45 seconds')), 45000)
        );

        auditReport = await Promise.race([auditPromise, timeoutPromise]);
        console.log(`[AUDIT] runFullAudit completed successfully`);
      } catch (auditEngineError) {
        console.error(`[AUDIT] runFullAudit FAILED:`, auditEngineError);
        console.error(`[AUDIT] Error name: ${auditEngineError?.name}`);
        console.error(`[AUDIT] Error message: ${auditEngineError?.message}`);
        console.error(`[AUDIT] Error stack: ${auditEngineError?.stack}`);
        throw auditEngineError;
      }

      // Get checks run from summary.passed + issues count
      const checksRun = auditReport.summary.passed + auditReport.summary.errors + auditReport.summary.warnings;
      console.log(`[AUDIT] Complete: ${auditReport.issues.length} issues found from ${checksRun} checks`);

      // Convert engine issues to database format
      const issues: DbAuditIssue[] = auditReport.issues.map(convertIssue);

      // ========== AI ANALYSIS (Optional) ==========
      let aiContentAnalysis: AIContentAnalysis | null = null;
      let aiMetaAnalysis: AIMetaAnalysis | null = null;
      let aiFixPrioritization: AIFixPrioritization | null = null;

      if (openaiApiKey && auditReport.pages[0]) {
        const page = auditReport.pages[0];
        console.log('Running AI-powered analysis...');

        // Extract data for AI analysis from the audit report
        const pageData = {
          url: project.url,
          title: page.title || undefined,
          metaDescription: page.description || undefined,
          h1: Array.isArray(page.h1) ? page.h1[0] : page.h1 || undefined,
          wordCount: page.wordCount || 0,
          textContent: '', // Not available in report, but AI can work without it
        };

        const [contentResult, metaResult] = await Promise.allSettled([
          runAIContentAnalysis(pageData),
          runAIMetaAnalysis(pageData),
        ]);

        if (contentResult.status === 'fulfilled') {
          aiContentAnalysis = contentResult.value;
        }
        if (metaResult.status === 'fulfilled') {
          aiMetaAnalysis = metaResult.value;
        }

        // Run fix prioritization
        const issuesForPrioritization = issues.map(i => ({
          code: i.code,
          severity: i.severity,
          title: i.title,
          category: i.category,
        }));

        aiFixPrioritization = await runAIFixPrioritization(
          issuesForPrioritization,
          project.url,
          undefined
        );

        // Add AI-generated improvement suggestions
        if (aiContentAnalysis?.improvements) {
          const topImprovements = aiContentAnalysis.improvements
            .filter(i => i.priority <= 2)
            .slice(0, 3);

          for (const improvement of topImprovements) {
            issues.push({
              code: 'AI_CONTENT_SUGGESTION',
              severity: 'notice',
              category: 'content',
              title: `AI Suggestion: ${improvement.suggestion.substring(0, 60)}${improvement.suggestion.length > 60 ? '...' : ''}`,
              description: improvement.suggestion,
              impact: improvement.impact,
              how_to_fix: improvement.suggestion,
              affected_urls: [project.url],
              details: { aiGenerated: true, priority: improvement.priority },
            });
          }
        }

        // Add AI meta tag suggestions
        if (aiMetaAnalysis?.titleAnalysis?.suggestions?.[0]) {
          const titleEffectiveness = aiMetaAnalysis.titleAnalysis.effectiveness;
          if (!pageData.title || titleEffectiveness < 70) {
            issues.push({
              code: 'AI_TITLE_SUGGESTION',
              severity: 'notice',
              category: 'on-page',
              title: 'AI-Suggested Title Improvement',
              description: `Suggested: "${aiMetaAnalysis.titleAnalysis.suggestions[0]}"`,
              impact: `Current title effectiveness: ${titleEffectiveness}%`,
              how_to_fix: `Consider: ${aiMetaAnalysis.titleAnalysis.suggestions.slice(0, 2).join(' OR ')}`,
              affected_urls: [project.url],
              details: {
                aiGenerated: true,
                suggestions: aiMetaAnalysis.titleAnalysis.suggestions,
                clickPotential: aiMetaAnalysis.titleAnalysis.clickPotential,
              },
            });
          }
        }

        console.log('AI analysis complete.');
      }

      // ========== USE HEALTH SCORES FROM ENGINE ==========
      const healthScores: HealthScores = {
        crawlability: auditReport.healthScore?.crawlability ?? 100,
        onPage: auditReport.healthScore?.onPage ?? 100,
        content: auditReport.healthScore?.content ?? 100,
        performance: auditReport.healthScore?.performance ?? 100,
        security: auditReport.healthScore?.security ?? 100,
        socialMeta: auditReport.healthScore?.social ?? 100,
        aiReadiness: auditReport.healthScore?.aiReadiness ?? 100,
        mobile: 100, // Not in HealthScore interface, default to 100
      };

      // Use overall score from engine
      let overallScore = auditReport.healthScore?.overall ?? 85;

      // Apply AI boost if available
      if (aiContentAnalysis?.overallScore) {
        const aiBoost = (aiContentAnalysis.overallScore - 70) * 0.05;
        overallScore = Math.min(100, Math.max(0, Math.round(overallScore + aiBoost)));
      }

      const duration = Date.now() - startTime;

      // ========== SAVE RESULTS ==========
      console.log(`[AUDIT] Saving results for audit ${audit.id}...`);

      // Update audit with results
      const { error: updateError } = await supabase
        .from('audits')
        .update({
          status: 'completed',
          score: overallScore,
          pages_crawled: auditReport.pages.length,
          issues_found: issues.length,
          checks_run: checksRun,
          health_scores: healthScores,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          summary: {
            errors: issues.filter(i => i.severity === 'error').length,
            warnings: issues.filter(i => i.severity === 'warning').length,
            notices: issues.filter(i => i.severity === 'notice').length,
            checksRun,
            aiAnalyzed: !!aiContentAnalysis,
          },
          ai_analysis: aiContentAnalysis || aiMetaAnalysis || aiFixPrioritization ? {
            content: aiContentAnalysis,
            meta: aiMetaAnalysis,
            fixPrioritization: aiFixPrioritization,
            analyzedAt: new Date().toISOString(),
          } : null,
        })
        .eq('id', audit.id);

      if (updateError) {
        console.error(`[AUDIT] Failed to update audit: ${updateError.message}`);
        throw new Error(`Failed to update audit: ${updateError.message}`);
      }
      console.log(`[AUDIT] Audit record updated successfully`);

      // Save issues
      if (issues.length > 0) {
        console.log(`[AUDIT] Saving ${issues.length} issues...`);
        const issueRecords = issues.map(issue => ({
          audit_id: audit.id,
          project_id: project.id,
          code: issue.code,
          severity: issue.severity,
          category: issue.category,
          title: issue.title,
          description: issue.description,
          impact: issue.impact,
          how_to_fix: issue.how_to_fix,
          affected_urls: issue.affected_urls,
          details: issue.details,
          status: 'open',
        }));

        const { error: issuesError } = await supabase.from('audit_issues').insert(issueRecords);
        if (issuesError) {
          console.error(`[AUDIT] Failed to save issues: ${issuesError.message}`);
        } else {
          console.log(`[AUDIT] Issues saved successfully`);
        }
      }

      // Update project
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          last_audit_at: new Date().toISOString(),
          last_audit_score: overallScore,
        })
        .eq('id', project.id);

      if (projectError) {
        console.error(`[AUDIT] Failed to update project: ${projectError.message}`);
      } else {
        console.log(`[AUDIT] Project updated successfully`);
      }

      return new Response(JSON.stringify({
        success: true,
        auditId: audit.id,
        score: overallScore,
        issuesFound: issues.length,
        checksRun,
        duration,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (auditError) {
      // Mark audit as failed
      await supabase
        .from('audits')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', audit.id);

      throw auditError;
    }

  } catch (error) {
    console.error('[AUDIT] Top-level error:', error);
    console.error('[AUDIT] Error name:', error?.name);
    console.error('[AUDIT] Error message:', error?.message);
    console.error('[AUDIT] Error stack:', error?.stack);
    return new Response(JSON.stringify({
      error: error?.message || 'Unknown error',
      errorName: error?.name,
      errorStack: error?.stack?.substring(0, 500),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ========== AI ANALYSIS FUNCTIONS ==========

async function runAIContentAnalysis(context: {
  url: string;
  title?: string;
  h1?: string;
  metaDescription?: string;
  textContent?: string;
  wordCount?: number;
}): Promise<AIContentAnalysis | null> {
  if (!openaiApiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert SEO analyst. Analyze webpage content and provide actionable insights. Always respond with valid JSON.`
          },
          {
            role: 'user',
            content: `Analyze this webpage for SEO quality:

URL: ${context.url}
Title: ${context.title || 'Not found'}
H1: ${context.h1 || 'Not found'}
Meta Description: ${context.metaDescription || 'Not found'}
Word Count: ${context.wordCount || 'Unknown'}

Return JSON with this structure:
{
  "overallScore": <0-100>,
  "searchIntentMatch": <0-100>,
  "contentDepth": "<shallow|moderate|comprehensive>",
  "keywordNaturalness": <0-100>,
  "eeatSignals": {
    "experience": [<strings>],
    "expertise": [<strings>],
    "authority": [<strings>],
    "trust": [<strings>]
  },
  "improvements": [{"priority": <1-5>, "suggestion": "<string>", "impact": "<string>"}],
  "uniqueValue": "<string>",
  "missingTopics": [<strings>],
  "targetKeyword": "<detected primary keyword>"
}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as AIContentAnalysis;
  } catch (error) {
    console.error('AI content analysis error:', error);
    return null;
  }
}

async function runAIMetaAnalysis(context: {
  url: string;
  title?: string;
  metaDescription?: string;
  h1?: string;
}): Promise<AIMetaAnalysis | null> {
  if (!openaiApiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert SEO copywriter specializing in meta tags. Generate compelling alternatives. Always respond with valid JSON.`
          },
          {
            role: 'user',
            content: `Analyze these meta tags and suggest improvements:

URL: ${context.url}
Current Title: ${context.title || 'Missing'}
Current Description: ${context.metaDescription || 'Missing'}
H1: ${context.h1 || 'Not found'}

Return JSON with this structure:
{
  "titleAnalysis": {
    "effectiveness": <0-100>,
    "clickPotential": <0-100>,
    "suggestions": [<3-5 better title suggestions>]
  },
  "descriptionAnalysis": {
    "effectiveness": <0-100>,
    "suggestions": [<3-5 better description suggestions>]
  },
  "serpPrediction": {
    "predictedCTR": <percentage>,
    "improvements": [<specific CTR improvements>]
  }
}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as AIMetaAnalysis;
  } catch (error) {
    console.error('AI meta analysis error:', error);
    return null;
  }
}

async function runAIFixPrioritization(
  issues: { code: string; severity: string; title: string; category: string }[],
  url: string,
  framework?: string
): Promise<AIFixPrioritization | null> {
  if (!openaiApiKey || issues.length === 0) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an SEO strategist who prioritizes fixes by impact and effort. Always respond with valid JSON.`
          },
          {
            role: 'user',
            content: `Prioritize these SEO issues:

URL: ${url}
Framework: ${framework || 'Unknown'}

Issues:
${issues.map(i => `- [${i.severity.toUpperCase()}] ${i.code}: ${i.title} (${i.category})`).join('\n')}

Return JSON with:
{
  "prioritizedIssues": [
    {"issueCode": "<code>", "impactScore": <0-100>, "effortScore": <0-100>, "roiScore": <calculated>, "rationale": "<why>"}
  ],
  "fixBatches": [
    {"batch": <1,2,3...>, "theme": "<batch theme>", "estimatedImpact": "<description>", "issueCodes": [<codes>]}
  ]
}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as AIFixPrioritization;
  } catch (error) {
    console.error('AI prioritization error:', error);
    return null;
  }
}
