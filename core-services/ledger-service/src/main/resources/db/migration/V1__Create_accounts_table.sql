-- Create accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    account_code VARCHAR(100) NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID,
    balance DECIMAL(19, 4) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_account_code ON accounts(account_code);
CREATE INDEX idx_account_tenant ON accounts(tenant_id);
CREATE INDEX idx_account_user ON accounts(user_id);
CREATE INDEX idx_account_type ON accounts(account_type);

-- Add comments
COMMENT ON TABLE accounts IS 'Ledger accounts following double-entry bookkeeping principles';
COMMENT ON COLUMN accounts.account_type IS 'ASSET, LIABILITY, EQUITY, REVENUE, or EXPENSE';
COMMENT ON COLUMN accounts.balance IS 'Current account balance';
COMMENT ON COLUMN accounts.user_id IS 'User ID for user-specific accounts (e.g., wallets)';




