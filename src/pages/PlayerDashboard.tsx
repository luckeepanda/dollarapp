import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { 
  CreditCard, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Award,
  ArrowRight
} from 'lucide-react';

const PlayerDashboard: React.FC = () => {
  const { user } = useAuth();

  const recentGames = [
    { id: 1, date: '2024-01-15', prize: 45.00, status: 'won', game: 'Pizza Challenge' },
    { id: 2, date: '2024-01-14', prize: 12.00, status: 'lost', game: 'Burger Battle' },
    { id: 3, date: '2024-01-13', prize: 25.00, status: 'pending', game: 'Taco Tuesday' },
  ];

  const availableGames = [
    { id: 1, name: 'Lunch Rush', prize: 67.50, players: 45, timeLeft: '2h 15m' },
    { id: 2, name: 'Dinner Delight', prize: 89.25, players: 62, timeLeft: '4h 30m' },
    { id: 3, name: 'Weekend Special', prize: 156.75, players: 87, timeLeft: '1d 6h' },
  ];

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

          {/* Available Games */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Available Games</h2>
              <Link to="/game" className="text-blue-600 font-medium hover:text-blue-700">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {availableGames.map((game) => (
                <div key={game.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{game.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>Prize: ${game.prize}</span>
                        <span>{game.players} players</span>
                        <span>Ends in {game.timeLeft}</span>
                      </div>
                    </div>
                    <Link
                      to="/game"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join - $1
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Games */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Recent Games</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Game</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Prize</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((game) => (
                  <tr key={game.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{game.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{game.game}</td>
                    <td className="py-3 px-4">${game.prize.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        game.status === 'won' 
                          ? 'bg-green-100 text-green-800'
                          : game.status === 'lost'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;