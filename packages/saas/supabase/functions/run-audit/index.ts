import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const USER_AGENT = 'RankCLI/1.0 (+https://rankcli.dev)';

interface AuditIssue {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  category: string;
  title: string;
  description: string | null;
  impact: string | null;
  how_to_fix: string | null;
  affected_urls: string[];
  details: Record<string, unknown> | null;
}

interface HealthScores {
  crawlability: number;
  onPage: number;
  content: number;
  performance: number;
  security: number;
  socialMeta: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let userId: string | null = null;

    // Check for user auth (optional for API key access)
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { projectId, auditId } = await req.json();

    if (!projectId && !auditId) {
      return new Response(JSON.stringify({ error: 'Project ID or Audit ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the project
    let project;
    let audit;

    if (auditId) {
      // Get audit and project
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('*, projects(*)')
        .eq('id', auditId)
        .single();

      if (auditError || !auditData) {
        return new Response(JSON.stringify({ error: 'Audit not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      audit = auditData;
      project = auditData.projects;
    } else {
      // Get project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        return new Response(JSON.stringify({ error: 'Project not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      project = projectData;

      // Create new audit record
      const { data: newAudit, error: createError } = await supabase
        .from('audits')
        .insert({
          project_id: projectId,
          triggered_by: 'api',
          triggered_by_user: userId,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create audit: ${createError.message}`);
      }

      audit = newAudit;
    }

    // Update audit status to running
    await supabase
      .from('audits')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', audit.id);

    const startTime = Date.now();
    const issues: AuditIssue[] = [];

    try {
      // ========== FETCH PAGE ==========
      const response = await fetch(project.url, {
        headers: { 'User-Agent': USER_AGENT },
      });

      if (!response.ok) {
        issues.push({
          code: 'FETCH_ERROR',
          severity: 'error',
          category: 'crawlability',
          title: `HTTP Error ${response.status}`,
          description: `The page returned status ${response.status}`,
          impact: 'Page may not be accessible to search engines.',
          how_to_fix: 'Ensure the URL returns a 200 OK status.',
          affected_urls: [project.url],
          details: null,
        });
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      if (!doc) {
        throw new Error('Failed to parse HTML');
      }

      // ========== ON-PAGE CHECKS ==========

      // Title check
      const title = doc.querySelector('title')?.textContent;
      if (!title) {
        issues.push({
          code: 'TITLE_MISSING',
          severity: 'error',
          category: 'on-page',
          title: 'Missing title tag',
          description: 'The page does not have a title tag.',
          impact: 'Title tags are a major ranking factor and affect click-through rates.',
          how_to_fix: 'Add a unique, descriptive title tag between 50-60 characters.',
          affected_urls: [project.url],
          details: null,
        });
      } else if (title.length > 60) {
        issues.push({
          code: 'TITLE_TOO_LONG',
          severity: 'warning',
          category: 'on-page',
          title: `Title too long (${title.length} chars)`,
          description: 'Title tag exceeds the recommended 60 character limit.',
          impact: 'Title may be truncated in search results.',
          how_to_fix: 'Shorten the title to under 60 characters.',
          affected_urls: [project.url],
          details: { title, length: title.length },
        });
      }

      // Meta description check
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
      if (!metaDesc) {
        issues.push({
          code: 'META_DESC_MISSING',
          severity: 'error',
          category: 'on-page',
          title: 'Missing meta description',
          description: 'The page does not have a meta description.',
          impact: 'Meta descriptions affect click-through rates in search results.',
          how_to_fix: 'Add a compelling meta description between 120-160 characters.',
          affected_urls: [project.url],
          details: null,
        });
      } else if (metaDesc.length > 160) {
        issues.push({
          code: 'META_DESC_TOO_LONG',
          severity: 'warning',
          category: 'on-page',
          title: `Meta description too long (${metaDesc.length} chars)`,
          description: 'Meta description exceeds the recommended 160 character limit.',
          impact: 'Description may be truncated in search results.',
          how_to_fix: 'Shorten the meta description to under 160 characters.',
          affected_urls: [project.url],
          details: { description: metaDesc, length: metaDesc.length },
        });
      }

      // H1 check
      const h1s = doc.querySelectorAll('h1');
      if (h1s.length === 0) {
        issues.push({
          code: 'H1_MISSING',
          severity: 'error',
          category: 'on-page',
          title: 'Missing H1 tag',
          description: 'The page does not have an H1 heading.',
          impact: 'H1 tags help search engines understand page structure.',
          how_to_fix: 'Add exactly one H1 tag that describes the main content.',
          affected_urls: [project.url],
          details: null,
        });
      } else if (h1s.length > 1) {
        issues.push({
          code: 'H1_MULTIPLE',
          severity: 'warning',
          category: 'on-page',
          title: `Multiple H1 tags (${h1s.length} found)`,
          description: 'The page has more than one H1 tag.',
          impact: 'Multiple H1s can confuse search engines about page topic.',
          how_to_fix: 'Use only one H1 tag per page.',
          affected_urls: [project.url],
          details: { count: h1s.length },
        });
      }

      // Canonical check
      const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
      if (!canonical) {
        issues.push({
          code: 'CANONICAL_MISSING',
          severity: 'warning',
          category: 'on-page',
          title: 'Missing canonical tag',
          description: 'The page does not have a canonical URL specified.',
          impact: 'Without a canonical, duplicate content may cause ranking issues.',
          how_to_fix: 'Add a canonical link tag pointing to the preferred URL.',
          affected_urls: [project.url],
          details: null,
        });
      }

      // ========== SOCIAL META CHECKS ==========

      // Open Graph
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');

      if (!ogTitle) {
        issues.push({
          code: 'OG_TITLE_MISSING',
          severity: 'warning',
          category: 'social-meta',
          title: 'Missing Open Graph title',
          description: 'No og:title meta tag found.',
          impact: 'Social shares may not display correctly on Facebook/LinkedIn.',
          how_to_fix: 'Add <meta property="og:title" content="Your Title" />',
          affected_urls: [project.url],
          details: null,
        });
      }

      if (!ogImage) {
        issues.push({
          code: 'OG_IMAGE_MISSING',
          severity: 'warning',
          category: 'social-meta',
          title: 'Missing Open Graph image',
          description: 'No og:image meta tag found.',
          impact: 'Social shares will not have a preview image.',
          how_to_fix: 'Add <meta property="og:image" content="https://..." /> (1200x630px recommended)',
          affected_urls: [project.url],
          details: null,
        });
      }

      // Twitter Card
      const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
      if (!twitterCard) {
        issues.push({
          code: 'TWITTER_CARD_MISSING',
          severity: 'notice',
          category: 'social-meta',
          title: 'Missing Twitter Card',
          description: 'No twitter:card meta tag found.',
          impact: 'Twitter shares may not display rich previews.',
          how_to_fix: 'Add <meta name="twitter:card" content="summary_large_image" />',
          affected_urls: [project.url],
          details: null,
        });
      }

      // ========== CRAWLABILITY CHECKS ==========

      // Check robots.txt
      try {
        const robotsUrl = new URL('/robots.txt', project.url).toString();
        const robotsRes = await fetch(robotsUrl, { headers: { 'User-Agent': USER_AGENT } });
        if (!robotsRes.ok) {
          issues.push({
            code: 'ROBOTS_TXT_MISSING',
            severity: 'warning',
            category: 'crawlability',
            title: 'Missing robots.txt',
            description: 'No robots.txt file found at the root.',
            impact: 'Search engines may not know crawl preferences.',
            how_to_fix: 'Create a robots.txt file in the root directory.',
            affected_urls: [robotsUrl],
            details: null,
          });
        }
      } catch {
        // Ignore fetch errors for robots.txt
      }

      // Check sitemap
      try {
        const sitemapUrl = new URL('/sitemap.xml', project.url).toString();
        const sitemapRes = await fetch(sitemapUrl, { headers: { 'User-Agent': USER_AGENT } });
        if (!sitemapRes.ok) {
          issues.push({
            code: 'SITEMAP_MISSING',
            severity: 'warning',
            category: 'crawlability',
            title: 'Missing sitemap.xml',
            description: 'No sitemap.xml file found at the root.',
            impact: 'Search engines may miss some pages.',
            how_to_fix: 'Create an XML sitemap and submit to search engines.',
            affected_urls: [sitemapUrl],
            details: null,
          });
        }
      } catch {
        // Ignore fetch errors for sitemap
      }

      // ========== IMAGE CHECKS ==========
      const images = doc.querySelectorAll('img');
      const imagesWithoutAlt: string[] = [];

      images.forEach((img) => {
        const alt = img.getAttribute('alt');
        const src = img.getAttribute('src');
        if (!alt && src) {
          imagesWithoutAlt.push(src);
        }
      });

      if (imagesWithoutAlt.length > 0) {
        issues.push({
          code: 'IMG_ALT_MISSING',
          severity: 'warning',
          category: 'images',
          title: `${imagesWithoutAlt.length} image${imagesWithoutAlt.length > 1 ? 's' : ''} missing alt text`,
          description: 'Images without alt text are not accessible and less SEO-friendly.',
          impact: 'Missing alt text hurts accessibility and image SEO.',
          how_to_fix: 'Add descriptive alt attributes to all images.',
          affected_urls: [project.url],
          details: { images: imagesWithoutAlt.slice(0, 10) },
        });
      }

      // ========== SECURITY CHECKS ==========
      const url = new URL(project.url);
      if (url.protocol !== 'https:') {
        issues.push({
          code: 'NOT_HTTPS',
          severity: 'error',
          category: 'security',
          title: 'Site not using HTTPS',
          description: 'The site is not served over HTTPS.',
          impact: 'HTTPS is a ranking factor and affects user trust.',
          how_to_fix: 'Install an SSL certificate and redirect HTTP to HTTPS.',
          affected_urls: [project.url],
          details: null,
        });
      }

      // ========== CALCULATE SCORES ==========
      const healthScores = calculateHealthScores(issues);
      const overallScore = Math.round(
        (healthScores.crawlability * 0.2 +
          healthScores.onPage * 0.25 +
          healthScores.content * 0.15 +
          healthScores.performance * 0.15 +
          healthScores.security * 0.15 +
          healthScores.socialMeta * 0.1)
      );

      const duration = Date.now() - startTime;

      // ========== SAVE RESULTS ==========

      // Update audit
      await supabase
        .from('audits')
        .update({
          status: 'completed',
          score: overallScore,
          pages_crawled: 1,
          issues_found: issues.length,
          health_scores: healthScores,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          summary: {
            errors: issues.filter(i => i.severity === 'error').length,
            warnings: issues.filter(i => i.severity === 'warning').length,
            notices: issues.filter(i => i.severity === 'notice').length,
          },
        })
        .eq('id', audit.id);

      // Save issues
      if (issues.length > 0) {
        const issueRecords = issues.map(issue => ({
          audit_id: audit.id,
          project_id: project.id,
          code: issue.code,
          severity: issue.severity,
          category: issue.category,
          title: issue.title,
          description: issue.description,
          impact: issue.impact,
          how_to_fix: issue.how_to_fix,
          affected_urls: issue.affected_urls,
          details: issue.details,
          status: 'open',
        }));

        await supabase.from('audit_issues').insert(issueRecords);
      }

      // Update project
      await supabase
        .from('projects')
        .update({
          last_audit_at: new Date().toISOString(),
          last_audit_score: overallScore,
        })
        .eq('id', project.id);

      return new Response(JSON.stringify({
        success: true,
        auditId: audit.id,
        score: overallScore,
        issuesFound: issues.length,
        duration,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (auditError) {
      // Mark audit as failed
      await supabase
        .from('audits')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', audit.id);

      throw auditError;
    }

  } catch (error) {
    console.error('Error running audit:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateHealthScores(issues: AuditIssue[]): HealthScores {
  const deductions: Record<string, number> = {
    crawlability: 0,
    'on-page': 0,
    content: 0,
    performance: 0,
    security: 0,
    'social-meta': 0,
    images: 0,
  };

  const weights = { error: 15, warning: 5, notice: 1 };

  for (const issue of issues) {
    const deduction = weights[issue.severity];
    deductions[issue.category] = (deductions[issue.category] || 0) + deduction;
  }

  return {
    crawlability: Math.max(0, 100 - deductions.crawlability),
    onPage: Math.max(0, 100 - deductions['on-page']),
    content: Math.max(0, 100 - deductions.content - deductions.images),
    performance: Math.max(0, 100 - deductions.performance),
    security: Math.max(0, 100 - deductions.security),
    socialMeta: Math.max(0, 100 - deductions['social-meta']),
  };
}
