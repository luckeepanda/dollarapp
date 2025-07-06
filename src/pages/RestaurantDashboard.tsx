import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { 
  QrCode, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowRight,
  Trophy
} from 'lucide-react';

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const recentRedemptions = [
    { id: 1, amount: 25.50, customer: 'Player123', date: '2024-01-15 14:30', code: 'QR-ABC123' },
    { id: 2, amount: 45.00, customer: 'GameWinner', date: '2024-01-15 12:15', code: 'QR-DEF456' },
    { id: 3, amount: 12.75, customer: 'FoodLover', date: '2024-01-14 18:45', code: 'QR-GHI789' },
  ];

  const pendingWithdrawals = [
    { id: 1, amount: 234.50, date: '2024-01-14', status: 'processing' },
    { id: 2, amount: 156.25, date: '2024-01-12', status: 'completed' },
  ];

  const handleLogout = async () => {
    try {
      const { logout } = useAuth();
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-steel-blue-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                Restaurant Dashboard 🍽️
              </h1>
              <p className="text-blue-800">Manage QR redemptions and track your earnings</p>
            </div>
            {!user?.isKYCVerified && (
              <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">KYC Verification Required</p>
                    <p className="text-xs text-blue-700">Complete verification to enable withdrawals</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">Available Balance</p>
                <p className="text-2xl font-bold text-green-400">${user?.balance.toFixed(2)}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">Today's Redemptions</p>
                <p className="text-2xl font-bold text-blue-300">8</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <QrCode className="h-6 w-6 text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-300">$1,247</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">Total Customers</p>
                <p className="text-2xl font-bold text-orange-400">156</p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/restaurant/games"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-blue-900">Manage Games</span>
                </div>
                <ArrowRight className="h-4 w-4 text-green-300 group-hover:text-white" />
              </Link>

              <Link
                to="/scan"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-royal-blue-500/20 to-steel-blue-500/20 rounded-xl hover:from-royal-blue-500/30 hover:to-steel-blue-500/30 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5 text-royal-blue-300" />
                  <span className="font-medium text-blue-900">Scan QR Code</span>
                </div>
                <ArrowRight className="h-4 w-4 text-royal-blue-200 group-hover:text-white" />
              </Link>

              <Link
                to="/withdraw"
                className={`flex items-center justify-between p-4 rounded-xl transition-all group ${
                  user?.isKYCVerified 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30'
                    : 'bg-white-300/10 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ArrowUpRight className={`h-5 w-5 ${user?.isKYCVerified ? 'text-green-400' : 'text-white-300'}`} />
                  <span className="font-medium text-blue-900">Withdraw Funds</span>
                </div>
                <ArrowRight className="h-4 w-4 text-green-300 group-hover:text-white" />
              </Link>
            </div>
            
            {!user?.isKYCVerified && (
              <div className="mt-4 p-3 bg-yellow-500/20 rounded-xl">
                <p className="text-sm text-blue-800">
                  Complete KYC verification to enable withdrawals
                </p>
              </div>
            )}
          </div>

          {/* Recent Redemptions */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-900">Recent Redemptions</h2>
              <Link to="/scan" className="text-royal-blue-300 font-medium hover:text-royal-blue-200">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentRedemptions.map((redemption) => (
                <div key={redemption.id} className="border border-white/20 rounded-xl p-4 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-blue-900">${redemption.amount}</span>
                        <span className="text-sm text-blue-700">from {redemption.customer}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-blue-700">
                        <span>{redemption.date}</span>
                        <span>Code: {redemption.code}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">Completed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Withdrawal History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 font-medium text-blue-800">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-800">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-800">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-800">ETA</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-royal-blue-300" />
                        <span className="text-blue-900">{withdrawal.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-blue-900">${withdrawal.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        withdrawal.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-blue-700">
                      {withdrawal.status === 'processing' ? '1-2 business days' : 'Completed'}
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

export default RestaurantDashboard;