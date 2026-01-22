-- Fix the handle_new_user trigger to not block signup on failure
-- The trigger should gracefully handle errors

-- Drop and recreate the function with proper exception handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a free tier subscription for the new user
  INSERT INTO user_subscriptions (user_id, status)
  VALUES (NEW.id, 'active');

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block signup
    RAISE WARNING 'Failed to create subscription for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Also ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
