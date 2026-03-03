// Client report endpoint - returns audit data for shareable client links
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Report token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for public report access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Look up client link
    const { data: clientLink, error: linkError } = await supabase
      .from('client_links')
      .select('project_id, expires_at')
      .eq('token', token)
      .single()

    if (linkError || !clientLink) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired report link' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check expiration
    if (clientLink.expires_at && new Date(clientLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This report link has expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, url, last_audit_score')
      .eq('id', clientLink.project_id)
      .single()

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get latest completed audit
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('id, created_at, score, health_scores, checks_run, pages_crawled')
      .eq('project_id', project.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (auditError || !audit) {
      return new Response(
        JSON.stringify({ error: 'No audit data available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get issues for the audit
    const { data: issues } = await supabase
      .from('issues')
      .select('id, severity, code, message, page_url')
      .eq('audit_id', audit.id)
      .order('severity', { ascending: true })

    return new Response(
      JSON.stringify({
        project: {
          name: project.name,
          url: project.url,
          score: project.last_audit_score || audit.score || 0,
        },
        audit: {
          created_at: audit.created_at,
          health_scores: audit.health_scores || {},
          checks_run: audit.checks_run || 0,
          pages_crawled: audit.pages_crawled || 1,
        },
        issues: issues || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Client report error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
