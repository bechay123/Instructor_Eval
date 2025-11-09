# Supabase Configuration for Testing

## Disable Email Confirmation (Important for Testing)

Since RLS is already disabled and you're testing, you need to also disable email confirmation:

### Steps:

1. **Go to Supabase Dashboard**

   - Navigate to: https://supabase.com/dashboard/project/rkcwfdnmkxipjjhfbyhm

2. **Disable Email Confirmation**

   - Go to **Authentication** → **Providers** → **Email**
   - Find **"Confirm email"** setting
   - **TOGGLE IT OFF** (disable it)
   - Click **Save**

3. **Enable Auto-confirm users (Alternative)**

   - If the above doesn't work, go to **Authentication** → **Settings**
   - Find **"Enable email confirmations"**
   - **Turn it OFF**

4. **Check Auth Settings**
   - Go to **Authentication** → **Settings** → **Auth Settings**
   - Make sure:
     - ✅ **Enable email confirmations**: OFF
     - ✅ **Enable email change confirmations**: OFF (optional for testing)
     - ✅ **Enable phone confirmations**: OFF

## Current Issues & Fixes

### Issue: Profile not inserted after signup

**Possible Causes:**

1. ❌ Email confirmation required (users stuck in unconfirmed state)
2. ❌ RLS policies blocking inserts (you mentioned it's disabled, but double-check)
3. ❌ Foreign key constraint on auth.users

**Updated Code Changes:**

- ✅ Added detailed console logging throughout registration flow
- ✅ Changed status to "approved" for all users during testing
- ✅ Added `.select()` to verify insert success
- ✅ Increased wait time to 1.5 seconds for auth completion
- ✅ Added user metadata to auth.signUp

## Testing Registration

After disabling email confirmation:

1. Open browser console (F12)
2. Try registering a new user
3. Watch console logs for:

   - "Starting registration process..."
   - "User created with ID: ..."
   - "Profile data to insert: ..."
   - "Profile created successfully!"

4. Check Supabase Table Editor:
   - Go to **Table Editor** → **profiles**
   - Verify new row was inserted
   - Check **student_details** or **instructor_details** table

## Verify RLS is Actually Disabled

1. Go to **Table Editor** → **profiles**
2. Click on the table name
3. Look at the **Policies** tab
4. Make sure it says **"RLS is disabled"** at the top
5. If there are any policies listed, delete them
6. If RLS is enabled, click **"Disable RLS"**

Do the same for:

- student_details
- instructor_details
- Any other tables you're using

## Database Check

Run this query in **SQL Editor** to see if users are being created:

```sql
-- Check auth users
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Check profiles
SELECT id, email, first_name, last_name, role, status, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- Check for orphaned auth users (users without profiles)
SELECT u.id, u.email, u.created_at as auth_created, p.id as has_profile
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;
```

## Clean Up Test Users (Optional)

If you have orphaned users, you can delete them:

```sql
-- WARNING: This deletes users! Only for testing!
-- Delete auth users that don't have profiles
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

## Next Steps

1. ✅ Disable email confirmation in Supabase Dashboard
2. ✅ Verify RLS is disabled on all tables
3. ✅ Test registration with browser console open
4. ✅ Check logs for any errors
5. ✅ Verify data appears in Table Editor

If issues persist, share:

- Browser console logs
- Supabase error logs (Authentication → Logs)
- Screenshot of Table Editor after registration attempt
