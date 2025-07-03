import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { 
  CreditCard, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
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
      default: return 'bg-white-400 text-white-100';
    }
  };

  return (
    <div className="min-h-screen bg-steel-blue-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-royal-blue-200">Ready to win some delicious prizes today?</p>
        </div>

        {/* Stats Cards - Only Balance */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 max-w-md">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-royal-blue-200">Current Balance</p>
                <p className="text-2xl font-bold text-green-400">${user?.balance.toFixed(2)}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/deposit"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-royal-blue-500/20 to-steel-blue-500/20 rounded-xl hover:from-royal-blue-500/30 hover:to-steel-blue-500/30 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-royal-blue-300" />
                  <span className="font-medium text-white">Add Funds</span>
                </div>
                <ArrowRight className="h-4 w-4 text-royal-blue-200 group-hover:text-white" />
              </Link>

              <Link
                to="/free-play"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-white">Free Play</span>
                </div>
                <ArrowRight className="h-4 w-4 text-green-300 group-hover:text-white" />
              </Link>
            </div>
          </div>

          {/* Featured Game */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Featured Game</h2>
              <Link to="/free-play" className="text-royal-blue-300 font-medium hover:text-royal-blue-200">
                Try Free Play
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

                {/* Join Button - Now leads directly to Taco Game */}
                <Link
                  to="/free-play"
                  className="w-full bg-white text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Play className="h-5 w-5" />
                  <span>Play Taco Game - $1</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-white">
            <TrendingUp className="h-5 w-5 text-orange-400" />
            <span>How It Works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-royal-blue-200">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Join & Play</h3>
              <p>Pay $1 to enter a game. Guide your taco through obstacles by clicking or pressing SPACE.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">2. Score Points</h3>
              <p>Each obstacle you pass gives you 1 point. Reach the minimum score to qualify for the prize draw.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">3. Win Prizes</h3>
              <p>Qualified players are entered into a random draw. Winners receive QR codes for restaurant redemption.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;