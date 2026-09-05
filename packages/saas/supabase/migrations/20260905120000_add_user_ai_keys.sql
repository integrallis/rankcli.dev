-- Per-user BYOK (bring-your-own-key) AI credentials, so free-tier users can
-- get real auto-fix PRs without RankCLI paying for their inference, and
-- paid-tier users can optionally use their own key/model instead of the
-- one create-seo-pr falls back to. One key per user (not per project) -
-- matches how api_keys already works.
--
-- The key itself is stored encrypted (AES-256-GCM, encrypted/decrypted in
-- the edge function layer with a dedicated secret - never in plaintext,
-- and RLS additionally blocks any direct client read of encrypted_key even
-- though the app never queries it from the client anyway).
CREATE TABLE user_ai_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'openrouter', 'groq', 'gemini', 'custom')),
  -- AES-256-GCM ciphertext, base64: iv + authTag + ciphertext packed together
  -- by _shared/crypto.ts. Never selected by the client directly.
  encrypted_key TEXT NOT NULL,
  -- Required for 'custom' (self-hosted/local, e.g. Ollama/LM Studio/vLLM);
  -- optional override for the others (e.g. pinning an OpenRouter model).
  base_url TEXT,
  model TEXT,

  -- Set by validate-ai-key after a real test call succeeds, so the UI can
  -- show "connected and verified" vs. "saved, not yet verified."
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_user_ai_keys_updated_at
  BEFORE UPDATE ON user_ai_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE user_ai_keys ENABLE ROW LEVEL SECURITY;

-- Users can see that a key exists and its metadata (provider, base_url,
-- model, verified_at) to render settings UI - never encrypted_key content
-- in practice (the app doesn't select it), but RLS scopes row access to
-- the owner regardless.
CREATE POLICY "Users can view own AI key"
  ON user_ai_keys FOR SELECT
  USING (user_id = auth.uid());

-- Writes only happen through the service-role edge functions (save-ai-key
-- encrypts before insert; the key must never be written unencrypted from
-- the client), so no client-facing INSERT/UPDATE/DELETE policy is needed.
