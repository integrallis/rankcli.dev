// Free Tool Opportunity Finder
// Implements Bhanu's 7-step playbook for "Engineering as Marketing"
// Finds high-volume, low-difficulty keywords for free tools that drive traffic
// Uses FREE data sources: Google Suggest, Google Trends, SERP scraping

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callChatCompletion, type AIProviderConfig } from '../_shared/ai-provider.ts';
import { decryptSecret } from '../_shared/crypto.ts';

// Import FREE SEO data sources
import {
  getGoogleSuggestions,
  scrapeSERP,
  getGoogleTrends,
  researchKeyword,
} from '../_shared/free-seo-data.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function had NO tier gating at all before this - any caller, any
// tier (even fully anonymous, since projectId is optional and only used
// for saving), got unconditional gpt-4o calls on RankCLI's key, including
// a batched loop in generateToolConcepts that multiplies cost per
// keyword batch. No pricing-tiers.json feature flag or existing paid-tier
// precedent exists for this endpoint, so BYOK is required unconditionally
// here - there's no proven fallback tier to preserve.
async function resolveAIConfig(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string | null
): Promise<{ ok: true; config: AIProviderConfig } | { ok: false }> {
  if (userId) {
    const { data: byok } = await supabase
      .from('user_ai_keys')
      .select('provider, encrypted_key, base_url, model')
      .eq('user_id', userId)
      .single();
    if (byok) {
      const encryptionSecret = Deno.env.get('AI_KEY_ENCRYPTION_SECRET');
      if (encryptionSecret) {
        const apiKey = await decryptSecret(byok.encrypted_key, encryptionSecret);
        return {
          ok: true,
          config: { provider: byok.provider, apiKey, baseUrl: byok.base_url || undefined, model: byok.model || undefined },
        };
      }
    }
  }
  return { ok: false };
}

// ========== BHANU'S 7-STEP METHODOLOGY ==========
/*
Step 1: Go to Ahrefs Keywords Explorer, leave search blank (get ALL keywords)
Step 2: Apply include filters (e.g., "AI" + "generator", "calculator", "converter")
Step 3: Add KD filter < 10 (easy to rank)
Step 4: Add Volume filter > 1000 (worth the effort)
Step 5: List keywords with volume and KD
Step 6: Think of CTAs - how to connect free tool to main product
Step 7: Prioritize: HIGH volume + LOW KD + EASY to build + HIGH relevance
*/

// ========== TYPES ==========

interface ToolOpportunity {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  toolType: 'generator' | 'calculator' | 'converter' | 'checker' | 'analyzer' | 'validator' | 'builder';
  buildEffort: 'easy' | 'medium' | 'hard';
  relevanceToProduct: number; // 0-100
  priorityScore: number; // Calculated
  suggestedCTA: string;
  toolConcept: {
    name: string;
    description: string;
    inputFields: string[];
    outputFormat: string;
    features: string[];
  };
  seoData: {
    suggestedTitle: string;
    suggestedDescription: string;
    suggestedH1: string;
    targetUrl: string;
  };
}

interface ToolOpportunityAnalysis {
  product: string;
  totalOpportunities: number;
  topPriority: ToolOpportunity[];
  quickWins: ToolOpportunity[];
  highVolumeTargets: ToolOpportunity[];
  byToolType: Record<string, number>;
  implementationRoadmap: {
    week1: ToolOpportunity[];
    week2: ToolOpportunity[];
    week3: ToolOpportunity[];
    week4: ToolOpportunity[];
  };
  estimatedMonthlyTraffic: number;
}

// Tool type patterns for keyword discovery
const TOOL_TYPE_PATTERNS = {
  generator: ['generator', 'maker', 'creator', 'builder', 'generate', 'create'],
  calculator: ['calculator', 'calc', 'compute', 'estimate', 'estimator'],
  converter: ['converter', 'convert', 'to', 'transformer', 'translation'],
  checker: ['checker', 'check', 'validator', 'tester', 'verify'],
  analyzer: ['analyzer', 'analysis', 'audit', 'scanner', 'inspector'],
  validator: ['validator', 'validate', 'verification', 'lint', 'format'],
  builder: ['builder', 'template', 'scaffold', 'boilerplate'],
};

// ========== AI FUNCTIONS ==========

