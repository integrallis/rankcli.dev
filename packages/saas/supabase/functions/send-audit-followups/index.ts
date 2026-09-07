/**
 * Send Audit Follow-up Emails
 *
 * Cron-triggered (see .github/workflows/send-audit-followups.yml). Finds
 * free_audits leads who provided an email, never signed up, and haven't
 * been sent a follow-up yet, then sends each a single re-engagement email
 * nudging them back to rankcli.dev.
 *
 * This is deliberately a single, one-time touch per lead - not a multi-step
 * drip sequence. followup_sent_at is set immediately after a successful
 * send so a lead is never emailed twice, even across multiple cron runs.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail, isEmailConfigured } from '../_shared/resend.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Eligibility window: give leads a real chance to convert organically
// before nudging (< MIN_AGE_DAYS old is skipped), and don't reach back into
// old, cold leads out of nowhere (> MAX_AGE_DAYS old is skipped - excluded
// from this run, not deleted; if the window is later widened they're still
// there, just untouched today).
const MIN_AGE_DAYS = 2;
const MAX_AGE_DAYS = 14;

interface FollowupRequest {
  dryRun?: boolean;
}

function followupEmailHtml(domain: string, score: number, unsubscribeUrl: string): string {
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your RankCLI audit for ${domain}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: #22c55e; margin: 0 0 8px 0; font-size: 24px;">&gt; RankCLI</h1>
      <p style="color: #94a3b8; margin: 0; font-size: 14px;">Still thinking about ${domain}?</p>
    </div>

    <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px;">
        A few days ago you ran a free SEO audit on <strong>${domain}</strong> and it scored
        <span style="color: ${scoreColor}; font-weight: 700;">${score}/100</span>.
      </p>
      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px;">
        A free RankCLI account gets you the full issue list (not just the top few), audit history so you can track score over time,
        and - if you connect GitHub - pull requests that fix the issues automatically. No credit card required.
      </p>

      <div style="text-align: center; margin-bottom: 8px;">
        <a href="https://rankcli.dev/signup?utm_source=email&utm_medium=followup&utm_campaign=free-audit-nurture"
           style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          Create a free account →
        </a>
      </div>
      <p style="text-align: center; margin: 8px 0 0 0; color: #9ca3af; font-size: 13px;">
        Or re-run the audit any time at
        <a href="https://rankcli.dev/free-audit" style="color: #22c55e;">rankcli.dev/free-audit</a>
      </p>
    </div>

    <div style="text-align: center; padding: 24px; color: #6b7280; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">
        <a href="https://rankcli.dev" style="color: #22c55e; text-decoration: none;">rankcli.dev</a> — Ship code, get ranked.
      </p>
      <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} Integrallis Software, LLC. All rights reserved.</p>
      <p style="margin: 0;"><a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe from this reminder</a></p>
    </div>
  </div>
</body>
</html>`;
}

function followupEmailText(domain: string, score: number, unsubscribeUrl: string): string {
  return `A few days ago you ran a free SEO audit on ${domain} and it scored ${score}/100.

A free RankCLI account gets you the full issue list (not just the top few), audit history so you can track score over time, and - if you connect GitHub - pull requests that fix the issues automatically. No credit card required.

Create a free account: https://rankcli.dev/signup?utm_source=email&utm_medium=followup&utm_campaign=free-audit-nurture
Or re-run the audit: https://rankcli.dev/free-audit

---
rankcli.dev - Ship code, get ranked.
Unsubscribe from this reminder: ${unsubscribeUrl}
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.includes(supabaseServiceKey)) {
    const cronSecret = Deno.env.get('CRON_SECRET') || '';
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (!isEmailConfigured()) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Email not configured (RESEND_API_KEY missing)',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { dryRun }: FollowupRequest = body;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = Date.now();
    const minCreatedAt = new Date(now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const maxCreatedAt = new Date(now - MIN_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: leads, error: leadsError } = await supabase
      .from('free_audits')
      .select('id, email, domain, score, created_at')
      .not('email', 'is', null)
      .eq('converted_to_signup', false)
      .eq('followup_opted_out', false)
      .is('followup_sent_at', null)
      .gte('created_at', minCreatedAt)
      .lte('created_at', maxCreatedAt);

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch leads' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No eligible leads',
        emailsSent: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // One email per address, even if they ran the audit more than once in
    // the eligibility window - pick the most recent run per email.
    const byEmail = new Map<string, typeof leads[number]>();
    for (const lead of leads) {
      const existing = byEmail.get(lead.email!);
      if (!existing || new Date(lead.created_at) > new Date(existing.created_at)) {
        byEmail.set(lead.email!, lead);
      }
    }
    const deduped = Array.from(byEmail.values());

    console.log(`Processing ${deduped.length} free-audit follow-ups (${leads.length} rows before de-dup)`);

    let emailsSent = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const lead of deduped) {
      try {
        const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-audit-followup?email=${encodeURIComponent(lead.email!)}`;
        const html = followupEmailHtml(lead.domain, lead.score ?? 0, unsubscribeUrl);
        const text = followupEmailText(lead.domain, lead.score ?? 0, unsubscribeUrl);
        const subject = `Still thinking about ${lead.domain}? Your RankCLI audit is waiting`;

        if (dryRun) {
          console.log(`[DRY RUN] Would send to ${lead.email} for ${lead.domain} (score ${lead.score})`);
          emailsSent++;
          continue;
        }

        const result = await sendEmail({
          to: lead.email!,
          subject,
          html,
          text,
          tags: [
            { name: 'type', value: 'free-audit-followup' },
            { name: 'domain', value: lead.domain.replace(/\./g, '_') },
          ],
        });

        if (!result.success) {
          errors.push({ id: lead.id, error: result.error || 'Send failed' });
          continue;
        }

        // Mark sent on every row for this email in the window, not just the
        // one we emailed about - otherwise older rows for the same address
        // stay eligible and get picked up (and re-sent for) on a later run.
        await supabase
          .from('free_audits')
          .update({ followup_sent_at: new Date().toISOString() })
          .eq('email', lead.email!)
          .eq('converted_to_signup', false)
          .is('followup_sent_at', null)
          .gte('created_at', minCreatedAt)
          .lte('created_at', maxCreatedAt);

        emailsSent++;
        console.log(`Follow-up sent to ${lead.email} for ${lead.domain}`);

        // Rate limiting, matching send-weekly-report's pattern.
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ id: lead.id, error: errorMessage });
        console.error(`Error processing lead ${lead.id}:`, errorMessage);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      emailsSent,
      totalEligible: deduped.length,
      errors: errors.length > 0 ? errors : undefined,
      dryRun: dryRun || false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending audit followups:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
