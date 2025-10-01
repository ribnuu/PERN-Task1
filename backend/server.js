const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Add middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (!pool.isConnected()) {
    return res.status(503).json({ 
      error: 'Database connection unavailable', 
      message: 'Please ensure PostgreSQL is running and properly configured' 
    });
  }
  next();
};

// ============================================
// API ROUTES
// ============================================

// 1. SEARCH PEOPLE
app.get('/api/search', checkDbConnection, async (req, res) => {
  try {
    const { query } = req.query;
    const result = await pool.query(
      `SELECT id, first_name, last_name, nic 
       FROM people 
       WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR nic ILIKE $1
       ORDER BY first_name`,
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. GET PERSON DETAILS BY ID
app.get('/api/person/:id', checkDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get person details
    const personResult = await pool.query(
      'SELECT * FROM people WHERE id = $1',
      [id]
    );
    
    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    // Get bank details
    const bankResult = await pool.query(
      'SELECT * FROM bank_accounts WHERE person_id = $1',
      [id]
    );
    
    // Get family details
    const familyResult = await pool.query(
      'SELECT * FROM family_members WHERE person_id = $1',
      [id]
    );
    
    res.json({
      personal: personResult.rows[0],
      bank: bankResult.rows[0] || null,
      family: familyResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. CREATE NEW PERSON
app.post('/api/person', checkDbConnection, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { personal, bank, family } = req.body;
    
    await client.query('BEGIN');
    
    // Insert person
    const personResult = await client.query(
      `INSERT INTO people (first_name, last_name, nic, address) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [personal.firstName, personal.lastName, personal.nic, personal.address]
    );
    
    const personId = personResult.rows[0].id;
    
    // Insert bank details if provided
    if (bank && bank.accountNumber) {
      await client.query(
        `INSERT INTO bank_accounts (person_id, account_number, bank_name, branch, balance)
         VALUES ($1, $2, $3, $4, $5)`,
        [personId, bank.accountNumber, bank.bankName, bank.branch, bank.balance || 0]
      );
    }
    
    // Insert family members if provided
    if (family && family.length > 0) {
      for (const member of family) {
        await client.query(
          `INSERT INTO family_members (person_id, relation, first_name, last_name, nic)
           VALUES ($1, $2, $3, $4, $5)`,
          [personId, member.relation, member.firstName, member.lastName, member.nic]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ id: personId, message: 'Person created successfully' });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create person' });
  } finally {
    client.release();
  }
});

// 4. UPDATE PERSON
app.put('/api/person/:id', checkDbConnection, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { personal, bank, family } = req.body;
    
    await client.query('BEGIN');
    
    // Update person
    await client.query(
      `UPDATE people 
       SET first_name = $1, last_name = $2, nic = $3, address = $4 
       WHERE id = $5`,
      [personal.firstName, personal.lastName, personal.nic, personal.address, id]
    );
    
    // Update or insert bank details
    if (bank) {
      const bankExists = await client.query(
        'SELECT id FROM bank_accounts WHERE person_id = $1',
        [id]
      );
      
      if (bankExists.rows.length > 0) {
        await client.query(
          `UPDATE bank_accounts 
           SET account_number = $1, bank_name = $2, branch = $3, balance = $4
           WHERE person_id = $5`,
          [bank.accountNumber, bank.bankName, bank.branch, bank.balance, id]
        );
      } else {
        await client.query(
          `INSERT INTO bank_accounts (person_id, account_number, bank_name, branch, balance)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, bank.accountNumber, bank.bankName, bank.branch, bank.balance || 0]
        );
      }
    }
    
    // Delete existing family members and insert new ones
    await client.query('DELETE FROM family_members WHERE person_id = $1', [id]);
    
    if (family && family.length > 0) {
      for (const member of family) {
        await client.query(
          `INSERT INTO family_members (person_id, relation, first_name, last_name, nic)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, member.relation, member.firstName, member.lastName, member.nic]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Person updated successfully' });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update person' });
  } finally {
    client.release();
  }
});

// 5. DELETE PERSON
app.delete('/api/person/:id', checkDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cascade delete will automatically remove bank and family records
    await pool.query('DELETE FROM people WHERE id = $1', [id]);
    
    res.json({ message: 'Person deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

// Test route with database status
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dashboard API is running',
    database: pool.isConnected() ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    api: 'running',
    database: pool.isConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});