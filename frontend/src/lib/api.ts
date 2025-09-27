import { 
  SearchRequest, 
  SearchResponse, 
  RecommendationRequest, 
  RecommendationResponse,
  RestaurantDetailResponse 
} from '@/types/restaurant';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const api = {
  // Search restaurants
  searchRestaurants: async (params: SearchRequest): Promise<SearchResponse> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return fetchApi<SearchResponse>(`/search?${searchParams.toString()}`);
  },

  // Get restaurant by ID
  getRestaurant: async (id: string): Promise<RestaurantDetailResponse> => {
    return fetchApi<RestaurantDetailResponse>(`/restaurants/${id}`);
  },

  // Get recommendations
  getRecommendations: async (params: RecommendationRequest): Promise<RecommendationResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('type', params.type);
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    return fetchApi<RecommendationResponse>(`/recommendations?${searchParams.toString()}`);
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; service: string }> => {
    return fetchApi<{ status: string; service: string }>('/health');
  },
};

export { ApiError };
