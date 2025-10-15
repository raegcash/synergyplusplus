-- ========================================
-- SUPER APP - DATABASE SCHEMA V3
-- Hypercare Tables (Features, Greylist, Eligibility)
-- ========================================

-- ========================================
-- 10. FEATURES TABLE
-- ========================================
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    parent_feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    
    -- Feature Details
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    feature_type VARCHAR(50),
    
    -- Toggles
    enabled BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    whitelist_mode BOOLEAN DEFAULT FALSE,
    
    -- Rollout
    rollout_percentage INTEGER DEFAULT 100,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_rollout CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
);

CREATE INDEX idx_features_product ON features(product_id);
CREATE INDEX idx_features_parent ON features(parent_feature_id);
CREATE INDEX idx_features_enabled ON features(enabled);

-- ========================================
-- 11. GREYLIST TABLE
-- ========================================
CREATE TABLE greylist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Reference
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    msisdn VARCHAR(50),
    
    -- Product Reference
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    
    -- List Type
    list_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    
    -- Status & Expiry
    status VARCHAR(50) DEFAULT 'ACTIVE',
    expires_at TIMESTAMP,
    
    -- Metadata
    added_by VARCHAR(255) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_greylist_type CHECK (list_type IN ('WHITELIST', 'BLACKLIST')),
    CONSTRAINT chk_greylist_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED', 'REMOVED'))
);

CREATE INDEX idx_greylist_user ON greylist(user_id);
CREATE INDEX idx_greylist_product ON greylist(product_id);
CREATE INDEX idx_greylist_msisdn ON greylist(msisdn);
CREATE INDEX idx_greylist_type ON greylist(list_type);
CREATE INDEX idx_greylist_status ON greylist(status);

-- ========================================
-- 12. DATABASE_CONNECTIONS TABLE
-- ========================================
CREATE TABLE database_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Connection Details
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    database VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    password_encrypted TEXT,
    
    -- Connection Pool
    max_connections INTEGER DEFAULT 10,
    timeout INTEGER DEFAULT 30000,
    
    -- Status
    status VARCHAR(50) DEFAULT 'CONNECTED',
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_connections_type ON database_connections(type);
CREATE INDEX idx_connections_status ON database_connections(status);

-- ========================================
-- 13. DATA_POINTS TABLE
-- ========================================
CREATE TABLE data_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Database Connection
    connection_id UUID NOT NULL REFERENCES database_connections(id),
    database_type VARCHAR(50) NOT NULL,
    database_name VARCHAR(255) NOT NULL,
    
    -- Data Source
    source VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL,
    
    -- Data Type
    data_type VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_data_point UNIQUE(connection_id, source, key)
);

CREATE INDEX idx_data_points_connection ON data_points(connection_id);
CREATE INDEX idx_data_points_status ON data_points(status);
CREATE INDEX idx_data_points_type ON data_points(database_type);

-- ========================================
-- 14. ELIGIBILITY_CRITERIA TABLE
-- ========================================
CREATE TABLE eligibility_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    
    -- Criteria Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eligibility_product ON eligibility_criteria(product_id);
CREATE INDEX idx_eligibility_active ON eligibility_criteria(is_active);
CREATE INDEX idx_eligibility_priority ON eligibility_criteria(priority DESC);

-- ========================================
-- 15. ELIGIBILITY_RULES TABLE
-- ========================================
CREATE TABLE eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    criteria_id UUID NOT NULL REFERENCES eligibility_criteria(id) ON DELETE CASCADE,
    
    -- Data Point Reference
    data_point_id UUID NOT NULL REFERENCES data_points(id),
    data_point_key VARCHAR(255) NOT NULL,
    
    -- Rule Logic
    operator VARCHAR(50) NOT NULL,
    value TEXT NOT NULL,
    logical_operator VARCHAR(10),
    
    -- Order
    rule_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rules_criteria ON eligibility_rules(criteria_id);
CREATE INDEX idx_rules_data_point ON eligibility_rules(data_point_id);
CREATE INDEX idx_rules_order ON eligibility_rules(criteria_id, rule_order);

-- Apply triggers
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_greylist_updated_at BEFORE UPDATE ON greylist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON database_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_points_updated_at BEFORE UPDATE ON data_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eligibility_updated_at BEFORE UPDATE ON eligibility_criteria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



