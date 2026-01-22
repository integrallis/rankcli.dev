/**
 * AI-Powered Keyword Research with Uncertainty Quantification
 *
 * Implements "Engineering as Marketing" strategy:
 * - Crawls site to understand the business
 * - Uses AI to generate summary and keywords
 * - Quantifies uncertainty and asks questions if needed
 * - Tiered access: free gets teaser, paid gets full results
 * - CI mode: skips if uncertainty too high
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== TYPES ==========

interface SiteSummary {
  productName: string;
  tagline: string;
  description: string;
  targetAudience: string;
  problemSolved: string;
  uniqueValue: string;
  industry: string;
  nicheOrBroad: 'niche' | 'broad' | 'unknown';
  competitors: string[];
  features: string[];
  pricing: string;
}

interface UncertaintyAssessment {
  overallConfidence: number;
  factors: {
    factor: string;
    confidence: number;
    reason: string;
  }[];
  questionsToAsk: {
    question: string;
    importance: 'critical' | 'high' | 'medium';
    category: string;
  }[];
  explanation: string;
}

interface KeywordRecommendation {
  keyword: string;
  searchVolume: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  relevance: number;
  action: 'create-page' | 'optimize-existing' | 'build-tool' | 'needs-input' | 'skip';
  rationale: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

interface FreeToolIdea {
  toolName: string;
  description: string;
  targetKeyword: string;
  searchVolume: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  buildComplexity: 'simple' | 'moderate' | 'complex';
  ctaToProduct: string;
}

interface WizardQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  importance: 'critical' | 'high' | 'medium';
  category: string;
}

interface AIKeywordResult {
  success: boolean;
  tier: 'free' | 'paid';
  siteSummary: SiteSummary;
  uncertainty: UncertaintyAssessment;
  recommendations: KeywordRecommendation[];
  freeToolIdeas: FreeToolIdea[];
  wizardQuestions: WizardQuestion[];
  needsWizard: boolean;
  teaser?: {
    totalKeywordsFound: number;
    topKeywords: string[];
    potentialTraffic: string;
    upgradeMessage: string;
  };
}

// ========== SITE CRAWLER ==========

interface CrawledPage {
  url: string;
  title: string;
  description: string;
  h1: string[];
  h2: string[];
  content: string;
  links: string[];
}

async function crawlPage(url: string): Promise<CrawledPage | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RankCLI-Bot/1.0 (SEO Analyzer)',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text().trim() || '';

    // Extract meta description
    const description = $('meta[name="description"]').attr('content') || '';

    // Extract headings
    const h1s: string[] = [];
    $('h1').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1s.push(text);
    });

    const h2s: string[] = [];
    $('h2').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h2s.push(text);
    });

    // Extract main content
    const contentSelectors = ['main', 'article', '[role="main"]', '.content', '#content', 'body'];
    let content = '';
    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        content = el.text().replace(/\s+/g, ' ').trim();
        break;
      }
    }

    // Extract internal links
    const baseUrl = new URL(url);
    const links: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      try {
        const linkUrl = new URL(href, url);
        if (linkUrl.hostname === baseUrl.hostname) {
          links.push(linkUrl.pathname);
        }
      } catch {}
    });

    return {
      url,
      title,
      description,
      h1: h1s,
      h2: h2s,
      content: content.slice(0, 5000), // Limit content size
      links: [...new Set(links)],
    };
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
    return null;
  }
}

async function crawlSite(startUrl: string, maxPages = 5): Promise<CrawledPage[]> {
  const pages: CrawledPage[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const baseUrl = new URL(startUrl);

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!;
    const normalizedUrl = url.startsWith('http') ? url : `${baseUrl.origin}${url}`;

    if (visited.has(normalizedUrl)) continue;
    visited.add(normalizedUrl);

    const page = await crawlPage(normalizedUrl);
    if (page) {
      pages.push(page);

      // Add internal links to queue (prioritize important pages)
      const importantPaths = page.links.filter(l =>
        l === '/' ||
        l.includes('pricing') ||
        l.includes('feature') ||
        l.includes('about') ||
        l.includes('product')
      );
      queue.push(...importantPaths.map(p => `${baseUrl.origin}${p}`));
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  return pages;
}

// ========== AI ANALYSIS ==========

async function analyzeSiteWithAI(pages: CrawledPage[], wizardResponses?: Record<string, string>): Promise<{
  summary: SiteSummary;
  uncertainty: UncertaintyAssessment;
}> {
  // Prepare context from crawled pages
  const pagesContext = pages.map(p => `
URL: ${p.url}
Title: ${p.title}
Description: ${p.description}
H1: ${p.h1.join(', ')}
H2: ${p.h2.slice(0, 10).join(', ')}
Content Preview: ${p.content.slice(0, 1000)}
`).join('\n---\n');

  const wizardContext = wizardResponses
    ? `\nUser-provided context:\n${Object.entries(wizardResponses).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n')}`
    : '';

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
          content: `You are an expert SEO strategist analyzing a website to understand the business and recommend keywords.

IMPORTANT: You must quantify your uncertainty. If you're not confident about key aspects (target audience, product purpose, competitive positioning), say so and explain what questions would help.

For niche focus assessment:
- "niche" = focuses on a specific segment (e.g., "Mermaid diagrams only" vs "all diagrams")
- "broad" = serves a wide market
- "unknown" = can't determine from the content

Be honest about confidence levels. It's better to ask questions than give wrong recommendations.`
        },
        {
          role: 'user',
          content: `Analyze this website and provide a summary with uncertainty assessment.

Crawled Pages:
${pagesContext}
${wizardContext}

Return JSON with this structure:
{
  "summary": {
    "productName": "Product/Company name",
    "tagline": "Main tagline or value proposition",
    "description": "2-3 sentence description",
    "targetAudience": "Who this is for",
    "problemSolved": "What problem it solves",
    "uniqueValue": "What makes it unique",
    "industry": "Industry/sector",
    "nicheOrBroad": "niche|broad|unknown",
    "competitors": ["competitor1", "competitor2"],
    "features": ["feature1", "feature2"],
    "pricing": "Pricing model if found"
  },
  "uncertainty": {
    "overallConfidence": 0.0-1.0,
    "factors": [
      {"factor": "Target Audience", "confidence": 0.0-1.0, "reason": "Why this confidence level"},
      {"factor": "Product Purpose", "confidence": 0.0-1.0, "reason": "..."},
      {"factor": "Competitive Position", "confidence": 0.0-1.0, "reason": "..."},
      {"factor": "Pricing Model", "confidence": 0.0-1.0, "reason": "..."},
      {"factor": "Niche Focus", "confidence": 0.0-1.0, "reason": "..."}
    ],
    "questionsToAsk": [
      {"question": "Question text", "importance": "critical|high|medium", "category": "audience|product|competition|pricing"},
      ...
    ],
    "explanation": "Plain English explanation of confidence level"
  }
}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return {
    summary: result.summary,
    uncertainty: result.uncertainty,
  };
}

async function generateKeywordRecommendations(
  summary: SiteSummary,
  uncertainty: UncertaintyAssessment,
  wizardResponses?: Record<string, string>
): Promise<{
  recommendations: KeywordRecommendation[];
  freeToolIdeas: FreeToolIdea[];
}> {
  const wizardContext = wizardResponses
    ? `\nUser-provided context:\n${Object.entries(wizardResponses).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n')}`
    : '';

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
          content: `You are an expert SEO strategist implementing "Engineering as Marketing" strategy.

Your goal is to recommend keywords that can be targeted with:
1. Content pages (blog posts, guides)
2. Free tools that drive traffic and convert to paid product

KEYWORD CRITERIA (per Bhanu's strategy):
- Keyword Difficulty (KD) < 10 ideal, < 20 acceptable
- Search volume > 500/month ideal, > 100 acceptable
- Must be relevant to the product (can convert visitors)

For each keyword, specify:
- Whether to create a page, optimize existing, or build a free tool
- If uncertainty is high for a keyword, mark action as "needs-input"

FREE TOOL IDEAS - CRITICAL RULES:
- Tools must be ADJACENT utilities, NOT the core product itself
- Tools should solve a RELATED problem that the target audience has
- Tools must be simple standalone utilities (can be built in 1-2 days)
- Tools capture users who might THEN need the main product

GOOD examples:
- For a "Mermaid Diagram Animator" → "Mermaid Syntax Validator", "Mermaid to PNG Converter", "Flowchart to Mermaid Generator"
- For a "JSON API Library" → "JSON Formatter", "JSON to CSV Converter", "API Response Validator"
- For a "Email Marketing Tool" → "Subject Line Tester", "Spam Score Checker", "Email Preview Tool"
- For a "Video Editor" → "Thumbnail Generator", "Video Format Converter", "Aspect Ratio Calculator"

BAD examples (these are the product itself, NOT free tools):
- For a "Mermaid Diagram Animator" → "Animated Diagram Creator" (this IS the product)
- For a "Email Marketing Tool" → "Email Campaign Builder" (this IS the product)

The free tool should make users think: "This is useful! I wonder what else they offer..." and naturally lead to the main product.`
        },
        {
          role: 'user',
          content: `Generate keyword recommendations for this product:

Product: ${summary.productName}
Description: ${summary.description}
Target Audience: ${summary.targetAudience}
Industry: ${summary.industry}
Niche Focus: ${summary.nicheOrBroad}
Features: ${summary.features.join(', ')}
Competitors: ${summary.competitors.join(', ')}

Current Confidence Level: ${Math.round(uncertainty.overallConfidence * 100)}%
${wizardContext}

IMPORTANT: For freeToolIdeas, suggest UTILITY tools that are ADJACENT to "${summary.productName}" - NOT the product itself.
Think: "What simple tool would ${summary.targetAudience} search for that we could build in a day?"

Return JSON:
{
  "recommendations": [
    {
      "keyword": "keyword phrase",
      "searchVolume": "high|medium|low",
      "difficulty": "easy|medium|hard",
      "intent": "informational|transactional|navigational|commercial",
      "relevance": 0.0-1.0,
      "action": "create-page|optimize-existing|build-tool|needs-input|skip",
      "rationale": "Why this keyword and action",
      "impact": "high|medium|low",
      "effort": "high|medium|low"
    }
  ],
  "freeToolIdeas": [
    {
      "toolName": "Tool Name (must be a simple utility, NOT the main product)",
      "description": "What the standalone utility tool does",
      "targetKeyword": "Primary keyword to target (should be different from product keywords)",
      "searchVolume": "high|medium|low",
      "difficulty": "easy|medium|hard",
      "buildComplexity": "simple|moderate|complex",
      "ctaToProduct": "How this utility naturally leads users to want ${summary.productName}"
    }
  ]
}

Generate 10-15 keywords and 3-5 ADJACENT utility tool ideas (not the product itself).`
        }
      ],
      max_tokens: 3000,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function generateWizardQuestions(uncertainty: UncertaintyAssessment): WizardQuestion[] {
  const questions: WizardQuestion[] = [];

  // Convert uncertainty questions to wizard format
  for (const q of uncertainty.questionsToAsk) {
    questions.push({
      id: `q_${questions.length + 1}`,
      question: q.question,
      type: 'text',
      importance: q.importance,
      category: q.category,
    });
  }

  // Add standard questions if confidence is low
  if (uncertainty.overallConfidence < 0.7) {
    const standardQuestions: WizardQuestion[] = [
      {
        id: 'q_target_audience',
        question: 'Who is your ideal customer? (e.g., "Developers building presentation tools")',
        type: 'text',
        importance: 'critical',
        category: 'audience',
      },
      {
        id: 'q_main_problem',
        question: 'What is the #1 problem your product solves?',
        type: 'text',
        importance: 'critical',
        category: 'product',
      },
      {
        id: 'q_competitors',
        question: 'Who are your main competitors?',
        type: 'text',
        importance: 'high',
        category: 'competition',
      },
      {
        id: 'q_differentiator',
        question: 'What makes you different from competitors?',
        type: 'text',
        importance: 'high',
        category: 'product',
      },
      {
        id: 'q_existing_keywords',
        question: 'What keywords are you already targeting (if any)?',
        type: 'text',
        importance: 'medium',
        category: 'seo',
      },
    ];

    // Only add questions not already in the list
    for (const sq of standardQuestions) {
      const exists = questions.some(q =>
        q.question.toLowerCase().includes(sq.category) ||
        q.category === sq.category
      );
      if (!exists && questions.length < 10) {
        questions.push(sq);
      }
    }
  }

  return questions.slice(0, 10);
}

// ========== MAIN HANDLER ==========

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user and plan tier
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let planTier: 'free' | 'solo' | 'pro' | 'agency' = 'free';

    console.log('[ai-keywords] Auth header present:', !!authHeader);

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      console.log('[ai-keywords] User lookup result:', { userId: user?.id, error: authError?.message });

      userId = user?.id || null;

      if (userId) {
        const { data: subscription, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        console.log('[ai-keywords] Subscription lookup:', { subscription, error: subError?.message });

        if (subscription?.plan) {
          const planId = (subscription.plan as { plan_id: string }).plan_id;
          planTier = planId as 'free' | 'solo' | 'pro' | 'agency';
          console.log('[ai-keywords] Found plan_id:', planId);
        }
      }
    }

    console.log('[ai-keywords] Final plan tier:', planTier);

    const body = await req.json();
    const {
      url,
      projectId,
      wizardResponses,
      mode = 'analyze', // 'analyze' | 'wizard' | 'ci'
      minConfidence = 0.7, // For CI mode
    } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`AI Keyword Research for ${url} (plan: ${planTier}, mode: ${mode})`);

    // Step 1: Crawl the site
    console.log('Step 1: Crawling site...');
    const pages = await crawlSite(url, planTier === 'free' ? 3 : 5);

    if (pages.length === 0) {
      return new Response(JSON.stringify({
        error: 'Could not crawl the site. Please check the URL is accessible.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Crawled ${pages.length} pages`);

    // Step 2: Analyze with AI
    console.log('Step 2: AI analysis...');
    const { summary, uncertainty } = await analyzeSiteWithAI(pages, wizardResponses);

    console.log(`Confidence: ${Math.round(uncertainty.overallConfidence * 100)}%`);

    // Step 3: Generate wizard questions
    const wizardQuestions = generateWizardQuestions(uncertainty);
    const needsWizard = uncertainty.overallConfidence < minConfidence;

    // CI Mode: Return early if confidence too low
    if (mode === 'ci' && needsWizard) {
      return new Response(JSON.stringify({
        success: false,
        tier: planTier === 'free' ? 'free' : 'paid',
        siteSummary: summary,
        uncertainty,
        recommendations: [],
        freeToolIdeas: [],
        wizardQuestions,
        needsWizard: true,
        ciMessage: `Confidence (${Math.round(uncertainty.overallConfidence * 100)}%) below threshold (${Math.round(minConfidence * 100)}%). Run 'rankcli keywords --wizard' to provide more context.`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Free tier: Return teaser only
    if (planTier === 'free') {
      // Still generate recommendations but only show teaser
      const { recommendations, freeToolIdeas } = await generateKeywordRecommendations(
        summary,
        uncertainty,
        wizardResponses
      );

      const teaser = {
        totalKeywordsFound: recommendations.length,
        topKeywords: recommendations.slice(0, 3).map(r => r.keyword),
        potentialTraffic: recommendations.length > 5 ? 'High' : 'Medium',
        upgradeMessage: `Unlock ${recommendations.length} keyword recommendations and ${freeToolIdeas.length} free tool ideas. Upgrade to Solo ($9/mo) for full AI-powered keyword research.`,
      };

      return new Response(JSON.stringify({
        success: true,
        tier: 'free',
        siteSummary: summary,
        uncertainty: {
          ...uncertainty,
          questionsToAsk: uncertainty.questionsToAsk.slice(0, 2), // Limited for free
        },
        recommendations: [], // Empty for free tier
        freeToolIdeas: [], // Empty for free tier
        wizardQuestions: wizardQuestions.slice(0, 3), // Limited for free
        needsWizard,
        teaser,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Paid tier: Full results
    console.log('Step 3: Generating keyword recommendations...');
    const { recommendations, freeToolIdeas } = await generateKeywordRecommendations(
      summary,
      uncertainty,
      wizardResponses
    );

    console.log(`Generated ${recommendations.length} keywords, ${freeToolIdeas.length} tool ideas`);

    // Save to database
    if (projectId) {
      await supabase.from('keyword_research_results').insert({
        project_id: projectId,
        user_id: userId,
        url,
        site_summary: summary,
        uncertainty,
        recommendations,
        free_tool_ideas: freeToolIdeas,
        wizard_responses: wizardResponses || null,
        confidence: uncertainty.overallConfidence,
        created_at: new Date().toISOString(),
      });
    }

    const result: AIKeywordResult = {
      success: true,
      tier: 'paid',
      siteSummary: summary,
      uncertainty,
      recommendations,
      freeToolIdeas,
      wizardQuestions,
      needsWizard,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Keyword Research error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
