import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RestaurantGameSession from '../components/RestaurantGameSession';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
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
  const navigate = useNavigate();
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
      console.log('Loading restaurant games...');
      const gamesData = await restaurantGameService.getActiveGames();
      console.log('Loaded games:', gamesData.length);
      setGames(gamesData);
    } catch (error) {
      console.error('Failed to load games:', error);
      // For unauthenticated users, try to load games without auth
      if (!user) {
        try {
          console.log('Retrying games load for unauthenticated user...');
          const { data, error } = await supabase
            .from('restaurant_games')
            .select(`
              *,
              restaurant:profiles!restaurant_games_restaurant_id_fkey(username)
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Direct query error:', error);
          } else {
            console.log('Direct query success:', data?.length || 0);
            setGames(data || []);
          }
        } catch (directError) {
          console.error('Direct query failed:', directError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (game: RestaurantGame) => {
    // If user is not logged in, redirect to registration
    if (!user) {
      navigate('/register');
      return;
    }
    
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
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/player/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">Restaurant Games</h1>
              <p className="text-gray-600">Join games created by restaurants and win prizes!</p>
            </div>
          </div>
          
          <div className="food-card p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Your Balance</p>
              <p className="text-xl font-bold text-success-600">${user?.balance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Balance Warning */}
        {user && user.balance < 1 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Insufficient Balance</p>
                <p className="text-xs text-red-700">
                  You need funds to join games. 
                  <Link to="/deposit" className="font-semibold hover:underline ml-1 text-primary-600">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-600 mb-2 font-display">No Active Games</h3>
            <p className="text-gray-600 mb-6">Check back later for new restaurant games!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div 
                key={game.id} 
                className="food-card rounded-lg overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Game Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">🏆</div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
                      Restaurant Game
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                  <p className="text-primary-100 text-sm">{game.description}</p>
                  {game.restaurant && (
                    <p className="text-primary-200 text-xs mt-2">
                      by <span className="text-primary-100">{game.restaurant.username}</span>
                    </p>
                  )}
                </div>

                {/* Game Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <DollarSign className="h-4 w-4 text-success-600" />
                        <span className="text-xs text-gray-600">Prize Pool</span>
                      </div>
                      <p className="text-lg font-bold text-success-600">${game.prize_pool.toFixed(2)}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Users className="h-4 w-4 text-primary-600" />
                        <span className="text-xs text-gray-600">Players</span>
                      </div>
                      <p className="text-lg font-bold text-primary-600">{game.current_players}/{game.max_players} entries</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Entries</span>
                      <span className="text-sm font-medium text-primary-600">
                        {Math.round((game.current_players / game.max_players) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${(game.current_players / game.max_players) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Game Details */}
                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entry Fee:</span>
                      <span className="text-primary-600 font-medium">${game.entry_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Score:</span>
                      <span className="text-primary-600 font-medium">{game.min_score}</span>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={() => handleJoinGame(game)}
                    disabled={isJoining === game.id || (user && user.balance < game.entry_fee) || game.current_players >= game.max_players}
                    className="w-full food-button py-3 rounded-lg font-bold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:transform-none"
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
                    ) : !user ? (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Sign Up to Play</span>
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
        <div className="mt-12 food-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-gray-900 font-display">
            <Star className="h-5 w-5 text-primary-600" />
            <span>How Restaurant Games Work</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Join & Play</h3>
              <p>Pay the entry fee to join a restaurant's game. You can play multiple times to improve your score!</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Compete for Victory</h3>
              <p>After the maximum number of entries is reached, the highest scorer wins the entire prize pool.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Redeem Your Prize</h3>
              <p>Winners receive a unique QR code that can only be redeemed at the restaurant that created the game.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantGames;