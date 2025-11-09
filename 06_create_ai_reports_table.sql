-- AI Analysis Reports Table
-- This table stores AI-generated analysis reports for instructor evaluations

CREATE TABLE IF NOT EXISTS ai_analysis_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Analysis metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evaluation_count INTEGER NOT NULL,
  overall_rating DECIMAL(3,2),
  response_rate DECIMAL(5,2),
  
  -- AI Analysis Results (stored as JSONB for flexibility)
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL, -- Array of strings
  areas_for_improvement JSONB NOT NULL, -- Array of strings
  recommendations JSONB NOT NULL, -- Array of strings
  key_themes JSONB NOT NULL, -- Array of strings
  
  -- Sentiment analysis
  sentiment_overall VARCHAR(20) CHECK (sentiment_overall IN ('positive', 'neutral', 'negative')),
  sentiment_teaching VARCHAR(20) CHECK (sentiment_teaching IN ('positive', 'neutral', 'negative')),
  sentiment_materials VARCHAR(20) CHECK (sentiment_materials IN ('positive', 'neutral', 'negative')),
  sentiment_communication VARCHAR(20) CHECK (sentiment_communication IN ('positive', 'neutral', 'negative')),
  
  -- Category averages at time of analysis
  category_avg_teaching DECIMAL(3,2),
  category_avg_materials DECIMAL(3,2),
  category_avg_communication DECIMAL(3,2),
  
  -- Full evaluation data snapshot (optional, for reference)
  evaluation_data_snapshot JSONB,
  
  -- OpenAI metadata
  model_used VARCHAR(50) DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  
  -- Soft delete
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_reports_course ON ai_analysis_reports(course_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_instructor ON ai_analysis_reports(instructor_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_generated_at ON ai_analysis_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_active ON ai_analysis_reports(is_active) WHERE is_active = true;

-- Note: RLS (Row Level Security) is disabled to avoid conflicts
-- Access control should be handled at the application level

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ai_reports_timestamp
  BEFORE UPDATE ON ai_analysis_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_reports_updated_at();

-- Comments
COMMENT ON TABLE ai_analysis_reports IS 'Stores AI-generated analysis reports for instructor course evaluations';
COMMENT ON COLUMN ai_analysis_reports.evaluation_data_snapshot IS 'Complete evaluation data at time of analysis (for historical reference)';
COMMENT ON COLUMN ai_analysis_reports.tokens_used IS 'Number of tokens consumed by OpenAI API for this analysis';
