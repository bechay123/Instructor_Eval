-- Restore RLS policies for profiles, student_details, and instructor_details
-- Run this in Supabase SQL Editor

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own profile during registration
CREATE POLICY "Enable insert for authenticated users only"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- STUDENT_DETAILS TABLE
-- ============================================

-- Enable RLS on student_details
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own student details during registration
CREATE POLICY "Enable insert for authenticated users only"
ON public.student_details FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow students to view their own details
CREATE POLICY "Users can read own student details"
ON public.student_details FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow students to update their own details
CREATE POLICY "Users can update own student details"
ON public.student_details FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- INSTRUCTOR_DETAILS TABLE
-- ============================================

-- Enable RLS on instructor_details
ALTER TABLE public.instructor_details ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own instructor details during registration
CREATE POLICY "Enable insert for authenticated users only"
ON public.instructor_details FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow instructors to view their own details
CREATE POLICY "Users can read own instructor details"
ON public.instructor_details FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow instructors to update their own details
CREATE POLICY "Users can update own instructor details"
ON public.instructor_details FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.student_details TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.instructor_details TO authenticated;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'student_details', 'instructor_details');

-- Verify policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'student_details', 'instructor_details')
ORDER BY tablename, policyname;
