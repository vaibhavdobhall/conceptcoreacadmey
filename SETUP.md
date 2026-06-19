# ConceptCore Academy - Quick Setup Guide (Vercel Deployment)

This guide will help you set up and deploy the ConceptCore Academy tutoring platform **entirely on Vercel** (no Railway needed).

## 📋 Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- A **Supabase** account - [Sign up free](https://supabase.com/)
- A **Vercel** account - [Sign up free](https://vercel.com/)

## 🗂️ Important: About .env Files and GitHub

### ❌ DO NOT commit .env files to GitHub
- `.env` and `.env.local` are in `.gitignore` 
- They contain sensitive credentials (API keys, passwords)
- **Never push these files to GitHub**

### ✅ What to commit
- `.env.example` files are templates - **safe to commit**
- They show what variables are needed without actual values

### ✅ Where to add your actual values
You have **two options**:

**Option A: Add in Vercel Dashboard (Recommended for Production)**
- Add environment variables in Vercel project settings
- Vercel injects them at runtime
- No .env file needed in production

**Option B: Add locally for development**
- Create `.env` (backend) and `.env.local` (frontend) on your computer
- These are only for local development
- Still add the same variables in Vercel for production

## 🚀 Option 1: Deploy Directly to Vercel (Easiest)

This option deploys both frontend and backend to Vercel. The backend runs as Vercel Serverless Functions.

### Step 1: Prepare Your Repository

```bash
# Clone the repository
git clone https://github.com/vaibhavdobhall/conceptcoreacadmey.git
cd conceptcoreacadmey
```

### Step 2: Set Up Supabase Database

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and sign up/login
   - Click "New Project"
   - Enter project name: `conceptcore-academy`
   - Set a strong database password
   - Select a region close to you
   - Click "Create new project"

2. **Get Your API Credentials**
   - Go to **Project Settings** → **API**
   - Copy these three values:
     - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
     - **anon/public** key
     - **service_role** key (keep this secret!)

3. **Run the Database Schema**
   - Go to **SQL Editor** in Supabase
   - Click "New query"
   - Copy all SQL from `backend/supabase-schema.sql`
   - Paste and click "Run"
   - You should see "Success. No rows returned"

### Step 3: Deploy Backend to Vercel

We'll deploy the backend as a Vercel Serverless Function.

1. **Create a new folder for Vercel backend**
   ```bash
   mkdir -p api
   ```

2. **Copy backend files to api folder**
   ```bash
   cp -r backend/src api/
   cp backend/package.json api/
   cp backend/.env.example api/.env.example
   ```

3. **Create `api/vercel.json`**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/server.js"
       }
     ]
   }
   ```

4. **Update `api/package.json`**
   - Make sure it has the correct "main" entry point:
   ```json
   {
     "name": "conceptcore-backend",
     "version": "1.0.0",
     "main": "src/server.js",
     ...
   }
   ```

5. **Deploy to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - **Root Directory:** Select `api` folder
   - Click "Deploy"

6. **Add Environment Variables in Vercel**
   - During deployment or in Project Settings → Environment Variables:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=production
   PORT=3001
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
   
   **Important:** Add these for all environments (Production, Preview, Development)

7. **Get Your Backend URL**
   - After deployment, Vercel gives you a URL like: `https://conceptcore-api.vercel.app`
   - Copy this URL!

### Step 4: Deploy Frontend to Vercel

1. **Deploy Frontend**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the **same repository**
   - **Root Directory:** Select `frontend` folder
   - Click "Deploy"

2. **Add Environment Variables in Vercel**
   - In Project Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=https://conceptcore-api.vercel.app
   ```
   
   **Important:** Replace the API_URL with your actual backend URL from Step 3

3. **Update Backend CORS**
   - Go back to your backend Vercel project
   - Update `ALLOWED_ORIGINS` to include your frontend URL
   - Redeploy the backend

### Step 5: Test Your Deployment

1. **Visit your frontend URL** (e.g., `https://conceptcore-academy.vercel.app`)
2. **Test the booking flow:**
   - Select a date
   - Choose a time slot
   - Fill in your details
   - Submit booking
