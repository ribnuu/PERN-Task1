-- PERN Dashboard Database Schema
-- Create this database schema in PostgreSQL

-- Create the database (run this separately if needed)
-- CREATE DATABASE dashboard_db;

-- Connect to the database and run the following:

-- 1. People table (main table)
CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  nic VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bank accounts table
CREATE TABLE bank_accounts (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  account_number VARCHAR(50) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Family members and friends table
CREATE TABLE family_members (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  relation VARCHAR(50) NOT NULL,
  custom_relation VARCHAR(100),  -- For "Other" relationships
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  age INTEGER CHECK (age >= 0 AND age <= 150),
  nic VARCHAR(20),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vehicles table
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  vehicle_number VARCHAR(20) NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Body marks table
CREATE TABLE body_marks (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  location VARCHAR(200) NOT NULL,
  description TEXT,
  picture TEXT, -- Base64 encoded image or file path
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Used devices table
CREATE TABLE used_devices (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  device_type VARCHAR(50) NOT NULL,
  make VARCHAR(50),
  model VARCHAR(50),
  serial_number VARCHAR(100),
  imei_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Call history table
CREATE TABLE call_history (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  device VARCHAR(200) NOT NULL,
  call_type VARCHAR(20) NOT NULL,
  number VARCHAR(20) NOT NULL,
  date_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Used weapons table
CREATE TABLE used_weapons (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  manufacturer VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  caliber_marking VARCHAR(50) NOT NULL,
  country_origin VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Second phone table
CREATE TABLE second_phone (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  whatsapp VARCHAR(20),
  telegram VARCHAR(20),
  viber VARCHAR(20),
  other VARCHAR(20),
  mobile VARCHAR(20),
  landline VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_people_nic ON people(nic);
CREATE INDEX idx_people_name ON people(first_name, last_name);
CREATE INDEX idx_bank_person_id ON bank_accounts(person_id);
CREATE INDEX idx_family_person_id ON family_members(person_id);
CREATE INDEX idx_vehicles_person_id ON vehicles(person_id);
CREATE INDEX idx_body_marks_person_id ON body_marks(person_id);
CREATE INDEX idx_used_devices_person_id ON used_devices(person_id);
CREATE INDEX idx_call_history_person_id ON call_history(person_id);
CREATE INDEX idx_used_weapons_person_id ON used_weapons(person_id);
CREATE INDEX idx_second_phone_person_id ON second_phone(person_id);
CREATE INDEX idx_call_history_number ON call_history(number);
CREATE INDEX idx_call_history_date ON call_history(date_time);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_body_marks_updated_at BEFORE UPDATE ON body_marks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_used_devices_updated_at BEFORE UPDATE ON used_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_history_updated_at BEFORE UPDATE ON call_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_used_weapons_updated_at BEFORE UPDATE ON used_weapons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_second_phone_updated_at BEFORE UPDATE ON second_phone
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO people (first_name, last_name, nic, address) VALUES
('John', 'Doe', '199012345678', '123 Main Street, Colombo 01'),
('Jane', 'Smith', '198505432109', '456 Oak Avenue, Kandy'),
('Michael', 'Johnson', '199708765432', '789 Pine Road, Galle');

INSERT INTO bank_accounts (person_id, account_number, bank_name, branch, balance) VALUES
(1, '1001234567', 'Commercial Bank', 'Colombo Main', 50000.00),
(2, '2001234567', 'Peoples Bank', 'Kandy', 75000.00),
(3, '3001234567', 'Bank of Ceylon', 'Galle', 25000.00);

INSERT INTO family_members (person_id, relation, custom_relation, first_name, last_name, age, nic, phone_number) VALUES
(1, 'Wife', NULL, 'Jane', 'Doe', 28, '199112345679', '+15550123'),
(1, 'Son', NULL, 'Tommy', 'Doe', 8, '202112345680', NULL),
(1, 'Friend', NULL, 'Mike', 'Johnson', 32, '198812345678', '+15550456'),
(2, 'Mother', NULL, 'Robert', 'Smith', 65, '196012345678', '+15550789'),
(2, 'Other', 'Business Partner', 'Alex', 'Brown', 45, '197512345678', '+15550321'),
(3, 'Sister', NULL, 'Sarah', 'Johnson', 29, '199512345678', '+15550654'),
(3, 'Friend', NULL, 'Lisa', 'Wilson', 31, NULL, '+15550987');

-- Insert sample vehicles
INSERT INTO vehicles (person_id, vehicle_number, make, model) VALUES
(1, 'CAG4455', 'TOYOTA', 'PRADO 150'),
(1, 'ABC1234', 'HONDA', 'CIVIC'),
(2, 'XYZ9876', 'NISSAN', 'ALTIMA'),
(3, 'DEF5432', 'BMW', 'X5');

-- Insert sample body marks
INSERT INTO body_marks (person_id, type, location, description, picture) VALUES
(1, 'Tattoo', 'behind the right ear', 'text says "gang"', ''),
(2, 'Scar', 'left forearm', '3-inch scar from accident', ''),
(3, 'Birthmark', 'right shoulder', 'heart-shaped birthmark', '');

-- Insert sample used devices
INSERT INTO used_devices (person_id, device_type, make, model, serial_number, imei_number) VALUES
(1, 'Phone', 'Samsung', 'Galaxy S21', 'SN123456789', '354123456789012'),
(1, 'Laptop', 'Apple', 'MacBook Pro', 'MB987654321', ''),
(2, 'Phone', 'iPhone', 'iPhone 13', 'IP567890123', '354987654321098'),
(2, 'Desktop', 'Dell', 'OptiPlex 7090', 'DL445566778', ''),
(3, 'Phone', 'Google', 'Pixel 6', 'GP334455667', '354556677889900'),
(3, 'Pager', 'Motorola', 'Advisor Gold', 'MG998877665', '');

-- Insert sample call history
INSERT INTO call_history (person_id, device, call_type, number, date_time) VALUES
(1, 'Phone - Samsung Galaxy S21', 'Outgoing', '+15550123', '2024-10-19 14:30:00'),
(1, 'Phone - Samsung Galaxy S21', 'Incoming', '+15550456', '2024-10-19 15:45:00'),
(1, 'Phone - Samsung Galaxy S21', 'Missed Call', '+15559999', '2024-10-19 16:20:00'),
(2, 'Phone - iPhone iPhone 13', 'Outgoing', '+15550789', '2024-10-19 09:15:00'),
(2, 'Phone - iPhone iPhone 13', 'Incoming', '+15550321', '2024-10-19 11:30:00'),
(3, 'Phone - Google Pixel 6', 'Outgoing', '+15550654', '2024-10-19 13:45:00'),
(3, 'Phone - Google Pixel 6', 'Missed Call', '+15550987', '2024-10-19 17:10:00');

-- Insert sample used weapons
INSERT INTO used_weapons (person_id, manufacturer, model, caliber_marking, country_origin, serial_number) VALUES
(1, 'Smith & Wesson', 'Model 686', '.357 MAG', 'United States', 'SW123456789'),
(1, 'Glock', 'Glock 17', '9mm LUGER', 'Austria', 'GL987654321'),
(2, 'Colt', 'M1911', '.45 ACP', 'United States', 'CT445566778'),
(3, 'Beretta', '92FS', '9mm PARA', 'Italy', 'BT334455667');

-- Insert sample second phone data
INSERT INTO second_phone (person_id, whatsapp, telegram, viber, other, mobile, landline) VALUES
(1, '+15550100', '+15550101', '+15550102', '+15550103', '+15550104', '0115550105'),
(2, '+15550200', '+15550201', '', '+15550203', '+15550204', '0815550205'),
(3, '', '+15550301', '+15550302', '', '+15550304', '0915550305');