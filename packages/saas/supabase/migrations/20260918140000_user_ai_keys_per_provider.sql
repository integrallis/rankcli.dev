-- One AI key per provider per user, not one per user.
--
-- AI features now run on the customer's own keys only - RankCLI's keys are no longer a
-- fallback anywhere. The AI-visibility check asks four assistants (ChatGPT, Claude, Gemini,
-- Perplexity), and a single key can only ever cover one of them, so a user needs a slot per
-- provider. Existing rows keep working: each is already unique per (user, provider).
--
-- Perplexity is added as a provider for the visibility check's fourth assistant.

ALTER TABLE user_ai_keys DROP CONSTRAINT IF EXISTS user_ai_keys_user_id_key;
ALTER TABLE user_ai_keys
  ADD CONSTRAINT user_ai_keys_user_id_provider_key UNIQUE (user_id, provider);

ALTER TABLE user_ai_keys DROP CONSTRAINT IF EXISTS user_ai_keys_provider_check;
ALTER TABLE user_ai_keys
  ADD CONSTRAINT user_ai_keys_provider_check
  CHECK (provider IN ('openai', 'anthropic', 'openrouter', 'groq', 'gemini', 'perplexity', 'custom'));
