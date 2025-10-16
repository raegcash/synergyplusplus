-- =====================================================
-- Migration 003: Add Customer Authentication
-- Adds password authentication fields to customers table
-- =====================================================

-- Add password_hash column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add last_login timestamp
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add failed_login_attempts for security
ALTER TABLE customers ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Add locked_until for account lockout
ALTER TABLE customers ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- Add is_email_verified flag
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;

-- Add email_verification_token
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);

-- Add password_reset_token
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);

-- Add password_reset_expires
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- Create index on email_verification_token for fast lookup
CREATE INDEX IF NOT EXISTS idx_customers_email_verification ON customers(email_verification_token);

-- Create index on password_reset_token for fast lookup
CREATE INDEX IF NOT EXISTS idx_customers_password_reset ON customers(password_reset_token);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 003 completed successfully!';
    RAISE NOTICE '🔐 Added authentication fields to customers table';
END $$;

