-- Create database (run this manually first)
-- CREATE DATABASE pern_dashboard;

-- Personal Details Table
CREATE TABLE IF NOT EXISTS personal (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banking Details Table
CREATE TABLE IF NOT EXISTS banking (
    id SERIAL PRIMARY KEY,
    personal_id INTEGER REFERENCES personal(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(50),
    ifsc_code VARCHAR(20),
    branch_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family Details Table
CREATE TABLE IF NOT EXISTS family (
    id SERIAL PRIMARY KEY,
    personal_id INTEGER REFERENCES personal(id) ON DELETE CASCADE,
    relation VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INTEGER,
    occupation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_personal_email ON personal(email);
CREATE INDEX IF NOT EXISTS idx_personal_name ON personal(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_banking_personal_id ON banking(personal_id);
CREATE INDEX IF NOT EXISTS idx_family_personal_id ON family(personal_id);

-- Insert some sample data
INSERT INTO personal (first_name, last_name, email, phone, address, date_of_birth) VALUES
('John', 'Doe', 'john.doe@example.com', '1234567890', '123 Main St, City', '1990-01-15'),
('Jane', 'Smith', 'jane.smith@example.com', '0987654321', '456 Oak Ave, Town', '1985-05-20')
ON CONFLICT (email) DO NOTHING;

INSERT INTO banking (personal_id, bank_name, account_number, account_type, ifsc_code, branch_name)
SELECT id, 'ABC Bank', '1234567890', 'Savings', 'ABC0001234', 'Main Branch'
FROM personal WHERE email = 'john.doe@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO family (personal_id, relation, name, age, occupation)
SELECT id, 'Spouse', 'Mary Doe', 32, 'Teacher'
FROM personal WHERE email = 'john.doe@example.com'
ON CONFLICT DO NOTHING;
