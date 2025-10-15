-- Payment Rail Service - Payment Methods Table

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(30) NOT NULL,
    display_name VARCHAR(100),
    last_four VARCHAR(10),
    expiry_month VARCHAR(50),
    expiry_year VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    encrypted_data TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_payment_methods_tenant_user ON payment_methods(tenant_id, user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(is_default);
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active);

COMMENT ON TABLE payment_methods IS 'Saved payment methods for users';
COMMENT ON COLUMN payment_methods.type IS 'CREDIT_CARD, DEBIT_CARD, BANK_ACCOUNT, WALLET, PAYPAL, APPLE_PAY, GOOGLE_PAY';
COMMENT ON COLUMN payment_methods.encrypted_data IS 'PCI-compliant encrypted payment data';




