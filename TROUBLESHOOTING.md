# ConceptCore Academy - Troubleshooting Guide

## Common Issues and Solutions

---

## Issue 1: "Failed to load available time slots"

### What's Happening:
The frontend can't connect to the backend API to fetch available time slots.

### Why This Happens:
- Backend server is not running
- Wrong API URL in environment variables
- Backend is running but on a different port
- Network/firewall issues

### How to Fix:

#### For Local Development:

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   You should see: `ConceptCore Academy Backend running on port 3001`

2. **Check frontend environment variables:**
   - Open `frontend/.env.local`
   - Verify it has: `NEXT_PUBLIC_API_URL=http://localhost:3001`
   - If missing, add it and restart the frontend

3. **Check backend environment variables:**
   - Open `backend/.env`
   - Verify it has your Supabase credentials
   - Make sure `PORT=3001`

4. **Test the backend directly:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"OK","timestamp":"..."}`

   ```bash
   curl http://localhost:3001/api/availability/slots
   ```
   Should return available slots (or empty array)

#### For Vercel Deployment:

1. **Check Vercel environment variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_API_URL` is set to your backend URL
   - Example: `https://conceptcore-api.vercel.app`

2. **Test backend URL directly:**
   - Visit: `https://your-backend-url.vercel.app/health`
   - Should return: `{"status":"OK"}`
   - If not, your backend isn't deployed correctly

3. **Check Vercel logs:**
   - Go to Vercel → Deployments
   - Click on latest deployment
   - Click "View Function Logs"
   - Look for errors

---

## Issue 2: "Failed to load bookings" (Educator Dashboard)

### What's Happening:
The educator dashboard can't fetch bookings from the backend.

### Why This Happens:
Same as Issue 1 - backend connection problem, OR the `/api/bookings` endpoint isn't working.

### How to Fix:

1. **Follow the same steps as Issue 1** to ensure backend is running

2. **Test the bookings endpoint directly:**
   ```bash
   # Local
   curl http://localhost:3001/api/bookings
   
   # Vercel
   curl https://your-backend-url.vercel.app/api/bookings
   ```
   
   Should return: `{"success":true,"bookings":[]}`

3. **Check if Supabase schema is set up:**
   - Go to Supabase → Table Editor
   - Verify `bookings` table exists
   - Verify `availability_slots` table exists

---

## Issue 3: `{"error":"Route not found"}`

### What's Happening:
You're visiting the root URL (`/`) of the backend server.

### Why This Happens:
**This is NORMAL!** The backend only has API routes under `/api/*`, not a root route.

