# 🚀 Composable Super App Ecosystem

**A production-ready, enterprise-grade financial Super App built on composable architecture principles.**

---

## 🎯 What This Is

This is a **Marketplace Orchestrator** providing:
- 💰 **Marketplace of Financial Products** - Investments, Lending, Savings, Insurance
- 🏢 **Marketplace of Companies** - Multiple partners offering products
- 📦 **Marketplace of Offerings** - Specific products from each company

Unlike traditional FinTech apps (like eToro), this platform is architected for **composability** and **reusability**, allowing rapid expansion into any vertical (mobility, retail, healthcare) by reusing core foundation services.

---

## 🏗️ Architecture

### **Layered Composable Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Admin Portal    │         │  Client Super App│         │
│  │  (Partner Mgmt + │         │  (Marketplace)   │         │
│  │   Hypercare)     │         │                  │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                         ↓                    ↓
┌─────────────────────────────────────────────────────────────┐
│                       BFF LAYER                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Admin BFF      │         │   Client BFF     │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                         ↓                    ↓
┌─────────────────────────────────────────────────────────────┐
│            MARKETPLACE SERVICES LAYER                       │
│  ┌──────────────────────────────────────────────┐          │
│  │  Partner Management (+ Integrated Hypercare) │          │
│  └──────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────┐          │
│  │           Product Catalog Service            │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│             FINANCIAL PRODUCT PBCs LAYER                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │Investment  │ │  Lending   │ │  Savings   │             │
│  │  Service   │ │  Service   │ │  Service   │             │
│  └────────────┘ └────────────┘ └────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           CORE FOUNDATION SERVICES LAYER                    │
│           (Operational Utilities - Reusable)                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ Identity   │ │   Ledger   │ │  Payment   │             │
│  │  Service   │ │  Service   │ │    Rail    │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│  ┌────────────────────────────────────────────┐            │
│  │         Risk Monitor Service               │            │
│  └────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                INFRASTRUCTURE LAYER                         │
│  PostgreSQL  │  Redis  │  Kafka  │  Prometheus  │ Grafana │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Services

### **Core Foundation (Operational Utilities)**
- **Identity Service** - Authentication, KYC, multi-tenant user management
- **Ledger Service** - Transaction ledger with CQRS, real-time balances
- **Payment Rail Service** - Multi-currency payment processing with ACL
- **Risk Monitor Service** - Real-time fraud detection and risk scoring

### **Financial Products (The Super App Features)**
- **Investment Service** - Social trading, portfolio management, copy trading
- **Lending Service** - Loan origination, credit scoring, collections
- **Savings Service** - Digital wallet, high-yield savings, goal tracking
- **Insurance Broker Service** - Policy aggregation, partner integration

### **Marketplace (Orchestration)**
- **Product Catalog Service** - Product registry, availability, pricing
- **Partner Management Service** - Partner onboarding, **integrated hypercare**, SLA monitoring

### **API Gateways (BFF)**
- **Admin BFF** - Aggregates data for partner management
- **Client BFF** - Aggregates data for user-facing app

### **Frontend**
- **Admin Portal** - Partner management + integrated hypercare controls
- **Client Super App** - Unified marketplace experience

---

## 🚀 Quick Start

### **Prerequisites**
- Docker Desktop or Colima
- Java 17+ (for local development)
- Node.js 20+ (for local development)
- Maven 3.9+ (for local development)

### **Start Everything**

```bash
cd superapp-ecosystem
docker-compose up -d
```

Wait ~60 seconds for all services to start, then access:

- **Client Super App**: http://localhost:3000
- **Admin Portal**: http://localhost:3001
- **API Documentation**: http://localhost:8080/swagger-ui.html

---

## 🔧 Technology Stack

### **Backend**
- Java 17 + Spring Boot 3.2+
- PostgreSQL 15+ (primary database)
- Redis 7+ (caching)
- Apache Kafka 3.6+ (event streaming)
- Spring Data JPA, Spring Security, Spring Kafka
- MapStruct (object mapping), Lombok (boilerplate reduction)

### **Frontend**
- React 18 + TypeScript
- Material-UI (MUI)
- React Query + Redux Toolkit
- Vite (build tool)

### **Infrastructure**
- Docker + Docker Compose
- Prometheus (metrics)
- Grafana (dashboards)

---

## 📁 Project Structure

