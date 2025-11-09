-- Fix for "Invalid login credentials" error
-- This confirms the email addresses so users can log in

-- Option 1: Confirm emails for specific users (RECOMMENDED)
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email IN ('crishaplays101@gmail.com', 'rantebernardo@gmail.com')
  AND email_confirmed_at IS NULL;

-- Option 2: If you want to confirm ALL unconfirmed users
-- UPDATE auth.users
-- SET 
--     email_confirmed_at = NOW(),
--     confirmed_at = NOW()
-- WHERE email_confirmed_at IS NULL;

-- Verify the update worked
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users
WHERE email IN ('crishaplays101@gmail.com', 'rantebernardo@gmail.com');
