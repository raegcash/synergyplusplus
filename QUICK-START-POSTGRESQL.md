# 🚀 Quick Start - PostgreSQL Migration

## What Changed?
✅ **SQLite** → **PostgreSQL** (all Node.js services)  
✅ **H2 (in-memory)** → **PostgreSQL** (all Java services)  
✅ **Temporary data** → **Persistent storage**  
✅ **Single-file DB** → **Enterprise-grade database**

## Getting Started

### Option 1: Automated Setup (Recommended)
```bash
cd /Users/raemarvin.pangilinan/Desktop/Synergy++/superapp-ecosystem

# One command does everything!
./setup-databases.sh
```

This will:
1. Check PostgreSQL is running
2. Create all 11 databases
3. Set up users and permissions
4. Initialize schemas
5. Verify all services

### Option 2: Docker Compose
```bash
# Start PostgreSQL with persistent storage
docker-compose up postgres -d

# Wait for PostgreSQL to be ready
sleep 10

# Initialize databases
./setup-databases.sh

# Start all services
docker-compose up -d
```

### Option 3: Manual Steps
```bash
# 1. Start PostgreSQL
docker-compose up postgres -d

# 2. Initialize databases
./init-postgres.sh

# 3. Initialize Marketplace API schema
cd marketplace-services/marketplace-api-node
npm install
npm run init-schema
cd ../..

# 4. Start services
./start-all.sh
```

## Verify Everything Works

### Check PostgreSQL
```bash
pg_isready -h localhost -p 5432
# Should return: accepting connections
```

### Check Databases
```bash
psql -h localhost -U postgres -c "\l" | grep superapp
```

Expected output:
```
superapp_marketplace
superapp_marketplace_node
identity_db
ledger_db
...
```

### Check Services
```bash
# Marketplace API
curl http://localhost:8085/api/marketplace/docs

# Identity Service
curl http://localhost:8081/actuator/health
```

## Quick Test

### 1. Access Swagger UI
Open: http://localhost:8085/api/marketplace/docs

### 2. Login
```bash
curl -X POST http://localhost:8085/api/marketplace/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

### 3. Create a Product
Use the token from login in Swagger UI to create a product.

### 4. Restart Service
```bash
# Stop the service
# Start it again
# Your data is still there! ✨
```

## Key Endpoints

### Documentation
- Marketplace API: http://localhost:8085/api/marketplace/docs
- Identity Service: http://localhost:8081/swagger-ui.html
- Product Catalog: http://localhost:8090/swagger-ui.html

### Health Checks
- Marketplace: http://localhost:8085/api/marketplace/health
- Identity: http://localhost:8081/actuator/health
- All Java services: http://localhost:{port}/actuator/health

## Default Credentials

### Admin Portal
- **Email**: `admin@superapp.com`
- **Password**: `Admin@123`

### Database
- **User**: `postgres`
- **Password**: `postgres`
- **Port**: `5432`

## Common Commands

### Database Operations
```bash
# Connect to database
psql -h localhost -U postgres -d superapp_marketplace_node

# List all databases
psql -h localhost -U postgres -c "\l"

# Backup database
pg_dump -h localhost -U postgres superapp_marketplace_node > backup.sql

# Restore database
psql -h localhost -U postgres superapp_marketplace_node < backup.sql
```

### Service Operations
```bash
# Start all services
./start-all.sh

# Stop all services
./stop-all.sh

# View logs
docker-compose logs -f marketplace-api-node
tail -f marketplace-services/marketplace-api-node/backend.log
```

## Troubleshooting

### "Connection refused"
```bash
# Check PostgreSQL
docker ps | grep postgres
docker-compose up postgres -d
```

### "Database does not exist"
```bash
./init-postgres.sh
```

### "Cannot connect to database"
```bash
# Check credentials in .env file
cat marketplace-services/marketplace-api-node/.env

# Should have:
DB_HOST=localhost
DB_NAME=superapp_marketplace_node
DB_USER=marketplace_user
DB_PASSWORD=marketplace_pass123
```

### "Schema not initialized"
```bash
cd marketplace-services/marketplace-api-node
npm run init-schema
```

## What's Persistent Now?

✅ **All data** - survives service restarts  
✅ **User accounts** - admin users and groups  
✅ **Products** - all product configurations  
✅ **Partners** - partner information  
✅ **Assets** - investment assets  
✅ **Approvals** - approval workflows  
✅ **Change requests** - configuration changes  
✅ **Features** - feature flags  
✅ **Permissions** - IAM settings  

## Performance Benefits

### Before (SQLite/H2)
- ❌ File locks on concurrent access
- ❌ No connection pooling
- ❌ Limited query optimization
- ❌ No replication
- ❌ Lost on restart (H2)

### After (PostgreSQL)
- ✅ Thousands of concurrent connections
- ✅ Connection pooling (20 max, 5 min)
- ✅ Advanced query optimization
- ✅ Replication support
- ✅ Always persistent

## Next Steps

1. ✅ Run the setup: `./setup-databases.sh`
2. ✅ Test the APIs: Visit Swagger docs
3. ✅ Create test data
4. ✅ Restart services and verify data persists
5. ✅ Set up backups for production

## Need Help?

1. Check logs: `docker-compose logs [service]`
2. Check health: `curl http://localhost:8085/api/marketplace/health`
3. Review: `POSTGRESQL-MIGRATION-COMPLETE.md`

---

**🎉 Your data is now persistent!**

No more temporary storage. All data survives restarts.
Enterprise-grade PostgreSQL with proper connection pooling and ACID compliance.


