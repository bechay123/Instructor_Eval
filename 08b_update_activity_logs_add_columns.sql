-- ============================================================================
-- UPDATE EXISTING ACTIVITY LOGS TABLE
-- This script adds new columns and features to an existing activity_logs table
-- Run this ONLY if you already have the activity_logs table created
-- ============================================================================

-- Add new columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    -- Add performed_by_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activity_logs' AND column_name='performed_by_id') THEN
        ALTER TABLE activity_logs ADD COLUMN performed_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added column: performed_by_id';
    ELSE
        RAISE NOTICE 'Column performed_by_id already exists';
    END IF;
    
    -- Add performed_by_email column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activity_logs' AND column_name='performed_by_email') THEN
        ALTER TABLE activity_logs ADD COLUMN performed_by_email TEXT;
        RAISE NOTICE 'Added column: performed_by_email';
    ELSE
        RAISE NOTICE 'Column performed_by_email already exists';
    END IF;
    
    -- Add performed_by_role column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activity_logs' AND column_name='performed_by_role') THEN
        ALTER TABLE activity_logs ADD COLUMN performed_by_role TEXT;
        RAISE NOTICE 'Added column: performed_by_role';
    ELSE
        RAISE NOTICE 'Column performed_by_role already exists';
    END IF;
END $$;

-- Add index for performed_by_id for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_performed_by_id ON activity_logs(performed_by_id);

-- Update complete! New columns added to activity_logs table.
