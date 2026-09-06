// Force redeploy - v2
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decryptSecret } from '../_shared/crypto.ts';
import {
  OPENAI_FAST,
  ANTHROPIC_FAST,
  GOOGLE_FAST,
  PERPLEXITY_SEARCH,
} from '../_shared/models.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

interface BYOKOverride {
  provider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
  model: string | null;
}

// This is a public, anonymous-accessible tool - most callers have no
// session. If the request carries a real user's Bearer token and that
// user has a connected BYOK key for one of the three provider slots this
// function natively checks (openai/anthropic/gemini), use their key+model
// for that one slot only - a single BYOK key can't cover all 4 providers,
// and openrouter/groq/custom don't map to a native "does ChatGPT/Claude/
// Gemini itself mention this" check, so those are left on RankCLI's own
// keys (or skipped, same as today, if RankCLI has no key for that slot).
// deno-lint-ignore no-explicit-any
async function resolveBYOKOverride(supabase: any, authHeader: string | null): Promise<BYOKOverride | null> {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return null;

  const { data: byok } = await supabase
    .from('user_ai_keys')
    .select('provider, encrypted_key, model')
    .eq('user_id', user.id)
    .single();
  if (!byok || !['openai', 'anthropic', 'gemini'].includes(byok.provider)) return null;

  const encryptionSecret = Deno.env.get('AI_KEY_ENCRYPTION_SECRET');
  if (!encryptionSecret) return null;
  const apiKey = await decryptSecret(byok.encrypted_key, encryptionSecret);
  return { provider: byok.provider, apiKey, model: byok.model || null };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 5 requests per IP per hour
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

interface ProviderResult {
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity';
  name: string;
  mentioned: boolean;
  position: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  score: number;
  context: string | null;
}

interface AIVisibilityResult {
  url: string;
  brand: string;
  overallScore: number;
  providers: ProviderResult[];
  queries_tested: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, projectId } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and normalize URL
    let targetUrl: string;
    let domain: string;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      targetUrl = parsed.toString();
      domain = parsed.hostname.replace(/^www\./, '');
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract brand name
    const brand = domain.split('.')[0]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('cf-connecting-ip') ||
               'unknown';
    const ipHash = await hashIP(ip);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const oneHourAgo = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from('ai_visibility_checks')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (count && count >= RATE_LIMIT) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Sign up for unlimited checks.',
        retryAfter: RATE_WINDOW_MS,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate queries
    const queries = [
      `What are some good ${brand.toLowerCase()} alternatives?`,
      `Can you recommend tools similar to ${domain}?`,
      `What do you think about ${brand}?`,
    ];

    const byok = await resolveBYOKOverride(supabase, req.headers.get('Authorization'));

    // Check all providers in parallel
    const providerPromises = [
      checkOpenAI(brand, domain, queries[0], byok?.provider === 'openai' ? byok : undefined),
      checkAnthropic(brand, domain, queries[0], byok?.provider === 'anthropic' ? byok : undefined),
      checkGoogle(brand, domain, queries[0], byok?.provider === 'gemini' ? byok : undefined),
      checkPerplexity(brand, domain, queries[0]),
    ];

    const results = await Promise.all(providerPromises);

    // Calculate overall score
    const mentionedCount = results.filter(r => r.mentioned).length;
    const avgPosition = results
      .filter(r => r.position !== null)
      .reduce((sum, r) => sum + (r.position || 0), 0) / Math.max(1, results.filter(r => r.position !== null).length);

    // Score: 25 points per provider mention + bonus for position
    let overallScore = mentionedCount * 25;
    if (mentionedCount > 0 && avgPosition <= 3) {
      overallScore = Math.min(100, overallScore + 10);
    }

    // Save to database
    const { error: insertError } = await supabase.from('ai_visibility_checks').insert({
      url: targetUrl,
      domain,
      brand,
      overall_score: overallScore,
      openai_mentioned: results[0].mentioned,
      openai_position: results[0].position,
      anthropic_mentioned: results[1].mentioned,
      anthropic_position: results[1].position,
      google_mentioned: results[2].mentioned,
      google_position: results[2].position,
      perplexity_mentioned: results[3].mentioned,
      perplexity_position: results[3].position,
      queries_tested: queries,
      ip_hash: ipHash,
      project_id: projectId || null,
      providers: results,
    });

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Don't fail the request, just log it
    }

    const response: AIVisibilityResult = {
      url: targetUrl,
      brand,
      overallScore,
      providers: results,
      queries_tested: queries,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking AI visibility:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkOpenAI(brand: string, domain: string, query: string, byok?: BYOKOverride): Promise<ProviderResult> {
  const baseResult: ProviderResult = {
    provider: 'openai',
    name: 'ChatGPT',
    mentioned: false,
    position: null,
    sentiment: null,
    score: 0,
    context: null,
  };

  const apiKey = byok?.apiKey || openaiApiKey;
  if (!apiKey) return baseResult;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: byok?.model || OPENAI_FAST,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that recommends tools and websites. List your top recommendations.' },
          { role: 'user', content: query },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) return baseResult;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return analyzeResponse(content, brand, domain, 'openai', 'ChatGPT');
  } catch {
    return baseResult;
  }
}

