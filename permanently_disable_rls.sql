-- Permanently disable RLS on all tables
-- Run this in Supabase SQL Editor

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on student_details table
ALTER TABLE public.student_details DISABLE ROW LEVEL SECURITY;

-- Disable RLS on instructor_details table
ALTER TABLE public.instructor_details DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies completely
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.student_details;
DROP POLICY IF EXISTS "Users can read own student details" ON public.student_details;
DROP POLICY IF EXISTS "Users can update own student details" ON public.student_details;
DROP POLICY IF EXISTS "Admins can view all student details" ON public.student_details;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.instructor_details;
DROP POLICY IF EXISTS "Users can read own instructor details" ON public.instructor_details;
DROP POLICY IF EXISTS "Users can update own instructor details" ON public.instructor_details;
DROP POLICY IF EXISTS "Admins can view all instructor details" ON public.instructor_details;

-- Grant full access to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.student_details TO authenticated;
GRANT ALL ON public.instructor_details TO authenticated;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'student_details', 'instructor_details');
