-- Quick Test Data Setup
-- Replace the UUIDs with actual values from your auth.users table

-- Step 1: Check your user IDs
-- SELECT id, email, raw_user_meta_data FROM auth.users;

-- Step 2: Update these variables with your actual user IDs
DO $$
DECLARE
    instructor_id UUID := 'd7772217-6849-49bd-8817-c2e86fd34ef4'; -- Bernie Cherry Rante (instructor)
    student_id UUID := 'YOUR_STUDENT_ID_HERE'; -- Replace with actual student ID
    term_id UUID;
    course1_id UUID;
    course2_id UUID;
BEGIN
    -- Create academic term if not exists
    INSERT INTO academic_terms (academic_year, semester, start_date, end_date, is_active)
    VALUES (2025, 'First Semester', '2025-09-01', '2026-01-31', true)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO term_id FROM academic_terms WHERE academic_year = 2025 AND semester = 'First Semester';

    -- Ensure instructor details exist
    INSERT INTO instructor_details (id, department, office_location, academic_rank)
    VALUES (instructor_id, 'Computer Science', 'Room 301, CS Building', 'Associate Professor')
    ON CONFLICT (id) DO UPDATE SET
        department = 'Computer Science',
        office_location = 'Room 301, CS Building',
        academic_rank = 'Associate Professor';

    -- Create courses
    INSERT INTO courses (code, name, instructor_id, academic_term_id, description, units, schedule_days, schedule_time_start, schedule_time_end, room, max_students, is_active)
    VALUES 
        ('CS101', 'Introduction to Programming', instructor_id, term_id, 'Learn programming fundamentals', 3, ARRAY['Monday', 'Wednesday'], '09:00', '10:30', 'CS-201', 40, true),
        ('CS201', 'Data Structures', instructor_id, term_id, 'Advanced data structures', 3, ARRAY['Tuesday', 'Thursday'], '13:00', '14:30', 'CS-202', 35, true),
        ('CS301', 'Algorithms', instructor_id, term_id, 'Algorithm design and analysis', 3, ARRAY['Friday'], '10:00', '12:00', 'CS-203', 30, true)
    ON CONFLICT (code, academic_term_id) DO NOTHING;

    SELECT id INTO course1_id FROM courses WHERE code = 'CS101' AND academic_term_id = term_id;
    SELECT id INTO course2_id FROM courses WHERE code = 'CS201' AND academic_term_id = term_id;

    RAISE NOTICE '✓ Academic term created: %', term_id;
    RAISE NOTICE '✓ Instructor details updated';
    RAISE NOTICE '✓ Courses created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create a student user in Supabase Auth (if not exists)';
    RAISE NOTICE '2. Get the student user ID from auth.users';
    RAISE NOTICE '3. Run the enrollment script with the student ID';
    RAISE NOTICE '';
    RAISE NOTICE 'Instructor can now see courses in the dashboard!';
END $$;
