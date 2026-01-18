import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const USER_AGENT = 'SEO-Autopilot/1.0 (+https://seo-autopilot.dev)';

// Rate limit: 10 requests per IP per hour
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface AuditIssue {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  title: string;
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, email } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and normalize URL
    let targetUrl: string;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      targetUrl = parsed.toString();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('cf-connecting-ip') ||
               'unknown';
    const ipHash = await hashIP(ip);

    // Check rate limit
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const oneHourAgo = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from('free_audits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (count && count >= RATE_LIMIT) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Sign up for unlimited audits.',
        retryAfter: RATE_WINDOW_MS,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Run the audit
    const issues: AuditIssue[] = [];

    try {
      const response = await fetch(targetUrl, {
        headers: { 'User-Agent': USER_AGENT },
      });

      if (!response.ok) {
        issues.push({
          code: 'FETCH_ERROR',
          severity: 'error',
          title: `HTTP Error ${response.status}`,
          category: 'Crawlability',
        });
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      if (!doc) {
        throw new Error('Failed to parse HTML');
      }

      // Title check
      const title = doc.querySelector('title')?.textContent;
      if (!title) {
        issues.push({
          code: 'TITLE_MISSING',
          severity: 'error',
          title: 'Missing title tag',
          category: 'On-Page',
        });
      } else if (title.length > 60) {
        issues.push({
          code: 'TITLE_TOO_LONG',
          severity: 'warning',
          title: `Title too long (${title.length} chars)`,
          category: 'On-Page',
        });
      }

      // Meta description check
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
      if (!metaDesc) {
        issues.push({
          code: 'META_DESC_MISSING',
          severity: 'error',
          title: 'Missing meta description',
          category: 'On-Page',
        });
      } else if (metaDesc.length > 160) {
        issues.push({
          code: 'META_DESC_TOO_LONG',
          severity: 'warning',
          title: `Meta description too long (${metaDesc.length} chars)`,
          category: 'On-Page',
        });
      }

      // H1 check
      const h1s = doc.querySelectorAll('h1');
      if (h1s.length === 0) {
        issues.push({
          code: 'H1_MISSING',
          severity: 'error',
          title: 'Missing H1 tag',
          category: 'On-Page',
        });
      } else if (h1s.length > 1) {
        issues.push({
          code: 'H1_MULTIPLE',
          severity: 'warning',
          title: `Multiple H1 tags (${h1s.length})`,
          category: 'On-Page',
        });
      }

      // Open Graph checks
      if (!doc.querySelector('meta[property="og:title"]')) {
        issues.push({
          code: 'OG_TITLE_MISSING',
          severity: 'warning',
          title: 'Missing Open Graph title',
          category: 'Social Meta',
        });
      }
      if (!doc.querySelector('meta[property="og:image"]')) {
        issues.push({
          code: 'OG_IMAGE_MISSING',
          severity: 'warning',
          title: 'Missing Open Graph image',
          category: 'Social Meta',
        });
      }

      // Twitter Card check
      if (!doc.querySelector('meta[name="twitter:card"]')) {
        issues.push({
          code: 'TWITTER_CARD_MISSING',
          severity: 'warning',
          title: 'Missing Twitter Card',
          category: 'Social Meta',
        });
      }

      // Canonical check
      if (!doc.querySelector('link[rel="canonical"]')) {
        issues.push({
          code: 'CANONICAL_MISSING',
          severity: 'warning',
          title: 'Missing canonical tag',
          category: 'On-Page',
        });
      }

      // Image alt check (limited)
      const images = doc.querySelectorAll('img');
      let missingAlt = 0;
      images.forEach((img) => {
        if (!img.getAttribute('alt')) missingAlt++;
      });
      if (missingAlt > 0) {
        issues.push({
          code: 'IMG_ALT_MISSING',
          severity: 'warning',
          title: `${missingAlt} images missing alt text`,
          category: 'Images',
        });
      }

      // robots.txt check
      try {
        const robotsUrl = new URL('/robots.txt', targetUrl).toString();
        const robotsRes = await fetch(robotsUrl, { headers: { 'User-Agent': USER_AGENT } });
        if (!robotsRes.ok) {
          issues.push({
            code: 'ROBOTS_TXT_MISSING',
            severity: 'warning',
            title: 'Missing robots.txt',
            category: 'Crawlability',
          });
        }
      } catch {
        // Ignore
      }

      // sitemap.xml check
      try {
        const sitemapUrl = new URL('/sitemap.xml', targetUrl).toString();
        const sitemapRes = await fetch(sitemapUrl, { headers: { 'User-Agent': USER_AGENT } });
        if (!sitemapRes.ok) {
          issues.push({
            code: 'SITEMAP_MISSING',
            severity: 'warning',
            title: 'Missing sitemap.xml',
            category: 'Crawlability',
          });
        }
      } catch {
        // Ignore
      }

      // HTTPS check
      const parsedUrl = new URL(targetUrl);
      if (parsedUrl.protocol !== 'https:') {
        issues.push({
          code: 'NOT_HTTPS',
          severity: 'error',
          title: 'Site not using HTTPS',
          category: 'Security',
        });
      }

    } catch (err) {
      issues.push({
        code: 'FETCH_ERROR',
        severity: 'error',
        title: `Failed to fetch page: ${err.message}`,
        category: 'Crawlability',
      });
    }

    // Calculate score
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const score = Math.max(0, 100 - (errors * 15) - (warnings * 5));

    // Calculate category scores
    const categories = {
      crawlability: 100 - issues.filter(i => i.category === 'Crawlability').reduce((sum, i) => sum + (i.severity === 'error' ? 20 : 10), 0),
      onPage: 100 - issues.filter(i => i.category === 'On-Page').reduce((sum, i) => sum + (i.severity === 'error' ? 15 : 5), 0),
      content: 85, // Placeholder for free tier
      performance: 80, // Placeholder for free tier
      security: issues.some(i => i.code === 'NOT_HTTPS') ? 50 : 100,
    };

    // Save to database for lead tracking
    const domain = new URL(targetUrl).hostname;
    await supabase.from('free_audits').insert({
      url: targetUrl,
      domain,
      score,
      issues_summary: {
        errors,
        warnings,
        notices: 0,
      },
      top_issues: issues.slice(0, 5),
      email: email || null,
      ip_hash: ipHash,
      user_agent: req.headers.get('user-agent'),
      referrer: req.headers.get('referer'),
    });

    return new Response(JSON.stringify({
      score,
      issues,
      categories,
      checksRun: 50, // Free tier limit
      totalChecks: 200, // Full version
      message: issues.length > 0
        ? 'Sign up to see all 200+ checks and get detailed fix recommendations.'
        : 'Great job! Sign up to monitor your site and track improvements.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error running free audit:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get('IP_SALT') || 'seo-autopilot');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
