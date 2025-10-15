-- ========================================
-- SUPER APP - DATABASE SCHEMA V2
-- Workflow & Approval Tables
-- ========================================

-- ========================================
-- 8. APPROVALS TABLE
-- ========================================
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Polymorphic Reference
    item_type VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL,
    
    -- Approval Details
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    priority INTEGER DEFAULT 0,
    
    -- Workflow Position
    current_step VARCHAR(100),
    next_step VARCHAR(100),
    hierarchy_level INTEGER DEFAULT 1,
    
    -- Decision
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    rejected_by VARCHAR(255),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Metadata
    submitted_by VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT chk_approval_item_type CHECK (item_type IN ('PRODUCT', 'PARTNER', 'ASSET', 'CHANGE_REQUEST'))
);

CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_type ON approvals(item_type);
CREATE INDEX idx_approvals_item ON approvals(item_type, item_id);
CREATE INDEX idx_approvals_submitted ON approvals(submitted_at DESC);

-- ========================================
-- 9. CHANGE_REQUESTS TABLE
-- ========================================
CREATE TABLE change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Change Details
    change_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    
    -- Decision
    requested_by VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_change_request_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT chk_change_request_type CHECK (change_type IN ('OPERATIONAL_STATUS', 'WHITELIST_MODE', 'MAINTENANCE_MODE'))
);

CREATE INDEX idx_change_requests_product ON change_requests(product_id);
CREATE INDEX idx_change_requests_status ON change_requests(status);
CREATE INDEX idx_change_requests_type ON change_requests(change_type);

-- Apply triggers
CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_change_requests_updated_at BEFORE UPDATE ON change_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



