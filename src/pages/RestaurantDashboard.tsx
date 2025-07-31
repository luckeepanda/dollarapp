// import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { restaurantDashboardService, type DashboardStats, type RecentRedemption, type WithdrawalHistory } from '../services/restaurantDashboardService';
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
  Trophy,
  RefreshCw,
  Activity
} from 'lucide-react';

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    availableBalance: 0,
    todayRedemptions: 0,
    monthlyRevenue: 0,
    totalCustomers: 0
  });
  const [recentRedemptions, setRecentRedemptions] = useState<RecentRedemption[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeGamesCount, setActiveGamesCount] = useState(0);
  const [pendingQRCount, setPendingQRCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [
        dashboardStats,
        redemptions,
        withdrawals,
        activeGames,
        pendingQRs
      ] = await Promise.all([
        restaurantDashboardService.getDashboardStats(user.id),
        restaurantDashboardService.getRecentRedemptions(user.id, 3),
        restaurantDashboardService.getWithdrawalHistory(user.id, 2),
        restaurantDashboardService.getActiveGamesCount(user.id),
        restaurantDashboardService.getPendingQRCount(user.id)
      ]);
      
      setStats(dashboardStats);
      setRecentRedemptions(redemptions);
      setWithdrawalHistory(withdrawals);
      setActiveGamesCount(activeGames);
      setPendingQRCount(pendingQRs);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Force navigation to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to home page
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
                Restaurant Dashboard 🍽️
              </h1>
              <p className="text-gray-600">Manage QR redemptions and track your earnings</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="food-card p-3 hover:shadow-md transition-all disabled:opacity-50"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`h-5 w-5 text-primary-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              {!user?.isKYCVerified && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">KYC Verification Required</p>
                      <p className="text-xs text-red-700">Complete verification to enable withdrawals</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mr-3"></div>
            <span className="text-gray-700">Loading dashboard data...</span>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="food-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-success-600">${stats.availableBalance.toFixed(2)}</p>
              </div>
              <div className="bg-success-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </div>

          <div className="food-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Redemptions</p>
                <p className="text-2xl font-bold text-primary-600">{stats.todayRedemptions}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <QrCode className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="food-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary-600">${stats.monthlyRevenue.toFixed(0)}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="food-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-accent-600">${stats.totalCustomers}</p>
              </div>
              <div className="bg-accent-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </div>
        </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="food-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 font-display">Quick Actions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-100 to-success-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-primary-600" />
                  <div>
                    <span className="font-medium text-gray-900">Active Games</span>
                    <p className="text-xs text-gray-600">{activeGamesCount} games running</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary-600">{activeGamesCount}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent-100 to-primary-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5 text-accent-600" />
                  <div>
                    <span className="font-medium text-gray-900">Pending QR Codes</span>
                    <p className="text-xs text-gray-600">Awaiting redemption</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-accent-600">{pendingQRCount}</span>
              </div>

              <Link
                to="/restaurant/games"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-success-100 to-success-200 rounded-lg hover:from-success-200 hover:to-success-300 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-success-600" />
                  <span className="font-medium text-gray-900">Manage Games</span>
                </div>
                <ArrowRight className="h-4 w-4 text-success-600 group-hover:text-success-700" />
              </Link>

              <Link
                to="/scan"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg hover:from-primary-200 hover:to-primary-300 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900">Scan QR Code</span>
                </div>
                <ArrowRight className="h-4 w-4 text-primary-600 group-hover:text-primary-700" />
              </Link>

              <Link
                to="/withdraw"
                className={`flex items-center justify-between p-4 rounded-xl transition-all group ${
                  user?.isKYCVerified 
                    ? 'bg-gradient-to-r from-success-100 to-success-200 hover:from-success-200 hover:to-success-300'
                    : 'bg-gray-100 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ArrowUpRight className={`h-5 w-5 ${user?.isKYCVerified ? 'text-success-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-gray-900">Withdraw Funds</span>
                </div>
                <ArrowRight className="h-4 w-4 text-success-600 group-hover:text-success-700" />
              </Link>
            </div>
            
            {!user?.isKYCVerified && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  Complete KYC verification to enable withdrawals
                </p>
              </div>
            )}
          </div>

          {/* Recent Redemptions */}
          <div className="food-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 font-display">Recent Redemptions</h2>
              <Link to="/scan" className="text-primary-600 font-medium hover:text-primary-700">
                View All
              </Link>
            </div>
            {recentRedemptions.length === 0 ? (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-600">No redemptions yet</p>
                <p className="text-gray-500 text-sm">QR codes will appear here when customers redeem prizes</p>
              </div>
            ) : (
              <div className="space-y-4">
              {recentRedemptions.map((redemption) => (
                <div key={redemption.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-success-600">${redemption.amount.toFixed(2)}</span>
                        <span className="text-sm text-gray-700">from {redemption.customer}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <span>{redemption.date}</span>
                        <span>Code: {redemption.code}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-success-600" />
                      <span className="text-sm text-success-600 font-medium">Completed</span>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="mt-8 food-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 font-display">Withdrawal History</h2>
          {withdrawalHistory.length === 0 ? (
            <div className="text-center py-8">
              <ArrowUpRight className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-600">No withdrawals yet</p>
              <p className="text-gray-500 text-sm">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-primary-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ETA</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalHistory.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900">{withdrawal.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">${withdrawal.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`food-badge ${
                        withdrawal.status === 'completed'
                          ? 'food-badge-success'
                          : 'food-badge-warning'
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
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;