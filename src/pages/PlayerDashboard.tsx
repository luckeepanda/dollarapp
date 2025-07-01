import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { 
  CreditCard, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Award,
  ArrowRight,
  Play
} from 'lucide-react';

const PlayerDashboard: React.FC = () => {
  const { user } = useAuth();

  const availableGame = {
    id: 1, 
    name: 'Taco Flyer Challenge', 
    description: 'Guide the taco through obstacles to win lunch!',
    prize: 127.50, 
    players: 89, 
    maxPlayers: 100,
    timeLeft: '2h 15m',
    difficulty: 'Easy',
    category: 'Lunch',
    minScore: 5
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600">Ready to win some delicious prizes today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-green-600">${user?.balance.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Games Played</p>
                <p className="text-2xl font-bold text-blue-600">23</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Won</p>
                <p className="text-2xl font-bold text-purple-600">$127.50</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-orange-600">34%</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/deposit"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl hover:from-blue-100 hover:to-green-100 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Add Funds</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                to="/game"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Join Game</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
            </div>
          </div>

          {/* Featured Game */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Featured Game</h2>
              <Link to="/game" className="text-blue-600 font-medium hover:text-blue-700">
                View Details
              </Link>
            </div>
            
            {/* Game Card */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl overflow-hidden shadow-lg">
              {/* Game Header */}
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🌮</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(availableGame.difficulty)}`}>
                    {availableGame.difficulty}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{availableGame.name}</h3>
                <p className="text-orange-100 text-sm mb-4">{availableGame.description}</p>
                
                {/* Game Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Trophy className="h-4 w-4 text-yellow-300" />
                      <span className="text-xs text-orange-100">Prize Pool</span>
                    </div>
                    <p className="text-lg font-bold text-yellow-300">${availableGame.prize}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <span className="text-xs text-orange-100">Players</span>
                    </div>
                    <p className="text-lg font-bold">{availableGame.players}/{availableGame.maxPlayers}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <span className="text-xs text-orange-100">Time Left</span>
                    </div>
                    <p className="text-lg font-bold">{availableGame.timeLeft}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-orange-100">Spots Filled</span>
                    <span className="text-sm font-medium">
                      {Math.round((availableGame.players / availableGame.maxPlayers) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-orange-400/30 rounded-full h-2">
                    <div 
                      className="bg-yellow-300 h-2 rounded-full transition-all"
                      style={{ width: `${(availableGame.players / availableGame.maxPlayers) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Game Details */}
                <div className="flex items-center justify-between text-sm text-orange-100 mb-6">
                  <span>Min Score: {availableGame.minScore}</span>
                  <span>Category: {availableGame.category}</span>
                </div>

                {/* Join Button */}
                <Link
                  to="/game"
                  className="w-full bg-white text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Play className="h-5 w-5" />
                  <span>Play Game - $1</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span>How It Works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Join & Play</h3>
              <p>Pay $1 to enter a game. Guide your taco through obstacles by clicking or pressing SPACE.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Score Points</h3>
              <p>Each obstacle you pass gives you 1 point. Reach the minimum score to qualify for the prize draw.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Win Prizes</h3>
              <p>Qualified players are entered into a random draw. Winners receive QR codes for restaurant redemption.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;