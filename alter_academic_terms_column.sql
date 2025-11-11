-- Alter academic_terms table column name
-- Run this in Supabase SQL Editor

-- Rename term_name column to academic_term
ALTER TABLE academic_terms RENAME COLUMN term_name TO academic_term;

-- Verify the column was renamed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'academic_terms' 
ORDER BY ordinal_position;
