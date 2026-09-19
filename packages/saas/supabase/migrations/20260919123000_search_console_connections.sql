-- Search Console (gsc-oauth, sync-gsc-metrics). oauth_connections holds Google access and
-- refresh tokens; a user's own session could read them, so an XSS on rankcli.dev would have
-- handed an attacker read access to that user's Search Console. Only the edge functions
-- (service role) touch the table now, and they store the tokens encrypted. The app reads
-- connection status through gsc-oauth and metrics from seo_metrics (owner-readable, as before).

DROP POLICY IF EXISTS "Users can view own oauth_connections" ON oauth_connections;
DROP POLICY IF EXISTS "Users can manage own oauth_connections" ON oauth_connections;
REVOKE ALL ON oauth_connections FROM anon, authenticated;

-- One Google connection per project (the old unique key included site_url, which is empty
-- until a property is picked, so reconnecting added rows).
DELETE FROM oauth_connections WHERE project_id IS NULL AND provider = 'google';
CREATE UNIQUE INDEX IF NOT EXISTS oauth_connections_project_provider
  ON oauth_connections (project_id, provider)
  WHERE project_id IS NOT NULL;

-- The Google account a project is connected with, shown in the app.
ALTER TABLE oauth_connections ADD COLUMN IF NOT EXISTS provider_account_email TEXT;
