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
      { 
        relation: 'Wife', 
        custom_relation: '', 
        first_name: 'Jane', 
        last_name: 'Doe', 
        age: 28, 
        nic: '199112345678', 
        phone_number: '+15550123' 
      },
      { 
        relation: 'Son', 
        custom_relation: '', 
        first_name: 'Tommy', 
        last_name: 'Doe', 
        age: 8, 
        nic: '', 
        phone_number: '' 
      },
      { 
        relation: 'Friend', 
        custom_relation: '', 
        first_name: 'Mike', 
        last_name: 'Johnson', 
        age: 32, 
        nic: '198812345678', 
        phone_number: '+15550456' 
      }
    ],
    vehicles: [
      {
        vehicle_number: 'CAG4455',
        make: 'TOYOTA',
        model: 'PRADO 150'
      },
      {
        vehicle_number: 'ABC1234',
        make: 'HONDA',
        model: 'CIVIC'
      }
    ],
    bodyMarks: [
      {
        type: 'Tattoo',
        location: 'behind the right ear',
        description: 'text says "gang"',
        picture: ''
      }
    ],
    usedDevices: [
      {
        device_type: 'Phone',
        make: 'Samsung',
        model: 'Galaxy S21',
        serial_number: 'SN123456789',
        imei_number: '354123456789012'
      },
      {
        device_type: 'Laptop',
        make: 'Apple',
        model: 'MacBook Pro',
        serial_number: 'MB987654321',
        imei_number: ''
      }
    ],
    callHistory: [
      {
        device: 'Phone - Samsung Galaxy S21',
        call_type: 'Outgoing',
        number: '+15550123',
        date_time: '2024-10-19T14:30:00'
      },
      {
        device: 'Phone - Samsung Galaxy S21',
        call_type: 'Incoming',
        number: '+15550456',
        date_time: '2024-10-19T15:45:00'
      },
      {
        device: 'Phone - Samsung Galaxy S21',
        call_type: 'Missed Call',
        number: '+15559999',
        date_time: '2024-10-19T16:20:00'
      }
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
  const { personal, bank, family, vehicles, bodyMarks, usedDevices, callHistory } = req.body;
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
    family: (family || []).map(member => ({
      relation: member.relation,
      custom_relation: member.customRelation || '',
      first_name: member.firstName,
      last_name: member.lastName,
      age: member.age || null,
      nic: member.nic || '',
      phone_number: member.phoneNumber || ''
    })),
    vehicles: (vehicles || []).map(vehicle => ({
      vehicle_number: vehicle.vehicleNumber,
      make: vehicle.make,
      model: vehicle.model
    })),
    bodyMarks: (bodyMarks || []).map(mark => ({
      type: mark.type,
      location: mark.location,
      description: mark.description,
      picture: mark.picture
    })),
    usedDevices: (usedDevices || []).map(device => ({
      device_type: device.deviceType,
      make: device.make,
      model: device.model,
      serial_number: device.serialNumber,
      imei_number: device.imeiNumber
    })),
    callHistory: (callHistory || []).map(call => ({
      device: call.device,
      call_type: call.callType,
      number: call.number,
      date_time: call.dateTime
    }))
  };
  
  mockPeople.push(newPerson);
  res.json({ id: newPerson.id, message: 'Person created successfully' });
});

app.put('/api/person/:id', (req, res) => {
  const personIndex = mockPeople.findIndex(p => p.id === parseInt(req.params.id));
  if (personIndex === -1) {
    return res.status(404).json({ error: 'Person not found' });
  }
  
  const { personal, bank, family, vehicles, bodyMarks, usedDevices, callHistory } = req.body;
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
    family: (family || []).map(member => ({
      relation: member.relation,
      custom_relation: member.customRelation || '',
      first_name: member.firstName,
      last_name: member.lastName,
      age: member.age || null,
      nic: member.nic || '',
      phone_number: member.phoneNumber || ''
    })),
    vehicles: (vehicles || []).map(vehicle => ({
      vehicle_number: vehicle.vehicleNumber,
      make: vehicle.make,
      model: vehicle.model
    })),
    bodyMarks: (bodyMarks || []).map(mark => ({
      type: mark.type,
      location: mark.location,
      description: mark.description,
      picture: mark.picture
    })),
    usedDevices: (usedDevices || []).map(device => ({
      device_type: device.deviceType,
      make: device.make,
      model: device.model,
      serial_number: device.serialNumber,
      imei_number: device.imeiNumber
    })),
    callHistory: (callHistory || []).map(call => ({
      device: call.device,
      call_type: call.callType,
      number: call.number,
      date_time: call.dateTime
    }))
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