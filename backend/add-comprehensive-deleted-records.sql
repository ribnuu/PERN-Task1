-- Comprehensive Deleted Records System
-- This will handle deleted records for ALL sections except personal details

-- First, let's make sure our deleted_sections table can handle all section types
-- Add a detailed_data column for storing more complex deleted record information

-- If the table exists, add the new columns
DO $$
BEGIN
    -- Add detailed_data column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deleted_sections' 
                   AND column_name = 'detailed_data') THEN
        ALTER TABLE deleted_sections ADD COLUMN detailed_data JSONB;
    END IF;
    
    -- Add record_type column to specify what kind of record was deleted
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deleted_sections' 
                   AND column_name = 'record_type') THEN
        ALTER TABLE deleted_sections ADD COLUMN record_type VARCHAR(50);
    END IF;
    
    -- Add record_index column for tracking position in arrays
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deleted_sections' 
                   AND column_name = 'record_index') THEN
        ALTER TABLE deleted_sections ADD COLUMN record_index INTEGER;
    END IF;
    
    -- Add deletion_reason column for audit trails
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deleted_sections' 
                   AND column_name = 'deletion_reason') THEN
        ALTER TABLE deleted_sections ADD COLUMN deletion_reason TEXT;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deleted_sections_person_section 
ON deleted_sections(person_id, section_name);

CREATE INDEX IF NOT EXISTS idx_deleted_sections_record_type 
ON deleted_sections(record_type);

-- CREATE INDEX IF NOT EXISTS idx_deleted_sections_created_at 
-- ON deleted_sections(created_at); -- Skip this if created_at doesn't exist

-- Add a comment to document the table structure
COMMENT ON TABLE deleted_sections IS 'Stores deleted records from all sections for audit and recovery purposes';
COMMENT ON COLUMN deleted_sections.section_name IS 'Name of the section (address, family, vehicles, etc.)';
COMMENT ON COLUMN deleted_sections.deleted_data IS 'Complete section data that was deleted (legacy - for whole section deletions)';
COMMENT ON COLUMN deleted_sections.detailed_data IS 'Individual record data that was deleted (for individual record deletions)';
COMMENT ON COLUMN deleted_sections.record_type IS 'Type of record (individual_record, whole_section)';
COMMENT ON COLUMN deleted_sections.record_index IS 'Original position in array for individual records';
COMMENT ON COLUMN deleted_sections.deletion_reason IS 'Optional reason for deletion';