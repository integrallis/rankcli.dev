// Shared BYOK resolution for every AI-calling edge function. AI features run on the
// customer's own keys only - RankCLI's keys are never a fallback, for any tier. A user
// holds at most one key per provider (user_ai_keys is unique on user_id + provider), so
// the AI-visibility check can ask each assistant with its own key.
import { decryptSecret } from './crypto.ts';
import type { AIProvider, AIProviderConfig } from './ai-provider.ts';

export type UserAIKeys = Partial<Record<AIProvider, AIProviderConfig>>;

// Which key a single-model feature (keyword research, auto-fix PRs, audit analysis, local
// SEO) uses when a user has connected several. OpenRouter is the primary bridge, so it goes
// first. Perplexity is last: it's there for the visibility check's fourth assistant, and a
// search-grounded model is a poor analyst.
const PREFERENCE: AIProvider[] = [
  'openrouter', 'openai', 'anthropic', 'gemini',
  'deepseek', 'mistral', 'groq', 'together', 'fireworks', 'cerebras',
  'custom', 'perplexity',
];

// deno-lint-ignore no-explicit-any
export async function loadUserAIKeys(supabase: any, userId: string | null | undefined): Promise<UserAIKeys> {
  if (!userId) return {};

  const { data: rows } = await supabase
    .from('user_ai_keys')
    .select('provider, encrypted_key, base_url, model')
    .eq('user_id', userId);
  if (!rows?.length) return {};

  const encryptionSecret = Deno.env.get('AI_KEY_ENCRYPTION_SECRET');
  if (!encryptionSecret) throw new Error('AI key storage not configured');

  const keys: UserAIKeys = {};
  for (const row of rows) {
    keys[row.provider as AIProvider] = {
      provider: row.provider,
      apiKey: await decryptSecret(row.encrypted_key, encryptionSecret),
      baseUrl: row.base_url || undefined,
      model: row.model || undefined,
    };
  }
  return keys;
}

export function preferredAIConfig(keys: UserAIKeys): AIProviderConfig | null {
  for (const provider of PREFERENCE) {
    const config = keys[provider];
    if (config) return config;
  }
  return null;
}

export type AIConfigResolution =
  | { ok: true; config: AIProviderConfig; source: 'user' }
  /** RankCLI's own OpenRouter key, claimed from the account's one-time gift. */
  | { ok: true; config: AIProviderConfig; source: 'gift' }
  | { ok: false; reason: 'no_key' };

/**
 * The model a gifted call runs on, and what it costs us.
 *
 * Measured envelope for an auto-fix PR: ~9K input, ~3K output. At gemini-2.5-flash-lite's
 * $0.10/M input and $0.40/M output that is about $0.002 - so the gift is bounded by fraud,
 * not by spend, which is why the one-shot lives in a primary key and not in a budget.
 *
 * Deliberately not one of OpenRouter's :free variants: their prompts are generally
 * trainable-on and the payload here is the customer's source code, they share rate limits
 * across everyone using them, and a small model doing strict-JSON multi-file generation is
 * exactly where truncated output comes from. Two thousandths of a dollar is not worth any
 * of that.
 */
const GIFT_MODEL = Deno.env.get('OPENROUTER_GIFT_MODEL') || 'google/gemini-2.5-flash-lite';
const GIFT_PRICE_PER_M = { input: 0.10, output: 0.40 };

export function giftModel(): string {
  return GIFT_MODEL;
}

/** USD for a gifted call, from the usage the API reports back. */
export function giftCostUsd(promptTokens: number, completionTokens: number): number {
  return (
    (promptTokens / 1_000_000) * GIFT_PRICE_PER_M.input +
    (completionTokens / 1_000_000) * GIFT_PRICE_PER_M.output
  );
}

/**
 * The AI config for a feature, preferring the user's own key.
 *
 * `gift` opts into the one-time gifted call when the user has no key of their own: it claims
 * the grant (atomically - see claim_ai_gift) and returns RankCLI's OpenRouter key. A caller
 * that doesn't pass it keeps the old behaviour exactly, which is why every other AI feature
 * is unchanged: the gift is for the auto-fix PR, the thing a new account actually wants to
 * see work.
 *
 * Returns no_key when there is no user key and no gift to claim - already spent, the day's
 * ceiling is reached, or OPENROUTER_GIFT_KEY isn't configured. Callers fall back to the
 * template fixes, which need no model at all.
 */
// deno-lint-ignore no-explicit-any
export async function resolveAIConfig(
  supabase: any,
  userId: string | null | undefined,
  gift?: { enabled: boolean; projectId?: string | null; auditId?: string | null }
): Promise<AIConfigResolution> {
  const config = preferredAIConfig(await loadUserAIKeys(supabase, userId));
  if (config) return { ok: true, config, source: 'user' };

  const giftKey = Deno.env.get('OPENROUTER_GIFT_KEY');
  if (!gift?.enabled || !userId || !giftKey) return { ok: false, reason: 'no_key' };

  const { data: claimed, error } = await supabase.rpc('claim_ai_gift', {
    p_user_id: userId,
    p_project_id: gift.projectId ?? null,
    p_audit_id: gift.auditId ?? null,
  });
  if (error) {
    // A gift is a nicety; never fail the request over one.
    console.error('[GIFT] claim_ai_gift failed:', error.message);
    return { ok: false, reason: 'no_key' };
  }
  if (!claimed) return { ok: false, reason: 'no_key' };

  console.log(`[GIFT] granted to ${userId} on ${GIFT_MODEL}`);
  return {
    ok: true,
    source: 'gift',
    config: { provider: 'openrouter', apiKey: giftKey, model: GIFT_MODEL },
  };
}

export function aiConfigErrorMessage(feature = 'this feature'): string {
  return `Connect an AI provider key to use ${feature} - RankCLI runs AI features on your own key. We recommend OpenRouter: one key reaches ChatGPT, Claude, Gemini and Perplexity, and its free models cost nothing. Add one at https://rankcli.dev/account?tab=ai-provider`;
}
