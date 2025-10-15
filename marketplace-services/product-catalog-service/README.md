# Product Catalog Service

Product catalog and marketplace orchestration service for Super App Ecosystem.

## Features

- Product listings
- Search & filtering
- Product categorization
- Partner product management
- Dynamic pricing
- Feature flags
- Product recommendations

## Product Types

- **INVESTMENT** - Investment products
- **LENDING** - Loan products
- **SAVINGS** - Savings accounts
- **INSURANCE** - Insurance policies
- **CRYPTO** - Cryptocurrency products
- **FOREX** - Foreign exchange

## Tech Stack

- Java 17, Spring Boot 3.2, PostgreSQL, Redis

## Build & Run

```bash
docker build -t product-catalog-service:latest .
docker run -d -p 8090:8090 product-catalog-service:latest
```

## Access

- API: http://localhost:8090/api/v1
- Swagger: http://localhost:8090/swagger-ui.html
- Health: http://localhost:8090/actuator/health




