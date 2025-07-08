import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { restaurantGameService, type RestaurantGame } from '../services/restaurantGameService';
import { 
  DollarSign, 
  Trophy, 
  TrendingUp, 
  ArrowRight,
  Play,
  AlertCircle,
  Users,
  Crown,
  Target,
  Plus,
  Star
} from 'lucide-react';

const PlayerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [restaurantGames, setRestaurantGames] = useState<RestaurantGame[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  useEffect(() => {
    loadRestaurantGames();
  }, []);

  const loadRestaurantGames = async () => {
    try {
      const games = await restaurantGameService.getActiveGames();
      setRestaurantGames(games.slice(0, 3)); // Show top 3 games
    } catch (error) {
      console.error('Failed to load restaurant games:', error);
    } finally {
      setIsLoadingGames(false);
    }
  };

  return (
    <div className="min-h-screen bg-steel-blue-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-steel-blue-400 mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-steel-blue-300">Ready to play games and win amazing prizes?</p>
        </div>

        {/* Balance Warning */}
        {user && user.balance < 1 && (
          <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-orange-300">Insufficient Balance</p>
                <p className="text-xs text-orange-200">
                  You need at least $1 to join games. 
                  <Link to="/deposit" className="font-semibold hover:underline ml-1">
                    Add funds now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Balance Card with Add Funds Button */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 max-w-md">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-steel-blue-300">Current Balance</p>
                <p className="text-2xl font-bold text-green-400">${user?.balance.toFixed(2)}</p>
                <p className="text-xs text-steel-blue-400 mt-1">
                  {user ? Math.floor(user.balance) : 0} game entries available
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <Link
                  to="/deposit"
                  className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white px-4 py-2 rounded-2xl font-bold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-xl hover:shadow-2xl border border-royal-blue-400/30"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Funds</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Games Right Now */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-orange-600 flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-orange-400" />
                <span>Games Right Now</span>
              </h2>
              <Link
                to="/restaurant-games"
                className="text-royal-blue-300 hover:text-royal-blue-200 font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {isLoadingGames ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : restaurantGames.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-orange-600 mb-2">No Active Games</h3>
                <p className="text-orange-800 mb-4">Check back later for new restaurant games!</p>
                <Link
                  to="/free-play"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-green-400/30"
                >
                  <Play className="h-4 w-4" />
                  <span>Try Free Play</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurantGames.map((game) => (
                  <div key={game.id} className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl overflow-hidden shadow-lg">
                    {/* Game Header */}
                    <div className="p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl">🏆</div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
                          Restaurant Game
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                      <p className="text-orange-100 text-sm mb-4">{game.description}</p>
                      {game.restaurant && (
                        <p className="text-orange-200 text-xs mb-4">
                          by {game.restaurant.username}
                        </p>
                      )}
                      
                      {/* Game Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <DollarSign className="h-4 w-4 text-yellow-300" />
                            <span className="text-xs text-orange-100">Prize Pool</span>
                          </div>
                          <p className="text-lg font-bold text-yellow-300">${game.prize_pool.toFixed(2)}</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <Users className="h-4 w-4 text-orange-100" />
                            <span className="text-xs text-orange-100">Entries</span>
                          </div>
                          <p className="text-lg font-bold">{game.current_players}/{game.max_players}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-orange-100">Progress</span>
                          <span className="text-sm font-medium">
                            {Math.round((game.current_players / game.max_players) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all"
                            style={{ width: `${(game.current_players / game.max_players) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Game Details */}
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-orange-100">Entry Fee:</span>
                          <span className="font-medium">${game.entry_fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-100">Min Score:</span>
                          <span className="font-medium">{game.min_score}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        to="/restaurant-games"
                        className="w-full bg-white text-orange-600 py-2 rounded-2xl font-bold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border border-orange-200"
                      >
                        <Play className="h-4 w-4" />
                        <span>Join Game</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Games Button */}
            {restaurantGames.length > 0 && (
              <div className="mt-6 text-center">
                <Link
                  to="/restaurant-games"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-orange-400/30"
                >
                  <Trophy className="h-5 w-5" />
                  <span>View All Restaurant Games</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* How Restaurant Games Work */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-steel-blue-500">
            <TrendingUp className="h-5 w-5 text-steel-blue-400" />
            <span>How Restaurant Games Work</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-steel-blue-300">
            <div>
              <h3 className="font-semibold text-steel-blue-300 mb-2">1. Join Restaurant Games</h3>
              <p>Browse games created by local restaurants. You can play each game multiple times to improve your score!</p>
            </div>
            <div>
              <h3 className="font-semibold text-steel-blue-300 mb-2">2. Play & Compete</h3>
              <p>Each attempt costs the entry fee. Keep playing until the game fills up - highest score wins!</p>
            </div>
            <div>
              <h3 className="font-semibold text-steel-blue-300 mb-2">3. Win Real Prizes</h3>
              <p>Winners receive QR codes that can be redeemed at the restaurant for real food and prizes!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;