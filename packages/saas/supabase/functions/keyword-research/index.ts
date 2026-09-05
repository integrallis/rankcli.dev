// AI-Powered Keyword Research Engine
// Uses FREE/OPEN data sources: Google Suggest, Google Trends, Wikipedia, SERP scraping
// Implements KGR (Keyword Golden Ratio), semantic clustering, and opportunity scoring

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callChatCompletion, type AIProviderConfig } from '../_shared/ai-provider.ts';
import { decryptSecret } from '../_shared/crypto.ts';

// Import FREE SEO data sources
import {
  getGoogleSuggestions,
  expandKeywordsAlphabet,
  getGoogleTrends,
  getWikipediaData,
  scrapeSERP,
  discoverKeywords,
  researchKeyword,
  researchKeywords,
  calculateKGR,
  isGoldenKeyword,
  estimateSearchVolume,
  estimateKeywordDifficulty,
  classifyIntent,
  type KeywordMetrics,
  type TrendData,
  type SERPFeatures,
} from '../_shared/free-seo-data.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

// This function had NO tier gating at all before this - aiExpandKeywords
// alone ran on every request regardless of caller/tier, including
// 'discover-only' mode. pricing-tiers.json's keyword_research feature is
// true for solo/pro/agency (and ai_analysis, the closest equivalent, for
// all three LTD tiers) - only those qualify for RankCLI's key as a
// fallback; BYOK wins for every tier, free included.
const RANKCLI_KEY_FALLBACK_TIERS = new Set([
  'solo', 'pro', 'agency', 'pro_founding', 'ltd_starter', 'ltd_pro', 'ltd_agency',
]);

type AIConfigResolution =
  | { ok: true; config: AIProviderConfig }
  | { ok: false; reason: 'no_key_byok_required' };

// deno-lint-ignore no-explicit-any
async function resolveAIConfig(supabase: any, authHeader: string | null): Promise<AIConfigResolution> {
  let userId: string | null = null;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    userId = user?.id || null;
  }

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

  let tier = 'free';
  if (userId) {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan:subscription_plans (plan_id)')
      .eq('user_id', userId)
      .single();
    const plan = subscription?.plan as { plan_id: string } | null;
    tier = plan?.plan_id || 'free';
  }

  if (!RANKCLI_KEY_FALLBACK_TIERS.has(tier)) {
    return { ok: false, reason: 'no_key_byok_required' };
  }
  return { ok: true, config: { provider: 'openai', apiKey: openaiApiKey, model: 'gpt-4o-mini' } };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== TYPES ==========

interface KeywordData {
  keyword: string;
  searchVolume: number;
  volumeCategory: string;
  difficulty: number;
  difficultyCategory: string;
  cpc: number;
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  kgr: number | null;
  opportunityScore: number;
  serpFeatures: string[];
  isGoldenKeyword: boolean;
  trend: string;
  confidence: number;
  source: string;
  cluster?: string;
}

interface KeywordCluster {
  name: string;
  intent: string;
  keywords: KeywordData[];
  totalVolume: number;
  avgDifficulty: number;
  topOpportunity: KeywordData;
}

interface ContentBrief {
  targetKeyword: string;
  secondaryKeywords: string[];
  suggestedTitle: string;
  suggestedH2s: string[];
  wordCountTarget: number;
  contentType: string;
  searchIntent: string;
  competitorInsights: string[];
  outline: string[];
  paaQuestions: string[];
  relatedSearches: string[];
}

interface KeywordResearchResult {
  seedKeyword: string;
  totalKeywords: number;
  goldenKeywords: KeywordData[];
  quickWins: KeywordData[];
  highVolume: KeywordData[];
  clusters: KeywordCluster[];
  contentBriefs: ContentBrief[];
  competitorGaps: KeywordData[];
  dataSources: string[];
}

// ========== FREE DATA SOURCE INTEGRATION ==========

