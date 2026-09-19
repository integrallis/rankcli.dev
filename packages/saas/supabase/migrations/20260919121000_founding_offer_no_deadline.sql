-- The founding offer is limited to the first 100 customers only - no 90-day clock (approved
-- pricing, docs/PRICING_ANALYSIS_2026-09.md). create-checkout refuses it once
-- get_launch_offer_availability reports it sold out.
UPDATE launch_offers SET ends_at = NULL WHERE key = 'pro_founding';
