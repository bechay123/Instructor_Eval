-- ============================================================================
-- ADD NEW ACTIVITY TRACKING FEATURES
-- This script adds tracking for:
-- - Profile updates
-- - AI analysis requests
-- - Enrollment activities (student vs instructor)
-- - Evaluation submissions
-- - Course activities
-- Run this AFTER running 08b and 08c
-- ============================================================================

-- ============================================================================
-- 1. PROFILE UPDATE TRACKING
-- ============================================================================

-- Log profile updates (when users edit their profile)
CREATE OR REPLACE FUNCTION log_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if actual data changed (not just timestamp updates)
  IF (OLD.first_name != NEW.first_name OR 
      OLD.last_name != NEW.last_name OR 
      OLD.email != NEW.email) THEN
    
    INSERT INTO activity_logs (
      user_id, user_email, user_role,
      activity_type, activity_description, metadata,
      performed_by_id, performed_by_email, performed_by_role
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.role,
      'profile_updated',
      'User updated their profile',
      jsonb_build_object(
        'user_id', NEW.id,
        'changes', jsonb_build_object(
          'first_name_changed', OLD.first_name != NEW.first_name,
          'last_name_changed', OLD.last_name != NEW.last_name,
          'email_changed', OLD.email != NEW.email
        )
      ),
      NEW.id,
      NEW.email,
      NEW.role
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles table for updates
DROP TRIGGER IF EXISTS trigger_log_profile_update ON profiles;
CREATE TRIGGER trigger_log_profile_update
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION log_profile_update();

-- ============================================================================
-- 2. AI ANALYSIS REQUEST TRACKING
-- ============================================================================

-- Create table to track AI analysis requests
CREATE TABLE IF NOT EXISTS ai_analysis_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    analysis_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Log AI analysis activity
CREATE OR REPLACE FUNCTION log_ai_analysis_request()
RETURNS TRIGGER AS $$
DECLARE
  instructor_email TEXT;
  instructor_role TEXT;
  course_name TEXT;
BEGIN
  -- Get instructor info
  SELECT email, role INTO instructor_email, instructor_role
  FROM profiles
  WHERE id = NEW.instructor_id;
  
  -- Get course name
  SELECT name INTO course_name
  FROM courses
  WHERE id = NEW.course_id;

  INSERT INTO activity_logs (
    user_id, user_email, user_role,
    activity_type, activity_description, metadata,
    performed_by_id, performed_by_email, performed_by_role
  )
  VALUES (
    NEW.instructor_id,
    instructor_email,
    instructor_role,
    'ai_analysis_requested',
    'Instructor requested AI analysis for course: ' || COALESCE(course_name, 'Unknown'),
    jsonb_build_object(
      'request_id', NEW.id,
      'course_id', NEW.course_id,
      'instructor_id', NEW.instructor_id,
      'analysis_type', NEW.analysis_type,
      'course_name', course_name
    ),
    NEW.instructor_id,
    instructor_email,
    instructor_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on ai_analysis_requests table
DROP TRIGGER IF EXISTS trigger_log_ai_analysis_request ON ai_analysis_requests;
CREATE TRIGGER trigger_log_ai_analysis_request
AFTER INSERT ON ai_analysis_requests
FOR EACH ROW
EXECUTE FUNCTION log_ai_analysis_request();

-- ============================================================================
-- 3. ENROLLMENT ACTIVITY TRACKING (Student vs Instructor)
-- ============================================================================

-- Log enrollment activities (detects self-enroll vs instructor-added)
CREATE OR REPLACE FUNCTION log_enrollment_activity()
RETURNS TRIGGER AS $$
DECLARE
  student_email TEXT;
  student_role TEXT;
  course_name TEXT;
  performer_email TEXT;
  performer_role TEXT;
  activity_desc TEXT;
BEGIN
  -- Get student info
  SELECT email, role INTO student_email, student_role
  FROM profiles
  WHERE id = NEW.student_id;
  
  -- Get course name
  SELECT name INTO course_name
  FROM courses
  WHERE id = NEW.course_id;

  -- Check if enrollment was done by instructor or student themselves
  IF auth.uid() = NEW.student_id THEN
    -- Student enrolled themselves
    activity_desc := 'Student enrolled in course: ' || course_name;
    performer_email := student_email;
    performer_role := student_role;
  ELSE
    -- Instructor added the student
    SELECT email, role INTO performer_email, performer_role
    FROM profiles
    WHERE id = auth.uid();
    
    activity_desc := 'Instructor added student to course: ' || course_name;
  END IF;

  INSERT INTO activity_logs (
    user_id, user_email, user_role,
    activity_type, activity_description, metadata,
    performed_by_id, performed_by_email, performed_by_role
  )
  VALUES (
    NEW.student_id,
    student_email,
    student_role,
    CASE 
      WHEN auth.uid() = NEW.student_id THEN 'student_enrolled'
      ELSE 'instructor_added_student'
    END,
    activity_desc,
    jsonb_build_object(
      'enrollment_id', NEW.id,
      'course_id', NEW.course_id,
      'student_id', NEW.student_id,
      'course_name', course_name,
      'added_by_instructor', auth.uid() != NEW.student_id
    ),
    auth.uid(),
    performer_email,
    performer_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on enrollments table
DROP TRIGGER IF EXISTS trigger_log_enrollment_activity ON enrollments;
CREATE TRIGGER trigger_log_enrollment_activity
AFTER INSERT ON enrollments
FOR EACH ROW
EXECUTE FUNCTION log_enrollment_activity();

-- ============================================================================
-- 4. EVALUATION SUBMISSION TRACKING
-- ============================================================================

-- Log evaluation submissions
CREATE OR REPLACE FUNCTION log_evaluation_submission()
RETURNS TRIGGER AS $$
DECLARE
  student_email TEXT;
  student_role TEXT;
BEGIN
  -- Get student info
  SELECT email, role INTO student_email, student_role
  FROM profiles
  WHERE id = NEW.student_id;

  INSERT INTO activity_logs (
    user_id, user_email, user_role,
    activity_type, activity_description, metadata,
    performed_by_id, performed_by_email, performed_by_role
  )
  VALUES (
    NEW.student_id,
    student_email,
    student_role,
    'evaluation_submitted',
    'Student submitted an evaluation',
    jsonb_build_object(
      'evaluation_id', NEW.id,
      'course_id', NEW.course_id,
      'student_id', NEW.student_id
    ),
    NEW.student_id,
    student_email,
    student_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on evaluations table
DROP TRIGGER IF EXISTS trigger_log_evaluation_submission ON evaluations;
CREATE TRIGGER trigger_log_evaluation_submission
AFTER INSERT ON evaluations
FOR EACH ROW
EXECUTE FUNCTION log_evaluation_submission();

-- ============================================================================
-- 5. COURSE ACTIVITY TRACKING
-- ============================================================================

-- Log course creation/updates/deletes
CREATE OR REPLACE FUNCTION log_course_activity()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT;
  admin_role TEXT;
  activity_type_val TEXT;
  activity_desc TEXT;
BEGIN
  -- Get admin/instructor info who performed the action
  SELECT email, role INTO admin_email, admin_role
  FROM profiles
  WHERE id = auth.uid();

  IF TG_OP = 'INSERT' THEN
    activity_type_val := 'course_created';
    activity_desc := 'New course created: ' || NEW.name;
  ELSIF TG_OP = 'UPDATE' THEN
    activity_type_val := 'course_updated';
    activity_desc := 'Course updated: ' || NEW.name;
  ELSIF TG_OP = 'DELETE' THEN
    activity_type_val := 'course_deleted';
    activity_desc := 'Course deleted: ' || OLD.name;
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO activity_logs (
      activity_type, activity_description, metadata,
      performed_by_id, performed_by_email, performed_by_role
    )
    VALUES (
      activity_type_val,
      activity_desc,
      jsonb_build_object(
        'course_id', OLD.id,
        'course_code', OLD.code,
        'course_name', OLD.name
      ),
      auth.uid(),
      admin_email,
      admin_role
    );
    RETURN OLD;
  ELSE
    INSERT INTO activity_logs (
      activity_type, activity_description, metadata,
      performed_by_id, performed_by_email, performed_by_role
    )
    VALUES (
      activity_type_val,
      activity_desc,
      jsonb_build_object(
        'course_id', NEW.id,
        'course_code', NEW.code,
        'course_name', NEW.name,
        'instructor_id', NEW.instructor_id
      ),
      auth.uid(),
      admin_email,
      admin_role
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on courses table
DROP TRIGGER IF EXISTS trigger_log_course_activity ON courses;
CREATE TRIGGER trigger_log_course_activity
AFTER INSERT OR UPDATE OR DELETE ON courses
FOR EACH ROW
EXECUTE FUNCTION log_course_activity();

-- ============================================================================
-- COMPLETION - All triggers and functions created successfully!
-- ============================================================================
