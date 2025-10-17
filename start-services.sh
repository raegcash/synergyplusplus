#!/bin/bash

# ════════════════════════════════════════════════════════════
#  🚀 Synergy++ Services Startup Script
# ════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log directory
LOG_DIR="/tmp/synergy-logs"
mkdir -p "$LOG_DIR"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 Starting Synergy++ Services${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2 FAILED${NC}"
        exit 1
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}⏳ Waiting for $name...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_status 0 "$name is ready"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    print_status 1 "$name failed to start"
    return 1
}

# ════════════════════════════════════════════════════════════
# STEP 1: Infrastructure
# ════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}1️⃣  Starting Infrastructure Services...${NC}"

# Check Docker
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
print_status 0 "Docker is running"

# Start PostgreSQL
if docker ps | grep -q superapp-postgres; then
    print_status 0 "PostgreSQL already running"
else
    docker start superapp-postgres > /dev/null 2>&1 || \
    docker run -d \
      --name superapp-postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -p 5432:5432 \
      postgres:15-alpine > /dev/null 2>&1
    sleep 5
    print_status $? "PostgreSQL started"
fi

# Start Redis
if docker ps | grep -q "redis"; then
    print_status 0 "Redis already running"
else
    docker start redis > /dev/null 2>&1 || \
    docker run -d \
      --name redis \
      -p 6379:6379 \
      redis:7-alpine > /dev/null 2>&1
    sleep 3
    print_status $? "Redis started"
fi

# Create databases
echo -e "${YELLOW}⏳ Creating databases...${NC}"
docker exec superapp-postgres psql -U postgres -c "CREATE DATABASE admin_identity_db;" 2>/dev/null || true
docker exec superapp-postgres psql -U postgres -c "CREATE DATABASE customer_identity_db;" 2>/dev/null || true
docker exec superapp-postgres psql -U postgres -c "CREATE DATABASE superapp_marketplace_node;" 2>/dev/null || true
print_status 0 "Databases created/verified"

# ════════════════════════════════════════════════════════════
# STEP 2: Core Services
# ════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}2️⃣  Starting Core Backend Services...${NC}"

# Admin Identity Service
if lsof -ti:8082 > /dev/null 2>&1; then
    print_status 0 "Admin Identity Service already running"
