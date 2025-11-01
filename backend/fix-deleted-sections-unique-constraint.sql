-- Remove the UNIQUE constraint that prevents multiple individual records from being stored
-- This constraint was designed for whole section deletions, not individual record deletions

-- Drop the unique constraint
ALTER TABLE deleted_sections DROP CONSTRAINT IF EXISTS deleted_sections_person_id_section_name_key;

-- Note: The constraint name might be different. Check with:
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'deleted_sections' AND constraint_type = 'UNIQUE';

-- Create a more appropriate index instead (non-unique)
CREATE INDEX IF NOT EXISTS idx_deleted_sections_person_section_type 
ON deleted_sections(person_id, section_name, record_type);

-- Add comments for clarity
COMMENT ON INDEX idx_deleted_sections_person_section_type IS 'Index for quickly finding all deleted records for a person and section';
