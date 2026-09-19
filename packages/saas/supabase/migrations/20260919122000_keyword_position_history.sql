-- One row per rank check of a tracked keyword, so `rankcli track history` has a history to
-- show. The tracker only ever overwrote keywords.current_position / previous_position, and the
-- CLI read a `rankings` table that production never had.

CREATE TABLE IF NOT EXISTS keyword_position_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  position INTEGER,            -- NULL: not in the results checked
  url TEXT,                    -- the page that ranked
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keyword_position_history_keyword
  ON keyword_position_history(keyword_id, checked_at DESC);

ALTER TABLE keyword_position_history ENABLE ROW LEVEL SECURITY;

-- The CLI writes and reads with the user's session, like keywords.
CREATE POLICY "Users can view own keyword history"
  ON keyword_position_history FOR SELECT
  USING (keyword_id IN (
    SELECT k.id FROM keywords k JOIN projects p ON p.id = k.project_id WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can record own keyword history"
  ON keyword_position_history FOR INSERT
  WITH CHECK (keyword_id IN (
    SELECT k.id FROM keywords k JOIN projects p ON p.id = k.project_id WHERE p.user_id = auth.uid()
  ));
