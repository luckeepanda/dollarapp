import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import PlayerQRCodes from '../components/PlayerQRCodes';
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
  Target,
  Plus,
  QrCode,
  Zap
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
      setRestaurantGames(games.slice(0, 3));
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
  };

  const handleLeaveGame = () => {
    setCurrentGame(null);
    setGameState('dashboard');
    loadRestaurantGames();
  };

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
    <div className="min-h-screen bg-dark-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            Welcome back, <span className="gaming-text-gradient">{user?.username}</span>
          </h1>
          <p className="text-dark-200">Compete in skill-based games for real prizes</p>
        </div>

        {user && user.balance < 1 && (
          <div className="bg-vivid-orange-500/10 border border-vivid-orange-500/30 rounded-lg p-4 mb-6 animate-pulse-fast">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-vivid-orange-400" />
              <div>
                <p className="text-sm font-bold text-vivid-orange-400 uppercase tracking-wide">Low Balance</p>
                <p className="text-xs text-vivid-orange-300">
                  Add funds to join games{' '}
                  <Link to="/deposit" className="font-bold hover:underline ml-1 text-neon-green-400">
                    <span>Add Funds Now</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="gaming-card p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-neon-green-500/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-neon-green-400" />
                  </div>
                  <span className="text-xs font-medium text-dark-200 uppercase tracking-wide">Balance</span>
                </div>
                <Link
                  to="/deposit"
                  className="p-2 bg-neon-green-500/20 hover:bg-neon-green-500/30 border border-neon-green-500/30 rounded-lg transition-all group/btn"
                >
                  <Plus className="h-4 w-4 text-neon-green-400 group-hover/btn:scale-110 transition-transform" />
                </Link>
              </div>
              <div className="text-4xl font-black text-neon-green-400 mb-2">
                ${user?.balance.toFixed(2)}
              </div>
              <p className="text-xs text-dark-200">
                <span className="font-bold text-white">{user ? Math.floor(user.balance) : 0}</span> entries available
              </p>
            </div>
          </div>

          <div className="gaming-card p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-vivid-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-vivid-orange-500/20 rounded-lg">
                  <Trophy className="h-5 w-5 text-vivid-orange-400" />
                </div>
                <span className="text-xs font-medium text-dark-200 uppercase tracking-wide">Live Games</span>
              </div>
              <div className="text-4xl font-black text-vivid-orange-400 mb-2">
                {restaurantGames.length}
              </div>
              <p className="text-xs text-dark-200">Active competitions</p>
            </div>
          </div>

          <div className="gaming-card p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green-500/10 via-vivid-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-neon-green-500/20 to-vivid-orange-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-neon-green-400" />
                </div>
                <span className="text-xs font-medium text-dark-200 uppercase tracking-wide">Entry Fee</span>
              </div>
              <div className="text-4xl font-black gaming-text-gradient mb-2">
                $1.00
              </div>
              <p className="text-xs text-dark-200">Per game entry</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="gaming-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <QrCode className="h-6 w-6 text-neon-green-400" />
                <span>Your Prize <span className="gaming-text-gradient">QR Codes</span></span>
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="text-neon-green-400 hover:text-neon-green-300 text-sm font-medium uppercase tracking-wide transition-colors"
              >
                Refresh
              </button>
            </div>
            <PlayerQRCodes />
          </div>

          <div className="gaming-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-vivid-orange-400" />
                <span>Live <span className="gaming-text-orange">Competitions</span></span>
              </h2>
              <Link
                to="/restaurant-games"
                className="text-neon-green-400 hover:text-neon-green-300 font-bold flex items-center space-x-1 uppercase tracking-wide text-sm transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoadingGames ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-dark-700 border-t-neon-green-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-vivid-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
              </div>
            ) : restaurantGames.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative inline-block mb-4">
                  <Trophy className="h-16 w-16 text-dark-700 mx-auto" />
                  <div className="absolute inset-0 blur-xl bg-gradient-to-r from-neon-green-500/30 to-vivid-orange-500/30"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Active Games</h3>
                <p className="text-dark-200 mb-6">Check back soon for new competitions</p>
                <Link
                  to="/free-play"
                  className="inline-flex items-center space-x-2 food-button px-6 py-3 rounded-lg"
                >
                  <Play className="h-4 w-4" />
                  <span>Try Free Play</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurantGames.map((game, index) => (
                  <ModernGameCard
                    key={game.id}
                    game={game}
                    onJoin={() => handleJoinGame(game)}
                    userBalance={user?.balance || 0}
                    user={user}
                    cardIndex={index}
                    className={isJoining === game.id ? 'opacity-75 pointer-events-none' : ''}
                  />
                ))}
              </div>
            )}

            {restaurantGames.length > 0 && (
              <div className="mt-6 text-center">
                <Link
                  to="/restaurant-games"
                  className="inline-flex items-center space-x-2 food-button px-8 py-4 rounded-lg font-bold uppercase tracking-wide"
                >
                  <Trophy className="h-5 w-5" />
                  <span>View All Games</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 gaming-card p-8">
          <h2 className="text-xl font-black mb-6 flex items-center space-x-2 text-white">
            <TrendingUp className="h-6 w-6 text-neon-green-400" />
            <span>How It <span className="gaming-text-gradient">Works</span></span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <div className="relative p-6 border border-dark-400 rounded-lg">
                <div className="text-3xl font-black text-neon-green-400 mb-3">01</div>
                <h3 className="font-bold text-white mb-2 text-lg">Join Games</h3>
                <p className="text-dark-200 text-sm leading-relaxed">Browse skill-based competitions. Any score qualifies - highest score wins!</p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-vivid-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <div className="relative p-6 border border-dark-400 rounded-lg">
                <div className="text-3xl font-black text-vivid-orange-400 mb-3">02</div>
                <h3 className="font-bold text-white mb-2 text-lg">Compete</h3>
                <p className="text-dark-200 text-sm leading-relaxed">Play until the game fills. Each attempt costs the entry fee. Beat the competition!</p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green-500/10 via-vivid-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <div className="relative p-6 border border-dark-400 rounded-lg">
                <div className="text-3xl font-black gaming-text-gradient mb-3">03</div>
                <h3 className="font-bold text-white mb-2 text-lg">Win Prizes</h3>
                <p className="text-dark-200 text-sm leading-relaxed">Winners get QR codes redeemable at local businesses for real prizes!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
