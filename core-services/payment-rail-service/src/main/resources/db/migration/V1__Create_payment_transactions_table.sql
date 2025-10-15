-- Payment Rail Service - Payment Transactions Table

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    provider VARCHAR(30) NOT NULL,
    external_reference VARCHAR(100),
    payment_method_id VARCHAR(100),
    metadata TEXT,
    error_message TEXT,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_payment_transactions_tenant_user ON payment_transactions(tenant_id, user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_provider ON payment_transactions(provider);
CREATE INDEX idx_payment_transactions_external_ref ON payment_transactions(external_reference);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

COMMENT ON TABLE payment_transactions IS 'Payment transactions for all payment providers';
COMMENT ON COLUMN payment_transactions.tenant_id IS 'Multi-tenant identifier';
COMMENT ON COLUMN payment_transactions.amount IS 'Transaction amount';
COMMENT ON COLUMN payment_transactions.currency IS 'ISO 4217 currency code';
COMMENT ON COLUMN payment_transactions.status IS 'PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED';
COMMENT ON COLUMN payment_transactions.provider IS 'STRIPE, PAYPAL, BANK_TRANSFER, WALLET, INTERNAL';




