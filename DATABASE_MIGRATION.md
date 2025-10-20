# 🔄 Database Migration Guide

## Switch from Mock Data to PostgreSQL Database

This guide will help you migrate from the mock data system to a real PostgreSQL database.

## 🚀 Quick Migration Steps

### 1. Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

### 2. Set Up Database
```bash
cd backend

# Run the automatic database setup
npm run setup-db
```

### 3. Start with Database
```bash
# Start backend with database (port 5000)
npm start

# Start frontend
cd ../frontend
npm run dev
```

## 📋 What's Included in Database Version

### New Tables Added:
- ✅ **vehicles** - Vehicle registration details
- ✅ **body_marks** - Physical identification marks  
- ✅ **used_devices** - Electronic device inventory
- ✅ **call_history** - Communication records

### Enhanced Features:
- ✅ **Phone number validation** - Auto-removes spaces and hyphens
- ✅ **Contact name resolution** - Shows names instead of numbers in call history
- ✅ **Transaction support** - Ensures data consistency
- ✅ **Full CRUD operations** - All sections fully functional

## 🗃️ Database Schema Overview

```sql
people (id, first_name, last_name, nic, address)
├── bank_accounts (person_id → people.id)
├── family_members (person_id → people.id)  
├── vehicles (person_id → people.id)
├── body_marks (person_id → people.id)
├── used_devices (person_id → people.id)
└── call_history (person_id → people.id)
```

## 🔄 Switching Between Modes

### Use Database (Production)
```bash
# Backend: Uses PostgreSQL on port 5000
cd backend && npm start

# Frontend: Points to port 5000
cd frontend && npm run dev
```

### Use Mock Data (Development)
```bash  
# Backend: Uses mock data on port 5001
cd backend && npm run dev-mock

# Frontend: Update API_URL to port 5001 in App.jsx
cd frontend && npm run dev
```

## 📊 Sample Data

The database setup includes comprehensive sample data:

### John Doe Profile:
- **Personal**: John Doe, NIC: 199012345678
- **Banking**: Commercial Bank, Balance: $50,000
- **Family**: Wife (Jane), Son (Tommy), Friend (Mike)
- **Vehicles**: CAG4455 TOYOTA PRADO 150, ABC1234 HONDA CIVIC
- **Body Marks**: Tattoo behind right ear
- **Devices**: Samsung Galaxy S21, Apple MacBook Pro
- **Call History**: 3 call records with contact name resolution

## 🛠️ Manual Database Setup (Alternative)

If automatic setup fails, run manually:

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE dashboard_db;"

# 2. Create tables
psql -U postgres -d dashboard_db -f schema.sql

# 3. Verify setup
psql -U postgres -d dashboard_db -c "SELECT COUNT(*) FROM people;"
```

## 🔧 Environment Configuration

Ensure your `.env` file has correct settings:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost  
DB_NAME=dashboard_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Server Configuration
PORT=5000
```

## 🚨 Troubleshooting

### Database Connection Issues:
```bash
# Check PostgreSQL service
sudo service postgresql status

# Test connection
psql -U postgres -c "SELECT version();"

# Check database exists
psql -U postgres -l | grep dashboard_db
```

### Permission Issues:
```bash
# Grant permissions to user
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE dashboard_db TO postgres;"
```

### Port Conflicts:
```bash
# Check what's using port 5000
netstat -tulpn | grep 5000

# Change port in .env file
PORT=5001
```

## 🎯 Testing the Migration

### Verify All Sections Work:
1. ✅ Search for "John Doe"
2. ✅ Load complete profile  
3. ✅ Check all sections have data:
   - Personal Details ✅
   - Bank Details ✅
   - Family Members & Friends ✅
   - VEHICLES Details ✅
   - BODY MARKS Details ✅  
   - USED DEVICES Details ✅
   - CALL HISTORY Details ✅

### Test New Features:
1. ✅ Add family member phone number with spaces → auto-cleaned
2. ✅ Check call history shows "Call: Jane Doe" instead of "Call: +15550123"
3. ✅ Add new records in all sections
4. ✅ Update existing records
5. ✅ Delete records (cascades properly)

## 📈 Performance Benefits

### Database vs Mock Data:
- ✅ **Persistent data** - Survives server restarts
- ✅ **Concurrent users** - Connection pooling
- ✅ **Data integrity** - Foreign key constraints  
- ✅ **Scalability** - Handles large datasets
- ✅ **Backup/Recovery** - Standard database tools
- ✅ **Advanced queries** - Complex searches and joins

## 🔄 Rollback to Mock Data

If you need to rollback to mock data:

```bash
# 1. Update frontend API URL
# In frontend/src/App.jsx, change:
const API_URL = 'http://localhost:5001/api';

# 2. Start mock server
cd backend && npm run dev-mock

# 3. Start frontend  
cd frontend && npm run dev
```

## ✅ Migration Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created successfully
- [ ] All tables created with sample data
- [ ] Backend server starts without errors
- [ ] Frontend connects to backend
- [ ] Can search and load John Doe
- [ ] All 7 sections display data correctly
- [ ] Phone number validation works
- [ ] Contact name resolution works in call history
- [ ] Can create/update/delete records
- [ ] No console errors in browser

## 🎉 Success!

Once all items are checked, you're successfully using the PostgreSQL database version of the PERN Dashboard with full functionality for all sections!