```
superapp-ecosystem/
├── core-services/              # Layer 1: Foundation
│   ├── identity-service/      # OAuth2, KYC, users
│   ├── ledger-service/        # Transactions, CQRS
│   ├── payment-rail-service/  # Payments, ACL
│   └── risk-monitor-service/  # Fraud detection
│
├── product-services/           # Layer 2: Financial Products
│   ├── investment-service/    # Social trading
│   ├── lending-service/       # Loans
│   ├── savings-service/       # Wallet, savings
│   └── insurance-broker-service/
│
├── marketplace-services/       # Layer 3: Orchestration
│   ├── product-catalog-service/
│   └── partner-management-service/  # + Hypercare
│
├── bff-layer/                  # Layer 4: API Gateways
│   ├── admin-bff/
│   └── client-bff/
│
├── frontend-apps/              # Layer 5: UIs
│   ├── admin-portal/          # Partner management
│   └── client-superapp/       # User marketplace
│
├── shared-libs/                # Shared utilities
│   ├── common-domain/         # DTOs, enums
│   ├── acl-adapters/          # Partner integrations
│   └── event-schemas/         # Kafka events
│
└── infrastructure/             # DevOps
    ├── docker/
    └── kubernetes/
```

---

## 🎯 Key Features

### **For End Users (Client Super App)**
✅ Browse marketplace of financial products  
✅ Create investment portfolio  
✅ Execute trades (buy/sell)  
✅ Follow and copy successful traders  
✅ Apply for loans  
✅ Open savings accounts  
✅ Compare insurance policies  
✅ View unified transaction history  

### **For Platform Admins (Admin Portal)**
✅ Onboard new partners  
✅ Configure partner APIs (ACL)  
✅ Manage product catalog  
✅ **Integrated Hypercare**:
  - Toggle product features
  - Enable/disable maintenance mode
  - Manage greylist (user access control)
  - Emergency shutdown controls
✅ Monitor partner performance  
✅ Track revenue share  
✅ View system health metrics  

---

## 🔑 Key Architectural Patterns

### **1. Domain-Driven Design (DDD)**
Services are **Packaged Business Capabilities (PBCs)** - independent, deployable units that encapsulate specific business functions.

### **2. Event-Driven Architecture (EDA)**
Services communicate asynchronously via Kafka events for eventual consistency and loose coupling.

### **3. CQRS (Command Query Responsibility Segregation)**
Separate read and write models for optimal performance in high-throughput scenarios (e.g., Ledger Service).

### **4. Anti-Corruption Layer (ACL)**
Protects internal PBCs from external partner API changes. Enables multi-partner integration without vendor lock-in.

### **5. Multi-Tenancy**
Shared infrastructure with strict data isolation enforced at database and application levels.

### **6. Zero Trust Security**
Every service-to-service call is authenticated and authorized. No implicit trust.

---

## 📊 API Documentation

Each service exposes OpenAPI/Swagger documentation:

- Identity Service: http://localhost:8081/swagger-ui.html
- Ledger Service: http://localhost:8082/swagger-ui.html
- Investment Service: http://localhost:8083/swagger-ui.html
- Partner Management: http://localhost:8084/swagger-ui.html
- Admin BFF: http://localhost:8090/swagger-ui.html
- Client BFF: http://localhost:8091/swagger-ui.html

---

## 🧪 Testing

### **Run All Tests**
```bash
./mvnw test
```

### **Run Specific Service Tests**
```bash
cd core-services/identity-service
./mvnw test
```

---

## 📈 Monitoring

### **Grafana Dashboards**
Access: http://localhost:3002  
Login: admin / admin

Pre-configured dashboards:
- System Overview
- Service Health
- Transaction Volume
- Error Rates
- Latency P95/P99

### **Prometheus Metrics**
Access: http://localhost:9090

---

## 🚧 Development

### **Local Development (Without Docker)**

1. **Start Infrastructure**
```bash
docker-compose -f infrastructure/docker/docker-compose-infra.yml up -d
```

2. **Run Service Locally**
```bash
cd core-services/identity-service
./mvnw spring-boot:run
```

3. **Run Frontend Locally**
```bash
cd frontend-apps/client-superapp
npm install
npm run dev
```

---

## 📚 Documentation

- [Architecture Overview](./docs/architecture/00-ARCHITECTURE-OVERVIEW.md)
- [Implementation Plan](./IMPLEMENTATION-PLAN.md)
- [API Contracts](./docs/api-contracts/)
- [Deployment Guide](./docs/deployment/)
- [Strategic Blueprint](../Strategic%20Blueprint%20for%20a%20Composable%20FinTech%20Super%20App%20Ecosystem.md)

---

## 🤝 Contributing

This is an enterprise reference implementation. Key principles:

1. **Follow DDD** - Each service is a bounded context
2. **API-First** - Design APIs before implementation
3. **Test Coverage** - Minimum 80% coverage
4. **Documentation** - Update docs with code changes
5. **Security** - Zero Trust, principle of least privilege

---

## 📄 License

Proprietary - Internal Use Only

---

## 🎉 What Makes This Special

✨ **Composable** - Foundation services reusable across ANY vertical  
✨ **Production-Ready** - Health checks, monitoring, graceful shutdown  
✨ **Enterprise-Grade** - Multi-tenant, secure, scalable  
✨ **Partner-Friendly** - Easy integration via ACL pattern  
✨ **Developer-Friendly** - Clear architecture, comprehensive docs  

**This isn't just a FinTech app - it's a platform for building the next generation of Super Apps.** 🚀




