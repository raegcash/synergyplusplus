-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    transaction_number VARCHAR(100) NOT NULL UNIQUE,
    tenant_id VARCHAR(100) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    description TEXT NOT NULL,
    reference_id VARCHAR(255),
    reference_type VARCHAR(100),
    total_amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

-- Create transaction_entries table
CREATE TABLE transaction_entries (
    id UUID PRIMARY KEY,
    transaction_id UUID NOT NULL,
    account_id UUID NOT NULL,
    entry_type VARCHAR(10) NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    description TEXT,
    balance_after DECIMAL(19, 4),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Create indexes
CREATE INDEX idx_transaction_tenant ON transactions(tenant_id);
CREATE INDEX idx_transaction_ref ON transactions(reference_id);
CREATE INDEX idx_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transaction_status ON transactions(status);
CREATE INDEX idx_entry_transaction ON transaction_entries(transaction_id);
CREATE INDEX idx_entry_account ON transaction_entries(account_id);

-- Add comments
COMMENT ON TABLE transactions IS 'Financial transactions with double-entry bookkeeping';
COMMENT ON TABLE transaction_entries IS 'Individual debit/credit entries for transactions';
COMMENT ON COLUMN transaction_entries.entry_type IS 'DEBIT or CREDIT';
COMMENT ON COLUMN transaction_entries.balance_after IS 'Account balance snapshot after this entry';




