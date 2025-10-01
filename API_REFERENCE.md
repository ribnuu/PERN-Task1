# API Reference

Base URL: `http://localhost:5000/api`

## Personal Details Endpoints

### Get All Personal Records
```
GET /api/personal
```

**Response:**
```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "address": "123 Main St, City",
    "date_of_birth": "1990-01-15T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Personal Record by ID
```
GET /api/personal/:id
```

### Create Personal Record
```
POST /api/personal
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "address": "123 Main St, City",
  "date_of_birth": "1990-01-15"
}
```

### Update Personal Record
```
PUT /api/personal/:id
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "address": "123 Main St, City",
  "date_of_birth": "1990-01-15"
}
```

### Delete Personal Record
```
DELETE /api/personal/:id
```

## Banking Details Endpoints

### Get All Banking Records
```
GET /api/banking
```

**Response:**
```json
[
  {
    "id": 1,
    "personal_id": 1,
    "bank_name": "ABC Bank",
    "account_number": "1234567890",
    "account_type": "Savings",
    "ifsc_code": "ABC0001234",
    "branch_name": "Main Branch",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Banking Record by ID
```
GET /api/banking/:id
```

### Get Banking Records by Personal ID
```
GET /api/banking/personal/:personalId
```

### Create Banking Record
```
POST /api/banking
Content-Type: application/json

{
  "personal_id": 1,
  "bank_name": "ABC Bank",
  "account_number": "1234567890",
  "account_type": "Savings",
  "ifsc_code": "ABC0001234",
  "branch_name": "Main Branch"
}
```

### Update Banking Record
```
PUT /api/banking/:id
Content-Type: application/json

{
  "personal_id": 1,
  "bank_name": "ABC Bank",
  "account_number": "1234567890",
  "account_type": "Savings",
  "ifsc_code": "ABC0001234",
  "branch_name": "Main Branch"
}
```

### Delete Banking Record
```
DELETE /api/banking/:id
```

## Family Details Endpoints

### Get All Family Records
```
GET /api/family
```

**Response:**
```json
[
  {
    "id": 1,
    "personal_id": 1,
    "relation": "Spouse",
    "name": "Mary Doe",
    "age": 32,
    "occupation": "Teacher",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Family Record by ID
```
GET /api/family/:id
```

### Get Family Records by Personal ID
```
GET /api/family/personal/:personalId
```

### Create Family Record
```
POST /api/family
Content-Type: application/json

{
  "personal_id": 1,
  "relation": "Spouse",
  "name": "Mary Doe",
  "age": 32,
  "occupation": "Teacher"
}
```

### Update Family Record
```
PUT /api/family/:id
Content-Type: application/json

{
  "personal_id": 1,
  "relation": "Spouse",
  "name": "Mary Doe",
  "age": 32,
  "occupation": "Teacher"
}
```

### Delete Family Record
```
DELETE /api/family/:id
```

## Search Endpoint

### Global Search
```
GET /api/search?q=searchTerm
```

**Response:**
```json
{
  "personal": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      ...
    }
  ],
  "banking": [
    {
      "id": 1,
      "bank_name": "ABC Bank",
      "account_number": "1234567890",
      "first_name": "John",
      "last_name": "Doe",
      ...
    }
  ],
  "family": [
    {
      "id": 1,
      "name": "Mary Doe",
      "relation": "Spouse",
      "first_name": "John",
      "last_name": "Doe",
      ...
    }
  ]
}
```

## Health Check

### Check API Status
```
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "error": "Email already exists"
}
```

### 404 Not Found
```json
{
  "error": "Personal detail not found"
}
```

### 500 Server Error
```json
{
  "error": "Server error"
}
```

## Notes

- All `POST` and `PUT` requests require `Content-Type: application/json` header
- Foreign key constraints ensure data integrity (Banking and Family records are deleted when associated Personal record is deleted)
- Email field in Personal table must be unique
- Search is case-insensitive and searches across multiple fields in each table
