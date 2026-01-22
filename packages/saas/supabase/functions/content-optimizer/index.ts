// AI Content Optimizer
// Analyzes content against SERP competitors and provides optimization recommendations
// Uses FREE data sources: Google SERP scraping, Google Trends, Wikipedia
// Does what SEO experts do manually: SERP analysis, content gaps, semantic optimization

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import FREE SEO data sources
import {
  scrapeSERP,
  getGoogleTrends,
  getWikipediaData,
  getGoogleSuggestions,
} from '../_shared/free-seo-data.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== TYPES ==========

interface ContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensity: number;
  headingStructure: { level: number; text: string }[];
  paragraphCount: number;
  avgSentenceLength: number;
  internalLinks: number;
  externalLinks: number;
  images: { src: string; alt: string | null }[];
}

interface CompetitorInsight {
  url: string;
  title: string;
  wordCount: number;
  headings: string[];
  uniqueTopics: string[];
  schemaTypes: string[];
}

interface ContentOptimization {
  currentScore: number;
  targetScore: number;

  titleOptimization: {
    current: string;
    issues: string[];
    suggestions: string[];
    optimizedTitle: string;
  };

  metaDescription: {
    current: string;
    issues: string[];
    suggestions: string[];
    optimizedDescription: string;
  };

  contentGaps: {
    topic: string;
    importance: 'critical' | 'high' | 'medium';
    competitorsCovering: number;
    suggestedSection: {
      heading: string;
      outline: string[];
      targetWordCount: number;
    };
  }[];

  keywordOptimization: {
    primaryKeyword: string;
    currentDensity: number;
    targetDensity: number;
    secondaryKeywords: {
      keyword: string;
      currentCount: number;
      suggestedCount: number;
      placements: string[];
    }[];
    lsiKeywords: string[];
  };

  structureImprovements: {
    issue: string;
    current: string;
    suggested: string;
    impact: string;
  }[];

  serpFeatureTargeting: {
    feature: string;
    currentlyEligible: boolean;
    requirements: string[];
    optimizationSteps: string[];
  }[];

  readabilityImprovements: {
    currentScore: number;
    targetScore: number;
    issues: { issue: string; examples: string[]; fix: string }[];
  };

  internalLinkingSuggestions: {
    anchorText: string;
    targetUrl: string;
    context: string;
  }[];
}

// ========== HELPER FUNCTIONS ==========

async function fetchAndParseContent(url: string): Promise<{
  html: string;
  text: string;
  title: string;
  description: string;
  headings: { level: number; text: string }[];
}> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'RankCLI/1.0 (+https://rankcli.dev)' }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Extract headings
  const headings: { level: number; text: string }[] = [];
  const headingRegex = /<h([1-6])[^>]*>([^<]*)<\/h[1-6]>/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: match[2].replace(/<[^>]*>/g, '').trim()
    });
  }

  // Extract text content (simplified)
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { html, text, title, description, headings };
}

// ========== AI ANALYSIS FUNCTIONS ==========

