-- ========================================
-- SUPER APP - DATABASE SCHEMA V4
-- Integration & Analytics Tables
-- ========================================

-- ========================================
-- 16. ASSET_DATA_POINTS TABLE
-- ========================================
CREATE TABLE asset_data_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    asset_code VARCHAR(50) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    
    -- Price Data
    nav_per_unit DECIMAL(18,8),
    market_price DECIMAL(18,8),
    bid_price DECIMAL(18,8),
    ask_price DECIMAL(18,8),
    
    -- Volume & Performance
    volume DECIMAL(18,2),
    change_amount DECIMAL(18,8),
    change_percentage DECIMAL(10,2),
    high_price DECIMAL(18,8),
    low_price DECIMAL(18,8),
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'PHP',
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_data_asset ON asset_data_points(asset_id);
CREATE INDEX idx_asset_data_timestamp ON asset_data_points(timestamp DESC);
CREATE INDEX idx_asset_data_code ON asset_data_points(asset_code, timestamp DESC);

-- ========================================
-- 17. ASSET_INTEGRATIONS TABLE
-- ========================================
CREATE TABLE asset_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    
    -- Integration Details
    integration_name VARCHAR(255) NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    
    -- Configuration
    api_endpoint VARCHAR(500),
    api_method VARCHAR(10),
    api_headers JSONB,
    sftp_host VARCHAR(255),
    sftp_path VARCHAR(500),
    storage_bucket VARCHAR(255),
    storage_path VARCHAR(500),
    
    -- Schedule
    frequency VARCHAR(50),
    cron_expression VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_sync TIMESTAMP,
    last_sync_status VARCHAR(50),
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_integrations_asset ON asset_integrations(asset_id);
CREATE INDEX idx_asset_integrations_status ON asset_integrations(status);
CREATE INDEX idx_asset_integrations_type ON asset_integrations(integration_type);

-- ========================================
-- 18. PARTNER_INTEGRATIONS TABLE
-- ========================================
CREATE TABLE partner_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    
    -- Integration Details
    integration_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL,
    asset_type VARCHAR(50),
    
    -- File-based Integration
    file_format VARCHAR(50),
    file_template TEXT,
    delivery_method VARCHAR(50),
    
    -- Delivery Config
    sftp_host VARCHAR(255),
    sftp_path VARCHAR(500),
    sftp_username VARCHAR(255),
    api_endpoint VARCHAR(500),
    email_to VARCHAR(255),
    cloud_bucket VARCHAR(255),
    
    -- Schedule
    frequency VARCHAR(50),
    cron_expression VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_run TIMESTAMP,
    last_run_status VARCHAR(50),
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partner_integrations_partner ON partner_integrations(partner_id);
CREATE INDEX idx_partner_integrations_status ON partner_integrations(status);
CREATE INDEX idx_partner_integrations_type ON partner_integrations(partner_type);

-- ========================================
-- 19. INTEGRATION_JOBS TABLE
-- ========================================
CREATE TABLE integration_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Integration Reference (Polymorphic)
    integration_type VARCHAR(50) NOT NULL,
    integration_id UUID NOT NULL,
    
    -- Job Details
    job_type VARCHAR(50) NOT NULL,
    
    -- Execution
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    
    -- Results
    records_processed INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    error_details JSONB,
    
    -- File Info
    file_generated BOOLEAN DEFAULT FALSE,
    file_name VARCHAR(500),
    file_path VARCHAR(1000),
    file_size_bytes BIGINT,
    file_sent BOOLEAN DEFAULT FALSE,
    file_sent_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integration_jobs_type ON integration_jobs(integration_type, integration_id);
CREATE INDEX idx_integration_jobs_status ON integration_jobs(status);
CREATE INDEX idx_integration_jobs_created ON integration_jobs(created_at DESC);

-- ========================================
-- 20. PRODUCT_PERFORMANCE TABLE
-- ========================================
CREATE TABLE product_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    
    -- Period
    period_type VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- User Metrics
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    
    -- Transaction Metrics
    total_transactions INTEGER DEFAULT 0,
    transaction_volume DECIMAL(18,2) DEFAULT 0,
    average_transaction DECIMAL(18,2) DEFAULT 0,
    
    -- Revenue
    total_revenue DECIMAL(18,2) DEFAULT 0,
    total_fees DECIMAL(18,2) DEFAULT 0,
    
    -- Performance
    average_return DECIMAL(10,2) DEFAULT 0,
    user_engagement_rate DECIMAL(5,2) DEFAULT 0,
    user_retention_rate DECIMAL(5,2) DEFAULT 0,
    performance_score INTEGER DEFAULT 0,
    popularity_rank INTEGER,
    
    -- Metadata
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_product_performance UNIQUE(product_id, period_type, period_start)
);

CREATE INDEX idx_product_perf_product ON product_performance(product_id);
CREATE INDEX idx_product_perf_period ON product_performance(period_start DESC);
CREATE INDEX idx_product_perf_score ON product_performance(performance_score DESC);

-- ========================================
-- 21. PARTNER_PERFORMANCE TABLE
-- ========================================
CREATE TABLE partner_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id),
    partner_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL,
    
    -- Period
    period_type VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Volume
    total_volume DECIMAL(18,2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    
    -- Performance
    success_rate DECIMAL(5,2) DEFAULT 0,
    uptime DECIMAL(5,2) DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    
    -- Financial
    total_revenue DECIMAL(18,2) DEFAULT 0,
    total_commission DECIMAL(18,2) DEFAULT 0,
    
    -- Growth
    growth_rate DECIMAL(10,2) DEFAULT 0,
    performance_score INTEGER DEFAULT 0,
    
    -- Metadata
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_partner_performance UNIQUE(partner_id, period_type, period_start)
);

CREATE INDEX idx_partner_perf_partner ON partner_performance(partner_id);
CREATE INDEX idx_partner_perf_period ON partner_performance(period_start DESC);
CREATE INDEX idx_partner_perf_score ON partner_performance(performance_score DESC);

-- ========================================
-- 22. AUDIT_LOGS TABLE
-- ========================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    user_id UUID,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    
    -- Action
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_email);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Apply triggers
CREATE TRIGGER update_asset_integrations_updated_at BEFORE UPDATE ON asset_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_integrations_updated_at BEFORE UPDATE ON partner_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_jobs_updated_at BEFORE UPDATE ON integration_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



