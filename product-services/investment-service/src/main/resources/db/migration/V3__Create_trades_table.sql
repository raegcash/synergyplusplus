-- Investment Service - Trades Table

CREATE TABLE trades (
    id UUID PRIMARY KEY,
    portfolio_id UUID NOT NULL,
    position_id UUID,
    symbol VARCHAR(20) NOT NULL,
    asset_type VARCHAR(20) NOT NULL,
    trade_type VARCHAR(10) NOT NULL,
    quantity DECIMAL(19,8) NOT NULL,
    price DECIMAL(19,4) NOT NULL,
    total_amount DECIMAL(19,4) NOT NULL,
    fees DECIMAL(19,4),
    executed_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_trades_portfolio ON trades(portfolio_id);
CREATE INDEX idx_trades_position ON trades(position_id);
CREATE INDEX idx_trades_executed_at ON trades(executed_at DESC);

COMMENT ON TABLE trades IS 'Executed trades history';
COMMENT ON COLUMN trades.trade_type IS 'BUY, SELL, SHORT, COVER';




