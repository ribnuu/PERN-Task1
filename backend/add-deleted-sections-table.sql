-- Create table to track deleted sections for each person
CREATE TABLE IF NOT EXISTS deleted_sections (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL,
  section_name VARCHAR(50) NOT NULL,
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT true,
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
  UNIQUE(person_id, section_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deleted_sections_person_id ON deleted_sections(person_id);
CREATE INDEX IF NOT EXISTS idx_deleted_sections_section_name ON deleted_sections(section_name);