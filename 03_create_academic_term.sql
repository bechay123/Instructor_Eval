-- Create academic terms with correct semester values
-- Run this in Supabase SQL Editor

-- Insert academic terms
INSERT INTO academic_terms (academic_year, semester, start_date, end_date, is_active)
VALUES 
  -- 2023-2024 Academic Year
  (2023, '1st Semester', '2023-08-01', '2023-12-15', false),
  (2023, '2nd Semester', '2024-01-06', '2024-05-31', false),
  (2023, 'Summer', '2024-06-01', '2024-07-31', false),
  
  -- 2024-2025 Academic Year
  (2024, '1st Semester', '2024-08-01', '2024-12-15', false),
  (2024, '2nd Semester', '2025-01-06', '2025-05-31', true),
  (2024, 'Summer', '2025-06-01', '2025-07-31', false),
  
  -- 2025-2026 Academic Year
  (2025, '1st Semester', '2025-08-01', '2025-12-15', false),
  (2025, '2nd Semester', '2026-01-06', '2026-05-31', false),
  (2025, 'Summer', '2026-06-01', '2026-07-31', false),
  
  -- 2026-2027 Academic Year
  (2026, '1st Semester', '2026-08-01', '2026-12-15', false),
  (2026, '2nd Semester', '2027-01-06', '2027-05-31', false),
  (2026, 'Summer', '2027-06-01', '2027-07-31', false),
  
  -- 2027-2028 Academic Year
  (2027, '1st Semester', '2027-08-01', '2027-12-15', false),
  (2027, '2nd Semester', '2028-01-06', '2028-05-31', false),
  (2027, 'Summer', '2028-06-01', '2028-07-31', false)
ON CONFLICT (academic_year, semester) DO NOTHING;

-- Verify the academic terms were created
SELECT * FROM academic_terms ORDER BY academic_year DESC, semester;
