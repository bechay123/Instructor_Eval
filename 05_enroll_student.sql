-- Helper: Enroll Student in All Active Courses
-- Replace STUDENT_ID with actual student user ID from auth.users

DO $$
DECLARE
    student_id UUID := 'YOUR_STUDENT_ID_HERE'; -- REPLACE THIS!
    term_id UUID;
    enrollment_count INTEGER := 0;
BEGIN
    -- Get active term
    SELECT id INTO term_id FROM academic_terms WHERE is_active = true LIMIT 1;
    
    IF term_id IS NULL THEN
        RAISE EXCEPTION 'No active academic term found';
    END IF;

    -- Enroll student in all active courses
    INSERT INTO enrollments (student_id, course_id, academic_term_id, status)
    SELECT 
        student_id,
        c.id,
        c.academic_term_id,
        'enrolled'
    FROM courses c
    WHERE c.is_active = true 
    AND c.academic_term_id = term_id
    AND NOT EXISTS (
        SELECT 1 FROM enrollments e 
        WHERE e.student_id = student_id 
        AND e.course_id = c.id
    );

    GET DIAGNOSTICS enrollment_count = ROW_COUNT;

    RAISE NOTICE '✓ Enrolled student in % courses', enrollment_count;
    
    -- Show enrolled courses
    RAISE NOTICE '';
    RAISE NOTICE 'Enrolled courses:';
    FOR r IN (
        SELECT c.code, c.name, p.first_name || ' ' || p.last_name as instructor
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN profiles p ON c.instructor_id = p.id
        WHERE e.student_id = student_id
    ) LOOP
        RAISE NOTICE '  - % %  (Instructor: %)', r.code, r.name, r.instructor;
    END LOOP;
END $$;