async function analyzeContentWithAI(
  content: { text: string; title: string; description: string; headings: { level: number; text: string }[] },
  targetKeyword: string,
  competitorContent?: string[]
): Promise<ContentOptimization> {
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
          content: `You are an expert SEO content optimizer. Analyze content and provide specific, actionable recommendations to improve rankings.

Your analysis should be:
1. Data-driven (based on content analysis, not generic advice)
2. Specific (exact changes, not vague suggestions)
3. Prioritized (focus on high-impact changes first)
4. Actionable (can be implemented immediately)

Consider:
- Search intent alignment
- Content comprehensiveness vs competitors
- Keyword optimization (natural, not stuffed)
- SERP feature eligibility (featured snippets, PAA, etc.)
- E-E-A-T signals
- Readability and user experience`
        },
        {
          role: 'user',
          content: `Analyze this content for the keyword "${targetKeyword}":

TITLE: ${content.title}
META DESCRIPTION: ${content.description}
HEADINGS: ${content.headings.map(h => `H${h.level}: ${h.text}`).join('\n')}

CONTENT (first 5000 chars):
${content.text.substring(0, 5000)}

${competitorContent ? `COMPETITOR TOPICS (what they cover that this content might not):
${competitorContent.join('\n')}` : ''}

Return a comprehensive JSON analysis:
{
  "currentScore": <0-100 SEO content score>,
  "targetScore": <achievable score with optimizations>,
  "titleOptimization": {
    "current": "current title",
    "issues": ["issue 1", "issue 2"],
    "suggestions": ["suggestion 1"],
    "optimizedTitle": "Better title with keyword"
  },
  "metaDescription": {
    "current": "current description",
    "issues": ["issues"],
    "suggestions": ["suggestions"],
    "optimizedDescription": "Better description with CTA"
  },
  "contentGaps": [
    {
      "topic": "Missing topic",
      "importance": "critical|high|medium",
      "competitorsCovering": 8,
      "suggestedSection": {
        "heading": "H2 heading for this topic",
        "outline": ["Point 1", "Point 2"],
        "targetWordCount": 300
      }
    }
  ],
  "keywordOptimization": {
    "primaryKeyword": "${targetKeyword}",
    "currentDensity": 0.5,
    "targetDensity": 1.5,
    "secondaryKeywords": [
      {"keyword": "related term", "currentCount": 0, "suggestedCount": 3, "placements": ["in H2", "in first paragraph"]}
    ],
    "lsiKeywords": ["semantic term 1", "semantic term 2"]
  },
  "structureImprovements": [
    {"issue": "No table of contents", "current": "N/A", "suggested": "Add TOC for long content", "impact": "Improves UX and time on page"}
  ],
  "serpFeatureTargeting": [
    {
      "feature": "Featured Snippet",
      "currentlyEligible": false,
      "requirements": ["Direct answer format", "50-60 word definition"],
      "optimizationSteps": ["Add definition section", "Use 'What is X' format"]
    }
  ],
  "readabilityImprovements": {
    "currentScore": 55,
    "targetScore": 70,
    "issues": [{"issue": "Long sentences", "examples": ["This very long sentence..."], "fix": "Break into shorter sentences"}]
  },
  "internalLinkingSuggestions": [
    {"anchorText": "suggested anchor", "targetUrl": "/suggested/path", "context": "Where to place in content"}
  ]
}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error('AI analysis failed');
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateOptimizedContent(
  optimization: ContentOptimization,
  originalContent: string,
  targetKeyword: string
): Promise<{ sections: { heading: string; content: string }[]; fullContent: string }> {
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
          content: `You are an expert content writer specializing in SEO-optimized content. Generate high-quality content sections that:
1. Are comprehensive and valuable to readers
2. Include keywords naturally
3. Follow E-E-A-T principles
4. Are optimized for featured snippets where applicable
5. Match the existing content's tone and style`
        },
        {
          role: 'user',
          content: `Generate optimized content sections for the keyword "${targetKeyword}".

Content gaps to fill:
${optimization.contentGaps.map(g => `- ${g.topic}: ${g.suggestedSection.outline.join(', ')}`).join('\n')}

Keywords to include:
- Primary: ${optimization.keywordOptimization.primaryKeyword}
- Secondary: ${optimization.keywordOptimization.secondaryKeywords.map(k => k.keyword).join(', ')}
- LSI: ${optimization.keywordOptimization.lsiKeywords.join(', ')}

Return JSON:
{
  "sections": [
    {
      "heading": "H2 heading text",
      "content": "Full section content (300-500 words)"
    }
  ]
}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error('Content generation failed');
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return {
    sections: result.sections,
    fullContent: result.sections.map((s: any) => `## ${s.heading}\n\n${s.content}`).join('\n\n')
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
      url,
      targetKeyword,
      projectId,
      generateContent = false, // Whether to generate optimized content sections
    } = body;

    if (!url || !targetKeyword) {
      return new Response(JSON.stringify({ error: 'URL and target keyword required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Optimizing content at ${url} for "${targetKeyword}"`);
    console.log('Using FREE data sources: SERP scraping, Google Trends, Wikipedia');

    // Step 1: Fetch and parse the content
    console.log('Fetching content...');
    const content = await fetchAndParseContent(url);

    // Step 2: Get SERP data (FREE - scraping Google)
    console.log('Getting SERP competitor data (FREE)...');
    let competitorTopics: string[] = [];
    let paaQuestions: string[] = [];
    let relatedSearches: string[] = [];

    try {
      const serpData = await scrapeSERP(targetKeyword);
      if (serpData) {
        paaQuestions = serpData.features.peopleAlsoAsk;
        relatedSearches = serpData.features.relatedSearches;

        // Fetch competitor content to identify topics
        for (const result of serpData.organicResults.slice(0, 3)) {
          try {
            const compContent = await fetchAndParseContent(result.url);
            competitorTopics.push(...compContent.headings.map(h => h.text));
          } catch (e) {
            // Skip if can't fetch
          }
        }
      }
    } catch (e) {
      console.log('SERP scraping failed, continuing with AI analysis');
    }

    // Step 3: Get Google Trends data (FREE)
    console.log('Getting trend data (FREE)...');
    let trendingQueries: string[] = [];
    try {
      const trends = await getGoogleTrends({ keyword: targetKeyword });
      if (trends?.relatedQueries) {
        trendingQueries = trends.relatedQueries.map(q => q.keyword);
      }
    } catch (e) {
      // Continue without trends
    }

    // Step 4: Get related keyword suggestions (FREE)
    console.log('Getting keyword suggestions (FREE)...');
    let suggestions: string[] = [];
    try {
      const suggestData = await getGoogleSuggestions({ query: targetKeyword });
      suggestions = suggestData.map(s => s.keyword);
    } catch (e) {
      // Continue without suggestions
    }

    // Step 5: Analyze with AI (using FREE data for context)
    console.log('Running AI analysis...');
    const competitorContext = [
      ...competitorTopics,
      ...paaQuestions.map(q => `PAA: ${q}`),
      ...relatedSearches.map(r => `Related: ${r}`),
      ...trendingQueries.map(t => `Trending: ${t}`),
    ];
    const optimization = await analyzeContentWithAI(content, targetKeyword, competitorContext.length > 0 ? competitorContext : undefined);

    // Step 3: Generate optimized content if requested
    let generatedContent = null;
    if (generateContent && optimization.contentGaps.length > 0) {
      console.log('Generating optimized content sections...');
      generatedContent = await generateOptimizedContent(optimization, content.text, targetKeyword);
    }

    // Step 4: Save to database if project provided
    if (projectId) {
      await supabase.from('content_optimizations').insert({
        project_id: projectId,
        url,
        target_keyword: targetKeyword,
        current_score: optimization.currentScore,
        target_score: optimization.targetScore,
        optimization_data: optimization,
        generated_content: generatedContent,
        created_at: new Date().toISOString(),
      });
    }

    console.log('Content optimization complete!');

    return new Response(JSON.stringify({
      success: true,
      url,
      targetKeyword,
      optimization,
      generatedContent,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content optimization error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
