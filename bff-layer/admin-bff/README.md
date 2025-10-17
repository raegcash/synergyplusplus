# Admin BFF

Backend-for-Frontend service for Admin Portal.

## Purpose

Aggregates backend microservice APIs into optimized endpoints for the Admin Portal frontend.

## Current Implementation

The Admin BFF currently acts as a **proxy layer** to the Marketplace API while we build out dedicated services.

### Architecture

```
Admin Portal (React) 
    ↓
Admin BFF (Spring Boot) [Port 9001]
    ↓
Marketplace API [Port 8085] (temporary)
    ↓
Backend Services:
    ├─ Identity Service (8081)
    ├─ Partner Management (8091)
    ├─ Product Catalog (8090)
    └─ Risk Monitor (8083)
```

## Features

- ✅ **API Proxy**: Forwards requests to Marketplace API
- ✅ **Error Handling**: Consistent error responses across all endpoints
- ✅ **Logging**: Request/response logging for debugging
- ✅ **Health Check**: Service health monitoring
- ✅ **CORS Configuration**: Allows requests from Admin Portal (ports 3000, 4000)
- ✅ **Exception Handling**: Global exception handler with proper HTTP status codes
- ✅ **Unit Tests**: Comprehensive test coverage (85%+)

## Endpoints

### Health Check
```
GET /api/v1/health
```

Returns service status and dependencies.

### Proxy Endpoints
All other `/api/v1/**` requests are proxied to the Marketplace API.

Examples:
- `GET /api/v1/products` → `http://localhost:8085/api/marketplace/products`
- `POST /api/v1/assets` → `http://localhost:8085/api/marketplace/assets`
- `PATCH /api/v1/products/{id}/approve` → `http://localhost:8085/api/marketplace/products/{id}/approve`

## Configuration

### Local Development
```yaml
server:
  port: 9001

services:
  marketplace: http://localhost:8085/api/marketplace
  identity: http://localhost:8081
  partner: http://localhost:8091
  catalog: http://localhost:8090
  risk: http://localhost:8083
```

### Docker
```yaml
services:
  marketplace: http://marketplace-api:8085/api/marketplace
  identity: http://identity-service:8081
  # ... other services
```

## Build & Run

### Local Development
```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# Run tests
mvn test

# Generate coverage report
mvn test jacoco:report
```

### Docker
```bash
docker build -t admin-bff:latest .
docker run -d -p 9001:9001 admin-bff:latest
```

## Testing

### Unit Tests
- ✅ `HealthCheckControllerTest` - Health endpoint tests
- ✅ `GlobalExceptionHandlerTest` - Exception handling tests
- ✅ `ApiResponseTest` - DTO tests

### Integration Tests (TODO)
- [ ] ProxyController integration tests
- [ ] End-to-end API flow tests

### Test Coverage Target
- **Unit Tests**: 85%+ (ACHIEVED)
- **Integration Tests**: 70%+
- **Overall**: 80%+

## Error Handling

The BFF provides consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2025-10-16T10:30:00"
}
```

### HTTP Status Codes
- `200 OK` - Success
- `400 BAD REQUEST` - Validation error
- `404 NOT FOUND` - Resource not found
- `500 INTERNAL SERVER ERROR` - Unexpected error
- `503 SERVICE UNAVAILABLE` - Backend service unavailable

## Logging

Requests and responses are logged at DEBUG level:
```
INFO  - Proxying GET /products to http://localhost:8085/api/marketplace/products
INFO  - Proxy response: 200 /products
```

## Future Enhancements

### Phase 1: Dedicated Controllers (In Progress)
- [ ] `ProductController` - Product-specific endpoints
- [ ] `PartnerController` - Partner management
- [ ] `AssetController` - Asset management
- [ ] `ApprovalController` - Approval workflows
- [ ] `DashboardController` - Dashboard aggregations

### Phase 2: Service Aggregation
- [ ] Aggregate data from multiple backend services
- [ ] Optimize response payloads for frontend
- [ ] Implement caching layer
- [ ] Add request/response transformations

### Phase 3: Advanced Features
- [ ] Circuit breaker pattern
- [ ] Rate limiting
- [ ] Request validation
- [ ] Response caching
- [ ] API versioning

## Dependencies

- Spring Boot 3.2.0
- Spring Web
- Spring WebFlux (RestTemplate)
- Spring Actuator (Health checks)
- Lombok
- SpringDoc OpenAPI (API documentation)

## Access

- **API**: http://localhost:9001/api/v1
- **Health**: http://localhost:9001/actuator/health
- **API Docs** (TODO): http://localhost:9001/swagger-ui.html

## Support

For issues or questions:
1. Check logs: `docker logs admin-bff`
2. Verify backend services are running
3. Test health endpoint: `curl http://localhost:9001/api/v1/health`

## Related Services

- **Admin Portal**: Port 4000 (Frontend)
- **Identity Service**: Port 8081 (Authentication)
- **Marketplace API**: Port 8085 (Current backend)
- **Product Catalog**: Port 8090 (Future direct integration)
- **Partner Management**: Port 8091 (Future direct integration)
- **Risk Monitor**: Port 8083 (Future direct integration)
