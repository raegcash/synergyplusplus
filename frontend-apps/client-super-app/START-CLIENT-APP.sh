#!/bin/bash

##############################################################################
# START CLIENT SUPER APP
# Starts the Synergy++ Client Super App on port 5174
##############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Starting Synergy++ Client Super App${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to client-super-app directory
cd "$SCRIPT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
    echo ""
    npm install
    echo ""
fi

# Check if Client BFF is running on port 8085
echo -e "${BLUE}🔍 Checking if Client BFF is running on port 8085...${NC}"
if ! nc -z localhost 8085 2>/dev/null; then
    echo -e "${RED}❌ Client BFF is not running on port 8085${NC}"
    echo -e "${YELLOW}⚠️  Please start the Client BFF first:${NC}"
    echo ""
    echo "   cd superapp-ecosystem/bff-layer/client-bff"
    echo "   ./gradlew bootRun"
    echo ""
    echo -e "${YELLOW}Or run the full demo:${NC}"
    echo ""
    echo "   ./START-FULL-DEMO.sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Client BFF is running on port 8085${NC}"
echo ""

# Start the app
echo -e "${GREEN}🚀 Starting Client Super App on http://localhost:5174${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Access the app at: ${GREEN}http://localhost:5174${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the development server${NC}"
echo ""

# Start Vite dev server
npm run dev

