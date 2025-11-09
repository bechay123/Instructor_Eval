-- Reset password for users who can't log in
-- Run this in Supabase SQL Editor if confirming email doesn't work

-- This will allow you to set a new known password via the Supabase Dashboard
-- 1. Run this script first to confirm emails
-- 2. Then go to Supabase Dashboard → Authentication → Users
-- 3. Click on the user → "Send Password Recovery"
-- 4. Or click "Reset Password" to set a new password directly

-- Confirm emails first
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email IN ('crishaplays101@gmail.com', 'rantebernardo@gmail.com');

-- Check if users are banned or have issues
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    banned_until,
    deleted_at,
    last_sign_in_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Email not confirmed'
        WHEN banned_until IS NOT NULL AND banned_until > NOW() THEN '❌ User is banned'
        WHEN deleted_at IS NOT NULL THEN '❌ User is deleted'
        ELSE '✅ User should be able to login'
    END as status
FROM auth.users
WHERE email IN ('crishaplays101@gmail.com', 'rantebernardo@gmail.com');
