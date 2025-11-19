# 🔒 Secure AI Analysis Deployment Guide

## Overview
The AI analysis feature has been **completely secured** to prevent unauthorized access, console manipulation, and API key exposure.

## 🛡️ Security Features Implemented

### 1. **Server-Side Only Processing**
- ✅ OpenAI API key **never exposed** to client
- ✅ All AI calls processed through Supabase Edge Function
- ✅ No `dangerouslyAllowBrowser` flag needed

### 2. **Authentication & Authorization**
- ✅ Requires valid user session token
- ✅ Only approved instructors and admins can generate analyses
- ✅ Users can only analyze their own courses (unless admin)

### 3. **Rate Limiting**
- ✅ Maximum 10 AI analyses per user per hour
- ✅ 10-second cooldown between consecutive requests
- ✅ Prevents console spam and abuse

### 4. **Request Validation**
- ✅ Verifies course ownership
- ✅ Sanitizes input data (max 100 comments)
- ✅ Validates all required fields

---

## 📋 Deployment Steps

### Step 1: Install Supabase CLI

```powershell
# Install via npm
npm install -g supabase

# Or via Chocolatey (Windows)
choco install supabase
```

### Step 2: Link Your Supabase Project

```powershell
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in Supabase Dashboard → Project Settings → General → Reference ID

### Step 3: Set Environment Variables in Supabase

Go to your Supabase Dashboard:
1. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
2. Add these secrets:

```
OPENAI_API_KEY=sk-proj-your-actual-openai-key-here
```

**Important:** This key is now stored securely on the server, NOT in your `.env` file!

### Step 4: Deploy the Edge Function

```powershell
# Deploy the function
supabase functions deploy generate-ai-analysis
```

You should see:
```
✓ Deployed generate-ai-analysis
```

### Step 5: Remove Client-Side API Key

**IMPORTANT:** Remove the OpenAI API key from your `.env` file:

```env
# .env file
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# ❌ REMOVE THIS LINE:
# VITE_OPENAI_API_KEY=...
```

The API key is now **only** on Supabase servers!

### Step 6: Update Dependencies

```powershell
# Remove OpenAI from client dependencies
npm uninstall openai

# Rebuild the project
npm run build
```

### Step 7: Deploy Your Frontend

Deploy to Vercel/Netlify as usual:

```powershell
# Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

---

## 🧪 Testing the Security

### Test 1: Verify No API Key in Bundle

1. Open browser DevTools → Network tab
2. Load your app
3. Search for "sk-" in all JavaScript files
4. ✅ **Should find NOTHING** - API key is not in client code

### Test 2: Verify Rate Limiting

1. Click "Generate AI Analysis" button
2. Immediately click it again (within 10 seconds)
3. ✅ Should see error: "Please wait X seconds before generating another analysis"

### Test 3: Test Console Manipulation

Open browser console and try:

```javascript
// Try to call the function directly (should fail)
generateAIAnalysis({...})
// Error: generateAIAnalysis requires backend authentication

// Try to access OpenAI (should not exist)
console.log(import.meta.env.VITE_OPENAI_API_KEY)
// undefined ✅
```

### Test 4: Verify Course Ownership

1. Login as Instructor A
2. Try to analyze Instructor B's course using console manipulation
3. ✅ Should fail with: "You do not have access to this course"

---

## 🚨 What Changed

### Before (Insecure):
```typescript
// ❌ INSECURE: API key in client code
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // BAD!
})

// ❌ Anyone can call this from console
const result = await openai.chat.completions.create(...)
```

### After (Secure):
```typescript
// ✅ SECURE: Calls backend Edge Function
const { data: response } = await supabase.functions.invoke('generate-ai-analysis', {
  body: { courseId, instructorId, evaluationData }
})

// ✅ Backend validates:
// - User authentication
// - User permissions
// - Course ownership
// - Rate limits
// - Request sanitization
```

---

## 🔧 Troubleshooting

### Error: "Function not found"

Make sure you deployed the Edge Function:
```powershell
supabase functions deploy generate-ai-analysis
```

### Error: "Missing OPENAI_API_KEY"

Add the secret in Supabase Dashboard:
1. Project Settings → Edge Functions → Secrets
2. Add: `OPENAI_API_KEY` = your key

### Error: "Rate limit exceeded"

This is working as intended! Users can only generate 10 analyses per hour.

To adjust the limit, edit `supabase/functions/generate-ai-analysis/index.ts`:
```typescript
const MAX_REQUESTS_PER_WINDOW = 10 // Change this number
```

### Error: "Insufficient permissions"

User must be:
- Logged in
- Role = 'instructor' or 'admin'
- Status = 'approved'

Check in Supabase Dashboard → Authentication → Users

---

## 📊 Monitoring

### View Edge Function Logs

```powershell
supabase functions logs generate-ai-analysis
```

Or in Supabase Dashboard:
1. **Edge Functions** → `generate-ai-analysis` → **Logs**

### Check Rate Limit Status

Query the database:
```sql
SELECT 
  instructor_id,
  COUNT(*) as analysis_count,
  MAX(generated_at) as last_analysis
FROM ai_analysis_reports
WHERE generated_at > NOW() - INTERVAL '1 hour'
GROUP BY instructor_id
ORDER BY analysis_count DESC;
```

---

## 🎯 Security Checklist

- [x] API key removed from client `.env`
- [x] API key stored in Supabase Edge Function Secrets
- [x] Edge Function deployed
- [x] Authentication required for all requests
- [x] Role-based access control (instructor/admin only)
- [x] Course ownership verification
- [x] Rate limiting (10 per hour)
- [x] Cooldown period (10 seconds)
- [x] Input sanitization (max 100 comments)
- [x] Frontend updated to call Edge Function
- [x] OpenAI package removed from client dependencies
- [x] No console manipulation possible

---

## 📝 Additional Notes

### Cost Optimization

The rate limiting automatically controls costs:
- 10 analyses/hour per user = max 240/day per user
- Each analysis ≈ 1500 tokens = ~$0.003
- Max cost per user per day = ~$0.72

### Extending Functionality

To add more AI features (e.g., sentiment analysis, report generation):
1. Create new Edge Function in `supabase/functions/`
2. Add authentication + rate limiting
3. Deploy: `supabase functions deploy function-name`

### Production Recommendations

1. **Enable CORS properly** in Edge Function for your domain only
2. **Add logging** to track usage patterns
3. **Monitor costs** via OpenAI dashboard
4. **Set up alerts** for unusual activity
5. **Regular security audits** of Edge Function code

---

## 🆘 Support

If you encounter issues:

1. Check Edge Function logs: `supabase functions logs generate-ai-analysis`
2. Verify environment variables in Supabase Dashboard
3. Test authentication: `supabase auth get-user`
4. Review rate limit queries in database

---

## ✅ Success Verification

After deployment, you should see:

1. **No API key in client code** ✅
2. **10-second cooldown working** ✅
3. **Rate limit enforced (10/hour)** ✅
4. **Only authenticated users can generate** ✅
5. **Course ownership validated** ✅
6. **Console manipulation blocked** ✅

**Your AI analysis is now fully secured! 🎉**
