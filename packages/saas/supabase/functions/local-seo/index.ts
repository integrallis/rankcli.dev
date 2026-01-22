// Local SEO Analyzer
// Analyzes local SEO factors: NAP consistency, citations, local keywords, GBP optimization
// Uses FREE data sources: Google Suggest for local keyword discovery

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import FREE SEO data sources
import {
  getGoogleSuggestions,
  scrapeSERP,
} from '../_shared/free-seo-data.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== TYPES ==========

interface NAPData {
  name: string;
  address: string;
  phone: string;
  website: string;
}

interface LocalSEOAudit {
  score: number;
  napConsistency: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  googleBusinessProfile: {
    optimizationScore: number;
    missingFields: string[];
    recommendations: string[];
    suggestedCategories: string[];
    suggestedAttributes: string[];
  };
  localKeywords: {
    primaryKeywords: { keyword: string; volume: number; difficulty: number }[];
    longTailKeywords: { keyword: string; volume: number; intent: string }[];
    serviceAreaKeywords: string[];
  };
  citations: {
    priority: string[];
    industrySpecific: string[];
    recommended: { platform: string; importance: string; url: string }[];
  };
  reviews: {
    strategy: string[];
    responseTemplates: {
      positive: string;
      negative: string;
      neutral: string;
    };
    keywordRichResponses: string[];
  };
  localContent: {
    suggestedPages: { title: string; targetKeyword: string; outline: string[] }[];
    localLandingPageTemplate: string;
  };
  schemaMarkup: {
    current: object | null;
    recommended: object;
    issues: string[];
  };
  competitorInsights: {
    topCompetitors: { name: string; strengths: string[] }[];
    differentiators: string[];
  };
}

// ========== AI FUNCTIONS ==========

async function analyzeLocalSEO(
  url: string,
  businessInfo: NAPData,
  serviceArea: string[],
  industry: string
): Promise<LocalSEOAudit> {
  // Fetch the website
  let html = '';
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'RankCLI/1.0 (+https://rankcli.dev)' }
    });
    if (response.ok) {
      html = await response.text();
    }
  } catch (e) {
    console.log('Could not fetch URL');
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
          content: `You are a local SEO expert. Analyze websites for local search optimization and provide comprehensive recommendations.

Consider all aspects of local SEO:
1. NAP (Name, Address, Phone) consistency
2. Google Business Profile optimization
3. Local keyword targeting
4. Citation building
5. Review management
6. Local content strategy
7. LocalBusiness schema markup
8. Competitor analysis

Provide specific, actionable recommendations based on the business type and service area.`
        },
        {
          role: 'user',
          content: `Analyze local SEO for this business:

URL: ${url}
Business Name: ${businessInfo.name}
Address: ${businessInfo.address}
Phone: ${businessInfo.phone}
Industry: ${industry}
Service Areas: ${serviceArea.join(', ')}

${html ? `Website HTML (first 2000 chars): ${html.substring(0, 2000)}` : ''}

Return comprehensive local SEO audit as JSON:
{
  "score": <0-100 local SEO score>,
  "napConsistency": {
    "score": <0-100>,
    "issues": ["NAP issue 1", "NAP issue 2"],
    "recommendations": ["Fix recommendation 1"]
  },
  "googleBusinessProfile": {
    "optimizationScore": <0-100>,
    "missingFields": ["Hours", "Services"],
    "recommendations": ["Add photos weekly", "Complete services list"],
    "suggestedCategories": ["Primary category", "Secondary"],
    "suggestedAttributes": ["Wheelchair accessible", "etc"]
  },
  "localKeywords": {
    "primaryKeywords": [{"keyword": "${industry} ${serviceArea[0]}", "volume": 1200, "difficulty": 35}],
    "longTailKeywords": [{"keyword": "best ${industry} near me", "volume": 500, "intent": "transactional"}],
    "serviceAreaKeywords": ["${industry} in ${serviceArea[0]}"]
  },
  "citations": {
    "priority": ["Google Business Profile", "Yelp", "Facebook"],
    "industrySpecific": ["Industry directory 1"],
    "recommended": [{"platform": "Yelp", "importance": "high", "url": "yelp.com/biz"}]
  },
  "reviews": {
    "strategy": ["Ask satisfied customers", "Respond to all reviews"],
    "responseTemplates": {
      "positive": "Thank you template...",
      "negative": "We apologize template...",
      "neutral": "Thank you for feedback template..."
    },
    "keywordRichResponses": ["Include service and location in responses"]
  },
  "localContent": {
    "suggestedPages": [
      {"title": "Service in Location", "targetKeyword": "service location", "outline": ["Intro", "Services", "Why choose us"]}
    ],
    "localLandingPageTemplate": "Template structure..."
  },
  "schemaMarkup": {
    "current": null,
    "recommended": {"@type": "LocalBusiness", "name": "...", "address": {...}},
    "issues": ["Missing LocalBusiness schema"]
  },
  "competitorInsights": {
    "topCompetitors": [{"name": "Competitor", "strengths": ["More reviews", "Better photos"]}],
    "differentiators": ["What makes this business unique"]
  }
}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error('Local SEO analysis failed');

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateLocalSchema(businessInfo: NAPData, industry: string): Promise<object> {
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
          content: 'Generate complete, valid LocalBusiness JSON-LD schema markup.'
        },
        {
          role: 'user',
          content: `Generate LocalBusiness schema for:
Name: ${businessInfo.name}
Address: ${businessInfo.address}
Phone: ${businessInfo.phone}
Website: ${businessInfo.website}
Industry: ${industry}

Return valid JSON-LD schema:
{
  "schema": { "@context": "...", "@type": "LocalBusiness", ... }
}`
        }
      ],
      max_tokens: 1500,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error('Schema generation failed');

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content).schema;
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
      businessName,
      address,
      phone,
      industry,
      serviceAreas,
      projectId,
    } = body;

    if (!url || !businessName || !address) {
      return new Response(JSON.stringify({ error: 'URL, business name, and address required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing local SEO for ${businessName}`);

    const businessInfo: NAPData = {
      name: businessName,
      address,
      phone: phone || '',
      website: url,
    };

    // Step 1: Run local SEO audit
    console.log('Running local SEO audit...');
    const audit = await analyzeLocalSEO(
      url,
      businessInfo,
      serviceAreas || ['Local Area'],
      industry || 'Business'
    );

    // Step 2: Generate optimized LocalBusiness schema
    console.log('Generating LocalBusiness schema...');
    const schema = await generateLocalSchema(businessInfo, industry || 'Business');

    // Add schema to audit result
    audit.schemaMarkup.recommended = schema;

    // Step 3: Save to database
    if (projectId) {
      await supabase.from('local_seo_data').insert({
        project_id: projectId,
        business_name: businessName,
        address,
        phone: phone || null,
        nap_consistency_score: audit.napConsistency.score,
        google_business_profile: audit.googleBusinessProfile,
        citations: audit.citations.recommended,
        reviews_summary: audit.reviews,
        local_keywords: audit.localKeywords,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    console.log('Local SEO analysis complete!');

    return new Response(JSON.stringify({
      success: true,
      url,
      businessName,
      audit,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Local SEO error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
