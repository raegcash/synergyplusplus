-- =====================================================
-- Migration 006: Profile & KYC Management Tables
-- Creates tables for customer profiles, KYC documents, and verification
-- =====================================================

-- Enable uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: customer_profiles
-- Extended profile information beyond basic customer data
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    civil_status VARCHAR(50),
    nationality VARCHAR(100),
    
    -- Contact Information
    phone_number VARCHAR(50),
    mobile_number VARCHAR(50),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Philippines',
    
    -- Employment Information
    employment_status VARCHAR(50), -- EMPLOYED, SELF_EMPLOYED, UNEMPLOYED, RETIRED
    employer_name VARCHAR(255),
    occupation VARCHAR(255),
    industry VARCHAR(255),
    monthly_income NUMERIC(15, 2),
    
    -- Financial Information
    source_of_funds VARCHAR(255),
    annual_income_range VARCHAR(50), -- 0-250K, 250K-500K, 500K-1M, 1M+
    net_worth_range VARCHAR(50),
    
    -- Investment Profile
    investment_experience VARCHAR(50), -- BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    risk_tolerance VARCHAR(50), -- CONSERVATIVE, MODERATE, AGGRESSIVE
    investment_goals TEXT,
    investment_horizon VARCHAR(50), -- SHORT_TERM, MEDIUM_TERM, LONG_TERM
    
    -- KYC Status
    kyc_level VARCHAR(50) DEFAULT 'NONE', -- NONE, BASIC, INTERMEDIATE, FULL
    kyc_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_REVIEW, APPROVED, REJECTED, EXPIRED
    kyc_submitted_at TIMESTAMP WITH TIME ZONE,
    kyc_reviewed_at TIMESTAMP WITH TIME ZONE,
    kyc_approved_at TIMESTAMP WITH TIME ZONE,
    kyc_expiry_date DATE,
    kyc_reviewer_id UUID REFERENCES admin_users(id),
    kyc_rejection_reason TEXT,
    
    -- Profile Completeness
    profile_completed BOOLEAN DEFAULT FALSE,
    profile_completion_percentage INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Table: kyc_documents
-- Stores customer KYC document information
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    
    -- Document Information
    document_type VARCHAR(100) NOT NULL, -- VALID_ID, PROOF_OF_ADDRESS, SELFIE, TAX_ID, BANK_STATEMENT
    document_number VARCHAR(255),
    document_issuer VARCHAR(255),
    document_issue_date DATE,
    document_expiry_date DATE,
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50), -- image/jpeg, application/pdf
    file_hash VARCHAR(255), -- For integrity checking
    
    -- Verification Status
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_REVIEW, APPROVED, REJECTED, EXPIRED
    verified_by UUID REFERENCES admin_users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- OCR/AI Extracted Data (optional)
    extracted_data JSONB,
    confidence_score NUMERIC(3, 2), -- 0.00 to 1.00
    
    -- Metadata
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: kyc_verifications
-- Audit trail of KYC verification actions
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    
    -- Verification Details
    verification_type VARCHAR(100) NOT NULL, -- DOCUMENT, PHONE, EMAIL, BANK_ACCOUNT, VIDEO_CALL
    verification_method VARCHAR(100), -- MANUAL, AUTOMATED, THIRD_PARTY
    verification_status VARCHAR(50) NOT NULL, -- PENDING, SUCCESS, FAILED
    
    -- Verification Result
    verified_by UUID REFERENCES admin_users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_data JSONB, -- Store verification details
    
    -- Third-Party Verification
    third_party_provider VARCHAR(100), -- If using external KYC service
    third_party_reference VARCHAR(255),
    third_party_response JSONB,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: bank_accounts
-- Customer linked bank accounts for deposits/withdrawals
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Bank Information
    bank_name VARCHAR(255) NOT NULL,
    bank_code VARCHAR(50),
    branch_name VARCHAR(255),
    branch_code VARCHAR(50),
    
    -- Account Information
    account_number VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50), -- SAVINGS, CHECKING, TIME_DEPOSIT
    currency VARCHAR(10) DEFAULT 'PHP',
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_method VARCHAR(100), -- MICRO_DEPOSIT, BANK_STATEMENT, MANUAL
    
    -- Status
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACTIVE, SUSPENDED, CLOSED
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: notification_preferences
-- Customer notification settings
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Email Notifications
    email_enabled BOOLEAN DEFAULT TRUE,
    email_transactions BOOLEAN DEFAULT TRUE,
    email_portfolio BOOLEAN DEFAULT TRUE,
    email_marketing BOOLEAN DEFAULT FALSE,
    email_security BOOLEAN DEFAULT TRUE,
    
    -- SMS Notifications
    sms_enabled BOOLEAN DEFAULT FALSE,
    sms_transactions BOOLEAN DEFAULT FALSE,
    sms_security BOOLEAN DEFAULT TRUE,
    
    -- Push Notifications
    push_enabled BOOLEAN DEFAULT TRUE,
    push_transactions BOOLEAN DEFAULT TRUE,
    push_portfolio BOOLEAN DEFAULT TRUE,
    push_marketing BOOLEAN DEFAULT FALSE,
    
    -- Frequency
    digest_frequency VARCHAR(50) DEFAULT 'DAILY', -- REALTIME, DAILY, WEEKLY, MONTHLY
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_customer_id ON customer_profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_kyc_status ON customer_profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_kyc_level ON customer_profiles(kyc_level);

CREATE INDEX IF NOT EXISTS idx_kyc_documents_customer_id ON kyc_documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_profile_id ON kyc_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_type ON kyc_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_kyc_verifications_customer_id ON kyc_verifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_profile_id ON kyc_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(verification_status);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_customer_id ON bank_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_primary ON bank_accounts(is_primary);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_customer_id ON notification_preferences(customer_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_profiles_modtime
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_kyc_documents_modtime
    BEFORE UPDATE ON kyc_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_bank_accounts_modtime
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_notification_preferences_modtime
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Update profile completion percentage function
CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
    completion_score INTEGER := 0;
BEGIN
    -- Calculate completion based on filled fields (total: 20 fields)
    IF NEW.first_name IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.last_name IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.date_of_birth IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.gender IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.mobile_number IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.address_line1 IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.city IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.postal_code IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.employment_status IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.occupation IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.monthly_income IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.source_of_funds IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.investment_experience IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.risk_tolerance IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.investment_goals IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.email_verified THEN completion_score := completion_score + 5; END IF;
    IF NEW.phone_verified THEN completion_score := completion_score + 5; END IF;
    
    -- Check if KYC documents are uploaded
    IF NEW.kyc_status IN ('APPROVED', 'IN_REVIEW') THEN
        completion_score := completion_score + 15;
    END IF;
    
    NEW.profile_completion_percentage := LEAST(completion_score, 100);
    NEW.profile_completed := (completion_score >= 80);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_profile_completion_trigger
    BEFORE INSERT OR UPDATE ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_profile_completion();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 006 completed successfully!';
    RAISE NOTICE '📊 Created tables:';
    RAISE NOTICE '   - customer_profiles';
    RAISE NOTICE '   - kyc_documents';
    RAISE NOTICE '   - kyc_verifications';
    RAISE NOTICE '   - bank_accounts';
    RAISE NOTICE '   - notification_preferences';
    RAISE NOTICE '🔧 Created indexes and triggers';
    RAISE NOTICE '📈 Profile completion auto-calculation enabled';
END $$;

