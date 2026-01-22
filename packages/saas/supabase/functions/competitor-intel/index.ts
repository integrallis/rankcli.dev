// AI Competitor Intelligence Module
// Deep competitive analysis that SEO experts do manually
// Uses FREE data sources: SERP scraping to find real competitors
// Analyzes competitor content, keywords, technical SEO, and identifies gaps

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import FREE SEO data sources
import {
  scrapeSERP,
  getGoogleSuggestions,
  researchKeyword,
} from '../_shared/free-seo-data.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== TYPES ==========

interface CompetitorProfile {
  domain: string;
  estimatedTraffic: string;
  estimatedDR: number;
  topKeywords: string[];
  contentStrategy: {
    blogFrequency: string;
    avgWordCount: number;
    contentTypes: string[];
    topPerformingContent: string[];
  };
  technicalSEO: {
    loadSpeed: string;
    mobileOptimized: boolean;
    schemaTypes: string[];
    coreWebVitals: string;
  };
  socialPresence: {
    platforms: string[];
    engagement: string;
  };
  strengths: string[];
  weaknesses: string[];
}

interface CompetitiveGap {
  type: 'keyword' | 'content' | 'feature' | 'technical' | 'backlink';
  description: string;
  competitorsCovering: string[];
  opportunity: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedImpact: string;
  actionItems: string[];
}

interface CompetitorIntelligence {
  yourDomain: string;
  competitors: CompetitorProfile[];
  competitivePosition: {
    marketPosition: string;
    strengthsVsCompetitors: string[];
    weaknessesVsCompetitors: string[];
    uniqueAdvantages: string[];
  };
  gaps: CompetitiveGap[];
  keywordOpportunities: {
    keyword: string;
    volume: number;
    difficulty: number;
    competitorRanking: { competitor: string; position: number }[];
    yourPosition: number | null;
    opportunity: string;
  }[];
  contentOpportunities: {
    topic: string;
    competitorsCovering: string[];
    suggestedAngle: string;
    estimatedTraffic: string;
    contentBrief: string;
  }[];
  strategicRecommendations: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
}

// ========== AI ANALYSIS FUNCTIONS ==========

