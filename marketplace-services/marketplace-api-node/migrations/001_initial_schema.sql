-- =====================================================
-- Marketplace API - PostgreSQL Schema Migration
-- Version: 001
-- Description: Initial database schema for marketplace API
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
    min_investment DECIMAL(15, 2) NOT NULL,
    max_investment DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    whitelist_mode BOOLEAN DEFAULT FALSE,
    features_count INTEGER DEFAULT 0,
    enabled_features_count INTEGER DEFAULT 0,
    assets_count INTEGER DEFAULT 0,
    terms_and_conditions TEXT,
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_product_type CHECK (product_type IN ('INVESTMENT', 'LENDING', 'SAVINGS', 'INSURANCE', 'CRYPTO', 'FOREX')),
    CONSTRAINT chk_product_status CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED')),
    CONSTRAINT chk_min_max_investment CHECK (min_investment <= max_investment)
);

-- Indexes for products
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_code ON products(code);

-- =====================================================
-- PARTNERS TABLE
-- =====================================================
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    address TEXT,
    api_endpoint VARCHAR(500),
    api_key_encrypted VARCHAR(500),
    sftp_host VARCHAR(255),
    sftp_username VARCHAR(255),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_partner_type CHECK (partner_type IN ('BAAS', 'INVESTMENT', 'LENDING', 'INSURANCE', 'PAYMENT', 'DATA_PROVIDER')),
    CONSTRAINT chk_partner_status CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'REJECTED'))
);

-- Indexes for partners
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_type ON partners(partner_type);
CREATE INDEX idx_partners_created ON partners(created_at DESC);
CREATE INDEX idx_partners_code ON partners(code);

-- =====================================================
-- PRODUCT_PARTNERS JUNCTION TABLE
-- =====================================================
CREATE TABLE product_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate mappings
    CONSTRAINT uq_product_partner UNIQUE (product_id, partner_id)
);

-- Indexes for product_partners
CREATE INDEX idx_product_partners_product ON product_partners(product_id);
CREATE INDEX idx_product_partners_partner ON product_partners(partner_id);

-- =====================================================
-- ASSETS TABLE
-- =====================================================
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    description TEXT,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
    price DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'PHP',
    min_investment DECIMAL(15, 2),
    risk_level VARCHAR(20),
    
    -- UITF/Fund specific fields
    investment_amount DECIMAL(15, 2),
    indicative_units DECIMAL(15, 6),
    indicative_navpu DECIMAL(15, 4),
    nav_as_of_date TIMESTAMP,
    
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_asset_type CHECK (asset_type IN ('STOCK', 'BOND', 'UITF', 'MUTUAL_FUND', 'CRYPTO', 'COMMODITY', 'FOREX')),
    CONSTRAINT chk_asset_status CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED')),
    CONSTRAINT chk_risk_level CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'))
);

-- Indexes for assets
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_product ON assets(product_id);
CREATE INDEX idx_assets_partner ON assets(partner_id);
CREATE INDEX idx_assets_created ON assets(created_at DESC);
CREATE INDEX idx_assets_code ON assets(code);

-- =====================================================
-- CHANGE_REQUESTS TABLE
-- =====================================================
CREATE TABLE change_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    requested_by VARCHAR(255),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Constraints
    CONSTRAINT chk_change_type CHECK (change_type IN ('OPERATIONAL_TOGGLE', 'WHITELIST_TOGGLE', 'MAINTENANCE_TOGGLE', 'CONFIGURATION')),
    CONSTRAINT chk_change_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Indexes for change_requests
CREATE INDEX idx_change_requests_status ON change_requests(status);
CREATE INDEX idx_change_requests_product ON change_requests(product_id);
CREATE INDEX idx_change_requests_created ON change_requests(requested_at DESC);

-- =====================================================
-- FEATURES TABLE
-- =====================================================
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    whitelist_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for features
CREATE INDEX idx_features_product ON features(product_id);
CREATE INDEX idx_features_parent ON features(parent_feature_id);
CREATE INDEX idx_features_enabled ON features(enabled);

-- =====================================================
-- GREYLIST TABLE
-- =====================================================
CREATE TABLE greylist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_type VARCHAR(20) NOT NULL,
    identifier_type VARCHAR(50) NOT NULL,
    identifier_value VARCHAR(255) NOT NULL,
    reason TEXT,
    is_temporary BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_list_type CHECK (list_type IN ('WHITELIST', 'BLACKLIST')),
    CONSTRAINT chk_identifier_type CHECK (identifier_type IN ('USER_ID', 'EMAIL', 'PHONE', 'MSISDN', 'DEVICE_ID', 'IP_ADDRESS'))
);

-- Indexes for greylist
CREATE INDEX idx_greylist_type ON greylist(list_type);
CREATE INDEX idx_greylist_identifier ON greylist(identifier_type, identifier_value);
CREATE INDEX idx_greylist_expires ON greylist(expires_at);

