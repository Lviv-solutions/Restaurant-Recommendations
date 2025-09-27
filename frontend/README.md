# Restaurant Recommendations Frontend

A modern, responsive web application built with Next.js and TypeScript for discovering and exploring restaurants in Riyadh. This frontend connects to the Restaurant Recommendations API to provide AI-powered restaurant search and recommendations.

## 🚀 Features

- **AI-Powered Search**: Intelligent restaurant search with text matching and relevance scoring
- **Smart Recommendations**: Get personalized suggestions for popular restaurants, budget dining, and event venues
- **Advanced Filtering**: Filter by cuisine, price tier, bill range, events, and more
- **Responsive Design**: Beautiful, mobile-first UI built with Tailwind CSS
- **Real-time Results**: Fast, dynamic search results with instant filtering
- **Restaurant Details**: Detailed restaurant pages with similar recommendations

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Heroicons](https://heroicons.com/)
- **HTTP Client**: Native Fetch API with custom error handling
- **Deployment**: Docker-ready with production optimizations

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page with recommendations
│   │   ├── search/            # Search results page
│   │   └── restaurant/        # Restaurant detail pages
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   │       ├── SearchBar.tsx  # Search input component
│   │       ├── RestaurantCard.tsx # Restaurant display card
│   │       └── FilterPanel.tsx # Advanced search filters
│   ├── lib/
│   │   └── api.ts            # API client and utilities
│   └── types/
│       └── restaurant.ts     # TypeScript type definitions
├── public/                   # Static assets
├── Dockerfile               # Production Docker configuration
├── server.js               # Custom Next.js server
└── package.json            # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Restaurant Recommendations Backend API running on port 8000

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd Restaurant-Recommendations/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Build and run with Docker:

```bash
# Build the Docker image
docker build -t restaurant-frontend .

# Run the container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8000 restaurant-frontend
```

### Using Docker Compose (recommended):

The frontend is included in the main project's `docker-compose.yml`. Simply run:

```bash
cd .. # Go to project root
docker-compose up
```

## 📚 API Integration

The frontend connects to the Restaurant Recommendations API with the following endpoints:

### Search Restaurants
```typescript
GET /api/search?q=italian&price_tier=medium&bill_max=300
```

### Get Recommendations
```typescript
GET /api/recommendations?type=popular&limit=6
```

### Restaurant Details
```typescript
GET /api/restaurants/:id
```

### Health Check
```typescript
GET /api/health
```

## 🎨 UI Components

### SearchBar
- Real-time search input with debouncing
- Handles search queries and navigation
- Responsive design with search icon

### RestaurantCard
- Displays restaurant information in a card format
- Shows cuisine, price tier, rating, and events
- Clickable for navigation to detail page

### FilterPanel
- Advanced filtering options
- Price range sliders
- Multi-select for cuisines and events
- Real-time filter application

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `PORT` | Frontend server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

### Tailwind Configuration

The project uses a custom Tailwind configuration with:
- Custom color palette (primary colors)
- Extended spacing and typography
- Responsive breakpoints
- Custom animations

## 🚀 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🎯 Key Features Explained

### Home Page
- **Hero Section**: Eye-catching search interface with quick filters
- **Popular Now**: Trending restaurants based on ratings and popularity
- **Budget Dining**: Restaurants around 200 SAR for 3 people
- **Live Music & Events**: Venues with entertainment and special events

### Search Page
- **Advanced Filters**: Price range, cuisine type, events, location
- **Real-time Results**: Instant search results as you type
- **Smart Sorting**: Results ranked by relevance, rating, and price fit

### Restaurant Detail Page
- **Comprehensive Info**: Full restaurant details, location, events
- **Similar Recommendations**: AI-powered suggestions for similar venues
- **Interactive Elements**: Call-to-action buttons and navigation

## 🔍 Search Functionality

The search system supports:

- **Text Search**: Restaurant names, cuisines, descriptions
- **Price Filtering**: By tier (low/medium/high) or specific bill range
- **Cuisine Filtering**: Multiple cuisine types
- **Event Filtering**: Live music, family-friendly, outdoor seating
- **Location-based**: Distance and area-based filtering (future feature)

## 🎨 Design System

### Colors
- **Primary**: Blue tones for branding and CTAs
- **Gray Scale**: Comprehensive gray palette for text and backgrounds
- **Status Colors**: Success, warning, and error states

### Typography
- **Headings**: Bold, hierarchical font sizes
- **Body Text**: Readable font sizes with proper line height
- **Interactive Elements**: Clear, accessible button and link styles

## 🔧 Development

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent component structure and naming

### Performance Optimizations
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading for restaurant cards
- Efficient API caching strategies

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend is running on port 8000
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify CORS settings in backend

2. **Build Errors**
   - Clear `.next` directory: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run lint`

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Verify PostCSS configuration

## 📈 Performance

- **Lighthouse Score**: 90+ for Performance, Accessibility, Best Practices
- **Bundle Size**: Optimized with Next.js automatic splitting
- **Loading Speed**: Fast initial page load with progressive enhancement
- **SEO**: Server-side rendering for better search engine optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is part of the Restaurant Recommendations system. See the main project README for license information.

## 🔗 Related

- [Backend API Documentation](../backend/README.md)
- [Project Overview](../README.md)
- [Data Scraper Documentation](../scraper/README.md)

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
