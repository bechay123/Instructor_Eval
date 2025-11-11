-- ============================================================
-- FRESH DATABASE SETUP - NO RLS POLICIES
-- ============================================================
-- Run this in a fresh Supabase database
-- This creates all tables, functions, and views WITHOUT any RLS policies

-- ============================================================
-- 1. CREATE TABLES
-- ============================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student details
CREATE TABLE IF NOT EXISTS student_details (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    student_number TEXT UNIQUE,
    program TEXT,
    year_level INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instructor details
CREATE TABLE IF NOT EXISTS instructor_details (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    department TEXT,
    academic_rank TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic terms
CREATE TABLE IF NOT EXISTS academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_term TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    academic_term_id UUID REFERENCES academic_terms(id) ON DELETE CASCADE,
    max_students INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_code, academic_term_id)
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
    UNIQUE(student_id, course_id)
);

-- Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Teaching Effectiveness (1-5 scale)
    teaching_effectiveness INTEGER CHECK (teaching_effectiveness BETWEEN 1 AND 5),
    
    -- Course Content (1-5 scale)
    course_content INTEGER CHECK (course_content BETWEEN 1 AND 5),
    
    -- Communication Skills (1-5 scale)
    communication_skills INTEGER CHECK (communication_skills BETWEEN 1 AND 5),
    
    -- Availability (1-5 scale)
    availability INTEGER CHECK (availability BETWEEN 1 AND 5),
    
    -- Overall Rating (1-5 scale)
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    
    -- Text feedback
    strengths TEXT,
    areas_for_improvement TEXT,
    additional_comments TEXT,
    
    -- Metadata
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    is_anonymous BOOLEAN DEFAULT false,
    
    -- Prevent duplicate evaluations
    UNIQUE(student_id, course_id)
);

-- AI Analysis Requests
CREATE TABLE IF NOT EXISTS ai_analysis_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    analysis_result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Activity Logs (for admin monitoring)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    user_role TEXT,
    activity_type TEXT NOT NULL,
    activity_description TEXT,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    performed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    performed_by_email TEXT,
    performed_by_role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instant Setup Requests (for quick database setup)
CREATE TABLE IF NOT EXISTS instant_setup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    setup_type TEXT NOT NULL,
    configuration JSONB,
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_term ON courses(academic_term_id);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

