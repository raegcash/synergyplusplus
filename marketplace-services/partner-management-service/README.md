# Partner Management Service

Partner management and integrated hypercare service for Super App Ecosystem.

## Features

### Partner Management
- Partner onboarding
- API key management
- Partner configuration
- Commission tracking
- Webhook management
- Partner status control

### Integrated Hypercare
- **Product Management** - Control products & services
- **Feature Flags** - Enable/disable features dynamically
- **Greylist** - Access control (whitelist/blacklist)
- **Maintenance Mode** - Take products offline for maintenance
- **Rollout Control** - Gradual feature rollouts
- **Eligibility Rules** - User/device access control

## Hypercare Capabilities

Similar to: https://v0-management-portal-hypercare.vercel.app/hypercare

- Real-time feature toggling
- Product maintenance mode
- User/device greylist management
- Feature rollout percentage control
- Dynamic configuration updates

## Tech Stack

- Java 17, Spring Boot 3.2, PostgreSQL, Redis

## Build & Run

```bash
docker build -t partner-management-service:latest .
docker run -d -p 8091:8091 partner-management-service:latest
```

## Access

- API: http://localhost:8091/api/v1
- Swagger: http://localhost:8091/swagger-ui.html
- Health: http://localhost:8091/actuator/health

## Key Endpoints

### Partners
- POST /api/v1/partners - Create partner
- GET /api/v1/partners/{id} - Get partner
- PUT /api/v1/partners/{id}/config - Update configuration

### Hypercare
- POST /api/v1/hypercare/products - Create product
- PUT /api/v1/hypercare/products/{id}/maintenance - Toggle maintenance
- POST /api/v1/hypercare/features - Create feature
- PUT /api/v1/hypercare/features/{id}/toggle - Toggle feature
- POST /api/v1/hypercare/greylist - Add to greylist
- GET /api/v1/hypercare/check - Check access eligibility




