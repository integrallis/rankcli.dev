-- Slack/Discord webhook alert settings, managed from Account > Notifications
-- (AlertConfigForm.tsx / useAlertConfigs.ts) - the table backing it was
-- never created, so the form has been failing with "Could not find the
-- table 'public.alert_configs' in the schema cache" since it shipped.
--
-- Note: this only stores the config. Nothing yet reads this table to
-- actually post to Slack/Discord when on_error/on_score_drop/on_pr_created/
-- on_weekly_report events happen - that trigger-side wiring (audit-worker,
-- github-webhook, send-weekly-report) doesn't exist yet.
CREATE TABLE alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  channel TEXT NOT NULL CHECK (channel IN ('slack', 'discord')),
  webhook_url TEXT NOT NULL,

  on_error BOOLEAN NOT NULL DEFAULT true,
  on_score_drop BOOLEAN NOT NULL DEFAULT true,
  on_weekly_report BOOLEAN NOT NULL DEFAULT false,
  on_pr_created BOOLEAN NOT NULL DEFAULT true,
  score_drop_threshold INTEGER NOT NULL DEFAULT 10,

  enabled BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_configs_user_id ON alert_configs(user_id);
CREATE INDEX idx_alert_configs_project_id ON alert_configs(project_id);

CREATE TRIGGER update_alert_configs_updated_at
  BEFORE UPDATE ON alert_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE alert_configs ENABLE ROW LEVEL SECURITY;

-- The client (AlertConfigForm) does direct CRUD, not through an edge
-- function, so it needs the full set of owner-scoped policies.
CREATE POLICY "Users can view own alert configs"
  ON alert_configs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own alert configs"
  ON alert_configs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own alert configs"
  ON alert_configs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own alert configs"
  ON alert_configs FOR DELETE
  USING (user_id = auth.uid());
