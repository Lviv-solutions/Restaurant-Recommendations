'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import RestaurantCard from '@/components/ui/RestaurantCard';
import FilterPanel from '@/components/ui/FilterPanel';
import { Restaurant, SearchRequest } from '@/types/restaurant';
import { api } from '@/lib/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');

  // Parse filters from URL
  const [filters, setFilters] = useState<SearchRequest>({});

  const parseFiltersFromURL = useCallback(() => {
    const newFilters: SearchRequest = {};
    
    const q = searchParams.get('q');
    if (q) {
      newFilters.q = q;
      setQuery(q);
    }

    const priceTier = searchParams.get('price_tier');
    if (priceTier) newFilters.price_tier = priceTier;

    const billMin = searchParams.get('bill_min');
    if (billMin) newFilters.bill_min = parseFloat(billMin);

    const billMax = searchParams.get('bill_max');
    if (billMax) newFilters.bill_max = parseFloat(billMax);

    const cuisine = searchParams.getAll('cuisine');
    if (cuisine.length > 0) newFilters.cuisine = cuisine;

    const events = searchParams.getAll('events');
    if (events.length > 0) newFilters.events = events;

    const limit = searchParams.get('limit');
    if (limit) newFilters.limit = parseInt(limit);

    setFilters(newFilters);
  }, [searchParams]);

  const updateURL = useCallback((newFilters: SearchRequest) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    router.push(`/search?${params.toString()}`);
  }, [router]);

  const searchRestaurants = useCallback(async (searchFilters: SearchRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.searchRestaurants({
        ...searchFilters,
        limit: searchFilters.limit || 12
      });
      
      setRestaurants(result.restaurants);
      setTotal(result.total);
    } catch (err) {
      setError('Failed to search restaurants. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Parse URL on mount and when search params change
  useEffect(() => {
    parseFiltersFromURL();
  }, [parseFiltersFromURL]);

  // Search when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0 || searchParams.toString()) {
      searchRestaurants(filters);
    }
  }, [filters, searchRestaurants, searchParams]);

  const handleSearch = (newQuery: string) => {
    const newFilters = { ...filters, q: newQuery };
    setQuery(newQuery);
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleFiltersChange = (newFilters: SearchRequest) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { q: filters.q }; // Keep search query
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back to Home
              </button>
            </div>
            <div className="flex justify-center">
              <SearchBar 
                onSearch={handleSearch} 
                defaultValue={query}
                placeholder="Search restaurants, cuisine, or events..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {query ? `Search Results for "${query}"` : 'All Restaurants'}
            </h1>
            {!loading && (
              <p className="text-gray-600 mt-1">
                {total} restaurant{total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching restaurants...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => searchRestaurants(filters)}
                className="mt-4 btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && (
          <>
            {restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No restaurants found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
