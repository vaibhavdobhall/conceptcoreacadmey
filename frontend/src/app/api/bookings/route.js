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