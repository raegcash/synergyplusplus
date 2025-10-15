# Investment Service

Investment and social trading service (eToro competitor) for Super App Ecosystem.

## Features

- Portfolio management
- Multi-asset trading (stocks, ETF, crypto, forex, commodities)
- Real-time position tracking
- Trade execution
- P&L calculations
- Trade history
- Multi-tenant support
- Social trading ready

## Tech Stack

- Java 17
- Spring Boot 3.2
- PostgreSQL
- Redis
- MapStruct
- Flyway
- OpenAPI/Swagger

## API Endpoints

### Portfolios
- `POST /api/v1/portfolios` - Create portfolio
- `GET /api/v1/portfolios/{id}` - Get portfolio
- `GET /api/v1/portfolios/user/{userId}` - Get user portfolios

### Trades
- `POST /api/v1/trades/execute` - Execute trade
- `GET /api/v1/trades/portfolio/{id}` - Get portfolio trades
- `GET /api/v1/trades/portfolio/{id}/positions` - Get portfolio positions

## Asset Types

- **STOCK** - Individual stocks
- **ETF** - Exchange-traded funds
- **CRYPTO** - Cryptocurrencies
- **FOREX** - Foreign exchange
- **COMMODITY** - Commodities
- **INDEX** - Market indices
- **BOND** - Bonds

## Trade Types

- **BUY** - Buy assets (long)
- **SELL** - Sell assets
- **SHORT** - Short sell
- **COVER** - Cover short position

## Build & Run

```bash
docker build -t investment-service:latest .
docker run -d -p 8084:8084 investment-service:latest
```

## Access

- API: http://localhost:8084/api/v1
- Swagger: http://localhost:8084/swagger-ui.html
- Health: http://localhost:8084/actuator/health




