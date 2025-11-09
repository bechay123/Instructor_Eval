-- Populate Test Data for Instructor Evaluation System
-- Run this in Supabase SQL Editor after creating tables

-- 1. Create academic term
INSERT INTO academic_terms (academic_year, semester, start_date, end_date, is_active)
VALUES (2025, 'First Semester', '2025-09-01', '2026-01-31', true)
ON CONFLICT DO NOTHING;

-- Get the term ID (you'll need this)
DO $$
DECLARE
    term_id UUID;
    instructor1_id UUID := 'd7772217-6849-49bd-8817-c2e86fd34ef4'::UUID; -- Your instructor ID
    student1_id UUID; -- We'll create a student
    course1_id UUID;
    course2_id UUID;
BEGIN
    -- Get the active term
    SELECT id INTO term_id FROM academic_terms WHERE is_active = true LIMIT 1;

    -- Create a test student (you'll need to create this user in Supabase Auth first)
    -- For now, let's assume you have a student user ID
    -- Replace this with actual student user ID from auth.users
    student1_id := 'YOUR_STUDENT_USER_ID'::UUID; -- CHANGE THIS!

    -- Insert instructor details (if not exists)
    INSERT INTO instructor_details (id, department, office_location, academic_rank)
    VALUES (
        instructor1_id,
        'Computer Science',
        'Room 301, CS Building',
        'Associate Professor'
    )
    ON CONFLICT (id) DO UPDATE SET
        department = EXCLUDED.department,
        office_location = EXCLUDED.office_location,
        academic_rank = EXCLUDED.academic_rank;

    -- Create courses
    INSERT INTO courses (code, name, instructor_id, academic_term_id, description, units, schedule_days, schedule_time_start, schedule_time_end, room, max_students)
    VALUES 
        ('CS101', 'Introduction to Programming', instructor1_id, term_id, 'Learn the fundamentals of programming', 3, ARRAY['Monday', 'Wednesday'], '09:00', '10:30', 'CS-201', 40),
        ('CS201', 'Data Structures and Algorithms', instructor1_id, term_id, 'Advanced programming concepts', 3, ARRAY['Tuesday', 'Thursday'], '13:00', '14:30', 'CS-202', 35)
    ON CONFLICT (code, academic_term_id) DO NOTHING
    RETURNING id INTO course1_id;

    -- Get course IDs
    SELECT id INTO course1_id FROM courses WHERE code = 'CS101' AND academic_term_id = term_id;
    SELECT id INTO course2_id FROM courses WHERE code = 'CS201' AND academic_term_id = term_id;

    -- Enroll students (only if student exists)
    IF student1_id IS NOT NULL THEN
        INSERT INTO enrollments (student_id, course_id, academic_term_id, status)
        VALUES 
            (student1_id, course1_id, term_id, 'enrolled'),
            (student1_id, course2_id, term_id, 'enrolled')
        ON CONFLICT (student_id, course_id, academic_term_id) DO NOTHING;

        -- Create sample evaluations (for CS101 only, leave CS201 for testing)
        INSERT INTO evaluations (student_id, course_id, academic_term_id, is_anonymous, status, submitted_at)
        VALUES (student1_id, course1_id, term_id, false, 'submitted', NOW())
        ON CONFLICT (student_id, course_id, academic_term_id) DO NOTHING;

        -- Get evaluation ID
        DECLARE eval_id UUID;
        SELECT id INTO eval_id FROM evaluations WHERE student_id = student1_id AND course_id = course1_id;

        -- Insert sample ratings
        INSERT INTO evaluation_ratings (
            evaluation_id,
            teaching_clarity, teaching_engagement, teaching_knowledge, teaching_organization, teaching_feedback,
            materials_quality, materials_relevance, materials_accessibility, materials_variety, materials_timeliness,
            communication_availability, communication_responsiveness, communication_clarity, communication_helpfulness, communication_approachability
        )
        VALUES (
            eval_id,
            5, 4, 5, 4, 4,  -- Teaching: avg 4.4
            4, 5, 4, 4, 4,  -- Materials: avg 4.2
            5, 5, 4, 5, 5   -- Communication: avg 4.8
        )
        ON CONFLICT DO NOTHING;

        -- Insert sample comments
        INSERT INTO evaluation_comments (
            evaluation_id,
            teaching_comments,
            materials_comments,
            communication_comments,
            general_comments
        )
        VALUES (
            eval_id,
            'The instructor explains concepts very clearly and uses great examples. Very engaging lectures!',
            'Course materials are well-organized and easy to access. The textbook recommendations were helpful.',
            'Always responds to emails quickly and is very approachable during office hours.',
            'Excellent instructor overall. Would highly recommend this course to other students.'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Test data created successfully!';
    RAISE NOTICE 'Course 1 ID: %', course1_id;
    RAISE NOTICE 'Course 2 ID: %', course2_id;
END $$;

-- View summary
SELECT 
    'Courses Created' as item,
    COUNT(*) as count
FROM courses
UNION ALL
SELECT 
    'Enrollments' as item,
    COUNT(*) as count
FROM enrollments
UNION ALL
SELECT 
    'Evaluations Submitted' as item,
    COUNT(*) as count
FROM evaluations
WHERE status = 'submitted';