async function gatherKeywordsFromFreeSources(
  seedKeyword: string,
  industry?: string
): Promise<{ keyword: string; source: string }[]> {
  console.log('Gathering keywords from FREE sources...');

  const allKeywords: { keyword: string; source: string }[] = [];
  const seen = new Set<string>();

  // Source 1: Google Suggest (alphabet soup expansion)
  console.log('  -> Google Suggest API...');
  try {
    const suggestKeywords = await expandKeywordsAlphabet(seedKeyword);
    for (const kw of suggestKeywords) {
      if (!seen.has(kw.keyword.toLowerCase())) {
        seen.add(kw.keyword.toLowerCase());
        allKeywords.push({ keyword: kw.keyword, source: 'google_suggest' });
      }
    }
    console.log(`     Found ${suggestKeywords.length} from Google Suggest`);
  } catch (e) {
    console.log('     Google Suggest failed:', e);
  }

  // Source 2: Google Trends related queries
  console.log('  -> Google Trends API...');
  try {
    const trends = await getGoogleTrends({ keyword: seedKeyword });
    if (trends?.relatedQueries) {
      for (const rq of trends.relatedQueries) {
        if (!seen.has(rq.keyword.toLowerCase())) {
          seen.add(rq.keyword.toLowerCase());
          allKeywords.push({ keyword: rq.keyword, source: 'google_trends' });
        }
      }
      console.log(`     Found ${trends.relatedQueries.length} from Google Trends`);
    }
  } catch (e) {
    console.log('     Google Trends failed:', e);
  }

  // Source 3: SERP - People Also Ask & Related Searches
  console.log('  -> SERP scraping (PAA, Related)...');
  try {
    const serp = await scrapeSERP(seedKeyword);
    if (serp) {
      for (const paa of serp.features.peopleAlsoAsk) {
        if (!seen.has(paa.toLowerCase())) {
          seen.add(paa.toLowerCase());
          allKeywords.push({ keyword: paa, source: 'people_also_ask' });
        }
      }
      for (const rs of serp.features.relatedSearches) {
        if (!seen.has(rs.toLowerCase())) {
          seen.add(rs.toLowerCase());
          allKeywords.push({ keyword: rs, source: 'related_searches' });
        }
      }
      console.log(`     Found ${serp.features.peopleAlsoAsk.length} PAA, ${serp.features.relatedSearches.length} related`);
    }
  } catch (e) {
    console.log('     SERP scraping failed:', e);
  }

  // Source 4: Wikipedia related topics
  console.log('  -> Wikipedia API...');
  try {
    const wiki = await getWikipediaData(seedKeyword);
    if (wiki?.relatedTopics) {
      for (const topic of wiki.relatedTopics.slice(0, 15)) {
        if (!seen.has(topic.toLowerCase())) {
          seen.add(topic.toLowerCase());
          allKeywords.push({ keyword: topic, source: 'wikipedia' });
        }
      }
      console.log(`     Found ${wiki.relatedTopics.length} from Wikipedia`);
    }
  } catch (e) {
    console.log('     Wikipedia failed:', e);
  }

  console.log(`Total keywords from FREE sources: ${allKeywords.length}`);
  return allKeywords;
}

async function analyzeKeywordsWithFreeData(
  keywords: { keyword: string; source: string }[]
): Promise<KeywordData[]> {
  console.log(`Analyzing ${keywords.length} keywords with FREE data sources...`);

  const analyzed: KeywordData[] = [];

  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(keywords.length / batchSize)}`);

    for (const kw of batch) {
      try {
        // Get metrics from free sources
        const metrics = await researchKeyword(kw.keyword);

        // Calculate opportunity score
        const intentMultiplier =
          metrics.intent === 'transactional' ? 1.5 :
          metrics.intent === 'commercial' ? 1.3 :
          metrics.intent === 'informational' ? 1.0 : 0.8;

        const trendMultiplier =
          metrics.trend === 'breakout' ? 2.0 :
          metrics.trend === 'rising' ? 1.5 :
          metrics.trend === 'stable' ? 1.0 : 0.7;

        const opportunityScore = Math.round(
          (metrics.searchVolume / Math.max(metrics.difficulty, 1)) *
          intentMultiplier *
          trendMultiplier
        );

        analyzed.push({
          keyword: kw.keyword,
          searchVolume: metrics.searchVolume,
          volumeCategory: metrics.volumeCategory,
          difficulty: metrics.difficulty,
          difficultyCategory: metrics.difficultyCategory,
          cpc: metrics.cpc,
          intent: metrics.intent,
          kgr: metrics.kgr,
          opportunityScore,
          serpFeatures: [], // Would need more SERP data
          isGoldenKeyword: metrics.isGoldenKeyword,
          trend: metrics.trend,
          confidence: metrics.confidence,
          source: kw.source,
        });
      } catch (e) {
        console.log(`     Failed to analyze "${kw.keyword}":`, e);
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 300));
    }
  }

  return analyzed;
}

// ========== AI-ENHANCED FUNCTIONS ==========
// AI is used for clustering, content briefs, and gap analysis
// NOT for keyword metrics - those come from free data sources

async function aiExpandKeywords(
  aiConfig: AIProviderConfig,
  seedKeyword: string,
  existingKeywords: string[],
  industry?: string
): Promise<string[]> {
  // Use AI to suggest additional keywords we might have missed
  const systemPrompt = `You are an SEO expert. Given a seed keyword and existing keyword list, suggest additional keywords that might be missing. Focus on:
