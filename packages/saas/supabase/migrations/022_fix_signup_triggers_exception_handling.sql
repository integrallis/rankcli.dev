-- Fix signup triggers to not block signup on failure
-- Root cause: Migration 005 removed exception handling that was in 003
-- Both triggers (user_subscriptions and notification_preferences) need graceful failure

-- ========================================
-- Fix handle_new_user() for user_subscriptions
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a free tier subscription for the new user
  -- Use ON CONFLICT to handle duplicate signups gracefully
  INSERT INTO user_subscriptions (user_id, status)
  VALUES (NEW.id, 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block signup
    RAISE WARNING 'Failed to create subscription for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- Fix create_default_notification_preferences()
-- ========================================
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block signup
    RAISE WARNING 'Failed to create notification preferences for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created_notifications ON auth.users;
CREATE TRIGGER on_auth_user_created_notifications
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Success notice
DO $$ BEGIN RAISE NOTICE 'Signup triggers fixed with exception handling'; END $$;