3. **Access educator dashboard** at: `https://your-frontend.vercel.app/admin/dashboard`

## 🚀 Option 2: Deploy Backend Separately (Alternative)

If you prefer to keep backend and frontend as separate Vercel projects:

### Backend Deployment

1. **Create a separate GitHub repository** for backend only
   ```bash
   # In the backend folder
   git init
   git add .
   git commit -m "Initial backend commit"
   # Push to new GitHub repo
   ```

2. **Deploy to Vercel**
   - Import the backend repository
   - Root Directory: `backend`
   - Add environment variables
   - Deploy

3. **Note the backend URL**

### Frontend Deployment

Same as Option 1, Step 4, but use the backend URL from above.

## 🚀 Option 3: Deploy Backend as API Routes (Recommended)

This is the cleanest approach - backend lives inside the frontend as API routes.

### Step 1: Restructure for Vercel

1. **Create API routes in frontend**
   ```bash
   cd frontend/src/app
   mkdir -p api/availability/api/availability/slots
   mkdir -p api/bookings
   ```

2. **Move backend route files**
   - Copy `backend/src/routes/availability.js` to `frontend/src/app/api/availability/[...path]/route.js`
   - Copy `backend/src/routes/bookings.js` to `frontend/src/app/api/bookings/[...path]/route.js`
   - Copy `backend/src/middleware/validation.js` to `frontend/src/app/api/middleware/validation.js`
   - Copy `backend/src/config/supabase.js` to `frontend/src/app/api/config/supabase.js`

3. **Convert to Vercel API format**
   - Each route file needs to export `GET`, `POST`, etc. functions
   - Example structure:
   ```javascript
   // frontend/src/app/api/availability/slots/route.js
   import { NextResponse } from 'next/server';
   import { supabaseAdmin } from '../config/supabase';
   
   export async function GET(request) {
     const { searchParams } = new URL(request.url);
     // Your logic here
     const { data } = await supabaseAdmin.from('availability_slots').select('*');
     return NextResponse.json({ success: true, slots: data });
   }
   ```

4. **Update frontend API calls**
   - Change `NEXT_PUBLIC_API_URL` to use relative paths:
   ```typescript
   // frontend/src/lib/api.ts
   const API_URL = ''; // Empty = same origin
   // Or use: const API_URL = '/api';
   ```

5. **Deploy to Vercel**
   - Just deploy the frontend folder
   - All API routes are automatically deployed
   - Add environment variables in Vercel

**This option is the cleanest** - one deployment, one repository, no CORS issues!

## 📝 Environment Variables - Complete Guide

### Where to Add Them

