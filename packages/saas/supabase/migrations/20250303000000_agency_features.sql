-- Agency features: widget tokens and client sharing links

-- Widget tokens for embeddable score widgets
CREATE TABLE IF NOT EXISTS widget_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure user owns the project via projects table
  CONSTRAINT widget_tokens_token_format CHECK (token ~ '^widget_[a-f0-9]{48}$')
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_widget_tokens_token ON widget_tokens(token);
CREATE INDEX IF NOT EXISTS idx_widget_tokens_project ON widget_tokens(project_id);

-- RLS policies for widget_tokens
ALTER TABLE widget_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage widget tokens for their own projects
CREATE POLICY widget_tokens_select ON widget_tokens
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY widget_tokens_insert ON widget_tokens
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY widget_tokens_delete ON widget_tokens
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Client sharing links for read-only report access
CREATE TABLE IF NOT EXISTS client_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT client_links_token_format CHECK (token ~ '^[a-f0-9]{32}$')
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_client_links_token ON client_links(token);
CREATE INDEX IF NOT EXISTS idx_client_links_project ON client_links(project_id);

-- RLS policies for client_links
ALTER TABLE client_links ENABLE ROW LEVEL SECURITY;

-- Users can manage client links for their own projects
CREATE POLICY client_links_select ON client_links
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY client_links_insert ON client_links
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY client_links_delete ON client_links
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );
