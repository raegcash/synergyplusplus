#!/bin/bash

# Synergy++ Docker Deployment Script
# This script builds and deploys the application using Docker Compose

set -e  # Exit on error

echo "🚀 Synergy++ Docker Deployment"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project directory
cd "$(dirname "$0")"

echo -e "\n${BLUE}📋 Step 1: Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop or Rancher Desktop."
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

echo -e "\n${BLUE}🛑 Step 2: Stopping existing containers...${NC}"
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
echo -e "${GREEN}✅ Stopped existing containers${NC}"

echo -e "\n${BLUE}🏗️  Step 3: Building Docker images...${NC}"
echo "This may take 5-10 minutes on first run..."
docker-compose -f docker-compose.dev.yml build --no-cache

echo -e "\n${BLUE}🚀 Step 4: Starting services...${NC}"
docker-compose -f docker-compose.dev.yml up -d

echo -e "\n${BLUE}⏳ Step 5: Waiting for services to be healthy...${NC}"
sleep 10

echo -e "\n${BLUE}📊 Step 6: Checking service status...${NC}"
docker-compose -f docker-compose.dev.yml ps

echo -e "\n${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📱 Access your applications:"
echo "   Admin Portal:  http://localhost:3000"
echo "   Client App:    http://localhost:3001"
echo "   API Server:    http://localhost:8085"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop all:      docker-compose -f docker-compose.dev.yml down"
echo "   Restart:       docker-compose -f docker-compose.dev.yml restart"
echo "   Status:        docker-compose -f docker-compose.dev.yml ps"
echo ""