-- =====================================================
-- ELIGIBILITY TABLE
-- =====================================================
CREATE TABLE eligibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_definition JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for eligibility
CREATE INDEX idx_eligibility_enabled ON eligibility(enabled);
CREATE INDEX idx_eligibility_priority ON eligibility(priority DESC);

-- =====================================================
-- DATA_POINTS TABLE
-- =====================================================
CREATE TABLE data_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    data_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_config JSONB,
    database_type VARCHAR(50),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_data_type CHECK (data_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'ARRAY', 'OBJECT')),
    CONSTRAINT chk_source_type CHECK (source_type IN ('POSTGRESQL', 'MONGODB', 'REDIS', 'EXTERNAL_API', 'INTERNAL_SERVICE'))
);

-- Indexes for data_points
CREATE INDEX idx_data_points_enabled ON data_points(enabled);
CREATE INDEX idx_data_points_name ON data_points(name);

-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_report_type CHECK (report_type IN ('TRANSACTIONS', 'USERS', 'PERFORMANCE', 'COMPLIANCE', 'CUSTOM'))
);

-- Indexes for reports
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

-- =====================================================
-- SCHEDULED_TASKS TABLE
-- =====================================================
CREATE TABLE scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL,
    schedule_cron VARCHAR(100) NOT NULL,
    configuration JSONB,
    enabled BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_task_type CHECK (task_type IN ('KYC_SUBMISSION', 'TRANSACTION_SYNC', 'DATA_FEED', 'SETTLEMENT', 'REPORT_GENERATION')),
    CONSTRAINT chk_task_status CHECK (status IN ('SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED'))
);

-- Indexes for scheduled_tasks
CREATE INDEX idx_scheduled_tasks_enabled ON scheduled_tasks(enabled);
CREATE INDEX idx_scheduled_tasks_next_run ON scheduled_tasks(next_run_at);
CREATE INDEX idx_scheduled_tasks_status ON scheduled_tasks(status);

-- =====================================================
-- CUSTOMERS TABLE (End Users)
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    date_of_birth DATE,
    kyc_status VARCHAR(50) DEFAULT 'PENDING',
    kyc_verified_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_kyc_status CHECK (kyc_status IN ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED')),
    CONSTRAINT chk_customer_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED'))
);

-- Indexes for customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_kyc_status ON customers(kyc_status);
CREATE INDEX idx_customers_status ON customers(status);

-- =====================================================
-- ADMIN_USERS TABLE (Admin Portal Users)
-- =====================================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_admin_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED'))
);

-- Indexes for admin_users
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_status ON admin_users(status);

-- =====================================================
-- USER_GROUPS TABLE
-- =====================================================
CREATE TABLE user_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_groups
CREATE INDEX idx_user_groups_name ON user_groups(name);

-- =====================================================
-- PERMISSIONS TABLE
-- =====================================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for permissions
CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_name ON permissions(name);

-- =====================================================
-- USER_GROUP_MEMBERS TABLE (Junction)
-- =====================================================
CREATE TABLE user_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    CONSTRAINT uq_user_group UNIQUE (user_id, group_id)
);

-- Indexes for user_group_members
CREATE INDEX idx_user_group_members_user ON user_group_members(user_id);
CREATE INDEX idx_user_group_members_group ON user_group_members(group_id);

-- =====================================================
-- USER_GROUP_PERMISSIONS TABLE (Junction)
-- =====================================================
CREATE TABLE user_group_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    CONSTRAINT uq_group_permission UNIQUE (group_id, permission_id)
);

-- Indexes for user_group_permissions
CREATE INDEX idx_user_group_permissions_group ON user_group_permissions(group_id);
CREATE INDEX idx_user_group_permissions_permission ON user_group_permissions(permission_id);

-- =====================================================
-- ASSET_DATA TABLE (NAV and Market Data)
-- =====================================================
CREATE TABLE asset_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL,
    value DECIMAL(15, 6),
    as_of_date TIMESTAMP NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_data_type CHECK (data_type IN ('NAV', 'MARKET_PRICE', 'NAVPU', 'PERFORMANCE', 'UNITS'))
);

-- Indexes for asset_data
CREATE INDEX idx_asset_data_asset ON asset_data(asset_id);
CREATE INDEX idx_asset_data_date ON asset_data(as_of_date DESC);
CREATE INDEX idx_asset_data_type ON asset_data(data_type);

-- =====================================================
-- ASSET_INTEGRATIONS TABLE
-- =====================================================
CREATE TABLE asset_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL,
    endpoint_url VARCHAR(500),
    credentials_encrypted JSONB,
    schedule_cron VARCHAR(100),
    enabled BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    last_sync_status VARCHAR(50),
    next_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_integration_type CHECK (integration_type IN ('API', 'SFTP', 'CLOUD_STORAGE', 'WEBHOOK', 'DATABASE', 'MANUAL')),
    CONSTRAINT chk_sync_status CHECK (last_sync_status IS NULL OR last_sync_status IN ('SUCCESS', 'FAILED', 'PARTIAL'))
);

