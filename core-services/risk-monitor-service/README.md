# Risk Monitor Service

Risk monitoring and fraud detection service for Super App Ecosystem.

## Features

- Real-time risk scoring
- Fraud detection alerts
- Risk level classification
- Multi-tenant support
- Alert management workflow
- Behavior pattern analysis

## Tech Stack

- Java 17
- Spring Boot 3.2
- PostgreSQL
- Redis
- MapStruct
- Flyway
- OpenAPI/Swagger

## API Endpoints

### Risk Alerts
- `POST /api/v1/risk/alerts` - Create risk alert
- `GET /api/v1/risk/alerts/{id}` - Get alert
- `GET /api/v1/risk/alerts/user/{userId}` - Get user alerts
- `PATCH /api/v1/risk/alerts/{id}/status` - Update alert status

### Risk Scores
- `POST /api/v1/risk/scores/calculate/{userId}` - Calculate risk score
- `GET /api/v1/risk/scores/user/{userId}` - Get user risk score

## Build & Run

```bash
docker build -t risk-monitor-service:latest .
docker run -d -p 8083:8083 risk-monitor-service:latest
```

## Access

- API: http://localhost:8083/api/v1/risk
- Swagger: http://localhost:8083/swagger-ui.html
- Health: http://localhost:8083/actuator/health




