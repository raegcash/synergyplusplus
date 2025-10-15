-- Lending Service - All Tables

CREATE TABLE loan_applications (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    loan_type VARCHAR(20) NOT NULL,
    requested_amount DECIMAL(19,4) NOT NULL,
    term_months INTEGER NOT NULL,
    proposed_interest_rate DECIMAL(5,2),
    status VARCHAR(20) NOT NULL,
    credit_score DECIMAL(5,2),
    monthly_income DECIMAL(19,4),
    existing_debts DECIMAL(19,4),
    purpose VARCHAR(200),
    rejection_reason TEXT,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE TABLE loans (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    application_id UUID NOT NULL,
    loan_type VARCHAR(20) NOT NULL,
    principal_amount DECIMAL(19,4) NOT NULL,
    outstanding_balance DECIMAL(19,4) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INTEGER NOT NULL,
    monthly_payment DECIMAL(19,4) NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    maturity_date DATE,
    next_payment_date DATE,
    total_paid DECIMAL(19,4),
    total_interest_paid DECIMAL(19,4),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE TABLE loan_payments (
    id UUID PRIMARY KEY,
    loan_id UUID NOT NULL,
    payment_number INTEGER NOT NULL,
    amount_due DECIMAL(19,4) NOT NULL,
    amount_paid DECIMAL(19,4),
    principal_amount DECIMAL(19,4),
    interest_amount DECIMAL(19,4),
    status VARCHAR(20) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    late_fee DECIMAL(19,4),
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_loan_applications_tenant_user ON loan_applications(tenant_id, user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loans_tenant_user ON loans(tenant_id, user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_application ON loans(application_id);
CREATE INDEX idx_loan_payments_loan ON loan_payments(loan_id);
CREATE INDEX idx_loan_payments_due_date ON loan_payments(due_date);
CREATE INDEX idx_loan_payments_status ON loan_payments(status);




