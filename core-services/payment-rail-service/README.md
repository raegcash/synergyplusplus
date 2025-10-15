# Payment Rail Service

Payment processing and gateway service for Super App Ecosystem.

## Features

- Multi-provider payment processing (Stripe, PayPal, Bank Transfer, Wallet)
- Payment method management
- Transaction tracking and status management
- Multi-tenant support
- Real-time payment status updates
- PCI compliance ready

## Tech Stack

- Java 17
- Spring Boot 3.2
- PostgreSQL
- Redis (caching)
- MapStruct
- Flyway
- OpenAPI/Swagger

## Configuration

### Environment Variables

```bash
SPRING_PROFILES_ACTIVE=docker
DB_HOST=postgres
DB_PORT=5432
DB_NAME=payment_db
DB_USERNAME=postgres
DB_PASSWORD=postgres
REDIS_HOST=redis
REDIS_PORT=6379
```

## API Endpoints

### Payment Transactions

- `POST /api/v1/payments` - Initiate payment
- `POST /api/v1/payments/{id}/process` - Process payment
- `GET /api/v1/payments/{id}` - Get transaction
- `GET /api/v1/payments/user/{userId}` - Get user transactions

## Build & Run

### Local Development

```bash
# Build
mvn clean package

# Run
java -jar target/payment-rail-service-1.0.0.jar
```

### Docker

```bash
# Build image
docker build -t payment-rail-service:latest .

# Run container
docker run -d -p 8082:8082 \
  --name payment-rail-service \
  --link postgres \
  --link redis \
  -e SPRING_PROFILES_ACTIVE=docker \
  payment-rail-service:latest
```

## Database

Creates tables:
- `payment_transactions` - All payment transactions
- `payment_methods` - Saved payment methods

## Access

- API: http://localhost:8082/api/v1/payments
- Swagger UI: http://localhost:8082/swagger-ui.html
- Health: http://localhost:8082/actuator/health

## Payment Providers

### Supported Providers

- **STRIPE** - Credit/debit card processing
- **PAYPAL** - PayPal transactions
- **BANK_TRANSFER** - Bank transfers
- **WALLET** - Digital wallet
- **INTERNAL** - Internal transfers

### Adding New Providers

1. Add provider enum value
2. Implement provider-specific service
3. Configure provider credentials
4. Update payment processing logic

## Security

- Multi-tenant isolation
- PCI compliance ready
- Encrypted payment data
- Secure API endpoints
- Audit logging

## Monitoring

- Health checks via Spring Actuator
- Transaction status tracking
- Payment success/failure rates
- Provider performance metrics

## License

Proprietary - Super App Ecosystem




