-- Device-flow-style bridge for the local MCP server: a tool call mints an
-- unguessable connect id, the user approves it in the browser (already
-- logged in or via GitHub/email login), and the waiting MCP process polls
-- for the resulting API key. No RLS policies - only service-role edge
-- functions touch this table, the connect id itself is the bearer secret.
CREATE TABLE mcp_connect_sessions (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  api_key TEXT,
  api_key_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ
);

ALTER TABLE mcp_connect_sessions ENABLE ROW LEVEL SECURITY;
