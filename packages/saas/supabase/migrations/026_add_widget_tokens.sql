-- Widget tokens table for embeddable widgets (Agency feature)
CREATE TABLE IF NOT EXISTS widget_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for token lookup
CREATE INDEX idx_widget_tokens_token ON widget_tokens(token);
CREATE INDEX idx_widget_tokens_project ON widget_tokens(project_id);
CREATE INDEX idx_widget_tokens_user ON widget_tokens(user_id);

-- RLS policies
ALTER TABLE widget_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own widget tokens
CREATE POLICY "Users can view own widget tokens"
  ON widget_tokens FOR SELECT
  USING (user_id = auth.uid());

-- Users can create widget tokens for their projects
CREATE POLICY "Users can create widget tokens"
  ON widget_tokens FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own widget tokens
CREATE POLICY "Users can delete own widget tokens"
  ON widget_tokens FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to set user_id on insert
CREATE OR REPLACE FUNCTION set_widget_token_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER widget_tokens_set_user_id
  BEFORE INSERT ON widget_tokens
  FOR EACH ROW
  EXECUTE FUNCTION set_widget_token_user_id();

-- Comment for documentation
COMMENT ON TABLE widget_tokens IS 'Widget tokens for embeddable SEO widgets. Agency feature only.';
