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
const PREFERENCE: AIProvider[] = ['openrouter', 'openai', 'anthropic', 'gemini', 'groq', 'custom', 'perplexity'];

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
  | { ok: true; config: AIProviderConfig }
  | { ok: false; reason: 'no_key' };

// deno-lint-ignore no-explicit-any
export async function resolveAIConfig(supabase: any, userId: string | null | undefined): Promise<AIConfigResolution> {
  const config = preferredAIConfig(await loadUserAIKeys(supabase, userId));
  return config ? { ok: true, config } : { ok: false, reason: 'no_key' };
}

export function aiConfigErrorMessage(feature = 'this feature'): string {
  return `Connect an AI provider key to use ${feature} - RankCLI runs AI features on your own key. We recommend OpenRouter: one key reaches ChatGPT, Claude, Gemini and Perplexity, and its free models cost nothing. Add one at https://rankcli.dev/account?tab=ai-provider`;
}
