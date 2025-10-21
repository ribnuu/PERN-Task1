-- Create tables for new sections: Lawyers, Court Cases, Active Area, Relatives Officials, and Bank Details

-- Lawyers Details Table
CREATE TABLE IF NOT EXISTS lawyers (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
    lawyer_full_name VARCHAR(200) NOT NULL,
    law_firm_or_company VARCHAR(200),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Court Cases Table
CREATE TABLE IF NOT EXISTS court_cases (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
    case_number VARCHAR(100) NOT NULL,
    courts VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Active Area Table
CREATE TABLE IF NOT EXISTS active_areas (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
    town VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    from_date DATE,
    to_date DATE,
    is_active BOOLEAN DEFAULT false,
    address_selection TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relatives Officials Table
CREATE TABLE IF NOT EXISTS relatives_officials (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    nic_number VARCHAR(20),
    passport_number VARCHAR(20),
    department VARCHAR(200),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Details Table (enhanced for multiple account types)
CREATE TABLE IF NOT EXISTS bank_details (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL, -- savings, current, fixed_deposit, bank_card, credit_card, leasing, loans
    bank_name VARCHAR(200),
    account_number VARCHAR(100),
    account_holder_name VARCHAR(200),
    branch VARCHAR(200),
    swift_code VARCHAR(20),
    routing_number VARCHAR(20),
    balance DECIMAL(15,2),
    interest_rate DECIMAL(5,2),
    card_number VARCHAR(20),
    expiry_date DATE,
    cvv VARCHAR(4),
    credit_limit DECIMAL(15,2),
    loan_amount DECIMAL(15,2),
    loan_term INTEGER, -- in months
    monthly_payment DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lawyers_person_id ON lawyers(person_id);
CREATE INDEX IF NOT EXISTS idx_court_cases_person_id ON court_cases(person_id);
CREATE INDEX IF NOT EXISTS idx_active_areas_person_id ON active_areas(person_id);
CREATE INDEX IF NOT EXISTS idx_relatives_officials_person_id ON relatives_officials(person_id);
CREATE INDEX IF NOT EXISTS idx_bank_details_person_id ON bank_details(person_id);
CREATE INDEX IF NOT EXISTS idx_bank_details_account_type ON bank_details(account_type);

-- Create triggers to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_lawyers_updated_at BEFORE UPDATE ON lawyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_court_cases_updated_at BEFORE UPDATE ON court_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_active_areas_updated_at BEFORE UPDATE ON active_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_relatives_officials_updated_at BEFORE UPDATE ON relatives_officials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_bank_details_updated_at BEFORE UPDATE ON bank_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();