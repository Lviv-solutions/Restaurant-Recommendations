'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import RestaurantCard from '@/components/ui/RestaurantCard';
import { Restaurant } from '@/types/restaurant';
import { api } from '@/lib/api';
import { 
  StarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [similarRestaurants, setSimilarRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restaurantId = params.id as string;

  useEffect(() => {
    if (restaurantId) {
      loadRestaurantDetails();
    }
  }, [restaurantId]);

  const loadRestaurantDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getRestaurant(restaurantId);
      setRestaurant(result.restaurant);
      setSimilarRestaurants(result.similar);
    } catch (err) {
      setError('Failed to load restaurant details. Please try again.');
      console.error('Restaurant detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="h-5 w-5 text-gray-300" />
        );
      }
    }

    return stars;
  };

  const getPriceTierDisplay = (tier: string) => {
    switch (tier) {
      case 'low': return { symbol: '$', label: 'Budget-Friendly' };
      case 'medium': return { symbol: '$$', label: 'Moderate' };
      case 'high': return { symbol: '$$$', label: 'Premium' };
      default: return { symbol: '$$', label: 'Moderate' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading restaurant details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">{error || 'Restaurant not found'}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 btn-primary"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priceTier = getPriceTierDisplay(restaurant.price_tier);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={restaurant.image_url || '/placeholder-restaurant.jpg'}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {restaurant.name}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {renderStars(restaurant.rating)}
                  <span className="ml-2 text-lg font-medium">
                    {restaurant.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-lg font-medium">
                  {priceTier.symbol} {priceTier.label}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {restaurant.description}
                  </p>
                </div>

                {/* Cuisine */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cuisine</h3>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.cuisine.map((cuisine, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Events */}
                {restaurant.events.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Events & Atmosphere</h3>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.events.map((event, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Average bill for 3</p>
                      <p className="font-semibold text-gray-900">
                        ~{Math.round(restaurant.avg_bill_for_3)} SAR
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">Riyadh</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Price Tier</p>
                      <p className="font-semibold text-gray-900">
                        {priceTier.label}
                      </p>
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="mt-6">
                    <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Map View</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Restaurants */}
        {similarRestaurants.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Restaurants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {similarRestaurants.map((similar) => (
                <RestaurantCard key={similar.id} restaurant={similar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