CREATE INDEX IF NOT EXISTS idx_evaluations_student ON evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_course ON evaluations(course_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_instructor ON evaluations(instructor_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_submitted ON evaluations(submitted_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_performed_by ON activity_logs(performed_by_id);

-- ============================================================
-- 3. CREATE FUNCTIONS
-- ============================================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into profiles table
    INSERT INTO public.profiles (id, email, role, first_name, last_name, status, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
        'pending',
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_user_email TEXT,
    p_user_role TEXT,
    p_activity_type TEXT,
    p_activity_description TEXT,
    p_metadata JSONB DEFAULT NULL,
    p_performed_by_id UUID DEFAULT NULL,
    p_performed_by_email TEXT DEFAULT NULL,
    p_performed_by_role TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO activity_logs (
        user_id,
        user_email,
        user_role,
        activity_type,
        activity_description,
        metadata,
        performed_by_id,
        performed_by_email,
        performed_by_role
    ) VALUES (
        p_user_id,
        p_user_email,
        p_user_role,
        p_activity_type,
        p_activity_description,
        p_metadata,
        p_performed_by_id,
        p_performed_by_email,
        p_performed_by_role
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. CREATE TRIGGERS
-- ============================================================

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Triggers to update updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_details_updated_at ON student_details;
CREATE TRIGGER update_student_details_updated_at
    BEFORE UPDATE ON student_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_instructor_details_updated_at ON instructor_details;
CREATE TRIGGER update_instructor_details_updated_at
    BEFORE UPDATE ON instructor_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_terms_updated_at ON academic_terms;
CREATE TRIGGER update_academic_terms_updated_at
    BEFORE UPDATE ON academic_terms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. CREATE VIEWS
-- ============================================================

-- View for course statistics
CREATE OR REPLACE VIEW course_statistics AS
SELECT 
    c.id AS course_id,
    c.course_code,
    c.course_name,
    c.instructor_id,
    p.first_name || ' ' || p.last_name AS instructor_name,
    at.term_name,
    COUNT(DISTINCT e.student_id) AS total_students,
    COUNT(DISTINCT ev.student_id) AS total_evaluations,
    ROUND(AVG(ev.overall_rating)::numeric, 2) AS average_rating,
    ROUND(AVG(ev.teaching_effectiveness)::numeric, 2) AS avg_teaching_effectiveness,
    ROUND(AVG(ev.course_content)::numeric, 2) AS avg_course_content,
    ROUND(AVG(ev.communication_skills)::numeric, 2) AS avg_communication_skills,
    ROUND(AVG(ev.availability)::numeric, 2) AS avg_availability
FROM courses c
LEFT JOIN profiles p ON c.instructor_id = p.id
LEFT JOIN academic_terms at ON c.academic_term_id = at.id
LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
LEFT JOIN evaluations ev ON c.id = ev.course_id
GROUP BY c.id, c.course_code, c.course_name, c.instructor_id, p.first_name, p.last_name, at.term_name;

-- View for instructor performance
CREATE OR REPLACE VIEW instructor_performance AS
SELECT 
    p.id AS instructor_id,
    p.first_name || ' ' || p.last_name AS instructor_name,
    p.email,
    id.department,
    id.academic_rank,
    COUNT(DISTINCT c.id) AS total_courses,
    COUNT(DISTINCT e.student_id) AS total_students,
    COUNT(DISTINCT ev.id) AS total_evaluations,
    ROUND(AVG(ev.overall_rating)::numeric, 2) AS average_rating,
    ROUND(AVG(ev.teaching_effectiveness)::numeric, 2) AS avg_teaching_effectiveness,
    ROUND(AVG(ev.course_content)::numeric, 2) AS avg_course_content,
    ROUND(AVG(ev.communication_skills)::numeric, 2) AS avg_communication_skills,
    ROUND(AVG(ev.availability)::numeric, 2) AS avg_availability
FROM profiles p
LEFT JOIN instructor_details id ON p.id = id.id
LEFT JOIN courses c ON p.id = c.instructor_id
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN evaluations ev ON p.id = ev.instructor_id
WHERE p.role = 'instructor'
GROUP BY p.id, p.first_name, p.last_name, p.email, id.department, id.academic_rank;

-- ============================================================
-- 6. DISABLE RLS (Row Level Security) ON ALL TABLES
-- ============================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE instant_setup_requests DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. GRANT PERMISSIONS
-- ============================================================

-- Grant access to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON student_details TO authenticated;
GRANT ALL ON instructor_details TO authenticated;
GRANT ALL ON academic_terms TO authenticated;
GRANT ALL ON courses TO authenticated;
GRANT ALL ON enrollments TO authenticated;
GRANT ALL ON evaluations TO authenticated;
GRANT ALL ON ai_analysis_requests TO authenticated;
GRANT ALL ON activity_logs TO authenticated;
GRANT ALL ON instant_setup_requests TO authenticated;

-- Grant access to service role
GRANT ALL ON profiles TO service_role;
GRANT ALL ON student_details TO service_role;
GRANT ALL ON instructor_details TO service_role;
GRANT ALL ON academic_terms TO service_role;
GRANT ALL ON courses TO service_role;
GRANT ALL ON enrollments TO service_role;
GRANT ALL ON evaluations TO service_role;
GRANT ALL ON ai_analysis_requests TO service_role;
GRANT ALL ON activity_logs TO service_role;
GRANT ALL ON instant_setup_requests TO service_role;

-- Grant access to anon (for public access if needed)
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON courses TO anon;
GRANT SELECT ON academic_terms TO anon;

-- ============================================================
-- SETUP COMPLETE
-- ============================================================

-- Verify tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify functions were created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verify views were created
SELECT 
    table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE '📊 All tables, functions, views, and triggers created';
    RAISE NOTICE '🔓 RLS is DISABLED on all tables';
    RAISE NOTICE '✨ Ready to use!';
END $$;
