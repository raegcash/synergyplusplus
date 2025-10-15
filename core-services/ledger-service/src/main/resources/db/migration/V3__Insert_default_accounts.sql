-- Insert system accounts for each tenant
-- These are example accounts; actual accounts should be created per tenant via API

-- System accounts for demo tenant
INSERT INTO accounts (id, account_code, account_name, account_type, tenant_id, balance, currency, description, is_active, created_at, created_by) VALUES
-- Assets
(gen_random_uuid(), 'CASH-001', 'Cash Account', 'ASSET', 'system', 0, 'USD', 'Main cash account', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'BANK-001', 'Bank Account', 'ASSET', 'system', 0, 'USD', 'Main bank account', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'AR-001', 'Accounts Receivable', 'ASSET', 'system', 0, 'USD', 'Money owed to us', TRUE, NOW(), 'system'),

-- Liabilities
(gen_random_uuid(), 'AP-001', 'Accounts Payable', 'LIABILITY', 'system', 0, 'USD', 'Money we owe', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'LOAN-001', 'Loans Payable', 'LIABILITY', 'system', 0, 'USD', 'Outstanding loans', TRUE, NOW(), 'system'),

-- Equity
(gen_random_uuid(), 'EQUITY-001', 'Owner Equity', 'EQUITY', 'system', 0, 'USD', 'Owner capital', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'RETAINED-001', 'Retained Earnings', 'EQUITY', 'system', 0, 'USD', 'Accumulated profits', TRUE, NOW(), 'system'),

-- Revenue
(gen_random_uuid(), 'REV-FEES-001', 'Fee Revenue', 'REVENUE', 'system', 0, 'USD', 'Transaction fees earned', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'REV-INT-001', 'Interest Revenue', 'REVENUE', 'system', 0, 'USD', 'Interest earned', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'REV-COMM-001', 'Commission Revenue', 'REVENUE', 'system', 0, 'USD', 'Commissions earned', TRUE, NOW(), 'system'),

-- Expenses
(gen_random_uuid(), 'EXP-OPER-001', 'Operating Expenses', 'EXPENSE', 'system', 0, 'USD', 'General operating costs', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'EXP-INT-001', 'Interest Expense', 'EXPENSE', 'system', 0, 'USD', 'Interest paid', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'EXP-FEES-001', 'Fees Expense', 'EXPENSE', 'system', 0, 'USD', 'Fees paid to partners', TRUE, NOW(), 'system');

-- Add comments
COMMENT ON TABLE accounts IS 'Default system accounts created for demonstration purposes';




