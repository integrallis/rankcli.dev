// README score badge: GET /functions/v1/badge?project=<project id> returns a shields-style
// SVG with the project's latest audit score, for a README:
//   [![RankCLI SEO score](https://<ref>.supabase.co/functions/v1/badge?project=<id>)](https://rankcli.dev)
// Public (no auth) but opt-in: only projects whose owner turned badge_enabled on show a score;
// every other id - unknown, disabled, not audited - gets the same neutral badge, so the
// endpoint can't be used to probe which projects exist.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function color(score: number | null): string {
  if (score === null) return '#9f9f9f';
  if (score >= 90) return '#2e7d32';
  if (score >= 70) return '#4c9a2a';
  if (score >= 50) return '#dfb317';
  return '#c62828';
}

// Approximate text widths (Verdana 11px ~6.5px per char), the way shields.io lays out badges.
function badge(label: string, value: string, fill: string): string {
  const w = (t: string) => Math.round(t.length * 6.5 + 12);
  const lw = w(label);
  const vw = w(value);
  const total = lw + vw;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${label}: ${value}">
<title>${label}: ${value}</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#r)"><rect width="${lw}" height="20" fill="#1c1c1a"/><rect x="${lw}" width="${vw}" height="20" fill="${fill}"/><rect width="${total}" height="20" fill="url(#s)"/></g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="${lw / 2}" y="14">${label}</text><text x="${lw + vw / 2}" y="14">${value}</text></g>
</svg>`;
}

function svg(body: string, maxAge: number): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // GitHub proxies README images through camo; a short cache keeps the score fresh.
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  });
}

serve(async (req) => {
  const neutral = () => svg(badge('RankCLI SEO', 'n/a', color(null)), 300);
  try {
    const projectId = new URL(req.url).searchParams.get('project') || '';
    if (!UUID.test(projectId)) return neutral();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: project } = await supabase
      .from('projects')
      .select('id, badge_enabled, is_active')
      .eq('id', projectId)
      .maybeSingle();
    if (!project?.badge_enabled || !project.is_active) return neutral();

    const { data: audit } = await supabase
      .from('audits')
      .select('score')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const score = typeof audit?.score === 'number' ? audit.score : null;
    return svg(badge('RankCLI SEO', score === null ? 'n/a' : `${score}/100`, color(score)), 3600);
  } catch (error) {
    console.error('badge error:', error);
    return neutral();
  }
});
