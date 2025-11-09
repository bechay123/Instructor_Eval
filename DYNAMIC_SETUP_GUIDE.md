# Dynamic Instructor Evaluation System - Setup Guide

## ✅ What's Been Implemented

### 1. **Dynamic Instructor Dashboard** (`instructor-dashboard-dynamic.tsx`)

- ✅ Fetches real courses from database
- ✅ Displays actual evaluations and ratings
- ✅ Calculates real-time statistics:
  - Total evaluations count
  - Overall rating (average across all categories)
  - Response rate (evaluations/enrolled students)
- ✅ Category breakdowns (Teaching, Materials, Communication)
- ✅ Detailed ratings for each question
- ✅ Student comments display
- ✅ Course selector dropdown
- ✅ Loading and empty states

### 2. **Dynamic Student Dashboard** (`student-dashboard-dynamic.tsx`)

- ✅ Fetches enrolled courses from database
- ✅ Shows instructor information
- ✅ Displays course ratings and evaluation counts
- ✅ Full evaluation form (5 sections)
- ✅ Submits evaluations to database
- ✅ Prevents duplicate evaluations
- ✅ Search functionality
- ✅ Progress tracking

### 3. **Dynamic Admin Dashboard** (Already implemented)

- ✅ User management
- ✅ Approval system
- ✅ Statistics dashboard

---

## 🚀 Quick Start

### Step 1: Database Setup

1. **Run the table creation script** (if not already done):

   ```sql
   -- Run: 01_create_tables_no_triggers.sql in Supabase SQL Editor
   ```

2. **Create test courses for your instructor account**:
   ```sql
   -- Run: 04_quick_setup.sql
   -- This creates courses for Bernie Cherry Rante
   ```

### Step 2: Create a Test Student

1. Go to Supabase Authentication
2. Create a new user (e.g., `student@test.com`)
3. Get the user ID from `auth.users` table
4. Create a profile:

   ```sql
   INSERT INTO profiles (id, role, first_name, last_name, email, status)
   VALUES (
       'STUDENT_USER_ID_FROM_AUTH',
       'student',
       'Test',
       'Student',
       'student@test.com',
       'approved'
   );

   INSERT INTO student_details (id, student_number, program, year_level)
   VALUES (
       'STUDENT_USER_ID_FROM_AUTH',
       '2025-12345',
       'Computer Science',
       1
   );
   ```

### Step 3: Enroll Student in Courses

```sql
-- Get the term_id and course IDs first
SELECT id FROM academic_terms WHERE is_active = true;
SELECT id, code FROM courses;

-- Enroll student
INSERT INTO enrollments (student_id, course_id, academic_term_id, status)
VALUES
    ('STUDENT_ID', 'COURSE_ID_CS101', 'TERM_ID', 'enrolled'),
    ('STUDENT_ID', 'COURSE_ID_CS201', 'TERM_ID', 'enrolled');
```

---

## 📊 Database Schema Reference

### Tables Used:

- **profiles** - User information (students, instructors, admins)
- **instructor_details** - Instructor-specific data
- **student_details** - Student-specific data
- **academic_terms** - Semester/year information
- **courses** - Course listings
- **enrollments** - Student course enrollments
- **evaluations** - Evaluation records
- **evaluation_ratings** - Numeric ratings (1-5)
- **evaluation_comments** - Text feedback

### Key Relationships:

```
profiles (instructor) → courses → enrollments → evaluations
                                              → evaluation_ratings
                                              → evaluation_comments
```

---

## 🧪 Testing the System

### Test as Instructor:

1. Login with: `crishaplays101@gmail.com`
2. Should see courses in dashboard
3. Select course from dropdown
4. View evaluations (if any submitted)

### Test as Student:

1. Login with your test student account
2. Should see enrolled courses
3. Click "Evaluate Instructor"
4. Complete all 5 sections:
   - Communication & Information (15%)
   - Instruction & Learning (25%)
   - Engagement & Consultation (15%)
   - Assessment & Academic Integrity (25%)
   - General Assessment (20%)
5. Submit evaluation

### Test as Admin:

1. Login as admin
2. Manage users
3. Approve/suspend accounts
4. View statistics

---

## 🔧 API Functions Reference

### Instructor Dashboard Queries:

**Fetch Courses:**

```typescript
supabase
  .from("courses")
  .select("id, code, name, academic_term_id")
  .eq("instructor_id", userId)
  .eq("is_active", true);
```

**Fetch Evaluations:**

```typescript
supabase
  .from("evaluations")
  .select("id, status, course_id")
  .eq("course_id", courseId)
  .eq("status", "submitted");
```

