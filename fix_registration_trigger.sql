-- Fix registration trigger to create student_details and instructor_details automatically
-- Run this in Supabase SQL Editor

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function with role-specific detail creation
-- SECURITY DEFINER allows this to bypass RLS policies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- This is critical - allows bypassing RLS
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_student_number TEXT;
BEGIN
    -- Extract user metadata with better error handling
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'User');
    v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name');
    
    -- Log for debugging (remove in production)
    RAISE NOTICE 'Creating profile for user % with role %', NEW.email, v_role;
    
    -- Insert into profiles table (bypasses RLS due to SECURITY DEFINER)
    INSERT INTO public.profiles (id, email, role, first_name, last_name, status, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        v_role,
        v_first_name,
        v_last_name,
        'pending',
        false
    )
    ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
    
    -- Create role-specific details based on role
    IF v_role = 'student' THEN
        -- Generate unique student number
        v_student_number := EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
        
        -- Create student details
        INSERT INTO public.student_details (id, student_number, program, year_level)
        VALUES (
            NEW.id,
            v_student_number,
            'Not Set',
            1
        )
        ON CONFLICT (id) DO NOTHING;
        
    ELSIF v_role = 'instructor' THEN
        -- Create instructor details
        INSERT INTO public.instructor_details (id, department, academic_rank)
        VALUES (
            NEW.id,
            'Not Set',
            'Instructor I'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Profile created successfully for user %', NEW.email;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger is active
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile and role-specific details (student_details or instructor_details) when a new user signs up';
