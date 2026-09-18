// Starts a dashboard deep audit on the audit worker.
//
// The browser used to call the worker directly with AUDIT_WORKER_SECRET built into the
// frontend bundle, and chose its own tier parameters. Both now happen server-side: this
// checks the caller owns the project, and _shared/deep-audit.ts sets the depth from their plan
// and holds the secret (the same dispatch run-scheduled-audits uses). The worker still enforces
// the per-plan domain limit itself.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { dispatchDeepAudit } from '../_shared/deep-audit.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: { user } } = token ? await supabase.auth.getUser(token) : { data: { user: null } };
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { projectId } = await req.json();
    if (!projectId) return json({ error: 'projectId required' }, 400);

    const { data: project } = await supabase
      .from('projects')
      .select('id, url, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!project) return json({ error: 'Project not found' }, 404);
    if (!project.url) return json({ error: 'Project has no URL' }, 400);

    const result = await dispatchDeepAudit(supabase, { project, triggeredBy: 'manual', triggeredByUser: user.id });
    if (!result.ok) return json({ error: result.error, audit: result.audit }, result.status);

    return json({ audit: result.audit, workerInstance: result.workerInstance, aiAnalysis: result.aiAnalysis });
  } catch (error) {
    console.error('start-deep-audit error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
