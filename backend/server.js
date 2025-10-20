const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pool = require('./db');



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads', 'body_marks');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bodymark-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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

    // Get vehicles
    const vehiclesResult = await pool.query(
      'SELECT * FROM vehicles WHERE person_id = $1',
      [id]
    );

    // Get body marks
    const bodyMarksResult = await pool.query(
      'SELECT * FROM body_marks WHERE person_id = $1',
      [id]
    );

    // Get used devices
    const devicesResult = await pool.query(
      'SELECT * FROM used_devices WHERE person_id = $1',
      [id]
    );

    // Get call history
    const callHistoryResult = await pool.query(
      'SELECT * FROM call_history WHERE person_id = $1 ORDER BY date_time DESC',
      [id]
    );

    // Get used weapons
    const weaponsResult = await pool.query(
      'SELECT * FROM used_weapons WHERE person_id = $1',
      [id]
    );

    // Get second phone
    const secondPhoneResult = await pool.query(
      'SELECT * FROM second_phone WHERE person_id = $1',
      [id]
    );

    // Format response to match frontend expectations
    const response = {
      id: personResult.rows[0].id,
      personal: {
        id: personResult.rows[0].id,
        first_name: personResult.rows[0].first_name,
        last_name: personResult.rows[0].last_name,
        nic: personResult.rows[0].nic,
        address: personResult.rows[0].address
      },
      bank: bankResult.rows[0] ? {
        account_number: bankResult.rows[0].account_number,
        bank_name: bankResult.rows[0].bank_name,
        branch: bankResult.rows[0].branch,
        balance: parseFloat(bankResult.rows[0].balance)
      } : null,
      family: familyResult.rows.map(member => ({
        relation: member.relation,
        custom_relation: member.custom_relation,
        first_name: member.first_name,
        last_name: member.last_name,
        age: member.age,
        nic: member.nic,
        phone_number: member.phone_number
      })),
      vehicles: vehiclesResult.rows.map(vehicle => ({
        vehicle_number: vehicle.vehicle_number,
        make: vehicle.make,
        model: vehicle.model
      })),
      bodyMarks: bodyMarksResult.rows.map(mark => ({
        type: mark.type,
        location: mark.location,
        description: mark.description,
        picture: mark.picture
      })),
      usedDevices: devicesResult.rows.map(device => ({
        device_type: device.device_type,
        make: device.make,
        model: device.model,
        serial_number: device.serial_number,
        imei_number: device.imei_number
      })),
      callHistory: callHistoryResult.rows.map(call => ({
        device: call.device,
        call_type: call.call_type,
        number: call.number,
        date_time: call.date_time
      })),
      weapons: weaponsResult.rows.map(weapon => ({
        id: weapon.id,
        manufacturer: weapon.manufacturer,
        model: weapon.model,
        caliber_marking: weapon.caliber_marking,
        country_origin: weapon.country_origin,
        serial_number: weapon.serial_number
      })),
      secondPhone: secondPhoneResult.rows[0] ? {
        whatsapp: secondPhoneResult.rows[0].whatsapp,
        telegram: secondPhoneResult.rows[0].telegram,
        viber: secondPhoneResult.rows[0].viber,
        other: secondPhoneResult.rows[0].other,
        mobile: secondPhoneResult.rows[0].mobile,
        landline: secondPhoneResult.rows[0].landline
      } : {
        whatsapp: '',
        telegram: '',
        viber: '',
        other: '',
        mobile: '',
        landline: ''
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error('GET /api/person/:id error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// 3. CREATE NEW PERSON
app.post('/api/person', checkDbConnection, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { personal, bank, family, vehicles, bodyMarks, usedDevices, callHistory, weapons, secondPhone } = req.body;
    
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
          `INSERT INTO family_members (person_id, relation, custom_relation, first_name, last_name, age, nic, phone_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [personId, member.relation, member.customRelation || null, member.firstName, member.lastName || null, member.age || null, member.nic || null, member.phoneNumber || null]
        );
      }
    }

    // Insert vehicles if provided
    if (vehicles && vehicles.length > 0) {
      for (const vehicle of vehicles) {
        await client.query(
          `INSERT INTO vehicles (person_id, vehicle_number, make, model)
           VALUES ($1, $2, $3, $4)`,
          [personId, vehicle.vehicleNumber, vehicle.make, vehicle.model]
        );
      }
    }

    // Insert body marks if provided
    if (bodyMarks && bodyMarks.length > 0) {
      for (const mark of bodyMarks) {
        await client.query(
          `INSERT INTO body_marks (person_id, type, location, description, picture)
           VALUES ($1, $2, $3, $4, $5)`,
          [personId, mark.type, mark.location, mark.description || null, mark.picture || null]
        );
      }
    }

    // Insert used devices if provided
    if (usedDevices && usedDevices.length > 0) {
      for (const device of usedDevices) {
        await client.query(
          `INSERT INTO used_devices (person_id, device_type, make, model, serial_number, imei_number)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [personId, device.deviceType, device.make || null, device.model || null, device.serialNumber || null, device.imeiNumber || null]
        );
      }
    }

    // Insert call history if provided
    if (callHistory && callHistory.length > 0) {
      for (const call of callHistory) {
        await client.query(
          `INSERT INTO call_history (person_id, device, call_type, number, date_time)
           VALUES ($1, $2, $3, $4, $5)`,
          [personId, call.device, call.callType, call.number, call.dateTime]
        );
      }
    }

    // Insert weapons if provided
    if (weapons && weapons.length > 0) {
      for (const weapon of weapons) {
        await client.query(
          `INSERT INTO used_weapons (person_id, manufacturer, model, caliber_marking, country_origin, serial_number)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [personId, weapon.manufacturer, weapon.model, weapon.caliber_marking, weapon.country_origin, weapon.serial_number]
        );
      }
    }

    // Insert second phone if provided
    if (secondPhone) {
      await client.query(
        `INSERT INTO second_phone (person_id, whatsapp, telegram, viber, other, mobile, landline)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [personId, secondPhone.whatsapp || null, secondPhone.telegram || null, secondPhone.viber || null, secondPhone.other || null, secondPhone.mobile || null, secondPhone.landline || null]
      );
    }
    
    await client.query('COMMIT');
    res.json({ id: personId, message: 'Person created successfully' });
    
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('POST /api/person error:', err);
    res.status(500).json({ error: 'Failed to create person', details: err.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// 4. UPDATE PERSON
app.put('/api/person/:id', checkDbConnection, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { personal, bank, family, vehicles, bodyMarks, usedDevices, callHistory, weapons, secondPhone } = req.body;
    
    await client.query('BEGIN');
    
    // Update person
    await client.query(
      `UPDATE people 
       SET first_name = $1, last_name = $2, nic = $3, address = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [personal.firstName, personal.lastName, personal.nic, personal.address, id]
    );
    
    // Update or insert bank details
    if (bank && bank.accountNumber) {
      const bankExists = await client.query(
        'SELECT id FROM bank_accounts WHERE person_id = $1',
        [id]
      );
      
      if (bankExists.rows.length > 0) {
        await client.query(
          `UPDATE bank_accounts 
           SET account_number = $1, bank_name = $2, branch = $3, balance = $4, updated_at = CURRENT_TIMESTAMP
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
    } else {
      // Remove bank account if no data provided
      await client.query('DELETE FROM bank_accounts WHERE person_id = $1', [id]);
    }
    
    // Delete and recreate all related records (simpler approach)
    await client.query('DELETE FROM family_members WHERE person_id = $1', [id]);
    await client.query('DELETE FROM vehicles WHERE person_id = $1', [id]);
    await client.query('DELETE FROM body_marks WHERE person_id = $1', [id]);
    await client.query('DELETE FROM used_devices WHERE person_id = $1', [id]);
    await client.query('DELETE FROM call_history WHERE person_id = $1', [id]);
    await client.query('DELETE FROM used_weapons WHERE person_id = $1', [id]);
    await client.query('DELETE FROM second_phone WHERE person_id = $1', [id]);
    
    // Re-insert all data
    if (family && family.length > 0) {
      for (const member of family) {
        await client.query(
          `INSERT INTO family_members (person_id, relation, custom_relation, first_name, last_name, age, nic, phone_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, member.relation, member.customRelation || null, member.firstName, member.lastName || null, member.age || null, member.nic || null, member.phoneNumber || null]
        );
      }
    }

    if (vehicles && vehicles.length > 0) {
      for (const vehicle of vehicles) {
        await client.query(
          `INSERT INTO vehicles (person_id, vehicle_number, make, model)
           VALUES ($1, $2, $3, $4)`,
          [id, vehicle.vehicleNumber, vehicle.make, vehicle.model]
        );
      }
    }

    if (bodyMarks && bodyMarks.length > 0) {
      for (const mark of bodyMarks) {
        await client.query(
          `INSERT INTO body_marks (person_id, type, location, description, picture)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, mark.type, mark.location, mark.description || null, mark.picture || null]
        );
      }
    }

    if (usedDevices && usedDevices.length > 0) {
      for (const device of usedDevices) {
        await client.query(
          `INSERT INTO used_devices (person_id, device_type, make, model, serial_number, imei_number)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, device.deviceType, device.make || null, device.model || null, device.serialNumber || null, device.imeiNumber || null]
        );
      }
    }

    if (callHistory && callHistory.length > 0) {
      for (const call of callHistory) {
        await client.query(
          `INSERT INTO call_history (person_id, device, call_type, number, date_time)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, call.device, call.callType, call.number, call.dateTime]
        );
      }
    }

    // Insert weapons if provided
    if (weapons && weapons.length > 0) {
      for (const weapon of weapons) {
        await client.query(
          `INSERT INTO used_weapons (person_id, manufacturer, model, caliber_marking, country_origin, serial_number)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, weapon.manufacturer, weapon.model, weapon.caliber_marking, weapon.country_origin, weapon.serial_number]
        );
      }
    }

    // Insert second phone if provided
    if (secondPhone) {
      await client.query(
        `INSERT INTO second_phone (person_id, whatsapp, telegram, viber, other, mobile, landline)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, secondPhone.whatsapp || null, secondPhone.telegram || null, secondPhone.viber || null, secondPhone.other || null, secondPhone.mobile || null, secondPhone.landline || null]
      );
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Person updated successfully' });
    
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('PUT /api/person/:id error:', err);
    res.status(500).json({ error: 'Failed to update person', details: err.message });
  } finally {
    if (client) {
      client.release();
    }
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

// ============================================
// USED WEAPONS API ROUTES
// ============================================

// GET all weapons for a person
app.get('/api/person/:id/weapons', checkDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM used_weapons WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weapons' });
  }
});

// POST new weapon
app.post('/api/person/:id/weapons', checkDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const { manufacturer, model, caliber_marking, country_origin, serial_number } = req.body;
    
    const result = await pool.query(
      `INSERT INTO used_weapons (person_id, manufacturer, model, caliber_marking, country_origin, serial_number)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, manufacturer, model, caliber_marking, country_origin, serial_number]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add weapon' });
  }
});

// PUT update weapon
app.put('/api/weapons/:weaponId', checkDbConnection, async (req, res) => {
  try {
    const { weaponId } = req.params;
    const { manufacturer, model, caliber_marking, country_origin, serial_number } = req.body;
    
    const result = await pool.query(
      `UPDATE used_weapons 
       SET manufacturer = $1, model = $2, caliber_marking = $3, country_origin = $4, serial_number = $5
       WHERE id = $6 RETURNING *`,
      [manufacturer, model, caliber_marking, country_origin, serial_number, weaponId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update weapon' });
  }
});

// DELETE weapon
app.delete('/api/weapons/:weaponId', checkDbConnection, async (req, res) => {
  try {
    const { weaponId } = req.params;
    await pool.query('DELETE FROM used_weapons WHERE id = $1', [weaponId]);
    res.json({ message: 'Weapon deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete weapon' });
  }
});

// ============================================
// SECOND PHONE API ROUTES
// ============================================

// GET second phone for a person
app.get('/api/person/:id/second-phone', checkDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM second_phone WHERE person_id = $1',
      [id]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch second phone' });
  }
});

// POST/PUT second phone (upsert)
app.post('/api/person/:id/second-phone', checkDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const { whatsapp, telegram, viber, other, mobile, landline } = req.body;
    
    // Check if record exists
    const existingResult = await pool.query(
      'SELECT id FROM second_phone WHERE person_id = $1',
      [id]
    );
    
    let result;
    if (existingResult.rows.length > 0) {
      // Update existing record
      result = await pool.query(
        `UPDATE second_phone 
         SET whatsapp = $1, telegram = $2, viber = $3, other = $4, mobile = $5, landline = $6
         WHERE person_id = $7 RETURNING *`,
        [whatsapp, telegram, viber, other, mobile, landline, id]
      );
    } else {
      // Insert new record
      result = await pool.query(
        `INSERT INTO second_phone (person_id, whatsapp, telegram, viber, other, mobile, landline)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [id, whatsapp, telegram, viber, other, mobile, landline]
      );
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save second phone' });
  }
});

