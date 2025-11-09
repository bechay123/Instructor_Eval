# 📊 Activity Logs - Complete Feature Guide

## Overview
The Activity Logs system tracks all user, instructor, and admin activities across the entire platform. This provides complete audit trail and monitoring capabilities.

## 🎯 Tracked Activities

### 👤 User Activities
| Activity Type | Description | Performed By | Color |
|--------------|-------------|--------------|-------|
| `user_registered` | New user registration | User (self) | Blue |
| `profile_updated` | User edits their profile | User (self) | Lime |
| `student_enrolled` | Student enrolls in course | Student (self) | Cyan |
| `evaluation_submitted` | Student submits evaluation | Student (self) | Indigo |

### 👨‍🏫 Instructor Activities
| Activity Type | Description | Performed By | Color |
|--------------|-------------|--------------|-------|
| `instructor_added_student` | Instructor adds student to course | Instructor | Teal |
| `ai_analysis_requested` | Instructor requests AI analysis | Instructor | Fuchsia |
| `course_created` | Instructor/Admin creates course | Instructor/Admin | Emerald |
| `course_updated` | Instructor/Admin updates course | Instructor/Admin | Yellow |
| `course_deleted` | Instructor/Admin deletes course | Instructor/Admin | Rose |

### 🛡️ Admin Activities
| Activity Type | Description | Performed By | Color |
|--------------|-------------|--------------|-------|
| `user_approved` | Admin approves user account | Admin | Green |
| `user_suspended` | Admin suspends user account | Admin | Red |
| `user_reactivated` | Admin reactivates suspended account | Admin | Purple |

### 🌐 System Activities
| Activity Type | Description | Performed By | Color |
|--------------|-------------|--------------|-------|
| `instant_setup_request` | Landing page instant setup request | System | Orange |

## 📋 Database Schema

### `activity_logs` Table
```sql
- id: UUID (Primary Key)
- user_id: UUID (User affected by activity)
- user_email: TEXT
- user_role: TEXT
- activity_type: TEXT (Type of activity)
- activity_description: TEXT
- metadata: JSONB (Additional data)
- performed_by_id: UUID (Who performed the action)
- performed_by_email: TEXT
- performed_by_role: TEXT
- ip_address: TEXT
- user_agent: TEXT
- created_at: TIMESTAMP
```

### `ai_analysis_requests` Table
```sql
- id: UUID (Primary Key)
- instructor_id: UUID
- course_id: UUID
- analysis_type: TEXT
- created_at: TIMESTAMP
```

## 🔧 Setup Instructions

### 1. Run SQL Script
```bash
# In Supabase SQL Editor, run:
08_create_activity_logs.sql
```

This will:
- ✅ Create `activity_logs` table
- ✅ Create `ai_analysis_requests` table
- ✅ Add necessary indexes
- ✅ Create automatic triggers for:
  - User registrations
  - User approvals/suspensions/reactivations
  - Profile updates
  - Course CRUD operations
  - Student enrollments
  - Evaluation submissions
  - AI analysis requests
  - Instant setup requests

### 2. Access Activity Logs
1. Login as **Admin**
2. Go to **Admin Dashboard**
3. Click on **Activity Logs** tab

## 🎨 UI Features

### Statistics Cards
- **Total Activities**: All-time activity count
- **Today's Activities**: Activities in last 24 hours
- **Instant Setup Requests**: Landing page requests

### Activity Table
Displays all activities with:
- **Date & Time**: When activity occurred
- **Activity Type**: Color-coded badge
- **Description**: What happened
- **User/Email**: User affected
- **Role**: User's role
- **Performed By**: Who did it (NEW!)

### Filter Dropdown
Filter activities by type:
- All Activities
- User Registrations
- User Approvals/Suspensions/Reactivations
- Student Enrollments (Self vs Instructor Added)
- Evaluation Submissions
- AI Analysis Requests
- Profile Updates
- Course Management (Created/Updated/Deleted)
- Instant Setup Requests

### Bottom Statistics
- **User Registrations**: Total count
- **User Approvals**: Total count (green)
- **User Suspensions**: Total count (red)

## 💻 Developer Integration

