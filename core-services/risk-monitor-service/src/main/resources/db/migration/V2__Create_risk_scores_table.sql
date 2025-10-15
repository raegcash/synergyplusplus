-- Risk Monitor Service - Risk Scores Table

CREATE TABLE risk_scores (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    factors TEXT,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0,
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_risk_scores_tenant_user ON risk_scores(tenant_id, user_id);
CREATE INDEX idx_risk_scores_risk_level ON risk_scores(risk_level);
CREATE INDEX idx_risk_scores_score ON risk_scores(score DESC);

COMMENT ON TABLE risk_scores IS 'User risk scores calculated from various factors';
COMMENT ON COLUMN risk_scores.score IS 'Risk score from 0-100';
COMMENT ON COLUMN risk_scores.risk_level IS 'LOW, MEDIUM, HIGH, CRITICAL';




