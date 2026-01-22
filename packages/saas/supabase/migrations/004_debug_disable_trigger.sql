-- Temporarily disable the trigger to test if signup works
-- This will help identify if the trigger is the problem

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Note: Users will need subscriptions created manually or via a different mechanism
-- Re-enable by running: CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
