# Deploy to Vercel - Simple Step-by-Step Guide

## The Easiest Way: Use Vercel API Routes (Option 3)

This puts your backend INSIDE your frontend as API routes. No separate backend deployment needed!

## ⚠️ CRITICAL: Environment Variables

**You MUST add these in Vercel BEFORE deploying:**

1. Go to Vercel Dashboard
2. Click your project (or create new project)
3. Go to **Settings** → **Environment Variables**
4. Add these **THREE** variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT:**
- Add these for **ALL environments**: Production, Preview, AND Development
- Get these from: Supabase Dashboard → Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` is the "service_role" key (keep it secret!)
- Click "Save" after adding each one

## Step 1: Files Are Already Created! ✅

I've already created the API route files for you:

- ✅ `frontend/src/app/api/availability/slots/route.js`
- ✅ `frontend/src/app/api/bookings/route.js`
- ✅ Updated `frontend/src/lib/api.ts` to use relative URLs

## Step 2: Deploy to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Vercel API routes"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. **Root Directory:** Select `frontend` folder ⚠️ IMPORTANT!
4. Click "Deploy"

### 3. Add Environment Variables (DO THIS FIRST!)

**Before or during deployment, add these in Vercel:**

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add these THREE variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. For each variable:
   - Click "Add New"
   - Enter the name
   - Enter the value
   - Select all environments (Production, Preview, Development)
   - Click "Save"

### 4. Redeploy (If Already Deployed)

If you already deployed without environment variables:

1. Go to **Deployments** tab
2. Click the "..." on the latest deployment
3. Click "Redeploy"
4. Wait for it to complete

## Step 3: Verify Deployment

### 1. Test API Endpoints

Visit these URLs in your browser (replace with your Vercel URL):

```
https://your-app.vercel.app/api/availability/slots
https://your-app.vercel.app/api/bookings
```

Should return JSON like:
```json
{"success":true,"slots":[]}
```

### 2. Test the App

1. Visit your main URL: `https://your-app.vercel.app`
2. Open browser console (F12)
3. Try to book a session
4. Check console for any errors

### 3. Check Vercel Logs

If something isn't working:

1. Go to Vercel Dashboard
2. Click your project
3. Go to **Deployments**
4. Click on latest deployment
5. Click **"View Function Logs"**
6. Look for errors in red

## 🔧 Troubleshooting

### Error: "supabaseKey is required"

**This means environment variables are missing!**

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Make sure ALL THREE variables are added:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Make sure they're added for ALL environments
4. Redeploy the project

### Error: "Database error"

**Solution:**
1. Check Supabase credentials are correct
2. Verify you ran the schema SQL in Supabase SQL Editor
3. Check Supabase dashboard for any errors

### Error: "Route not found"

**Solution:**
1. Make sure API files are in correct location:
   - `frontend/src/app/api/availability/slots/route.js`
   - `frontend/src/app/api/bookings/route.js`
2. Redeploy after adding files

### Error: "Failed to fetch"

**Solution:**
1. Check browser console (F12) for CORS errors
2. With API routes, CORS shouldn't be an issue
3. Make sure you redeployed after adding environment variables

## 📋 Complete Checklist

Before deploying, make sure:

- [ ] Created Supabase project
- [ ] Ran `backend/supabase-schema.sql` in Supabase SQL Editor
- [ ] Got 3 credentials from Supabase (URL, anon key, service role key)
- [ ] Pushed code to GitHub
- [ ] Created Vercel project with Root Directory = `frontend`
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` in Vercel
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` in Vercel
- [ ] Added all 3 variables for ALL environments
- [ ] Redeployed after adding variables
- [ ] Tested API endpoints in browser

## 🎯 Quick Test

After deployment, test this in your browser:

```
https://your-app.vercel.app/api/availability/slots
```

Should return:
```json
{"success":true,"slots":[]}
```

If you see this, everything is working! ✅

If you see an error, check:
1. Vercel Function Logs
2. Environment variables are set
3. Supabase schema was run

## 📞 Still Not Working?

Check these in order:

1. **Vercel Function Logs** - Shows exact error messages
2. **Environment Variables** - Make sure all 3 are added
3. **Supabase Schema** - Make sure you ran the SQL
4. **Browser Console** - Press F12 to see errors

Common mistake: Forgetting to add environment variables for ALL environments (Production, Preview, Development).

---

**Remember:** The API routes are already created. You just need to:
1. Add environment variables in Vercel
2. Deploy/Redeploy
3. Test!