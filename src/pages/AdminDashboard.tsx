import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import AdminTestCredits from '../components/AdminTestCredits';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  DollarSign, 
  Trophy, 
  Activity,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Shield,
  Database,
  GamepadIcon
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalPlayers: number;
  totalBusinesses: number;
  totalBalance: number;
  activeGames: number;
  completedGames: number;
  totalTransactions: number;
  recentActivity: any[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPlayers: 0,
    totalBusinesses: 0,
    totalBalance: 0,
    activeGames: 0,
    completedGames: 0,
    totalTransactions: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      setIsLoading(true);
      
      // Get user statistics
      const { data: userStats, error: userError } = await supabase
        .from('profiles')
        .select('account_type, balance');
      
      if (userError) throw userError;

      // Get game statistics
      const { data: restaurantGames, error: gamesError } = await supabase
        .from('restaurant_games')
        .select('status');
      
      if (gamesError) throw gamesError;

      // Get transaction count
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id');
      
      if (transError) throw transError;

      // Get recent activity
      const { data: recentActivity, error: activityError } = await supabase
        .from('profiles')
        .select('username, account_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (activityError) throw activityError;

      // Calculate statistics
      const totalUsers = userStats?.length || 0;
      const totalPlayers = userStats?.filter(u => u.account_type === 'player').length || 0;
      const totalBusinesses = userStats?.filter(u => u.account_type === 'business').length || 0;
      const totalBalance = userStats?.reduce((sum, u) => sum + parseFloat(u.balance.toString()), 0) || 0;
      const activeGames = restaurantGames?.filter(g => g.status === 'active').length || 0;
      const completedGames = restaurantGames?.filter(g => g.status === 'completed').length || 0;

      setStats({
        totalUsers,
        totalPlayers,
        totalBusinesses: totalBusinesses,
        totalBalance,
        activeGames,
        completedGames,
        totalTransactions: transactions?.length || 0,
        recentActivity: recentActivity || []
      });
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAdminStats();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                Admin Dashboard 🛡️
              </h1>
              <p className="text-gray-600">System overview and administration tools</p>
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
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mr-3"></div>
            <span className="text-gray-700">Loading admin data...</span>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="food-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-primary-600">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-600">
                    {stats.totalPlayers} players, {stats.totalBusinesses} businesses
                  </p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="food-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-success-600">${stats.totalBalance.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">Across all accounts</p>
                </div>
                <div className="bg-success-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </div>

            <div className="food-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Games</p>
                  <p className="text-2xl font-bold text-accent-600">{stats.activeGames}</p>
                  <p className="text-xs text-gray-600">{stats.completedGames} completed</p>
                </div>
                <div className="bg-accent-100 p-3 rounded-lg">
                  <GamepadIcon className="h-6 w-6 text-accent-600" />
                </div>
              </div>
            </div>

            <div className="food-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-primary-600">{stats.totalTransactions}</p>
                  <p className="text-xs text-gray-600">All time</p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Test Credits */}
          <div className="lg:col-span-2">
            <div className="food-card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-red-600 font-display">Test Credits Management</h2>
                  <p className="text-gray-600 text-sm">Add test credits to user accounts for development and testing</p>
                </div>
              </div>
              <AdminTestCredits />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="food-card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2 font-display">
                <Activity className="h-5 w-5" />
                <span>Recent Users</span>
              </h2>
              
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{activity.username}</p>
                        <p className="text-sm text-gray-600">{formatDate(activity.created_at)}</p>
                      </div>
                      <span className={`food-badge ${
                        activity.account_type === 'player' 
                          ? 'food-badge-primary'
                          : activity.account_type === 'business'
                          ? 'food-badge-success'
                          : 'food-badge-error'
                      }`}>
                        {activity.account_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="mt-8 food-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2 font-display">
            <Database className="h-5 w-5" />
            <span>Admin Tools</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/restaurant-games"
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group"
            >
              <Trophy className="h-8 w-8 text-accent-600 mb-3" />
              <h3 className="font-semibold text-accent-600 mb-2">View All Games</h3>
              <p className="text-gray-600 text-sm">Monitor all restaurant games and tournaments</p>
            </Link>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Shield className="h-8 w-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-red-600 mb-2">User Management</h3>
              <p className="text-gray-600 text-sm">Manage user accounts and permissions</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-primary-600 mb-3" />
              <h3 className="font-semibold text-primary-600 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">View system analytics and reports</p>
            </div>
          </div>
        </div>

        {/* Admin Warning */}
        <div className="mt-8 bg-accent-50 border border-accent-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-accent-600" />
            <p className="text-accent-700 text-sm">
              <strong>Admin Access:</strong> You have administrative privileges. Use these tools responsibly and only for testing and system management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;