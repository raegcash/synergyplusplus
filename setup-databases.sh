#!/bin/bash

# =====================================================
# Synergy++ Super App - Complete Database Setup Script
# Sets up PostgreSQL databases for all services
# =====================================================

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Synergy++ Super App - Database Setup                     ║"
echo "║  Setting up PostgreSQL for all services                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "${BLUE}🔍 Checking PostgreSQL status...${NC}"
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "${YELLOW}⚠️  PostgreSQL is not running on localhost:5432${NC}"
    echo "${YELLOW}   Please start PostgreSQL or run: docker-compose up postgres -d${NC}"
    exit 1
fi
echo "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Initialize PostgreSQL databases
echo "${BLUE}📊 Initializing PostgreSQL databases...${NC}"
if [ -f "./init-postgres.sh" ]; then
    chmod +x ./init-postgres.sh
    ./init-postgres.sh
    echo "${GREEN}✅ PostgreSQL databases initialized${NC}"
else
    echo "${RED}❌ init-postgres.sh not found${NC}"
    exit 1
fi
echo ""

# Initialize Node.js Marketplace API schema
echo "${BLUE}📦 Initializing Marketplace API (Node.js) schema...${NC}"
if [ -d "./marketplace-services/marketplace-api-node" ]; then
    cd ./marketplace-services/marketplace-api-node
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo "${YELLOW}⚠️  .env file not found, creating from example...${NC}"
        if [ -f "env.example" ]; then
            cp env.example .env
            echo "${GREEN}✅ Created .env file${NC}"
        fi
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "${BLUE}📦 Installing Node.js dependencies...${NC}"
        npm install
    fi
    
    # Run schema initialization
    echo "${BLUE}🔧 Running schema initialization...${NC}"
    npm run init-schema
    echo "${GREEN}✅ Marketplace API schema initialized${NC}"
    
    cd ../..
else
    echo "${YELLOW}⚠️  marketplace-api-node directory not found, skipping...${NC}"
fi
echo ""

# Check Java services
echo "${BLUE}📊 Checking Java services configuration...${NC}"

check_java_service_config() {
    local service_path=$1
    local service_name=$2
    
    if [ -d "$service_path" ]; then
        local config_file="$service_path/src/main/resources/application.yml"
        if [ -f "$config_file" ]; then
            if grep -q "jdbc:postgresql" "$config_file"; then
                echo "  ${GREEN}✓${NC} $service_name - PostgreSQL configured"
            else
                echo "  ${YELLOW}⚠${NC} $service_name - May need PostgreSQL configuration"
            fi
        else
            echo "  ${YELLOW}⚠${NC} $service_name - No application.yml found"
        fi
    fi
}

echo ""
echo "Core Services:"
check_java_service_config "./core-services/identity-service" "Identity Service"
check_java_service_config "./core-services/ledger-service" "Ledger Service"
check_java_service_config "./core-services/payment-rail-service" "Payment Rail Service"
check_java_service_config "./core-services/risk-monitor-service" "Risk Monitor Service"

echo ""
echo "Product Services:"
check_java_service_config "./product-services/investment-service" "Investment Service"
check_java_service_config "./product-services/lending-service" "Lending Service"
check_java_service_config "./product-services/savings-service" "Savings Service"

echo ""
echo "Marketplace Services:"
check_java_service_config "./marketplace-services/product-catalog-service" "Product Catalog Service"
check_java_service_config "./marketplace-services/partner-management-service" "Partner Management Service"
check_java_service_config "./marketplace-services/marketplace-api-service" "Marketplace API Service (Java)"

echo ""
echo "BFF Layer:"
check_java_service_config "./bff-layer/admin-bff" "Admin BFF"
check_java_service_config "./bff-layer/client-bff" "Client BFF"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  ✅ Database Setup Complete!                              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "${GREEN}Summary:${NC}"
echo "  ✓ PostgreSQL databases created for all services"
echo "  ✓ Users and permissions configured"
echo "  ✓ Marketplace API schema initialized"
echo "  ✓ All data is now persistent"
echo ""
echo "${BLUE}Next Steps:${NC}"
echo "  1. Review service configurations above"
echo "  2. Start services: ./start-all.sh"
echo "  3. Access Marketplace API: http://localhost:8085/api/marketplace/docs"
echo "  4. Default admin login: admin@superapp.com / Admin@123"
echo ""
echo "${YELLOW}Important:${NC}"
echo "  - All data is now stored in PostgreSQL (persistent)"
echo "  - SQLite is completely removed"
echo "  - Database backups recommended for production"
echo ""


