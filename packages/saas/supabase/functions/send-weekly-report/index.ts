/**
 * Send Weekly Report Edge Function
 * Designed to be called by a cron job (e.g., every Monday at 9 AM).
 * Aggregates all sites for users who have weekly reports enabled.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail, isEmailConfigured } from '../_shared/resend.ts';
import { weeklyReportEmail } from '../_shared/email-templates.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeeklyReportRequest {
  // Optional: send to specific user only (for testing)
  userId?: string;
  // Optional: dry run - don't actually send emails
  dryRun?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verify service role key (this should only be called by cron/admin)
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.includes(supabaseServiceKey)) {
    // Also allow cron secret
    const cronSecret = Deno.env.get('CRON_SECRET') || '';
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
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
    const body = await req.json().catch(() => ({}));
    const { userId, dryRun }: WeeklyReportRequest = body;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users who have weekly reports enabled
    let prefsQuery = supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('email_weekly_report', true);

    if (userId) {
      prefsQuery = prefsQuery.eq('user_id', userId);
    }

    const { data: prefs, error: prefsError } = await prefsQuery;

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch preferences' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!prefs || prefs.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No users have weekly reports enabled',
        emailsSent: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userIds = prefs.map(p => p.user_id);
    console.log(`Processing weekly reports for ${userIds.length} users`);

    // Get week start date (last Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday - 7); // Last Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Last Sunday

    const weekOfStr = weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    let emailsSent = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    for (const uid of userIds) {
      try {
        // Get user email and name
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(uid);
        if (userError || !userData?.user?.email) {
          errors.push({ userId: uid, error: 'User not found' });
          continue;
        }

        const userEmail = userData.user.email;
        const userName = userData.user.user_metadata?.name || userEmail.split('@')[0];

        // Get user's active projects with latest audit
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id,
            name,
            domain,
            last_audit_score,
            audits (
              score,
              issues_found,
              created_at
            )
          `)
          .eq('user_id', uid)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (projectsError) {
          errors.push({ userId: uid, error: `Projects error: ${projectsError.message}` });
          continue;
        }

        if (!projects || projects.length === 0) {
          console.log(`No projects for user ${uid}, skipping`);
          continue;
        }

        // Build site data for the report
        const sites = await Promise.all(projects.map(async (project) => {
          // Get latest and previous audit scores
          const audits = (project.audits as Array<{ score: number; issues_found: number; created_at: string }>)
            ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];
          
          const latestAudit = audits[0];
          const previousAudit = audits[1];

          // Get issue counts
          let errors = 0;
          let warnings = 0;

          if (latestAudit) {
            // Get actual issue counts from latest audit
            const { data: issues } = await supabase
              .from('audit_issues')
              .select('severity')
              .eq('audit_id', project.id)
              .eq('status', 'open');

            if (issues) {
              errors = issues.filter(i => i.severity === 'error').length;
              warnings = issues.filter(i => i.severity === 'warning').length;
            }
          }

          return {
            name: project.name,
            domain: project.domain,
            score: latestAudit?.score || project.last_audit_score || 0,
            previousScore: previousAudit?.score,
            errors,
            warnings,
            projectUrl: `https://rankcli.dev/projects/${project.id}`,
          };
        }));

        // Only send if there are sites with scores
        const validSites = sites.filter(s => s.score > 0);
        if (validSites.length === 0) {
          console.log(`No valid sites for user ${uid}, skipping`);
          continue;
        }

        // Generate email
        const reportData = {
          userName,
          weekOf: weekOfStr,
          sites: validSites,
        };

        const { html, text, subject } = weeklyReportEmail(reportData);

        if (dryRun) {
          console.log(`[DRY RUN] Would send to ${userEmail}: ${subject}`);
          emailsSent++;
          continue;
        }

        // Send email
        const result = await sendEmail({
          to: userEmail,
          subject,
          html,
          text,
          tags: [
            { name: 'type', value: 'weekly-report' },
            { name: 'user_id', value: uid },
          ],
        });

        if (result.success) {
          emailsSent++;
          console.log(`Weekly report sent to ${userEmail}`);
        } else {
          errors.push({ userId: uid, error: result.error || 'Send failed' });
        }

        // Rate limiting: wait 100ms between emails to avoid hitting Resend limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ userId: uid, error: errorMessage });
        console.error(`Error processing user ${uid}:`, errorMessage);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent,
      totalUsers: userIds.length,
      errors: errors.length > 0 ? errors : undefined,
      dryRun: dryRun || false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending weekly reports:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