- Long-tail variations (4+ words)
- Question-based keywords
- Comparison keywords (vs, alternative)
- Commercial modifiers
- Niche subtopics

Only suggest keywords NOT already in the existing list.`;

  const userPrompt = `Seed keyword: "${seedKeyword}"
${industry ? `Industry: ${industry}` : ''}

Existing keywords (${existingKeywords.length}):
${existingKeywords.slice(0, 50).join('\n')}

Suggest 20 additional keywords NOT in this list.
Return JSON: { "keywords": ["kw1", "kw2", ...] }`;

  try {
    const content = await callChatCompletion(aiConfig, systemPrompt, userPrompt, {
      jsonMode: true,
      maxTokens: 1000,
      temperature: 0.7,
    });
    return JSON.parse(content).keywords || [];
  } catch {
    return [];
  }
}

async function clusterKeywords(aiConfig: AIProviderConfig, keywords: KeywordData[]): Promise<KeywordCluster[]> {
  const systemPrompt = `You are an SEO content strategist. Group keywords into topical clusters that can each target a single piece of content. Each cluster should:
- Have a clear topical theme
- Target a specific search intent
- Be suitable for one comprehensive article/page`;

  const userPrompt = `Cluster these keywords by topic:

${keywords.slice(0, 50).map(k => `${k.keyword} (vol: ${k.searchVolume}, diff: ${k.difficulty}, intent: ${k.intent})`).join('\n')}

Return JSON:
{
  "clusters": [
    {
      "name": "Cluster Name",
      "intent": "primary intent",
      "keywords": ["keyword1", "keyword2", ...]
    }
  ]
}`;

  let jsonContent: string;
  try {
    jsonContent = await callChatCompletion(aiConfig, systemPrompt, userPrompt, {
      jsonMode: true,
      maxTokens: 2000,
      temperature: 0.3,
    });
  } catch {
    throw new Error('Failed to cluster keywords');
  }
  const content = JSON.parse(jsonContent);

  return content.clusters.map((cluster: any) => {
    const clusterKeywords = keywords.filter(k =>
      cluster.keywords.some((ck: string) => ck.toLowerCase() === k.keyword.toLowerCase())
    );

    clusterKeywords.forEach(k => k.cluster = cluster.name);

    const totalVolume = clusterKeywords.reduce((sum, k) => sum + k.searchVolume, 0);
    const avgDifficulty = clusterKeywords.length > 0
      ? Math.round(clusterKeywords.reduce((sum, k) => sum + k.difficulty, 0) / clusterKeywords.length)
      : 0;

    const topOpportunity = clusterKeywords.reduce((best, k) =>
      k.opportunityScore > (best?.opportunityScore || 0) ? k : best
    , clusterKeywords[0]);

    return {
      name: cluster.name,
      intent: cluster.intent,
      keywords: clusterKeywords,
      totalVolume,
      avgDifficulty,
      topOpportunity,
    };
  });
}

async function generateContentBriefs(
  aiConfig: AIProviderConfig,
  clusters: KeywordCluster[],
  serpData: Map<string, SERPFeatures>
): Promise<ContentBrief[]> {
  const topClusters = clusters
    .sort((a, b) => (b.totalVolume / Math.max(b.avgDifficulty, 1)) - (a.totalVolume / Math.max(a.avgDifficulty, 1)))
    .slice(0, 5);

  const briefs: ContentBrief[] = [];

  for (const cluster of topClusters) {
    // Get PAA and related searches from our free SERP data
    const primaryKeyword = cluster.topOpportunity.keyword;
    const serpFeatures = serpData.get(primaryKeyword) || {
      peopleAlsoAsk: [],
      relatedSearches: [],
      featuredSnippet: false,
      localPack: false,
      knowledgePanel: false,
      imageCarousel: false,
      videoCarousel: false,
      topStories: false,
    };

    const systemPrompt = `You are an SEO content strategist. Create comprehensive content briefs that will rank for target keywords.`;

    const userPrompt = `Create a content brief:

