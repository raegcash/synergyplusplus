-- Investment Service - Portfolios Table

CREATE TABLE portfolios (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    total_value DECIMAL(19,4) NOT NULL,
    cash_balance DECIMAL(19,4) NOT NULL,
    total_profit_loss DECIMAL(19,4),
    total_return_percent DECIMAL(10,4),
    currency VARCHAR(3),
    is_default BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_portfolios_tenant_user ON portfolios(tenant_id, user_id);
CREATE INDEX idx_portfolios_user ON portfolios(user_id);

COMMENT ON TABLE portfolios IS 'Investment portfolios for users';




