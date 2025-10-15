# Savings Service

Digital wallet and savings accounts service for Super App Ecosystem.

## Features

- Savings accounts
- Digital wallet
- Deposit/withdrawal tracking
- Interest calculations
- Savings goals
- Round-up features
- Multi-currency support

## Tech Stack

- Java 17, Spring Boot 3.2, PostgreSQL, Redis

## Build & Run

```bash
docker build -t savings-service:latest .
docker run -d -p 8086:8086 savings-service:latest
```

## Access

- API: http://localhost:8086/api/v1
- Swagger: http://localhost:8086/swagger-ui.html
- Health: http://localhost:8086/actuator/health




