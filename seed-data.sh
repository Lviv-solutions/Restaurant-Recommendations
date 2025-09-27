#!/bin/bash

echo "🌱 Seeding Restaurant Database..."
echo "================================"

# Check if Docker Compose is running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Docker Compose services are not running."
    echo "Please run './start.sh' first to start the services."
    exit 1
fi

# Wait a bit more to ensure backend is fully ready
echo "⏳ Waiting for backend to be fully ready..."
sleep 10

# Seed the data
echo "📊 Importing sample restaurant data..."
docker-compose exec backend go run scripts/seed_data.go

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully!"
    echo ""
    echo "🎉 Your restaurant recommendations app is ready!"
    echo "   Visit: http://localhost:3000"
else
    echo "❌ Failed to seed database. Check the logs:"
    echo "   docker-compose logs backend"
fi
