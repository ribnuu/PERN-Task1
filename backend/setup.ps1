#!/usr/bin/env powershell

# PERN Dashboard Setup Script
# Run this script to set up the database

Write-Host "🚀 Setting up PERN Dashboard Database..." -ForegroundColor Green

# Check if PostgreSQL is running
$pgProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
if (-not $pgProcess) {
    Write-Host "❌ PostgreSQL is not running. Please start PostgreSQL service first." -ForegroundColor Red
    exit 1
}

# Create database if it doesn't exist
Write-Host "📊 Creating database dashboard_db (if it doesn't exist)..." -ForegroundColor Yellow
psql -U postgres -c "CREATE DATABASE dashboard_db;" 2>$null

# Run the schema
Write-Host "🏗️  Setting up database schema..." -ForegroundColor Yellow
psql -U postgres -d dashboard_db -f "schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host "📋 Sample data has been inserted for testing" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start the backend: cd ../backend && npm run dev" -ForegroundColor White
    Write-Host "2. Start the frontend: cd ../frontend && npm run dev" -ForegroundColor White
    Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
} else {
    Write-Host "❌ Database setup failed. Please check your PostgreSQL connection." -ForegroundColor Red
    Write-Host "Make sure PostgreSQL is running and you can connect with user 'postgres'" -ForegroundColor Yellow
}