**Fetch Ratings:**

```typescript
supabase
  .from("evaluation_ratings")
  .select("*")
  .in("evaluation_id", evaluationIds);
```

**Fetch Comments:**

```typescript
supabase
  .from("evaluation_comments")
  .select("*")
  .in("evaluation_id", evaluationIds);
```

### Student Dashboard Queries:

**Fetch Enrolled Courses:**

```typescript
supabase
  .from("enrollments")
  .select(
    `
    course_id,
    courses (
      id, code, name, instructor_id, academic_term_id
    )
  `
  )
  .eq("student_id", userId)
  .eq("status", "enrolled");
```

**Check Existing Evaluations:**

```typescript
supabase
  .from("evaluations")
  .select("course_id, id")
  .eq("student_id", userId)
  .in("course_id", courseIds);
```

**Submit Evaluation:**

```typescript
// 1. Create evaluation
const { data: evaluation } = await supabase
  .from("evaluations")
  .insert({
    student_id: userId,
    course_id: courseId,
    academic_term_id: termId,
    is_anonymous: false,
    status: "submitted",
    submitted_at: new Date().toISOString(),
  })
  .select()
  .single();

// 2. Insert ratings
await supabase.from("evaluation_ratings").insert({
  evaluation_id: evaluation.id,
  teaching_clarity: rating1,
  // ... other ratings
});

// 3. Insert comments
await supabase.from("evaluation_comments").insert({
  evaluation_id: evaluation.id,
  teaching_comments: "...",
  materials_comments: "...",
  communication_comments: "...",
  general_comments: "...",
});
```

---

## 📝 Rating Field Mapping

The evaluation form questions map to database fields as follows:

### Section A (Communication) → evaluation_ratings:

- a1_syllabus → teaching_clarity
- a2_makeup_classes → teaching_engagement
- a3_online_platform → teaching_knowledge
- a4_synchronous_activity → teaching_organization
- a5_tech_support → teaching_feedback
- a6_communication → (extra field)
- a7_tools_used → teaching_comments (in evaluation_comments)

### Section B (Instruction) → evaluation_ratings:

- b1_course_content → materials_quality
- b2_lectures → materials_relevance
- b3_assignments → materials_accessibility
- b4_subject_matter → materials_variety
- b5_access_materials → materials_timeliness
- b6_submission_instructions → (extra field)
- b7_lecture_forms → materials_comments

### Section C (Engagement) → evaluation_ratings:

- c1_office_hours → communication_availability
- c2_discussion_boards → communication_responsiveness
- c3_group_interaction → communication_clarity
- c4_engagement → communication_helpfulness
- c5_consultation → communication_approachability
- c6_class_discussion → (extra field)
- c7_strategies → communication_comments

### Section D (Assessment) → general_comments

### Section E (General) → general_comments

---

## 🎨 Features

### Instructor Dashboard:

- 📊 Real-time evaluation statistics
- 📈 Category performance charts
- 💬 Student feedback comments
- 🎯 Detailed question breakdowns
- 🔄 Course switching
- 📱 Responsive design

### Student Dashboard:

- 📚 View enrolled courses
- ⭐ See instructor ratings
- ✍️ Submit evaluations
- 🔍 Search courses
- ✅ Track evaluated courses
- 📋 Multi-section form with progress tracking

### Admin Dashboard:

- 👥 User management
- ✅ Approval workflow
- 📊 System statistics
- 🔒 Account controls

---

## 🐛 Troubleshooting

### No courses showing in instructor dashboard:

- Check if courses exist in database
- Verify `instructor_id` matches user ID
- Ensure `is_active = true`

### Student can't see courses:

- Check enrollments table
- Verify `status = 'enrolled'`
- Check if course is active

### Can't submit evaluation:

- Check if already evaluated (duplicates prevented)
- Verify all required fields filled
- Check browser console for errors

### Ratings not calculating:

- Ensure ratings are numbers 1-5
- Check if evaluations have `status = 'submitted'`
- Verify evaluation_ratings records exist

---

## 📞 Support

If you encounter any issues:

1. Check browser console for errors
2. Check Supabase logs
3. Verify database records exist
4. Ensure RLS is disabled (as mentioned)

---

## 🎯 Next Steps

1. ✅ Test instructor dashboard with real data
2. ✅ Test student evaluation submission
3. ✅ Verify admin dashboard functionality
4. 🔄 Add more test data if needed
5. 🎨 Customize styling/branding
6. 🚀 Deploy to production

---

**All dashboards are now fully dynamic and connected to your Supabase database!**
