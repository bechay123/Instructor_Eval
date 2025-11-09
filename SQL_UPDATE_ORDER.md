# Activity Logs - SQL Update Scripts

## 📋 Files Overview

### For EXISTING activity_logs table (Already created)
If you already ran `08_create_activity_logs.sql` before, run these updates in order:

1. **08b_update_activity_logs_add_columns.sql**
   - Adds `performed_by_id`, `performed_by_email`, `performed_by_role` columns
   - Safe to run multiple times (checks if columns exist)
   - Run this FIRST

2. **08c_update_activity_triggers.sql**
   - Updates existing triggers to use new "performed_by" columns
   - Updates: user registration, approval, suspension, reactivation
   - Run this SECOND

3. **08d_add_new_activity_features.sql**
   - Adds NEW tracking features:
     - Profile updates
     - AI analysis requests
     - Enrollment activities (student vs instructor)
     - Evaluation submissions
     - Course CRUD operations
   - Creates `ai_analysis_requests` table
   - Run this THIRD

### For FRESH installation (No activity_logs table yet)
Just run the main file:
- **08_create_activity_logs.sql** - Creates everything from scratch

## 🚀 Quick Start (For Existing Tables)

### Step 1: Run in Supabase SQL Editor
```sql
-- Copy and paste contents of this file:
08b_update_activity_logs_add_columns.sql
-- Click "Run"
-- You should see: "Added column: performed_by_id" (3 times)
```

### Step 2: Update Triggers
```sql
-- Copy and paste contents of this file:
08c_update_activity_triggers.sql
-- Click "Run"
-- You should see: "Updated trigger: log_user_activity"
```

### Step 3: Add New Features
```sql
-- Copy and paste contents of this file:
08d_add_new_activity_features.sql
-- Click "Run"
-- You should see success messages for each trigger created
```

## ✅ Verification

After running all scripts, verify:

1. Check if columns exist:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'activity_logs'
ORDER BY column_name;
```

2. Check if ai_analysis_requests table exists:
```sql
SELECT * FROM ai_analysis_requests LIMIT 1;
```

3. Test activity logging:
   - Register a new user → Check activity_logs
   - Edit your profile → Check activity_logs
   - Create a course → Check activity_logs

## 📊 What Gets Tracked After Updates

### Before Updates (Basic)
- User registrations
- User approvals/suspensions
- Instant setup requests

### After Updates (Complete)
- ✅ User registrations (with who registered)
- ✅ User approvals/suspensions/reactivations (with admin who performed)
- ✅ Profile updates (with what changed)
- ✅ Student enrollments (self vs instructor-added)
- ✅ Evaluation submissions
- ✅ AI analysis requests
- ✅ Course created/updated/deleted
- ✅ Instant setup requests

## 🔧 Troubleshooting

### Error: "column already exists"
✅ This is fine! The script checks before adding columns.

### Error: "table does not exist"
❌ You need to run `08_create_activity_logs.sql` first to create the base table.

### Error: "relation does not exist"
❌ Make sure you have the referenced tables: `profiles`, `courses`, `enrollments`, `evaluations`

## 📝 Notes

- All scripts are **idempotent** (safe to run multiple times)
- Scripts use `DROP TRIGGER IF EXISTS` before creating triggers
- Scripts use `CREATE OR REPLACE FUNCTION` for functions
- No data will be lost when running these updates

---

**Order Summary:**
1. 08b → Add columns
2. 08c → Update triggers  
3. 08d → Add new features

**Total Time:** ~30 seconds to run all three scripts