-- Indexes for asset_integrations
CREATE INDEX idx_asset_integrations_asset ON asset_integrations(asset_id);
CREATE INDEX idx_asset_integrations_enabled ON asset_integrations(enabled);
CREATE INDEX idx_asset_integrations_next_sync ON asset_integrations(next_sync_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_greylist_updated_at BEFORE UPDATE ON greylist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eligibility_updated_at BEFORE UPDATE ON eligibility FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_points_updated_at BEFORE UPDATE ON data_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_tasks_updated_at BEFORE UPDATE ON scheduled_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_groups_updated_at BEFORE UPDATE ON user_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asset_integrations_updated_at BEFORE UPDATE ON asset_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default admin user (password: Admin@123)
INSERT INTO admin_users (id, email, name, password_hash, status)
VALUES (
    uuid_generate_v4(),
    'admin@superapp.com',
    'System Administrator',
    '$2a$10$XQk8Y8QqJXBqz8M8g8xZ2eBq8Z2xQ8Y8QqJXBqz8M8g8xZ2eBq8Z2', -- Admin@123
    'ACTIVE'
);

-- Insert default user groups
INSERT INTO user_groups (name, description) VALUES
    ('Administrators', 'Full system access'),
    ('Product Managers', 'Manage products and features'),
    ('Operations', 'View and manage operations'),
    ('Compliance', 'Compliance and audit access');

-- Insert permissions
INSERT INTO permissions (name, description, module, action) VALUES
    ('products.view', 'View products', 'products', 'view'),
    ('products.create', 'Create products', 'products', 'create'),
    ('products.edit', 'Edit products', 'products', 'edit'),
    ('products.delete', 'Delete products', 'products', 'delete'),
    ('products.approve', 'Approve products', 'products', 'approve'),
    
    ('partners.view', 'View partners', 'partners', 'view'),
    ('partners.create', 'Create partners', 'partners', 'create'),
    ('partners.edit', 'Edit partners', 'partners', 'edit'),
    ('partners.delete', 'Delete partners', 'partners', 'delete'),
    ('partners.approve', 'Approve partners', 'partners', 'approve'),
    
    ('assets.view', 'View assets', 'assets', 'view'),
    ('assets.create', 'Create assets', 'assets', 'create'),
    ('assets.edit', 'Edit assets', 'assets', 'edit'),
    ('assets.delete', 'Delete assets', 'assets', 'delete'),
    ('assets.approve', 'Approve assets', 'assets', 'approve'),
    
    ('approvals.view', 'View approvals', 'approvals', 'view'),
    ('approvals.approve', 'Approve requests', 'approvals', 'approve'),
    ('approvals.reject', 'Reject requests', 'approvals', 'reject'),
    
    ('users.view', 'View users', 'users', 'view'),
    ('users.create', 'Create users', 'users', 'create'),
    ('users.edit', 'Edit users', 'users', 'edit'),
    ('users.delete', 'Delete users', 'users', 'delete'),
    
    ('reports.view', 'View reports', 'reports', 'view'),
    ('reports.generate', 'Generate reports', 'reports', 'generate'),
    
    ('system.admin', 'Full system administration', 'system', 'admin');

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View for product summaries
CREATE OR REPLACE VIEW v_product_summary AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.product_type,
    p.status,
    COUNT(DISTINCT pp.partner_id) as partner_count,
    COUNT(DISTINCT a.id) as asset_count,
    p.created_at,
    p.approved_at
FROM products p
LEFT JOIN product_partners pp ON p.id = pp.product_id
LEFT JOIN assets a ON p.id = a.product_id
GROUP BY p.id, p.code, p.name, p.product_type, p.status, p.created_at, p.approved_at;

-- View for pending approvals count
CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT 
    'products' as type,
    COUNT(*) as count
FROM products
WHERE status = 'PENDING_APPROVAL'
UNION ALL
SELECT 
    'partners' as type,
    COUNT(*) as count
FROM partners
WHERE status = 'PENDING_APPROVAL'
UNION ALL
SELECT 
    'assets' as type,
    COUNT(*) as count
FROM assets
WHERE status = 'PENDING_APPROVAL'
UNION ALL
SELECT 
    'change_requests' as type,
    COUNT(*) as count
FROM change_requests
WHERE status = 'PENDING';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema migration completed successfully!';
    RAISE NOTICE '📊 Created % tables', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE');
    RAISE NOTICE '📈 Created % views', (SELECT count(*) FROM information_schema.views WHERE table_schema = 'public');
    RAISE NOTICE '🔑 Created % indexes', (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public');
END $$;



