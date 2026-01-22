// AI Backlink Opportunity Finder
// Automates the manual process of finding link building opportunities
// Uses FREE data sources: SERP scraping to find actual ranking domains
// Uses AI to identify and qualify potential backlink sources

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import FREE SEO data sources
import {
  scrapeSERP,
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

interface BacklinkOpportunity {
  type: 'guest_post' | 'resource_page' | 'broken_link' | 'competitor_backlink' | 'unlinked_mention' | 'directory' | 'podcast' | 'roundup';
  url: string;
  domain: string;
  domainAuthority: number; // Estimated 0-100
  relevance: number; // 0-100
  difficulty: 'easy' | 'medium' | 'hard';
  potentialValue: 'low' | 'medium' | 'high';
  contactInfo?: {
    email?: string;
    contactPage?: string;
    socialMedia?: string[];
  };
  outreachTemplate?: string;
  notes: string;
}

interface BacklinkAnalysis {
  domain: string;
  totalOpportunities: number;
  byType: Record<string, number>;
  highValueOpportunities: BacklinkOpportunity[];
  quickWins: BacklinkOpportunity[];
  longTermTargets: BacklinkOpportunity[];
  outreachPlan: {
    week1: BacklinkOpportunity[];
    week2: BacklinkOpportunity[];
    week3: BacklinkOpportunity[];
    week4: BacklinkOpportunity[];
  };
  templates: {
    guestPost: string;
    resourcePage: string;
    brokenLink: string;
    unlinkedMention: string;
  };
}

// ========== AI FUNCTIONS ==========

async function findBacklinkOpportunities(
  domain: string,
  keywords: string[],
  competitors?: string[],
  realDomains?: { domain: string; url: string; keyword: string }[]
): Promise<BacklinkOpportunity[]> {
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
          content: `You are an expert link building strategist. Generate realistic backlink opportunities based on the domain and keywords provided.

For each opportunity, consider:
1. Domain authority (based on domain age, traffic, backlinks)
2. Relevance to the target site's niche
3. Difficulty of acquisition
4. Potential SEO value
5. Likelihood of success

Types of opportunities to identify:
- Guest post opportunities (blogs accepting contributions)
- Resource pages (listicles, tools lists, resource roundups)
- Broken link building targets
- Competitor backlink sources (sites linking to competitors)
- Unlinked brand mentions
- Niche directories
- Podcast/interview opportunities
- Expert roundups

Be specific and realistic - generate opportunities that actually exist in the niche.`
        },
        {
          role: 'user',
          content: `Find backlink opportunities for:
Domain: ${domain}
Keywords/Niche: ${keywords.join(', ')}
${competitors?.length ? `Competitors: ${competitors.join(', ')}` : ''}

${realDomains?.length ? `REAL DOMAINS found from SERP (prioritize these):
${realDomains.map(d => `- ${d.domain}: ${d.url} (found for: ${d.keyword})`).join('\n')}
` : ''}

Generate 20+ realistic backlink opportunities. Prioritize real domains found above. Return JSON:
{
  "opportunities": [
    {
      "type": "guest_post|resource_page|broken_link|competitor_backlink|unlinked_mention|directory|podcast|roundup",
      "url": "https://example.com/page",
      "domain": "example.com",
      "domainAuthority": 45,
      "relevance": 85,
      "difficulty": "easy|medium|hard",
      "potentialValue": "low|medium|high",
      "contactInfo": {
        "email": "editor@example.com",
        "contactPage": "/contact",
        "socialMedia": ["@twitter"]
      },
      "notes": "Why this is a good opportunity"
    }
  ]
}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error('Failed to find opportunities');

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  return content.opportunities;
}

async function generateOutreachTemplates(
  domain: string,
  siteDescription: string
): Promise<Record<string, string>> {
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
          content: `You are an expert at writing link building outreach emails that get responses. Create personalized, non-spammy templates that:
1. Have compelling subject lines
2. Show you've actually visited their site
3. Provide clear value proposition
4. Have a specific ask
5. Are concise (under 150 words)
6. Feel personal, not templated`
        },
        {
          role: 'user',
          content: `Create outreach email templates for ${domain}.
Site description: ${siteDescription}

Generate templates for:
1. Guest post pitches
2. Resource page inclusion requests
3. Broken link building outreach
4. Unlinked mention conversion

Return JSON:
{
  "guestPost": "Subject: ...\\n\\nHi [Name],...",
  "resourcePage": "Subject: ...\\n\\n...",
  "brokenLink": "Subject: ...\\n\\n...",
  "unlinkedMention": "Subject: ...\\n\\n..."
}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.6,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error('Failed to generate templates');

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function qualifyOpportunities(
  opportunities: BacklinkOpportunity[]
): Promise<BacklinkAnalysis['outreachPlan']> {
  // Score and prioritize opportunities
  const scored = opportunities.map(opp => ({
    ...opp,
    score: (opp.domainAuthority * 0.3) + (opp.relevance * 0.4) +
           (opp.difficulty === 'easy' ? 30 : opp.difficulty === 'medium' ? 20 : 10) +
           (opp.potentialValue === 'high' ? 30 : opp.potentialValue === 'medium' ? 20 : 10)
  }));

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  // Distribute across 4 weeks
  const weeklyBatches = {
    week1: scored.filter(o => o.difficulty === 'easy').slice(0, 5),
    week2: scored.filter(o => o.difficulty === 'easy').slice(5, 10).concat(
      scored.filter(o => o.difficulty === 'medium').slice(0, 3)
    ),
    week3: scored.filter(o => o.difficulty === 'medium').slice(3, 8),
    week4: scored.filter(o => o.difficulty === 'hard').slice(0, 5),
  };

  return weeklyBatches;
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
      domain,
      keywords,
      competitors,
      siteDescription,
      projectId,
    } = body;

    if (!domain || !keywords?.length) {
      return new Response(JSON.stringify({ error: 'Domain and keywords required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Finding backlink opportunities for ${domain}`);
    console.log('Using FREE data sources: SERP scraping for real domains');

    // Step 0: Gather real domains from SERP (FREE)
    console.log('Scraping SERP for ranking domains (FREE)...');
    const realDomains: { domain: string; url: string; keyword: string }[] = [];

    for (const keyword of keywords.slice(0, 5)) {
      try {
        // Try different search queries to find link opportunities
        const queries = [
          `${keyword} resources`,
          `${keyword} tools list`,
          `${keyword} guest post`,
          `best ${keyword} blogs`,
          `${keyword} roundup`,
        ];

        for (const query of queries.slice(0, 2)) {
          const serp = await scrapeSERP(query);
          if (serp?.organicResults) {
            for (const result of serp.organicResults.slice(0, 5)) {
              if (!result.domain.includes(domain)) { // Exclude own domain
                realDomains.push({
                  domain: result.domain,
                  url: result.url,
                  keyword: query,
                });
              }
            }
          }
          await new Promise(r => setTimeout(r, 500)); // Rate limit
        }
      } catch (e) {
        console.log(`SERP scraping failed for ${keyword}`);
      }
    }
    console.log(`Found ${realDomains.length} real domains from SERP`);

    // Step 1: Find opportunities (enhanced with real domain data)
    console.log('Identifying opportunities with AI...');
    const opportunities = await findBacklinkOpportunities(
      domain,
      keywords,
      competitors,
      realDomains.slice(0, 20) // Pass real domains to AI
    );

    // Step 2: Generate outreach templates
    console.log('Generating outreach templates...');
    const templates = await generateOutreachTemplates(domain, siteDescription || `A website about ${keywords.join(', ')}`);

    // Step 3: Qualify and plan
    console.log('Creating outreach plan...');
    const outreachPlan = await qualifyOpportunities(opportunities);

    // Step 4: Categorize results
    const byType: Record<string, number> = {};
    opportunities.forEach(opp => {
      byType[opp.type] = (byType[opp.type] || 0) + 1;
    });

    const highValueOpportunities = opportunities
      .filter(o => o.potentialValue === 'high' && o.relevance > 70)
      .slice(0, 10);

    const quickWins = opportunities
      .filter(o => o.difficulty === 'easy')
      .slice(0, 10);

    const longTermTargets = opportunities
      .filter(o => o.domainAuthority > 60 && o.difficulty === 'hard')
      .slice(0, 10);

    const result: BacklinkAnalysis = {
      domain,
      totalOpportunities: opportunities.length,
      byType,
      highValueOpportunities,
      quickWins,
      longTermTargets,
      outreachPlan,
      templates,
    };

    // Step 5: Save to database
    if (projectId) {
      await supabase.from('backlink_opportunities').insert({
        project_id: projectId,
        domain,
        total_opportunities: opportunities.length,
        opportunities: opportunities,
        outreach_plan: outreachPlan,
        templates,
        created_at: new Date().toISOString(),
      });
    }

    console.log(`Found ${opportunities.length} backlink opportunities`);

    return new Response(JSON.stringify({
      success: true,
      ...result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Backlink finder error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
