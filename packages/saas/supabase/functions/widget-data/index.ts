import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getEntitlement } from '../_shared/tier.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let token: string | undefined;
  try {
    ({ token } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    if (!token || !token.startsWith('widget_')) {
      return new Response(JSON.stringify({ error: 'Invalid widget token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up the widget token
    const { data: widgetToken, error: tokenError } = await supabase
      .from('widget_tokens')
      .select(`
        id,
        project_id,
        projects (
          id,
          user_id,
          name,
          url,
          last_audit_score
        )
      `)
      .eq('token', token)
      .single();

    if (tokenError || !widgetToken) {
      return new Response(JSON.stringify({ error: 'Widget token not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // A many-to-one embed is one row at runtime; without generated types supabase-js
    // infers an array.
    const project = widgetToken.projects as unknown as {
      id: string;
      user_id: string;
      name: string;
      url: string;
      last_audit_score: number | null;
    };

    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the latest audit for issue counts
    const { data: latestAudit } = await supabase
      .from('audits')
      .select('id, score, created_at')
      .eq('project_id', project.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get issue counts
    let errors = 0;
    let warnings = 0;

    if (latestAudit) {
      const { data: issues } = await supabase
        .from('audit_issues')
        .select('severity')
        .eq('audit_id', latestAudit.id);

      if (issues) {
        errors = issues.filter((i) => i.severity === 'error').length;
        warnings = issues.filter((i) => i.severity === 'warning').length;
      }
    }

    // Update last_accessed timestamp
    await supabase
      .from('widget_tokens')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', widgetToken.id);

    // White-labelled widgets (no "Powered by RankCLI") are an Agency feature, decided here from
    // the owner's plan - never by the embedding page.
    const whiteLabel = (await getEntitlement(supabase, project.user_id)).tier === 'agency';

    return new Response(JSON.stringify({
      whiteLabel,
      score: latestAudit?.score ?? project.last_audit_score ?? 0,
      errors,
      warnings,
      lastAudit: latestAudit?.created_at ?? new Date().toISOString(),
      siteName: project.name,
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('Widget data error:', error);
    return new Response(JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
