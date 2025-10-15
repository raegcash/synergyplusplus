-- =====================================================
-- Migration 002: Add Missing Tables
-- Adds tables that were in SQLite but missing from PostgreSQL schema
-- =====================================================

-- =====================================================
-- APPROVALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_type VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    priority INTEGER DEFAULT 0,
    current_step VARCHAR(255),
    next_step VARCHAR(255),
    hierarchy_level INTEGER DEFAULT 1,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    rejected_by VARCHAR(255),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    submitted_by VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_approval_item_type CHECK (item_type IN ('PRODUCT', 'PARTNER', 'ASSET', 'CUSTOMER')),
    CONSTRAINT chk_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Indexes for approvals
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_item ON approvals(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_approvals_submitted ON approvals(submitted_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_approvals_updated_at 
    BEFORE UPDATE ON approvals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Add columns missing in existing tables
-- =====================================================

-- Add username alias for admin_users (for backward compatibility)
-- Note: We'll handle this in application code instead
-- ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 002 completed successfully!';
    RAISE NOTICE '📊 Added: approvals table';
END $$;


