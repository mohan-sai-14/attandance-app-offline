-- Fix attendance table by adding missing date column
-- Run these commands in your Supabase SQL editor

-- Add date column to attendance table
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS date TEXT;

-- Update existing attendance records to have a date based on check_in_time
UPDATE attendance 
SET date = DATE(check_in_time)::TEXT 
WHERE date IS NULL;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add missing columns to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS qr_code VARCHAR;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'attendance' 
ORDER BY ordinal_position;
