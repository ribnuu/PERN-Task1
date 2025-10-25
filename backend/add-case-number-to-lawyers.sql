-- Add case_number column to lawyers table for linking lawyers to court cases

ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS case_number VARCHAR(100);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_lawyers_case_number ON lawyers(case_number);

-- Update existing lawyers to have NULL case_number (they can be updated later)
-- This is safe since we're adding a nullable column