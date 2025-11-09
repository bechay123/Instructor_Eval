# 🚀 Quick Start Guide - AI Analysis

Get the AI Analysis feature up and running in 5 minutes!

## Step 1: Get Your OpenAI API Key

1. Visit https://platform.openai.com/
2. Sign in or create an account
3. Go to **API Keys** section (https://platform.openai.com/api-keys)
4. Click **"+ Create new secret key"**
5. Give it a name (e.g., "Instructor Eval AI")
6. Copy the key (starts with `sk-proj-...`)

**Important**: Save this key somewhere safe - you won't be able to see it again!

## Step 2: Add the API Key

1. Open the `.env` file in your project root
2. Replace `your_openai_api_key_here` with your actual key:

```env
VITE_OPENAI_API_KEY=sk-proj-your_actual_key_here
```

3. Save the file

## Step 3: Restart Your Server

If the dev server is running, restart it:

**Press `Ctrl + C` in your terminal, then:**

```bash
npm run dev
```

## Step 4: Test It Out!

1. **Log in** as an instructor
2. **Select a course** that has student evaluations
3. Click the **"AI Analysis"** tab
4. Click **"Generate Analysis"**
5. Wait a few seconds ⏳
6. View your AI-powered insights! 🎉

## What You'll See

### Executive Summary
A brief 2-3 sentence overview of your teaching performance

### Sentiment Analysis
Visual indicators showing if feedback is:
- 👍 Positive (green)
- ⚠️ Neutral (yellow)
- 👎 Negative (red)

### Key Strengths
What you're doing well! ✓

### Areas for Improvement
Constructive feedback to help you grow →

### Recommendations
Specific, actionable steps you can take 💡

### Key Themes
Common topics mentioned across feedback 🏷️

## Troubleshooting

### "Failed to generate AI analysis"

**Fix**: 
1. Check your API key in `.env` is correct
2. Verify you have credits in your OpenAI account
3. Check https://platform.openai.com/usage

### "No evaluation data available"

**Fix**: Make sure students have submitted evaluations for the selected course

### Analysis taking too long?

**Normal**: First analysis may take 10-30 seconds depending on:
- Number of evaluations
- Length of student comments
- OpenAI API response time

## Cost Tracking

Monitor your usage at: https://platform.openai.com/usage

Each analysis typically costs **$0.01 - $0.05**

## Need Help?

See the full guide: [AI_ANALYSIS_GUIDE.md](./AI_ANALYSIS_GUIDE.md)

---

**You're all set!** 🎊 Enjoy AI-powered insights into your teaching!
