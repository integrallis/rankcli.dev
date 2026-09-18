-- Users could UPDATE their own user_subscriptions row, every column included, so
-- `update({ plan_id: <agency uuid>, status: 'active' })` from the browser granted any
-- plan for free. Nothing writes this table as the user: the Stripe webhook and
-- create-checkout use the service role, which bypasses RLS, and the app only reads it.
DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;
