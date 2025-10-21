-- Add enemies and corrupted officials tables
-- Run this to add new tables to the existing database

-- Create enemy individuals table
CREATE TABLE enemy_individuals (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  enemy_person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100), -- How they became enemies
  threat_level VARCHAR(50) CHECK (threat_level IN ('Low', 'Medium', 'High', 'Critical')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enemy gangs table
CREATE TABLE enemy_gangs (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  gang_name VARCHAR(200) NOT NULL,
  threat_level VARCHAR(50) CHECK (threat_level IN ('Low', 'Medium', 'High', 'Critical')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create corrupted officials table
CREATE TABLE corrupted_officials (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  official_person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  department VARCHAR(200) NOT NULL,
  corruption_type VARCHAR(100), -- Bribery, Information leak, etc.
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_enemy_individuals_person_id ON enemy_individuals(person_id);
CREATE INDEX idx_enemy_individuals_enemy_person_id ON enemy_individuals(enemy_person_id);
CREATE INDEX idx_enemy_gangs_person_id ON enemy_gangs(person_id);
CREATE INDEX idx_enemy_gangs_gang_name ON enemy_gangs(gang_name);
CREATE INDEX idx_corrupted_officials_person_id ON corrupted_officials(person_id);
CREATE INDEX idx_corrupted_officials_official_person_id ON corrupted_officials(official_person_id);
CREATE INDEX idx_corrupted_officials_department ON corrupted_officials(department);

-- Create triggers for updated_at
CREATE TRIGGER update_enemy_individuals_updated_at BEFORE UPDATE ON enemy_individuals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enemy_gangs_updated_at BEFORE UPDATE ON enemy_gangs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corrupted_officials_updated_at BEFORE UPDATE ON corrupted_officials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample enemy gangs for dropdown
INSERT INTO enemy_gangs (person_id, gang_name, threat_level, notes) VALUES
(1, 'Black Serpents', 'High', 'Rival drug dealers'),
(1, 'Iron Wolves', 'Medium', 'Territory dispute'),
(7, 'Red Dragons', 'Critical', 'Blood feud');

-- Insert some sample enemy individuals
INSERT INTO enemy_individuals (person_id, enemy_person_id, relationship_type, threat_level, notes) VALUES
(1, 3, 'Business Rival', 'Medium', 'Competition over territory'),
(7, 1, 'Personal Vendetta', 'High', 'Family dispute');

-- Insert some sample corrupted officials
INSERT INTO corrupted_officials (person_id, official_person_id, department, corruption_type, notes) VALUES
(1, 3, 'Police Department', 'Information Leak', 'Provides advance warning of raids'),
(7, 5, 'Customs Office', 'Bribery', 'Allows contraband through checkpoints');