-- Add deleted_data column to store the deleted data as JSON
ALTER TABLE deleted_sections ADD COLUMN IF NOT EXISTS deleted_data JSONB DEFAULT NULL;