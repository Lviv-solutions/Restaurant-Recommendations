# 🍽️ Restaurant Recommendations Web App --- MVP Plan (No Auth)

## 🎯 1. Goal

Deliver a **public web experience** where any user can: - Search for
restaurants using text and filters.\
- View restaurant details (rating, events, price, etc.).\
- See similar restaurants (vector-based).\
- Browse curated recommendations ("Popular", "Budget 200 SAR", "Family
Events").

> 💡 No login, favorites, or user sessions --- all open access.

------------------------------------------------------------------------

## 🧱 2. Architecture Overview

**Frontend:** Next.js (App Router) + TailwindCSS + SSR for SEO\
**Backend:** Go (Gin) REST API\
**Database:** Weaviate (vector DB, BM25 hybrid search)\
**Cache:** Redis (optional, hot queries)\
**Infra:** Docker Compose (local), Fly.io/Render/Vercel for prod

------------------------------------------------------------------------

## 📊 3. Data Model (Weaviate)

Class: **Restaurant**

  Field            Type             Example
  ---------------- ---------------- -----------------------------------------------
  name             text             "Namq Café"
  cuisine          text\[\]         \["Italian", "Cafe"\]
  price_tier       text             "medium"
  avg_bill_for_3   number           200
  events           text\[\]         \["Live Music", "Family Night"\]
  rating           number           4.5
  location         geoCoordinates   { lat: 24.7136, lng: 46.6753 }
  description      text             "Specialty coffee with Italian sandwiches..."

Vectorization: `text2vec-transformers`\
Search: Hybrid (`nearText` + `bm25` + filters)

------------------------------------------------------------------------

## 🧩 4. API Endpoints (Public)

  ------------------------------------------------------------------------
  Endpoint                Method            Description
  ----------------------- ----------------- ------------------------------
  `/search`               GET               Hybrid search (q + filters)

  `/recommendations`      GET               Curated suggestions (based on
                                            price/events)

  `/restaurants/:id`      GET               Full details + similar
                                            restaurants

  `/import`               POST              Admin-only CSV import (secure
                                            later via env key)
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## 🔎 5. Search Parameters

-   `q`: free-text query ("Italian family event")\
-   `price_tier`: low, medium, high\
-   `bill_min`, `bill_max`: number range\
-   `events[]`: array ("Live Music")\
-   `cuisine[]`: array ("Italian")\
-   `lat`, `lng`: geo filter\
-   `limit`: default 10

🧠 **Ranking formula:**

    score = 0.6 * vector_sim + 0.3 * rating_norm + 0.1 * bill_fit

------------------------------------------------------------------------

## 🖥️ 6. Frontend Pages

### 🏠 Home

-   Search bar\
-   Quick filters: "≈200 SAR", "Family Events", "Italian Cuisine"\
-   Featured sections:
    -   Popular Now\
    -   Budget Dining (\~200 SAR)\
    -   Live Music Spots

### 🔍 Search Results

-   Grid/List view\
-   Filters panel (price tier, cuisine, events)\
-   Card shows: image, name, rating, price tier, events\
-   Sorting: Relevance \| Rating \| Bill Fit

### 🏢 Restaurant Detail

-   Banner image\
-   Info: cuisine, price tier, rating, bill for 3\
-   Events, description, location (map)\
-   **Similar Restaurants** (vector search)

### ⚙️ Admin Import (Optional MVP)

-   CSV upload (protected by ENV key)
-   Validation: name + description required

------------------------------------------------------------------------

## 📈 7. MVP KPIs

-   ⏱ Search latency \< 400ms\
-   ✅ Query success rate \> 95%\
-   🧭 Avg. result relevance (qualitative UX tests)\
-   📈 CTR on restaurant cards

------------------------------------------------------------------------

## 🧪 8. Testing

-   **Unit Tests (Go):** query builders, filters\
-   **Integration:** search flow with Weaviate\
-   **E2E (Playwright):** Search → View Detail → Similar

------------------------------------------------------------------------

## 🚀 9. Delivery Plan

### Week 1 --- Setup & Data

-   Docker Compose (Next.js + Go + Weaviate + t2v)\
-   Schema creation\
-   Sample seed data (100+ restaurants)\
-   Basic API endpoints

### Week 2 --- Search & Results

-   Implement `/search` hybrid query\
-   Filters (price, cuisine, events, bill range)\
-   Frontend: Search UI + Results cards

### Week 3 --- Details & Recommendations

-   `/restaurants/:id` endpoint\
-   Similar restaurants (vector similarity)\
-   Detail page (map, rating, info)\
-   Recommendation sections on home

### Week 4 --- Polish & Deploy

-   Caching (Redis, hot queries)\
-   SEO + SSR\
-   Error handling, empty states\
-   Deploy to Vercel + Render/Fly.io

------------------------------------------------------------------------

## 🔄 10. Future Upgrades (Post-MVP)

-   ✅ Favorites & User Sessions (add Auth)\
-   🧠 Collaborative filtering (implicit feedback)\
-   📍 Geo-personalization (nearby results)\
-   💬 Review sentiment (NLP)\
-   🔒 Admin dashboard
