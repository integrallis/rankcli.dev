/**
 * Send Audit Email Edge Function
 * Called after an audit completes to notify the user (if enabled).
 * 
 * Can be called:
 * 1. Directly from audit-worker after completion
 * 2. Via database trigger when audit status changes to 'completed'
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail, isEmailConfigured } from '../_shared/resend.ts';
import { auditCompleteEmail, criticalIssuesEmail } from '../_shared/email-templates.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditEmailRequest {
  auditId: string;
  // Optional: can skip preference check (for admin/system calls)
  skipPreferenceCheck?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verify service role or worker secret
  const authHeader = req.headers.get('authorization');
  const workerSecret = Deno.env.get('AUDIT_WORKER_SECRET') || '';
  
  const isServiceRole = authHeader?.includes(supabaseServiceKey);
  const isWorker = authHeader === `Bearer ${workerSecret}`;
  
  if (!isServiceRole && !isWorker) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check if email is configured
  if (!isEmailConfigured()) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Email not configured (RESEND_API_KEY missing)' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { auditId, skipPreferenceCheck }: AuditEmailRequest = await req.json();

    if (!auditId) {
      return new Response(JSON.stringify({ error: 'auditId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get audit with project and user info
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select(`
        id,
        score,
        status,
        issues_found,
        created_at,
        project:projects (
          id,
          name,
          url,
          domain,
          user_id,
          last_audit_score
        )
      `)
      .eq('id', auditId)
      .single();

    if (auditError || !audit) {
      console.error('Audit not found:', auditError);
      return new Response(JSON.stringify({ error: 'Audit not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (audit.status !== 'completed') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Audit not completed yet' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const project = Array.isArray(audit.project) ? audit.project[0] : audit.project;
    if (!project?.user_id) {
      return new Response(JSON.stringify({ error: 'Project or user not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(project.user_id);
    if (userError || !userData?.user?.email) {
      console.error('User not found:', userError);
      return new Response(JSON.stringify({ error: 'User email not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userEmail = userData.user.email;

    // Check notification preferences (unless skipped)
    if (!skipPreferenceCheck) {
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('email_audit_complete, email_issues_found')
        .eq('user_id', project.user_id)
        .single();

      // If no preferences, use defaults (audit complete: true, issues: true)
      const auditComplete = prefs?.email_audit_complete ?? true;
      const issuesFound = prefs?.email_issues_found ?? true;

      if (!auditComplete && !issuesFound) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Email notifications disabled for user' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Get top issues for the email
    const { data: issues } = await supabase
      .from('audit_issues')
      .select('title, category, severity, description')
      .eq('audit_id', auditId)
      .in('severity', ['error', 'warning'])
      .order('severity', { ascending: true })
      .limit(10);

    const errors = issues?.filter(i => i.severity === 'error') || [];
    const warnings = issues?.filter(i => i.severity === 'warning') || [];

    // Check if we should send critical issues email
    const hasCriticalIssues = errors.length >= 3; // 3+ errors = critical
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('email_audit_complete, email_issues_found')
      .eq('user_id', project.user_id)
      .single();

    const sendAuditComplete = prefs?.email_audit_complete ?? true;
    const sendCriticalAlert = prefs?.email_issues_found ?? true;

    let emailsSent = 0;

    // Send critical issues alert if applicable
    if (hasCriticalIssues && sendCriticalAlert) {
      const criticalData = {
        siteName: project.name,
        siteUrl: project.url,
        criticalIssues: errors.slice(0, 5).map(e => ({
          title: e.title,
          category: e.category,
          description: e.description || '',
        })),
        auditUrl: `https://rankcli.dev/projects/${project.id}`,
      };

      const { html, text, subject } = criticalIssuesEmail(criticalData);
      const result = await sendEmail({
        to: userEmail,
        subject,
        html,
        text,
        tags: [
          { name: 'type', value: 'critical-issues' },
          { name: 'project_id', value: project.id },
        ],
      });

      if (result.success) {
        emailsSent++;
        console.log('Critical issues email sent:', result.id);
      } else {
        console.error('Failed to send critical issues email:', result.error);
      }
    }

    // Send audit complete email (unless critical issues email was sent)
    if (sendAuditComplete && !(hasCriticalIssues && sendCriticalAlert)) {
      const auditData = {
        siteName: project.name,
        siteUrl: project.url,
        score: audit.score || 0,
        previousScore: project.last_audit_score || undefined,
        errors: errors.length,
        warnings: warnings.length,
        topIssues: (issues || []).slice(0, 5).map(i => ({
          title: i.title,
          category: i.category,
          severity: i.severity as 'error' | 'warning',
        })),
        auditUrl: `https://rankcli.dev/projects/${project.id}`,
      };

      const { html, text, subject } = auditCompleteEmail(auditData);
      const result = await sendEmail({
        to: userEmail,
        subject,
        html,
        text,
        tags: [
          { name: 'type', value: 'audit-complete' },
          { name: 'project_id', value: project.id },
        ],
      });

      if (result.success) {
        emailsSent++;
        console.log('Audit complete email sent:', result.id);
      } else {
        console.error('Failed to send audit complete email:', result.error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent,
      message: emailsSent > 0 ? 'Email(s) sent successfully' : 'No emails sent (preferences or conditions not met)',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending audit email:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
