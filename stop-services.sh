#!/bin/bash

# ════════════════════════════════════════════════════════════
#  🛑 Synergy++ Services Stop Script
# ════════════════════════════════════════════════════════════

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🛑 Stopping Synergy++ Services${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to stop service by port
stop_service() {
    local port=$1
    local name=$2
    
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping $name (port $port)...${NC}"
        kill -9 $(lsof -ti:$port) 2>/dev/null
        echo -e "${GREEN}✅ $name stopped${NC}"
    else
        echo -e "${GREEN}✅ $name not running${NC}"
    fi
}

echo -e "${YELLOW}Stopping Backend Services...${NC}"
stop_service 8082 "Admin Identity Service"
stop_service 8081 "Customer Identity Service"
stop_service 8085 "Marketplace API"
stop_service 9001 "Admin BFF"
stop_service 9002 "Client BFF"
stop_service 8083 "Ledger Service"
stop_service 8084 "Payment Rail Service"
stop_service 8087 "Risk Monitor Service"
stop_service 8086 "Product Catalog Service"
stop_service 8088 "Partner Management Service"
stop_service 8089 "Investment Service"
stop_service 8090 "Lending Service"
stop_service 8091 "Savings Service"

echo ""
echo -e "${YELLOW}Stopping Frontend Services...${NC}"
stop_service 4000 "Admin Portal"
stop_service 5175 "Client App"

echo ""
echo -e "${YELLOW}Docker Containers Status:${NC}"
if [ "$1" = "--stop-docker" ]; then
    echo -e "${YELLOW}Stopping Docker containers...${NC}"
    docker stop superapp-postgres redis 2>/dev/null || true
    echo -e "${GREEN}✅ Docker containers stopped${NC}"
else
    echo -e "${GREEN}ℹ️  Docker containers still running (use --stop-docker to stop them)${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Services Stopped Successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Note:${NC} To stop Docker containers too, run:"
echo "  ./stop-services.sh --stop-docker"
echo ""