async function analyzeCompetitor(competitorUrl: string, yourDomain: string): Promise<CompetitorProfile> {
  // Fetch competitor page
  let competitorHtml = '';
  try {
    const response = await fetch(competitorUrl, {
      headers: { 'User-Agent': 'RankCLI/1.0 (+https://rankcli.dev)' }
    });
    if (response.ok) {
      competitorHtml = await response.text();
    }
  } catch (e) {
    console.log(`Could not fetch ${competitorUrl}`);
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a competitive intelligence analyst specializing in SEO and digital marketing. Analyze competitor websites thoroughly and provide actionable insights.

Base your analysis on:
1. The HTML/content provided
2. Your knowledge of the domain/industry
3. Common patterns in successful sites

Be realistic and specific in your estimates.`
        },
        {
          role: 'user',
          content: `Analyze this competitor website: ${competitorUrl}

${competitorHtml ? `Homepage HTML (first 3000 chars): ${competitorHtml.substring(0, 3000)}` : 'Could not fetch HTML - use your knowledge of this domain'}

Return a detailed competitor profile as JSON:
{
  "domain": "${new URL(competitorUrl).hostname}",
  "estimatedTraffic": "10K-50K monthly",
  "estimatedDR": 45,
  "topKeywords": ["keyword1", "keyword2", ...],
  "contentStrategy": {
    "blogFrequency": "2-3 posts/week",
    "avgWordCount": 1500,
    "contentTypes": ["blog", "guides", "tools"],
    "topPerformingContent": ["Title of top content"]
  },
  "technicalSEO": {
    "loadSpeed": "fast|medium|slow",
    "mobileOptimized": true,
    "schemaTypes": ["Organization", "WebPage"],
    "coreWebVitals": "good|needs-improvement|poor"
  },
  "socialPresence": {
    "platforms": ["Twitter", "LinkedIn"],
    "engagement": "high|medium|low"
  },
  "strengths": ["Strong brand", "Good content"],
  "weaknesses": ["Slow site", "Poor mobile"]
}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error(`Failed to analyze ${competitorUrl}`);

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function identifyCompetitiveGaps(
  yourDomain: string,
  competitors: CompetitorProfile[]
): Promise<CompetitiveGap[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a competitive strategy expert. Identify gaps between a site and its competitors that represent opportunities.

Focus on:
1. Keywords competitors rank for that the target doesn't
2. Content topics competitors cover that the target doesn't
3. Features/tools competitors have that the target doesn't
4. Technical advantages competitors have
5. Backlink sources competitors use

Prioritize gaps by potential impact and difficulty to close.`
        },
        {
          role: 'user',
          content: `Identify competitive gaps for ${yourDomain}

Competitor Profiles:
${competitors.map(c => `
${c.domain}:
- Traffic: ${c.estimatedTraffic}
- Top Keywords: ${c.topKeywords.join(', ')}
- Strengths: ${c.strengths.join(', ')}
- Content Types: ${c.contentStrategy.contentTypes.join(', ')}
`).join('\n')}

Return JSON:
{
  "gaps": [
    {
      "type": "keyword|content|feature|technical|backlink",
      "description": "Specific gap description",
      "competitorsCovering": ["competitor1.com"],
      "opportunity": "Why this is an opportunity",
      "priority": "critical|high|medium|low",
      "estimatedImpact": "Traffic/revenue impact",
      "actionItems": ["Step 1", "Step 2"]
    }
  ]
}`
        }
      ],
      max_tokens: 3000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error('Failed to identify gaps');

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content).gaps;
}

async function generateStrategicRecommendations(
  yourDomain: string,
  competitors: CompetitorProfile[],
  gaps: CompetitiveGap[]
): Promise<CompetitorIntelligence['strategicRecommendations']> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a strategic SEO consultant. Create actionable recommendations based on competitive analysis.

Recommendations should be:
1. Specific and actionable (not generic advice)
2. Prioritized by impact and effort
3. Organized by time horizon (short/medium/long term)
4. Based on the actual gaps identified`
        },
        {
          role: 'user',
          content: `Create strategic recommendations for ${yourDomain}

Competitive Gaps:
${gaps.map(g => `- [${g.priority}] ${g.type}: ${g.description}`).join('\n')}

Competitor Strengths to Counter:
${competitors.flatMap(c => c.strengths).slice(0, 10).join('\n')}

Return JSON:
{
  "shortTerm": ["Action 1 (1-2 weeks)", "Action 2"],
  "mediumTerm": ["Action 1 (1-3 months)", "Action 2"],
  "longTerm": ["Action 1 (3-6 months)", "Action 2"]
}`
        }
      ],
      max_tokens: 1500,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error('Failed to generate recommendations');

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function findKeywordOpportunities(
  yourDomain: string,
  competitors: CompetitorProfile[]
): Promise<CompetitorIntelligence['keywordOpportunities']> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an SEO keyword analyst. Identify keyword opportunities based on competitor analysis.

Focus on:
1. Keywords competitors rank for that the target likely doesn't
2. Keywords with good volume and achievable difficulty
3. Keywords that align with the target's likely business goals`
        },
        {
          role: 'user',
          content: `Find keyword opportunities for ${yourDomain}

Competitor keywords:
${competitors.map(c => `${c.domain}: ${c.topKeywords.join(', ')}`).join('\n')}

Return 15+ keyword opportunities as JSON:
{
  "opportunities": [
    {
      "keyword": "keyword phrase",
      "volume": 1200,
      "difficulty": 35,
      "competitorRanking": [{"competitor": "competitor.com", "position": 3}],
      "yourPosition": null,
      "opportunity": "Why this is a good opportunity"
    }
  ]
}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error('Failed to find keyword opportunities');

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content).opportunities;
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
      yourDomain,
      competitorUrls,
      targetKeywords,
      projectId,
      depth = 'standard', // 'quick' | 'standard' | 'deep'
    } = body;

    if (!yourDomain) {
      return new Response(JSON.stringify({ error: 'Your domain required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing competitors for ${yourDomain}`);
    console.log('Using FREE data sources: SERP scraping for competitor discovery');

    // Auto-discover competitors from SERP if not provided (FREE)
    let actualCompetitorUrls = competitorUrls || [];

    if (actualCompetitorUrls.length === 0 && targetKeywords?.length) {
      console.log('Auto-discovering competitors from SERP (FREE)...');
      const discoveredDomains = new Set<string>();

      for (const keyword of targetKeywords.slice(0, 3)) {
        try {
          const serp = await scrapeSERP(keyword);
          if (serp?.organicResults) {
            for (const result of serp.organicResults) {
              // Don't include own domain
              if (!result.domain.includes(yourDomain.replace(/^https?:\/\//, '').replace(/^www\./, ''))) {
                discoveredDomains.add(`https://${result.domain}`);
              }
            }
          }
        } catch (e) {
          console.log(`SERP scraping failed for ${keyword}`);
        }
        await new Promise(r => setTimeout(r, 500)); // Rate limit
      }

      actualCompetitorUrls = Array.from(discoveredDomains).slice(0, 5);
      console.log(`Discovered ${actualCompetitorUrls.length} competitors from SERP`);
    }

    if (actualCompetitorUrls.length === 0) {
      return new Response(JSON.stringify({ error: 'Competitor URLs required (or provide target keywords for auto-discovery)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Analyze each competitor
    console.log('Analyzing competitor profiles...');
    const competitors: CompetitorProfile[] = [];

    for (const url of actualCompetitorUrls.slice(0, 5)) { // Limit to 5 competitors
      try {
        const profile = await analyzeCompetitor(url, yourDomain);
        competitors.push(profile);
        console.log(`Analyzed ${profile.domain}`);
      } catch (e) {
        console.error(`Failed to analyze ${url}:`, e);
      }
    }

    // Step 2: Identify competitive gaps
    console.log('Identifying competitive gaps...');
    const gaps = await identifyCompetitiveGaps(yourDomain, competitors);

    // Step 3: Find keyword opportunities
    console.log('Finding keyword opportunities...');
    const keywordOpportunities = await findKeywordOpportunities(yourDomain, competitors);

    // Step 4: Generate strategic recommendations
    console.log('Generating strategic recommendations...');
    const recommendations = await generateStrategicRecommendations(yourDomain, competitors, gaps);

    // Step 5: Determine competitive position
    const competitivePosition = {
      marketPosition: competitors.length > 0
        ? `Competing with ${competitors.length} identified competitors`
        : 'Market position analysis pending',
      strengthsVsCompetitors: gaps.filter(g => g.priority === 'low').map(g => g.description),
      weaknessesVsCompetitors: gaps.filter(g => g.priority === 'critical' || g.priority === 'high').map(g => g.description),
      uniqueAdvantages: ['Analyze your unique value proposition'],
    };

    // Step 6: Generate content opportunities from gaps
    const contentOpportunities = gaps
      .filter(g => g.type === 'content')
      .map(g => ({
        topic: g.description,
        competitorsCovering: g.competitorsCovering,
        suggestedAngle: g.opportunity,
        estimatedTraffic: g.estimatedImpact,
        contentBrief: g.actionItems.join('; '),
      }));

    const result: CompetitorIntelligence = {
      yourDomain,
      competitors,
      competitivePosition,
      gaps,
      keywordOpportunities,
      contentOpportunities,
      strategicRecommendations: recommendations,
    };

    // Save to database
    if (projectId) {
      await supabase.from('competitor_analyses').insert({
        project_id: projectId,
        your_domain: yourDomain,
        competitor_count: competitors.length,
        competitors: competitors,
        gaps: gaps,
        keyword_opportunities: keywordOpportunities,
        recommendations: recommendations,
        created_at: new Date().toISOString(),
      });
    }

    console.log('Competitor analysis complete!');

    return new Response(JSON.stringify({
      success: true,
      ...result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Competitor intel error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
