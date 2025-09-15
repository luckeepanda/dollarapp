import React, { useState, useEffect } from 'react';
import { getRandomEmojiFromCategory, getRandomAnimationClass } from '../utils/emojiSystem';
import { Trophy, Users, DollarSign, Star, Play, Clock, Target } from 'lucide-react';

interface Game {
  id: string;
  name: string;
  description: string;
  entry_fee: number;
  min_score: number;
  prize_pool?: number;
  current_players?: number;
  max_players?: number;
  status?: string;
  restaurant?: {
    username: string;
  };
}

interface ModernGameCardProps {
  game: Game;
  onJoin?: () => void;
  onView?: () => void;
  className?: string;
  userBalance?: number;
}

const ModernGameCard: React.FC<ModernGameCardProps> = ({ 
  game, 
  onJoin,
  onView,
  className = '',
  userBalance = 0
}) => {
  const [emoji, setEmoji] = useState<string>('🍔');
  const [animationClass, setAnimationClass] = useState<string>('');

  useEffect(() => {
    // Rotate emoji on component mount and periodically
    const updateEmoji = () => {
      setEmoji(getRandomEmojiFromCategory('food'));
      setAnimationClass(getRandomAnimationClass());
    };
    
    updateEmoji();
    
    // Rotate emoji every 5 seconds for dynamic feel
    const interval = setInterval(updateEmoji, 5000);
    return () => clearInterval(interval);
  }, [game.id]);

  const canAfford = userBalance >= game.entry_fee;
  const isActive = game.status === 'active';

  return (
    <div className={`group relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-primary-200 transition-all duration-500 transform hover:scale-[1.02] overflow-hidden ${className}`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-success-500/5 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      
      {/* Content */}
      <div className="relative p-8">
        {/* Header with dynamic emoji and entry fee */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`text-6xl ${animationClass} hover:scale-110 transition-transform duration-300 cursor-pointer`}>
              {emoji}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-1">
                {game.name}
              </h3>
              {game.restaurant && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">by</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-primary-100 to-success-100 text-primary-700 text-sm font-semibold rounded-full">
                    🍽️ {game.restaurant.username}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Entry fee badge */}
          <div className="bg-gradient-to-r from-success-500 to-success-600 text-white px-6 py-3 rounded-2xl shadow-lg border-2 border-white/30 transform group-hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="text-3xl font-black drop-shadow-lg">${game.entry_fee.toFixed(0)}</div>
              <div className="text-xs font-medium opacity-90">ENTRY</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
          {game.description}
        </p>

        {/* Game stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-2xl border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Min Score</span>
            </div>
            <div className="text-2xl font-bold text-yellow-800">{game.min_score}</div>
            <div className="text-xs text-yellow-600">points to qualify</div>
          </div>
          
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-2xl border border-primary-200">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Prize Pool</span>
            </div>
            <div className="text-2xl font-bold text-primary-800">
              ${(game.prize_pool || game.entry_fee).toFixed(2)}
            </div>
            <div className="text-xs text-primary-600">winner takes all</div>
          </div>
        </div>

        {/* Game type and status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Single Player Challenge</span>
          </div>
          
          {isActive && (
            <div className="flex items-center space-x-1 bg-success-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-ping"></div>
              <span className="text-xs font-semibold text-success-700">LIVE</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {onJoin && (
            <button
              onClick={onJoin}
              disabled={!canAfford || !isActive}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl ${
                canAfford && isActive
                  ? 'bg-gradient-to-r from-primary-600 to-success-600 text-white hover:from-primary-700 hover:to-success-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Play className="h-5 w-5" />
              <span>
                {!isActive ? 'Game Completed' : 
                 !canAfford ? 'Insufficient Balance' : 
                 `Join Game - $${game.entry_fee.toFixed(2)}`}
              </span>
            </button>
          )}
          
          {onView && (
            <button
              onClick={onView}
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>View Details</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Balance warning */}
        {!canAfford && onJoin && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                Need ${(game.entry_fee - userBalance).toFixed(2)} more to play
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Corner accent */}
      <div className="absolute top-3 right-3 w-6 h-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-success-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="absolute inset-1 bg-gradient-to-br from-primary-500 to-success-500 rounded-full opacity-30 group-hover:opacity-60 transition-opacity"></div>
      </div>
    </div>
  );
};

export default ModernBusinessCard;