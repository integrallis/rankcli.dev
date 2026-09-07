/**
 * Unsubscribe from free-audit follow-up emails.
 *
 * Public, no auth - reachable from the plain link in the follow-up email
 * itself. Deliberately narrow: the only thing this can ever write is
 * followup_opted_out=true on rows matching the given email, using the
 * service role key internally (never exposed to the client, and RLS has no
 * anon UPDATE policy on free_audits - see 20260907130000_add_free_audit_followup.sql).
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function confirmationPage(message: string): Response {
  return new Response(
    `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>RankCLI</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
  <div style="text-align: center; max-width: 400px; padding: 24px;">
    <h1 style="color: #22c55e;">&gt; RankCLI</h1>
    <p>${message}</p>
    <a href="https://rankcli.dev" style="color: #22c55e;">rankcli.dev</a>
  </div>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (!email || !email.includes('@')) {
    return confirmationPage('Missing or invalid email address.');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase
    .from('free_audits')
    .update({ followup_opted_out: true })
    .eq('email', email);

  if (error) {
    console.error('Unsubscribe error:', error);
    return confirmationPage("Something went wrong. Email support@rankcli.dev and we'll take care of it.");
  }

  return confirmationPage("You're unsubscribed from RankCLI audit reminders. You won't get this email again.");
});
