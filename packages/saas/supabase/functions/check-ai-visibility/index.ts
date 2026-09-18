import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { AIProviderConfig } from '../_shared/ai-provider.ts';
import { loadUserAIKeys, aiConfigErrorMessage } from '../_shared/resolve-ai-config.ts';
import {
  OPENAI_FAST,
  ANTHROPIC_FAST,
  GOOGLE_FAST,
  PERPLEXITY_SEARCH,
  OPENROUTER_VISIBILITY_MODELS,
} from '../_shared/models.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Asks ChatGPT, Claude, Gemini and Perplexity what they say about a brand, on the signed-in
// user's own keys - RankCLI's keys are never used. OpenRouter is the primary bridge: with an
// OpenRouter key, every assistant is asked through it; otherwise each needs its own
// provider key. An assistant the user can't reach is reported as `not_checked`, and one whose
// API call fails as `error` - neither is ever counted as "not mentioned", and neither counts
// toward the score.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ProviderId = 'openai' | 'anthropic' | 'google' | 'perplexity';

interface ProviderResult {
  provider: ProviderId;
  name: string;
  status: 'checked' | 'not_checked' | 'error';
  error?: string;
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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: { user } } = token ? await supabase.auth.getUser(token) : { data: { user: null } };
    if (!user) {
      return json({ error: 'Sign in to run the AI visibility check - it runs on your own AI provider keys.' }, 401);
    }

    const { url, projectId } = await req.json();

    if (!url) {
      return json({ error: 'URL required' }, 400);
    }

    // Validate and normalize URL
    let targetUrl: string;
    let domain: string;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      targetUrl = parsed.toString();
      domain = parsed.hostname.replace(/^www\./, '');
    } catch {
      return json({ error: 'Invalid URL' }, 400);
    }

    // History is written against projectId, so only the project's owner may name it.
    let ownedProjectId: string | null = null;
    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!project) return json({ error: 'Project not found' }, 404);
      ownedProjectId = project.id;
    }

    const keys = await loadUserAIKeys(supabase, user.id);
    if (!keys.openrouter && !keys.openai && !keys.anthropic && !keys.gemini && !keys.perplexity) {
      return json({ error: aiConfigErrorMessage('the AI visibility check') }, 400);
    }

    // Extract brand name
    const brand = domain.split('.')[0]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    // Generate queries
    const queries = [
      `What are some good ${brand.toLowerCase()} alternatives?`,
      `Can you recommend tools similar to ${domain}?`,
      `What do you think about ${brand}?`,
    ];

    const or = keys.openrouter;
    const results = await Promise.all([
      or ? checkViaOpenRouter(brand, domain, queries[0], or, 'openai', 'ChatGPT') : checkOpenAI(brand, domain, queries[0], keys.openai),
      or ? checkViaOpenRouter(brand, domain, queries[0], or, 'anthropic', 'Claude') : checkAnthropic(brand, domain, queries[0], keys.anthropic),
      or ? checkViaOpenRouter(brand, domain, queries[0], or, 'google', 'Gemini') : checkGoogle(brand, domain, queries[0], keys.gemini),
      or ? checkViaOpenRouter(brand, domain, queries[0], or, 'perplexity', 'Perplexity') : checkPerplexity(brand, domain, queries[0], keys.perplexity),
    ]);

    // Score only the assistants actually asked: with all four checked this is the old
    // 25 points per mention; with two checked, each mention is worth 50.
    const checked = results.filter(r => r.status === 'checked');
    if (checked.length === 0) {
      return json({
        error: 'None of your connected AI providers answered. ' +
          results.filter(r => r.status === 'error').map(r => `${r.name}: ${r.error}`).join('; '),
        providers: results,
      }, 502);
    }
    const mentioned = checked.filter(r => r.mentioned);
    const positioned = mentioned.filter(r => r.position !== null);
    const avgPosition = positioned.reduce((sum, r) => sum + (r.position || 0), 0) / Math.max(1, positioned.length);

    let overallScore = Math.round((mentioned.length / checked.length) * 100);
    if (mentioned.length > 0 && avgPosition <= 3) {
      overallScore = Math.min(100, overallScore + 10);
    }

    const ipHash = await hashIP(
      req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('cf-connecting-ip') || 'unknown'
    );
    const column = (r: ProviderResult) => (r.status === 'checked' ? r.mentioned : null);

    const { error: insertError } = await supabase.from('ai_visibility_checks').insert({
      url: targetUrl,
      domain,
      brand,
      overall_score: overallScore,
      openai_mentioned: column(results[0]),
      openai_position: results[0].position,
      anthropic_mentioned: column(results[1]),
      anthropic_position: results[1].position,
      google_mentioned: column(results[2]),
      google_position: results[2].position,
      perplexity_mentioned: column(results[3]),
      perplexity_position: results[3].position,
      queries_tested: queries,
      ip_hash: ipHash,
      project_id: ownedProjectId,
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

    return json(response);
  } catch (error) {
    console.error('Error checking AI visibility:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

function emptyResult(provider: ProviderId, name: string, status: ProviderResult['status'], error?: string): ProviderResult {
  return { provider, name, status, error, mentioned: false, position: null, sentiment: null, score: 0, context: null };
}

async function apiError(response: Response): Promise<string> {
  const text = await response.text().catch(() => '');
  return `HTTP ${response.status}${text ? `: ${text.slice(0, 200)}` : ''}`;
}

const RECOMMENDER_PROMPT = 'You are a helpful assistant that recommends tools and websites. List your top recommendations.';

// One OpenRouter key reaches all four assistants. The messages match each direct check below
// (only ChatGPT's has a system prompt), so the route doesn't change the question. The key's
// own model setting is for analysis features and is ignored here - the assistant is the
// instrument.
async function checkViaOpenRouter(
  brand: string,
  domain: string,
  query: string,
  key: AIProviderConfig,
  provider: ProviderId,
  name: string,
): Promise<ProviderResult> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rankcli.dev',
        'X-Title': 'RankCLI',
      },
      body: JSON.stringify({
        model: OPENROUTER_VISIBILITY_MODELS[provider],
        messages: provider === 'openai'
          ? [{ role: 'system', content: RECOMMENDER_PROMPT }, { role: 'user', content: query }]
          : [{ role: 'user', content: query }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) return emptyResult(provider, name, 'error', await apiError(response));

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return analyzeResponse(content, brand, domain, provider, name);
  } catch (err) {
    return emptyResult(provider, name, 'error', err instanceof Error ? err.message : 'Request failed');
  }
}

async function checkOpenAI(brand: string, domain: string, query: string, key?: AIProviderConfig): Promise<ProviderResult> {
  if (!key) return emptyResult('openai', 'ChatGPT', 'not_checked');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: key.model || OPENAI_FAST,
        messages: [
          { role: 'system', content: RECOMMENDER_PROMPT },
          { role: 'user', content: query },
        ],
        // GPT-5.6 rejects temperature and max_tokens outright (see _shared/models.ts).
        // max_completion_tokens is accepted by every current OpenAI chat model.
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) return emptyResult('openai', 'ChatGPT', 'error', await apiError(response));

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return analyzeResponse(content, brand, domain, 'openai', 'ChatGPT');
  } catch (err) {
    return emptyResult('openai', 'ChatGPT', 'error', err instanceof Error ? err.message : 'Request failed');
  }
}

