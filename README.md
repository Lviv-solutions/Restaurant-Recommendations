# 🍽️ Restaurant Recommendations Web App

A modern web application for discovering restaurants in Riyadh using AI-powered search and recommendations. Built with Next.js, Go, and Weaviate vector database.

## 🚀 Features

- **Hybrid Search**: Text-based search combined with filters (cuisine, price, events)
- **AI Recommendations**: Vector-based similarity matching for restaurant suggestions
- **Smart Filtering**: Filter by price tier, bill range, cuisine types, and events
- **Restaurant Details**: Comprehensive restaurant information with similar recommendations
- **Responsive Design**: Modern UI built with Tailwind CSS
- **SEO Optimized**: Server-side rendering with Next.js

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Go with Gin framework
- **Database**: Weaviate vector database with text2vec-transformers
- **Cache**: Redis for performance optimization
- **Deployment**: Docker Compose for local development

## 🛠️ Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Go 1.21+ (for local development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Restaurant-Recommendations
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to be ready** (approximately 2-3 minutes)
   - Weaviate: http://localhost:8080
   - Backend API: http://localhost:8000
   - Frontend: http://localhost:3000

4. **Seed the database with sample data**
   ```bash
   docker-compose exec backend go run scripts/seed_data.go
   ```

5. **Open the application**
   Visit http://localhost:3000 in your browser

### Manual Setup (Development)

#### Backend Setup

```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📊 API Endpoints

### Search
- `GET /api/search` - Search restaurants with filters
  - Query parameters: `q`, `price_tier`, `bill_min`, `bill_max`, `events[]`, `cuisine[]`, `limit`

### Recommendations
- `GET /api/recommendations` - Get curated recommendations
  - Query parameters: `type` (popular, budget, events), `limit`

### Restaurant Details
- `GET /api/restaurants/:id` - Get restaurant details with similar recommendations

### Health Check
- `GET /api/health` - Service health status

### Data Import
- `POST /api/import` - Import restaurant data (JSON format)

## 🔍 Search Features

### Text Search
- Natural language queries: "Italian family restaurant"
- Cuisine-based search: "Japanese sushi"
- Event-based search: "live music dining"

### Filters
- **Price Tier**: Budget ($), Moderate ($$), Premium ($$$)
- **Bill Range**: Custom SAR range for 3 people
- **Cuisine**: Italian, Chinese, Japanese, Middle Eastern, etc.
- **Events**: Live Music, Family Friendly, Date Night, etc.

### Recommendations
- **Popular Now**: Highly-rated restaurants
- **Budget Dining**: Restaurants around 200 SAR for 3 people
- **Live Music & Events**: Restaurants with entertainment

## 🏢 Restaurant Data Model

```json
{
  "id": "unique-id",
  "name": "Restaurant Name",
  "cuisine": ["Italian", "Cafe"],
  "price_tier": "medium",
  "avg_bill_for_3": 200,
  "events": ["Live Music", "Family Night"],
  "rating": 4.5,
  "location": {
    "latitude": 24.7136,
    "longitude": 46.6753
  },
  "description": "Restaurant description...",
  "image_url": "https://example.com/image.jpg"
}
```

## 🚀 Deployment

### Production Deployment

1. **Build and deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Environment Variables**
   ```bash
   WEAVIATE_URL=http://weaviate:8080
   REDIS_URL=redis:6379
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

### Cloud Deployment Options

- **Frontend**: Vercel, Netlify
- **Backend**: Fly.io, Railway, Render
- **Database**: Weaviate Cloud Services (WCS)

## 📈 Performance

- Search latency: < 400ms
- Vector similarity matching for recommendations
- Redis caching for frequently accessed data
- Optimized images with Next.js Image component

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 🔧 Development

### Adding New Restaurants

1. **Via API**
   ```bash
   curl -X POST http://localhost:8000/api/import \
     -H "Content-Type: application/json" \
     -d @new_restaurants.json
   ```

2. **Via Seed Script**
   ```bash
   go run scripts/seed_data.go path/to/restaurants.json
   ```

### Customizing Search

The search algorithm uses a weighted scoring system:
- 60% vector similarity (semantic matching)
- 30% rating normalization
- 10% bill range fitness

Modify the scoring in `internal/weaviate/client.go` to adjust relevance.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Weaviate not starting**
   - Ensure Docker has enough memory (4GB+ recommended)
   - Check if ports 8080, 8081 are available

2. **Search returns no results**
   - Verify data has been seeded: `docker-compose exec backend go run scripts/seed_data.go`
   - Check Weaviate health: http://localhost:8080/v1/meta

3. **Frontend can't connect to backend**
   - Verify backend is running on port 8000
   - Check CORS configuration in backend

### Logs

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs weaviate
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

Built with ❤️ for discovering amazing restaurants in Riyadh!
# Restaurant-Recommendations