else
    echo -e "${YELLOW}⏳ Building Admin Identity Service...${NC}"
    cd "$(dirname "$0")/core-services/admin-identity-service"
    mvn clean package -DskipTests > "$LOG_DIR/admin-identity-build.log" 2>&1
    
    echo -e "${YELLOW}⏳ Starting Admin Identity Service...${NC}"
    java -jar target/*.jar \
      --spring.profiles.active=default \
      --spring.datasource.url=jdbc:postgresql://localhost:5432/admin_identity_db \
      > "$LOG_DIR/admin-identity.log" 2>&1 &
    
    wait_for_service "http://localhost:8082/actuator/health" "Admin Identity Service"
fi

# Customer Identity Service
if lsof -ti:8081 > /dev/null 2>&1; then
    print_status 0 "Customer Identity Service already running"
else
    echo -e "${YELLOW}⏳ Building Customer Identity Service...${NC}"
    cd "$(dirname "$0")/core-services/identity-service"
    mvn clean package -DskipTests > "$LOG_DIR/customer-identity-build.log" 2>&1
    
    echo -e "${YELLOW}⏳ Starting Customer Identity Service...${NC}"
    java -jar target/*.jar \
      --spring.profiles.active=default \
      --spring.datasource.url=jdbc:postgresql://localhost:5432/customer_identity_db \
      > "$LOG_DIR/customer-identity.log" 2>&1 &
    
    wait_for_service "http://localhost:8081/actuator/health" "Customer Identity Service"
fi

# ════════════════════════════════════════════════════════════
# STEP 3: Marketplace Services
# ════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}3️⃣  Starting Marketplace Services...${NC}"

# Marketplace API (Node.js)
if lsof -ti:8085 > /dev/null 2>&1; then
    print_status 0 "Marketplace API already running"
else
    echo -e "${YELLOW}⏳ Starting Marketplace API...${NC}"
    cd "$(dirname "$0")/marketplace-services/marketplace-api-node"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⏳ Installing npm dependencies...${NC}"
        npm install > "$LOG_DIR/marketplace-npm-install.log" 2>&1
    fi
    
    PORT=8085 \
    DB_HOST=localhost \
    DB_PORT=5432 \
    DB_NAME=superapp_marketplace_node \
    DB_USER=postgres \
    DB_PASSWORD=postgres \
    node server.js > "$LOG_DIR/marketplace-api.log" 2>&1 &
    
    wait_for_service "http://localhost:8085/api/marketplace/health" "Marketplace API"
fi

# ════════════════════════════════════════════════════════════
# STEP 4: BFF Layer (Optional)
# ════════════════════════════════════════════════════════════
if [ "$1" = "--with-bff" ]; then
    echo ""
    echo -e "${BLUE}4️⃣  Starting BFF Layer Services...${NC}"
    
    # Admin BFF
    if lsof -ti:9001 > /dev/null 2>&1; then
        print_status 0 "Admin BFF already running"
    else
        echo -e "${YELLOW}⏳ Building Admin BFF...${NC}"
        cd "$(dirname "$0")/bff-layer/admin-bff"
        mvn clean package -DskipTests > "$LOG_DIR/admin-bff-build.log" 2>&1
        
        echo -e "${YELLOW}⏳ Starting Admin BFF...${NC}"
        java -jar target/*.jar \
          --spring.profiles.active=default \
          --services.marketplace=http://localhost:8085 \
          --services.identity=http://localhost:8082 \
          > "$LOG_DIR/admin-bff.log" 2>&1 &
        
        wait_for_service "http://localhost:9001/health" "Admin BFF"
    fi
    
    # Client BFF
    if lsof -ti:9002 > /dev/null 2>&1; then
        print_status 0 "Client BFF already running"
    else
        echo -e "${YELLOW}⏳ Building Client BFF...${NC}"
        cd "$(dirname "$0")/bff-layer/client-bff"
        mvn clean package -DskipTests > "$LOG_DIR/client-bff-build.log" 2>&1
        
        echo -e "${YELLOW}⏳ Starting Client BFF...${NC}"
        java -jar target/*.jar \
          --spring.profiles.active=default \
          --services.marketplace=http://localhost:8085 \
          --services.identity=http://localhost:8081 \
          > "$LOG_DIR/client-bff.log" 2>&1 &
        
        wait_for_service "http://localhost:9002/health" "Client BFF"
    fi
fi

# ════════════════════════════════════════════════════════════
# Summary
# ════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ All Services Started Successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo ""
echo -e "${YELLOW}Infrastructure:${NC}"
echo "  • PostgreSQL:           http://localhost:5432"
echo "  • Redis:                http://localhost:6379"
echo ""
echo -e "${YELLOW}Core Services:${NC}"
echo "  • Admin Identity:       http://localhost:8082/actuator/health"
echo "  • Customer Identity:    http://localhost:8081/actuator/health"
echo ""
echo -e "${YELLOW}Marketplace:${NC}"
echo "  • Marketplace API:      http://localhost:8085/api/marketplace/health"
echo ""

if [ "$1" = "--with-bff" ]; then
    echo -e "${YELLOW}BFF Layer:${NC}"
    echo "  • Admin BFF:            http://localhost:9001/health"
    echo "  • Client BFF:           http://localhost:9002/health"
    echo ""
fi

echo -e "${BLUE}📁 Log Files:${NC}"
echo "  • Logs directory:       $LOG_DIR"
echo "  • View logs:            tail -f $LOG_DIR/<service>.log"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "  1. Start Admin Portal:  cd frontend-apps/admin-portal && npm run dev"
echo "  2. Start Client App:    cd frontend-apps/client-app && npm run dev"
echo "  3. Run tests:           cd frontend-apps/admin-portal && npm test"
echo ""
echo -e "${BLUE}🔧 Management:${NC}"
echo "  • Stop all services:    ./stop-services.sh"
echo "  • Health check:         ./check-health.sh"
echo "  • View logs:            tail -f $LOG_DIR/*.log"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"

