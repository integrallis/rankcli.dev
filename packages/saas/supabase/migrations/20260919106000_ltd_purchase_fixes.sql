-- Lifetime deals: make a paid purchase stick, and give inventory back reliably.
--
-- Entitlement comes from ltd_purchases (see effective_entitlement() in 20260919105000),
-- not from user_subscriptions: the webhook used to write status 'lifetime' there, which
-- user_subscriptions' CHECK constraint rejects, so every LTD buyer stayed on free. Reading
-- ltd_purchases also means buyers whose purchase row was recorded before this fix get
-- their plan without a backfill.
--
-- The functions below are what stripe-webhook and ltd-checkout call. All are
-- service-role only; Supabase grants EXECUTE on new functions to anon and authenticated
-- by default, hence the explicit revokes.

-- A 100%-off promotion code (ltd-checkout allows them) completes with amount_total 0,
-- which this constraint rejected - the buyer paid nothing but was still owed the license.
ALTER TABLE ltd_purchases DROP CONSTRAINT IF EXISTS valid_price;
ALTER TABLE ltd_purchases ADD CONSTRAINT valid_price CHECK (price_cents >= 0);

-- complete_ltd_purchase gains p_tier and p_email, so it is dropped rather than replaced:
-- two overloads with the same leading parameter names are ambiguous to PostgREST.
DROP FUNCTION IF EXISTS complete_ltd_purchase(TEXT, UUID, TEXT, INTEGER, INET, TEXT, TEXT);

-- Idempotent (Stripe retries webhooks): a session already recorded returns its purchase.
-- If the reservation is gone - it expired and was released before the payment landed -
-- the customer has still paid, so the purchase is recorded from p_tier/p_email and takes
-- a license straight from inventory.
CREATE FUNCTION complete_ltd_purchase(
  p_checkout_session_id TEXT,
  p_user_id UUID,
  p_payment_intent_id TEXT,
  p_price_cents INTEGER,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referral_source TEXT DEFAULT NULL,
  p_tier ltd_tier DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reservation ltd_reservations%ROWTYPE;
  v_reserved BOOLEAN;
  v_purchase_id UUID;
  v_tier ltd_tier;
  v_email TEXT;
BEGIN
  SELECT id INTO v_purchase_id
  FROM ltd_purchases
  WHERE stripe_checkout_session_id = p_checkout_session_id;
  IF FOUND THEN
    RETURN v_purchase_id;
  END IF;

  SELECT * INTO v_reservation
  FROM ltd_reservations
  WHERE stripe_checkout_session_id = p_checkout_session_id
    AND NOT converted_to_purchase
  FOR UPDATE;
  v_reserved := FOUND;

  IF v_reserved THEN
    v_tier := v_reservation.tier;
    v_email := v_reservation.email;
  ELSIF p_tier IS NOT NULL AND p_email IS NOT NULL THEN
    v_tier := p_tier;
    v_email := p_email;
  ELSE
    RAISE EXCEPTION 'No reservation for checkout session % and no tier/email to record it with',
      p_checkout_session_id;
  END IF;

  INSERT INTO ltd_purchases (
    user_id, tier, price_cents, stripe_payment_intent_id,
    stripe_checkout_session_id, email, ip_address, user_agent, referral_source
  )
  VALUES (
    p_user_id, v_tier, p_price_cents, p_payment_intent_id,
    p_checkout_session_id, v_email, p_ip_address, p_user_agent, p_referral_source
  )
  RETURNING id INTO v_purchase_id;

  IF v_reserved THEN
    UPDATE ltd_inventory
    SET sold_count = sold_count + 1,
        reserved_count = reserved_count - 1,
        updated_at = NOW()
    WHERE tier = v_tier;

    UPDATE ltd_reservations
    SET converted_to_purchase = true
    WHERE id = v_reservation.id;
  ELSE
    -- The customer has paid, so the sale stands even if the lapsed reservation's license
    -- went to someone else meanwhile: the cap grows by one rather than not_oversold
    -- rejecting the purchase (and Stripe retrying it forever).
    UPDATE ltd_inventory
    SET sold_count = sold_count + 1,
        total_licenses = GREATEST(total_licenses, sold_count + reserved_count + 1),
        updated_at = NOW()
    WHERE tier = v_tier;
  END IF;

  -- Auto-disable the tier once sold out
  UPDATE ltd_inventory
  SET is_active = false, updated_at = NOW()
  WHERE tier = v_tier
    AND sold_count >= total_licenses;

  RETURN v_purchase_id;
END;
$$;

-- Releases one checkout's reservation (checkout.session.expired, or ltd-checkout replacing
-- a user's earlier open checkout). A no-op for a converted or already-released session.
-- A concurrent complete_ltd_purchase holds the row lock, so the two can't both win.
CREATE OR REPLACE FUNCTION release_ltd_reservation(p_checkout_session_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tier ltd_tier;
BEGIN
  DELETE FROM ltd_reservations
  WHERE stripe_checkout_session_id = p_checkout_session_id
    AND NOT converted_to_purchase
  RETURNING tier INTO v_tier;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE ltd_inventory
  SET reserved_count = reserved_count - 1,
      updated_at = NOW()
  WHERE tier = v_tier;

  RETURN true;
END;
$$;

-- Refund: revokes the license (effective_entitlement ignores refunded purchases) and puts
-- it back in inventory. Replaces the webhook's call to an exec_sql RPC that no migration
-- defines. Idempotent: a purchase already refunded returns NULL and changes nothing.
CREATE OR REPLACE FUNCTION refund_ltd_purchase(p_payment_intent_id TEXT, p_reason TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id UUID;
  v_tier ltd_tier;
BEGIN
  UPDATE ltd_purchases
  SET refunded_at = NOW(),
      refund_reason = COALESCE(p_reason, 'requested')
  WHERE stripe_payment_intent_id = p_payment_intent_id
    AND refunded_at IS NULL
  RETURNING id, tier INTO v_id, v_tier;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  UPDATE ltd_inventory
  SET sold_count = sold_count - 1,
      updated_at = NOW()
  WHERE tier = v_tier;

  RETURN v_id;
END;
$$;

-- supabase-js v2 has no auth.admin.getUserByEmail, which the webhook called for LTD
-- checkouts started before sign-in was required.
CREATE OR REPLACE FUNCTION find_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(p_email) ORDER BY created_at LIMIT 1;
$$;

REVOKE ALL ON FUNCTION complete_ltd_purchase(TEXT, UUID, TEXT, INTEGER, INET, TEXT, TEXT, ltd_tier, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION release_ltd_reservation(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION refund_ltd_purchase(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION find_user_id_by_email(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION complete_ltd_purchase(TEXT, UUID, TEXT, INTEGER, INET, TEXT, TEXT, ltd_tier, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION release_ltd_reservation(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION refund_ltd_purchase(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION find_user_id_by_email(TEXT) TO service_role;
