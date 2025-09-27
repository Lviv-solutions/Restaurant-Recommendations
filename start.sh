#!/bin/bash

echo "🍽️  Starting Restaurant Recommendations App..."
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start the services
echo "🚀 Starting services with Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are healthy
echo "🔍 Checking service health..."

# Check Weaviate
if curl -s http://localhost:8080/v1/meta > /dev/null; then
    echo "✅ Weaviate is ready"
else
    echo "⚠️  Weaviate is still starting up..."
fi

# Check Backend
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ Backend API is ready"
else
    echo "⚠️  Backend API is still starting up..."
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is ready"
else
    echo "⚠️  Frontend is still starting up..."
fi

echo ""
echo "🌟 Services are starting up! Please wait a few more minutes for everything to be ready."
echo ""
echo "📊 Service URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   Weaviate:  http://localhost:8080"
echo ""
echo "📝 To seed the database with sample data, run:"
echo "   docker-compose exec backend go run scripts/seed_data.go"
echo ""
echo "🛑 To stop all services, run:"
echo "   docker-compose down"
echo ""
echo "📋 To view logs, run:"
echo "   docker-compose logs -f"
