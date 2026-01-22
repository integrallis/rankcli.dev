-- Fix RLS policy for user_subscriptions to allow service role operations
-- This is needed for the handle_new_user() trigger to insert subscriptions on signup

-- Allow service role to manage user_subscriptions (for triggers and webhooks)
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Also add INSERT policy for completeness (used by stripe webhook)
CREATE POLICY "Service role can insert subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow users to update their own subscription (for webhook updates via service key)
CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (user_id = auth.uid());
