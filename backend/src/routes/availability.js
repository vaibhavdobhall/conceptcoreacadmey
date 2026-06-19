const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { validateAvailabilityQuery } = require('../middleware/validation');

const router = express.Router();

// Get available time slots
router.get('/slots', validateAvailabilityQuery, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabaseAdmin
      .from('availability_slots')
      .select('*')
      .eq('is_booked', false)
      .gte('slot_date', new Date().toISOString().split('T')[0]) // Only future slots
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('slot_date', startDate);
    }
    if (endDate) {
      query = query.lte('slot_date', endDate);
    }

    const { data: slots, error } = await query;

    if (error) {
      console.error('Fetch slots error:', error);
      return res.status(500).json({
        error: 'Failed to fetch available slots',
        message: 'An error occurred while fetching available time slots.'
      });
    }

    // Group slots by date for easier frontend consumption
    const slotsByDate = slots.reduce((acc, slot) => {
      if (!acc[slot.slot_date]) {
        acc[slot.slot_date] = [];
      }
      acc[slot.slot_date].push(slot);
      return acc;
    }, {});

    res.json({
      success: true,
      slots: slots || [],
      slotsByDate,
      totalAvailable: slots?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred.'
    });
  }
});

// Get a specific slot by ID
router.get('/slots/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: slot, error } = await supabaseAdmin
      .from('availability_slots')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !slot) {
      return res.status(404).json({
        error: 'Slot not found',
        message: 'The requested time slot could not be found.'
      });
    }

    res.json({
      success: true,
      slot
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred.'
    });
  }
});

// Check if a specific slot is available
router.get('/slots/:id/check', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: slot, error } = await supabaseAdmin
      .from('availability_slots')
      .select('is_booked, slot_date, start_time, end_time')
      .eq('id', id)
      .single();

    if (error || !slot) {
      return res.status(404).json({
        available: false,
        error: 'Slot not found'
      });
    }

    // Check if slot is in the past
    const slotDateTime = new Date(`${slot.slot_date}T${slot.start_time}`);
    const isPast = slotDateTime < new Date();

    res.json({
      available: !slot.is_booked && !isPast,
      isBooked: slot.is_booked,
      isPast
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      available: false,
      error: 'Internal server error'
    });
  }
});

// Get available dates (dates that have at least one available slot)
router.get('/dates', async (req, res) => {
  try {
    const { data: slots, error } = await supabaseAdmin
      .from('availability_slots')
      .select('slot_date')
      .eq('is_booked', false)
      .gte('slot_date', new Date().toISOString().split('T')[0])
      .order('slot_date', { ascending: true });

    if (error) {
      console.error('Fetch dates error:', error);
      return res.status(500).json({
        error: 'Failed to fetch available dates',
        message: 'An error occurred while fetching available dates.'
      });
    }

    // Get unique dates
    const uniqueDates = [...new Set(slots.map(slot => slot.slot_date))];

    res.json({
      success: true,
      dates: uniqueDates,
      totalDates: uniqueDates.length
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