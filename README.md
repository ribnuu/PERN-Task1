# PERN Dashboard

A full-stack admin dashboard built with **PostgreSQL**, **Express**, **React**, and **Node.js** (PERN Stack).

![PERN Dashboard](https://github.com/user-attachments/assets/0f90a749-efb4-42bf-a42c-c29c044620c3)

## Features

- **3-Panel Layout Design**:
  - **Left Panel**: Navigation menu for switching between Personal, Banking, and Family details
  - **Center Panel**: Dynamic forms with full CRUD operations (Create, Read, Update, Delete)
  - **Right Panel**: Real-time search functionality with instant results across all data

- **Full CRUD Operations**: Add, update, and delete records for all sections
- **Relational Data Handling**: Banking and Family details are linked to Personal records
- **Real-time Search**: Instant search results across all tables
- **Responsive Design**: Clean and modern UI with intuitive navigation

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL client)
- CORS

### Frontend
- React
- Axios
- CSS3

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for containerized setup)

## Installation & Setup

### Quick Setup with Script (Linux/Mac)

```bash
git clone https://github.com/ribnuu/PERN-Task1.git
cd PERN-Task1
chmod +x setup.sh
./setup.sh
```

### Quick Setup with Docker Compose

```bash
git clone https://github.com/ribnuu/PERN-Task1.git
cd PERN-Task1
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Manual Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ribnuu/PERN-Task1.git
cd PERN-Task1
```

### 2. Database Setup

1. Install PostgreSQL if not already installed
2. Create a new database:

```bash
psql -U postgres
CREATE DATABASE pern_dashboard;
\q
```

3. Run the schema to create tables:

```bash
psql -U postgres -d pern_dashboard -f backend/schema.sql
```

### 3. Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory (copy from `.env.example`):

```bash
cp .env.example .env
```

4. Update `.env` with your PostgreSQL credentials:

```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=pern_dashboard
DB_PASSWORD=your_password
DB_PORT=5432
```

5. Start the backend server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### 4. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file if needed (optional, defaults to localhost:5000):

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the React development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### Personal Details Management
- Navigate to "Personal Details" from the left panel
- Click "Add New" to create a new personal record
- Fill in the form with first name, last name, email, phone, address, and date of birth
- Click "Save" to create the record
- Use "Edit" or "Delete" buttons in the table to modify or remove records

### Banking Details Management
- Navigate to "Banking Details" from the left panel
- Click "Add New" to create a new banking record
- Select a person from the dropdown (must have personal records first)
- Fill in bank details including bank name, account number, account type, IFSC code, and branch
- Click "Save" to create the record

### Family Details Management
- Navigate to "Family Details" from the left panel
- Click "Add New" to create a new family record
- Select a person from the dropdown
- Select the relation and fill in family member details
- Click "Save" to create the record

### Search Functionality
- Use the search box in the right panel to search across all data
- Search results are categorized by Personal, Banking, and Family
- Click on any search result to edit that record

## API Endpoints

### Personal Details
- `GET /api/personal` - Get all personal records
- `GET /api/personal/:id` - Get a specific personal record
- `POST /api/personal` - Create a new personal record
- `PUT /api/personal/:id` - Update a personal record
- `DELETE /api/personal/:id` - Delete a personal record

### Banking Details
- `GET /api/banking` - Get all banking records
- `GET /api/banking/:id` - Get a specific banking record
- `GET /api/banking/personal/:personalId` - Get banking records for a person
- `POST /api/banking` - Create a new banking record
- `PUT /api/banking/:id` - Update a banking record
- `DELETE /api/banking/:id` - Delete a banking record

### Family Details
- `GET /api/family` - Get all family records
- `GET /api/family/:id` - Get a specific family record
- `GET /api/family/personal/:personalId` - Get family records for a person
- `POST /api/family` - Create a new family record
- `PUT /api/family/:id` - Update a family record
- `DELETE /api/family/:id` - Delete a family record

### Search
- `GET /api/search?q=searchTerm` - Search across all tables

## Database Schema

### Personal Table
- `id` - Primary key
- `first_name` - First name (required)
- `last_name` - Last name (required)
- `email` - Email address (required, unique)
- `phone` - Phone number
- `address` - Address
- `date_of_birth` - Date of birth
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Banking Table
- `id` - Primary key
- `personal_id` - Foreign key to Personal table
- `bank_name` - Bank name (required)
- `account_number` - Account number (required)
- `account_type` - Account type (Savings/Current/Fixed Deposit)
- `ifsc_code` - IFSC code
- `branch_name` - Branch name
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Family Table
- `id` - Primary key
- `personal_id` - Foreign key to Personal table
- `relation` - Relationship (required)
- `name` - Family member name (required)
- `age` - Age
- `occupation` - Occupation
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Project Structure

```
PERN-Task1/
├── backend/
│   ├── node_modules/
│   ├── .env.example
│   ├── db.js              # Database connection
│   ├── index.js           # Express server and API routes
│   ├── schema.sql         # Database schema
│   └── package.json
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   └── index.js       # React entry point
│   ├── .env
│   └── package.json
└── README.md
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.