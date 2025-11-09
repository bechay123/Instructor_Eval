-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles if they don't exist
DO $$ 
BEGIN
  -- Create roles for different user types
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'student') THEN
    CREATE ROLE student;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'instructor') THEN
    CREATE ROLE instructor;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Create academic terms table
CREATE TABLE academic_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year INTEGER NOT NULL,
    semester TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(academic_year, semester)
);

-- Create profiles table (base user information)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_role CHECK (role IN ('student', 'instructor', 'admin'))
);

-- Create instructor_details table
CREATE TABLE instructor_details (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    office_location TEXT,
    specialization TEXT[],
    academic_rank TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create student_details table
CREATE TABLE student_details (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    student_number TEXT UNIQUE NOT NULL,
    program TEXT NOT NULL,
    year_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    instructor_id UUID NOT NULL REFERENCES profiles(id),
    academic_term_id UUID NOT NULL REFERENCES academic_terms(id),
    description TEXT,
    units INTEGER NOT NULL,
    schedule_days TEXT[],
    schedule_time_start TIME NOT NULL,
    schedule_time_end TIME NOT NULL,
    room TEXT,
    max_students INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(code, academic_term_id)
);

-- Create enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    academic_term_id UUID NOT NULL REFERENCES academic_terms(id),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, course_id, academic_term_id)
);

-- Create evaluations table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    academic_term_id UUID NOT NULL REFERENCES academic_terms(id),
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, course_id, academic_term_id)
);

-- Create evaluation_ratings table
CREATE TABLE evaluation_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    
    -- Teaching effectiveness
    teaching_clarity INTEGER,
    teaching_engagement INTEGER,
    teaching_knowledge INTEGER,
    teaching_organization INTEGER,
    teaching_feedback INTEGER,
    
    -- Learning materials
    materials_quality INTEGER,
    materials_relevance INTEGER,
    materials_accessibility INTEGER,
    materials_variety INTEGER,
    materials_timeliness INTEGER,
    
    -- Communication/Accessibility
    communication_availability INTEGER,
    communication_responsiveness INTEGER,
    communication_clarity INTEGER,
    communication_helpfulness INTEGER,
    communication_approachability INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create evaluation_comments table
CREATE TABLE evaluation_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    teaching_comments TEXT,
    materials_comments TEXT,
    communication_comments TEXT,
    general_comments TEXT,
    sentiment_score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_academic_term ON courses(academic_term_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_evaluations_course ON evaluations(course_id);
CREATE INDEX idx_evaluation_ratings_evaluation ON evaluation_ratings(evaluation_id);
CREATE INDEX idx_evaluation_comments_evaluation ON evaluation_comments(evaluation_id);

-- NO TRIGGERS - Everything handled manually in the application