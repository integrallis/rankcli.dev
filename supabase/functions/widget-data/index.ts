// Widget data endpoint - returns SEO score for embeddable widgets
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
        JSON.stringify({ error: 'Widget token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for public widget access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Look up widget token and get associated project
    const { data: widgetToken, error: tokenError } = await supabase
      .from('widget_tokens')
      .select('project_id')
      .eq('token', token)
      .single()

    if (tokenError || !widgetToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid widget token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get project and latest audit data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, url, last_audit_score')
      .eq('id', widgetToken.project_id)
      .single()

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get latest completed audit
    const { data: audit } = await supabase
      .from('audits')
      .select('id, created_at')
      .eq('project_id', project.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get issue counts
    const { data: issues } = await supabase
      .from('issues')
      .select('severity')
      .eq('audit_id', audit?.id || '')

    const errorCount = issues?.filter(i => i.severity === 'error').length || 0
    const warningCount = issues?.filter(i => i.severity === 'warning').length || 0

    return new Response(
      JSON.stringify({
        score: project.last_audit_score || 0,
        errors: errorCount,
        warnings: warningCount,
        lastAudit: audit?.created_at || new Date().toISOString(),
        siteName: project.name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Widget data error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
