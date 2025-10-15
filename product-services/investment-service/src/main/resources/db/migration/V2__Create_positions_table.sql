-- Investment Service - Positions Table

CREATE TABLE positions (
    id UUID PRIMARY KEY,
    portfolio_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    asset_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(19,8) NOT NULL,
    average_price DECIMAL(19,4) NOT NULL,
    current_price DECIMAL(19,4),
    market_value DECIMAL(19,4),
    profit_loss DECIMAL(19,4),
    return_percent DECIMAL(10,4),
    status VARCHAR(20) NOT NULL,
    opened_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_positions_portfolio ON positions(portfolio_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_symbol ON positions(symbol);

COMMENT ON TABLE positions IS 'Open and closed investment positions';
COMMENT ON COLUMN positions.asset_type IS 'STOCK, ETF, CRYPTO, FOREX, COMMODITY, INDEX, BOND';
COMMENT ON COLUMN positions.status IS 'OPEN, CLOSED, LIQUIDATED';




