-- Cheap hosted inference providers as first-class key slots: DeepSeek, Together, Fireworks,
-- Mistral and Cerebras all speak the OpenAI-shaped API, so each only needs a key (and, for
-- the catalogues that rename often, a model name). Local servers (Ollama, LM Studio, vLLM)
-- stay under 'custom' - the hosted app can only reach them through a public URL; the CLI
-- talks to them directly.

ALTER TABLE user_ai_keys DROP CONSTRAINT IF EXISTS user_ai_keys_provider_check;
ALTER TABLE user_ai_keys
  ADD CONSTRAINT user_ai_keys_provider_check
  CHECK (provider IN (
    'openai', 'anthropic', 'openrouter', 'groq', 'gemini', 'perplexity',
    'deepseek', 'together', 'fireworks', 'mistral', 'cerebras',
    'custom'
  ));
