const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dashboard_db',
  password: 'postgres',
  port: 5432
});

async function checkDeletedRecords() {
  try {
    console.log('Checking deleted_sections table...\n');
    
    // Check the table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'deleted_sections'
      ORDER BY ordinal_position;
    `;
    const structure = await pool.query(structureQuery);
    console.log('Table structure:');
    console.table(structure.rows);
    
    // Check for any constraints
    const constraintsQuery = `
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'deleted_sections';
    `;
    const constraints = await pool.query(constraintsQuery);
    console.log('\nTable constraints:');
    console.table(constraints.rows);
    
    // Check existing deleted records
    const recordsQuery = `
      SELECT id, person_id, section_name, record_type, record_index, 
             LEFT(detailed_data::text, 50) as data_preview, deleted_at
      FROM deleted_sections
      WHERE is_deleted = true
      ORDER BY person_id, section_name, deleted_at;
    `;
    const records = await pool.query(recordsQuery);
    console.log(`\nExisting deleted records (${records.rows.length} total):`);
    console.table(records.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDeletedRecords();
