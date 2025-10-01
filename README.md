# PERN Dashboard

A comprehensive full-stack web application for managing personal information with banking and family details.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **HTTP Client**: Axios

## 📋 Features

- ✅ **Personal Information Management** - Full CRUD operations
- 🏦 **Banking Details** - Account information and balance tracking
- 👨‍👩‍👧‍👦 **Family Members** - Relationship and contact details
- 🔍 **Real-time Search** - Search by name or NIC number
- 📱 **Responsive Dashboard** - Three-panel layout design
- 🔄 **Transaction Support** - Database consistency with rollback

## 🛠️ Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

### 1. Clone and Install
```bash
git clone https://github.com/ribnuu/PERN-Task1.git
cd PERN-Task1

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Database Setup
```bash
# Navigate to backend directory
cd backend

# Run the setup script (Windows PowerShell)
.\setup.ps1

# OR manually create database and run schema
psql -U postgres -c "CREATE DATABASE dashboard_db;"
psql -U postgres -d dashboard_db -f schema.sql
```

### 3. Environment Configuration
Make sure `backend/.env` has correct database credentials:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=dashboard_db
DB_PASSWORD=postgres
DB_PORT=5432
PORT=5000
```

### 4. Start the Application
```bash
# Terminal 1: Start Backend (from backend folder)
npm run dev

# Terminal 2: Start Frontend (from frontend folder)
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?query=name` | Search people by name/NIC |
| GET | `/api/person/:id` | Get person details |
| POST | `/api/person` | Create new person |
| PUT | `/api/person/:id` | Update person |
| DELETE | `/api/person/:id` | Delete person |

## 🗄️ Database Schema

### Tables
- **people** - Personal information (name, NIC, address)
- **bank_accounts** - Banking details with balance
- **family_members** - Family relationships and details

### Sample Data
The setup includes sample records for testing:
- John Doe (NIC: 199012345678)
- Jane Smith (NIC: 198505432109) 
- Michael Johnson (NIC: 199708765432)

## 🎯 Usage Guide

1. **Search**: Use the search panel to find existing people
2. **Add New**: Click "Add New Person" to create records
3. **Edit**: Click on search results to load and edit details
4. **Navigation**: Use the sidebar to switch between Personal, Banking, and Family sections
5. **Actions**: Update/Create or Delete using the bottom action buttons

## 🔧 Development

### Backend Structure
```
backend/
├── server.js      # Express server and API routes
├── db.js          # PostgreSQL connection
├── schema.sql     # Database schema and sample data
└── .env          # Environment variables
```

### Frontend Structure  
```
frontend/
├── src/
│   ├── App.jsx    # Main React application
│   ├── main.jsx   # React entry point
│   └── index.css  # Styling
├── index.html     # HTML template
└── vite.config.js # Vite configuration
```

## 🚨 Troubleshooting

### Common Issues
- **Port conflicts**: Change ports in `.env` and `vite.config.js`
- **Database connection**: Verify PostgreSQL is running and credentials are correct
- **CORS errors**: Ensure backend CORS is properly configured

### Development Tips
- Use browser dev tools for debugging API calls
- Check terminal logs for server errors
- Verify database connections with `psql`

## 📝 License

This project is licensed under the ISC License.