-- Create a database function to handle profile creation
-- This function runs with SECURITY DEFINER which bypasses RLS
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_profile(
    user_id UUID,
    user_email TEXT,
    user_role TEXT,
    first_name TEXT,
    last_name TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with the privileges of the function owner
AS $$
DECLARE
    result json;
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, role, first_name, last_name, email, is_active, status)
    VALUES (user_id, user_role, first_name, last_name, user_email, true, 'approved')
    RETURNING row_to_json(profiles.*) INTO result;
    
    -- Insert role-specific details
    IF user_role = 'student' THEN
        INSERT INTO public.student_details (id, student_number, program, year_level)
        VALUES (
            user_id,
            EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0'),
            'Not Set',
            1
        );
    ELSIF user_role = 'instructor' THEN
        INSERT INTO public.instructor_details (id, department, academic_rank)
        VALUES (user_id, 'Not Set', 'Instructor I');
    END IF;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile TO anon;

-- Test the function (replace with actual values)
/*
SELECT public.create_profile(
    '54ead94b-db4a-4ddd-8949-18bba890e577'::uuid,
    'test@example.com',
    'student',
    'Test',
    'User'
);
*/
