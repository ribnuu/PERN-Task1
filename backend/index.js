require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ==================== PERSONAL ROUTES ====================

// Get all personal details
app.get('/api/personal', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personal ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get personal detail by ID
app.get('/api/personal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM personal WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personal detail not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create personal detail
app.post('/api/personal', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address, date_of_birth } = req.body;
    const result = await pool.query(
      'INSERT INTO personal (first_name, last_name, email, phone, address, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [first_name, last_name, email, phone, address, date_of_birth]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update personal detail
app.put('/api/personal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address, date_of_birth } = req.body;
    const result = await pool.query(
      'UPDATE personal SET first_name = $1, last_name = $2, email = $3, phone = $4, address = $5, date_of_birth = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [first_name, last_name, email, phone, address, date_of_birth, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personal detail not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete personal detail
app.delete('/api/personal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM personal WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personal detail not found' });
    }
    res.json({ message: 'Personal detail deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== BANKING ROUTES ====================

// Get all banking details
app.get('/api/banking', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, p.first_name, p.last_name, p.email 
      FROM banking b 
      LEFT JOIN personal p ON b.personal_id = p.id 
      ORDER BY b.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get banking details by ID
app.get('/api/banking/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM banking WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Banking detail not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get banking details by personal ID
app.get('/api/banking/personal/:personalId', async (req, res) => {
  try {
    const { personalId } = req.params;
    const result = await pool.query('SELECT * FROM banking WHERE personal_id = $1', [personalId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create banking detail
app.post('/api/banking', async (req, res) => {
  try {
    const { personal_id, bank_name, account_number, account_type, ifsc_code, branch_name } = req.body;
    const result = await pool.query(
      'INSERT INTO banking (personal_id, bank_name, account_number, account_type, ifsc_code, branch_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [personal_id, bank_name, account_number, account_type, ifsc_code, branch_name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update banking detail
app.put('/api/banking/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { personal_id, bank_name, account_number, account_type, ifsc_code, branch_name } = req.body;
    const result = await pool.query(
      'UPDATE banking SET personal_id = $1, bank_name = $2, account_number = $3, account_type = $4, ifsc_code = $5, branch_name = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [personal_id, bank_name, account_number, account_type, ifsc_code, branch_name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Banking detail not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete banking detail
app.delete('/api/banking/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM banking WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Banking detail not found' });
    }
    res.json({ message: 'Banking detail deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== FAMILY ROUTES ====================

// Get all family details
app.get('/api/family', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, p.first_name, p.last_name, p.email 
      FROM family f 
      LEFT JOIN personal p ON f.personal_id = p.id 
      ORDER BY f.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get family detail by ID
app.get('/api/family/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM family WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family detail not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get family details by personal ID
app.get('/api/family/personal/:personalId', async (req, res) => {
  try {
    const { personalId } = req.params;
    const result = await pool.query('SELECT * FROM family WHERE personal_id = $1', [personalId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create family detail
app.post('/api/family', async (req, res) => {
  try {
    const { personal_id, relation, name, age, occupation } = req.body;
    const result = await pool.query(
      'INSERT INTO family (personal_id, relation, name, age, occupation) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [personal_id, relation, name, age, occupation]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update family detail
app.put('/api/family/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { personal_id, relation, name, age, occupation } = req.body;
    const result = await pool.query(
      'UPDATE family SET personal_id = $1, relation = $2, name = $3, age = $4, occupation = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [personal_id, relation, name, age, occupation, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family detail not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete family detail
app.delete('/api/family/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM family WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family detail not found' });
    }
    res.json({ message: 'Family detail deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SEARCH ROUTES ====================

// Global search across all tables
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ personal: [], banking: [], family: [] });
    }

    const searchTerm = `%${q}%`;

    const personalResults = await pool.query(
      `SELECT * FROM personal WHERE 
       first_name ILIKE $1 OR 
       last_name ILIKE $1 OR 
       email ILIKE $1 OR 
       phone ILIKE $1 OR 
       address ILIKE $1 
       ORDER BY id DESC`,
      [searchTerm]
    );

    const bankingResults = await pool.query(
      `SELECT b.*, p.first_name, p.last_name, p.email 
       FROM banking b 
       LEFT JOIN personal p ON b.personal_id = p.id 
       WHERE b.bank_name ILIKE $1 OR 
             b.account_number ILIKE $1 OR 
             b.ifsc_code ILIKE $1 OR 
             b.branch_name ILIKE $1 
       ORDER BY b.id DESC`,
      [searchTerm]
    );

    const familyResults = await pool.query(
      `SELECT f.*, p.first_name, p.last_name, p.email 
       FROM family f 
       LEFT JOIN personal p ON f.personal_id = p.id 
       WHERE f.name ILIKE $1 OR 
             f.relation ILIKE $1 OR 
             f.occupation ILIKE $1 
       ORDER BY f.id DESC`,
      [searchTerm]
    );

    res.json({
      personal: personalResults.rows,
      banking: bankingResults.rows,
      family: familyResults.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
