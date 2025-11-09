# Activity Logs Feature Documentation

## Overview
The Activity Logs feature provides comprehensive monitoring and auditing capabilities for admin users. It tracks all user activities, admin actions, and system events in a centralized location within the admin dashboard.

## Components Created

### 1. Database Table: `activity_logs`
**File:** `08_create_activity_logs.sql`

**Schema:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference to the user (nullable)
- `user_email` (TEXT) - Email of the user involved
- `user_role` (TEXT) - Role of the user (student, instructor, admin)
- `activity_type` (TEXT) - Type of activity performed
- `activity_description` (TEXT) - Human-readable description
- `metadata` (JSONB) - Flexible JSON field for additional data
- `ip_address` (TEXT) - IP address (for future enhancement)
- `user_agent` (TEXT) - User agent string (for future enhancement)
- `created_at` (TIMESTAMP) - When the activity occurred

**Indexes:**
- `idx_activity_logs_user_id` - For user-specific queries
- `idx_activity_logs_activity_type` - For filtering by type
- `idx_activity_logs_created_at` - For time-based queries
- `idx_activity_logs_user_email` - For email-based searches

**Row Level Security:**
- Only admins can view activity logs
- Authenticated users can insert logs (for system operations)

### 2. Service Layer: `activity-logs-service.ts`
**Location:** `src/services/activity-logs-service.ts`

**Exports:**
- `ActivityLog` interface
- `ActivityType` type union
- `getAllActivityLogs()` - Fetch logs with optional filtering
- `logActivity()` - Manually log an activity
- `getActivityLogStats()` - Get aggregate statistics
- `getRecentActivityLogs()` - Get recent logs (default 10)

**Activity Types:**
- `user_registered` - New user registration
- `user_approved` - User account approved by admin
- `user_suspended` - User account suspended
- `user_reactivated` - Suspended user reactivated
- `user_deleted` - User account deleted
- `instant_setup_request` - Landing page instant setup request
- `course_created` - New course created
- `course_updated` - Course information updated
- `course_deleted` - Course deleted
- `evaluation_submitted` - Student evaluation submitted
- `admin_login` - Admin user login
- `admin_action` - Generic admin action

### 3. Admin Dashboard Tab
**File:** `src/pages/admin-dashboard.tsx`

**Features:**
- New "Activity Logs" tab in admin dashboard
- Real-time activity statistics:
  - Total Activities
  - Today's Activities
  - Instant Setup Requests
  - User Registrations
  - User Approvals
  - User Suspensions
- Activity filtering by type
- Comprehensive activity table with:
  - Date & Time
  - Activity Type (with color-coded badges)
  - Description
  - User/Email
  - User Role
- Auto-refresh when filter changes

## Automated Logging

### Database Triggers
The system includes two PostgreSQL triggers that automatically log activities:

#### 1. `trigger_log_user_activity`
**Triggered on:** `profiles` table (INSERT/UPDATE)

**Automatically logs:**
- User registrations (INSERT)
- User approvals (UPDATE: pending → approved)
- User suspensions (UPDATE: any status → suspended)
- User reactivations (UPDATE: suspended → approved)

#### 2. `trigger_log_instant_setup_request`
**Triggered on:** `instant_setup_requests` table (INSERT)

**Automatically logs:**
- New instant setup requests from the landing page

## Setup Instructions

### Step 1: Create the Database Table
Run the SQL script in your Supabase SQL Editor:

```bash
# In Supabase Dashboard → SQL Editor → New Query
# Copy and paste the contents of: 08_create_activity_logs.sql
# Click "Run"
```

**Important:** This script must be run AFTER `07_create_instant_setup_requests.sql` because it creates a trigger on the `instant_setup_requests` table.

### Step 2: Verify RLS Policies
The script automatically creates RLS policies. Verify they're active:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'activity_logs';

-- List all policies
SELECT * FROM pg_policies WHERE tablename = 'activity_logs';
```

### Step 3: Test the Feature
1. Navigate to Admin Dashboard
2. Click on "Activity Logs" tab
3. You should see existing activities (if any)
4. Try the filter dropdown to filter by activity type

### Step 4: Verify Automatic Logging
Test the triggers by performing these actions:

**Test User Registration Logging:**
1. Register a new user
2. Check Activity Logs - should see "user_registered" entry

**Test User Approval Logging:**
1. As admin, approve a pending user
2. Check Activity Logs - should see "user_approved" entry

**Test Instant Setup Logging:**
1. Go to landing page
2. Submit email in "Get Started" form
3. Check Activity Logs - should see "instant_setup_request" entry

**Test User Suspension Logging:**
1. As admin, suspend a user
2. Check Activity Logs - should see "user_suspended" entry

## Usage Examples

### Filtering Activities
```typescript
// In admin dashboard, use the dropdown to filter:
- All Activities (shows everything)
- User Registrations (only new signups)
- User Approvals (only admin approvals)
- User Suspensions (only suspensions)
- User Reactivations (only reactivations)
- Instant Setup Requests (landing page requests)
```

### Viewing Statistics
The Activity Logs tab displays 6 key metrics:
1. **Total Activities** - All-time activity count
2. **Today's Activities** - Last 24 hours
3. **Instant Setup Requests** - Total landing page requests
4. **User Registrations** - Total new users
5. **User Approvals** - Total approved users
6. **User Suspensions** - Total suspended users

### Manual Logging (for custom events)
```typescript
import { logActivity } from '@/services/activity-logs-service';

