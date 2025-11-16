-- Add image_url column to news table
-- Run this in Supabase SQL Editor if the column doesn't exist yet

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS image_url TEXT;

