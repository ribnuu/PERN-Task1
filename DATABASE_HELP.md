# Database Connection Help

## Current Status
- ✅ **Backend API**: Running on http://localhost:5000
- ✅ **Frontend**: Running on http://localhost:3006  
- ❌ **Database**: Connection failed (password authentication)

## Quick Solutions

### Option 1: Fix PostgreSQL Password (Recommended)

1. **Find your PostgreSQL password**:
   - Check your PostgreSQL installation notes
   - Or reset it using pgAdmin or command line

2. **Update the .env file**:
   ```env
   DB_PASSWORD=your_actual_password
   ```

3. **Test connection**:
   ```bash
   node setup.js
   ```

### Option 2: Use Different PostgreSQL User

1. **Create a new user in PostgreSQL**:
   ```sql
   CREATE USER dashboard_user WITH PASSWORD 'dashboard123';
   CREATE DATABASE dashboard_db OWNER dashboard_user;
   GRANT ALL PRIVILEGES ON DATABASE dashboard_db TO dashboard_user;
   ```

2. **Update .env file**:
   ```env
   DB_USER=dashboard_user
   DB_PASSWORD=dashboard123
   ```

### Option 3: Use PostgreSQL Service

1. **Make sure PostgreSQL service is running**:
   - Windows: Services → PostgreSQL → Start
   - Or install PostgreSQL if not installed

2. **Check default credentials** (common defaults):
   - User: `postgres`
   - Password: `postgres` OR `admin` OR empty

## Testing the Fix

After updating credentials, restart the backend:
```bash
npm run dev
```

You should see: `✅ Connected to PostgreSQL database`

## Current Error Messages

The frontend now shows helpful error messages:
- "Database connection unavailable"
- "Please ensure PostgreSQL is running and properly configured"

This helps identify that it's a database issue, not a frontend problem.