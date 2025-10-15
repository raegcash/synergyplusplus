# Admin BFF

Backend-for-Frontend service for Admin Portal.

## Purpose

Aggregates backend microservice APIs into optimized endpoints for the Admin Portal frontend.

## Features

- API aggregation
- Request/response transformation
- Error handling
- Caching
- Authentication forwarding

## No Database

This service has no database - it only routes and aggregates calls to backend services.

## Backend Services

- Identity Service (8081)
- Partner Management (8091)
- Product Catalog (8090)
- Risk Monitor (8083)

## Build & Run

```bash
docker build -t admin-bff:latest .
docker run -d -p 9001:9001 admin-bff:latest
```

## Access

- API: http://localhost:9001/api/v1
- Health: http://localhost:9001/actuator/health




