-- Founding Member launch pricing
--
-- A discounted, capped-seat recurring Pro tier used to drive initial MRR
-- momentum at launch. Unlike the lifetime_deals system (one-time revenue,
-- ltd_* tables), this is a real recurring subscription plan — it goes
-- through the exact same create-checkout / stripe-webhook / user_subscriptions
-- flow as solo/pro/agency, just keyed to a different subscription_plans row
-- and a different Stripe Price ID. No new checkout or webhook code needed.
--
-- Soft cap by design: seat counting below is a read (COUNT), not an atomic
-- reservation like ltd_inventory. A handful of customers squeezing past 100
-- during concurrent signups is an acceptable outcome for a marketing cap on
-- a recurring plan — unlike LTD licenses, this isn't a fixed, non-renewable
-- inventory that can be oversold in a way that costs real unit economics.

CREATE TABLE IF NOT EXISTS launch_offers (
  key TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(plan_id),
  total_seats INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_total_seats CHECK (total_seats > 0)
);

-- Founding Member Pro: 100 seats, discounted, locked in for as long as the
-- customer stays subscribed. Bounded by BOTH the seat cap and a 90-day
-- window (whichever comes first) — an open-ended discount trains users to
-- expect permanent discounting, and a bounded 3-month founding window is
-- the norm for successful SaaS launches (see automation-setup.md for
-- sourcing). See LAUNCH_CHECKLIST.md for the Stripe Price that must exist
-- before this offer can actually be sold.
INSERT INTO subscription_plans (
  plan_id, name, description, price_cents, billing_period,
  sites_limit, team_members_limit, audits_per_month, api_requests_per_day,
  keywords_limit, historical_days, features
)
SELECT
  'pro_founding',
  'Pro Founding Member',
  'Founding-member pricing on the Pro plan — locked in for as long as you stay subscribed. Limited to the first 100 customers.',
  1900, -- $19/mo vs $29/mo list price (34% off)
  'month',
  sites_limit, team_members_limit, audits_per_month, api_requests_per_day,
  keywords_limit, historical_days, features
FROM subscription_plans
WHERE plan_id = 'pro'
ON CONFLICT (plan_id) DO NOTHING;

INSERT INTO launch_offers (key, plan_id, total_seats, ends_at)
VALUES ('pro_founding', 'pro_founding', 100, NOW() + INTERVAL '90 days')
ON CONFLICT (key) DO NOTHING;

-- Remaining seats for a launch offer: total minus active/trialing
-- subscriptions currently on that offer's plan.
CREATE OR REPLACE FUNCTION get_launch_offer_availability(p_key TEXT)
RETURNS TABLE (
  key TEXT,
  total_seats INTEGER,
  claimed_seats INTEGER,
  remaining INTEGER,
  is_active BOOLEAN,
  percentage_claimed NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.key,
    o.total_seats,
    COUNT(us.id)::INTEGER AS claimed_seats,
    GREATEST(o.total_seats - COUNT(us.id)::INTEGER, 0) AS remaining,
    (o.active AND (o.ends_at IS NULL OR o.ends_at > NOW())) AS is_active,
    ROUND((COUNT(us.id)::NUMERIC / o.total_seats::NUMERIC) * 100, 1) AS percentage_claimed
  FROM launch_offers o
  JOIN subscription_plans sp ON sp.plan_id = o.plan_id
  LEFT JOIN user_subscriptions us
    ON us.plan_id = sp.id
    AND us.status IN ('trialing', 'active')
  WHERE o.key = p_key
  GROUP BY o.key, o.total_seats, o.active, o.ends_at;
END;
$$ LANGUAGE plpgsql STABLE;

ALTER TABLE launch_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view launch offers"
  ON launch_offers FOR SELECT
  USING (true);

CREATE POLICY "Service role full access to launch offers"
  ON launch_offers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

GRANT EXECUTE ON FUNCTION get_launch_offer_availability(TEXT) TO authenticated, anon;
