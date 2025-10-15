-- Product Catalog Service - All Tables

CREATE TABLE products (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    partner_id UUID NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE TABLE product_features (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    feature_name VARCHAR(200) NOT NULL,
    feature_value TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_pricing (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    pricing_model VARCHAR(50) NOT NULL,
    base_price DECIMAL(19,4),
    currency VARCHAR(3),
    fee_structure TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_partner ON products(partner_id);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_features_product ON product_features(product_id);
CREATE INDEX idx_product_pricing_product ON product_pricing(product_id);

COMMENT ON TABLE products IS 'Financial products in the marketplace';
COMMENT ON COLUMN products.product_type IS 'INVESTMENT, LENDING, SAVINGS, INSURANCE, etc.';
COMMENT ON COLUMN products.status IS 'DRAFT, ACTIVE, SUSPENDED, RETIRED';




