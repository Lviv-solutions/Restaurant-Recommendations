#!/bin/bash

# Google Places Import Script
# يجلب بيانات المطاعم من Google Places API ويدخلها في Weaviate

set -e

echo "🍽️ Google Places Restaurant Importer"
echo "===================================="

# Check if API key is provided
if [ -z "$GOOGLE_PLACES_API_KEY" ]; then
    echo "❌ Error: GOOGLE_PLACES_API_KEY environment variable is required"
    echo "💡 Get your API key from: https://console.cloud.google.com/apis/credentials"
    echo "💡 Enable Places API (New) in your Google Cloud project"
    echo ""
    echo "Usage:"
    echo "  export GOOGLE_PLACES_API_KEY='your-api-key-here'"
    echo "  ./import-places.sh"
    exit 1
fi

# Check if services are running
echo "🔍 Checking services..."

if ! curl -s http://localhost:8000/api/health > /dev/null; then
    echo "❌ Backend API is not running on port 8000"
    echo "💡 Start services with: docker-compose up -d"
    exit 1
fi

if ! curl -s http://localhost:8080/v1/meta > /dev/null; then
    echo "❌ Weaviate is not running on port 8080"
    echo "💡 Start services with: docker-compose up -d"
    exit 1
fi

echo "✅ Services are running"

# Set environment variables
export WEAVIATE_URL="http://localhost:8080"

# Build and run the importer
echo "🔨 Building Places importer..."
cd backend
go build -o ../places-importer ./scripts/places_importer.go

echo "🚀 Starting import process..."
echo "📍 Target location: Riyadh, Saudi Arabia"
echo "🔑 Using API key: ${GOOGLE_PLACES_API_KEY:0:10}..."
echo ""

cd ..
./places-importer

echo ""
echo "🎉 Import completed!"
echo "🔍 Check results at: http://localhost:3000"

# Cleanup
rm -f places-importer
