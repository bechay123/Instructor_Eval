-- Fix RLS policies for profiles table to allow users to read their own profile
-- Run this in Supabase SQL Editor

-- Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON profiles;

-- Create a simple policy that allows users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Also allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role (admin) full access
DROP POLICY IF EXISTS "Service role has full access" ON profiles;
CREATE POLICY "Service role has full access"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