async function discoverToolKeywords(
  aiConfig: AIProviderConfig,
  industry: string,
  productDescription: string,
  targetAudience: string
): Promise<{ keyword: string; volume: number; difficulty: number; toolType: string }[]> {
  const systemPrompt = `You are an SEO keyword research expert specializing in "Engineering as Marketing" - finding keywords for free tools that can drive traffic.

Based on Bhanu's methodology:
- Find keywords with patterns like: [topic] generator, [topic] calculator, [topic] converter, [topic] checker
- Focus on keywords with estimated volume 500-10000 (sweet spot for ranking)
- Look for low-competition niches (estimated KD < 30)
- Keywords should relate to the product's target audience

Generate realistic keyword opportunities with estimated metrics based on typical patterns in the industry.`;

  const userPrompt = `Find free tool keyword opportunities for:

Industry: ${industry}
Product: ${productDescription}
Target Audience: ${targetAudience}

Generate 30+ keyword opportunities. For each, provide realistic volume and difficulty estimates.

Tool types to consider:
- Generators: Create text, names, ideas, content
- Calculators: ROI, cost, pricing, savings
- Converters: Format, unit, data type
- Checkers: Validation, verification, testing
- Analyzers: Audit, scan, inspect

Return JSON:
{
  "keywords": [
    {
      "keyword": "keyword phrase generator/calculator/etc",
      "volume": 2400,
      "difficulty": 15,
      "toolType": "generator|calculator|converter|checker|analyzer"
    }
  ]
}`;

  let content: string;
  try {
    content = await callChatCompletion(aiConfig, systemPrompt, userPrompt, {
      jsonMode: true,
      maxTokens: 3000,
      temperature: 0.7,
    });
  } catch {
    throw new Error('Keyword discovery failed');
  }
  return JSON.parse(content).keywords;
}

async function generateToolConcepts(
  aiConfig: AIProviderConfig,
  keywords: { keyword: string; volume: number; difficulty: number; toolType: string }[],
  productDescription: string
): Promise<ToolOpportunity[]> {
  const opportunities: ToolOpportunity[] = [];

  // Process in batches of 10
  for (let i = 0; i < keywords.length; i += 10) {
    const batch = keywords.slice(i, i + 10);

    const systemPrompt = `You are a product designer specializing in free tools that drive traffic (Engineering as Marketing).

For each keyword, design a simple but useful tool that:
1. Solves the user's immediate need
2. Can be built quickly (MVP in hours/days, not weeks)
3. Has a natural CTA to the main product
4. Works entirely client-side (no backend needed)

Rate build effort:
- easy: Simple form + JS logic (1-4 hours)
- medium: More complex UI/logic (4-16 hours)
- hard: Requires API calls or complex algorithms (16+ hours)`;

    const userPrompt = `Design free tool concepts for these keywords:

${batch.map(k => `- ${k.keyword} (vol: ${k.volume}, KD: ${k.difficulty}, type: ${k.toolType})`).join('\n')}

Main product: ${productDescription}

For each keyword, return:
{
  "tools": [
    {
      "keyword": "original keyword",
      "buildEffort": "easy|medium|hard",
      "relevanceToProduct": <0-100 how relevant tool users are to main product>,
      "suggestedCTA": "CTA text to convert users to main product",
      "toolConcept": {
        "name": "Tool Name",
        "description": "What it does in one sentence",
        "inputFields": ["Input 1", "Input 2"],
        "outputFormat": "What user gets (text, download, etc)",
        "features": ["Feature 1", "Feature 2"]
      },
      "seoData": {
        "suggestedTitle": "SEO Title (50-60 chars)",
        "suggestedDescription": "Meta description (150-160 chars)",
        "suggestedH1": "Page H1 heading",
        "targetUrl": "/tools/url-slug"
      }
    }
  ]
}`;

    try {
      const content = await callChatCompletion(aiConfig, systemPrompt, userPrompt, {
        jsonMode: true,
        maxTokens: 3000,
        temperature: 0.4,
      });
      const result = JSON.parse(content);

      for (const tool of result.tools) {
        const originalKw = batch.find(k => k.keyword === tool.keyword);
        if (originalKw) {
          // Calculate priority score using Bhanu's formula:
          // HIGH volume + LOW KD + EASY build + HIGH relevance
          const volumeScore = Math.min(originalKw.volume / 100, 100); // Normalize to 0-100
          const kdScore = 100 - originalKw.difficulty; // Invert so low KD = high score
          const effortScore = tool.buildEffort === 'easy' ? 100 : tool.buildEffort === 'medium' ? 60 : 30;
          const relevanceScore = tool.relevanceToProduct;

          const priorityScore = Math.round(
            (volumeScore * 0.3) + (kdScore * 0.25) + (effortScore * 0.25) + (relevanceScore * 0.2)
          );

          opportunities.push({
            keyword: tool.keyword,
            searchVolume: originalKw.volume,
            keywordDifficulty: originalKw.difficulty,
            toolType: originalKw.toolType as any,
            buildEffort: tool.buildEffort,
            relevanceToProduct: tool.relevanceToProduct,
            priorityScore,
            suggestedCTA: tool.suggestedCTA,
            toolConcept: tool.toolConcept,
            seoData: tool.seoData,
          });
        }
      }
    } catch {
      // Same as the original response.ok check - skip this batch on failure.
    }
  }

  return opportunities.sort((a, b) => b.priorityScore - a.priorityScore);
}