### Automatic Logging (via Triggers)
Most activities are logged automatically via database triggers:
```typescript
// No code needed - these are automatic:
// - User registration
// - User approval/suspension
// - Profile updates
// - Course CRUD
// - Student enrollments
// - Evaluation submissions
```

### Manual Logging for AI Analysis

When instructor requests AI analysis, call:

```typescript
import { logAIAnalysisRequest } from '@/services/activity-logs-service';

// In instructor dashboard AI analysis function:
const handleAIAnalysis = async (courseId: string) => {
  const { user } = useAuth(); // Get current instructor
  
  // Your AI analysis logic here...
  
  // Log the activity
  await logAIAnalysisRequest(
    user.id,           // instructor_id
    courseId,          // course_id
    'evaluation_analysis' // analysis_type
  );
};
```

### Manual Activity Logging (Generic)

For custom activities:

```typescript
import { logActivity } from '@/services/activity-logs-service';

await logActivity(
  'custom_activity_type',     // activity_type
  'Description of activity',   // activity_description
  { key: 'value' },           // metadata (optional)
  'user-uuid',                // user_id (optional)
  'user@email.com',           // user_email (optional)
  'student',                  // user_role (optional)
  'admin-uuid',               // performed_by_id (optional)
  'admin@email.com',          // performed_by_email (optional)
  'admin'                     // performed_by_role (optional)
);
```

## 🔍 How "Performed By" Works

The system intelligently tracks who performed each action:

### Self Actions
```
Activity: Student enrolls in course
Performed By: student@email.com (student)
```

### Admin Actions
```
Activity: User account approved
Performed By: admin@email.com (admin)
```

### Instructor Actions
```
Activity: Instructor added student to course
Performed By: instructor@email.com (instructor)
```

### System Actions
```
Activity: New instant setup request received
Performed By: System
```

## 📊 Example Data Flow

### Student Enrolls in Course
1. Student clicks "Enroll" button
2. Enrollment record created in `enrollments` table
3. Trigger `log_enrollment_activity()` fires
4. Checks: `auth.uid() == student_id` → TRUE
5. Logs activity:
   - Activity Type: `student_enrolled`
   - Description: "Student enrolled in course: CS101"
   - Performed By: student@email.com (student)

### Instructor Adds Student to Course
1. Instructor selects student and clicks "Add to Course"
2. Enrollment record created in `enrollments` table
3. Trigger `log_enrollment_activity()` fires
4. Checks: `auth.uid() == student_id` → FALSE
5. Logs activity:
   - Activity Type: `instructor_added_student`
   - Description: "Instructor added student to course: CS101"
   - Performed By: instructor@email.com (instructor)

### Admin Approves User
1. Admin clicks "Approve" button
2. User status updated: `pending` → `approved`
3. Trigger `log_user_activity()` fires
4. Logs activity:
   - Activity Type: `user_approved`
   - Description: "User account approved"
   - Performed By: admin@email.com (admin)

## 🚀 Next Steps

### To Use AI Analysis Logging
In your instructor dashboard where AI analysis happens:

```typescript
// Find your AI analysis function (probably in instructor-dashboard-dynamic.tsx)
// Add this import at the top:
import { logAIAnalysisRequest } from '@/services/activity-logs-service';

// Inside your analysis function:
const analyzeEvaluations = async (courseId: string) => {
  try {
    // Your existing AI analysis code...
    const response = await openai.chat.completions.create({...});
    
    // After successful analysis, log it:
    await logAIAnalysisRequest(user.id, courseId, 'evaluation_analysis');
    
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

## 🎯 Benefits

1. **Complete Audit Trail**: Track every action in the system
2. **User Accountability**: Know who did what and when
3. **System Monitoring**: Monitor platform usage patterns
4. **Security**: Detect suspicious activities
5. **Compliance**: Meet audit requirements
6. **Analytics**: Understand user behavior

## 📝 Notes

- **RLS Disabled**: Activity logs table has RLS disabled for easier access
- **Automatic Cleanup**: Consider adding a cleanup job for old logs (90+ days)
- **Performance**: Indexes added on common query fields for fast filtering
- **Privacy**: Consider GDPR implications for storing user activities
- **Extensibility**: Easy to add new activity types via triggers

---

**Created**: October 27, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