// Example: Log a custom admin action
await logActivity(
  'admin_action',
  'Admin performed bulk user export',
  { 
    action: 'bulk_export',
    count: 150,
    format: 'CSV'
  },
  userId,
  userEmail,
  'admin'
);
```

## Color Coding

Activities are color-coded for easy identification:
- **Blue** - User Registrations
- **Green** - User Approvals
- **Red** - User Suspensions
- **Purple** - User Reactivations
- **Orange** - Instant Setup Requests
- **Gray** - Other activities

## Performance Considerations

### Indexes
The table includes 4 indexes for optimal query performance:
- User ID lookup
- Activity type filtering
- Time-based queries
- Email searches

### Query Limits
- Default: 100 most recent activities
- Can be customized via filter parameters
- Ordered by `created_at DESC` (newest first)

### Pagination (Future Enhancement)
Currently loads 100 records. For production with high activity:
```typescript
// Future implementation
const { data } = await getAllActivityLogs({
  limit: 50,
  offset: page * 50
});
```

## Monitoring Best Practices

### Daily Admin Tasks
1. Check "Today's Activities" count
2. Review any unusual activity spikes
3. Monitor instant setup requests
4. Track user registration trends

### Security Monitoring
Look for:
- Multiple failed login attempts (future feature)
- Unusual admin actions
- Suspicious user patterns
- High volume of instant setup requests (potential spam)

### Compliance & Auditing
The activity logs provide:
- Complete audit trail of admin actions
- User lifecycle tracking (registration → approval → suspension)
- Timestamp evidence for compliance
- Metadata for detailed investigation

## Troubleshooting

### No activities showing up
1. Verify SQL script was executed successfully
2. Check RLS policies are active
3. Ensure you're logged in as admin
4. Check browser console for errors

### Triggers not firing
```sql
-- Verify triggers exist
SELECT * FROM pg_trigger 
WHERE tgname IN ('trigger_log_user_activity', 'trigger_log_instant_setup_request');

-- Check trigger functions
SELECT proname, prosrc FROM pg_proc 
WHERE proname IN ('log_user_activity', 'log_instant_setup_request');
```

### Statistics not updating
- Statistics are loaded on component mount
- Refresh the page to see latest stats
- Or switch to another tab and back

## Future Enhancements

### Planned Features
1. **Real-time Updates** - Use Supabase subscriptions for live updates
2. **Export to CSV** - Download activity logs for external analysis
3. **Advanced Filtering** - Date range, multiple type selection
4. **User Activity Timeline** - Individual user activity history
5. **IP Address Tracking** - Capture and display IP addresses
6. **Search Functionality** - Search by email, description, metadata
7. **Pagination** - Handle large datasets efficiently
8. **Activity Charts** - Visual graphs of activity trends
9. **Email Notifications** - Alert admins of critical activities
10. **Activity Retention Policy** - Auto-archive old logs

### Code Placeholders
The schema includes these fields for future use:
- `ip_address` - Currently nullable, ready for implementation
- `user_agent` - Browser/device information
- `metadata` - JSONB field for custom data

## Integration Points

### Existing Features
The Activity Logs integrates with:
- User Registration (automatic logging)
- User Approval workflow (automatic logging)
- User Suspension (automatic logging)
- Instant Setup Requests (automatic logging)

### Future Integrations
Potential integration points:
- Course CRUD operations
- Evaluation submissions
- Enrollment changes
- Academic term changes
- Instructor assignments

## Security Notes

### Access Control
- Only users with `role = 'admin'` can view activity logs
- RLS policies enforce this at database level
- No client-side bypass possible

### Data Privacy
- User emails are stored for tracking
- Metadata should not contain sensitive data (passwords, etc.)
- Consider GDPR compliance for IP address storage

### SQL Injection Prevention
- All queries use Supabase parameterized queries
- No raw SQL construction in client code
- Metadata stored as JSONB prevents injection

## Files Modified/Created

### Created Files
1. `08_create_activity_logs.sql` - Database schema and triggers
2. `src/services/activity-logs-service.ts` - Service layer
3. `ACTIVITY_LOGS_FEATURE.md` - This documentation

### Modified Files
1. `src/pages/admin-dashboard.tsx` - Added Activity Logs tab
   - Imported activity log services
   - Added state management for logs and stats
   - Added load functions
   - Added useEffect for filter changes
   - Added new TabsTrigger and TabsContent
   - Added Activity and Clock icons from lucide-react

## Dependencies

### New Dependencies
None! This feature uses existing dependencies:
- Supabase client (already installed)
- React hooks (built-in)
- Lucide React icons (already installed)
- Shadcn UI components (already installed)

### Required Extensions
PostgreSQL extensions used:
- `uuid-ossp` - For UUID generation (should already be enabled)

## Testing Checklist

- [ ] SQL script runs without errors
- [ ] Activity Logs tab appears in admin dashboard
- [ ] Statistics cards display correct counts
- [ ] Filter dropdown works (all options)
- [ ] New user registration creates log entry
- [ ] User approval creates log entry
- [ ] User suspension creates log entry
- [ ] User reactivation creates log entry
- [ ] Instant setup request creates log entry
- [ ] Activity table displays all columns correctly
- [ ] Color-coded badges appear correctly
- [ ] Timestamps format correctly
- [ ] RLS prevents non-admin access
- [ ] Page loads without console errors

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase SQL logs
3. Review RLS policies
4. Check trigger execution
5. Verify admin role assignment

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Production Ready
