-- Script to manually create a test instructor user
-- Run this in Supabase SQL Editor if the user doesn't exist

-- Step 1: Create user in Supabase Auth (replace with your desired credentials)
-- NOTE: You need to do this through the Supabase Dashboard UI:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create New User"
-- 3. Email: crishaplays101@gmail.com
-- 4. Password: YourPassword123! (choose a strong password)
-- 5. Auto-confirm email: YES (check this box)
-- 6. Copy the generated user ID

-- Step 2: After creating the user in the dashboard, run this SQL:
-- Replace 'USER_ID_HERE' with the actual UUID from the created user

-- Insert profile for the new user
INSERT INTO profiles (
    id,
    email,
    role,
    first_name,
    last_name,
    status,
    is_active,
    created_at,
    updated_at
) VALUES (
    'USER_ID_HERE'::uuid,  -- Replace with actual user ID from auth.users
    'crishaplays101@gmail.com',
    'instructor',
    'Crisha',
    'Plays',
    'approved',  -- Set to 'approved' to allow immediate login
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Alternative: If you want to create another instructor with different email
-- INSERT INTO profiles (
--     id,
--     email,
--     role,
--     first_name,
--     last_name,
--     status,
--     is_active,
--     created_at,
--     updated_at
-- ) VALUES (
--     'ANOTHER_USER_ID_HERE'::uuid,
--     'rantebernardo@gmail.com',
--     'instructor',
--     'Rante',
--     'Bernardo',
--     'approved',
--     true,
--     NOW(),
--     NOW()
-- );