function createImplementationRoadmap(opportunities: ToolOpportunity[]): ToolOpportunityAnalysis['implementationRoadmap'] {
  // Bhanu's approach: Start with quick wins, easy to build, high priority
  const sorted = [...opportunities].sort((a, b) => {
    // First sort by build effort, then by priority
    const effortOrder = { easy: 0, medium: 1, hard: 2 };
    if (effortOrder[a.buildEffort] !== effortOrder[b.buildEffort]) {
      return effortOrder[a.buildEffort] - effortOrder[b.buildEffort];
    }
    return b.priorityScore - a.priorityScore;
  });

  const easyTools = sorted.filter(t => t.buildEffort === 'easy');
  const mediumTools = sorted.filter(t => t.buildEffort === 'medium');
  const hardTools = sorted.filter(t => t.buildEffort === 'hard');

  return {
    week1: easyTools.slice(0, 5), // 5 easy tools in week 1
    week2: [...easyTools.slice(5, 8), ...mediumTools.slice(0, 2)], // 3 easy + 2 medium
    week3: mediumTools.slice(2, 6), // 4 medium tools
    week4: [...mediumTools.slice(6, 8), ...hardTools.slice(0, 2)], // 2 medium + 2 hard
  };
}

// ========== MAIN HANDLER ==========

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    const {
      productDescription,
      industry,
      targetAudience,
      projectId,
    } = body;

    if (!productDescription || !industry) {
      return new Response(JSON.stringify({ error: 'Product description and industry required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // No tier ever legitimately got this feature for free before - BYOK is
    // required unconditionally (see resolveAIConfig's comment above).
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }
    const aiResolution = await resolveAIConfig(supabase, userId);
    if (!aiResolution.ok) {
      return new Response(JSON.stringify({
        error: 'Connect an AI provider key to use the tool opportunity finder - any provider works, including free-tier keys from OpenRouter, Groq, or Google AI Studio. Add one at https://rankcli.dev/account?tab=ai-provider',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const aiConfig = aiResolution.config;

    console.log(`Finding tool opportunities for: ${industry}`);

    // Step 1-4: Discover keywords (Bhanu's filter approach)
    console.log('Discovering keywords...');
    const keywords = await discoverToolKeywords(
      aiConfig,
      industry,
      productDescription,
      targetAudience || 'Developers and business owners'
    );

    console.log(`Found ${keywords.length} keyword opportunities`);

    // Step 5-6: Generate tool concepts with CTAs
    console.log('Generating tool concepts...');
    const opportunities = await generateToolConcepts(aiConfig, keywords, productDescription);

    // Step 7: Prioritize and create roadmap
    console.log('Creating implementation roadmap...');
    const roadmap = createImplementationRoadmap(opportunities);

    // Categorize results
    const byToolType: Record<string, number> = {};
    opportunities.forEach(opp => {
      byToolType[opp.toolType] = (byToolType[opp.toolType] || 0) + 1;
    });

    const topPriority = opportunities.slice(0, 10);
    const quickWins = opportunities.filter(o => o.buildEffort === 'easy').slice(0, 10);
    const highVolumeTargets = [...opportunities]
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .slice(0, 10);

    const estimatedMonthlyTraffic = opportunities
      .slice(0, 10) // Top 10 tools
      .reduce((sum, opp) => sum + Math.round(opp.searchVolume * 0.1), 0); // Estimate 10% CTR

    const result: ToolOpportunityAnalysis = {
      product: productDescription,
      totalOpportunities: opportunities.length,
      topPriority,
      quickWins,
      highVolumeTargets,
      byToolType,
      implementationRoadmap: roadmap,
      estimatedMonthlyTraffic,
    };

    // Save to database
    if (projectId) {
      await supabase.from('tool_opportunities').insert({
        project_id: projectId,
        product_description: productDescription,
        industry,
        total_opportunities: opportunities.length,
        opportunities: opportunities,
        roadmap: roadmap,
        estimated_traffic: estimatedMonthlyTraffic,
        created_at: new Date().toISOString(),
      });
    }

    console.log(`Found ${opportunities.length} tool opportunities, estimated ${estimatedMonthlyTraffic} monthly traffic`);

    return new Response(JSON.stringify({
      success: true,
      ...result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Tool opportunity finder error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
