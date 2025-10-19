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

-- Create indexes for better performance
CREATE INDEX idx_people_nic ON people(nic);
CREATE INDEX idx_people_name ON people(first_name, last_name);
CREATE INDEX idx_bank_person_id ON bank_accounts(person_id);
CREATE INDEX idx_family_person_id ON family_members(person_id);

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
(1, 'Wife', NULL, 'Mary', 'Doe', 28, '199112345679', '+1-555-0123'),
(1, 'Son', NULL, 'Tommy', 'Doe', 8, '202112345680', NULL),
(1, 'Friend', NULL, 'Mike', 'Johnson', 32, '198812345678', '+1-555-0456'),
(2, 'Mother', NULL, 'Robert', 'Smith', 65, '196012345678', '+1-555-0789'),
(2, 'Other', 'Business Partner', 'Alex', 'Brown', 45, '197512345678', '+1-555-0321'),
(3, 'Sister', NULL, 'Sarah', 'Johnson', 29, '199512345678', '+1-555-0654'),
(3, 'Friend', NULL, 'Lisa', 'Wilson', 31, NULL, '+1-555-0987');