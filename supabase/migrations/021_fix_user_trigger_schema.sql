-- Fix trigger functions to properly reference public schema
-- This resolves "type user_role does not exist" error when creating auth users

-- Drop and recreate the handle_new_user function with proper schema path
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.users (id, email, email_verified)
    VALUES (NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't prevent user creation in auth.users
    RAISE WARNING 'Failed to create public.users record for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Fix the sync function as well
DROP FUNCTION IF EXISTS public.sync_user_email_verification() CASCADE;

CREATE OR REPLACE FUNCTION public.sync_user_email_verification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.users 
    SET email_verified = (NEW.email_confirmed_at IS NOT NULL),
        last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't prevent update
    RAISE WARNING 'Failed to sync user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the sync trigger
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.sync_user_email_verification();

-- Comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates public.users record when auth.users record is created. SET search_path ensures user_role enum is found.';
COMMENT ON FUNCTION public.sync_user_email_verification() IS 'Syncs email verification and last sign-in from auth.users to public.users';
