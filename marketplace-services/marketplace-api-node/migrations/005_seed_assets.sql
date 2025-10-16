-- =====================================================
-- Migration 005: Seed Assets for Investment Testing
-- Adds sample investment assets (UITF, Stocks, Crypto, Bonds)
-- =====================================================

-- Insert UITF Assets
INSERT INTO assets (id, name, code, asset_type, price, risk_level, status, min_investment, description) VALUES
('a1111111-1111-1111-1111-111111111111', 'BDO Equity Fund', 'BDOEF', 'UITF', 1.5234, 'MEDIUM', 'ACTIVE', 1000.00, 'Diversified equity fund with strong growth potential'),
('a2222222-2222-2222-2222-222222222222', 'BPI Balanced Fund', 'BPIBF', 'UITF', 2.1567, 'LOW', 'ACTIVE', 1000.00, 'Balanced portfolio of stocks and bonds'),
('a3333333-3333-3333-3333-333333333333', 'Metrobank Money Market Fund', 'MBMMF', 'UITF', 1.0125, 'LOW', 'ACTIVE', 1000.00, 'Safe and liquid money market investments');

-- Insert Stock Assets
INSERT INTO assets (id, name, code, asset_type, price, risk_level, status, min_investment, description) VALUES
('a4444444-4444-4444-4444-444444444444', 'Ayala Corporation', 'AC', 'STOCK', 650.00, 'MEDIUM', 'ACTIVE', 5000.00, 'Leading conglomerate in the Philippines'),
('a5555555-5555-5555-5555-555555555555', 'SM Investments Corporation', 'SM', 'STOCK', 875.50, 'MEDIUM', 'ACTIVE', 5000.00, 'Retail and property giant'),
('a6666666-6666-6666-6666-666666666666', 'Jollibee Foods Corporation', 'JFC', 'STOCK', 245.80, 'MEDIUM', 'ACTIVE', 2500.00, 'Fast food restaurant chain'),
('a7777777-7777-7777-7777-777777777777', 'Bank of the Philippine Islands', 'BPI', 'STOCK', 115.60, 'LOW', 'ACTIVE', 1500.00, 'Universal bank');

-- Insert Crypto Assets
INSERT INTO assets (id, name, code, asset_type, price, risk_level, status, min_investment, description) VALUES
('a8888888-8888-8888-8888-888888888888', 'Bitcoin', 'BTC', 'CRYPTO', 2850000.00, 'HIGH', 'ACTIVE', 1000.00, 'Leading cryptocurrency'),
('a9999999-9999-9999-9999-999999999999', 'Ethereum', 'ETH', 'CRYPTO', 125000.00, 'HIGH', 'ACTIVE', 1000.00, 'Smart contract platform'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ripple', 'XRP', 'CRYPTO', 35.50, 'HIGH', 'ACTIVE', 1000.00, 'Digital payment protocol');

-- Insert Bond Assets
INSERT INTO assets (id, name, code, asset_type, price, risk_level, status, min_investment, description) VALUES
('abbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Philippine Government 10-Year Bond', 'PH10Y', 'BOND', 98.75, 'LOW', 'ACTIVE', 5000.00, 'Government treasury bond'),
('accccccc-cccc-cccc-cccc-cccccccccccc', 'SM Prime Holdings Corporate Bond', 'SMPH-CB', 'BOND', 102.30, 'LOW', 'ACTIVE', 10000.00, 'Corporate bond with fixed coupon'),
('addddddd-dddd-dddd-dddd-dddddddddddd', 'Ayala Land Corporate Bond', 'ALI-CB', 'BOND', 99.85, 'LOW', 'ACTIVE', 10000.00, 'Investment-grade corporate bond');

-- Update asset counts
DO $$
DECLARE
    asset_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO asset_count FROM assets;
    RAISE NOTICE '✅ Migration 005 completed successfully!';
    RAISE NOTICE '📊 Inserted % assets for investment testing', asset_count;
    RAISE NOTICE '💎 Asset types: UITF (3), STOCK (4), CRYPTO (3), BOND (3)';
END $$;