#### For Local Development
Create these files on your computer (they won't be pushed to GitHub):

**Backend (`backend/.env`):**
```env
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### For Production (Vercel)
Add these in Vercel Dashboard → Project Settings → Environment Variables:

**Backend Project:**
```
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Frontend Project:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

### Important Notes

1. **Never commit .env files** - They're in .gitignore for security
2. **Vercel overrides local .env** - Production uses Vercel's environment variables
3. **Redeploy after adding env vars** - Changes take effect on next deployment
4. **Use the same Supabase credentials** in both frontend and backend

## 🔧 Step-by-Step: Vercel-Only Deployment (Option 3 - Recommended)

This is the **easiest and cleanest** approach:

### 1. Prepare the API Routes

Create these files in your frontend:

**`frontend/src/app/api/availability/slots/route.js`**
```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = supabase
      .from('availability_slots')
      .select('*')
      .eq('is_booked', false)
      .gte('slot_date', new Date().toISOString().split('T')[0])
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (startDate) query = query.gte('slot_date', startDate);
    if (endDate) query = query.lte('slot_date', endDate);
    
    const { data: slots, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, slots: slots || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}
```

**`frontend/src/app/api/bookings/route.js`**
```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentName, studentEmail, studentPhone, subject, notes, slotId } = body;
    
    // Check if slot is available
    const { data: slot, error: slotError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('id', slotId)
      .eq('is_booked', false)
      .single();
    
    if (slotError || !slot) {
      return NextResponse.json(
        { error: 'Time slot is no longer available' },
        { status: 409 }
      );
    }
    
    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        student_name: studentName,
        student_email: studentEmail,
        student_phone: studentPhone,
        subject,
        notes,
        slot_id: slotId,
        status: 'confirmed'
      }])
      .select()
      .single();
    
    if (bookingError) throw bookingError;
    
    // Mark slot as booked
    await supabase
      .from('availability_slots')
      .update({ is_booked: true, booking_id: booking.id })
      .eq('id', slotId);
    
    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        availability_slots (
          slot_date,
          start_time,
          end_time
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, bookings: bookings || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
```

### 2. Update Frontend API Calls

**`frontend/src/lib/api.ts`** - Change the API_URL:
```typescript
// Use relative paths (same origin)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Or simply:
const API_URL = '';
```

### 3. Add Environment Variables in Vercel

When you deploy the frontend to Vercel, add these in Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Note:** `SUPABASE_SERVICE_ROLE_KEY` is needed for the API routes (server-side only, safe in Vercel)

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. **Root Directory:** `frontend`
5. Click "Deploy"
6. Add environment variables (from step 3)
7. Done! 🎉

## ✅ Verification Checklist

After deployment:

- [ ] Frontend loads at your Vercel URL
- [ ] Can see available time slots
- [ ] Can select a date and time
- [ ] Booking form submits successfully
- [ ] Confirmation screen appears
- [ ] Booking shows in educator dashboard at `/admin/dashboard`
- [ ] No CORS errors in browser console
- [ ] Backend API routes work (check Vercel logs)

## 🐛 Common Issues

### Issue: "Failed to load available time slots"
**Solution:** 
- **Check if backend is running:** If using Option 1 or 2, verify backend URL is correct
- **Check environment variables:** Make sure `NEXT_PUBLIC_API_URL` is set in Vercel
- **Check Supabase schema:** Verify you ran the SQL in Supabase SQL Editor
- **Check Vercel logs:** Look for errors in backend function logs
- **If using Option 3 (API routes):** Make sure API route files are in correct location

### Issue: "Booking fails"
**Solution:**
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Check that slot exists and is not already booked
- Review Vercel function logs

### Issue: "CORS error"
**Solution:**
- If using separate backend, update `ALLOWED_ORIGINS` to include your frontend URL
- If using API routes (Option 3), no CORS needed!

### Issue: "Educator dashboard visible to everyone"
**Solution:**
- The dashboard is now at `/admin/dashboard` (not on main page)
- For production, add authentication (see below)

## 🔐 Making Educator Dashboard Private (Optional)

Currently, anyone can access `/admin/dashboard`. To make it private:

### Option A: Simple Password Protection
Add a simple password check in `frontend/src/app/admin/dashboard/page.tsx`:
```typescript
'use client';
import { useState } from 'react';

export default function AdminDashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
        />
        <button onClick={() => password === 'your-password' && setAuthenticated(true)}>
          Login
        </button>
      </div>
    );
  }
  
  return <EducatorDashboard />;
}
```

### Option B: Use Vercel Password Protection
1. In Vercel dashboard, go to your project
2. Go to Settings → Deployment Protection
3. Enable "Password Protection"
4. Set a password - only people with the password can access the site

### Option C: Add Authentication (Production)
Use Supabase Auth or NextAuth.js for proper authentication.

## 🎯 Recommended Approach

**Use Option 3 (API Routes)** because:
- ✅ Single deployment (easier to manage)
- ✅ No CORS issues
- ✅ No separate backend hosting needed
- ✅ All in one repository
- ✅ Free tier covers most use cases
- ✅ Automatic scaling

## 📞 Need Help?

- Check Vercel logs: Project → Deployments → View Function Logs
- Check Supabase logs: Dashboard → Logs
- Review browser console for frontend errors
- Make sure you ran the Supabase schema SQL

---

**Ready to deploy?** Follow Option 3 for the simplest Vercel-only deployment!