#!/bin/bash

echo "🚀 Starting Super App Ecosystem..."
echo ""

# Start all services
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 30

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Super App Ecosystem Started!"
echo ""
echo "🔗 Access Points:"
echo "  Admin BFF: http://localhost:9001"
echo "  Client BFF: http://localhost:9002"
echo "  Identity: http://localhost:8081/swagger-ui.html"
echo "  Ledger: http://localhost:8080/swagger-ui.html"
echo "  Payment: http://localhost:8082/swagger-ui.html"
echo "  Risk: http://localhost:8083/swagger-ui.html"
echo "  Investment: http://localhost:8084/swagger-ui.html"
echo "  Lending: http://localhost:8085/swagger-ui.html"
echo "  Savings: http://localhost:8086/swagger-ui.html"
echo "  Catalog: http://localhost:8090/swagger-ui.html"
echo "  Partner/Hypercare: http://localhost:8091/swagger-ui.html"
echo ""
echo "📝 View logs: docker-compose logs -f [service-name]"
echo "🛑 Stop all: docker-compose down"







