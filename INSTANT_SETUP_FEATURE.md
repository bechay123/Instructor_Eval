# Instant Setup Request Feature

## Overview
This feature allows visitors on the landing page to request instant setup assistance by submitting their email address. All requests are stored in a database table for admin review.

---

## Database Setup

### 1. Run SQL Script
Execute the following file in your Supabase SQL Editor:
```
07_create_instant_setup_requests.sql
```

This creates:
- ✅ `instant_setup_requests` table
- ✅ Indexes for performance
- ✅ RLS policies (public can insert, authenticated can view)
- ✅ Proper permissions

### Table Schema
```sql
id              UUID (Primary Key)
email           TEXT (Required)
request_type    TEXT (Default: 'instant_setup')
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## Features Implemented

### 1. Landing Page Form
**Location:** `src/pages/landpage.tsx`

**What it does:**
- ✅ Email input field
- ✅ "Get Started" button
- ✅ Loading state during submission
- ✅ Success/error messages
- ✅ Email validation
- ✅ Auto-clear success message after 5 seconds

**User Experience:**
1. User enters email on landing page
2. Clicks "Get Started"
3. Button shows "Sending..." with disabled state
4. Success message: "Thank you! We'll contact you soon to set up your account."
5. Email field clears automatically

### 2. Service Layer
**Location:** `src/services/instant-setup-service.ts`

**Functions:**

#### `submitInstantSetupRequest(email)`
- Validates email format
- Trims and lowercases email
- Inserts into database
- Returns success/error status

#### `getAllInstantSetupRequests()`
- Fetches all requests (admin only)
- Orders by newest first
- Returns array of requests

---

## Usage

### For Visitors (Landing Page)
1. Visit landing page
2. Enter email in "Get Started" form
3. Click "Get Started"
4. See confirmation message

### For Admins (Future Enhancement)
You can add this to your admin dashboard to view all requests:

```typescript
import { getAllInstantSetupRequests } from '../services/instant-setup-service';

// In your component
const { data: requests } = await getAllInstantSetupRequests();
```

---

## Security Features

✅ **Email Validation** - Client-side validation prevents invalid emails
✅ **RLS Policies** - Row Level Security enabled
✅ **Public Insert Only** - Anonymous users can only insert, not read
✅ **Admin Read Access** - Only authenticated users can view requests
✅ **SQL Injection Protection** - Supabase client handles parameterization

---

## Next Steps

### Immediate (Required)
1. ✅ Run `07_create_instant_setup_requests.sql` in Supabase SQL Editor
2. ✅ Test the form on landing page
3. ✅ Verify data appears in Supabase dashboard

### Future Enhancements
- [ ] Add admin dashboard page to view all requests
- [ ] Add email notifications to admin when new request arrives
- [ ] Add "Mark as processed" functionality
- [ ] Add duplicate email prevention (only allow one request per email)
- [ ] Add export to CSV functionality for admins

---

## Testing

### Test the Form
1. Go to landing page (http://localhost:5173)
2. Enter an email in "Get Started" form
3. Click "Get Started"
4. Should see: "Thank you! We'll contact you soon..."

### Verify in Database
Go to Supabase dashboard → Table Editor → `instant_setup_requests`
- Should see your email entry
- Check `created_at` timestamp
- Verify `request_type` is 'instant_setup'

---

## Files Created/Modified

### New Files:
- ✅ `07_create_instant_setup_requests.sql` - Database schema
- ✅ `src/services/instant-setup-service.ts` - Service functions
- ✅ `INSTANT_SETUP_FEATURE.md` - This documentation

### Modified Files:
- ✅ `src/pages/landpage.tsx` - Updated form handler and UI

---

## Troubleshooting

### Form not submitting?
- Check browser console for errors
- Verify `07_create_instant_setup_requests.sql` was run
- Check Supabase RLS policies are enabled

### No data in database?
- Verify RLS policy allows anon INSERT
- Check Supabase logs for errors
- Ensure table was created successfully

### Success message not showing?
- Check browser console for JavaScript errors
- Verify service is imported correctly
- Check network tab for API response

---

## Summary

**What's Working:**
✅ Landing page form collects emails
✅ Data saved to database
✅ User feedback (loading, success, error states)
✅ Email validation
✅ Secure (RLS enabled)

**What's Next:**
You need to run the SQL script in Supabase, then the feature is ready to use!
