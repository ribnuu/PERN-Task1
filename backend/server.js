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
app.use('/Properties', express.static(path.join(__dirname, 'Properties')));

// Configure multer for body marks file uploads
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

// Configure multer for properties documents
const propertiesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'Properties');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const personId = req.params.id || req.body.personId || 'unknown';
    cb(null, `property-${personId}-${uniqueSuffix}${path.extname(file.originalname)}`);
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

const uploadProperties = multer({ 
  storage: propertiesStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|jpeg|jpg|png|gif|txt|rtf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|image\/(jpeg|jpg|png|gif)|text\/(plain|rtf)/.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document and image files are allowed!'));
    }
  }
});

// Add middleware to check database connection
const checkDbConnection = (req, res, next) => {
  // Just pass through for now - the pool will handle connection errors
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
      `SELECT DISTINCT p.id, p.first_name, p.last_name, p.nic, p.passport, p.full_name 
       FROM people p
       LEFT JOIN gang_details g ON p.id = g.person_id
       LEFT JOIN lawyers l ON p.id = l.person_id
       WHERE p.first_name ILIKE $1 OR p.last_name ILIKE $1 OR p.nic ILIKE $1 
          OR p.passport ILIKE $1 OR p.full_name ILIKE $1 OR g.gang_name ILIKE $1
          OR l.lawyer_full_name ILIKE $1 OR l.law_firm_or_company ILIKE $1
       ORDER BY p.first_name`,
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

    // Get call history with name resolution
    const callHistoryResult = await pool.query(
      `SELECT ch.*, 
        (SELECT p2.full_name 
         FROM second_phone sp 
         JOIN people p2 ON sp.person_id = p2.id 
         WHERE (sp.mobile = ch.number OR sp.whatsapp = ch.number OR sp.viber = ch.number OR sp.other = ch.number)
         LIMIT 1) AS contact_name
       FROM call_history ch 
       WHERE ch.person_id = $1 
       ORDER BY ch.date_time DESC`,
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

    // Get gang details
    const gangResult = await pool.query(
      'SELECT * FROM gang_details WHERE person_id = $1 ORDER BY from_date DESC',
      [id]
    );

    // Get enemy individuals
    const enemyIndividualsResult = await pool.query(
      `SELECT ei.*, p.first_name, p.last_name, p.nic 
       FROM enemy_individuals ei 
       JOIN people p ON ei.enemy_person_id = p.id 
       WHERE ei.person_id = $1 ORDER BY ei.created_at DESC`,
      [id]
    );

    // Get enemy gangs
    const enemyGangsResult = await pool.query(
      'SELECT * FROM enemy_gangs WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Get corrupted officials
    const corruptedOfficialsResult = await pool.query(
      `SELECT co.*, p.first_name, p.last_name, p.nic, p.passport 
       FROM corrupted_officials co 
       JOIN people p ON co.official_person_id = p.id 
       WHERE co.person_id = $1 ORDER BY co.created_at DESC`,
      [id]
    );

    // Get properties
    const propertiesResult = await pool.query(
      'SELECT * FROM properties WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );
    console.log('Properties query result for person', id, ':', propertiesResult.rows.length, 'properties found');

    // Get addresses
    const addressesResult = await pool.query(
      'SELECT * FROM addresses WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );
    console.log('Addresses query result for person', id, ':', addressesResult.rows.length, 'addresses found');

    // Get social media
    const socialMediaResult = await pool.query(
      'SELECT * FROM social_media WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Get occupations
    const occupationsResult = await pool.query(
      'SELECT * FROM occupations WHERE person_id = $1 ORDER BY from_date DESC',
      [id]
    );

    // Get lawyers
    const lawyersResult = await pool.query(
      'SELECT * FROM lawyers WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Get court cases
    const courtCasesResult = await pool.query(
      'SELECT * FROM court_cases WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Get active areas
    const activeAreasResult = await pool.query(
      'SELECT * FROM active_areas WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Get relatives officials
    const relativesOfficialsResult = await pool.query(
      'SELECT * FROM relatives_officials WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Get bank details
    const bankDetailsResult = await pool.query(
      'SELECT * FROM bank_details WHERE person_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Format response to match frontend expectations
    const response = {
      id: personResult.rows[0].id,
      personal: {
        id: personResult.rows[0].id,
        first_name: personResult.rows[0].first_name,
        last_name: personResult.rows[0].last_name,
        full_name: personResult.rows[0].full_name,
        aliases: personResult.rows[0].aliases,
        passport: personResult.rows[0].passport,
        nic: personResult.rows[0].nic,
        height: personResult.rows[0].height,
        religion: personResult.rows[0].religion,
        gender: personResult.rows[0].gender,
        date_of_birth: personResult.rows[0].date_of_birth,
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
        contact_name: call.contact_name,
        display_name: call.contact_name || call.number,
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
      },
      properties: propertiesResult.rows.map(property => ({
        id: property.id,
        property_type: property.property_type,
        status: property.status,
        description: property.description,
        value: parseFloat(property.value),
        purchase_date: property.purchase_date,
        sale_date: property.sale_date,
        location: property.location,
        documents: property.documents,
        buyer_name: property.buyer_name,
        buyer_nic: property.buyer_nic,
        buyer_passport: property.buyer_passport,
        owner_full_name: property.owner_full_name,
        owner_nic: property.owner_nic,
        owner_passport: property.owner_passport
      })),
      gangDetails: gangResult.rows.map(gang => ({
        id: gang.id,
        gang_name: gang.gang_name,
        position_in_gang: gang.position_in_gang,
        from_date: gang.from_date,
        to_date: gang.to_date,
        currently_active: gang.currently_active
      })),
      enemies: {
        individuals: enemyIndividualsResult.rows.map(enemy => ({
          id: enemy.id,
          enemy_person_id: enemy.enemy_person_id,
          enemy_name: `${enemy.first_name} ${enemy.last_name}`,
          enemy_nic: enemy.nic,
          relationship_type: enemy.relationship_type,
          threat_level: enemy.threat_level,
          notes: enemy.notes
        })),
        gangs: enemyGangsResult.rows.map(gang => ({
          id: gang.id,
          gang_name: gang.gang_name,
          threat_level: gang.threat_level,
          notes: gang.notes
        }))
      },
      corruptedOfficials: corruptedOfficialsResult.rows.map(official => ({
        id: official.id,
        official_person_id: official.official_person_id,
        official_name: `${official.first_name} ${official.last_name}`,
        official_nic: official.nic,
        official_passport: official.passport,
        department: official.department,
        corruption_type: official.corruption_type,
        notes: official.notes
      })),
      socialMedia: socialMediaResult.rows.map(social => ({
        id: social.id,
        platform: social.platform,
        url: social.url,
        username: social.username,
        password: social.password
      })),
      occupations: occupationsResult.rows.map(occupation => ({
        id: occupation.id,
        jobTitle: occupation.job_title,
        company: occupation.company,
        fromDate: occupation.from_date ? occupation.from_date.toISOString().split('T')[0] : null,
        toDate: occupation.to_date ? occupation.to_date.toISOString().split('T')[0] : null,
        currently: occupation.currently_active
      })),
      lawyers: lawyersResult.rows.map(lawyer => ({
        id: lawyer.id,
        lawyer_full_name: lawyer.lawyer_full_name,
        law_firm_or_company: lawyer.law_firm_or_company,
        phone_number: lawyer.phone_number,
        case_number: lawyer.case_number
      })),
      courtCases: courtCasesResult.rows.map(courtCase => ({
        id: courtCase.id,
        case_number: courtCase.case_number,
        courts: courtCase.courts,
        description: courtCase.description
      })),
      activeAreas: activeAreasResult.rows.map(activeArea => ({
        id: activeArea.id,
        town: activeArea.town,
        district: activeArea.district,
        province: activeArea.province,
        fromDate: activeArea.from_date ? activeArea.from_date.toISOString().split('T')[0] : null,
        toDate: activeArea.to_date ? activeArea.to_date.toISOString().split('T')[0] : null,
        isActive: activeArea.is_active,
        addressSelection: activeArea.address_selection
      })),
      relativesOfficials: relativesOfficialsResult.rows.map(relativesOfficial => ({
        id: relativesOfficial.id,
        full_name: relativesOfficial.full_name,
        nic_number: relativesOfficial.nic_number,
        passport_number: relativesOfficial.passport_number,
        department: relativesOfficial.department,
        description: relativesOfficial.description
      })),
      bankDetails: bankDetailsResult.rows.map(bankDetail => ({
        id: bankDetail.id,
        account_type: bankDetail.account_type,
        bank_name: bankDetail.bank_name,
        account_number: bankDetail.account_number,
        account_holder_name: bankDetail.account_holder_name,
        branch: bankDetail.branch,
        swift_code: bankDetail.swift_code,
        routing_number: bankDetail.routing_number,
        balance: bankDetail.balance,
        interest_rate: bankDetail.interest_rate,
        card_number: bankDetail.card_number,
        expiry_date: bankDetail.expiry_date,
        cvv: bankDetail.cvv,
        credit_limit: bankDetail.credit_limit,
        loan_amount: bankDetail.loan_amount,
        loan_term: bankDetail.loan_term,
        monthly_payment: bankDetail.monthly_payment
      })),
      addresses: addressesResult.rows.map(address => ({
        id: address.id,
        number: address.number,
        street1: address.street1,
        street2: address.street2,
        town: address.town,
        district: address.district,
        province: address.province,
        policeArea: address.police_area,
        policeDivision: address.police_division,
        fromDate: address.from_date ? address.from_date.toISOString().split('T')[0] : null,
        endDate: address.end_date ? address.end_date.toISOString().split('T')[0] : null,
        isCurrentlyActive: address.is_currently_active
      }))
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
    const { personal, gangDetails, bank, family, vehicles, bodyMarks, usedDevices, callHistory, weapons, secondPhone, properties } = req.body;
    
    await client.query('BEGIN');
    
    // Format address - handle both string and object formats
    let addressString = '';
    if (typeof personal.address === 'object' && personal.address !== null) {
      const addr = personal.address;
      addressString = [
        addr.number || '',
        addr.street1 || '',
        addr.street2 || '',
        addr.town || '',
        addr.district || '',
        addr.province || '',
        addr.policeArea || '',
        addr.policeDivision || ''
      ].join('|');
    } else {
      addressString = personal.address || '';
    }

    // Insert person
    const personResult = await client.query(
      `INSERT INTO people (first_name, last_name, full_name, aliases, passport, nic, height, religion, gender, date_of_birth, address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        personal.firstName, 
        personal.lastName, 
        personal.fullName || `${personal.firstName} ${personal.lastName}`,
        personal.aliases,
        personal.passport,
        personal.nic, 
        personal.height ? parseFloat(personal.height) : null,
        personal.religion,
        personal.gender || null, // Use null if gender is empty or undefined
        personal.dateOfBirth || null,
        addressString
      ]
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

    // Insert gang details if provided
    if (gangDetails && gangDetails.length > 0) {
      for (const gang of gangDetails) {
        // Skip empty gang details
        if (!gang.gangName || !gang.position) {
          continue;
        }
        await client.query(
          `INSERT INTO gang_details (person_id, gang_name, position_in_gang, from_date, to_date, currently_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [personId, gang.gangName, gang.position, gang.fromDate || null, gang.toDate || null, gang.currentlyActive || false]
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
          [personId, call.device, call.callType, call.number, call.dateTime || null]
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

    // Insert properties if provided
    if (properties && properties.length > 0) {
      for (const property of properties) {
        await client.query(
          `INSERT INTO properties (person_id, property_type, status, description, value, purchase_date, sale_date, location, documents, buyer_name, buyer_nic, buyer_passport, owner_full_name, owner_nic, owner_passport)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            personId, 
            property.propertyType, 
            property.status, 
            property.description || null, 
            property.value || 0, 
            property.purchaseDate || null, 
            property.saleDate || null, 
            property.location || null, 
            property.documents || null, 
            property.buyerName || null, 
            property.buyerNIC || null, 
            property.buyerPassport || null,
            property.ownerFullName || null,
            property.ownerNic || null,
            property.ownerPassport || null
          ]
        );
      }
    }

    // Insert social media if provided
    if (req.body.socialMedia && req.body.socialMedia.length > 0) {
      for (const social of req.body.socialMedia) {
        await client.query(
          `INSERT INTO social_media (person_id, platform, url, username, password)
           VALUES ($1, $2, $3, $4, $5)`,
          [personId, social.platform, social.url || null, social.username || null, social.password || null]
        );
      }
    }

    // Insert occupations if provided
    if (req.body.occupations && req.body.occupations.length > 0) {
      for (const occupation of req.body.occupations) {
        // Skip entries with empty job_title since it's required
        if (!occupation.jobTitle || occupation.jobTitle.trim() === '') {
          console.log('Skipping occupation with empty job_title');
          continue;
        }
        await client.query(
          `INSERT INTO occupations (person_id, job_title, company, from_date, to_date, currently_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [personId, occupation.jobTitle.trim(), occupation.company || null, occupation.fromDate || null, occupation.toDate || null, occupation.currently || false]
        );
      }
    }

    // Insert lawyers if provided
    if (req.body.lawyers && req.body.lawyers.length > 0) {
      for (const lawyer of req.body.lawyers) {
        // Skip entries with empty lawyer_full_name since it's required
        if (!lawyer.lawyerFullName || lawyer.lawyerFullName.trim() === '') {
          continue;
        }
        await client.query(
          `INSERT INTO lawyers (person_id, lawyer_full_name, law_firm_or_company, phone_number, case_number)
           VALUES ($1, $2, $3, $4, $5)`,
          [personId, lawyer.lawyerFullName.trim(), lawyer.lawFirmOrCompany || null, lawyer.phoneNumber || null, lawyer.caseNumber || null]
        );
      }
    }

    // Insert court cases if provided
    if (req.body.courtCases && req.body.courtCases.length > 0) {
      for (const courtCase of req.body.courtCases) {
        // Skip entries with empty case_number since it's required
        if (!courtCase.caseNumber || courtCase.caseNumber.trim() === '') {
          continue;
        }
        await client.query(
          `INSERT INTO court_cases (person_id, case_number, courts, description)
           VALUES ($1, $2, $3, $4)`,
          [personId, courtCase.caseNumber.trim(), courtCase.courts || null, courtCase.description || null]
        );
      }
    }

    // Insert active areas if provided
    if (req.body.activeAreas && req.body.activeAreas.length > 0) {
      for (const activeArea of req.body.activeAreas) {
        await client.query(
          `INSERT INTO active_areas (person_id, town, district, province, from_date, to_date, is_active, address_selection)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            personId, 
            activeArea.town || null, 
            activeArea.district || null, 
            activeArea.province || null, 
            activeArea.fromDate && activeArea.fromDate.trim() !== '' ? activeArea.fromDate : null, 
            // Set to_date to NULL if currently active
            activeArea.isActive ? null : (activeArea.toDate && activeArea.toDate.trim() !== '' ? activeArea.toDate : null), 
            activeArea.isActive || false, 
            activeArea.addressSelection || null
          ]
        );
      }
    }

    // Insert relatives officials if provided
    if (req.body.relativesOfficials && req.body.relativesOfficials.length > 0) {
      for (const relativesOfficial of req.body.relativesOfficials) {
        // Skip entries with empty full_name since it's required
        if (!relativesOfficial.fullName || relativesOfficial.fullName.trim() === '') {
          continue;
        }

        // Auto-create person if they don't exist and we have NIC or passport
        if ((relativesOfficial.nicNumber && relativesOfficial.nicNumber.trim() !== '') || 
            (relativesOfficial.passportNumber && relativesOfficial.passportNumber.trim() !== '')) {
          
          let existingPerson = null;
          
          // Check if person already exists by NIC
          if (relativesOfficial.nicNumber && relativesOfficial.nicNumber.trim() !== '') {
            const nicCheck = await client.query('SELECT id FROM people WHERE nic = $1', [relativesOfficial.nicNumber.trim()]);
            if (nicCheck.rows.length > 0) {
              existingPerson = nicCheck.rows[0];
            }
          }
          
          // If not found by NIC, check by passport
          if (!existingPerson && relativesOfficial.passportNumber && relativesOfficial.passportNumber.trim() !== '') {
            const passportCheck = await client.query('SELECT id FROM people WHERE passport = $1', [relativesOfficial.passportNumber.trim()]);
            if (passportCheck.rows.length > 0) {
              existingPerson = passportCheck.rows[0];
            }
          }
          
          // Create new person if doesn't exist
          if (!existingPerson) {
            console.log('Creating new person for relatives official:', relativesOfficial.fullName);
            const nameParts = relativesOfficial.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            const newPersonResult = await client.query(
              `INSERT INTO people (first_name, last_name, full_name, nic, passport, created_at) 
               VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id`,
              [
                firstName,
                lastName,
                relativesOfficial.fullName.trim(),
                relativesOfficial.nicNumber && relativesOfficial.nicNumber.trim() !== '' ? relativesOfficial.nicNumber.trim() : null,
                relativesOfficial.passportNumber && relativesOfficial.passportNumber.trim() !== '' ? relativesOfficial.passportNumber.trim() : null
              ]
            );
            console.log('Created new person with ID:', newPersonResult.rows[0].id);
          }
        }

        await client.query(
          `INSERT INTO relatives_officials (person_id, full_name, nic_number, passport_number, department, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [personId, relativesOfficial.fullName.trim(), relativesOfficial.nicNumber || null, relativesOfficial.passportNumber || null, relativesOfficial.department || null, relativesOfficial.description || null]
        );
      }
    }

    // Insert bank details if provided
    if (req.body.bankDetails && req.body.bankDetails.length > 0) {
      for (const bankDetail of req.body.bankDetails) {
        // Skip entries with empty account_type since it's required
        if (!bankDetail.accountType || bankDetail.accountType.trim() === '') {
          continue;
        }
        await client.query(
          `INSERT INTO bank_details (person_id, account_type, bank_name, account_number, account_holder_name, branch, swift_code, routing_number, balance, interest_rate, card_number, expiry_date, cvv, credit_limit, loan_amount, loan_term, monthly_payment)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            personId, 
            bankDetail.accountType.trim(), 
            bankDetail.bankName || null, 
            bankDetail.accountNumber || null, 
            bankDetail.accountHolderName || null, 
            bankDetail.branch || null, 
            bankDetail.swiftCode || null, 
            bankDetail.routingNumber || null, 
            bankDetail.balance || null, 
            bankDetail.interestRate || null, 
            bankDetail.cardNumber || null, 
            bankDetail.expiryDate && bankDetail.expiryDate.trim() !== '' ? bankDetail.expiryDate : null, 
            bankDetail.cvv || null, 
            bankDetail.creditLimit || null, 
            bankDetail.loanAmount || null, 
            bankDetail.loanTerm || null, 
            bankDetail.monthlyPayment || null
          ]
        );
      }
    }

    // Handle addresses (new separate addresses table)
    if (req.body.addresses && Array.isArray(req.body.addresses)) {
      console.log('Processing addresses for new person:', req.body.addresses.length, 'addresses');
      
      // Insert new addresses
      for (const address of req.body.addresses) {
        // Skip empty addresses
        if (!address.number && !address.street1 && !address.town) {
          console.log('Skipping empty address');
          continue;
        }

        await client.query(
          `INSERT INTO addresses (person_id, number, street1, street2, town, district, province, 
                                 police_area, police_division, from_date, end_date, is_currently_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            personId,
            address.number || null,
            address.street1 || null,
            address.street2 || null,
            address.town || null,
            address.district || null,
            address.province || null,
            address.policeArea || null,
            address.policeDivision || null,
            address.fromDate || null,
            address.endDate || null,
            address.isCurrentlyActive || false
          ]
        );
      }
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
    const { personal, gangDetails, bank, family, vehicles, bodyMarks, usedDevices, callHistory, weapons, secondPhone, properties, socialMedia, occupations, lawyers, courtCases, activeAreas, relativesOfficials, bankDetails, corruptedOfficials, enemies } = req.body;
    
    console.log('UPDATE request for person ID:', id);
    console.log('Personal data received:', personal);
    console.log('Properties data received:', properties);
    
    await client.query('BEGIN');
    
    // Format address - handle both string and object formats (only if personal data provided)
    let addressString = '';
    if (personal && personal.address) {
      if (typeof personal.address === 'object' && personal.address !== null) {
        const addr = personal.address;
        addressString = [
          addr.number || '',
          addr.street1 || '',
          addr.street2 || '',
          addr.town || '',
          addr.district || '',
          addr.province || '',
          addr.policeArea || '',
          addr.policeDivision || ''
        ].join('|');
      } else {
        addressString = personal.address || '';
      }
    }

    // Update person only if personal data is provided and has required fields
    if (personal && personal.firstName && personal.lastName && personal.nic) {
      await client.query(
        `UPDATE people 
         SET first_name = $1, last_name = $2, full_name = $3, aliases = $4, passport = $5, 
             nic = $6, height = $7, religion = $8, gender = $9, date_of_birth = $10, 
             address = $11, updated_at = CURRENT_TIMESTAMP
         WHERE id = $12`,
        [
          personal.firstName, 
          personal.lastName, 
          personal.fullName || `${personal.firstName} ${personal.lastName}`,
          personal.aliases,
          personal.passport,
          personal.nic, 
          personal.height ? parseFloat(personal.height) : null,
          personal.religion,
          personal.gender,
          personal.dateOfBirth || null,
          addressString, 
          id
        ]
      );
    }
    
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
    await client.query('DELETE FROM gang_details WHERE person_id = $1', [id]);
    await client.query('DELETE FROM family_members WHERE person_id = $1', [id]);
    await client.query('DELETE FROM vehicles WHERE person_id = $1', [id]);
    await client.query('DELETE FROM body_marks WHERE person_id = $1', [id]);
    await client.query('DELETE FROM used_devices WHERE person_id = $1', [id]);
    await client.query('DELETE FROM call_history WHERE person_id = $1', [id]);
    await client.query('DELETE FROM used_weapons WHERE person_id = $1', [id]);
    await client.query('DELETE FROM second_phone WHERE person_id = $1', [id]);
    await client.query('DELETE FROM properties WHERE person_id = $1', [id]);
    await client.query('DELETE FROM social_media WHERE person_id = $1', [id]);
    await client.query('DELETE FROM occupations WHERE person_id = $1', [id]);
    await client.query('DELETE FROM lawyers WHERE person_id = $1', [id]);
    await client.query('DELETE FROM court_cases WHERE person_id = $1', [id]);
    await client.query('DELETE FROM active_areas WHERE person_id = $1', [id]);
    await client.query('DELETE FROM relatives_officials WHERE person_id = $1', [id]);
    await client.query('DELETE FROM bank_details WHERE person_id = $1', [id]);
    await client.query('DELETE FROM corrupted_officials WHERE person_id = $1', [id]);
    await client.query('DELETE FROM enemy_individuals WHERE person_id = $1', [id]);
    await client.query('DELETE FROM enemy_gangs WHERE person_id = $1', [id]);
    
    // Re-insert all data
    
    // Insert gang details if provided
    if (gangDetails && gangDetails.length > 0) {
      for (const gang of gangDetails) {
        // Skip empty gang details
        if (!gang.gangName || !gang.position) {
          continue;
        }
        await client.query(
          `INSERT INTO gang_details (person_id, gang_name, position_in_gang, from_date, to_date, currently_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, gang.gangName, gang.position, gang.fromDate || null, gang.toDate || null, gang.currentlyActive || false]
        );
      }
    }
    
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
          [id, call.device, call.callType, call.number, call.dateTime || null]
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

    // Insert properties if provided
    if (properties && properties.length > 0) {
      console.log('Inserting', properties.length, 'properties for person', id);
      for (const property of properties) {
        console.log('Inserting property:', property);
        await client.query(
          `INSERT INTO properties (person_id, property_type, status, description, value, purchase_date, sale_date, location, documents, buyer_name, buyer_nic, buyer_passport, owner_full_name, owner_nic, owner_passport)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            id, 
            property.propertyType, 
            property.status, 
            property.description || null, 
            property.value || 0, 
            property.purchaseDate || null, 
            property.saleDate || null, 
            property.location || null, 
            property.documents || null, 
            property.buyerName || null, 
            property.buyerNIC || null, 
            property.buyerPassport || null,
            property.ownerFullName || null,
            property.ownerNic || null,
            property.ownerPassport || null
          ]
        );
      }
    } else {
      console.log('No properties to insert for person', id);
    }

    // Insert social media if provided
    if (req.body.socialMedia && req.body.socialMedia.length > 0) {
      console.log('Inserting', req.body.socialMedia.length, 'social media entries for person', id);
      for (const social of req.body.socialMedia) {
        await client.query(
          `INSERT INTO social_media (person_id, platform, url, username, password)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, social.platform, social.url || null, social.username || null, social.password || null]
        );
      }
    }

    // Insert occupations if provided
    if (req.body.occupations && req.body.occupations.length > 0) {
      console.log('Inserting', req.body.occupations.length, 'occupations for person', id);
      for (const occupation of req.body.occupations) {
        // Skip entries with empty job_title since it's required
        if (!occupation.jobTitle || occupation.jobTitle.trim() === '') {
          console.log('Skipping occupation with empty job_title');
          continue;
        }
        await client.query(
          `INSERT INTO occupations (person_id, job_title, company, from_date, to_date, currently_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, occupation.jobTitle.trim(), occupation.company || null, occupation.fromDate || null, occupation.toDate || null, occupation.currently || false]
        );
      }
    }

    // Insert lawyers if provided
    if (req.body.lawyers && req.body.lawyers.length > 0) {
      console.log('Inserting', req.body.lawyers.length, 'lawyers for person', id);
      for (const lawyer of req.body.lawyers) {
        // Skip entries with empty lawyer_full_name since it's required
        if (!lawyer.lawyerFullName || lawyer.lawyerFullName.trim() === '') {
          console.log('Skipping lawyer with empty full_name');
          continue;
        }
        await client.query(
          `INSERT INTO lawyers (person_id, lawyer_full_name, law_firm_or_company, phone_number, case_number)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, lawyer.lawyerFullName.trim(), lawyer.lawFirmOrCompany || null, lawyer.phoneNumber || null, lawyer.caseNumber || null]
        );
      }
    }

    // Insert court cases if provided
    if (req.body.courtCases && req.body.courtCases.length > 0) {
      console.log('Inserting', req.body.courtCases.length, 'court cases for person', id);
      for (const courtCase of req.body.courtCases) {
        // Skip entries with empty case_number since it's required
        if (!courtCase.caseNumber || courtCase.caseNumber.trim() === '') {
          console.log('Skipping court case with empty case_number');
          continue;
        }
        await client.query(
          `INSERT INTO court_cases (person_id, case_number, courts, description)
           VALUES ($1, $2, $3, $4)`,
          [id, courtCase.caseNumber.trim(), courtCase.courts || null, courtCase.description || null]
        );
      }
    }

    // Insert active areas if provided
    if (req.body.activeAreas && req.body.activeAreas.length > 0) {
      console.log('Inserting', req.body.activeAreas.length, 'active areas for person', id);
      for (const activeArea of req.body.activeAreas) {
        await client.query(
          `INSERT INTO active_areas (person_id, town, district, province, from_date, to_date, is_active, address_selection)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id, 
            activeArea.town || null, 
            activeArea.district || null, 
            activeArea.province || null, 
            activeArea.fromDate && activeArea.fromDate.trim() !== '' ? activeArea.fromDate : null, 
            // Set to_date to NULL if currently active
            activeArea.isActive ? null : (activeArea.toDate && activeArea.toDate.trim() !== '' ? activeArea.toDate : null), 
            activeArea.isActive || false, 
            activeArea.addressSelection || null
          ]
        );
      }
    }

    // Insert relatives officials if provided
    if (req.body.relativesOfficials && req.body.relativesOfficials.length > 0) {
      console.log('Inserting', req.body.relativesOfficials.length, 'relatives officials for person', id);
      for (const relativesOfficial of req.body.relativesOfficials) {
        // Skip entries with empty full_name since it's required
        if (!relativesOfficial.fullName || relativesOfficial.fullName.trim() === '') {
          console.log('Skipping relatives official with empty full_name');
          continue;
        }

        // Auto-create person if they don't exist and we have NIC or passport
        if ((relativesOfficial.nicNumber && relativesOfficial.nicNumber.trim() !== '') || 
            (relativesOfficial.passportNumber && relativesOfficial.passportNumber.trim() !== '')) {
          
          let existingPerson = null;
          
          // Check if person already exists by NIC
          if (relativesOfficial.nicNumber && relativesOfficial.nicNumber.trim() !== '') {
            const nicCheck = await client.query('SELECT id FROM people WHERE nic = $1', [relativesOfficial.nicNumber.trim()]);
            if (nicCheck.rows.length > 0) {
              existingPerson = nicCheck.rows[0];
            }
          }
          
          // If not found by NIC, check by passport
          if (!existingPerson && relativesOfficial.passportNumber && relativesOfficial.passportNumber.trim() !== '') {
            const passportCheck = await client.query('SELECT id FROM people WHERE passport = $1', [relativesOfficial.passportNumber.trim()]);
            if (passportCheck.rows.length > 0) {
              existingPerson = passportCheck.rows[0];
            }
          }
          
          // Create new person if doesn't exist
          if (!existingPerson) {
            console.log('Creating new person for relatives official:', relativesOfficial.fullName);
            const nameParts = relativesOfficial.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            const newPersonResult = await client.query(
              `INSERT INTO people (first_name, last_name, full_name, nic, passport, created_at) 
               VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id`,
              [
                firstName,
                lastName,
                relativesOfficial.fullName.trim(),
                relativesOfficial.nicNumber && relativesOfficial.nicNumber.trim() !== '' ? relativesOfficial.nicNumber.trim() : null,
                relativesOfficial.passportNumber && relativesOfficial.passportNumber.trim() !== '' ? relativesOfficial.passportNumber.trim() : null
              ]
            );
            console.log('Created new person with ID:', newPersonResult.rows[0].id);
          }
        }

        await client.query(
          `INSERT INTO relatives_officials (person_id, full_name, nic_number, passport_number, department, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, relativesOfficial.fullName.trim(), relativesOfficial.nicNumber || null, relativesOfficial.passportNumber || null, relativesOfficial.department || null, relativesOfficial.description || null]
        );
      }
    }

    // Insert bank details if provided
    if (req.body.bankDetails && req.body.bankDetails.length > 0) {
      console.log('Inserting', req.body.bankDetails.length, 'bank details for person', id);
      for (const bankDetail of req.body.bankDetails) {
        // Skip entries with empty account_type since it's required
        if (!bankDetail.accountType || bankDetail.accountType.trim() === '') {
          console.log('Skipping bank detail with empty account_type');
          continue;
        }
        await client.query(
          `INSERT INTO bank_details (person_id, account_type, bank_name, account_number, account_holder_name, branch, swift_code, routing_number, balance, interest_rate, card_number, expiry_date, cvv, credit_limit, loan_amount, loan_term, monthly_payment)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            id, 
            bankDetail.accountType.trim(), 
            bankDetail.bankName || null, 
            bankDetail.accountNumber || null, 
            bankDetail.accountHolderName || null, 
            bankDetail.branch || null, 
            bankDetail.swiftCode || null, 
            bankDetail.routingNumber || null, 
            bankDetail.balance || null, 
            bankDetail.interestRate || null, 
            bankDetail.cardNumber || null, 
            bankDetail.expiryDate && bankDetail.expiryDate.trim() !== '' ? bankDetail.expiryDate : null, 
            bankDetail.cvv || null, 
            bankDetail.creditLimit || null, 
            bankDetail.loanAmount || null, 
            bankDetail.loanTerm || null, 
            bankDetail.monthlyPayment || null
          ]
        );
      }
    }

    // Insert corrupted officials if provided
    if (corruptedOfficials && corruptedOfficials.length > 0) {
      console.log('Inserting', corruptedOfficials.length, 'corrupted officials for person', id);
      for (const official of corruptedOfficials) {
        // Skip entries with empty required fields
        if (!official.officialName || official.officialName.trim() === '' || 
            !official.department || official.department.trim() === '') {
          console.log('Skipping corrupted official with empty required fields');
          continue;
        }

        let officialPersonId = null;
        
        // First, try to find or create the official in the people table
        if (official.officialNic && official.officialNic.trim() !== '') {
          const existingPerson = await client.query(
            'SELECT id FROM people WHERE nic = $1',
            [official.officialNic.trim()]
          );
          
          if (existingPerson.rows.length > 0) {
            officialPersonId = existingPerson.rows[0].id;
            console.log(`Found existing person with NIC ${official.officialNic}: ID ${officialPersonId}`);
            
            // Update the existing person's details in case they changed
            await client.query(
              `UPDATE people 
               SET first_name = $1, last_name = $2, full_name = $3, passport = $4, updated_at = CURRENT_TIMESTAMP
               WHERE id = $5`,
              [
                official.officialName.split(' ')[0] || '',
                official.officialName.split(' ').slice(1).join(' ') || '',
                official.officialName,
                official.officialPassport || null,
                officialPersonId
              ]
            );
            console.log(`Updated existing person details for: ${official.officialName}`);
          } else {
            // Create new person for the official
            const newPersonResult = await client.query(
              `INSERT INTO people (first_name, last_name, full_name, nic, passport)
               VALUES ($1, $2, $3, $4, $5) RETURNING id`,
              [
                official.officialName.split(' ')[0] || '',
                official.officialName.split(' ').slice(1).join(' ') || '',
                official.officialName,
                official.officialNic || null,
                official.officialPassport || null
              ]
            );
            officialPersonId = newPersonResult.rows[0].id;
            console.log(`Created new person for official: ${official.officialName} with ID ${officialPersonId}`);
          }
        } else if (official.officialPassport && official.officialPassport.trim() !== '') {
          const existingPerson = await client.query(
            'SELECT id FROM people WHERE passport = $1',
            [official.officialPassport.trim()]
          );
          
          if (existingPerson.rows.length > 0) {
            officialPersonId = existingPerson.rows[0].id;
            console.log(`Found existing person with passport ${official.officialPassport}: ID ${officialPersonId}`);
            
            // Update the existing person's details in case they changed
            await client.query(
              `UPDATE people 
               SET first_name = $1, last_name = $2, full_name = $3, nic = $4, updated_at = CURRENT_TIMESTAMP
               WHERE id = $5`,
              [
                official.officialName.split(' ')[0] || '',
                official.officialName.split(' ').slice(1).join(' ') || '',
                official.officialName,
                official.officialNic || null,
                officialPersonId
              ]
            );
            console.log(`Updated existing person details for: ${official.officialName}`);
          } else {
            // Create new person for the official
            const newPersonResult = await client.query(
              `INSERT INTO people (first_name, last_name, full_name, nic, passport)
               VALUES ($1, $2, $3, $4, $5) RETURNING id`,
              [
                official.officialName.split(' ')[0] || '',
                official.officialName.split(' ').slice(1).join(' ') || '',
                official.officialName,
                official.officialNic || null,
                official.officialPassport || null
              ]
            );
            officialPersonId = newPersonResult.rows[0].id;
            console.log(`Created new person for official: ${official.officialName} with ID ${officialPersonId}`);
          }
        } else {
          // Create new person without NIC or passport
          const newPersonResult = await client.query(
            `INSERT INTO people (first_name, last_name, full_name, nic, passport)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [
              official.officialName.split(' ')[0] || '',
              official.officialName.split(' ').slice(1).join(' ') || '',
              official.officialName,
              official.officialNic || null,
              official.officialPassport || null
            ]
          );
          officialPersonId = newPersonResult.rows[0].id;
          console.log(`Created new person for official: ${official.officialName} with ID ${officialPersonId}`);
        }

        // Insert the corrupted official relationship
        await client.query(
          `INSERT INTO corrupted_officials (person_id, official_person_id, department, corruption_type, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            id, 
            officialPersonId, 
            official.department.trim(), 
            official.corruptionType || null,
            official.notes || null
          ]
        );
      }
    }

    // Insert enemies if provided
    if (enemies && enemies.individuals && enemies.individuals.length > 0) {
      console.log('Inserting', enemies.individuals.length, 'enemy individuals for person', id);
      for (const enemyIndividual of enemies.individuals) {
        // Skip entries with empty required fields
        if (!enemyIndividual.enemyName || enemyIndividual.enemyName.trim() === '') {
          console.log('Skipping enemy individual with empty name');
          continue;
        }

        let enemyPersonId = null;
        
        // First, try to find or create the enemy in the people table
        if (enemyIndividual.enemyNic && enemyIndividual.enemyNic.trim() !== '') {
          const existingPerson = await client.query(
            'SELECT id FROM people WHERE nic = $1',
            [enemyIndividual.enemyNic.trim()]
          );
          
          if (existingPerson.rows.length > 0) {
            enemyPersonId = existingPerson.rows[0].id;
            console.log(`Found existing person with NIC ${enemyIndividual.enemyNic}: ID ${enemyPersonId}`);
          } else {
            // Create new person for the enemy
            const newPersonResult = await client.query(
              `INSERT INTO people (first_name, last_name, full_name, nic)
               VALUES ($1, $2, $3, $4) RETURNING id`,
              [
                enemyIndividual.enemyName.split(' ')[0] || '',
                enemyIndividual.enemyName.split(' ').slice(1).join(' ') || '',
                enemyIndividual.enemyName,
                enemyIndividual.enemyNic || null
              ]
            );
            enemyPersonId = newPersonResult.rows[0].id;
            console.log(`Created new person for enemy: ${enemyIndividual.enemyName} with ID ${enemyPersonId}`);
          }
        } else {
          // Create new person without NIC
          const newPersonResult = await client.query(
            `INSERT INTO people (first_name, last_name, full_name, nic)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [
              enemyIndividual.enemyName.split(' ')[0] || '',
              enemyIndividual.enemyName.split(' ').slice(1).join(' ') || '',
              enemyIndividual.enemyName,
              enemyIndividual.enemyNic || null
            ]
          );
          enemyPersonId = newPersonResult.rows[0].id;
          console.log(`Created new person for enemy: ${enemyIndividual.enemyName} with ID ${enemyPersonId}`);
        }

        // Insert the enemy individual relationship
        await client.query(
          `INSERT INTO enemy_individuals (person_id, enemy_person_id, relationship_type, threat_level, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            id, 
            enemyPersonId, 
            enemyIndividual.relationshipType || null,
            enemyIndividual.threatLevel || 'Low',
            enemyIndividual.notes || null
          ]
        );
      }
    }

    if (enemies && enemies.gangs && enemies.gangs.length > 0) {
      console.log('Inserting', enemies.gangs.length, 'enemy gangs for person', id);
      for (const enemyGang of enemies.gangs) {
        // Skip entries with empty required fields
        if (!enemyGang.gangName || enemyGang.gangName.trim() === '') {
          console.log('Skipping enemy gang with empty name');
          continue;
        }

        // Insert the enemy gang relationship
        await client.query(
          `INSERT INTO enemy_gangs (person_id, gang_name, threat_level, notes)
           VALUES ($1, $2, $3, $4)`,
          [
            id, 
            enemyGang.gangName.trim(), 
            enemyGang.threatLevel || 'Low',
            enemyGang.notes || null
          ]
        );
      }
    }

    // Handle addresses (new separate addresses table)
    if (req.body.addresses && Array.isArray(req.body.addresses)) {
      console.log('Processing addresses for person', id, ':', req.body.addresses.length, 'addresses');
      
      // First, delete existing addresses for this person
      await client.query('DELETE FROM addresses WHERE person_id = $1', [id]);
      
      // Insert new addresses
      for (const address of req.body.addresses) {
        // Skip empty addresses
        if (!address.number && !address.street1 && !address.town) {
          console.log('Skipping empty address');
          continue;
        }

        await client.query(
          `INSERT INTO addresses (person_id, number, street1, street2, town, district, province, 
                                 police_area, police_division, from_date, end_date, is_currently_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            id,
            address.number || null,
            address.street1 || null,
            address.street2 || null,
            address.town || null,
            address.district || null,
            address.province || null,
            address.policeArea || null,
            address.policeDivision || null,
            address.fromDate || null,
            address.endDate || null,
            address.isCurrentlyActive || false
          ]
        );
      }
    }
    
    await client.query('COMMIT');
    console.log('✅ Transaction committed successfully for person ID:', id);
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

// ============================================
// PROPERTIES DOCUMENT UPLOAD API ROUTES
// ============================================

// POST upload property document
app.post('/api/person/:id/properties/upload', uploadProperties.single('document'), async (req, res) => {
  try {
    const { id } = req.params;
    const { section, propertyIndex } = req.body;
    
    console.log('Property document upload request:', { id, section, propertyIndex, file: req.file ? req.file.filename : 'No file' });
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const documentPath = `/Properties/${req.file.filename}`;
    
    console.log('Document uploaded successfully:', req.file.filename);
    
    res.json({ 
      message: 'Document uploaded successfully',
      filename: req.file.filename,
      path: documentPath,
      section,
      propertyIndex
    });
  } catch (err) {
    console.error('Property document upload error:', err);
    res.status(500).json({ error: 'Failed to upload property document', details: err.message });
  }
});

// GET serve property documents
app.get('/api/properties/documents/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'Properties', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.sendFile(filePath);
  } catch (err) {
    console.error('Property document serve error:', err);
    res.status(500).json({ error: 'Failed to serve property document' });
  }
});

// 7. GET ALL ENEMY GANGS (for dropdown)
app.get('/api/enemy-gangs', checkDbConnection, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT gang_name FROM enemy_gangs ORDER BY gang_name'
    );
    res.json(result.rows.map(row => row.gang_name));
  } catch (err) {
    console.error('GET /api/enemy-gangs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 8. CREATE NEW PERSON (Quick creation for references)
app.post('/api/person/quick', checkDbConnection, async (req, res) => {
  try {
    const { firstName, lastName, fullName, nic, passport, department } = req.body;
    
    const result = await pool.query(
      `INSERT INTO people (first_name, last_name, full_name, nic, passport) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, nic, passport`,
      [firstName, lastName, fullName || `${firstName} ${lastName}`, nic, passport]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/person/quick error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
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

// Update call history for a specific person
app.put('/api/person/:id/call-history', checkDbConnection, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { callHistory } = req.body;
    
    await client.query('BEGIN');
    
    // Delete existing call history for this person
    await client.query('DELETE FROM call_history WHERE person_id = $1', [id]);
    
    // Insert new call history
    if (callHistory && callHistory.length > 0) {
      for (const call of callHistory) {
        // Skip empty or invalid entries
        if (!call.device || !call.callType || !call.number) continue;
        
        await client.query(
          `INSERT INTO call_history (person_id, device, call_type, number, date_time)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, call.device, call.callType, call.number, call.dateTime || null]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Call history updated successfully' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Call history update error:', error);
    res.status(500).json({ error: 'Failed to update call history' });
  } finally {
    client.release();
  }
});

// Search person by phone number for call history auto-fill
app.get('/api/search-by-phone/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    // Search in different phone number fields across multiple tables
    const searchQuery = `
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.full_name, p.nic, p.passport,
             'second_phone' as source, 'whatsapp' as field_type
      FROM people p
      JOIN second_phone sp ON p.id = sp.person_id
      WHERE sp.whatsapp = $1
      
      UNION
      
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.full_name, p.nic, p.passport,
             'second_phone' as source, 'telegram' as field_type
      FROM people p
      JOIN second_phone sp ON p.id = sp.person_id
      WHERE sp.telegram = $1
      
      UNION
      
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.full_name, p.nic, p.passport,
             'second_phone' as source, 'viber' as field_type
      FROM people p
      JOIN second_phone sp ON p.id = sp.person_id
      WHERE sp.viber = $1
      
      UNION
      
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.full_name, p.nic, p.passport,
             'second_phone' as source, 'mobile' as field_type
      FROM people p
      JOIN second_phone sp ON p.id = sp.person_id
      WHERE sp.mobile = $1
      
      UNION
      
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.full_name, p.nic, p.passport,
             'second_phone' as source, 'landline' as field_type
      FROM people p
      JOIN second_phone sp ON p.id = sp.person_id
      WHERE sp.landline = $1
      
      UNION
      
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.full_name, p.nic, p.passport,
             'second_phone' as source, 'other' as field_type
      FROM people p
      JOIN second_phone sp ON p.id = sp.person_id
      WHERE sp.other = $1
      
      UNION
      
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.full_name, p.nic, p.passport,
             'family_members' as source, 'phone_number' as field_type
      FROM people p
      JOIN family_members fm ON p.id = fm.person_id
      WHERE fm.phone_number = $1
      
      UNION
      
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.full_name, p.nic, p.passport,
             'call_history' as source, 'number' as field_type
      FROM people p
      JOIN call_history ch ON p.id = ch.person_id
      WHERE ch.number = $1
      
      LIMIT 10
    `;
    
    const result = await pool.query(searchQuery, [phoneNumber]);
    
    if (result.rows.length > 0) {
      // Return the first match (most relevant)
      const person = result.rows[0];
      res.json({
        found: true,
        person: {
          id: person.id,
          fullName: person.full_name || `${person.first_name} ${person.last_name}`,
          nic: person.nic,
          passport: person.passport,
          source: person.source,
          fieldType: person.field_type
        }
      });
    } else {
      res.json({ found: false });
    }
  } catch (error) {
    console.error('Phone search error:', error);
    res.status(500).json({ error: 'Failed to search by phone number' });
  }
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