async function checkAnthropic(brand: string, domain: string, query: string, byok?: BYOKOverride): Promise<ProviderResult> {
  const baseResult: ProviderResult = {
    provider: 'anthropic',
    name: 'Claude',
    mentioned: false,
    position: null,
    sentiment: null,
    score: 0,
    context: null,
  };

  const apiKey = byok?.apiKey || anthropicApiKey;
  if (!apiKey) {
    return baseResult;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: byok?.model || ANTHROPIC_FAST,
        max_tokens: 500,
        messages: [{ role: 'user', content: query }],
      }),
    });

    if (!response.ok) return baseResult;

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    return analyzeResponse(content, brand, domain, 'anthropic', 'Claude');
  } catch {
    return baseResult;
  }
}

async function checkGoogle(brand: string, domain: string, query: string, byok?: BYOKOverride): Promise<ProviderResult> {
  const baseResult: ProviderResult = {
    provider: 'google',
    name: 'Gemini',
    mentioned: false,
    position: null,
    sentiment: null,
    score: 0,
    context: null,
  };

  const apiKey = byok?.apiKey || googleApiKey;
  if (!apiKey) return baseResult;

  try {
    const model = byok?.model || GOOGLE_FAST;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
      }),
    });

    if (!response.ok) return baseResult;

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return analyzeResponse(content, brand, domain, 'google', 'Gemini');
  } catch {
    return baseResult;
  }
}

async function checkPerplexity(brand: string, domain: string, query: string): Promise<ProviderResult> {
  const baseResult: ProviderResult = {
    provider: 'perplexity',
    name: 'Perplexity',
    mentioned: false,
    position: null,
    sentiment: null,
    score: 0,
    context: null,
  };

  if (!perplexityApiKey) return baseResult;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PERPLEXITY_SEARCH,
        messages: [{ role: 'user', content: query }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) return baseResult;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return analyzeResponse(content, brand, domain, 'perplexity', 'Perplexity');
  } catch {
    return baseResult;
  }
}

function analyzeResponse(
  content: string,
  brand: string,
  domain: string,
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity',
  name: string
): ProviderResult {
  const brandLower = brand.toLowerCase();
  const domainLower = domain.toLowerCase();
  const contentLower = content.toLowerCase();

  const mentioned = contentLower.includes(brandLower) || contentLower.includes(domainLower);

  let position: number | null = null;
  let context: string | null = null;
  let sentiment: 'positive' | 'neutral' | 'negative' | null = null;

  if (mentioned) {
    // Find position
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes(brandLower) || line.includes(domainLower)) {
        const match = lines[i].match(/^(\d+)[.\)]/);
        position = match ? parseInt(match[1], 10) : i + 1;
        context = lines[i].trim().slice(0, 150);
        break;
      }
    }

    // Analyze sentiment
    const positiveWords = ['great', 'excellent', 'best', 'recommend', 'popular', 'powerful'];
    const negativeWords = ['avoid', 'poor', 'limited', 'expensive', 'outdated'];
    const contextLower = (context || content).toLowerCase();
    const positiveCount = positiveWords.filter(w => contextLower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => contextLower.includes(w)).length;

    sentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral';
  }

  // Calculate score: 0-100 based on mention and position
  let score = 0;
  if (mentioned) {
    score = 50;
    if (position && position <= 3) score = 100;
    else if (position && position <= 5) score = 75;
  }

  return {
    provider,
    name,
    mentioned,
    position,
    sentiment,
    score,
    context,
  };
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (Deno.env.get('IP_SALT') || 'rankcli'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
