-- Run this in Supabase SQL Editor to check if user exists

-- Check if user exists in auth.users (Supabase Auth)
SELECT 
    id,
    email,
    created_at,
    confirmed_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'crishaplays101@gmail.com';

-- Check if profile exists in profiles table
SELECT 
    id,
    email,
    role,
    first_name,
    last_name,
    status,
    is_active,
    created_at
FROM profiles
WHERE email = 'crishaplays101@gmail.com';

-- Also check this other email
SELECT 
    id,
    email,
    created_at,
    confirmed_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'rantebernardo@gmail.com';

SELECT 
    id,
    email,
    role,
    first_name,
    last_name,
    status,
    is_active,
    created_at
FROM profiles
WHERE email = 'rantebernardo@gmail.com';
