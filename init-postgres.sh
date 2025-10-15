#!/bin/bash

# =====================================================
# PostgreSQL Database Initialization Script
# Creates all databases and users for Synergy++ Super App
# =====================================================

set -e

echo "🚀 Initializing PostgreSQL databases for Synergy++ Super App..."
echo "=============================================================="
echo ""

# Database connection details
PG_HOST="${DB_HOST:-localhost}"
PG_PORT="${DB_PORT:-5432}"
PG_USER="${DB_USER:-postgres}"
PG_PASSWORD="${DB_PASSWORD:-postgres}"

# Export password to avoid prompts
export PGPASSWORD="$PG_PASSWORD"

# Function to create database if it doesn't exist
create_database() {
    local db_name=$1
    echo "📊 Creating database: $db_name"
    
    if psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
        echo "   ℹ️  Database $db_name already exists"
    else
        psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -c "CREATE DATABASE $db_name;"
        echo "   ✅ Database $db_name created"
    fi
}

# Function to create user if it doesn't exist
create_user() {
    local username=$1
    local password=$2
    echo "👤 Creating user: $username"
    
    if psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -t -c "SELECT 1 FROM pg_roles WHERE rolname='$username'" | grep -q 1; then
        echo "   ℹ️  User $username already exists"
    else
        psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -c "CREATE USER $username WITH ENCRYPTED PASSWORD '$password';"
        echo "   ✅ User $username created"
    fi
}

# Function to grant privileges
grant_privileges() {
    local db_name=$1
    local username=$2
    echo "🔐 Granting privileges on $db_name to $username"
    
    psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -c "GRANT ALL PRIVILEGES ON DATABASE $db_name TO $username;"
    
    # Connect to the database and grant schema privileges
    psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$db_name" -c "GRANT ALL ON SCHEMA public TO $username;"
    psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$db_name" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $username;"
    psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$db_name" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $username;"
    psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$db_name" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $username;"
    psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$db_name" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $username;"
    
    echo "   ✅ Privileges granted"
}

echo "Step 1: Creating users..."
echo "------------------------"
create_user "superapp" "superapp123"
create_user "marketplace_user" "marketplace_pass123"
echo ""

echo "Step 2: Creating databases..."
echo "----------------------------"
# Core Services
create_database "identity_db"
create_database "ledger_db"
create_database "payment_rail_db"
create_database "risk_monitor_db"

# Product Services
create_database "investment_db"
create_database "lending_db"
create_database "savings_db"

# Marketplace Services
create_database "product_catalog_db"
create_database "partner_management_db"
create_database "superapp_marketplace"
create_database "superapp_marketplace_node"
echo ""

echo "Step 3: Granting privileges..."
echo "-----------------------------"
# Grant privileges to superapp user
grant_privileges "identity_db" "superapp"
grant_privileges "ledger_db" "superapp"
grant_privileges "payment_rail_db" "superapp"
grant_privileges "risk_monitor_db" "superapp"
grant_privileges "investment_db" "superapp"
grant_privileges "lending_db" "superapp"
grant_privileges "savings_db" "superapp"
grant_privileges "product_catalog_db" "superapp"
grant_privileges "partner_management_db" "superapp"
grant_privileges "superapp_marketplace" "superapp"

# Grant privileges to marketplace_user
grant_privileges "superapp_marketplace_node" "marketplace_user"
grant_privileges "superapp_marketplace_node" "superapp"
echo ""

# Unset password
unset PGPASSWORD

echo "=============================================================="
echo "✅ PostgreSQL initialization completed successfully!"
echo ""
echo "📊 Created databases:"
echo "   Core Services:"
echo "   - identity_db"
echo "   - ledger_db"
echo "   - payment_rail_db"
echo "   - risk_monitor_db"
echo ""
echo "   Product Services:"
echo "   - investment_db"
echo "   - lending_db"
echo "   - savings_db"
echo ""
echo "   Marketplace Services:"
echo "   - product_catalog_db"
echo "   - partner_management_db"
echo "   - superapp_marketplace (Java service)"
echo "   - superapp_marketplace_node (Node.js service)"
echo ""
echo "👥 Created users:"
echo "   - superapp (password: superapp123)"
echo "   - marketplace_user (password: marketplace_pass123)"
echo ""
echo "🔐 All privileges have been granted"
echo "=============================================================="


