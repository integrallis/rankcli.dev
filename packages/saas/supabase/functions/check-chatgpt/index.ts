import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callChatCompletion, type AIProviderConfig } from '../_shared/ai-provider.ts';
import { decryptSecret } from '../_shared/crypto.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 5 requests per IP per hour
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface ChatGPTCheckResult {
  url: string;
  brand: string;
  mentioned: boolean;
  position: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  context: string | null;
  queries_tested: string[];
  response_snippet: string | null;
}

// This is a public, anonymous-accessible tool - most callers have no
// session at all. If the request does carry a real user's Bearer token
// and that user has a connected BYOK key, use it (their own cost, their
// own provider/model choice); otherwise fall back to RankCLI's own
// gpt-4o-mini, same as before. BYOK is a bonus path here, never a
// requirement - anonymous usage must keep working unauthenticated.
// deno-lint-ignore no-explicit-any
async function resolveAIConfig(supabase: any, authHeader: string | null): Promise<AIProviderConfig> {
  const fallback: AIProviderConfig = { provider: 'openai', apiKey: openaiApiKey, model: 'gpt-4o-mini' };
  if (!authHeader) return fallback;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return fallback;

  const { data: byok } = await supabase
    .from('user_ai_keys')
    .select('provider, encrypted_key, base_url, model')
    .eq('user_id', user.id)
    .single();
  if (!byok) return fallback;

  const encryptionSecret = Deno.env.get('AI_KEY_ENCRYPTION_SECRET');
  if (!encryptionSecret) return fallback;
  const apiKey = await decryptSecret(byok.encrypted_key, encryptionSecret);
  return { provider: byok.provider, apiKey, baseUrl: byok.base_url || undefined, model: byok.model || undefined };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

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

    // Extract brand name from domain
    const brand = domain.split('.')[0]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('cf-connecting-ip') ||
               'unknown';
    const ipHash = await hashIP(ip);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const oneHourAgo = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from('chatgpt_checks')
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

    const aiConfig = await resolveAIConfig(supabase, req.headers.get('Authorization'));

    // Generate queries based on the domain/brand
    const queries = generateQueries(brand, domain);

    // Check ChatGPT for mentions
    const result = await checkChatGPTMentions(aiConfig, brand, domain, queries);

    // Save result to database
    await supabase.from('chatgpt_checks').insert({
      url: targetUrl,
      domain,
      brand,
      mentioned: result.mentioned,
      position: result.position,
      sentiment: result.sentiment,
      context: result.context,
      queries_tested: queries,
      response_snippet: result.response_snippet,
      ip_hash: ipHash,
      user_agent: req.headers.get('user-agent'),
    });

    const response: ChatGPTCheckResult = {
      url: targetUrl,
      brand,
      mentioned: result.mentioned,
      position: result.position,
      sentiment: result.sentiment,
      context: result.context,
      queries_tested: queries,
      response_snippet: result.response_snippet,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking ChatGPT:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateQueries(brand: string, domain: string): string[] {
  // Generate industry-agnostic queries
  return [
    `What are some good alternatives to ${brand}?`,
    `Can you recommend websites similar to ${domain}?`,
    `What do you think about ${brand}?`,
  ];
}

async function checkChatGPTMentions(
  aiConfig: AIProviderConfig,
  brand: string,
  domain: string,
  queries: string[]
): Promise<{
  mentioned: boolean;
  position: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  context: string | null;
  response_snippet: string | null;
}> {
  // Use the first query to check if ChatGPT mentions the brand
  const query = `I'm looking for tools or websites related to ${brand} (${domain}). What would you recommend? Please list your top recommendations.`;

  try {
    const content = await callChatCompletion(
      aiConfig,
      'You are a helpful assistant that recommends tools and websites. Provide honest recommendations based on your knowledge. List recommendations in order of relevance.',
      query,
      { maxTokens: 500, temperature: 0.7 }
    );

    // Check if the brand/domain is mentioned
    const brandLower = brand.toLowerCase();
    const domainLower = domain.toLowerCase();
    const contentLower = content.toLowerCase();

    const mentioned = contentLower.includes(brandLower) || contentLower.includes(domainLower);

    let position: number | null = null;
    let sentiment: 'positive' | 'neutral' | 'negative' | null = null;
    let context: string | null = null;

    if (mentioned) {
      // Try to determine position (look for numbered list)
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (line.includes(brandLower) || line.includes(domainLower)) {
          // Check for numbered position
          const match = lines[i].match(/^(\d+)[.\)]/);
          if (match) {
            position = parseInt(match[1], 10);
          } else {
            // Estimate position by line number
            position = i + 1;
          }
          context = lines[i].trim();
          break;
        }
      }

      // Analyze sentiment (simple heuristic)
      const positiveWords = ['great', 'excellent', 'best', 'recommend', 'popular', 'powerful', 'useful', 'effective'];
      const negativeWords = ['avoid', 'poor', 'limited', 'expensive', 'outdated', 'issues', 'problems'];

      const contextLower = (context || content).toLowerCase();
      const positiveCount = positiveWords.filter(w => contextLower.includes(w)).length;
      const negativeCount = negativeWords.filter(w => contextLower.includes(w)).length;

      if (positiveCount > negativeCount) {
        sentiment = 'positive';
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
      } else {
        sentiment = 'neutral';
      }
    }

    // Create a cleaned snippet for display
    const snippet = content.length > 500 ? content.slice(0, 500) + '...' : content;

    return {
      mentioned,
      position,
      sentiment,
      context,
      response_snippet: snippet,
    };

  } catch (error) {
    console.error('ChatGPT API error:', error);
    // Return a fallback response
    return {
      mentioned: false,
      position: null,
      sentiment: null,
      context: null,
      response_snippet: 'Unable to check ChatGPT at this time. Please try again later.',
    };
  }
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (Deno.env.get('IP_SALT') || 'rankcli'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
