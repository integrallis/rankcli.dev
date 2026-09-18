import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { runFullAudit } from '../_shared/audit/index.ts';
import type { AuditReport } from '../_shared/audit/index.ts';
import { assertPublicUrl, installFetchGuard } from '../_shared/url-guard.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// This public tool audits two caller-chosen URLs inside the function, and the
// audit engine calls fetch itself (page, robots.txt, sitemap, links). Every
// fetch in this isolate except our own Supabase calls goes through the SSRF
// guard, including each redirect hop.
installFetchGuard([supabaseUrl]);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 3 comparisons per IP per hour
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

interface CategoryComparison {
  name: string;
  yourScore: number;
  competitorScore: number;
  winner: 'you' | 'competitor' | 'tie';
}

interface ComparisonResult {
  yourUrl: string;
  competitorUrl: string;
  yourScore: number;
  competitorScore: number;
  yourSummary: {
    errors: number;
    warnings: number;
    notices: number;
  };
  competitorSummary: {
    errors: number;
    warnings: number;
    notices: number;
  };
  categories: CategoryComparison[];
  advantages: string[];
  disadvantages: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { yourUrl, competitorUrl } = await req.json();

    if (!yourUrl || !competitorUrl) {
      return new Response(JSON.stringify({ error: 'Both URLs required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URLs
    let normalizedYourUrl: string;
    let normalizedCompetitorUrl: string;
    try {
      normalizedYourUrl = new URL(yourUrl.startsWith('http') ? yourUrl : `https://${yourUrl}`).toString();
      normalizedCompetitorUrl = new URL(competitorUrl.startsWith('http') ? competitorUrl : `https://${competitorUrl}`).toString();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    try {
      await assertPublicUrl(normalizedYourUrl);
      await assertPublicUrl(normalizedCompetitorUrl);
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('cf-connecting-ip') ||
               'unknown';
    const ipHash = await hashIP(ip);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const oneHourAgo = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from('url_comparisons')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (count && count >= RATE_LIMIT) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Sign up for unlimited comparisons.',
        retryAfter: RATE_WINDOW_MS,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Run audits in parallel
    console.log(`Comparing ${normalizedYourUrl} vs ${normalizedCompetitorUrl}`);

    const [yourAudit, competitorAudit] = await Promise.all([
      runFullAudit({ url: normalizedYourUrl, maxPages: 1 }).catch(() => null),
      runFullAudit({ url: normalizedCompetitorUrl, maxPages: 1 }).catch(() => null),
    ]);

    if (!yourAudit || !competitorAudit) {
      return new Response(JSON.stringify({ error: 'Failed to audit one or both URLs' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build comparison result
    const result = buildComparison(normalizedYourUrl, normalizedCompetitorUrl, yourAudit, competitorAudit);

    // Save to database
    await supabase.from('url_comparisons').insert({
      your_url: normalizedYourUrl,
      competitor_url: normalizedCompetitorUrl,
      your_score: result.yourScore,
      competitor_score: result.competitorScore,
      your_errors: result.yourSummary.errors,
      your_warnings: result.yourSummary.warnings,
      competitor_errors: result.competitorSummary.errors,
      competitor_warnings: result.competitorSummary.warnings,
      ip_hash: ipHash,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error comparing URLs:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildComparison(
  yourUrl: string,
  competitorUrl: string,
  yourAudit: AuditReport,
  competitorAudit: AuditReport
): ComparisonResult {
  const yourScore = yourAudit.healthScore?.overall || 0;
  const competitorScore = competitorAudit.healthScore?.overall || 0;

  const yourErrors = yourAudit.issues.filter(i => i.severity === 'error').length;
  const yourWarnings = yourAudit.issues.filter(i => i.severity === 'warning').length;
  const yourNotices = yourAudit.issues.filter(i => i.severity === 'notice').length;

  const competitorErrors = competitorAudit.issues.filter(i => i.severity === 'error').length;
  const competitorWarnings = competitorAudit.issues.filter(i => i.severity === 'warning').length;
  const competitorNotices = competitorAudit.issues.filter(i => i.severity === 'notice').length;

  // Build category comparisons
  const categoryPairs: { name: string; yourKey: keyof typeof yourAudit.healthScore; }[] = [
    { name: 'Crawlability', yourKey: 'crawlability' },
    { name: 'On-Page SEO', yourKey: 'onPage' },
    { name: 'Content', yourKey: 'content' },
    { name: 'Performance', yourKey: 'performance' },
    { name: 'Security', yourKey: 'security' },
    { name: 'Social Meta', yourKey: 'social' },
    { name: 'AI Readiness', yourKey: 'aiReadiness' },
  ];

  const categories: CategoryComparison[] = categoryPairs.map(({ name, yourKey }) => {
    const yourCatScore = yourAudit.healthScore?.[yourKey] || 0;
    const competitorCatScore = competitorAudit.healthScore?.[yourKey] || 0;
    let winner: 'you' | 'competitor' | 'tie' = 'tie';
    if (yourCatScore > competitorCatScore + 5) winner = 'you';
    else if (competitorCatScore > yourCatScore + 5) winner = 'competitor';
    return {
      name,
      yourScore: yourCatScore,
      competitorScore: competitorCatScore,
      winner,
    };
  });

  // Determine advantages and disadvantages
  const advantages: string[] = [];
  const disadvantages: string[] = [];

  categories.forEach(cat => {
    if (cat.winner === 'you') {
      advantages.push(`Better ${cat.name.toLowerCase()} (${cat.yourScore} vs ${cat.competitorScore})`);
    } else if (cat.winner === 'competitor') {
      disadvantages.push(`Lower ${cat.name.toLowerCase()} score (${cat.yourScore} vs ${cat.competitorScore})`);
    }
  });

  if (yourErrors < competitorErrors) {
    advantages.push(`Fewer critical errors (${yourErrors} vs ${competitorErrors})`);
  } else if (competitorErrors < yourErrors) {
    disadvantages.push(`More critical errors (${yourErrors} vs ${competitorErrors})`);
  }

  if (yourWarnings < competitorWarnings) {
    advantages.push(`Fewer warnings (${yourWarnings} vs ${competitorWarnings})`);
  } else if (competitorWarnings < yourWarnings) {
    disadvantages.push(`More warnings (${yourWarnings} vs ${competitorWarnings})`);
  }

  return {
    yourUrl,
    competitorUrl,
    yourScore,
    competitorScore,
    yourSummary: {
      errors: yourErrors,
      warnings: yourWarnings,
      notices: yourNotices,
    },
    competitorSummary: {
      errors: competitorErrors,
      warnings: competitorWarnings,
      notices: competitorNotices,
    },
    categories,
    advantages,
    disadvantages,
  };
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (Deno.env.get('IP_SALT') || 'rankcli'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
