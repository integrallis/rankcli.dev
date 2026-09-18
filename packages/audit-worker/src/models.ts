/**
 * THE MODELS THIS WORKER ASKS, IN ONE PLACE.
 *
 * These ids were literals scattered across three packages and four Supabase edge functions, so a
 * provider retirement meant hunting strings. Anthropic retired `claude-3-haiku-20240307` on
 * 2026-04-20 and the audit went on sending it until the failure notice arrived; `gemini-pro` and
 * `llama-3.1-sonar-small-128k-online` were dead alongside it and nothing had noticed at all.
 *
 * The audit MEASURES what each assistant says about a brand, so the model is the instrument, not an
 * implementation detail: changing one changes the numbers a customer sees. Each entry below stays in
 * the price tier the one it replaced occupied, so this refresh moves the answers and not the bill.
 */

/* GPT-5.6 is a reasoning family: on chat/completions it rejects `temperature` (and `top_p`) at any
 * value and takes `max_completion_tokens`, not `max_tokens`. A rejected call looks like "not
 * mentioned" wherever the caller swallows !response.ok, so send neither. */

/** ChatGPT — the fast tier the audit has always used. */
export const OPENAI_FAST = 'gpt-5.6-luna';

/** ChatGPT — the flagship tier, for the analyses that were on `gpt-4o`. */
export const OPENAI_FLAGSHIP = 'gpt-5.6';

/** Claude — replaces the retired `claude-3-haiku-20240307`. */
export const ANTHROPIC_FAST = 'claude-haiku-4-5-20251001';

/** Gemini — replaces `gemini-pro`, an alias that stopped resolving. Pinned rather than aliased:
 *  `gemini-pro` rotting silently is exactly how this drifted, and a retirement notice is a louder
 *  failure than an instrument that quietly changes underneath a measurement. */
export const GOOGLE_FAST = 'gemini-3.7-flash';

/** Gemini is named in the URL, not the body. */
export const GOOGLE_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_FAST}:generateContent`;

/** Perplexity — replaces the retired `llama-3.1-sonar-small-128k-online`. `sonar` is its
 *  search-grounded base model, the same role the `-online` suffix used to mark. */
export const PERPLEXITY_SEARCH = 'sonar';

/** The same four assistants through OpenRouter - the primary bridge. One OpenRouter key reaches
 *  all of them, so a user (or RankCLI's free tool) needs one key instead of four. Same models as
 *  the direct ids above; keep the two in step. */
export const OPENROUTER_VISIBILITY_MODELS = {
  openai: 'openai/gpt-5.6-luna',
  anthropic: 'anthropic/claude-haiku-4.5',
  google: 'google/gemini-3.7-flash',
  perplexity: 'perplexity/sonar',
} as const;
