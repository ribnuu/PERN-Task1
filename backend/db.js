const { Pool } = require('pg');
require('dotenv').config();

// Create pool with better error handling
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Add connection timeout and retry logic
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
});

let dbConnected = false;

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
  dbConnected = true;
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err.message);
  dbConnected = false;
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    console.log('💡 Make sure PostgreSQL is running and credentials are correct');
    console.log('💡 You can still test the API, but database operations will fail');
    dbConnected = false;
  } else {
    console.log('✅ PostgreSQL connection test successful');
    dbConnected = true;
    release();
  }
});

// Add helper function to check connection status
pool.isConnected = () => dbConnected;

module.exports = pool;