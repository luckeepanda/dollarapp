import React from 'react';
import { Play, Target, Users } from 'lucide-react';

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
  emoji?: string;
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
  user?: any;
}

const ModernGameCard: React.FC<ModernGameCardProps> = ({ 
  game, 
  onJoin,
  onView,
  className = '',
  userBalance = 0,
  user
}) => {
  const canAfford = userBalance >= game.entry_fee;
  const isActive = game.status === 'active';
  const needsAccount = !user;
  const needsFunds = user && !canAfford;

  const handleButtonClick = () => {
    if (needsAccount) {
      // Redirect to create account
      window.location.href = '/register';
    } else if (needsFunds) {
      // Redirect to create account (for funding)
      window.location.href = '/register';
    } else if (onJoin) {
      onJoin();
    }
  };

  const getButtonText = () => {
    if (needsAccount) return 'Create Account';
    if (needsFunds) return 'Need $1 more to play';
    if (!isActive) return 'Game Completed';
    return '$1 Entry';
  };

  const getButtonStyle = () => {
    if (needsAccount) {
      return 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800';
    }
    if (needsFunds) {
      return 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-pointer';
    }
    if (!isActive) {
      return 'bg-gray-400 text-gray-600 cursor-not-allowed';
    }
    return 'bg-gradient-to-r from-success-600 to-success-700 text-white hover:from-success-700 hover:to-success-800';
  };

  return (
    <div className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 transform hover:scale-[1.02] overflow-hidden ${className}`}>
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-success-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header with static emoji and entry button */}
        <div className="flex items-start justify-between mb-6">
          {/* Left side - Static emoji */}
          <div className="flex items-center space-x-4">
            <div className="text-5xl">
              {game.emoji || '🍔'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-1">
                {game.name}
              </h3>
              {game.business && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">by</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-primary-100 to-success-100 text-primary-700 text-sm font-semibold rounded-full">
                    🍽️ {game.business.username}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Entry button */}
          <button
            onClick={handleButtonClick}
            disabled={!isActive && !needsAccount && !needsFunds}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl ${getButtonStyle()}`}
          >
            {getButtonText()}
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-base mb-6 leading-relaxed">
          {game.description}
        </p>

        {/* Bottom section with Min Score and promotional text */}
        <div className="flex items-center justify-between">
          {/* Left-aligned Min Score */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Minimum Score</span>
            </div>
            <div className="text-2xl font-bold text-yellow-800">{game.min_score}</div>
            <div className="text-xs text-yellow-600">points to qualify</div>
          </div>
          
          {/* Right side - Create Account button for promotional text */}
          {(needsAccount || needsFunds) && (
            <button
              onClick={handleButtonClick}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-sm"
            >
              Create Account
            </button>
          )}
        </div>
        
        {/* Expanded promotional text */}
        <div className="mt-4 text-center">
          <div className="bg-gradient-to-r from-success-50 via-primary-50 to-success-50 p-4 rounded-xl border border-success-200">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-success-600 via-primary-600 to-success-600 bg-clip-text text-transparent leading-tight">
              $1 to win ${game.prize_pool?.toFixed(0) || '12'} meal
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Play once, qualify with any score, win real food prizes!
            </p>
          </div>
        </div>

        {/* Status indicator for active games */}
        {isActive && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-xs font-semibold text-green-700">LIVE</span>
            </div>
          </div>
        )}
      </div>

      {/* Hover effect indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-success-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
    </div>
  );
};

export default ModernGameCard;