import React from 'react';
import { Trophy, Medal, Award, X, User, Calendar, Crown, QrCode } from 'lucide-react';
import type { RestaurantGameEntry } from '../services/restaurantGameService';

interface GameLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  gameEntries: RestaurantGameEntry[];
  currentUserScore?: number | null;
}

const GameLeaderboard: React.FC<GameLeaderboardProps> = ({ 
  isOpen, 
  onClose, 
  gameEntries,
  currentUserScore 
}) => {
  if (!isOpen) return null;

  const getRankIcon = (rank: number, isWinner: boolean = false) => {
    if (isWinner) {
      return <Crown className="h-6 w-6 text-yellow-500 animate-pulse" />;
    }
    
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-royal-blue-800 flex items-center justify-center">
            <span className="text-sm font-bold text-royal-blue-100">{rank}</span>
          </div>
        );
    }
  };

  const getRankBg = (rank: number, isWinner: boolean = false) => {
    if (isWinner) {
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 ring-2 ring-yellow-400';
    }
    
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort entries by score (highest first)
  const sortedEntries = [...gameEntries].sort((a, b) => b.score - a.score);
  
  // Find the winner (highest score)
  const winner = sortedEntries[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-300" />
            <h2 className="text-2xl font-bold">Game Results</h2>
          </div>
          <p className="text-royal-blue-100">Final leaderboard for this game</p>
          
          {currentUserScore !== undefined && currentUserScore !== null && (
            <div className="mt-4 p-3 bg-white/20 rounded-xl">
              <p className="text-sm text-royal-blue-100">Your Score</p>
              <p className="text-xl font-bold">{currentUserScore} points</p>
            </div>
          )}
        </div>

        {/* Leaderboard Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEntries.map((entry, index) => {
                const rank = index + 1;
                const isWinner = winner && entry.id === winner.id;
                const isCurrentUser = currentUserScore === entry.score;
                
                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border-2 transition-all ${getRankBg(rank, isWinner)} ${
                      isCurrentUser ? 'ring-2 ring-royal-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getRankIcon(rank, isWinner)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              {entry.profiles?.username || 'Unknown Player'}
                            </span>
                            {isWinner && (
                              <div className="flex items-center space-x-1">
                                <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full font-medium">
                                  WINNER
                                </span>
                                <QrCode className="h-4 w-4 text-yellow-600" title="QR Code Generated" />
                              </div>
                            )}
                            {isCurrentUser && (
                              <span className="px-2 py-1 bg-royal-blue-600 text-white text-xs rounded-full font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(entry.completed_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {entry.score}
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                    
                    {isWinner && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-800 text-center font-medium">
                          🏆 Winner receives QR code for restaurant redemption!
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white py-3 rounded-xl font-semibold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameLeaderboard;