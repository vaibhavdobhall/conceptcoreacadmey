# Deploy to Vercel - Simple Step-by-Step Guide

## The Easiest Way: Use Vercel API Routes (Option 3)

This puts your backend INSIDE your frontend as API routes. No separate backend deployment needed!

## Step 1: Prepare Your Files

### Create API Route for Availability Slots

Create file: `frontend/src/app/api/availability/slots/route.js`

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
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch slots', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, slots: slots || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots', details: error.message },
      { status: 500 }
    );
  }
}
```

### Create API Route for Bookings

Create file: `frontend/src/app/api/bookings/route.js`

```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Fetch all bookings (for educator dashboard)
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
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, bookings: bookings || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new booking
export async function POST(request) {
  try {
    const body = await request.json();
    const { studentName, studentEmail, studentPhone, subject, notes, slotId } = body;
    
    console.log('Creating booking:', { studentName, studentEmail, subject, slotId });
    
    // Check if slot is available
    const { data: slot, error: slotError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('id', slotId)
      .eq('is_booked', false)
      .single();
    
    if (slotError || !slot) {
      console.error('Slot not available:', slotError);
      return NextResponse.json(
        { error: 'Time slot is no longer available', message: 'This time slot has already been booked.' },
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
    
    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking', message: bookingError.message },
        { status: 500 }
      );
    }
    
    // Mark slot as booked
    const { error: updateError } = await supabase
      .from('availability_slots')
      .update({ is_booked: true, booking_id: booking.id })
      .eq('id', slotId);
    
    if (updateError) {
      console.error('Slot update error:', updateError);
      // Rollback
      await supabase.from('bookings').delete().eq('id', booking.id);
      return NextResponse.json(
        { error: 'Failed to reserve time slot', message: updateError.message },
        { status: 500 }
      );
    }
    
    // Fetch complete booking
    const { data: completeBooking } = await supabase
      .from('bookings')
      .select(`
        *,
        availability_slots (
          slot_date,
          start_time,
          end_time
        )
      `)
      .eq('id', booking.id)
      .single();
    
    console.log('Booking created successfully:', completeBooking);
    
    return NextResponse.json({ 
      success: true, 
      booking: completeBooking || booking 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
```

### Update Frontend API Calls

Edit `frontend/src/lib/api.ts`:

```typescript
// Change this line at the top:
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// To this:
const API_URL = ''; // Empty = use same origin (Vercel API routes)
```

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
3. **Root Directory:** Select `frontend` folder
4. Click "Deploy"

### 3. Add Environment Variables in Vercel

**CRITICAL:** Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important:**
- Add these for **Production**, **Preview**, and **Development**
- Click "Save" after adding each one
- Redeploy after adding environment variables

### 4. Redeploy

After adding environment variables:
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait for it to finish

## Step 3: Test

1. Visit your Vercel URL
2. Open browser console (F12)
3. Try to book a session
4. Check the console for any errors
5. Check Vercel logs: Deployments → View Function Logs

## How to Debug on Vercel

### 1. Check Vercel Function Logs
- Go to Vercel Dashboard
- Click on your project
- Go to Deployments
- Click on latest deployment
- Click "View Function Logs"
- Look for errors in red

### 2. Check Browser Console
- Press F12 in your browser
- Go to Console tab
- Look for error messages
- Go to Network tab
- Click on failed requests to see details

### 3. Test API Directly
Visit these URLs in your browser (replace with your Vercel URL):

```
https://your-app.vercel.app/api/availability/slots
https://your-app.vercel.app/api/bookings
```

Should return JSON data.

## Common Vercel Issues

### Issue: "Environment variable not found"
**Solution:** Make sure you added all 3 environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Issue: "Database error"
**Solution:** 
- Check Supabase credentials are correct
- Verify you ran the schema SQL in Supabase
- Check Supabase dashboard for errors

### Issue: "Route not found"
**Solution:**
- Make sure API route files are in `frontend/src/app/api/`
- File structure should be:
  ```
  frontend/src/app/api/availability/slots/route.js
  frontend/src/app/api/bookings/route.js
  ```

### Issue: "Failed to fetch"
**Solution:**
- Check browser console for CORS errors
- If using API routes (Option 3), CORS shouldn't be an issue
- Make sure frontend is using relative API URLs (empty string)

## Quick Checklist

- [ ] Created `frontend/src/app/api/availability/slots/route.js`
- [ ] Created `frontend/src/app/api/bookings/route.js`
- [ ] Updated `frontend/src/lib/api.ts` to use `API_URL = ''`
- [ ] Pushed code to GitHub
- [ ] Deployed to Vercel with Root Directory = `frontend`
- [ ] Added 3 environment variables in Vercel
- [ ] Redeployed after adding environment variables
- [ ] Ran Supabase schema in SQL Editor
- [ ] Tested API endpoints directly in browser

## Still Not Working?

### Check These:

1. **Vercel Logs** - Most important! Shows exact errors
2. **Browser Console** - Shows frontend errors
3. **Supabase Logs** - Shows database errors
4. **Environment Variables** - Make sure they're set for all environments

### Share This Info:

If still not working, check and share:
1. Vercel Function Logs (screenshot)
2. Browser Console errors (screenshot)
3. Your Vercel URL
4. What happens when you visit `/api/availability/slots` directly

---

**Remember:** With Option 3 (API routes), everything is in one deployment. No separate backend needed!