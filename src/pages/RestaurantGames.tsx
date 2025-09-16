import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RestaurantGameSession from '../components/RestaurantGameSession';
import ModernGameCard from '../components/ModernGameCard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();
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
              <h1 className="text-3xl font-bold text-gray-900 font-display">Local Business Games</h1>
              <p className="text-gray-600">Join games created by local businesses and win prizes!</p>
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
                  You need funds to join games.{' '}
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
            <p className="text-gray-600 mb-6">Check back later for new local business games!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <ModernGameCard
                key={game.id}
                game={game}
                onJoin={() => handleJoinGame(game)}
                userBalance={user?.balance || 0}
                className={isJoining === game.id ? 'opacity-75 pointer-events-none' : ''}
              />
            ))}
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 food-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-gray-900 font-display">
            <Star className="h-5 w-5 text-primary-600" />
            <span>How Local Business Games Work</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Join & Play</h3>
              <p>Pay $1 to play a single-player challenge. Score above the minimum to qualify for the prize!</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Meet the Challenge</h3>
              <p>Each game has a minimum score requirement. Reach or exceed it to qualify for the local business prize.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Redeem Your Prize</h3>
              <p>Qualifying players receive a unique QR code that can be redeemed at the local business for real food prizes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantGames;