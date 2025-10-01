// Development mode server with mock data - use when database is not available
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001; // Different port to avoid conflicts

app.use(cors());
app.use(express.json());

// Mock data for development
let mockPeople = [
  {
    id: 1,
    personal: { id: 1, first_name: 'John', last_name: 'Doe', nic: '199012345678', address: '123 Main St' },
    bank: { account_number: '1001234567', bank_name: 'Test Bank', branch: 'Main Branch', balance: 50000 },
    family: [
      { relation: 'Spouse', first_name: 'Jane', last_name: 'Doe', nic: '199112345678' }
    ]
  }
];

let nextId = 2;

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dashboard API (Development Mode) is running',
    mode: 'development',
    note: 'Using mock data - no database required'
  });
});

app.get('/api/search', (req, res) => {
  const { query } = req.query;
  const results = mockPeople
    .filter(p => 
      p.personal.first_name.toLowerCase().includes(query.toLowerCase()) ||
      p.personal.last_name.toLowerCase().includes(query.toLowerCase()) ||
      p.personal.nic.includes(query)
    )
    .map(p => ({
      id: p.id,
      first_name: p.personal.first_name,
      last_name: p.personal.last_name,
      nic: p.personal.nic
    }));
  
  res.json(results);
});

app.get('/api/person/:id', (req, res) => {
  const person = mockPeople.find(p => p.id === parseInt(req.params.id));
  if (!person) {
    return res.status(404).json({ error: 'Person not found' });
  }
  res.json(person);
});

app.post('/api/person', (req, res) => {
  const { personal, bank, family } = req.body;
  const newPerson = {
    id: nextId++,
    personal: { 
      id: nextId - 1, 
      first_name: personal.firstName,
      last_name: personal.lastName,
      nic: personal.nic,
      address: personal.address
    },
    bank: bank ? {
      account_number: bank.accountNumber,
      bank_name: bank.bankName,
      branch: bank.branch,
      balance: bank.balance || 0
    } : null,
    family: family || []
  };
  
  mockPeople.push(newPerson);
  res.json({ id: newPerson.id, message: 'Person created successfully' });
});

app.put('/api/person/:id', (req, res) => {
  const personIndex = mockPeople.findIndex(p => p.id === parseInt(req.params.id));
  if (personIndex === -1) {
    return res.status(404).json({ error: 'Person not found' });
  }
  
  const { personal, bank, family } = req.body;
  mockPeople[personIndex] = {
    id: parseInt(req.params.id),
    personal: { 
      id: parseInt(req.params.id),
      first_name: personal.firstName,
      last_name: personal.lastName,
      nic: personal.nic,
      address: personal.address
    },
    bank: bank ? {
      account_number: bank.accountNumber,
      bank_name: bank.bankName,
      branch: bank.branch,
      balance: bank.balance || 0
    } : null,
    family: family || []
  };
  
  res.json({ message: 'Person updated successfully' });
});

app.delete('/api/person/:id', (req, res) => {
  const personIndex = mockPeople.findIndex(p => p.id === parseInt(req.params.id));
  if (personIndex === -1) {
    return res.status(404).json({ error: 'Person not found' });
  }
  
  mockPeople.splice(personIndex, 1);
  res.json({ message: 'Person deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`🚀 Development Server running on http://localhost:${PORT}`);
  console.log('📝 Using mock data - no database required');
  console.log('💡 Switch to port 5000 once database is connected');
});