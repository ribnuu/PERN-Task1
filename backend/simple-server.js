const express = require('express');
const cors = require('cors');
const pool = require('./db');

// Add process error handlers for debugging
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Server is working!' });
});

// Simplified person endpoint
app.get('/api/person/:id', async (req, res) => {
  console.log('Person endpoint called with ID:', req.params.id);
  try {
    const { id } = req.params;
    console.log('About to query database...');
    
    // Simple query first
    const personResult = await pool.query(
      'SELECT id, first_name, last_name, nic, address FROM people WHERE id = $1',
      [id]
    );
    
    console.log('Database query successful, rows:', personResult.rows.length);
    
    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    const response = {
      id: personResult.rows[0].id,
      personal: {
        id: personResult.rows[0].id,
        first_name: personResult.rows[0].first_name,
        last_name: personResult.rows[0].last_name,
        nic: personResult.rows[0].nic,
        address: personResult.rows[0].address
      }
    };
    
    console.log('Sending response...');
    res.json(response);
    
  } catch (err) {
    console.error('❌ GET /api/person/:id error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
});