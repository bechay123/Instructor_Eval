-- ============================================================================
-- UPDATE ACTIVITY LOGS TRIGGERS
-- This script updates all triggers to include "performed_by" tracking
-- Run this AFTER running 08b_update_activity_logs_add_columns.sql
-- ============================================================================

-- Update function to automatically log user activities
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT;
  admin_role TEXT;
BEGIN
  -- Get admin info who performed the action
  SELECT email, role INTO admin_email, admin_role
  FROM profiles
  WHERE id = auth.uid();

  -- Log user approval
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'approved' THEN
    INSERT INTO activity_logs (
      user_id, user_email, user_role, 
      activity_type, activity_description, metadata,
      performed_by_id, performed_by_email, performed_by_role
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.role,
      'user_approved',
      'User account approved',
      jsonb_build_object(
        'user_id', NEW.id,
        'user_name', NEW.first_name || ' ' || NEW.last_name,
        'role', NEW.role
      ),
      auth.uid(),
      admin_email,
      admin_role
    );
  END IF;

  -- Log user suspension
  IF TG_OP = 'UPDATE' AND OLD.status != 'suspended' AND NEW.status = 'suspended' THEN
    INSERT INTO activity_logs (
      user_id, user_email, user_role,
      activity_type, activity_description, metadata,
      performed_by_id, performed_by_email, performed_by_role
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.role,
      'user_suspended',
      'User account suspended',
      jsonb_build_object(
        'user_id', NEW.id,
        'user_name', NEW.first_name || ' ' || NEW.last_name,
        'role', NEW.role
      ),
      auth.uid(),
      admin_email,
      admin_role
    );
  END IF;

  -- Log user reactivation
  IF TG_OP = 'UPDATE' AND OLD.status = 'suspended' AND NEW.status = 'approved' THEN
    INSERT INTO activity_logs (
      user_id, user_email, user_role,
      activity_type, activity_description, metadata,
      performed_by_id, performed_by_email, performed_by_role
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.role,
      'user_reactivated',
      'User account reactivated',
      jsonb_build_object(
        'user_id', NEW.id,
        'user_name', NEW.first_name || ' ' || NEW.last_name,
        'role', NEW.role
      ),
      auth.uid(),
      admin_email,
      admin_role
    );
  END IF;

  -- Log new user registration (no admin involved)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (
      user_id, user_email, user_role,
      activity_type, activity_description, metadata,
      performed_by_id, performed_by_email, performed_by_role
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.role,
      'user_registered',
      'New user registered',
      jsonb_build_object(
        'user_id', NEW.id,
        'user_name', NEW.first_name || ' ' || NEW.last_name,
        'role', NEW.role,
        'status', NEW.status
      ),
      NEW.id,
      NEW.email,
      NEW.role
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger (it will update the existing one)
DROP TRIGGER IF EXISTS trigger_log_user_activity ON profiles;
CREATE TRIGGER trigger_log_user_activity
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION log_user_activity();

-- Updated trigger: log_user_activity
