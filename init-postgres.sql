-- =====================================================
-- PostgreSQL Database Initialization Script
-- Creates all databases and users for Synergy++ Super App
-- =====================================================

-- Create databases for each service
CREATE DATABASE IF NOT EXISTS identity_db;
CREATE DATABASE IF NOT EXISTS ledger_db;
CREATE DATABASE IF NOT EXISTS payment_rail_db;
CREATE DATABASE IF NOT EXISTS risk_monitor_db;
CREATE DATABASE IF NOT EXISTS investment_db;
CREATE DATABASE IF NOT EXISTS lending_db;
CREATE DATABASE IF NOT EXISTS savings_db;
CREATE DATABASE IF NOT EXISTS product_catalog_db;
CREATE DATABASE IF NOT EXISTS partner_management_db;
CREATE DATABASE IF NOT EXISTS superapp_marketplace;
CREATE DATABASE IF NOT EXISTS superapp_marketplace_node;

-- Create users with appropriate permissions
CREATE USER IF NOT EXISTS superapp WITH ENCRYPTED PASSWORD 'superapp123';
CREATE USER IF NOT EXISTS marketplace_user WITH ENCRYPTED PASSWORD 'marketplace_pass123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE identity_db TO superapp;
GRANT ALL PRIVILEGES ON DATABASE ledger_db TO superapp;
GRANT ALL PRIVILEGES ON DATABASE payment_rail_db TO superapp;
GRANT ALL PRIVILEGES ON DATABASE risk_monitor_db TO superapp;
GRANT ALL PRIVILEGES ON DATABASE investment_db TO superapp;
GRANT ALL PRIVILEGES ON DATABASE lending_db TO superapp;
GRANT ALL PRIVILEGES ON DATABASE savings_db TO superapp;
GRANT ALL PRIVILEGES ON DATABASE product_catalog_db TO superapp;
GRANT ALL PRIVILEGES ON DATABASE partner_management_db TO superapp;
GRANT ALL PRIVILEGES ON DATABASE superapp_marketplace TO superapp;
GRANT ALL PRIVILEGES ON DATABASE superapp_marketplace_node TO marketplace_user;
GRANT ALL PRIVILEGES ON DATABASE superapp_marketplace_node TO superapp;

-- Output success message
\echo '✅ All databases and users created successfully!'
\echo '📊 Created databases:'
\echo '   - identity_db'
\echo '   - ledger_db'
\echo '   - payment_rail_db'
\echo '   - risk_monitor_db'
\echo '   - investment_db'
\echo '   - lending_db'
\echo '   - savings_db'
\echo '   - product_catalog_db'
\echo '   - partner_management_db'
\echo '   - superapp_marketplace'
\echo '   - superapp_marketplace_node'
\echo ''
\echo '👥 Created users: superapp, marketplace_user'


