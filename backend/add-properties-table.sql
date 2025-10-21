-- Migration script to add properties table to existing database
-- Run this script if you already have the database created without properties table

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  property_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('currently_in_possession', 'sold', 'intended_to_buy')),
  description TEXT,
  value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  purchase_date DATE,
  sale_date DATE,
  location TEXT,
  documents TEXT, -- File path or document reference
  buyer_name VARCHAR(200), -- For sold properties
  buyer_nic VARCHAR(20), -- For sold properties
  buyer_passport VARCHAR(20), -- For sold properties
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for properties table
CREATE INDEX IF NOT EXISTS idx_properties_person_id ON properties(person_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);

-- Create trigger for properties table
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample properties data
INSERT INTO properties (person_id, property_type, status, description, value, purchase_date, sale_date, location, buyer_name, buyer_nic, buyer_passport) VALUES
(1, 'House', 'currently_in_possession', '3-bedroom house with garden', 25000000.00, '2020-05-15', NULL, '123 Main Street, Colombo 01', NULL, NULL, NULL),
(1, 'Land', 'sold', '2-acre land plot', 15000000.00, '2018-03-10', '2023-08-20', 'Kandy Road, Matale', 'Robert Silva', '198512345678', 'N1234567'),
(2, 'Apartment', 'currently_in_possession', '2-bedroom apartment city center', 18000000.00, '2019-11-30', NULL, '456 Oak Avenue, Kandy', NULL, NULL, NULL),
(2, 'Vehicle', 'intended_to_buy', 'Toyota Prius Hybrid', 8500000.00, '2024-12-01', NULL, 'Toyota Lanka, Colombo', NULL, NULL, NULL),
(3, 'Commercial Building', 'currently_in_possession', 'Small office building with 5 units', 35000000.00, '2021-07-22', NULL, '789 Pine Road, Galle', NULL, NULL, NULL),
(3, 'Jewelry', 'sold', 'Gold necklace with diamonds', 450000.00, '2022-01-15', '2024-09-10', 'Personal collection', 'Maria Perera', '199012345678', NULL)
ON CONFLICT DO NOTHING;

SELECT 'Properties table migration completed successfully!' as result;