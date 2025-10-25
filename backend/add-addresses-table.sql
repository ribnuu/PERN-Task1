-- Add addresses table for multiple addresses per person
-- Run this SQL to add the new addresses table

-- Create addresses table
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  number VARCHAR(50),
  street1 VARCHAR(200),
  street2 VARCHAR(200),
  town VARCHAR(100),
  district VARCHAR(100),
  province VARCHAR(100),
  police_area VARCHAR(200),
  police_division VARCHAR(200),
  from_date DATE,
  end_date DATE,
  is_currently_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index on person_id for better performance
CREATE INDEX idx_addresses_person_id ON addresses(person_id);

-- Add index on currently active for quick filtering
CREATE INDEX idx_addresses_currently_active ON addresses(is_currently_active);