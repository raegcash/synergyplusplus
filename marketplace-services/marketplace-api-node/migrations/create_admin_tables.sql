-- Create Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  description TEXT,
  partner_id VARCHAR(50),
  partner_name VARCHAR(255),
  min_investment DECIMAL(15,2) DEFAULT 0,
  max_investment DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PHP',
  terms_and_conditions TEXT,
  status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
  maintenance_mode BOOLEAN DEFAULT false,
  whitelist_mode BOOLEAN DEFAULT false,
  assets_count INTEGER DEFAULT 0,
  features_count INTEGER DEFAULT 0,
  enabled_features_count INTEGER DEFAULT 0,
  submitted_by VARCHAR(255),
  submitted_at TIMESTAMP,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  rejected_by VARCHAR(255),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Partners table
CREATE TABLE IF NOT EXISTS partners (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  webhook_url VARCHAR(500),
  products_count INTEGER DEFAULT 0,
  assets_count INTEGER DEFAULT 0,
  submitted_by VARCHAR(255),
  submitted_at TIMESTAMP,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  rejected_by VARCHAR(255),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Assets table
CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  description TEXT,
  product_id VARCHAR(50),
  product_name VARCHAR(255),
  partner_id VARCHAR(50),
  partner_name VARCHAR(255),
  current_value DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PHP',
  risk_level VARCHAR(20) DEFAULT 'MEDIUM',
  min_investment DECIMAL(15,2) DEFAULT 0,
  max_investment DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
  submitted_by VARCHAR(255),
  submitted_at TIMESTAMP,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  rejected_by VARCHAR(255),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_partner ON products(partner_id);

CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);

CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_product ON assets(product_id);
CREATE INDEX IF NOT EXISTS idx_assets_partner ON assets(partner_id);

-- Insert sample data for testing
INSERT INTO products (id, code, name, product_type, description, status, min_investment, max_investment, created_at)
VALUES 
  ('1', 'GSTOCKS_GLOBAL', 'GStocks Global', 'INVESTMENT', 'Invest in global stocks with fractional shares and competitive fees.', 'ACTIVE', 1000, 1000000, NOW()),
  ('2', 'GGCASH_SAVINGS', 'GGCash Savings', 'SAVINGS', 'High-yield savings account with competitive interest rates.', 'ACTIVE', 100, 500000, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO partners (id, code, name, type, status, contact_email, created_at)
VALUES 
  ('partner-1', 'GLOBEINV', 'Globe Investment', 'INVESTMENT', 'ACTIVE', 'contact@globeinvest.com', NOW()),
  ('partner-2', 'ACME', 'Acme Financial', 'BANK', 'ACTIVE', 'contact@acmefinancial.com', NOW())
ON CONFLICT (id) DO NOTHING;

