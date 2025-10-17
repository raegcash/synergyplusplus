-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    tenant_id VARCHAR(100) NOT NULL,
    external_id VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    kyc_status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    kyc_completed_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_tenant_id ON users(tenant_id);
CREATE INDEX idx_external_id ON users(external_id);

-- Add comments
COMMENT ON TABLE users IS 'User accounts with multi-tenant support';
COMMENT ON COLUMN users.tenant_id IS 'Partner/Tenant ID for multi-tenancy';
COMMENT ON COLUMN users.external_id IS 'External system ID for identity federation';
COMMENT ON COLUMN users.metadata IS 'Extensible metadata stored as JSON';




