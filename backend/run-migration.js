const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dashboard_db',
  password: 'postgres',
  port: 5432
});

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'fix-deleted-sections-unique-constraint.sql'), 'utf8');
    console.log('Running migration...');
    await pool.query(sql);
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
