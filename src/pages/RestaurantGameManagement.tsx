import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { restaurantGameService, type RestaurantGame } from '../services/restaurantGameService';
import { 
  ArrowLeft, 
  Plus, 
  Trophy, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  QrCode,
  Eye,
  Star
} from 'lucide-react';

const RestaurantGameManagement: React.FC = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<RestaurantGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entryFee: 5,
    maxPlayers: 5,
    minScore: 10
  });

  useEffect(() => {
    if (user) {
      loadGames();
    }
  }, [user]);

  const loadGames = async () => {
    if (!user) return;
    
    try {
      const gamesData = await restaurantGameService.getRestaurantGames(user.id);
      setGames(gamesData);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);
    try {
      await restaurantGameService.createGame(
        user.id,
        formData.name,
        formData.description,
        formData.entryFee,
        formData.maxPlayers,
        formData.minScore
      );
      
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        entryFee: 5,
        maxPlayers: 5,
        minScore: 10
      });
      
      await loadGames();
    } catch (error: any) {
      console.error('Failed to create game:', error);
      alert(error.message || 'Failed to create game');
    } finally {
      setIsCreating(false);
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

  return (
    <div className="min-h-screen bg-steel-blue-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/restaurant/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Game Management</h1>
              <p className="text-royal-blue-200">Create and manage your restaurant games</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create Game</span>
          </button>
        </div>

        {/* Create Game Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Game</h2>
                
                <form onSubmit={handleCreateGame} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Game Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Lunch Challenge"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe your game and prize..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entry Fee ($)
                      </label>
                      <input
                        type="number"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({...formData, entryFee: parseFloat(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="1"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Players
                      </label>
                      <input
                        type="number"
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="2"
                        max="20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Score to Win
                    </label>
                    <input
                      type="number"
                      value={formData.minScore}
                      onChange={(e) => setFormData({...formData, minScore: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Create Game</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      disabled={isCreating}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Games List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
              {/* Game Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                    {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-royal-blue-200 text-sm mb-4">{game.description}</p>

                {/* Game Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                    <p className="text-lg font-bold text-royal-blue-300">{game.current_players}/{game.max_players}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-royal-blue-200">Progress</span>
                    <span className="text-sm font-medium text-white">
                      {Math.round((game.current_players / game.max_players) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(game.current_players / game.max_players) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Game Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-royal-blue-200">Entry Fee:</span>
                    <span className="text-white font-medium">${game.entry_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-royal-blue-200">Min Score:</span>
                    <span className="text-white font-medium">{game.min_score}</span>
                  </div>
                  {game.status === 'completed' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-royal-blue-200">Winning Score:</span>
                        <span className="text-yellow-400 font-medium">{game.winning_score}</span>
                      </div>
                      {game.qr_code && (
                        <div className="flex items-center justify-between">
                          <span className="text-royal-blue-200">QR Code:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono text-xs">{game.qr_code}</span>
                            {game.qr_redeemed ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <QrCode className="h-4 w-4 text-yellow-400" />
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <Link
                    to={`/restaurant/games/${game.id}`}
                    className="w-full bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white py-2 rounded-xl font-semibold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Games Created Yet</h3>
            <p className="text-royal-blue-200 mb-6">Create your first game to start attracting players!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Game</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantGameManagement;