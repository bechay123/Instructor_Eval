-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.academic_terms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  academic_year integer NOT NULL,
  semester text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT academic_terms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  user_email text,
  user_role text,
  activity_type text NOT NULL,
  activity_description text NOT NULL,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  performed_by_id uuid,
  performed_by_email text,
  performed_by_role text,
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT activity_logs_performed_by_id_fkey FOREIGN KEY (performed_by_id) REFERENCES auth.users(id)
);
CREATE TABLE public.ai_analysis_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  instructor_id uuid NOT NULL,
  generated_at timestamp with time zone DEFAULT now(),
  evaluation_count integer NOT NULL,
  overall_rating numeric,
  response_rate numeric,
  summary text NOT NULL,
  strengths jsonb NOT NULL,
  areas_for_improvement jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  key_themes jsonb NOT NULL,
  sentiment_overall character varying CHECK (sentiment_overall::text = ANY (ARRAY['positive'::character varying, 'neutral'::character varying, 'negative'::character varying]::text[])),
  sentiment_teaching character varying CHECK (sentiment_teaching::text = ANY (ARRAY['positive'::character varying, 'neutral'::character varying, 'negative'::character varying]::text[])),
  sentiment_materials character varying CHECK (sentiment_materials::text = ANY (ARRAY['positive'::character varying, 'neutral'::character varying, 'negative'::character varying]::text[])),
  sentiment_communication character varying CHECK (sentiment_communication::text = ANY (ARRAY['positive'::character varying, 'neutral'::character varying, 'negative'::character varying]::text[])),
  category_avg_teaching numeric,
  category_avg_materials numeric,
  category_avg_communication numeric,
  evaluation_data_snapshot jsonb,
  model_used character varying DEFAULT 'gpt-4o-mini'::character varying,
  tokens_used integer,
  is_active boolean DEFAULT true,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_analysis_reports_pkey PRIMARY KEY (id),
  CONSTRAINT ai_analysis_reports_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT ai_analysis_reports_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.ai_analysis_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  instructor_id uuid,
  course_id uuid,
  analysis_type text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ai_analysis_requests_pkey PRIMARY KEY (id),
  CONSTRAINT ai_analysis_requests_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES auth.users(id),
  CONSTRAINT ai_analysis_requests_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL,
  name text NOT NULL,
  instructor_id uuid NOT NULL,
  academic_term_id uuid NOT NULL,
  description text,
  units integer NOT NULL,
  schedule_days ARRAY,
  schedule_time_start time without time zone NOT NULL,
  schedule_time_end time without time zone NOT NULL,
  room text,
  max_students integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.profiles(id),
  CONSTRAINT courses_academic_term_id_fkey FOREIGN KEY (academic_term_id) REFERENCES public.academic_terms(id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  academic_term_id uuid NOT NULL,
  enrollment_date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  status text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id),
  CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT enrollments_academic_term_id_fkey FOREIGN KEY (academic_term_id) REFERENCES public.academic_terms(id)
);
CREATE TABLE public.evaluation_comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  evaluation_id uuid NOT NULL,
  teaching_comments text,
  materials_comments text,
  communication_comments text,
  general_comments text,
  sentiment_score numeric,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT evaluation_comments_pkey PRIMARY KEY (id),
  CONSTRAINT evaluation_comments_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES public.evaluations(id)
);
CREATE TABLE public.evaluation_ratings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  evaluation_id uuid NOT NULL,
  teaching_clarity integer,
  teaching_engagement integer,
  teaching_knowledge integer,
  teaching_organization integer,
  teaching_feedback integer,
  materials_quality integer,
  materials_relevance integer,
  materials_accessibility integer,
  materials_variety integer,
  materials_timeliness integer,
  communication_availability integer,
  communication_responsiveness integer,
  communication_clarity integer,
  communication_helpfulness integer,
  communication_approachability integer,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT evaluation_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT evaluation_ratings_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES public.evaluations(id)
);
CREATE TABLE public.evaluations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  academic_term_id uuid NOT NULL,
  is_anonymous boolean DEFAULT false,
  status text NOT NULL,
  submitted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT evaluations_pkey PRIMARY KEY (id),
  CONSTRAINT evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id),
  CONSTRAINT evaluations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT evaluations_academic_term_id_fkey FOREIGN KEY (academic_term_id) REFERENCES public.academic_terms(id)
);
CREATE TABLE public.instant_setup_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  request_type text DEFAULT 'instant_setup'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT instant_setup_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.instructor_details (
  id uuid NOT NULL,
  department text NOT NULL,
  office_location text,
  specialization ARRAY,
  academic_rank text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT instructor_details_pkey PRIMARY KEY (id),
  CONSTRAINT instructor_details_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['student'::text, 'instructor'::text, 'admin'::text])),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  avatar_url text,
  is_active boolean DEFAULT true,
  status text DEFAULT 'approved'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.student_details (
  id uuid NOT NULL,
  student_number text NOT NULL UNIQUE,
  program text NOT NULL,
  year_level integer,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT student_details_pkey PRIMARY KEY (id),
  CONSTRAINT student_details_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id)
);