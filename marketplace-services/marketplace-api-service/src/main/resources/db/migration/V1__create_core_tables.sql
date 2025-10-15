-- ========================================
-- SUPER APP - DATABASE SCHEMA V1
-- Core Marketplace Tables
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. PRODUCTS TABLE
-- ========================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    
    -- Financial
    min_investment DECIMAL(18,2) NOT NULL,
    max_investment DECIMAL(18,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    
    -- Features & Config
    maintenance_mode BOOLEAN DEFAULT FALSE,
    whitelist_mode BOOLEAN DEFAULT FALSE,
    features_count INTEGER DEFAULT 0,
    enabled_features_count INTEGER DEFAULT 0,
    assets_count INTEGER DEFAULT 0,
    
    -- Metadata
    terms_and_conditions TEXT,
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_min_max CHECK (min_investment <= max_investment),
    CONSTRAINT chk_product_status CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED'))
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_type ON products(product_type);

-- ========================================
-- 2. PARTNERS TABLE
-- ========================================
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    
    -- Contact Info
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Business Info
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    address TEXT,
    
    -- Integration
    api_endpoint VARCHAR(500),
    api_key_encrypted TEXT,
    sftp_host VARCHAR(255),
    sftp_username VARCHAR(255),
    
    -- Metadata
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_partner_status CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'REJECTED'))
);

CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_type ON partners(partner_type);
CREATE INDEX idx_partners_code ON partners(code);

-- ========================================
-- 3. PRODUCT_PARTNERS TABLE (Many-to-Many)
-- ========================================
CREATE TABLE product_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    
    -- Relationship Details
    is_primary BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    
    -- Metadata
    mapped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mapped_by VARCHAR(255),
    
    CONSTRAINT uq_product_partner UNIQUE(product_id, partner_id)
);

CREATE INDEX idx_product_partners_product ON product_partners(product_id);
CREATE INDEX idx_product_partners_partner ON product_partners(partner_id);

-- ========================================
-- 4. ASSETS TABLE
-- ========================================
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Pricing
    current_price DECIMAL(18,8) NOT NULL,
    price_currency VARCHAR(3) DEFAULT 'PHP',
    min_investment DECIMAL(18,2) NOT NULL,
    max_investment DECIMAL(18,2) NOT NULL,
    
    -- UITF/Fund Specific Fields
    investment_amount DECIMAL(18,2),
    indicative_units DECIMAL(18,8),
    indicative_navpu DECIMAL(18,8),
    nav_as_of_date DATE,
    nav_per_unit DECIMAL(18,8),
    
    -- Risk & Performance
    risk_level VARCHAR(50),
    historical_return DECIMAL(10,2),
    year_to_date_return DECIMAL(10,2),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    submission_source VARCHAR(50),
    
    -- Metadata
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_asset_status CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED'))
);

CREATE INDEX idx_assets_product ON assets(product_id);
CREATE INDEX idx_assets_partner ON assets(partner_id);
CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_status ON assets(status);

-- ========================================
-- 5. USERS TABLE
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Authentication
    user_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    msisdn VARCHAR(50),
    
    -- Personal Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE,
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(3) DEFAULT 'PH',
    
    -- KYC
    kyc_status VARCHAR(50) DEFAULT 'PENDING',
    kyc_tier VARCHAR(50),
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Account
    account_status VARCHAR(50) DEFAULT 'ACTIVE',
    subscription_tier VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_msisdn ON users(msisdn);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_account_status ON users(account_status);

-- ========================================
-- 6. USER_PRODUCTS TABLE
-- ========================================
CREATE TABLE user_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Onboarding
    onboarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    
    -- Portfolio Summary
    total_investments DECIMAL(18,2) DEFAULT 0,
    current_value DECIMAL(18,2) DEFAULT 0,
    total_returns DECIMAL(18,2) DEFAULT 0,
    return_percentage DECIMAL(10,2) DEFAULT 0,
    
    CONSTRAINT uq_user_product UNIQUE(user_id, product_id)
);

CREATE INDEX idx_user_products_user ON user_products(user_id);
CREATE INDEX idx_user_products_product ON user_products(product_id);

-- ========================================
-- 7. TRANSACTIONS TABLE
-- ========================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- References
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    asset_id UUID REFERENCES assets(id),
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL,
    transaction_status VARCHAR(50) NOT NULL,
    
    -- Amounts
    amount DECIMAL(18,2) NOT NULL,
    units DECIMAL(18,8),
    price_per_unit DECIMAL(18,8),
    fee DECIMAL(18,2) DEFAULT 0,
    total_amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    
    -- Processing
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    
    -- Partner Integration
    partner_ref_id VARCHAR(255),
    sent_to_partner_at TIMESTAMP,
    partner_response JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_product ON transactions(product_id);
CREATE INDEX idx_transactions_partner ON transactions(partner_id);
CREATE INDEX idx_transactions_asset ON transactions(asset_id);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(created_at DESC);

-- ========================================
-- UPDATE TRIGGERS
-- ========================================

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



