import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import RestaurantGameSession from '../components/RestaurantGameSession';
import { useAuth } from '../contexts/AuthContext';
import { restaurantGameService, type RestaurantGame } from '../services/restaurantGameService';
import { 
  Trophy, 
  Users, 
  DollarSign, 
  Clock,
  Play,
  Star,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const RestaurantGames: React.FC = () => {
  const { user, updateBalance } = useAuth();
  const [games, setGames] = useState<RestaurantGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState<RestaurantGame | null>(null);
  const [gameState, setGameState] = useState<'browse' | 'playing'>('browse');
  const [isJoining, setIsJoining] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const gamesData = await restaurantGameService.getActiveGames();
      setGames(gamesData);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setIsLoading(false);
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
    setGameState('browse');
    loadGames(); // Refresh games list
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
    <div className="min-h-screen bg-steel-blue-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/player/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Restaurant Games</h1>
              <p className="text-royal-blue-200">Join games created by restaurants and win prizes!</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20">
            <div className="text-center">
              <p className="text-sm text-royal-blue-200">Your Balance</p>
              <p className="text-xl font-bold text-green-400">${user?.balance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Balance Warning */}
        {user && user.balance < 1 && (
          <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-orange-300">Insufficient Balance</p>
                <p className="text-xs text-orange-400">
                  You need funds to join games. 
                  <Link to="/deposit" className="font-semibold hover:underline ml-1">
                    Add funds now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Games</h3>
            <p className="text-royal-blue-200 mb-6">Check back later for new restaurant games!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div 
                key={game.id} 
                className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Game Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">🏆</div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
                      Restaurant Game
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                  <p className="text-orange-100 text-sm">{game.description}</p>
                  {game.restaurant && (
                    <p className="text-orange-200 text-xs mt-2">
                      by {game.restaurant.username}
                    </p>
                  )}
                </div>

                {/* Game Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-royal-blue-200">Prize Pool</span>
                      </div>
                      <p className="text-lg font-bold text-green-400">${game.prize_pool.toFixed(2)}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Users className="h-4 w-4 text-royal-blue-300" />
                        <span className="text-xs text-royal-blue-200">Players</span>
                      </div>
                      <p className="text-lg font-bold text-royal-blue-300">{game.current_players}/{game.max_players} entries</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-royal-blue-200">Entries</span>
                      <span className="text-sm font-medium text-white">
                        {Math.round((game.current_players / game.max_players) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${(game.current_players / game.max_players) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Game Details */}
                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-royal-blue-200">Entry Fee:</span>
                      <span className="text-white font-medium">${game.entry_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-royal-blue-200">Min Score:</span>
                      <span className="text-white font-medium">{game.min_score}</span>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={() => handleJoinGame(game)}
                    disabled={isJoining === game.id || (user && user.balance < game.entry_fee) || game.current_players >= game.max_players}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-2xl font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border border-orange-400/30"
                  >
                    {isJoining === game.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Joining...</span>
                      </>
                    ) : game.current_players >= game.max_players ? (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>Game Full</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Join Game - ${game.entry_fee.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-white">
            <Star className="h-5 w-5 text-orange-400" />
            <span>How Restaurant Games Work</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-royal-blue-200">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Join & Play</h3>
              <p>Pay the entry fee to join a restaurant's game. You can play multiple times to improve your score!</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">2. Compete for Victory</h3>
              <p>After the maximum number of entries is reached, the highest scorer wins the entire prize pool.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">3. Redeem Your Prize</h3>
              <p>Winners receive a unique QR code that can only be redeemed at the restaurant that created the game.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantGames;