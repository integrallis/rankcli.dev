-- Lifetime Deals tracking
-- Tracks all LTD purchases and enforces caps

-- LTD tiers configuration (managed in app, this is for reference)
CREATE TYPE ltd_tier AS ENUM ('ltd_starter', 'ltd_pro', 'ltd_agency');

-- LTD purchases table
CREATE TABLE IF NOT EXISTS ltd_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier ltd_tier NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,

  -- Metadata
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referral_source TEXT,

  CONSTRAINT valid_price CHECK (price_cents > 0)
);

-- Index for fast lookups
CREATE INDEX idx_ltd_purchases_user ON ltd_purchases(user_id);
CREATE INDEX idx_ltd_purchases_tier ON ltd_purchases(tier);
CREATE INDEX idx_ltd_purchases_date ON ltd_purchases(purchased_at);
CREATE INDEX idx_ltd_purchases_stripe ON ltd_purchases(stripe_payment_intent_id);

-- LTD inventory tracking (for caps)
CREATE TABLE IF NOT EXISTS ltd_inventory (
  tier ltd_tier PRIMARY KEY,
  total_licenses INTEGER NOT NULL,
  sold_count INTEGER NOT NULL DEFAULT 0,
  reserved_count INTEGER NOT NULL DEFAULT 0, -- For in-progress checkouts
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_counts CHECK (sold_count >= 0 AND reserved_count >= 0),
  CONSTRAINT valid_total CHECK (total_licenses > 0),
  CONSTRAINT not_oversold CHECK (sold_count + reserved_count <= total_licenses)
);

-- Initialize inventory with caps
INSERT INTO ltd_inventory (tier, total_licenses, sold_count, is_active) VALUES
  ('ltd_starter', 500, 0, true),
  ('ltd_pro', 350, 0, true),
  ('ltd_agency', 150, 0, true)
ON CONFLICT (tier) DO NOTHING;

-- Checkout reservations (temporary holds during payment)
CREATE TABLE IF NOT EXISTS ltd_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier ltd_tier NOT NULL,
  stripe_checkout_session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  converted_to_purchase BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_ltd_reservations_session ON ltd_reservations(stripe_checkout_session_id);
CREATE INDEX idx_ltd_reservations_expires ON ltd_reservations(expires_at) WHERE NOT converted_to_purchase;

-- Function to get remaining licenses for a tier
CREATE OR REPLACE FUNCTION get_ltd_remaining(p_tier ltd_tier)
RETURNS INTEGER AS $$
DECLARE
  remaining INTEGER;
BEGIN
  SELECT total_licenses - sold_count - reserved_count
  INTO remaining
  FROM ltd_inventory
  WHERE tier = p_tier AND is_active = true;

  RETURN COALESCE(remaining, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get all LTD availability
CREATE OR REPLACE FUNCTION get_ltd_availability()
RETURNS TABLE (
  tier ltd_tier,
  total_licenses INTEGER,
  sold_count INTEGER,
  reserved_count INTEGER,
  remaining INTEGER,
  is_active BOOLEAN,
  percentage_sold NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.tier,
    i.total_licenses,
    i.sold_count,
    i.reserved_count,
    (i.total_licenses - i.sold_count - i.reserved_count) AS remaining,
    i.is_active,
    ROUND((i.sold_count::NUMERIC / i.total_licenses::NUMERIC) * 100, 1) AS percentage_sold
  FROM ltd_inventory i
  ORDER BY
    CASE i.tier
      WHEN 'ltd_starter' THEN 1
      WHEN 'ltd_pro' THEN 2
      WHEN 'ltd_agency' THEN 3
    END;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to reserve a license (called when starting checkout)
CREATE OR REPLACE FUNCTION reserve_ltd_license(
  p_tier ltd_tier,
  p_checkout_session_id TEXT,
  p_email TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  remaining INTEGER;
BEGIN
  -- Check availability and reserve atomically
  UPDATE ltd_inventory
  SET
    reserved_count = reserved_count + 1,
    updated_at = NOW()
  WHERE tier = p_tier
    AND is_active = true
    AND (total_licenses - sold_count - reserved_count) > 0;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Create reservation record
  INSERT INTO ltd_reservations (tier, stripe_checkout_session_id, user_id, email)
  VALUES (p_tier, p_checkout_session_id, p_user_id, p_email);

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to convert reservation to purchase (called on successful payment)
CREATE OR REPLACE FUNCTION complete_ltd_purchase(
  p_checkout_session_id TEXT,
  p_user_id UUID,
  p_payment_intent_id TEXT,
  p_price_cents INTEGER,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referral_source TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_reservation ltd_reservations%ROWTYPE;
  v_purchase_id UUID;
BEGIN
  -- Get and lock the reservation
  SELECT * INTO v_reservation
  FROM ltd_reservations
  WHERE stripe_checkout_session_id = p_checkout_session_id
    AND NOT converted_to_purchase
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found or already converted: %', p_checkout_session_id;
  END IF;

  -- Create purchase record
  INSERT INTO ltd_purchases (
    user_id, tier, price_cents, stripe_payment_intent_id,
    stripe_checkout_session_id, email, ip_address, user_agent, referral_source
  )
  VALUES (
    p_user_id, v_reservation.tier, p_price_cents, p_payment_intent_id,
    p_checkout_session_id, v_reservation.email, p_ip_address, p_user_agent, p_referral_source
  )
  RETURNING id INTO v_purchase_id;

  -- Update inventory: move from reserved to sold
  UPDATE ltd_inventory
  SET
    sold_count = sold_count + 1,
    reserved_count = reserved_count - 1,
    updated_at = NOW()
  WHERE tier = v_reservation.tier;

  -- Mark reservation as converted
  UPDATE ltd_reservations
  SET converted_to_purchase = true
  WHERE id = v_reservation.id;

  -- Auto-disable tier if sold out
  UPDATE ltd_inventory
  SET is_active = false, updated_at = NOW()
  WHERE tier = v_reservation.tier
    AND sold_count >= total_licenses;

  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql;

-- Function to release expired reservations (run periodically)
CREATE OR REPLACE FUNCTION release_expired_ltd_reservations()
RETURNS INTEGER AS $$
DECLARE
  released_count INTEGER := 0;
  v_reservation RECORD;
BEGIN
  FOR v_reservation IN
    SELECT tier, id
    FROM ltd_reservations
    WHERE expires_at < NOW()
      AND NOT converted_to_purchase
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Release the reservation
    UPDATE ltd_inventory
    SET
      reserved_count = reserved_count - 1,
      updated_at = NOW()
    WHERE tier = v_reservation.tier;

    -- Delete the reservation record
    DELETE FROM ltd_reservations WHERE id = v_reservation.id;

    released_count := released_count + 1;
  END LOOP;

  RETURN released_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has LTD
CREATE OR REPLACE FUNCTION user_has_ltd(p_user_id UUID)
RETURNS TABLE (
  has_ltd BOOLEAN,
  tier ltd_tier,
  purchased_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    true AS has_ltd,
    lp.tier,
    lp.purchased_at
  FROM ltd_purchases lp
  WHERE lp.user_id = p_user_id
    AND lp.refunded_at IS NULL
  ORDER BY lp.purchased_at DESC
  LIMIT 1;

  -- Return false if no LTD found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::ltd_tier, NULL::TIMESTAMPTZ;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policies
ALTER TABLE ltd_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ltd_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ltd_reservations ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own LTD purchases"
  ON ltd_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view inventory (for availability display)
CREATE POLICY "Anyone can view LTD inventory"
  ON ltd_inventory FOR SELECT
  USING (true);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access to purchases"
  ON ltd_purchases FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to inventory"
  ON ltd_inventory FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to reservations"
  ON ltd_reservations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_ltd_remaining(ltd_tier) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_ltd_availability() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_has_ltd(UUID) TO authenticated;

-- Schedule cleanup of expired reservations (run every 5 minutes)
-- Note: This requires pg_cron extension to be enabled in Supabase
-- Enable via: Dashboard > Database > Extensions > pg_cron
--
-- To set up manually after enabling pg_cron:
-- SELECT cron.schedule(
--   'cleanup-ltd-reservations',
--   '*/5 * * * *',
--   $$SELECT release_expired_ltd_reservations()$$
-- );
--
-- To view scheduled jobs: SELECT * FROM cron.job;
-- To remove: SELECT cron.unschedule('cleanup-ltd-reservations');
