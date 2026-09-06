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