// ============================================
// BODY MARKS IMAGE UPLOAD API ROUTES
// ============================================

// POST upload body mark image
app.post('/api/person/:id/body-marks/upload', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, location, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imagePath = `/uploads/body_marks/${req.file.filename}`;
    
    const result = await pool.query(
      `INSERT INTO body_marks (person_id, type, location, description, picture)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, type, location, description, imagePath]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload body mark image' });
  }
});

// PUT update body mark with optional image
app.put('/api/body-marks/:markId', upload.single('image'), async (req, res) => {
  try {
    const { markId } = req.params;
    const { type, location, description } = req.body;
    
    let updateQuery;
    let updateValues;
    
    if (req.file) {
      // Update with new image
      const imagePath = `/uploads/body_marks/${req.file.filename}`;
      updateQuery = `UPDATE body_marks 
                    SET type = $1, location = $2, description = $3, picture = $4
                    WHERE id = $5 RETURNING *`;
      updateValues = [type, location, description, imagePath, markId];
    } else {
      // Update without changing image
      updateQuery = `UPDATE body_marks 
                    SET type = $1, location = $2, description = $3
                    WHERE id = $4 RETURNING *`;
      updateValues = [type, location, description, markId];
    }
    
    const result = await pool.query(updateQuery, updateValues);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update body mark' });
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

// Start server with explicit IPv4 binding
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log(`🚀 Also available at http://localhost:${PORT}`);
});

// Add server error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1, '127.0.0.1');
  }
});

server.on('connection', (socket) => {
  console.log('🔌 New connection established');
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});