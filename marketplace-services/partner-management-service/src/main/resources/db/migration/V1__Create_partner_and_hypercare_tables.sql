-- Partner Management Service - Partners & Hypercare Tables

-- Partners Table
CREATE TABLE partners (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    api_key VARCHAR(200) UNIQUE,
    webhook_url VARCHAR(500),
    commission_rate DECIMAL(5,2),
    metadata TEXT,
    onboarded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

-- Hypercare Products Table
CREATE TABLE hypercare_products (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    partner_id UUID,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    product_type VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT,
    sort_order INTEGER DEFAULT 0,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL
);

-- Hypercare Features Table
CREATE TABLE hypercare_features (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    rollout_percentage INTEGER DEFAULT 100,
    description TEXT,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES hypercare_products(id) ON DELETE CASCADE,
    UNIQUE(product_id, code)
);

-- Hypercare Greylist Table
CREATE TABLE hypercare_greylist (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    product_id UUID,
    feature_id UUID,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(200) NOT NULL,
    access_type VARCHAR(20) NOT NULL,
    reason TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES hypercare_products(id) ON DELETE CASCADE,
    FOREIGN KEY (feature_id) REFERENCES hypercare_features(id) ON DELETE CASCADE
);

-- Partner Configuration Table
CREATE TABLE partner_configurations (
    id UUID PRIMARY KEY,
    partner_id UUID NOT NULL,
    config_key VARCHAR(200) NOT NULL,
    config_value TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    UNIQUE(partner_id, config_key)
);

-- Indexes
CREATE INDEX idx_partners_tenant ON partners(tenant_id);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_hypercare_products_tenant ON hypercare_products(tenant_id);
CREATE INDEX idx_hypercare_products_partner ON hypercare_products(partner_id);
CREATE INDEX idx_hypercare_products_status ON hypercare_products(status);
CREATE INDEX idx_hypercare_features_product ON hypercare_features(product_id);
CREATE INDEX idx_hypercare_greylist_product ON hypercare_greylist(product_id);
CREATE INDEX idx_hypercare_greylist_feature ON hypercare_greylist(feature_id);
CREATE INDEX idx_hypercare_greylist_entity ON hypercare_greylist(entity_type, entity_id);
CREATE INDEX idx_partner_configs_partner ON partner_configurations(partner_id);

COMMENT ON TABLE partners IS 'Financial service partners in the marketplace';
COMMENT ON TABLE hypercare_products IS 'Hypercare-managed products with feature flags';
COMMENT ON TABLE hypercare_features IS 'Feature flags for products';
COMMENT ON TABLE hypercare_greylist IS 'Access control greylist (whitelist/blacklist)';
COMMENT ON COLUMN hypercare_greylist.access_type IS 'ALLOW or DENY';
COMMENT ON COLUMN hypercare_greylist.entity_type IS 'USER, IP, DEVICE, etc.';




