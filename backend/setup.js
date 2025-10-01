// Database setup script - Run this with Node.js to set up the database
const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Setting up PERN Dashboard Database...');
  
  // First, connect to postgres database to create our database
  const adminClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Connect to default postgres database
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL');

    // Create database if it doesn't exist
    try {
      await adminClient.query('CREATE DATABASE dashboard_db;');
      console.log('📊 Created database: dashboard_db');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('📊 Database dashboard_db already exists');
      } else {
        throw error;
      }
    }

    await adminClient.end();

    // Now connect to our database and create tables
    const dbClient = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    await dbClient.connect();
    console.log('✅ Connected to dashboard_db');

    // Create tables
    console.log('🏗️  Creating tables...');

    // People table
    await dbClient.query(`
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

    // Bank accounts table
    await dbClient.query(`
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

    // Family members table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
        relation VARCHAR(50) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        nic VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await dbClient.query('CREATE INDEX IF NOT EXISTS idx_people_nic ON people(nic);');
    await dbClient.query('CREATE INDEX IF NOT EXISTS idx_people_name ON people(first_name, last_name);');
    await dbClient.query('CREATE INDEX IF NOT EXISTS idx_bank_person_id ON bank_accounts(person_id);');
    await dbClient.query('CREATE INDEX IF NOT EXISTS idx_family_person_id ON family_members(person_id);');

    // Check if sample data exists
    const result = await dbClient.query('SELECT COUNT(*) FROM people;');
    if (parseInt(result.rows[0].count) === 0) {
      console.log('📝 Inserting sample data...');

      // Insert sample people
      const peopleResult = await dbClient.query(`
        INSERT INTO people (first_name, last_name, nic, address) VALUES
        ('John', 'Doe', '199012345678', '123 Main Street, Colombo 01'),
        ('Jane', 'Smith', '198505432109', '456 Oak Avenue, Kandy'),
        ('Michael', 'Johnson', '199708765432', '789 Pine Road, Galle')
        RETURNING id;
      `);

      const personIds = peopleResult.rows.map(row => row.id);

      // Insert sample bank accounts
      await dbClient.query(`
        INSERT INTO bank_accounts (person_id, account_number, bank_name, branch, balance) VALUES
        ($1, '1001234567', 'Commercial Bank', 'Colombo Main', 50000.00),
        ($2, '2001234567', 'Peoples Bank', 'Kandy', 75000.00),
        ($3, '3001234567', 'Bank of Ceylon', 'Galle', 25000.00);
      `, personIds);

      // Insert sample family members
      await dbClient.query(`
        INSERT INTO family_members (person_id, relation, first_name, last_name, nic) VALUES
        ($1, 'Spouse', 'Mary', 'Doe', '199112345679'),
        ($1, 'Child', 'Tommy', 'Doe', '202112345680'),
        ($2, 'Parent', 'Robert', 'Smith', '196012345678'),
        ($3, 'Sibling', 'Sarah', 'Johnson', '199512345678');
      `, [personIds[0], personIds[0], personIds[1], personIds[2]]);

      console.log('✅ Sample data inserted');
    } else {
      console.log('📋 Sample data already exists');
    }

    await dbClient.end();
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('🔗 Next steps:');
    console.log('1. Backend is running on: http://localhost:5000');
    console.log('2. Frontend should be running on: http://localhost:3006');
    console.log('3. Open the frontend URL in your browser');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();