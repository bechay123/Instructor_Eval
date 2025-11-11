# Fix Blocked Push - Secret Detected

## ⚠️ Problem

GitHub detected an **OpenAI API key** in your `.env.example` file and blocked the push to protect your secret.

---

## ✅ Solution: Remove the Secret from Git History

### Step 1: Update .env.example with Placeholders

Open `.env.example` and replace it with:

```bash
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 2: Remove the File from Git and Re-add It

Run these commands in PowerShell:

```powershell
# Remove the file from Git's index (not from disk)
git rm --cached .env.example

# Add the file back with the new placeholder content
git add .env.example

# Commit the change
git commit -m "Fix: Remove exposed API key from .env.example"

# Push to main branch
git push -u origin main
```

---

## 🔐 Important: Rotate Your API Key

Since the API key was exposed in the commit, you should **rotate (replace) it immediately**:

### Rotate OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Find the exposed key (the one that starts with `sk-proj-uCyGRuD0sWYvIWiXGTbG...`)
3. Click **"Delete"** or **"Revoke"** to disable it
4. Click **"Create new secret key"**
5. Copy the new key
6. Update your **local `.env` file** with the new key:
   ```bash
   VITE_OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
   ```
7. Update the key in **Vercel dashboard** (if deployed):
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings → Environment Variables**
   - Edit `VITE_OPENAI_API_KEY` and paste the new key
   - Redeploy

---

## 🚨 If the Above Doesn't Work

If Git still blocks the push because the secret is in the **commit history**, you need to remove it from history:

### Option 1: Create a Fresh Commit (Easiest)

```powershell
# Undo the last commit but keep changes
git reset --soft HEAD~1

# Now fix .env.example (replace with placeholders)
# Then commit again
git add .env.example
git commit -m "Fix: Remove exposed API key from .env.example"
git push -u origin main
```

### Option 2: Use BFG Repo-Cleaner (Advanced)

If the secret is in multiple commits:

1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
2. Run:
   ```powershell
   java -jar bfg.jar --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push -u origin main --force
   ```

---

## ✅ Verify the Fix

After pushing successfully:

1. Go to your GitHub repository
2. Check `.env.example` - it should only have placeholders
3. Verify your local `.env` file still has the real keys (for local development)

---

## 📋 Checklist

- [ ] Updated `.env.example` with placeholders only
- [ ] Removed `.env.example` from Git cache and re-added it
- [ ] Committed and pushed successfully
- [ ] Rotated the exposed OpenAI API key
- [ ] Updated the new key in local `.env` file
- [ ] Updated the new key in Vercel/hosting dashboard (if deployed)

---

## 🎯 Prevention

To prevent this in the future:

1. **Never** put real keys in `.env.example`
2. `.env.example` should always have placeholders like `your_key_here`
3. Real keys should only be in `.env` (which is in `.gitignore`)
4. Use environment variables in deployment platforms (Vercel/Netlify)

---

Need help? Check `DEPLOYMENT_GUIDE.md` for more information on API key security! 🚀
