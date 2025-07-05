import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { restaurantGameService, type RestaurantGame, type RestaurantGameEntry } from '../services/restaurantGameService';
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  QrCode,
  Star,
  Crown,
  Calendar
} from 'lucide-react';

const RestaurantGameDetails: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const [game, setGame] = useState<RestaurantGame | null>(null);
  const [entries, setEntries] = useState<RestaurantGameEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (gameId) {
      loadGameDetails();
    }
  }, [gameId]);

  const loadGameDetails = async () => {
    if (!gameId) return;
    
    try {
      const [gameData, entriesData] = await Promise.all([
        restaurantGameService.getGame(gameId),
        restaurantGameService.getGameEntries(gameId)
      ]);
      
      setGame(gameData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Failed to load game details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Star className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-royal-blue-800 flex items-center justify-center">
            <span className="text-xs font-bold text-royal-blue-100">{rank}</span>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-steel-blue-900">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-steel-blue-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Game Not Found</h2>
            <Link
              to="/restaurant/games"
              className="text-royal-blue-300 hover:text-royal-blue-200"
            >
              Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-steel-blue-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link 
            to="/restaurant/games"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{game.name}</h1>
            <p className="text-royal-blue-200">{game.description}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Game Status</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                  {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-royal-blue-200">Entry Fee:</span>
                  <span className="text-white font-semibold">${game.entry_fee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-royal-blue-200">Prize Pool:</span>
                  <span className="text-green-400 font-semibold">${game.prize_pool.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-royal-blue-200">Players:</span>
                  <span className="text-white font-semibold">{game.current_players}/{game.max_players} entries</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-royal-blue-200">Min Score:</span>
                  <span className="text-white font-semibold">{game.min_score}</span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-royal-blue-200">Progress</span>
                    <span className="text-sm font-medium text-white">
                      {Math.round((game.current_players / game.max_players) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${(game.current_players / game.max_players) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-royal-blue-200">Created:</span>
                  <span className="text-white text-sm">{formatDate(game.created_at)}</span>
                </div>

                {game.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-royal-blue-200">Completed:</span>
                    <span className="text-white text-sm">{formatDate(game.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Section */}
            {game.status === 'completed' && game.qr_code && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>Winner QR Code</span>
                </h3>
                
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block mb-4">
                      <div className="text-2xl font-mono text-black">{game.qr_code}</div>
                    </div>
                    <p className="text-sm text-royal-blue-200 mb-2">
                      Winner can present this code for redemption
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      {game.qr_redeemed ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">Redeemed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm font-medium">Pending Redemption</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Leaderboard</span>
              </h2>

              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-royal-blue-200">No entries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry, index) => {
                    const rank = index + 1;
                    const isWinner = game.winner_id === entry.user_id;
                    
                    return (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isWinner 
                            ? 'bg-gradient-to-r from-yellow-50/10 to-yellow-100/10 border-yellow-300/30' 
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getRankIcon(rank)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-white">
                                  {entry.profiles?.username || 'Unknown Player'}
                                </span>
                                {isWinner && (
                                  <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full font-medium">
                                    WINNER
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-royal-blue-300">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(entry.completed_at)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {entry.score}
                            </div>
                            <div className="text-sm text-royal-blue-300">points</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantGameDetails;