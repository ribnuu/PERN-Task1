const express = require('express');
const cors = require('cors');

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
const PORT = 4444;

app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint called successfully');
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

app.get('/api/person/:id', (req, res) => {
  console.log('✅ Person endpoint called with ID:', req.params.id);
  res.json({ 
    id: req.params.id, 
    personal: { 
      first_name: 'Test', 
      last_name: 'User' 
    },
    message: 'Mock response without database' 
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

console.log('✅ Server setup complete');