-- ConceptCore Academy Database Schema
-- Run this SQL in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: availability_slots
-- Stores time slots that students can book
-- Create this table FIRST without the foreign key to bookings
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booking_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Table: bookings
-- Stores student booking information
-- Create this table SECOND with foreign key to availability_slots
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name VARCHAR(100) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  student_phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  notes TEXT,
  slot_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Foreign key to availability_slots
  CONSTRAINT fk_slot 
    FOREIGN KEY (slot_id) 
    REFERENCES availability_slots(id) 
    ON DELETE RESTRICT
);

-- Now add the foreign key from availability_slots to bookings
-- This avoids circular dependency during table creation
ALTER TABLE availability_slots
  ADD CONSTRAINT fk_booking 
    FOREIGN KEY (booking_id) 
    REFERENCES bookings(id) 
    ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_availability_slots_date ON availability_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_availability_slots_booked ON availability_slots(is_booked);
CREATE INDEX IF NOT EXISTS idx_availability_slots_booking ON availability_slots(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(student_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on availability_slots
DROP TRIGGER IF EXISTS update_availability_slots_updated_at ON availability_slots;
CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on bookings
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on both tables
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read available slots (for booking interface)
CREATE POLICY "Allow public read access to available slots" ON availability_slots
  FOR SELECT USING (true);

-- Policy: Only service role can insert/update/delete slots (admin operations)
CREATE POLICY "Allow service role full access to slots" ON availability_slots
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Anyone can create bookings (students booking)
CREATE POLICY "Allow public to create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Policy: Users can read their own bookings (by email)
CREATE POLICY "Allow users to read own bookings" ON bookings
  FOR SELECT USING (true);

-- Policy: Only service role can update/delete bookings (admin operations)
CREATE POLICY "Allow service role full access to bookings" ON bookings
  FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample availability slots for the next 7 days
-- This is optional - you can remove this if you want to manage slots manually
DO $$
DECLARE
  i INTEGER;
  j INTEGER;
  slot_date DATE;
  start_time_val TIME;
  end_time_val TIME;
BEGIN
  -- Generate slots for the next 7 days
  FOR i IN 0..6 LOOP
    slot_date := CURRENT_DATE + i;
    
    -- Create slots from 9 AM to 5 PM, 1-hour slots
    FOR j IN 9..16 LOOP
      start_time_val := MAKE_TIME(j, 0, 0);
      end_time_val := MAKE_TIME(j + 1, 0, 0);
      
      -- Skip weekends (Saturday = 6, Sunday = 0)
      IF EXTRACT(DOW FROM slot_date) NOT IN (0, 6) THEN
        INSERT INTO availability_slots (slot_date, start_time, end_time, is_booked)
        VALUES (slot_date, start_time_val, end_time_val, FALSE)
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON availability_slots TO anon, authenticated;
GRANT INSERT ON bookings TO anon, authenticated;