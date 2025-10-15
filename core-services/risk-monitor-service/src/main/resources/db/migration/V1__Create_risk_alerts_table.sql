-- Risk Monitor Service - Risk Alerts Table

CREATE TABLE risk_alerts (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    alert_type VARCHAR(200) NOT NULL,
    description TEXT,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata TEXT,
    assigned_to VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_risk_alerts_tenant_user ON risk_alerts(tenant_id, user_id);
CREATE INDEX idx_risk_alerts_risk_level ON risk_alerts(risk_level);
CREATE INDEX idx_risk_alerts_status ON risk_alerts(status);
CREATE INDEX idx_risk_alerts_created_at ON risk_alerts(created_at DESC);

COMMENT ON TABLE risk_alerts IS 'Risk and fraud alerts for monitoring';
COMMENT ON COLUMN risk_alerts.risk_level IS 'LOW, MEDIUM, HIGH, CRITICAL';
COMMENT ON COLUMN risk_alerts.status IS 'OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE, ESCALATED';




