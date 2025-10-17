#!/bin/bash

# ════════════════════════════════════════════════════════════
#  🏥 Synergy++ Health Check Script
# ════════════════════════════════════════════════════════════

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🏥 HEALTH CHECK - ALL SERVICES${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to check service
check_service() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        local response=$(curl -s "$url")
        if echo "$response" | grep -q -E '"UP"|"healthy"|PONG|accepting'; then
            echo -e "   $name ${GREEN}✅ UP${NC}"
            return 0
        else
            echo -e "   $name ${YELLOW}⚠️  DEGRADED${NC}"
            return 1
        fi
    else
        echo -e "   $name ${RED}❌ DOWN${NC}"
        return 1
    fi
}

# Track overall status
all_healthy=0

# Infrastructure
echo -e "${YELLOW}1️⃣  Infrastructure:${NC}"
docker exec superapp-postgres pg_isready -U postgres > /dev/null 2>&1 && \
    echo -e "   PostgreSQL (5432) ${GREEN}✅ UP${NC}" || \
    { echo -e "   PostgreSQL (5432) ${RED}❌ DOWN${NC}"; all_healthy=1; }

docker exec redis redis-cli ping > /dev/null 2>&1 && \
    echo -e "   Redis (6379) ${GREEN}✅ UP${NC}" || \
    { echo -e "   Redis (6379) ${RED}❌ DOWN${NC}"; all_healthy=1; }
echo ""

# Core Services
echo -e "${YELLOW}2️⃣  Core Services:${NC}"
check_service "http://localhost:8082/actuator/health" "Admin Identity (8082)" || all_healthy=1
check_service "http://localhost:8081/actuator/health" "Customer Identity (8081)" || all_healthy=1
echo ""

# Marketplace
echo -e "${YELLOW}3️⃣  Marketplace Services:${NC}"
check_service "http://localhost:8085/api/marketplace/health" "Marketplace API (8085)" || all_healthy=1
echo ""

# BFF Layer
echo -e "${YELLOW}4️⃣  BFF Layer:${NC}"
if lsof -ti:9001 > /dev/null 2>&1; then
    check_service "http://localhost:9001/health" "Admin BFF (9001)" || all_healthy=1
else
    echo -e "   Admin BFF (9001) ${YELLOW}⚠️  NOT RUNNING${NC}"
fi

if lsof -ti:9002 > /dev/null 2>&1; then
    check_service "http://localhost:9002/health" "Client BFF (9002)" || all_healthy=1
else
    echo -e "   Client BFF (9002) ${YELLOW}⚠️  NOT RUNNING${NC}"
fi
echo ""

# Frontend
echo -e "${YELLOW}5️⃣  Frontend:${NC}"
if lsof -ti:4000 > /dev/null 2>&1; then
    echo -e "   Admin Portal (4000) ${GREEN}✅ RUNNING${NC}"
else
    echo -e "   Admin Portal (4000) ${YELLOW}⚠️  NOT RUNNING${NC}"
fi

if lsof -ti:5175 > /dev/null 2>&1; then
    echo -e "   Client App (5175) ${GREEN}✅ RUNNING${NC}"
else
    echo -e "   Client App (5175) ${YELLOW}⚠️  NOT RUNNING${NC}"
fi
echo ""

# API Endpoint Tests
echo -e "${YELLOW}6️⃣  API Endpoints:${NC}"
if curl -s http://localhost:8085/api/v1/products > /dev/null 2>&1; then
    echo -e "   GET /api/v1/products ${GREEN}✅ OK${NC}"
else
    echo -e "   GET /api/v1/products ${RED}❌ FAIL${NC}"
    all_healthy=1
fi

if curl -s http://localhost:8085/api/v1/partners > /dev/null 2>&1; then
    echo -e "   GET /api/v1/partners ${GREEN}✅ OK${NC}"
else
    echo -e "   GET /api/v1/partners ${RED}❌ FAIL${NC}"
    all_healthy=1
fi

if curl -s http://localhost:8085/api/v1/assets > /dev/null 2>&1; then
    echo -e "   GET /api/v1/assets ${GREEN}✅ OK${NC}"
else
    echo -e "   GET /api/v1/assets ${RED}❌ FAIL${NC}"
    all_healthy=1
fi
echo ""

# Summary
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
if [ $all_healthy -eq 0 ]; then
    echo -e "${GREEN}  ✅ ALL SYSTEMS OPERATIONAL${NC}"
else
    echo -e "${YELLOW}  ⚠️  SOME SERVICES ARE DOWN${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  • Check logs: tail -f /tmp/synergy-logs/*.log"
    echo "  • Restart services: ./start-services.sh"
    echo "  • View checklist: cat PROJECT-STARTUP-CHECKLIST.md"
fi
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

exit $all_healthy

