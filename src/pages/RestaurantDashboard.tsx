import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { 
  QrCode, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();

  const recentRedemptions = [
    { id: 1, amount: 25.50, customer: 'Player123', date: '2024-01-15 14:30', code: 'QR-ABC123' },
    { id: 2, amount: 45.00, customer: 'GameWinner', date: '2024-01-15 12:15', code: 'QR-DEF456' },
    { id: 3, amount: 12.75, customer: 'FoodLover', date: '2024-01-14 18:45', code: 'QR-GHI789' },
  ];

  const pendingWithdrawals = [
    { id: 1, amount: 234.50, date: '2024-01-14', status: 'processing' },
    { id: 2, amount: 156.25, date: '2024-01-12', status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Restaurant Dashboard 🍽️
              </h1>
              <p className="text-gray-600">Manage QR redemptions and track your earnings</p>
            </div>
            {!user?.isKYCVerified && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">KYC Verification Required</p>
                    <p className="text-xs text-orange-600">Complete verification to enable withdrawals</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-steel-blue-600">${user?.balance.toFixed(2)}</p>
              </div>
              <div className="bg-steel-blue-100 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-steel-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Redemptions</p>
                <p className="text-2xl font-bold text-royal-blue-600">8</p>
              </div>
              <div className="bg-royal-blue-100 p-3 rounded-xl">
                <QrCode className="h-6 w-6 text-royal-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-steel-blue-600">$1,247</p>
              </div>
              <div className="bg-steel-blue-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-steel-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-royal-blue-600">156</p>
              </div>
              <div className="bg-royal-blue-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-royal-blue-600" />
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
                to="/scan"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-royal-blue-50 to-steel-blue-50 rounded-xl hover:from-royal-blue-100 hover:to-steel-blue-100 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5 text-royal-blue-600" />
                  <span className="font-medium">Scan QR Code</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                to="/withdraw"
                className={`flex items-center justify-between p-4 rounded-xl transition-all group ${
                  user?.isKYCVerified 
                    ? 'bg-gradient-to-r from-steel-blue-50 to-royal-blue-50 hover:from-steel-blue-100 hover:to-royal-blue-100'
                    : 'bg-gray-50 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ArrowUpRight className={`h-5 w-5 ${user?.isKYCVerified ? 'text-steel-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">Withdraw Funds</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
            </div>
            
            {!user?.isKYCVerified && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-800">
                  Complete KYC verification to enable withdrawals
                </p>
              </div>
            )}
          </div>

          {/* Recent Redemptions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Redemptions</h2>
              <Link to="/scan" className="text-royal-blue-600 font-medium hover:text-royal-blue-700">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentRedemptions.map((redemption) => (
                <div key={redemption.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">${redemption.amount}</span>
                        <span className="text-sm text-gray-500">from {redemption.customer}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>{redemption.date}</span>
                        <span>Code: {redemption.code}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Completed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">ETA</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{withdrawal.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">${withdrawal.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        withdrawal.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
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