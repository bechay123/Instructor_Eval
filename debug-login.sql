-- Debug script to check user authentication status
-- Run this in Supabase SQL Editor

-- Check the exact user data
SELECT 
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    deleted_at,
    banned_until,
    aud,
    role as auth_role
FROM auth.users
WHERE email IN ('crishaplays101@gmail.com', 'rantebernardo@gmail.com')
ORDER BY email;

-- Check profile status
SELECT 
    id,
    email,
    role,
    first_name,
    last_name,
    status,
    is_active,
    created_at,
    updated_at
FROM profiles
WHERE email IN ('crishaplays101@gmail.com', 'rantebernardo@gmail.com')
ORDER BY email;
