export interface Location {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  price_tier: 'low' | 'medium' | 'high';
  avg_bill_for_3: number;
  events: string[];
  rating: number;
  location: Location;
  description: string;
  image_url?: string;
}

export interface SearchRequest {
  q?: string;
  price_tier?: string;
  bill_min?: number;
  bill_max?: number;
  events?: string[];
  cuisine?: string[];
  lat?: number;
  lng?: number;
  limit?: number;
}

export interface SearchResponse {
  restaurants: Restaurant[];
  total: number;
  query: string;
}

export interface RecommendationRequest {
  type: 'popular' | 'budget' | 'events';
  limit?: number;
}

export interface RecommendationResponse {
  type: string;
  restaurants: Restaurant[];
  total: number;
}

export interface RestaurantDetailResponse {
  restaurant: Restaurant;
  similar: Restaurant[];
}
