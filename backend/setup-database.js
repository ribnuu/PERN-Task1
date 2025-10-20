#!/usr/bin/env node

/**
 * Database Setup Script for PERN Dashboard
 * This script will create the database and all required tables
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database connection for setup (connects to 'postgres' database first)
const setupPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default database first
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Main database connection
const mainPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dashboard_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  console.log('🔧 Starting database setup...');
  
  try {
    // Step 1: Create database if it doesn't exist
    console.log('📝 Creating database if not exists...');
    
    const dbName = process.env.DB_NAME || 'dashboard_db';
    
    // Check if database exists
    const dbCheckQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const dbExists = await setupPool.query(dbCheckQuery, [dbName]);
    
    if (dbExists.rows.length === 0) {
      console.log(`📝 Creating database: ${dbName}`);
      await setupPool.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }

    // Step 2: Create tables and sample data
    console.log('📝 Creating tables...');
    
    // Connect to the main database
    const client = await mainPool.connect();
    
    try {
      // Create tables
      await client.query(`
        -- 1. People table (main table)
        CREATE TABLE IF NOT EXISTS people (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          nic VARCHAR(20) UNIQUE NOT NULL,
          address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        -- 2. Bank accounts table
        CREATE TABLE IF NOT EXISTS bank_accounts (
          id SERIAL PRIMARY KEY,
          person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
          account_number VARCHAR(50) NOT NULL,
          bank_name VARCHAR(100) NOT NULL,
          branch VARCHAR(100) NOT NULL,
          balance DECIMAL(15,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        -- 3. Family members and friends table
        CREATE TABLE IF NOT EXISTS family_members (
          id SERIAL PRIMARY KEY,
          person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
          relation VARCHAR(50) NOT NULL,
          custom_relation VARCHAR(100),
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100),
          age INTEGER CHECK (age >= 0 AND age <= 150),
          nic VARCHAR(20),
          phone_number VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        -- 4. Vehicles table
        CREATE TABLE IF NOT EXISTS vehicles (
          id SERIAL PRIMARY KEY,
          person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
          vehicle_number VARCHAR(20) NOT NULL,
          make VARCHAR(50) NOT NULL,
          model VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        -- 5. Body marks table
        CREATE TABLE IF NOT EXISTS body_marks (
          id SERIAL PRIMARY KEY,
          person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          location VARCHAR(200) NOT NULL,
          description TEXT,
          picture TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        -- 6. Used devices table
        CREATE TABLE IF NOT EXISTS used_devices (
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
      `);

      await client.query(`
        -- 7. Call history table
        CREATE TABLE IF NOT EXISTS call_history (
          id SERIAL PRIMARY KEY,
          person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
          device VARCHAR(200) NOT NULL,
          call_type VARCHAR(20) NOT NULL,
          number VARCHAR(20) NOT NULL,
          date_time TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ All tables created successfully');

      // Step 3: Create indexes
      console.log('📝 Creating indexes...');
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_people_nic ON people(nic);
        CREATE INDEX IF NOT EXISTS idx_people_name ON people(first_name, last_name);
        CREATE INDEX IF NOT EXISTS idx_bank_person_id ON bank_accounts(person_id);
        CREATE INDEX IF NOT EXISTS idx_family_person_id ON family_members(person_id);
        CREATE INDEX IF NOT EXISTS idx_vehicles_person_id ON vehicles(person_id);
        CREATE INDEX IF NOT EXISTS idx_body_marks_person_id ON body_marks(person_id);
        CREATE INDEX IF NOT EXISTS idx_used_devices_person_id ON used_devices(person_id);
        CREATE INDEX IF NOT EXISTS idx_call_history_person_id ON call_history(person_id);
        CREATE INDEX IF NOT EXISTS idx_call_history_number ON call_history(number);
        CREATE INDEX IF NOT EXISTS idx_call_history_date ON call_history(date_time);
      `);

      console.log('✅ Indexes created successfully');

      // Step 4: Create triggers
      console.log('📝 Creating update triggers...');
      
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      await client.query(`
        DROP TRIGGER IF EXISTS update_people_updated_at ON people;
        DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
        DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
        DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
        DROP TRIGGER IF EXISTS update_body_marks_updated_at ON body_marks;
        DROP TRIGGER IF EXISTS update_used_devices_updated_at ON used_devices;
        DROP TRIGGER IF EXISTS update_call_history_updated_at ON call_history;

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
      `);

      console.log('✅ Triggers created successfully');

      // Step 5: Insert sample data
      console.log('📝 Inserting sample data...');
      
      // Check if sample data already exists
      const existingData = await client.query('SELECT COUNT(*) FROM people');
      
      if (existingData.rows[0].count == 0) {
        // Insert sample people
        await client.query(`
          INSERT INTO people (first_name, last_name, nic, address) VALUES
          ('John', 'Doe', '199012345678', '123 Main Street, Colombo 01'),
          ('Jane', 'Smith', '198505432109', '456 Oak Avenue, Kandy'),
          ('Michael', 'Johnson', '199708765432', '789 Pine Road, Galle');
        `);

        // Insert sample bank accounts
        await client.query(`
          INSERT INTO bank_accounts (person_id, account_number, bank_name, branch, balance) VALUES
          (1, '1001234567', 'Commercial Bank', 'Colombo Main', 50000.00),
          (2, '2001234567', 'Peoples Bank', 'Kandy', 75000.00),
          (3, '3001234567', 'Bank of Ceylon', 'Galle', 25000.00);
        `);

        // Insert sample family members
        await client.query(`
          INSERT INTO family_members (person_id, relation, custom_relation, first_name, last_name, age, nic, phone_number) VALUES
          (1, 'Wife', NULL, 'Jane', 'Doe', 28, '199112345679', '+15550123'),
          (1, 'Son', NULL, 'Tommy', 'Doe', 8, '202112345680', NULL),
          (1, 'Friend', NULL, 'Mike', 'Johnson', 32, '198812345678', '+15550456'),
          (2, 'Mother', NULL, 'Robert', 'Smith', 65, '196012345678', '+15550789'),
          (2, 'Other', 'Business Partner', 'Alex', 'Brown', 45, '197512345678', '+15550321'),
          (3, 'Sister', NULL, 'Sarah', 'Johnson', 29, '199512345678', '+15550654'),
          (3, 'Friend', NULL, 'Lisa', 'Wilson', 31, NULL, '+15550987');
        `);

        // Insert sample vehicles
        await client.query(`
          INSERT INTO vehicles (person_id, vehicle_number, make, model) VALUES
          (1, 'CAG4455', 'TOYOTA', 'PRADO 150'),
          (1, 'ABC1234', 'HONDA', 'CIVIC'),
          (2, 'XYZ9876', 'NISSAN', 'ALTIMA'),
          (3, 'DEF5432', 'BMW', 'X5');
        `);

        // Insert sample body marks
        await client.query(`
          INSERT INTO body_marks (person_id, type, location, description, picture) VALUES
          (1, 'Tattoo', 'behind the right ear', 'text says "gang"', ''),
          (2, 'Scar', 'left forearm', '3-inch scar from accident', ''),
          (3, 'Birthmark', 'right shoulder', 'heart-shaped birthmark', '');
        `);

        // Insert sample used devices
        await client.query(`
          INSERT INTO used_devices (person_id, device_type, make, model, serial_number, imei_number) VALUES
          (1, 'Phone', 'Samsung', 'Galaxy S21', 'SN123456789', '354123456789012'),
          (1, 'Laptop', 'Apple', 'MacBook Pro', 'MB987654321', ''),
          (2, 'Phone', 'iPhone', 'iPhone 13', 'IP567890123', '354987654321098'),
          (2, 'Desktop', 'Dell', 'OptiPlex 7090', 'DL445566778', ''),
          (3, 'Phone', 'Google', 'Pixel 6', 'GP334455667', '354556677889900'),
          (3, 'Pager', 'Motorola', 'Advisor Gold', 'MG998877665', '');
        `);

        // Insert sample call history
        await client.query(`
          INSERT INTO call_history (person_id, device, call_type, number, date_time) VALUES
          (1, 'Phone - Samsung Galaxy S21', 'Outgoing', '+15550123', '2024-10-19 14:30:00'),
          (1, 'Phone - Samsung Galaxy S21', 'Incoming', '+15550456', '2024-10-19 15:45:00'),
          (1, 'Phone - Samsung Galaxy S21', 'Missed Call', '+15559999', '2024-10-19 16:20:00'),
          (2, 'Phone - iPhone iPhone 13', 'Outgoing', '+15550789', '2024-10-19 09:15:00'),
          (2, 'Phone - iPhone iPhone 13', 'Incoming', '+15550321', '2024-10-19 11:30:00'),
          (3, 'Phone - Google Pixel 6', 'Outgoing', '+15550654', '2024-10-19 13:45:00'),
          (3, 'Phone - Google Pixel 6', 'Missed Call', '+15550987', '2024-10-19 17:10:00');
        `);

        console.log('✅ Sample data inserted successfully');
      } else {
        console.log('✅ Sample data already exists, skipping insertion');
      }

    } finally {
      client.release();
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database created/verified');
    console.log('   ✅ All tables created');
    console.log('   ✅ Indexes created');
    console.log('   ✅ Triggers created');
    console.log('   ✅ Sample data inserted');
    console.log('\n🚀 You can now start the server with: npm start');
    console.log('🌐 Frontend will be available at: http://localhost:3000');
    console.log('🔌 Backend API will be available at: http://localhost:5000');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your .env file for correct database credentials');
    console.log('   3. Ensure the PostgreSQL user has permission to create databases');
    process.exit(1);
  } finally {
    await setupPool.end();
    await mainPool.end();
  }
}

// Run the setup
setupDatabase();