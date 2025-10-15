# Client BFF

Backend-for-Frontend service for Client Super App.

## Purpose

Aggregates backend microservice APIs into optimized endpoints for the Client Super App frontend.

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
- Investment Service (8084)
- Lending Service (8085)
- Savings Service (8086)
- Product Catalog (8090)

## Build & Run

```bash
docker build -t client-bff:latest .
docker run -d -p 9002:9002 client-bff:latest
```

## Access

- API: http://localhost:9002/api/v1
- Health: http://localhost:9002/actuator/health
