-- Test Profile Insert Script
-- Run this in Supabase SQL Editor to verify table accessibility

-- 1. Check if RLS is actually disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'student_details', 'instructor_details');
-- rowsecurity should be FALSE for all

-- 2. Check existing profiles
SELECT id, email, first_name, last_name, role, status, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check auth users (to see if users are being created)
SELECT id, email, email_confirmed_at, created_at, 
       raw_user_meta_data->>'first_name' as metadata_first_name,
       raw_user_meta_data->>'last_name' as metadata_last_name,
       raw_user_meta_data->>'role' as metadata_role
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Find orphaned auth users (users without profiles)
SELECT 
    u.id, 
    u.email, 
    u.email_confirmed_at,
    u.created_at as auth_created,
    u.raw_user_meta_data->>'first_name' as first_name,
    u.raw_user_meta_data->>'last_name' as last_name,
    u.raw_user_meta_data->>'role' as role,
    p.id as has_profile
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 5. Test manual insert (replace with actual UUID from auth.users)
-- First get a user ID without a profile from query #4 above
-- Then uncomment and run:

/*
INSERT INTO public.profiles (id, role, first_name, last_name, email, is_active, status)
VALUES (
    '54ead94b-db4a-4ddd-8949-18bba890e577', -- Replace with actual user ID
    'student', -- or 'instructor'
    'Dexter',
    'Pimental',
    'xdfeverharsh@gmail.com',
    true,
    'approved'
);
*/

-- 6. Check for any triggers that might be interfering
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'profiles';

-- 7. Check table permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'profiles';
