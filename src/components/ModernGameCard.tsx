import React from 'react';
import { Play, Target, Users, Clock, DollarSign } from 'lucide-react';

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
  cardIndex?: number;
}

const ModernGameCard: React.FC<ModernGameCardProps> = ({
  game,
  onJoin,
  onView,
  className = '',
  userBalance = 0,
  user,
  cardIndex = 0
}) => {
  const canAfford = userBalance >= game.entry_fee;
  const isActive = game.status === 'active';
  const needsAccount = !user;
  const needsFunds = user && !canAfford;
  const canPlay = user && canAfford && isActive;

  const playerPercentage = game.max_players
    ? Math.min(100, ((game.current_players || 0) / game.max_players) * 100)
    : 0;

  const handleButtonClick = () => {
    if (needsAccount) {
      window.location.href = '/register';
    } else if (needsFunds) {
      window.location.href = '/register';
    } else if (canPlay && onJoin) {
      onJoin();
    } else if (onJoin) {
      onJoin();
    }
  };

  const getButtonText = () => {
    if (needsAccount) return 'Create Account';
    if (needsFunds) return 'Add Funds';
    if (canPlay) return 'Join Game';
    if (!isActive) return 'Completed';
    return 'Join Now';
  };

  const getButtonStyle = () => {
    if (needsAccount || canPlay) {
      return 'food-button animate-pulse-fast';
    }
    if (needsFunds) {
      return 'gaming-button-orange animate-pulse-fast';
    }
    if (!isActive) {
      return 'bg-dark-700 text-dark-300 cursor-not-allowed';
    }
    return 'food-button';
  };

  return (
    <div className={`group relative gaming-card overflow-hidden hover:border-neon-green-500/50 transition-all duration-200 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green-500/5 via-transparent to-vivid-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-5xl transform group-hover:scale-110 transition-transform duration-200">
              {game.emoji || '🎮'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-neon-green-400 transition-colors mb-1">
                {game.name}
              </h3>
              {game.business && (
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-dark-800 border border-dark-400 text-dark-200 text-xs font-semibold rounded-full">
                    {game.business.username}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isActive && (
            <div className="flex items-center space-x-1 bg-neon-green-500/20 border border-neon-green-500/30 px-3 py-1 rounded-full animate-pulse-fast">
              <div className="w-2 h-2 bg-neon-green-500 rounded-full animate-ping"></div>
              <span className="text-xs font-bold text-neon-green-400 tracking-wide">LIVE</span>
            </div>
          )}
        </div>

        <p className="text-dark-200 text-sm mb-6 leading-relaxed line-clamp-2">
          {game.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="gaming-stat-card">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-neon-green-400" />
              <span className="text-xs font-medium text-dark-200 uppercase tracking-wide">Entry</span>
            </div>
            <div className="text-2xl font-black text-neon-green-400">${game.entry_fee}</div>
          </div>

          <div className="gaming-stat-card">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="h-4 w-4 text-vivid-orange-400" />
              <span className="text-xs font-medium text-dark-200 uppercase tracking-wide">Min Score</span>
            </div>
            <div className="text-2xl font-black text-vivid-orange-400">{game.min_score}</div>
          </div>
        </div>

        {game.max_players && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-dark-200" />
                <span className="text-xs font-medium text-dark-200 uppercase tracking-wide">Players</span>
              </div>
              <span className="text-sm font-bold text-white">
                {game.current_players || 0}/{game.max_players}
              </span>
            </div>
            <div className="gaming-progress-bar">
              <div
                className="gaming-progress-fill"
                style={{ width: `${playerPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          onClick={handleButtonClick}
          disabled={!isActive && !needsAccount && !needsFunds}
          className={`w-full px-6 py-4 rounded-lg font-bold text-base uppercase tracking-wide transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed ${getButtonStyle()}`}
        >
          {getButtonText()}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-green-500 via-vivid-orange-500 to-neon-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-b-xl"></div>
    </div>
  );
};

export default ModernGameCard;
