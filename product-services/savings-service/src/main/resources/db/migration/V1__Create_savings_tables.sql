-- Savings Service - All Tables

CREATE TABLE savings_accounts (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    account_type VARCHAR(20) NOT NULL,
    balance DECIMAL(19,4) NOT NULL DEFAULT 0,
    interest_rate DECIMAL(5,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    opened_date DATE NOT NULL,
    maturity_date DATE,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    balance_after DECIMAL(19,4) NOT NULL,
    description VARCHAR(500),
    reference_id VARCHAR(100),
    transaction_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_savings_accounts_tenant_user ON savings_accounts(tenant_id, user_id);
CREATE INDEX idx_savings_accounts_status ON savings_accounts(status);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);




