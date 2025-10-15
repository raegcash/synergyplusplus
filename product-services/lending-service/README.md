# Lending Service

Loan origination, credit scoring, and payment tracking service for Super App Ecosystem.

## Features

- Loan applications
- Credit scoring & assessment
- Automated loan approval workflow
- Payment scheduling
- Payment tracking
- Interest calculations
- Default management
- Multi-loan types support

## Loan Types

- **PERSONAL** - Personal loans
- **BUSINESS** - Business loans
- **MORTGAGE** - Home mortgages
- **AUTO** - Car loans
- **EDUCATION** - Student loans
- **PAYDAY** - Short-term payday loans

## Tech Stack

- Java 17, Spring Boot 3.2, PostgreSQL, Redis
- MapStruct, Flyway, OpenAPI/Swagger

## Build & Run

```bash
docker build -t lending-service:latest .
docker run -d -p 8085:8085 lending-service:latest
```

## Access

- API: http://localhost:8085/api/v1
- Swagger: http://localhost:8085/swagger-ui.html
- Health: http://localhost:8085/actuator/health




