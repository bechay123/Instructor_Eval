-- Migration: Add bilingual comment support to evaluations table
-- This allows storing both original (in student's language) and translated (English) comments

-- Add columns for original comments and their languages
ALTER TABLE evaluations
ADD COLUMN teaching_comments_original TEXT,
ADD COLUMN teaching_comments_language VARCHAR(10),
ADD COLUMN materials_comments_original TEXT,
ADD COLUMN materials_comments_language VARCHAR(10),
ADD COLUMN communication_comments_original TEXT,
ADD COLUMN communication_comments_language VARCHAR(10),
ADD COLUMN general_comments_original TEXT,
ADD COLUMN general_comments_language VARCHAR(10);

-- Add comment to explain the schema
COMMENT ON COLUMN evaluations.teaching_comments IS 'Translated English version of teaching comments';
COMMENT ON COLUMN evaluations.teaching_comments_original IS 'Original comment in student''s chosen language';
COMMENT ON COLUMN evaluations.teaching_comments_language IS 'Language code: en, tl, ceb, hil, mrw';

COMMENT ON COLUMN evaluations.materials_comments IS 'Translated English version of materials comments';
COMMENT ON COLUMN evaluations.materials_comments_original IS 'Original comment in student''s chosen language';
COMMENT ON COLUMN evaluations.materials_comments_language IS 'Language code: en, tl, ceb, hil, mrw';

COMMENT ON COLUMN evaluations.communication_comments IS 'Translated English version of communication comments';
COMMENT ON COLUMN evaluations.communication_comments_original IS 'Original comment in student''s chosen language';
COMMENT ON COLUMN evaluations.communication_comments_language IS 'Language code: en, tl, ceb, hil, mrw';

COMMENT ON COLUMN evaluations.general_comments IS 'Translated English version of general comments';
COMMENT ON COLUMN evaluations.general_comments_original IS 'Original comment in student''s chosen language';
COMMENT ON COLUMN evaluations.general_comments_language IS 'Language code: en, tl, ceb, hil, mrw';

-- Note: Existing comment columns will hold the English (translated) versions
-- This maintains backward compatibility with existing queries
