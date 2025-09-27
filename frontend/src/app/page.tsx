'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import RestaurantCard from '@/components/ui/RestaurantCard';
import { Restaurant } from '@/types/restaurant';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([]);
  const [budgetRestaurants, setBudgetRestaurants] = useState<Restaurant[]>([]);
  const [eventRestaurants, setEventRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const [popular, budget, events] = await Promise.all([
        api.getRecommendations({ type: 'popular', limit: 6 }),
        api.getRecommendations({ type: 'budget', limit: 6 }),
        api.getRecommendations({ type: 'events', limit: 6 }),
      ]);

      setPopularRestaurants(popular.restaurants);
      setBudgetRestaurants(budget.restaurants);
      setEventRestaurants(events.restaurants);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickFilters = [
    { label: '≈200 SAR', action: () => router.push('/search?bill_max=250&price_tier=low') },
    { label: 'Family Events', action: () => router.push('/search?events=Family%20Friendly') },
    { label: 'Italian Cuisine', action: () => router.push('/search?cuisine=Italian') },
    { label: 'Live Music', action: () => router.push('/search?events=Live%20Music') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect
              <span className="text-primary-600 block">Dining Experience</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover amazing restaurants in Riyadh with our AI-powered recommendations. 
              Search by cuisine, price, events, and more.
            </p>
            
            <div className="flex justify-center mb-8">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {quickFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={filter.action}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Now */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular Now</h2>
            <button
              onClick={() => router.push('/search?type=popular')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </section>

        {/* Budget Dining */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Budget Dining (~200 SAR)</h2>
            <button
              onClick={() => router.push('/search?type=budget')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </section>

        {/* Live Music Spots */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Live Music & Events</h2>
            <button
              onClick={() => router.push('/search?type=events')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Restaurant Recommendations</h3>
            <p className="text-gray-400 mb-4">
              Discover the best dining experiences in Riyadh
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Restaurant Recommendations. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
