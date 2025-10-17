# Identity Service

## Overview

Identity Service is a core foundation service that provides user authentication, authorization, and management capabilities for the Super App Ecosystem.

### Key Features

- **User Authentication**: JWT-based authentication with secure token generation
- **Multi-Tenancy**: Support for multiple tenants/partners with isolated user bases
- **Role-Based Access Control (RBAC)**: Fine-grained permissions and roles
- **KYC Workflow**: Basic Know Your Customer verification status tracking
- **Identity Federation**: Support for external ID mapping
- **Secure Password Storage**: BCrypt password hashing
- **Account Security**: Failed login tracking, account locking
- **Redis Caching**: Performance optimization with distributed caching

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.x**
- **Spring Security** with JWT
- **PostgreSQL** (database)
- **Redis** (caching)
- **Flyway** (database migrations)
- **MapStruct** (DTO mapping)
- **Lombok** (boilerplate reduction)
- **OpenAPI/Swagger** (API documentation)

## Architecture

This service follows Domain-Driven Design (DDD) principles with clear separation of concerns:

```
com.superapp.core.identity/
├── config/            # Configuration classes
├── controller/        # REST controllers
├── domain/
│   ├── entity/        # JPA entities
│   ├── enums/         # Domain enums
│   └── exception/     # Domain exceptions
├── dto/               # Data Transfer Objects
│   ├── request/       # Request DTOs
│   ├── response/      # Response DTOs
│   └── mapper/        # MapStruct mappers
├── repository/        # Spring Data JPA repositories
├── security/          # Security & JWT components
└── service/           # Business logic
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### User Management (Requires Authentication)
- `GET /api/v1/users/{id}` - Get user by ID
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/tenant/{tenantId}` - Get users by tenant
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user (soft delete)
- `GET /api/v1/users/tenant/{tenantId}/count` - Count users by tenant

## Configuration

### Environment Variables

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/identity_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# Redis
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=86400000  # 24 hours
JWT_REFRESH_EXPIRATION=604800000  # 7 days

# Security
SECURITY_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
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
   # Using Docker
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```

2. **Create Database**
   ```bash
   psql -U postgres -c "CREATE DATABASE identity_db;"
   ```

3. **Build and Run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Access API Documentation**
   - Swagger UI: http://localhost:8081/swagger-ui.html
   - API Docs: http://localhost:8081/api-docs

## Running with Docker

```bash
# Build image
docker build -t identity-service:latest .

# Run container
docker run -d \
  -p 8081:8081 \
  -e SPRING_PROFILES_ACTIVE=docker \
  --name identity-service \
  identity-service:latest
```

## Running with Docker Compose

See the main `docker-compose.yml` in the root directory.

## Database Schema

### Users Table
- Multi-tenant user accounts
- KYC status tracking
- Account security (locking, failed attempts)
- Extensible metadata (JSON)

### Roles & Permissions
- Flexible RBAC system
- Tenant-specific or global roles
- Granular permissions (resource:action)

## Testing

```bash
# Run all tests
mvn test

# Run integration tests
mvn verify
```

## Monitoring

### Actuator Endpoints
- Health: `/actuator/health`
- Metrics: `/actuator/metrics`
- Prometheus: `/actuator/prometheus`

### Metrics
- Request counts
- Response times
- Cache hit rates
- Authentication success/failure rates

## Security Considerations

1. **JWT Tokens**: Change JWT secret in production
2. **Password Hashing**: BCrypt with default strength (10 rounds)
3. **Account Locking**: After 5 failed login attempts
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure allowed origins appropriately

## Development

### Code Style
- Follow Java naming conventions
- Use Lombok to reduce boilerplate
- Write self-documenting code
- Add JavaDoc for public APIs

### Database Migrations
- All schema changes via Flyway migrations
- Never modify existing migrations
- Use sequential versioning: V1__, V2__, etc.

## Integration Points

This service is consumed by:
- All other microservices (for authentication)
- Admin BFF (user management)
- Client BFF (user authentication)

## License

Proprietary - Super App Ecosystem




