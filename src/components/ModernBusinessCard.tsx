import React, { useState, useEffect } from 'react';
import { getBusinessEmoji, getRandomAnimationClass } from '../utils/emojiSystem';
import { Star, MapPin, Clock, Phone, Globe, ArrowRight } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  rating?: number;
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
  priceRange?: string;
}

interface ModernBusinessCardProps {
  business: Business;
  onClick?: () => void;
  className?: string;
}

const ModernBusinessCard: React.FC<ModernBusinessCardProps> = ({ 
  business, 
  onClick,
  className = '' 
}) => {
  const [emoji, setEmoji] = useState<string>('🌮');
  const [animationClass, setAnimationClass] = useState<string>('');

  useEffect(() => {
    // Set emoji based on business category with rotation on mount
    setEmoji(getBusinessEmoji(business.category));
    setAnimationClass(getRandomAnimationClass());
  }, [business.category, business.id]);

  const handleRefreshEmoji = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEmoji(getBusinessEmoji(business.category));
    setAnimationClass(getRandomAnimationClass());
  };

  return (
    <div 
      className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-success-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header with emoji and category */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshEmoji}
              className={`text-4xl hover:scale-110 transition-transform duration-200 ${animationClass}`}
              title="Click to change emoji"
            >
              {emoji}
            </button>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                {business.name}
              </h3>
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {business.category}
              </span>
            </div>
          </div>
          
          {business.rating && (
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold text-yellow-700">{business.rating}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {business.description}
        </p>

        {/* Business details */}
        <div className="space-y-2 mb-4">
          {business.address && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{business.address}</span>
            </div>
          )}
          
          {business.hours && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{business.hours}</span>
            </div>
          )}
          
          {business.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Phone className="h-4 w-4" />
              <span>{business.phone}</span>
            </div>
          )}
        </div>

        {/* Action area */}
        <div className="flex items-center justify-between">
          {business.priceRange && (
            <span className="text-sm font-medium text-success-600">
              {business.priceRange}
            </span>
          )}
          
          <div className="flex items-center space-x-2 text-primary-600 group-hover:text-primary-700 transition-colors">
            <span className="text-sm font-medium">View Details</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hover effect indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-success-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
      </div>
    </div>
  );
};

export default ModernBusinessCard;