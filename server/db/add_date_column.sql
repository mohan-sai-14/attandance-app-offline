-- Migration to add date column to attendance table
-- This script can be run on existing databases without dropping tables

-- Add date column to attendance table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' 
        AND column_name = 'date'
    ) THEN
        ALTER TABLE attendance ADD COLUMN date TEXT;
        RAISE NOTICE 'Added date column to attendance table';
    ELSE
        RAISE NOTICE 'Date column already exists in attendance table';
    END IF;
END $$;

-- Update existing attendance records to have a date based on check_in_time
UPDATE attendance 
SET date = DATE(check_in_time)::TEXT 
WHERE date IS NULL;

-- Add role and status columns to users table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';
        RAISE NOTICE 'Added role column to users table';
    ELSE
        RAISE NOTICE 'Role column already exists in users table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added status column to users table';
    ELSE
        RAISE NOTICE 'Status column already exists in users table';
    END IF;
END $$;

-- Add date, time, duration, and qr_code columns to sessions table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        AND column_name = 'date'
    ) THEN
        ALTER TABLE sessions ADD COLUMN date DATE;
        RAISE NOTICE 'Added date column to sessions table';
    ELSE
        RAISE NOTICE 'Date column already exists in sessions table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        AND column_name = 'time'
    ) THEN
        ALTER TABLE sessions ADD COLUMN time TEXT;
        RAISE NOTICE 'Added time column to sessions table';
    ELSE
        RAISE NOTICE 'Time column already exists in sessions table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        AND column_name = 'duration'
    ) THEN
        ALTER TABLE sessions ADD COLUMN duration INTEGER;
        RAISE NOTICE 'Added duration column to sessions table';
    ELSE
        RAISE NOTICE 'Duration column already exists in sessions table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        AND column_name = 'qr_code'
    ) THEN
        ALTER TABLE sessions ADD COLUMN qr_code VARCHAR;
        RAISE NOTICE 'Added qr_code column to sessions table';
    ELSE
        RAISE NOTICE 'qr_code column already exists in sessions table';
    END IF;
END $$;
