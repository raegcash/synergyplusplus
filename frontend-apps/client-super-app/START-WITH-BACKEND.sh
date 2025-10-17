#!/bin/bash

# Synergy++ Client App Startup Script with Backend Check
# This script checks backend services and starts the client app

echo "🚀 Starting Synergy++ Client Application..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend services are running
echo "🔍 Checking backend services..."
echo ""

# Check Auth Service (port 8081)
if lsof -i :8081 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth Service (port 8081) - RUNNING${NC}"
else
    echo -e "${RED}❌ Auth Service (port 8081) - NOT RUNNING${NC}"
    AUTH_DOWN=true
fi

# Check Marketplace API (port 8085)
if lsof -i :8085 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Marketplace API (port 8085) - RUNNING${NC}"
else
    echo -e "${RED}❌ Marketplace API (port 8085) - NOT RUNNING${NC}"
    MARKETPLACE_DOWN=true
fi

echo ""

# If services are down, provide instructions
if [ "$AUTH_DOWN" = true ] || [ "$MARKETPLACE_DOWN" = true ]; then
    echo -e "${YELLOW}⚠️  Some backend services are not running!${NC}"
    echo ""
    echo "To start backend services, you have a few options:"
    echo ""
    echo "Option 1 - Start with Docker Compose (Recommended):"
    echo "  cd /Users/raemarvin.pangilinan/Desktop/Synergy++/superapp-ecosystem"
    echo "  docker-compose -f docker-compose.dev.yml up -d"
    echo ""
    echo "Option 2 - Start marketplace API manually (if already configured):"
    echo "  cd /Users/raemarvin.pangilinan/Desktop/Synergy++/superapp-ecosystem/marketplace-services/marketplace-api-node"
    echo "  npm start"
    echo ""
    echo "Option 3 - Use mock data (development mode):"
    echo "  The app will work with limited functionality using client-side mocks"
    echo ""
    echo -e "${YELLOW}Press Enter to continue anyway, or Ctrl+C to stop and start backend services first${NC}"
    read -r
fi

echo ""
echo "🎨 Starting Vite development server..."
echo ""

# Start the Vite dev server
npm run dev

