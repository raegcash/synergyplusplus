-- =====================================================
-- Marketplace Database Initialization
-- Ensures database is ready for the Node.js API
-- =====================================================

-- The database and user are already created by Docker environment variables
-- This script just confirms connection and logs success

SELECT 'PostgreSQL database initialized successfully!' AS status;
SELECT version() AS postgresql_version;

