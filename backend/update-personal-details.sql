-- Update personal details table to include new fields
-- Run this to add new columns to the existing people table

ALTER TABLE people 
ADD COLUMN full_name VARCHAR(200),
ADD COLUMN aliases TEXT,
ADD COLUMN passport VARCHAR(20),
ADD COLUMN height DECIMAL(5,2), -- in centimeters
ADD COLUMN religion VARCHAR(50),
ADD COLUMN gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
ADD COLUMN date_of_birth DATE;

-- Create gang details table
CREATE TABLE gang_details (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  gang_name VARCHAR(200) NOT NULL,
  position_in_gang VARCHAR(100) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE,
  currently_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_people_passport ON people(passport);
CREATE INDEX idx_people_full_name ON people(full_name);
CREATE INDEX idx_gang_details_person_id ON gang_details(person_id);
CREATE INDEX idx_gang_details_gang_name ON gang_details(gang_name);

-- Create trigger for gang_details updated_at
CREATE TRIGGER update_gang_details_updated_at BEFORE UPDATE ON gang_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing data with full names (combine first_name and last_name)
UPDATE people 
SET full_name = CONCAT(first_name, ' ', last_name);

-- Add some sample gang data
INSERT INTO gang_details (person_id, gang_name, position_in_gang, from_date, to_date, currently_active) VALUES
(1, 'Red Dragons', 'Lieutenant', '2020-01-15', '2022-06-30', FALSE),
(1, 'Iron Wolves', 'Member', '2022-07-01', NULL, TRUE),
(2, 'Blue Hawks', 'Leader', '2019-03-20', NULL, TRUE);