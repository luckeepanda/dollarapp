import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import PlayerQRCodes from '../components/PlayerQRCodes';
import AdminTestCredits from '../components/AdminTestCredits';
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
  Star,
  QrCode
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
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600">Ready to play games and win amazing prizes?</p>
        </div>

        {/* Balance Warning */}
        {user && user.balance < 1 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Insufficient Balance</p>
                <p className="text-xs text-red-700">
                  You need at least $1 to join games. 
                  <Link to="/deposit" className="font-semibold hover:underline ml-1 text-primary-600">
                    Add funds now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Balance Card with Add Funds Button */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 max-w-md">
          <div className="food-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-success-600">${user?.balance.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {user ? Math.floor(user.balance) : 0} game entries available
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-success-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-success-600" />
                </div>
                <Link
                  to="/deposit"
                  className="food-button px-4 py-2 rounded-lg font-bold flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Funds</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Player QR Codes Section */}
          <div className="food-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-accent-600 flex items-center space-x-2 font-display">
                <QrCode className="h-6 w-6 text-accent-600" />
                <span>Your Prize QR Codes</span>
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="text-primary-600 hover:text-primary-700 text-sm underline"
              >
                Refresh QR Codes
              </button>
            </div>
            <PlayerQRCodes />
          </div>

          {/* Games Right Now */}
          <div className="food-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary-600 flex items-center space-x-2 font-display">
                <Trophy className="h-6 w-6 text-primary-600" />
                <span>Games Right Now</span>
              </h2>
              <Link
                to="/restaurant-games"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {isLoadingGames ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : restaurantGames.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary-600 mb-2 font-display">No Active Games</h3>
                <p className="text-gray-600 mb-4">Check back later for new restaurant games!</p>
                <Link
                  to="/free-play"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-success-600 to-success-700 text-white px-4 py-2 rounded-lg font-bold hover:from-success-700 hover:to-success-800 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <Play className="h-4 w-4" />
                  <span>Try Free Play</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurantGames.map((game) => (
                  <div key={game.id} className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg overflow-hidden shadow-lg">
                    {/* Game Header */}
                    <div className="p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl">🏆</div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
                          Restaurant Game
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                      <p className="text-primary-100 text-sm mb-4">{game.description}</p>
                      {game.restaurant && (
                        <div className="mb-4">
                          <p className="text-white text-lg font-bold bg-white/30 px-4 py-2 rounded-full text-center border-2 border-white/40">
                            🍽️ {game.restaurant.username}
                          </p>
                        </div>
                        
                      )}
                      
                      {/* Game Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <DollarSign className="h-4 w-4 text-accent-300" />
                            <span className="text-xs text-primary-100">Prize Pool</span>
                          </div>
                          <p className="text-lg font-bold text-accent-300">${game.prize_pool.toFixed(2)}</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <Users className="h-4 w-4 text-primary-100" />
                            <span className="text-xs text-primary-100">Entries</span>
                          </div>
                          <p className="text-lg font-bold">{game.current_players}/{game.max_players}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-primary-100">Progress</span>
                          <span className="text-sm font-medium">
                            {Math.round((game.current_players / game.max_players) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-accent-400 to-accent-500 h-2 rounded-full transition-all"
                            style={{ width: `${(game.current_players / game.max_players) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Game Details */}
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-primary-100">Entry Fee:</span>
                          <span className="font-medium">${game.entry_fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-100">Min Score:</span>
                          <span className="font-medium">{game.min_score}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        to="/restaurant-games"
                        className="w-full bg-white text-primary-600 py-2 rounded-lg font-bold hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md border border-primary-200"
                      >
                    <div className="flex justify-between">
                      <span className="text-primary-100">Qualification:</span>
                      <span className="font-medium text-green-300">Any Score</span>
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
                  className="inline-flex items-center space-x-2 food-button px-6 py-3 rounded-lg font-bold"
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
        <div className="mt-8 food-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-gray-900 font-display">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <span>How Restaurant Games Work</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Join Restaurant Games</h3>
              <p>Browse games created by local restaurants. Any score qualifies - highest score wins the prize!</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Play & Compete</h3>
              <p>Each attempt costs the entry fee. Keep playing until the game fills up - highest score wins!</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Win Real Prizes</h3>
              <p>Winners receive QR codes that can be redeemed at the restaurant for real food and prizes!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;