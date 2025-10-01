#!/bin/bash

echo "==================================="
echo "PERN Dashboard Setup Script"
echo "==================================="
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi
echo "✓ PostgreSQL found"
echo ""

# Create database
echo "2. Creating database..."
psql -U postgres -c "CREATE DATABASE pern_dashboard;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ Database created successfully"
else
    echo "⚠ Database might already exist (this is ok)"
fi
echo ""

# Load schema
echo "3. Loading database schema..."
psql -U postgres -d pern_dashboard -f backend/schema.sql
if [ $? -eq 0 ]; then
    echo "✓ Schema loaded successfully"
else
    echo "❌ Failed to load schema"
    exit 1
fi
echo ""

# Setup backend
echo "4. Setting up backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
fi
npm install
if [ $? -eq 0 ]; then
    echo "✓ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..
echo ""

# Setup frontend
echo "5. Setting up frontend..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✓ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..
echo ""

echo "==================================="
echo "✓ Setup completed successfully!"
echo "==================================="
echo ""
echo "To start the application:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend (in new terminal): cd frontend && npm start"
echo ""
echo "Or use Docker Compose:"
echo "docker-compose up"
echo ""
