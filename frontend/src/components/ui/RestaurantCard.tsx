'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/types/restaurant';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface RestaurantCardProps {
  restaurant: Restaurant;
  showDistance?: boolean;
}

export default function RestaurantCard({ restaurant, showDistance = false }: RestaurantCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }

    return stars;
  };

  const getPriceTierDisplay = (tier: string) => {
    switch (tier) {
      case 'low': return '$';
      case 'medium': return '$$';
      case 'high': return '$$$';
      default: return '$$';
    }
  };

  const getPriceTierColor = (tier: string) => {
    switch (tier) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        {/* Image */}
        <div className="relative h-48 w-full">
          <Image
            src={restaurant.image_url || '/placeholder-restaurant.jpg'}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceTierColor(restaurant.price_tier)}`}>
              {getPriceTierDisplay(restaurant.price_tier)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center ml-2">
              <div className="flex items-center">
                {renderStars(restaurant.rating)}
              </div>
              <span className="ml-1 text-sm text-gray-600">
                {restaurant.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Cuisine */}
          <div className="flex flex-wrap gap-1 mb-2">
            {restaurant.cuisine.slice(0, 3).map((cuisine, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {cuisine}
              </span>
            ))}
            {restaurant.cuisine.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{restaurant.cuisine.length - 3}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {restaurant.description}
          </p>

          {/* Events */}
          {restaurant.events.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {restaurant.events.slice(0, 2).map((event, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                >
                  {event}
                </span>
              ))}
              {restaurant.events.length > 2 && (
                <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                  +{restaurant.events.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>Riyadh</span>
            </div>
            <div className="font-medium text-gray-900">
              ~{Math.round(restaurant.avg_bill_for_3)} SAR for 3
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
