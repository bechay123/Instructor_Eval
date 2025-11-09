# Deployment Guide - Keeping Your API Keys Safe

## 🚨 IMPORTANT: API Key Security

Your OpenAI API key and Supabase credentials are **sensitive** and should **NEVER** be pushed to GitHub or any public repository.

---

## ✅ What's Already Protected

Your `.gitignore` file already includes:
```
.env
.env.local
.env.*.local
```

This means your `.env` file (which contains your real API keys) will **NOT** be uploaded to GitHub.

---

## 📋 Before You Push to GitHub

### Step 1: Initialize Git Repository (if not done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Verify .env is NOT being tracked

```bash
git status
```

You should **NOT** see `.env` in the list of files to be committed. If you do see it, run:

```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 🔧 How to Make It Work for Others (or on Other Machines)

### Option 1: Using Environment Variables (Recommended for Production)

When deploying to services like **Vercel**, **Netlify**, or **Render**:

1. Go to your hosting platform's dashboard
2. Find "Environment Variables" or "Settings"
3. Add these variables:
   - `VITE_OPENAI_API_KEY` = your OpenAI API key
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

### Option 2: For Other Developers/Team Members

1. Share the `.env.example` file (which has placeholder values)
2. Each team member should:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Or on Windows:
   copy .env.example .env
   ```
3. Then they fill in their own API keys in the `.env` file

---

## 🌐 Deployment Options

### Option A: Deploy to Vercel (Easiest)

1. Push your code to GitHub (without .env)
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `VITE_OPENAI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

**✅ Your AI will work because Vercel uses the environment variables you set in their dashboard.**

### Option B: Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Go to Site settings → Environment variables
5. Add your three variables
6. Deploy!

### Option C: Deploy to Your Own Server

1. Copy your project to the server
2. Create a `.env` file on the server with your real keys
3. Build the project:
   ```bash
   npm run build
   ```
4. Serve the `dist` folder with nginx or apache

---

## 🔐 Best Practices

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use `.env.example` with placeholder values
- Add real API keys in hosting platform's environment variables
- Rotate your API keys if they're ever exposed

### ❌ DON'T:
- Commit `.env` to git
- Share API keys in chat/email
- Hardcode API keys in source code
- Push `.env` to GitHub

---

## 🚨 If Your API Key Was Exposed

**IMMEDIATELY:**

1. **Revoke the exposed key:**
   - OpenAI: Go to https://platform.openai.com/api-keys
   - Click on the exposed key and delete it

2. **Generate a new key:**
   - Create a new API key
   - Update your `.env` file with the new key

3. **Update your deployment:**
   - Update environment variables in Vercel/Netlify
   - Redeploy your application

---

## 📝 Quick Checklist Before Pushing

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has only placeholder values (no real keys)
- [ ] Run `git status` and confirm `.env` is not listed
- [ ] Environment variables are documented in this guide
- [ ] You know how to add environment variables in your hosting platform

---

## 🎯 Summary: How Your AI Works After Deployment

1. **Local Development:** Uses `.env` file (not pushed to GitHub)
2. **Production (Vercel/Netlify):** Uses environment variables from hosting dashboard
3. **Other Developers:** Copy `.env.example` to `.env` and add their own keys

**Your AI will work perfectly as long as environment variables are set in your hosting platform!** 🚀
