-- Fix RLS policies to allow admins to view all profiles
-- This fixes the issue where admins cannot see all users in the admin dashboard

-- First, let's check what policies exist
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

-- Drop existing restrictive policies and create comprehensive ones
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Admins can view ALL profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can update any profile
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 5: Admins can delete profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
ON profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 6: Allow service role full access (for backend operations)
CREATE POLICY "Service role has full access"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify the policies were created successfully
SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test query (should return all profiles if you're an admin)
-- SELECT * FROM profiles ORDER BY created_at DESC;
