'use client';

import { useState } from 'react';
import { SearchRequest } from '@/types/restaurant';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterPanelProps {
  filters: SearchRequest;
  onFiltersChange: (filters: SearchRequest) => void;
  onClearFilters: () => void;
}

const CUISINE_OPTIONS = [
  'Italian', 'Chinese', 'Japanese', 'Middle Eastern', 'American', 
  'Lebanese', 'Indian', 'Mexican', 'Thai', 'French', 'Mediterranean'
];

const EVENT_OPTIONS = [
  'Live Music', 'Family Friendly', 'Date Night', 'Business Dining',
  'Sports Viewing', 'Birthday Celebrations', 'Cultural Events'
];

export default function FilterPanel({ filters, onFiltersChange, onClearFilters }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePriceTierChange = (tier: string) => {
    onFiltersChange({
      ...filters,
      price_tier: filters.price_tier === tier ? undefined : tier
    });
  };

  const handleCuisineChange = (cuisine: string) => {
    const currentCuisines = filters.cuisine || [];
    const newCuisines = currentCuisines.includes(cuisine)
      ? currentCuisines.filter(c => c !== cuisine)
      : [...currentCuisines, cuisine];
    
    onFiltersChange({
      ...filters,
      cuisine: newCuisines.length > 0 ? newCuisines : undefined
    });
  };

  const handleEventChange = (event: string) => {
    const currentEvents = filters.events || [];
    const newEvents = currentEvents.includes(event)
      ? currentEvents.filter(e => e !== event)
      : [...currentEvents, event];
    
    onFiltersChange({
      ...filters,
      events: newEvents.length > 0 ? newEvents : undefined
    });
  };

  const handleBillRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    onFiltersChange({
      ...filters,
      [type === 'min' ? 'bill_min' : 'bill_max']: numValue
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Clear all</span>
            </button>
          )}
        </div>

        {isOpen && (
          <div className="pb-6 space-y-6">
            {/* Price Tier */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="flex space-x-3">
                {['low', 'medium', 'high'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handlePriceTierChange(tier)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.price_tier === tier
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tier === 'low' ? '$ Budget' : tier === 'medium' ? '$$ Moderate' : '$$$ Premium'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Bill for 3 People (SAR)</h3>
              <div className="flex space-x-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.bill_min || ''}
                  onChange={(e) => handleBillRangeChange('min', e.target.value)}
                  className="input-field w-24"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.bill_max || ''}
                  onChange={(e) => handleBillRangeChange('max', e.target.value)}
                  className="input-field w-24"
                />
              </div>
            </div>

            {/* Cuisine */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Cuisine</h3>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => handleCuisineChange(cuisine)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.cuisine?.includes(cuisine)
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Events */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Events & Atmosphere</h3>
              <div className="flex flex-wrap gap-2">
                {EVENT_OPTIONS.map((event) => (
                  <button
                    key={event}
                    onClick={() => handleEventChange(event)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.events?.includes(event)
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
