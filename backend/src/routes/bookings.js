const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { validateBooking } = require('../middleware/validation');

const router = express.Router();

// Create a new booking
router.post('/', validateBooking, async (req, res) => {
  try {
    const { studentName, studentEmail, studentPhone, subject, notes, slotId } = req.body;

    // First, check if the slot exists and is available
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('availability_slots')
      .select('*')
      .eq('id', slotId)
      .eq('is_booked', false)
      .single();

    if (slotError || !slot) {
      return res.status(409).json({
        error: 'Time slot is no longer available',
        message: 'This time slot has already been booked. Please select another time.'
      });
    }

    // Check if slot is in the future
    const slotDateTime = new Date(`${slot.slot_date}T${slot.start_time}`);
    if (slotDateTime < new Date()) {
      return res.status(400).json({
        error: 'Invalid time slot',
        message: 'Cannot book a time slot in the past.'
      });
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert([
        {
          student_name: studentName,
          student_email: studentEmail,
          student_phone: studentPhone,
          subject,
          notes,
          slot_id: slotId,
          status: 'confirmed'
        }
      ])
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return res.status(500).json({
        error: 'Failed to create booking',
        message: 'An error occurred while creating your booking. Please try again.'
      });
    }

    // Mark the slot as booked
    const { error: updateError } = await supabaseAdmin
      .from('availability_slots')
      .update({ is_booked: true, booking_id: booking.id })
      .eq('id', slotId);

    if (updateError) {
      console.error('Slot update error:', updateError);
      // Rollback the booking
      await supabaseAdmin
        .from('bookings')
        .delete()
        .eq('id', booking.id);
      
      return res.status(500).json({
        error: 'Failed to reserve time slot',
        message: 'An error occurred while reserving your time slot. Please try again.'
      });
    }

    // Fetch the complete booking with slot details
    const { data: completeBooking, error: fetchError } = await supabaseAdmin
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

    if (fetchError) {
      console.error('Fetch error:', fetchError);
    }

    res.status(201).json({
      success: true,
      booking: completeBooking || booking,
      message: 'Booking confirmed successfully!'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

// Get all bookings (for educator/admin view)
router.get('/', async (req, res) => {
  try {
    const { data: bookings, error } = await supabaseAdmin
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
      console.error('Fetch bookings error:', error);
      return res.status(500).json({
        error: 'Failed to fetch bookings',
        message: 'An error occurred while fetching bookings.'
      });
    }

    res.json({
      success: true,
      bookings: bookings || []
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred.'
    });
  }
});

// Get a specific booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        availability_slots (
          slot_date,
          start_time,
          end_time
        )
      `)
      .eq('id', id)
      .single();

    if (error || !booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'The requested booking could not be found.'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred.'
    });
  }
});

// Cancel a booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the booking to find the associated slot
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('slot_id')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'The requested booking could not be found.'
      });
    }

    // Update booking status to cancelled
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date() })
      .eq('id', id);

    if (updateError) {
      console.error('Cancel booking error:', updateError);
      return res.status(500).json({
        error: 'Failed to cancel booking',
        message: 'An error occurred while cancelling your booking.'
      });
    }

    // Free up the slot
    if (booking.slot_id) {
      await supabaseAdmin
        .from('availability_slots')
        .update({ is_booked: false, booking_id: null })
        .eq('id', booking.slot_id);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred.'
    });
  }
});

module.exports = router;