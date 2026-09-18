/**
 * THE MODELS THE VISIBILITY CHECKS ASK, IN ONE PLACE.
 *
 * These ids were literals inline in each edge function, and the same four were repeated in the
 * audit worker, so a provider retirement meant hunting strings across two runtimes. Anthropic
 * retired `claude-3-haiku-20240307` on 2026-04-20 and these functions went on sending it until the
 * failure notice arrived; `gemini-pro` and `llama-3.1-sonar-small-128k-online` were already dead
 * beside it and nothing had noticed at all.
 *
 * The checks MEASURE what each assistant says about a brand, so the model is the instrument: these
 * four have to stay in the same generation as each other, or the comparison between providers is
 * reporting the age of the models rather than the visibility of the brand. Each id sits in the
 * price tier the one it replaces occupied.
 *
 * Keep in step with `packages/audit-worker/src/models.ts`, which asks the same four. The two
 * runtimes cannot share a module — one is Deno, one is npm — so this is the seam where they agree.
 */

/* GPT-5.6 is a reasoning family: on chat/completions it rejects `temperature` (and `top_p`) at any
 * value and takes `max_completion_tokens`, not `max_tokens`. A rejected call looks like "not
 * mentioned" wherever the caller swallows !response.ok, so send neither. */

/** ChatGPT — the fast tier these checks have always used. */
export const OPENAI_FAST = 'gpt-5.6-luna';

/** Claude — replaces the retired `claude-3-haiku-20240307`. */
export const ANTHROPIC_FAST = 'claude-haiku-4-5-20251001';

/** Gemini — replaces `gemini-pro`, which no longer resolves. Pinned rather than aliased: an alias
 *  rotting silently is how this drifted, and a retirement notice is the louder failure. */
export const GOOGLE_FAST = 'gemini-3.7-flash';

/** Gemini is named in the URL, not the body. */
export const GOOGLE_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_FAST}:generateContent`;

/** Perplexity — replaces the retired `llama-3.1-sonar-small-128k-online`. `sonar` is its
 *  search-grounded base model, the role the `-online` suffix used to mark. */
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
