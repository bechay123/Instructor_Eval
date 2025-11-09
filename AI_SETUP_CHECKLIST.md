# ✅ AI Analysis Setup Checklist

Use this checklist to ensure everything is configured correctly.

## Pre-Setup

- [ ] I have Node.js installed (v18+)
- [ ] I have an OpenAI account
- [ ] I have access to a payment method for OpenAI (required for API access)
- [ ] The application is running locally (`npm run dev`)

## OpenAI Account Setup

- [ ] Created/logged into OpenAI account at https://platform.openai.com/
- [ ] Added payment method at https://platform.openai.com/account/billing/overview
- [ ] Set up usage limits (recommended: $10-20/month for testing)
- [ ] Generated API key at https://platform.openai.com/api-keys
- [ ] Saved API key securely (starts with `sk-proj-...`)

## Environment Configuration

- [ ] Located `.env` file in project root
- [ ] Opened `.env` file in text editor
- [ ] Replaced `your_openai_api_key_here` with actual API key
- [ ] Verified no extra spaces around the API key
- [ ] Saved the `.env` file
- [ ] `.env` file is listed in `.gitignore` (should be by default)

Example of correct `.env` file:
```env
VITE_OPENAI_API_KEY=sk-proj-abcd1234efgh5678ijkl9012mnop3456
```

## Development Server

- [ ] Stopped dev server if running (Ctrl+C)
- [ ] Restarted dev server: `npm run dev`
- [ ] Server started without errors
- [ ] Application opened in browser

## Database Setup

- [ ] Database has at least one instructor account
- [ ] Database has at least one course
- [ ] Course has enrolled students
- [ ] Students have submitted evaluations
- [ ] Evaluations include both ratings AND comments

## Testing the Feature

### Step 1: Login
- [ ] Logged in as instructor
- [ ] Successfully reached instructor dashboard

### Step 2: Navigate
- [ ] Selected a course from dropdown
- [ ] Course has submitted evaluations (check "Total Evaluations" card)
- [ ] Clicked on "AI Analysis" tab

### Step 3: Generate
- [ ] "Generate Analysis" button is visible
- [ ] Button is NOT disabled (if disabled, check evaluations exist)
- [ ] Clicked "Generate Analysis"

### Step 4: Verify Loading
- [ ] Loading spinner appeared
- [ ] Message "Analyzing evaluation data..." shown
- [ ] No errors in browser console (F12 → Console tab)

### Step 5: Verify Results
- [ ] Analysis loaded successfully (within 30 seconds)
- [ ] Executive Summary is displayed
- [ ] Sentiment Analysis cards show (4 cards)
- [ ] Key Strengths section shows (green)
- [ ] Areas for Improvement section shows (orange)
- [ ] Recommendations section shows (blue)
- [ ] Key Themes section shows (purple)

### Step 6: Regenerate Test
- [ ] "Regenerate" button visible after first analysis
- [ ] Clicked "Regenerate"
- [ ] New analysis generated successfully
- [ ] Content may differ slightly from first analysis

## Error Testing

### Test No Evaluations
- [ ] Selected a course with NO evaluations
- [ ] Tried to generate analysis
- [ ] Error message shown: "No evaluation data available to analyze."

### Test Invalid API Key (Optional)
- [ ] Temporarily changed API key in `.env` to invalid value
- [ ] Restarted server
- [ ] Tried to generate analysis
- [ ] Error shown with retry button
- [ ] Restored correct API key
- [ ] Restarted server
- [ ] Analysis works again

## Cost Tracking

- [ ] Checked OpenAI usage at https://platform.openai.com/usage
- [ ] Verified charges appear (should be ~$0.01-0.05 per analysis)
- [ ] Usage is within expected limits

## Browser Compatibility

Test in your primary browser:
- [ ] Chrome/Edge (recommended)
- [ ] Firefox
- [ ] Safari

## Mobile Responsive (Optional)

- [ ] Opened in mobile view (F12 → Toggle device toolbar)
- [ ] Layout looks good on mobile
- [ ] All sections readable
- [ ] Buttons accessible

## Documentation Review

- [ ] Read QUICKSTART_AI.md
- [ ] Bookmarked AI_ANALYSIS_GUIDE.md for future reference
- [ ] Understand the cost implications
- [ ] Aware of security warnings for production

## Production Readiness (Before Deploying)

⚠️ **DO NOT deploy to production without addressing these:**

- [ ] Read security section in AI_ANALYSIS_GUIDE.md
- [ ] Plan to move OpenAI calls to backend
- [ ] Set up rate limiting
- [ ] Configure usage quotas per instructor
- [ ] Review data privacy compliance
- [ ] Test with institution's privacy policies
- [ ] Set up monitoring/alerting for costs

## Troubleshooting Reference

If something doesn't work, check:

1. **Browser Console** (F12 → Console)
   - Look for red error messages
   - Note any API errors

2. **Network Tab** (F12 → Network)
   - Check for failed requests
   - Look for 401/403 errors (auth issues)

3. **Environment Variables**
   - Verify `.env` file exists
   - Check API key format
   - No extra quotes or spaces

4. **OpenAI Account**
   - Verify billing is set up
   - Check usage limits not exceeded
   - Confirm API key is active

5. **Evaluation Data**
   - Ensure evaluations are "submitted" status
   - Check ratings exist (not all null)
   - Verify comments are present

## Success! 🎉

If all checks pass:
- ✅ AI Analysis is fully functional
- ✅ Ready for instructor use (development)
- ✅ Can generate insights from evaluations

## Next Steps

1. **Share with instructors**
   - Send them QUICKSTART_AI.md
   - Train them on interpreting AI insights
   - Set expectations about AI limitations

2. **Monitor usage**
   - Check OpenAI dashboard weekly
   - Review costs and usage patterns
   - Adjust limits if needed

3. **Gather feedback**
   - Ask instructors about usefulness
   - Note any confusing insights
   - Collect suggestions for improvements

4. **Plan for production**
   - Review AI_ANALYSIS_GUIDE.md security section
   - Plan backend API implementation
   - Set up caching strategy

---

**Completed Date**: _______________

**Tested By**: _______________

**Notes**:
_____________________________________
_____________________________________
_____________________________________
