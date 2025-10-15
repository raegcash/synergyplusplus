# Ledger Service

## Overview

Ledger Service is a core foundation service that provides double-entry bookkeeping and transaction management for the Super App Ecosystem.

### Key Features

- **Double-Entry Bookkeeping**: Every transaction has balanced debits and credits
- **Account Management**: Support for all account types (Assets, Liabilities, Equity, Revenue, Expenses)
- **Transaction Recording**: Immutable transaction history with audit trail
- **Multi-Currency Support**: Track balances in different currencies
- **Multi-Tenancy**: Isolated accounts and transactions per tenant/partner
- **Balance Tracking**: Real-time account balance calculations
- **Redis Caching**: Performance optimization with distributed caching
- **Transaction Validation**: Ensures accounting equation always balances

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.x**
- **PostgreSQL** (database)
- **Redis** (caching)
- **Flyway** (database migrations)
- **MapStruct** (DTO mapping)
- **Lombok** (boilerplate reduction)
- **OpenAPI/Swagger** (API documentation)

## Architecture

This service follows Domain-Driven Design (DDD) principles:

```
com.superapp.core.ledger/
├── config/            # Configuration classes
├── controller/        # REST controllers
├── domain/
│   ├── entity/        # JPA entities (Account, Transaction, TransactionEntry)
│   ├── enums/         # Domain enums
│   └── exception/     # Domain exceptions
├── dto/               # Data Transfer Objects
│   ├── request/       # Request DTOs
│   ├── response/      # Response DTOs
│   └── mapper/        # MapStruct mappers
├── repository/        # Spring Data JPA repositories
└── service/           # Business logic (double-entry rules)
```

## Double-Entry Bookkeeping

The ledger follows standard accounting principles:

### Account Types and Normal Balances:

| Account Type | Normal Balance | Increases With | Decreases With |
|--------------|----------------|----------------|----------------|
| ASSET        | Debit          | Debit          | Credit         |
| LIABILITY    | Credit         | Credit         | Debit          |
| EQUITY       | Credit         | Credit         | Debit          |
| REVENUE      | Credit         | Credit         | Debit          |
| EXPENSE      | Debit          | Debit          | Credit         |

### Transaction Rules:

1. Every transaction must have at least 2 entries (1 debit + 1 credit)
2. Total debits must equal total credits
3. Transactions are immutable once posted
4. Account balances are updated atomically

### Example Transaction:

```json
{
  "description": "Customer deposit",
  "totalAmount": 1000.00,
  "currency": "USD",
  "entries": [
    {
      "accountCode": "CASH-001",
      "entryType": "DEBIT",
      "amount": 1000.00
    },
    {
      "accountCode": "REV-FEES-001",
      "entryType": "CREDIT",
      "amount": 1000.00
    }
  ]
}
```

## API Endpoints

### Account Management
- `POST /api/v1/accounts` - Create new account
- `GET /api/v1/accounts/{id}` - Get account by ID
- `GET /api/v1/accounts/code/{code}` - Get account by code
- `GET /api/v1/accounts/tenant/{tenantId}` - Get accounts by tenant
- `GET /api/v1/accounts/user/{userId}` - Get user accounts
- `GET /api/v1/accounts/code/{code}/balance` - Get account balance
- `DELETE /api/v1/accounts/{id}` - Deactivate account

### Transaction Management
- `POST /api/v1/transactions` - Create new transaction
- `GET /api/v1/transactions/{id}` - Get transaction by ID
- `GET /api/v1/transactions/tenant/{tenantId}` - Get transactions by tenant
- `GET /api/v1/transactions/tenant/{tenantId}/date-range` - Get transactions by date range

## Configuration

### Environment Variables

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ledger_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# Redis
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
```

## Running Locally

### Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL 15+
- Redis 7+

### Steps

1. **Start PostgreSQL and Redis**
   ```bash
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```

2. **Create Database**
   ```bash
   psql -U postgres -c "CREATE DATABASE ledger_db;"
   ```

3. **Build and Run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Access API Documentation**
   - Swagger UI: http://localhost:8082/swagger-ui.html
   - API Docs: http://localhost:8082/api-docs

## Running with Docker

```bash
# Build image
docker build -t ledger-service:latest .

# Run container
docker run -d \
  -p 8082:8082 \
  -e SPRING_PROFILES_ACTIVE=docker \
  --name ledger-service \
  ledger-service:latest
```

## Database Schema

### Accounts Table
- Multi-tenant account management
- Support for all 5 account types
- Real-time balance tracking
- User-specific accounts (wallets)

### Transactions Table
- Immutable transaction records
- Reference tracking (link to orders, payments, etc.)
- Status management (PENDING, POSTED, REVERSED)

### Transaction Entries Table
- Individual debit/credit entries
- Account balance snapshots
- Audit trail

## Integration Points

This service is consumed by:
- All product services (Investment, Lending, Savings, Insurance)
- Payment Rail Service
- Admin BFF (reporting & reconciliation)

## Accounting Equation

The service ensures the fundamental accounting equation is always balanced:

```
Assets = Liabilities + Equity + (Revenue - Expenses)
```

## License

Proprietary - Super App Ecosystem




