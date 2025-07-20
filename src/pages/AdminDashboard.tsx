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
  totalRestaurants: number;
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
    totalRestaurants: 0,
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
      const totalRestaurants = userStats?.filter(u => u.account_type === 'restaurant').length || 0;
      const totalBalance = userStats?.reduce((sum, u) => sum + parseFloat(u.balance.toString()), 0) || 0;
      const activeGames = restaurantGames?.filter(g => g.status === 'active').length || 0;
      const completedGames = restaurantGames?.filter(g => g.status === 'completed').length || 0;

      setStats({
        totalUsers,
        totalPlayers,
        totalRestaurants,
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
    <div className="min-h-screen bg-steel-blue-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-steel-blue-100 mb-2">
                Admin Dashboard 🛡️
              </h1>
              <p className="text-gray-300">System overview and administration tools</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/10 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`h-5 w-5 text-blue-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
            <span className="text-white">Loading admin data...</span>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-400">
                    {stats.totalPlayers} players, {stats.totalRestaurants} restaurants
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-blue-300" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Balance</p>
                  <p className="text-2xl font-bold text-green-400">${stats.totalBalance.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">Across all accounts</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Active Games</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.activeGames}</p>
                  <p className="text-xs text-gray-400">{stats.completedGames} completed</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-xl">
                  <GamepadIcon className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Transactions</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.totalTransactions}</p>
                  <p className="text-xs text-gray-400">All time</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Test Credits */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-500/30 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-red-300" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Test Credits Management</h2>
                  <p className="text-gray-300 text-sm">Add test credits to user accounts for development and testing</p>
                </div>
              </div>
              <AdminTestCredits />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Users</span>
              </h2>
              
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{activity.username}</p>
                        <p className="text-sm text-gray-300">{formatDate(activity.created_at)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        activity.account_type === 'player' 
                          ? 'bg-blue-500/20 text-blue-300'
                          : activity.account_type === 'restaurant'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
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
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Admin Tools</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/restaurant-games"
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
            >
              <Trophy className="h-8 w-8 text-orange-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">View All Games</h3>
              <p className="text-gray-300 text-sm">Monitor all restaurant games and tournaments</p>
            </Link>
            
            <div className="p-4 bg-white/5 rounded-xl">
              <Shield className="h-8 w-8 text-red-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">User Management</h3>
              <p className="text-gray-300 text-sm">Manage user accounts and permissions</p>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl">
              <TrendingUp className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Analytics</h3>
              <p className="text-gray-300 text-sm">View system analytics and reports</p>
            </div>
          </div>
        </div>

        {/* Admin Warning */}
        <div className="mt-8 bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-300" />
            <p className="text-yellow-200 text-sm">
              <strong>Admin Access:</strong> You have administrative privileges. Use these tools responsibly and only for testing and system management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;