async function checkAnthropic(brand: string, domain: string, query: string, key?: AIProviderConfig): Promise<ProviderResult> {
  if (!key) return emptyResult('anthropic', 'Claude', 'not_checked');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: key.model || ANTHROPIC_FAST,
        max_tokens: 500,
        messages: [{ role: 'user', content: query }],
      }),
    });

    if (!response.ok) return emptyResult('anthropic', 'Claude', 'error', await apiError(response));

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    return analyzeResponse(content, brand, domain, 'anthropic', 'Claude');
  } catch (err) {
    return emptyResult('anthropic', 'Claude', 'error', err instanceof Error ? err.message : 'Request failed');
  }
}

async function checkGoogle(brand: string, domain: string, query: string, key?: AIProviderConfig): Promise<ProviderResult> {
  if (!key) return emptyResult('google', 'Gemini', 'not_checked');

  try {
    const model = key.model || GOOGLE_FAST;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
      }),
    });

    if (!response.ok) return emptyResult('google', 'Gemini', 'error', await apiError(response));

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return analyzeResponse(content, brand, domain, 'google', 'Gemini');
  } catch (err) {
    return emptyResult('google', 'Gemini', 'error', err instanceof Error ? err.message : 'Request failed');
  }
}

async function checkPerplexity(brand: string, domain: string, query: string, key?: AIProviderConfig): Promise<ProviderResult> {
  if (!key) return emptyResult('perplexity', 'Perplexity', 'not_checked');

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: key.model || PERPLEXITY_SEARCH,
        messages: [{ role: 'user', content: query }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) return emptyResult('perplexity', 'Perplexity', 'error', await apiError(response));

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return analyzeResponse(content, brand, domain, 'perplexity', 'Perplexity');
  } catch (err) {
    return emptyResult('perplexity', 'Perplexity', 'error', err instanceof Error ? err.message : 'Request failed');
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
    status: 'checked',
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