Cluster: ${cluster.name}
Primary Keyword: ${primaryKeyword}
Secondary Keywords: ${cluster.keywords.slice(0, 10).map(k => k.keyword).join(', ')}
Search Intent: ${cluster.intent}
Combined Volume: ${cluster.totalVolume}
Avg Difficulty: ${cluster.avgDifficulty}

People Also Ask questions to answer:
${serpFeatures.peopleAlsoAsk.slice(0, 5).join('\n')}

Related searches to cover:
${serpFeatures.relatedSearches.slice(0, 5).join('\n')}

Return JSON:
{
  "suggestedTitle": "SEO-optimized title",
  "suggestedH2s": ["H2 1", "H2 2", ...],
  "wordCountTarget": 1500,
  "contentType": "guide/listicle/comparison/tutorial",
  "outline": ["Intro", "Section 1", ...],
  "competitorInsights": ["Insight 1", ...]
}`;

    try {
      const jsonContent = await callChatCompletion(aiConfig, systemPrompt, userPrompt, {
        jsonMode: true,
        maxTokens: 1500,
        temperature: 0.5,
      });
      const content = JSON.parse(jsonContent);

      briefs.push({
        targetKeyword: primaryKeyword,
        secondaryKeywords: cluster.keywords.slice(1, 10).map(k => k.keyword),
        searchIntent: cluster.intent,
        paaQuestions: serpFeatures.peopleAlsoAsk,
        relatedSearches: serpFeatures.relatedSearches,
        ...content,
      });
    } catch {
      // Same as the original response.ok check - skip this brief on failure.
    }
  }

  return briefs;
}

async function findCompetitorGaps(aiConfig: AIProviderConfig, url: string, keywords: KeywordData[]): Promise<KeywordData[]> {
  const systemPrompt = `You are an SEO analyst. Given a website and keywords, identify which keywords represent opportunities - keywords the site likely doesn't rank for but should target.`;

  const userPrompt = `Website: ${url}

Keywords to analyze:
${keywords.slice(0, 30).map(k => `${k.keyword} (vol: ${k.searchVolume}, diff: ${k.difficulty})`).join('\n')}

Identify the top 10 keywords that are likely GAPS.
Return JSON: { "gapKeywords": ["keyword1", "keyword2", ...] }`;

  let content: { gapKeywords: string[] };
  try {
    const jsonContent = await callChatCompletion(aiConfig, systemPrompt, userPrompt, {
      jsonMode: true,
      maxTokens: 500,
      temperature: 0.3,
    });
    content = JSON.parse(jsonContent);
  } catch {
    return [];
  }

  return keywords.filter(k =>
    content.gapKeywords.some((gk: string) => gk.toLowerCase() === k.keyword.toLowerCase())
  );
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
      seedKeyword,
      projectId,
      url,
      industry,
      competitors,
      mode = 'full', // 'full' | 'quick' | 'discover-only'
      includeFilters,
      excludeFilters,
    } = body;

    if (!seedKeyword) {
      return new Response(JSON.stringify({ error: 'Seed keyword required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResolution = await resolveAIConfig(supabase, req.headers.get('Authorization'));
    if (!aiResolution.ok) {
      return new Response(JSON.stringify({
        error: 'Connect an AI provider key to run keyword research on the free plan - any provider works, including free-tier keys from OpenRouter, Groq, or Google AI Studio. Add one at https://rankcli.dev/account?tab=ai-provider',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const aiConfig = aiResolution.config;

    console.log(`Starting keyword research for: "${seedKeyword}"`);
    console.log('Using FREE data sources: Google Suggest, Google Trends, Wikipedia, SERP');

    const dataSources: string[] = [];

    // Step 1: Gather keywords from FREE sources
    console.log('\n=== STEP 1: Keyword Discovery (FREE sources) ===');
    let rawKeywords = await gatherKeywordsFromFreeSources(seedKeyword, industry);
    dataSources.push('google_suggest', 'google_trends', 'serp_scraping', 'wikipedia');

    // Step 2: AI expansion to fill gaps
    console.log('\n=== STEP 2: AI-Enhanced Expansion ===');
    const existingKws = rawKeywords.map(k => k.keyword);
    const aiKeywords = await aiExpandKeywords(aiConfig, seedKeyword, existingKws, industry);
    console.log(`AI suggested ${aiKeywords.length} additional keywords`);

    const seen = new Set(existingKws.map(k => k.toLowerCase()));
    for (const kw of aiKeywords) {
      if (!seen.has(kw.toLowerCase())) {
        seen.add(kw.toLowerCase());
        rawKeywords.push({ keyword: kw, source: 'ai_expansion' });
      }
    }

    // Apply filters if provided
    if (includeFilters?.length) {
      rawKeywords = rawKeywords.filter(kw =>
        includeFilters.some((f: string) => kw.keyword.toLowerCase().includes(f.toLowerCase()))
      );
    }
    if (excludeFilters?.length) {
      rawKeywords = rawKeywords.filter(kw =>
        !excludeFilters.some((f: string) => kw.keyword.toLowerCase().includes(f.toLowerCase()))
      );
    }

    console.log(`Total keywords to analyze: ${rawKeywords.length}`);

    if (mode === 'discover-only') {
      return new Response(JSON.stringify({
        success: true,
        seedKeyword,
        keywords: rawKeywords,
        dataSources,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Analyze keywords with FREE data
    console.log('\n=== STEP 3: Keyword Analysis (FREE data) ===');
    const analyzedKeywords = await analyzeKeywordsWithFreeData(rawKeywords.slice(0, 100)); // Limit for rate limits

    // Store SERP data for content briefs
    const serpDataMap = new Map<string, SERPFeatures>();

    // Step 4: Categorize keywords
    console.log('\n=== STEP 4: Categorization ===');

    // Golden keywords (KGR < 0.25)
    const goldenKeywords = analyzedKeywords
      .filter(k => k.isGoldenKeyword)
      .sort((a, b) => b.searchVolume - a.searchVolume);
    console.log(`Golden keywords (KGR < 0.25): ${goldenKeywords.length}`);

    // Quick wins (low difficulty, decent volume)
    const quickWins = analyzedKeywords
      .filter(k => k.difficulty < 30 && k.searchVolume > 100)
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 10);
    console.log(`Quick wins: ${quickWins.length}`);

    // High volume opportunities
    const highVolume = analyzedKeywords
      .filter(k => k.searchVolume > 500)
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 10);
    console.log(`High volume: ${highVolume.length}`);

    if (mode === 'quick') {
      return new Response(JSON.stringify({
        success: true,
        seedKeyword,
        totalKeywords: analyzedKeywords.length,
        goldenKeywords,
        quickWins,
        highVolume,
        dataSources,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 5: Cluster keywords
    console.log('\n=== STEP 5: Semantic Clustering ===');
    const clusters = await clusterKeywords(aiConfig, analyzedKeywords);
    console.log(`Created ${clusters.length} keyword clusters`);

    // Step 6: Generate content briefs
    console.log('\n=== STEP 6: Content Briefs ===');
    const contentBriefs = await generateContentBriefs(aiConfig, clusters, serpDataMap);
    console.log(`Generated ${contentBriefs.length} content briefs`);

    // Step 7: Find competitor gaps
    let competitorGaps: KeywordData[] = [];
    if (url) {
      console.log('\n=== STEP 7: Competitor Gap Analysis ===');
      competitorGaps = await findCompetitorGaps(aiConfig, url, analyzedKeywords);
      console.log(`Found ${competitorGaps.length} competitor gaps`);
    }

    const result: KeywordResearchResult = {
      seedKeyword,
      totalKeywords: analyzedKeywords.length,
      goldenKeywords,
      quickWins,
      highVolume,
      clusters,
      contentBriefs,
      competitorGaps,
      dataSources,
    };

    // Save to database
    if (projectId) {
      await supabase.from('keyword_research').insert({
        project_id: projectId,
        seed_keyword: seedKeyword,
        total_keywords: analyzedKeywords.length,
        golden_keywords: goldenKeywords,
        quick_wins: quickWins,
        clusters: clusters,
        content_briefs: contentBriefs,
        competitor_gaps: competitorGaps,
        created_at: new Date().toISOString(),
      });
    }

    console.log('\n=== KEYWORD RESEARCH COMPLETE ===');
    console.log(`Data sources used: ${dataSources.join(', ')}`);
    console.log('NO PAID APIs USED - all data from free/open sources!');

    return new Response(JSON.stringify({
      success: true,
      ...result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Keyword research error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
