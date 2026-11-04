-- The agency's brand, stored once (2026-11-04). White-label reports, client report links and the
-- PDF existed on the Agency plan, but the name and logo were typed per PDF and the client report
-- page always said "Powered by RankCLI". One row per account; the client report, the PDF and
-- the widgets read it when the owner is on the Agency plan.
CREATE TABLE IF NOT EXISTS agency_branding (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  logo_url TEXT CHECK (logo_url IS NULL OR logo_url ~* '^https://'),
  website TEXT CHECK (website IS NULL OR website ~* '^https?://'),
  accent TEXT CHECK (accent IS NULL OR accent ~ '^#[0-9a-fA-F]{6}$'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE agency_branding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own branding" ON agency_branding;
CREATE POLICY "Own branding" ON agency_branding
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP TRIGGER IF EXISTS update_agency_branding_updated_at ON agency_branding;
CREATE TRIGGER update_agency_branding_updated_at
  BEFORE UPDATE ON agency_branding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