### Explanation:
- Backend routes are:
  - `/api/availability/slots` ✅
  - `/api/availability/dates` ✅
  - `/api/bookings` ✅
  - `/health` ✅
  - `/` ❌ (doesn't exist - this is correct!)

### How to Test the Backend:

#### Option 1: Use the health endpoint
```bash
# Local
curl http://localhost:3001/health

# Vercel
curl https://your-backend-url.vercel.app/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Option 2: Use the API endpoints
```bash
# Get available slots
curl http://localhost:3001/api/availability/slots

# Get all bookings
curl http://localhost:3001/api/bookings
```

---

## Issue 4: Educator Dashboard Visible to Everyone

### What's Happening:
The educator dashboard is accessible to anyone who knows the URL.

### What I Fixed:
- Removed the dashboard from the main page
- Moved it to `/admin/dashboard` (separate route)
- Now it's only visible if someone manually visits `/admin/dashboard`

### How to Make It Private (Optional):

#### Option A: Vercel Password Protection (Easiest)
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Deployment Protection
4. Enable "Password Protection"
5. Set a password
6. Only people with the password can access the entire site

#### Option B: Simple Password in Code
See the code example in `SETUP.md` under "Making Educator Dashboard Private"

#### Option C: Proper Authentication (Production)
- Add Supabase Auth
- Or use NextAuth.js
- Create login page
- Protect `/admin/*` routes

---

## Issue 5: Supabase Schema Error - "relation does not exist"

### What's Happening:
You're trying to create tables in the wrong order, causing foreign key errors.

### Why This Happens:
The original schema had a circular dependency - both tables referenced each other.

### How to Fix:

1. **Delete existing tables** (if you created them):
   - Go to Supabase → Table Editor
   - Delete `bookings` and `availability_slots` tables

2. **Use the fixed schema:**
   - Open `backend/supabase-schema.sql`
   - Copy ALL the SQL
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify it worked:**
   - Go to Supabase → Table Editor
   - You should see both tables
   - The schema auto-generates sample time slots

---

## Issue 6: CORS Errors

### What's Happening:
Browser blocks requests due to CORS policy.

### Why This Happens:
Backend CORS settings don't allow your frontend domain.

### How to Fix:

#### For Local Development:
1. Open `backend/.env`
2. Make sure it has: `ALLOWED_ORIGINS=http://localhost:3000`
3. Restart backend

#### For Vercel (Separate Backend):
1. Go to Vercel → Backend Project → Settings → Environment Variables
2. Update `ALLOWED_ORIGINS` to include your frontend URL
3. Example: `ALLOWED_ORIGINS=https://conceptcore-academy.vercel.app`
4. Redeploy backend

#### For Vercel (API Routes - Option 3):
- **No CORS needed!** API routes are same origin as frontend.

---

## Issue 7: Slots Not Showing Up

### What's Happening:
The booking section shows "No available time slots"

### Why This Happens:
- No slots in the database
- All slots are booked
- Supabase schema wasn't run

### How to Fix:

1. **Check if schema was run:**
   - Go to Supabase → Table Editor
   - Check if `availability_slots` table exists
   - Check if it has any rows

2. **If empty, add sample slots:**
   - Go to Supabase → SQL Editor
   - Run this SQL:
   ```sql
   -- Generate slots for the next 7 days
   DO $$
   DECLARE
     i INTEGER;
     j INTEGER;
     slot_date DATE;
     start_time_val TIME;
     end_time_val TIME;
   BEGIN
     FOR i IN 0..6 LOOP
       slot_date := CURRENT_DATE + i;
       FOR j IN 9..16 LOOP
         start_time_val := MAKE_TIME(j, 0, 0);
         end_time_val := MAKE_TIME(j + 1, 0, 0);
         IF EXTRACT(DOW FROM slot_date) NOT IN (0, 6) THEN
           INSERT INTO availability_slots (slot_date, start_time, end_time, is_booked)
           VALUES (slot_date, start_time_val, end_time_val, FALSE)
           ON CONFLICT DO NOTHING;
         END IF;
       END LOOP;
     END LOOP;
   END $$;
   ```

3. **Or add slots manually:**
   - Go to Supabase → Table Editor → availability_slots
   - Click "Insert new row"
   - Fill in: slot_date, start_time, end_time
   - Set is_booked to false

---

## Quick Diagnostic Checklist

When something isn't working, check these in order:

### 1. Backend Running?
```bash
# Local
curl http://localhost:3001/health

# Vercel
curl https://your-backend-url.vercel.app/health
```
✅ Should return `{"status":"OK"}`

### 2. Frontend Environment Variables Set?
- `NEXT_PUBLIC_API_URL` - points to backend
- `NEXT_PUBLIC_SUPABASE_URL` - your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - your Supabase anon key

### 3. Backend Environment Variables Set?
- `SUPABASE_URL` - your Supabase URL
- `SUPABASE_ANON_KEY` - your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - your Supabase service role key

### 4. Supabase Schema Executed?
- Go to Supabase → Table Editor
- Both `availability_slots` and `bookings` tables should exist
- `availability_slots` should have some rows

### 5. Browser Console Errors?
- Press F12 to open DevTools
- Check Console tab for errors
- Check Network tab to see if API calls are being made

### 6. Vercel Logs (if deployed)?
- Go to Vercel → Deployments
- Click on deployment
- View Function Logs
- Look for errors

---

## Still Having Issues?

### Check These Common Mistakes:

1. **Forgot to restart after changing .env?**
   - Stop the server (Ctrl+C)
   - Start it again: `npm run dev`

2. **Typo in environment variable?**
   - Check for extra spaces
   - Check for missing letters
   - Variables are case-sensitive

3. **Using wrong Supabase credentials?**
   - Double-check you copied the full key
   - Make sure you're using the right project

4. **Forgot to run schema in Supabase?**
   - Go to Supabase → SQL Editor
   - Run the schema SQL

5. **Backend not deployed (Vercel)?**
   - Make sure you deployed the backend
   - Check that it's not still building

---

## Getting More Help

### Check Logs:
- **Frontend logs:** Browser console (F12)
- **Backend logs:** Terminal where `npm run dev` is running
- **Vercel logs:** Vercel Dashboard → Deployments → View Function Logs
- **Supabase logs:** Supabase Dashboard → Logs

### Test Endpoints Manually:
```bash
# Health check
curl http://localhost:3001/health

# Get slots
curl http://localhost:3001/api/availability/slots

# Get bookings
curl http://localhost:3001/api/bookings

# Create a test booking
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"studentName":"Test","studentEmail":"test@test.com","subject":"Math","slotId":"UUID-HERE"}'
```

### Common Error Messages:

| Error | Meaning | Solution |
|-------|---------|----------|
| "Failed to fetch" | Backend not running or wrong URL | Check backend is running, check API_URL |
| "Route not found" | Endpoint doesn't exist | Use `/api/*` routes, not `/` |
| "relation does not exist" | Table not created | Run Supabase schema |
| "Failed to load slots/bookings" | Can't connect to backend | Check backend is running |
| "CORS error" | CORS not configured | Update ALLOWED_ORIGINS |

---

## Prevention Tips

1. **Always check backend is running** before testing frontend
2. **Use the health endpoint** to verify backend is working
3. **Check browser console** for detailed error messages
4. **Test API endpoints directly** with curl or Postman
5. **Read the error messages** - they tell you exactly what's wrong!

---

**Remember:** The improved error handling now gives you specific messages about what's wrong. Read them carefully!