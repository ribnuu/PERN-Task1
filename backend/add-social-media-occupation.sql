-- Add Social Media and Occupation tables to existing database

-- Social Media table
CREATE TABLE social_media (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- Facebook, Instagram, Twitter, Snapchat, IMO, Other
  url TEXT,
  username VARCHAR(100),
  password VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Occupations table  
CREATE TABLE occupations (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  job_title VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE,
  currently_active BOOLEAN DEFAULT false, -- true if currently working there
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_social_media_person_id ON social_media(person_id);
CREATE INDEX idx_social_media_platform ON social_media(platform);
CREATE INDEX idx_occupations_person_id ON occupations(person_id);
CREATE INDEX idx_occupations_currently_active ON occupations(currently_active);

-- Create triggers for updating updated_at timestamp
CREATE TRIGGER update_social_media_updated_at BEFORE UPDATE ON social_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_occupations_updated_at BEFORE UPDATE ON occupations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO social_media (person_id, platform, url, username, password) VALUES
(1, 'Facebook', 'https://facebook.com/johndoe', 'johndoe123', 'password123'),
(1, 'Instagram', 'https://instagram.com/johndoe_official', 'johndoe_official', 'pass456'),
(2, 'Twitter', 'https://twitter.com/janesmith', 'janesmith', 'mypass789'),
(2, 'IMO', '', 'jane.smith.imo', 'imopass'),
(3, 'Snapchat', '', 'mike_j_snap', 'snappass123');

INSERT INTO occupations (person_id, job_title, company, from_date, to_date, currently_active) VALUES
(1, 'Software Engineer', 'Tech Solutions Ltd', '2020-01-15', NULL, true),
(1, 'Junior Developer', 'StartUp Inc', '2018-06-01', '2019-12-31', false),
(2, 'Marketing Manager', 'Digital Agency Co', '2019-03-10', NULL, true),
(2, 'Marketing Assistant', 'Small Business Ltd', '2017-05-20', '2019-02-28', false),
(3, 'Project Manager', 'Construction Corp', '2021-09-01', NULL, true);