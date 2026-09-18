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
import { callChatCompletion, type AIProviderConfig } from '../_shared/ai-provider.ts';
import { resolveAIConfig, aiConfigErrorMessage } from '../_shared/resolve-ai-config.ts';
import { guardedFetch } from '../_shared/url-guard.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Worker configuration for paid keyword research
const WORKER_URL = Deno.env.get('AUDIT_WORKER_URL') || 'http://localhost:8080';
// No 'dev-secret' fallback - audit-worker no longer accepts that guessable
// default either (fixed earlier this session), so falling back here would
// only turn a real misconfiguration into a confusing 401 instead of an
// honest "WORKER_SECRET missing" failure.
const WORKER_SECRET = Deno.env.get('WORKER_SECRET');
const USE_WORKER_FOR_PAID = Deno.env.get('USE_WORKER_FOR_KEYWORDS') === 'true';

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
  /** Enhanced fields for specificity */
  inputFormat: string;
  outputFormat: string;
  productTieIn: string;
  deepLinkPattern?: string;
  competitorAnalysis: {
    existingTools: string[];
    hasFreeAlternative: boolean;
    ourAdvantage: string;
  };
  implementationHints: {
    suggestedLibraries: string[];
    estimatedHours: number;
    canUseExistingOSS: boolean;
  };
  feasibilityScore: number; // 1-5
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
    const response = await guardedFetch(url, {
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

async function analyzeSiteWithAI(pages: CrawledPage[], aiConfig: AIProviderConfig, wizardResponses?: Record<string, string>): Promise<{
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

  const systemPrompt = `You are an expert SEO strategist analyzing a website to understand the business and recommend keywords.

IMPORTANT: You must quantify your uncertainty. If you're not confident about key aspects (target audience, product purpose, competitive positioning), say so and explain what questions would help.

For niche focus assessment:
- "niche" = focuses on a specific segment (e.g., "Mermaid diagrams only" vs "all diagrams")
- "broad" = serves a wide market
- "unknown" = can't determine from the content

Be honest about confidence levels. It's better to ask questions than give wrong recommendations.`;

  const userPrompt = `Analyze this website and provide a summary with uncertainty assessment.

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
}`;

  const content = await callChatCompletion(aiConfig, systemPrompt, userPrompt, {
    jsonMode: true,
    maxTokens: 2000,
    temperature: 0.3,
  });
  const result = JSON.parse(content);

  return {
    summary: result.summary,
    uncertainty: result.uncertainty,
  };
}

async function generateKeywordRecommendations(
  summary: SiteSummary,
  uncertainty: UncertaintyAssessment,
  aiConfig: AIProviderConfig,
  wizardResponses?: Record<string, string>
): Promise<{
  recommendations: KeywordRecommendation[];
  freeToolIdeas: FreeToolIdea[];
}> {
  const wizardContext = wizardResponses
    ? `\nUser-provided context:\n${Object.entries(wizardResponses).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n')}`
    : '';

  const systemPrompt = `You are an expert SEO strategist implementing "Engineering as Marketing" strategy.

Your goal is to recommend keywords that can be targeted with:
1. Content pages (blog posts, guides, landing pages)
2. Free tools that drive traffic and convert to paid product

KEYWORD CRITERIA (per Bhanu's strategy):
- Keyword Difficulty (KD) < 10 ideal, < 20 acceptable
- Search volume > 500/month ideal, > 100 acceptable
- Must be relevant to the product (can convert visitors)

=== KEYWORD RECOMMENDATIONS ===
For each keyword, provide:
- action: "create-page" means create a NEW page targeting this keyword
- For "create-page" actions, include specifics in rationale:
  - Suggested URL path (e.g., "/solutions/animated-diagrams")
  - Content angle (e.g., "Compare animated vs static diagrams, show use cases")
  - Target word count (e.g., "1500-2000 words")

=== FREE TOOL IDEAS - STRICT REQUIREMENTS ===

Tools must be:
1. ADJACENT utilities, NOT the core product itself
2. SPECIFIC - exact input and output formats (not vague descriptions)
3. BUILDABLE - realistic scope (4-16 hours of work)
4. TIED TO PRODUCT - output can flow into the main product

REQUIRED SPECIFICITY for each tool:
- inputFormat: EXACT format (e.g., "PlantUML text syntax", "Draw.io XML export", "Flowchart JSON")
- outputFormat: EXACT format (e.g., "Mermaid diagram code", "PNG image 1200x630", "CSV with columns: name,value")
- productTieIn: How does the tool's OUTPUT connect to the main product?
- deepLinkPattern: Can we link directly into the product? (e.g., "/editor?import={base64output}")

COMPETITOR RESEARCH required:
- existingTools: Name 2-3 competing tools for this exact functionality
- hasFreeAlternative: Do free alternatives already exist?
- ourAdvantage: Why would someone use ours instead?

IMPLEMENTATION HINTS required:
- suggestedLibraries: npm/GitHub libraries that could power this (e.g., "mermaid", "plantuml-encoder")
- estimatedHours: Realistic hours to build (4-40)
- canUseExistingOSS: Can we wrap an existing open-source library?

FEASIBILITY SCORING (1-5):
- 5: Trivial to build, exact specs, clear libraries exist
- 4: Simple, well-defined, some custom logic needed
- 3: Moderate complexity, requires some research
- 2: Complex, unclear scope, may take longer
- 1: Too vague, not buildable as specified

REJECT IDEAS THAT:
- Score below 3 on feasibility
- Don't specify exact input/output formats
- Are the main product (not an adjacent utility)
- Are too vague (e.g., "Diagram Style Customizer" - style for what?)

=== EXAMPLES ===

GOOD tool idea for "Mermaid Diagram Animator" (animerm.ai):
{
  "toolName": "PlantUML to Mermaid Converter",
  "description": "Converts PlantUML sequence diagrams to Mermaid syntax so you can animate them in animerm.ai",
  "inputFormat": "PlantUML text syntax (@startuml...@enduml)",
  "outputFormat": "Mermaid sequenceDiagram syntax",
  "productTieIn": "Converted diagrams can be imported directly into animerm.ai editor for animation",
  "deepLinkPattern": "/editor?code={base64MermaidCode}",
  "competitorAnalysis": {
    "existingTools": ["kroki.io (renders, no conversion)", "planttext.com (PlantUML only)"],
    "hasFreeAlternative": false,
    "ourAdvantage": "Direct integration with animerm.ai for animation, not just static rendering"
  },
  "implementationHints": {
    "suggestedLibraries": ["plantuml-parser", "mermaid"],
    "estimatedHours": 8,
    "canUseExistingOSS": true
  },
  "feasibilityScore": 4
}

BAD tool idea (REJECT):
{
  "toolName": "Diagram Style Customizer",
  "description": "A utility to customize diagram styles and export them for presentations."
  // BAD: No input format, no output format, "styles" is vague, no competitor research
  // feasibilityScore: 1 - REJECT
}`;

  const userPrompt = `Generate keyword recommendations for this product:

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
Think: "What simple tool would ${summary.targetAudience} search for that we could build in 4-16 hours?"

BE SPECIFIC: Every tool must have exact input/output formats. Vague ideas will be rejected.

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
      "rationale": "For create-page: include suggested URL path, content angle, and target word count. For build-tool: reference the tool idea. For others: explain the strategy.",
      "impact": "high|medium|low",
      "effort": "high|medium|low"
    }
  ],
  "freeToolIdeas": [
    {
      "toolName": "Specific Tool Name (e.g., 'PlantUML to Mermaid Converter')",
      "description": "Exactly what it does and why users need it",
      "targetKeyword": "Primary keyword (e.g., 'plantuml to mermaid')",
      "searchVolume": "high|medium|low",
      "difficulty": "easy|medium|hard",
      "buildComplexity": "simple|moderate|complex",
      "ctaToProduct": "CTA text (e.g., 'Animate your converted diagram in ${summary.productName} →')",
      "inputFormat": "EXACT input format (e.g., 'PlantUML text (@startuml...@enduml)')",
      "outputFormat": "EXACT output format (e.g., 'Mermaid sequenceDiagram syntax')",
      "productTieIn": "How output connects to ${summary.productName}",
      "deepLinkPattern": "URL pattern if possible (e.g., '/editor?code={base64}') or null",
      "competitorAnalysis": {
        "existingTools": ["tool1", "tool2"],
        "hasFreeAlternative": true/false,
        "ourAdvantage": "Why ours is better"
      },
      "implementationHints": {
        "suggestedLibraries": ["npm-package-1", "github/repo"],
        "estimatedHours": 8,
        "canUseExistingOSS": true/false
      },
      "feasibilityScore": 1-5
    }
  ]
}

Generate 10-15 keywords and 3-5 SPECIFIC tool ideas. ONLY include tools with feasibilityScore >= 3.`;

  const content = await callChatCompletion(aiConfig, systemPrompt, userPrompt, {
    jsonMode: true,
    maxTokens: 3000,
    temperature: 0.5,
  });
  return JSON.parse(content);
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

    console.log('[ai-keywords] Request params:', { url, projectId, mode, hasWizardResponses: !!wizardResponses });

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`AI Keyword Research for ${url} (plan: ${planTier}, mode: ${mode})`);

    // The customer's own key, for every tier - RankCLI's keys are never a fallback.
    const aiResolution = await resolveAIConfig(supabase, userId);
    if (!aiResolution.ok) {
      return new Response(JSON.stringify({
        error: aiConfigErrorMessage('keyword research'),
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const aiConfig = aiResolution.config;

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
    const { summary, uncertainty } = await analyzeSiteWithAI(pages, aiConfig, wizardResponses);

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
        aiConfig,
        wizardResponses
      );

      const teaser = {
        totalKeywordsFound: recommendations.length,
        topKeywords: recommendations.slice(0, 3).map(r => r.keyword),
        potentialTraffic: recommendations.length > 5 ? 'High' : 'Medium',
        upgradeMessage: `Unlock ${recommendations.length} keyword recommendations and ${freeToolIdeas.length} free tool ideas. Upgrade to Solo ($9/mo) for full AI-powered keyword research.`,
      };

      // Save to database (even for free tier, for history)
      if (projectId) {
        console.log('[ai-keywords] Saving free tier results to database for project:', projectId);
        const { error: insertError } = await supabase.from('keyword_research_results').insert({
          project_id: projectId,
          user_id: userId,
          url,
          site_summary: summary,
          uncertainty,
          recommendations, // Save full recommendations (for future upgrade)
          free_tool_ideas: freeToolIdeas,
          wizard_responses: wizardResponses || null,
          confidence: uncertainty.overallConfidence,
          created_at: new Date().toISOString(),
        });
        
        if (insertError) {
          console.error('[ai-keywords] Failed to save free tier results:', insertError);
        } else {
          console.log('[ai-keywords] Free tier results saved successfully');
        }
      }

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
    // For paid tiers, route to worker if enabled (enhanced tool ideas with competitive search)
    // The worker's keyword research is OpenAI-only and runs on the key passed to it, so
    // it's only an option when the user's key is an OpenAI one.
    if (USE_WORKER_FOR_PAID && planTier !== 'free' && aiConfig.provider === 'openai') {
      console.log('Routing to worker for enhanced keyword research...');

      try {
        const workerResponse = await fetch(`${WORKER_URL}/keywords`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WORKER_SECRET}`,
          },
          body: JSON.stringify({
            url,
            projectId,
            tier: planTier,
            openaiApiKey: aiConfig.apiKey,
            wizardResponses: wizardResponses
              ? Object.entries(wizardResponses).map(([q, a]) => ({ id: q, answer: a }))
              : undefined,
            enableEnhancedToolIdeas: true,
          }),
        });

        if (workerResponse.ok) {
          const workerResult = await workerResponse.json();
          console.log('Worker response received');

          // Map worker result to expected format
          return new Response(JSON.stringify({
            success: true,
            tier: 'paid',
            siteSummary: workerResult.siteSummary || summary,
            uncertainty: workerResult.uncertainty || uncertainty,
            recommendations: workerResult.recommendations || [],
            freeToolIdeas: workerResult.freeToolIdeas || [],
            wizardQuestions,
            needsWizard,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.warn('Worker request failed, falling back to edge function');
        }
      } catch (workerError) {
        console.warn('Worker unavailable, falling back to edge function:', workerError);
      }
    }

    // Fallback: Generate using edge function
    console.log('Step 3: Generating keyword recommendations...');
    const { recommendations, freeToolIdeas } = await generateKeywordRecommendations(
      summary,
      uncertainty,
      aiConfig,
      wizardResponses
    );

    console.log(`Generated ${recommendations.length} keywords, ${freeToolIdeas.length} tool ideas`);

    // Save to database
    if (projectId) {
      console.log('[ai-keywords] Saving results to database for project:', projectId);
      const { error: insertError } = await supabase.from('keyword_research_results').insert({
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
      
      if (insertError) {
        console.error('[ai-keywords] Failed to save results:', insertError);
      } else {
        console.log('[ai-keywords] Results saved successfully');
      }
    } else {
      console.warn('[ai-keywords] No projectId provided, skipping database save');
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
