-- =====================================================
-- Migration 004: Investment Flow - Enterprise Grade
-- Creates tables for investments, payments, portfolio, transactions, audit
-- Production-Ready with full constraints and indexes
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. INVESTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS investments (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Investment Details
    investment_amount DECIMAL(20, 2) NOT NULL CHECK (investment_amount > 0),
    units_purchased DECIMAL(20, 8) NOT NULL CHECK (units_purchased > 0),
    unit_price DECIMAL(20, 8) NOT NULL CHECK (unit_price > 0),
    
    -- Investment Type
    investment_type VARCHAR(50) NOT NULL DEFAULT 'ONE_TIME'
        CHECK (investment_type IN ('ONE_TIME', 'RECURRING', 'AUTO_INVEST')),
    
    -- Status Management
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED')),
    
    -- Dates
    investment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    settlement_date TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Financial Tracking
    fees DECIMAL(20, 2) DEFAULT 0.00 CHECK (fees >= 0),
    total_amount DECIMAL(20, 2) NOT NULL CHECK (total_amount > 0),
    
    -- Metadata
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    notes TEXT,
    
    -- Risk & Compliance
    risk_level VARCHAR(20),
    kyc_verified BOOLEAN DEFAULT FALSE,
    aml_checked BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    -- Soft Delete
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_settlement_date CHECK (settlement_date IS NULL OR settlement_date >= investment_date),
    CONSTRAINT valid_cancelled_date CHECK (cancelled_at IS NULL OR cancelled_at >= investment_date),
    CONSTRAINT valid_total_amount CHECK (total_amount >= investment_amount)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_investments_customer ON investments(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_investments_asset ON investments(asset_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(investment_date DESC);
CREATE INDEX IF NOT EXISTS idx_investments_customer_status ON investments(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_investments_settlement ON investments(settlement_date) WHERE settlement_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_investments_customer_asset ON investments(customer_id, asset_id, status);

-- =====================================================
-- 2. PORTFOLIO HOLDINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    
    -- Holdings Details
    total_units DECIMAL(20, 8) NOT NULL DEFAULT 0 CHECK (total_units >= 0),
    total_invested DECIMAL(20, 2) NOT NULL DEFAULT 0 CHECK (total_invested >= 0),
    average_price DECIMAL(20, 8) NOT NULL DEFAULT 0 CHECK (average_price >= 0),
    
    -- Current Values (updated periodically)
    current_price DECIMAL(20, 8),
    current_value DECIMAL(20, 2),
    unrealized_gain_loss DECIMAL(20, 2),
    unrealized_gain_loss_percent DECIMAL(10, 4),
    
    -- Performance Tracking
    total_return DECIMAL(20, 2),
    total_return_percent DECIMAL(10, 4),
    
    -- Dates
    first_investment_date TIMESTAMP NOT NULL,
    last_investment_date TIMESTAMP NOT NULL,
    last_price_update TIMESTAMP,
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_customer_asset UNIQUE(customer_id, asset_id),
    CONSTRAINT valid_investment_dates CHECK (last_investment_date >= first_investment_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_customer ON portfolio_holdings(customer_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_asset ON portfolio_holdings(asset_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_value ON portfolio_holdings(current_value DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_portfolio_performance ON portfolio_holdings(total_return_percent DESC NULLS LAST);

-- =====================================================
-- 3. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    investment_id UUID REFERENCES investments(id) ON DELETE RESTRICT,
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT,
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL 
        CHECK (transaction_type IN ('INVESTMENT', 'WITHDRAWAL', 'DIVIDEND', 'FEE', 'REFUND', 'ADJUSTMENT')),
    
    amount DECIMAL(20, 2) NOT NULL,
    units DECIMAL(20, 8),
    unit_price DECIMAL(20, 8),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED')),
    
    -- Descriptions
    description TEXT NOT NULL,
    reference_number VARCHAR(255) NOT NULL,
    external_reference VARCHAR(255),
    
    -- Dates
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Soft Delete
    deleted_at TIMESTAMP
);

-- Unique constraint on reference number
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_reference_unique ON transactions(reference_number) WHERE deleted_at IS NULL;

-- Other Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_investment ON transactions(investment_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_date ON transactions(customer_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_type ON transactions(customer_id, transaction_type, status);

-- =====================================================
-- 4. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    investment_id UUID REFERENCES investments(id) ON DELETE RESTRICT,
    
    -- Payment Details
    amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'PHP',
    
    payment_method VARCHAR(50) NOT NULL
        CHECK (payment_method IN ('BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'EWALLET', 'GCASH', 'PAYMAYA', 'BANK_ACCOUNT')),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'AUTHORIZED', 'CAPTURED', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED')),
    
    -- Payment Gateway
    gateway_provider VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    
    -- References
    reference_number VARCHAR(255) NOT NULL,
    external_reference VARCHAR(255),
    
    -- Account Details (encrypted)
    payment_details JSONB,
    
    -- Dates
    initiated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    authorized_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    
    -- Error Handling
    error_code VARCHAR(50),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_payment_dates CHECK (
        (authorized_at IS NULL OR authorized_at >= initiated_at) AND
        (completed_at IS NULL OR completed_at >= initiated_at)
    )
);

-- Unique constraint on reference number
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_reference_unique ON payments(reference_number);

-- Other Indexes
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_investment ON payments(investment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payments(gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(initiated_at DESC);

-- =====================================================
-- 5. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    customer_id UUID REFERENCES customers(id),
    admin_user_id UUID REFERENCES admin_users(id),
    
    -- Audit Details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Change Tracking
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    
    -- Request Details
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    
    -- Context
    description TEXT,
    severity VARCHAR(20) DEFAULT 'INFO' CHECK (severity IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamp (immutable)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_customer ON audit_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity);

-- =====================================================
-- 6. UPDATE TRIGGERS
-- =====================================================

-- Update timestamp trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_holdings_updated_at ON portfolio_holdings;
CREATE TRIGGER update_portfolio_holdings_updated_at
    BEFORE UPDATE ON portfolio_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_reference_number(prefix VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    timestamp_part VARCHAR;
    random_part VARCHAR;
BEGIN
    timestamp_part := TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD');
    random_part := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    RETURN prefix || '-' || timestamp_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate portfolio value
CREATE OR REPLACE FUNCTION calculate_portfolio_value(p_customer_id UUID)
RETURNS TABLE (
    total_invested DECIMAL(20,2),
    current_value DECIMAL(20,2),
    total_gain_loss DECIMAL(20,2),
    total_gain_loss_percent DECIMAL(10,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ph.total_invested), 0) as total_invested,
        COALESCE(SUM(ph.current_value), 0) as current_value,
        COALESCE(SUM(ph.unrealized_gain_loss), 0) as total_gain_loss,
        CASE 
            WHEN COALESCE(SUM(ph.total_invested), 0) = 0 THEN 0
            ELSE (COALESCE(SUM(ph.unrealized_gain_loss), 0) / SUM(ph.total_invested) * 100)
        END as total_gain_loss_percent
    FROM portfolio_holdings ph
    WHERE ph.customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. VIEWS FOR REPORTING
-- =====================================================

-- Investment Summary View
CREATE OR REPLACE VIEW v_investment_summary AS
SELECT 
    i.customer_id,
    c.email as customer_email,
    c.first_name || ' ' || c.last_name as customer_name,
    COUNT(i.id) as total_investments,
    SUM(CASE WHEN i.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_investments,
    SUM(CASE WHEN i.status = 'PENDING' THEN 1 ELSE 0 END) as pending_investments,
    SUM(i.investment_amount) as total_invested,
    SUM(i.fees) as total_fees,
    MIN(i.investment_date) as first_investment_date,
    MAX(i.investment_date) as last_investment_date
FROM investments i
JOIN customers c ON i.customer_id = c.id
WHERE i.deleted_at IS NULL
GROUP BY i.customer_id, c.email, c.first_name, c.last_name;

-- Portfolio Holdings View
CREATE OR REPLACE VIEW v_portfolio_summary AS
SELECT 
    ph.customer_id,
    c.email as customer_email,
    c.first_name || ' ' || c.last_name as customer_name,
    COUNT(ph.id) as total_holdings,
    SUM(ph.total_invested) as total_invested,
    SUM(ph.current_value) as current_value,
    SUM(ph.unrealized_gain_loss) as total_gain_loss,
    CASE 
        WHEN SUM(ph.total_invested) = 0 THEN 0
        ELSE (SUM(ph.unrealized_gain_loss) / SUM(ph.total_invested) * 100)
    END as total_return_percent
FROM portfolio_holdings ph
JOIN customers c ON ph.customer_id = c.id
GROUP BY ph.customer_id, c.email, c.first_name, c.last_name;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 004 completed successfully!';
    RAISE NOTICE '📊 Created 5 tables: investments, portfolio_holdings, transactions, payments, audit_logs';
    RAISE NOTICE '📈 Created indexes for optimal performance';
    RAISE NOTICE '🔧 Created helper functions and views';
    RAISE NOTICE '🎯 Investment flow ready for production!';
END $$;

