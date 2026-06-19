const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface TimeSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  subject: string;
  notes?: string;
  slot_id: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  availability_slots?: {
    slot_date: string;
    start_time: string;
    end_time: string;
  };
}

export interface CreateBookingData {
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  subject: string;
  notes?: string;
  slotId: string;
}

// Fetch available time slots
export async function getAvailableSlots(startDate?: string, endDate?: string): Promise<TimeSlot[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const url = `${API_URL}/api/availability/slots?${params}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Booking service is not configured. Please contact support.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Failed to fetch available slots');
      }
    }
    
    const data = await response.json();
    return data.slots;
  } catch (err: any) {
    if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
      throw new Error('Unable to connect to booking service. Please check your internet connection.');
    }
    throw err;
  }
}

// Fetch available dates
export async function getAvailableDates(): Promise<string[]> {
  const response = await fetch(`${API_URL}/api/availability/dates`);
  if (!response.ok) {
    throw new Error('Failed to fetch available dates');
  }
  const data = await response.json();
  return data.dates;
}

// Check if a specific slot is available
export async function checkSlotAvailability(slotId: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/api/availability/slots/${slotId}/check`);
  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  return data.available;
}

// Create a new booking
export async function createBooking(bookingData: CreateBookingData): Promise<Booking> {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create booking');
  }

  return data.booking;
}

// Get all bookings (for educator dashboard)
export async function getAllBookings(): Promise<Booking[]> {
  const url = `${API_URL}/api/bookings`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Booking service endpoint not found. Please check backend configuration.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Failed to fetch bookings');
      }
    }
    
    const data = await response.json();
    return data.bookings;
  } catch (err: any) {
    if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
      throw new Error('Unable to connect to booking service. Please check your internet connection.');
    }
    throw err;
  }
}

// Get a specific booking
export async function getBooking(id: string): Promise<Booking> {
  const response = await fetch(`${API_URL}/api/bookings/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }
  const data = await response.json();
  return data.booking;
}

// Cancel a booking
export async function cancelBooking(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to cancel booking');
  }
}