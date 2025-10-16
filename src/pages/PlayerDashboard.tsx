import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import PlayerQRCodes from '../components/PlayerQRCodes';
import AdminTestCredits from '../components/AdminTestCredits';
import ModernGameCard from '../components/ModernGameCard';
import RestaurantGameSession from '../components/RestaurantGameSession';
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
  const { user, updateBalance } = useAuth();
  const [restaurantGames, setRestaurantGames] = useState<RestaurantGame[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [currentGame, setCurrentGame] = useState<RestaurantGame | null>(null);
  const [gameState, setGameState] = useState<'dashboard' | 'playing'>('dashboard');
  const [isJoining, setIsJoining] = useState<string | null>(null);

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

  const handleJoinGame = async (game: RestaurantGame) => {
    if (!user) return;
    
    if (user.balance < game.entry_fee) {
      alert('Insufficient balance. Please add funds to play.');
      return;
    }

    setIsJoining(game.id);
    try {
      await restaurantGameService.joinGame(game.id, user.id);
      
      // Update user balance locally
      updateBalance(user.balance - game.entry_fee);
      
      setCurrentGame(game);
      setGameState('playing');
    } catch (error: any) {
      console.error('Failed to join game:', error);
      alert(error.message || 'Failed to join game. Please try again.');
    } finally {
      setIsJoining(null);
    }
  };

  const handleGameComplete = (results: any) => {
    console.log('Restaurant game completed:', results);
    // Results are handled within the game session component
  };

  const handleLeaveGame = () => {
    setCurrentGame(null);
    setGameState('dashboard');
    loadRestaurantGames(); // Refresh games list
  };

  // Render game session
  if (gameState === 'playing' && currentGame) {
    return (
      <RestaurantGameSession
        game={currentGame}
        onGameComplete={handleGameComplete}
        onLeaveGame={handleLeaveGame}
      />
    );
  }
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
                  You need funds to join games.{' '}
                  <Link to="/deposit" className="font-semibold hover:underline ml-1 text-primary-600">
                    <span>Add Funds</span>
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
                <p className="text-gray-600 mb-4">Check back later for new local business games!</p>
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
                  <ModernGameCard
                    key={game.id}
                    game={game}
                    onJoin={() => handleJoinGame(game)}
                    userBalance={user?.balance || 0}
                    user={user}
                    className={isJoining === game.id ? 'opacity-75 pointer-events-none' : ''}
                  />
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
                  <span>View All Business Games</span>
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
            <span>How does it work?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Join Business Games</h3>
              <p>Browse games created by local businesses. Any score qualifies - highest score wins the prize!</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Play & Compete</h3>
              <p>Each attempt costs the entry fee. Keep playing until the game fills up - highest score wins!</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Win Real Prizes</h3>
              <p>Winners receive QR codes that can be redeemed at the business for real food and prizes!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;