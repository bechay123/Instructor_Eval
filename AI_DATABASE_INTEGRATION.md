# AI Reports Database Integration - Setup Guide

## Overview

The AI analysis feature now saves all generated reports to the database, allowing instructors to:
- View analysis history for each course
- Track improvements over time
- Compare analyses from different time periods
- Maintain a record of all AI-generated insights

## Database Setup

### Step 1: Run the SQL Script

Execute the SQL script to create the `ai_analysis_reports` table:

```bash
# In Supabase SQL Editor, run:
06_create_ai_reports_table.sql
```

This creates:
- ✅ `ai_analysis_reports` table with all necessary columns
- ✅ Indexes for performance optimization
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for automatic timestamp updates
- ✅ Comments for documentation

### Table Structure

```sql
ai_analysis_reports (
  id UUID PRIMARY KEY
  course_id UUID → references courses
  instructor_id UUID → references profiles
  generated_at TIMESTAMP
  
  -- Metrics
  evaluation_count INTEGER
  overall_rating DECIMAL
  response_rate DECIMAL
  
  -- AI Analysis
  summary TEXT
  strengths JSONB (array)
  areas_for_improvement JSONB (array)
  recommendations JSONB (array)
  key_themes JSONB (array)
  
  -- Sentiment
  sentiment_overall VARCHAR
  sentiment_teaching VARCHAR
  sentiment_materials VARCHAR
  sentiment_communication VARCHAR
  
  -- Category Averages
  category_avg_teaching DECIMAL
  category_avg_materials DECIMAL
  category_avg_communication DECIMAL
  
  -- Metadata
  evaluation_data_snapshot JSONB
  model_used VARCHAR
  tokens_used INTEGER
  is_active BOOLEAN
)
```

## Features Implemented

### 1. Auto-Save on Generation
- Every time an instructor generates AI analysis, it's automatically saved
- Full evaluation data snapshot stored for historical reference
- Tracks which AI model was used

### 2. Load Latest Report
- When selecting a course, the latest AI report is automatically loaded
- No need to regenerate if recent analysis exists

### 3. Report History
- All reports for a course are accessible
- Sorted by date (newest first)
- Can view historical trends

### 4. Soft Delete
- Reports are never permanently deleted
- `is_active` flag used for soft deletion
- `deleted_at` timestamp tracks when deleted

## Security (RLS Policies)

### Instructors
- ✅ Can view their own AI reports
- ✅ Can create AI reports for their courses
- ✅ Can soft-delete their own reports

### Admins
- ✅ Can view all AI reports
- ✅ Full access for monitoring and analytics

### Students
- ❌ Cannot access AI reports (privacy)

## Code Changes

### Files Modified

1. **`src/services/openai-service.ts`**
   - Added `saveAIReport()` - Saves analysis to database
   - Added `getAIReportsForCourse()` - Retrieves all reports for a course
   - Added `getLatestAIReport()` - Gets most recent report
   - Added `deleteAIReport()` - Soft deletes a report
   - Added `AIReport` interface for type safety

2. **`src/pages/instructor-dashboard-dynamic.tsx`**
   - Auto-saves generated analyses
   - Auto-loads latest report when switching courses
   - Added state for report history (`aiReports`)
   - Added `loadAIReports()` function
   - Updated `handleGenerateAIAnalysis()` to save reports

### New SQL File

3. **`06_create_ai_reports_table.sql`**
   - Complete table schema
   - Indexes for performance
   - RLS policies for security
   - Automatic triggers

## Usage Flow

```
Instructor selects course
        ↓
Load latest AI report (if exists)
        ↓
Display in AI Analysis tab
        ↓
Click "Generate Analysis"
        ↓
Generate new AI insights
        ↓
Save to database automatically
        ↓
Reload reports list
        ↓
Show updated analysis
```

## Benefits

### For Instructors
- 📊 Track teaching improvement over time
- 🔄 No need to regenerate same analysis
- 📈 Compare semester-to-semester performance
- 💾 Never lose AI insights

### For Administrators
- 📉 Monitor AI usage across institution
- 💰 Track API costs (via tokens_used)
- 📊 Analyze trends across all instructors
- 🔍 Audit trail of all analyses

### For the System
- ⚡ Faster load times (cached results)
- 💵 Cost savings (avoid duplicate API calls)
- 📦 Data retention for compliance
- 🔒 Secure storage with RLS

## Future Enhancements

### Report History UI (Planned)
Add a modal/drawer to view all past reports:
- Timeline view of analyses
- Compare two reports side-by-side
- Export reports as PDF
- Filter by date range
- View metrics trends

### Analytics Dashboard (Planned)
- Graph of ratings over time
- Sentiment trend analysis
- Most common themes
- Improvement tracking

## Testing Checklist

- [ ] Run SQL script in Supabase
- [ ] Verify table created successfully
- [ ] Check RLS policies are active
- [ ] Generate AI analysis as instructor
- [ ] Verify report saved to database
- [ ] Switch to different course and back
- [ ] Confirm latest report loads automatically
- [ ] Check Supabase table has new row
- [ ] Verify all fields populated correctly

## Database Queries

### View All Reports for a Course
```sql
SELECT * FROM ai_analysis_reports
WHERE course_id = '<course_uuid>'
AND is_active = true
ORDER BY generated_at DESC;
```

### Count Reports by Instructor
```sql
SELECT instructor_id, COUNT(*) as report_count
FROM ai_analysis_reports
WHERE is_active = true
GROUP BY instructor_id;
```

### Total Tokens Used (Cost Tracking)
```sql
SELECT 
  SUM(tokens_used) as total_tokens,
  COUNT(*) as total_reports
FROM ai_analysis_reports
WHERE is_active = true;
```

## Troubleshooting

### Report Not Saving
1. Check browser console for errors
2. Verify RLS policies are correct
3. Confirm user is authenticated
4. Check `instructor_id` matches `auth.uid()`

### Latest Report Not Loading
1. Verify reports exist in database
2. Check `is_active = true`
3. Confirm `course_id` matches selected course
4. Review browser console for errors

### Permission Denied
1. Ensure RLS is enabled: `ALTER TABLE ai_analysis_reports ENABLE ROW LEVEL SECURITY`
2. Verify policies exist
3. Check user role matches policy
4. Confirm `auth.uid()` returns correct user ID

## API Cost Tracking

Each report stores `tokens_used` for monitoring costs:

```sql
-- Calculate total cost (assuming GPT-4o-mini pricing)
-- Input: $0.150 / 1M tokens
-- Output: $0.600 / 1M tokens

SELECT 
  instructor_id,
  SUM(tokens_used) as total_tokens,
  (SUM(tokens_used) * 0.000150) as estimated_cost_usd
FROM ai_analysis_reports
WHERE is_active = true
GROUP BY instructor_id;
```

## Maintenance

### Archiving Old Reports
```sql
-- Archive reports older than 1 year
UPDATE ai_analysis_reports
SET is_active = false, deleted_at = NOW()
WHERE generated_at < NOW() - INTERVAL '1 year';
```

### Clean Up Test Data
```sql
-- Remove all test reports (use carefully!)
DELETE FROM ai_analysis_reports
WHERE is_active = false
AND deleted_at < NOW() - INTERVAL '30 days';
```

## Next Steps

1. **Run the SQL script** to create the table
2. **Test the feature** by generating an analysis
3. **Verify database** has the new report
4. **Plan UI improvements** for viewing history
5. **Monitor costs** using tokens_used field

---

**Database integration complete!** All AI analyses are now automatically saved and retrievable. 🎉
