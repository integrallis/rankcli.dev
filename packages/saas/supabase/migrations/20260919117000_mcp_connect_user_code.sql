-- mcp-connect-claim used to mint an API key the moment a signed-in user
-- opened /connect?id=..., so anyone could start a session, send the link to a
-- victim, and collect the victim's key from mcp-connect-status. Approval is
-- now an explicit step on the page, and each session carries a short code
-- that the CLI or MCP client shows next to the link and the page shows before
-- the Approve button, so the user can see the request is the one they started.
ALTER TABLE mcp_connect_sessions ADD COLUMN IF NOT EXISTS user_code TEXT;
