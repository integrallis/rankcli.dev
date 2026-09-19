// Report generator - a printable HTML SEO audit report (white-label on the Agency plan)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getEntitlement } from '../_shared/tier.ts'

// Everything interpolated into the report is escaped: issue text and URLs come from crawled
// pages, and the agency name and logo from the request.
const esc = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportOptions {
  auditId: string
  projectId: string
  whiteLabel?: boolean
  agencyName?: string
  agencyLogo?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const options: ReportOptions = await req.json()
    const { auditId, projectId, agencyName } = options
    // White-label is an Agency feature: the request's flag only counts on that plan, checked
    // with the service role (the entitlement tables aren't all readable under the user's RLS).
    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const whiteLabel = options.whiteLabel === true && (await getEntitlement(admin, user.id)).tier === 'agency'
    const agencyLogo = options.agencyLogo && /^https:\/\//i.test(options.agencyLogo) ? options.agencyLogo : undefined

    if (!auditId || !projectId) {
      return new Response(
        JSON.stringify({ error: 'auditId and projectId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user owns project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get audit data
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .eq('project_id', projectId)
      .single()

    if (auditError || !audit) {
      return new Response(
        JSON.stringify({ error: 'Audit not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get issues
    const { data: issues } = await supabase
      .from('audit_issues')
      .select('*, message:description, page_url:affected_urls')
      .eq('audit_id', auditId)
      .order('severity', { ascending: true })

    // Generate PDF HTML
    const brandName = whiteLabel && agencyName ? agencyName : 'RankCLI'
    const logoHtml = whiteLabel && agencyLogo 
      ? `<img src="${esc(agencyLogo)}" alt="${esc(brandName)}" style="max-height: 40px; max-width: 200px;" />`
      : whiteLabel 
        ? `<span style="font-size: 24px; font-weight: bold;">${esc(brandName)}</span>`
        : `<span style="font-size: 24px; font-weight: bold; color: #6366f1;">RankCLI</span>`

    const healthScores = audit.health_scores || {}
    const errorCount = issues?.filter(i => i.severity === 'error').length || 0
    const warningCount = issues?.filter(i => i.severity === 'warning').length || 0
    const noticeCount = issues?.filter(i => i.severity === 'notice').length || 0

    const getScoreColor = (score: number) => {
      if (score >= 80) return '#22c55e'
      if (score >= 60) return '#eab308'
      return '#ef4444'
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.5; }
    .page { padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
    .date { color: #6b7280; font-size: 14px; }
    .hero { text-align: center; margin-bottom: 40px; }
    .hero h1 { font-size: 28px; margin-bottom: 8px; }
    .hero .url { color: #6b7280; font-size: 14px; }
    .score-section { display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; }
    .main-score { text-align: center; }
    .main-score .value { font-size: 72px; font-weight: bold; }
    .main-score .label { color: #6b7280; font-size: 14px; }
    .category-scores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
    .category { padding: 16px; background: #f9fafb; border-radius: 8px; text-align: center; }
    .category .value { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
    .category .label { color: #6b7280; font-size: 12px; }
    .summary { display: flex; gap: 20px; margin-bottom: 40px; justify-content: center; }
    .summary-item { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: #f9fafb; border-radius: 8px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot.error { background: #ef4444; }
    .dot.warning { background: #eab308; }
    .dot.notice { background: #3b82f6; }
    .issues-section { margin-top: 40px; }
    .issues-section h2 { font-size: 20px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
    .issue { padding: 16px; margin-bottom: 12px; border-radius: 8px; border-left: 4px solid; }
    .issue.error { background: #fef2f2; border-color: #ef4444; }
    .issue.warning { background: #fffbeb; border-color: #eab308; }
    .issue.notice { background: #eff6ff; border-color: #3b82f6; }
    .issue-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .issue-title { font-weight: 600; }
    .issue-page { font-size: 12px; color: #6b7280; }
    .issue-desc { font-size: 14px; color: #4b5563; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoHtml}
      <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
    </div>
    
    <div class="hero">
      <h1>SEO Audit Report</h1>
      <p class="url">${esc(project.url)}</p>
    </div>
    
    <div class="score-section">
      <div class="main-score">
        <div class="value" style="color: ${getScoreColor(audit.score || 0)}">${audit.score || 0}</div>
        <div class="label">Overall SEO Score</div>
      </div>
    </div>
    
    <div class="category-scores">
      ${Object.entries({
        'Crawlability': healthScores.crawlability,
        'On-Page': healthScores.onPage,
        'Content': healthScores.content,
        'Performance': healthScores.performance,
        'Security': healthScores.security,
        'AI Ready': healthScores.aiReadiness,
      }).map(([label, score]) => `
        <div class="category">
          <div class="value" style="color: ${getScoreColor(score || 0)}">${score || '-'}</div>
          <div class="label">${label}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="summary">
      <div class="summary-item">
        <div class="dot error"></div>
        <span><strong>${errorCount}</strong> Errors</span>
      </div>
      <div class="summary-item">
        <div class="dot warning"></div>
        <span><strong>${warningCount}</strong> Warnings</span>
      </div>
      <div class="summary-item">
        <div class="dot notice"></div>
        <span><strong>${noticeCount}</strong> Notices</span>
      </div>
    </div>
    
    ${issues && issues.length > 0 ? `
    <div class="issues-section">
      <h2>Issues Found</h2>
      ${issues.slice(0, 30).map(issue => `
        <div class="issue ${esc(issue.severity)}">
          <div class="issue-header">
            <span class="issue-title">${esc(issue.title || issue.code || 'Issue')}</span>
            <span class="issue-page">${esc(Array.isArray(issue.page_url) ? issue.page_url.join(', ') : issue.page_url)}</span>
          </div>
          <p class="issue-desc">${esc(issue.message || issue.description)}</p>
        </div>
      `).join('')}
      ${issues.length > 30 ? `<p style="text-align: center; color: #6b7280; margin-top: 20px;">... and ${issues.length - 30} more issues</p>` : ''}
    </div>
    ` : ''}
    
    <div class="footer">
      ${whiteLabel 
        ? `Report prepared by ${esc(brandName)}`
        : `Powered by <a href="https://rankcli.dev" style="color: #6366f1;">RankCLI</a> - SEO Autopilot for Developers`
      }
    </div>
  </div>
</body>
</html>
    `

    // For now, return HTML (PDF generation would require additional library like puppeteer)
    // In production, you'd use a PDF generation service or library
    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${project.name.replace(/[^\w.-]+/g, '-')}-seo-report.html"`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to generate report' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
