-- Remove the problematic trigger temporarily
-- Run this in Supabase SQL Editor

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Verify trigger is removed
SELECT 
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
