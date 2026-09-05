// Shared BYOK resolution for every AI-calling edge function. A connected
// user_ai_keys row always wins, for every tier, no exceptions - we never
// eat inference cost we don't have to. Absent one, only tiers actually
// sold the calling feature (passed in per-caller as fallbackTiers, since
// different features are gated to different tiers in pricing-tiers.json)
// fall back to RankCLI's own key, and always at the cheapest capable
// model (gpt-4o-mini) - a BYOK user's own config keeps whatever
// model/provider they connected.
import { decryptSecret } from './crypto.ts';
import type { AIProviderConfig } from './ai-provider.ts';

export type AIConfigResolution =
  | { ok: true; config: AIProviderConfig }
  | { ok: false; reason: 'no_key_byok_required' | 'no_key_configured' };

export async function resolveAIConfig(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string | null | undefined,
  rankcliOpenAIKey: string | undefined,
  fallbackTiers: Set<string>
): Promise<AIConfigResolution> {
  if (userId) {
    const { data: byok } = await supabase
      .from('user_ai_keys')
      .select('provider, encrypted_key, base_url, model')
      .eq('user_id', userId)
      .single();

    if (byok) {
      const encryptionSecret = Deno.env.get('AI_KEY_ENCRYPTION_SECRET');
      if (!encryptionSecret) throw new Error('AI key storage not configured');
      const apiKey = await decryptSecret(byok.encrypted_key, encryptionSecret);
      return {
        ok: true,
        config: { provider: byok.provider, apiKey, baseUrl: byok.base_url || undefined, model: byok.model || undefined },
      };
    }
  }

  // No userId (e.g. no projectId supplied to resolve one from) can never
  // qualify for RankCLI's key either - there's no tier to check - so this
  // falls through to the same "connect a key" response as an unqualified
  // tier, rather than a separate code path.
  let tier = 'free';
  if (userId) {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan:subscription_plans (plan_id)')
      .eq('user_id', userId)
      .single();
    const plan = subscription?.plan as { plan_id: string } | null;
    tier = plan?.plan_id || 'free';
  }

  if (!fallbackTiers.has(tier)) {
    return { ok: false, reason: 'no_key_byok_required' };
  }
  if (!rankcliOpenAIKey) {
    return { ok: false, reason: 'no_key_configured' };
  }
  return { ok: true, config: { provider: 'openai', apiKey: rankcliOpenAIKey, model: 'gpt-4o-mini' } };
}

export function aiConfigErrorMessage(reason: 'no_key_byok_required' | 'no_key_configured', feature = 'this feature'): string {
  return reason === 'no_key_byok_required'
    ? `Connect an AI provider key to enable ${feature} on your plan - any provider works, including free-tier keys from OpenRouter, Groq, or Google AI Studio. Add one at https://rankcli.dev/account?tab=ai-provider`
    : 'No AI provider configured for this account';
}
