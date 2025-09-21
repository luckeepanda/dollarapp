import { supabase } from '../lib/supabase';

export interface DashboardStats {
  availableBalance: number;
  todayRedemptions: number;
  monthlyRevenue: number;
  totalCustomers: number;
}

export interface RecentRedemption {
  id: string;
  amount: number;
  customer: string;
  date: string;
  code: string;
  status: 'completed';
}

export interface WithdrawalHistory {
  id: string;
  amount: number;
  date: string;
  status: 'processing' | 'completed';
}

export const restaurantDashboardService = {
  // Get dashboard statistics
  async getDashboardStats(restaurantId: string): Promise<DashboardStats> {
    try {
      // Get restaurant balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', restaurantId)
        .single();

      if (profileError) throw profileError;

      // Get today's redemptions count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: todayRedemptions, error: todayError } = await supabase
        .from('restaurant_games')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('qr_redeemed', true)
        .gte('completed_at', today.toISOString())
        .lt('completed_at', tomorrow.toISOString());

      if (todayError) throw todayError;

      // Get monthly revenue (sum of redeemed QR codes this month)
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      const { data: monthlyGames, error: monthlyError } = await supabase
        .from('restaurant_games')
        .select('prize_pool')
        .eq('restaurant_id', restaurantId)
        .eq('qr_redeemed', true)
        .gte('completed_at', firstDayOfMonth.toISOString())
        .lt('completed_at', firstDayOfNextMonth.toISOString());

      if (monthlyError) throw monthlyError;

      const monthlyRevenue = monthlyGames?.reduce((sum, game) => sum + parseFloat(game.prize_pool.toString()), 0) || 0;

      // Get total unique customers (unique winners)
      const { data: uniqueCustomers, error: customersError } = await supabase
        .from('restaurant_games')
        .select('winner_id')
        .eq('restaurant_id', restaurantId)
        .not('winner_id', 'is', null);

      if (customersError) throw customersError;

      const uniqueCustomerIds = new Set(uniqueCustomers?.map(game => game.winner_id) || []);
      const totalCustomers = uniqueCustomerIds.size;

      return {
        availableBalance: parseFloat(profile.balance.toString()),
        todayRedemptions: todayRedemptions?.length || 0,
        monthlyRevenue,
        totalCustomers
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent redemptions
  async getRecentRedemptions(restaurantId: string, limit: number = 5): Promise<RecentRedemption[]> {
    try {
      const { data, error } = await supabase
        .from('restaurant_games')
        .select(`
          id,
          prize_pool,
          qr_code,
          completed_at,
          winner_id,
          profiles!restaurant_games_winner_id_fkey(username)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('qr_redeemed', true)
        .not('winner_id', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((redemption, index) => ({
        id: redemption.id,
        amount: parseFloat(redemption.prize_pool.toString()),
        customer: redemption.profiles?.username || 'Unknown Player',
        date: new Date(redemption.completed_at).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        code: redemption.qr_code || `QR-${redemption.id.slice(0, 6).toUpperCase()}`,
        status: 'completed' as const
      }));
    } catch (error) {
      console.error('Error fetching recent redemptions:', error);
      throw error;
    }
  },

  // Get withdrawal history (transactions)
  async getWithdrawalHistory(restaurantId: string, limit: number = 5): Promise<WithdrawalHistory[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, created_at, status')
        .eq('user_id', restaurantId)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(transaction => ({
        id: transaction.id,
        amount: parseFloat(transaction.amount.toString()),
        date: new Date(transaction.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        status: transaction.status as 'processing' | 'completed'
      }));
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  },

  // Get active games count
  async getActiveGamesCount(restaurantId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('restaurant_games')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'active');

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching active games count:', error);
      return 0;
    }
  },

  // Get pending QR codes count
  async getPendingQRCount(restaurantId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('restaurant_games')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'completed')
        .eq('qr_redeemed', false)
        .not('qr_code', 'is', null);

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching pending QR count:', error);
      return 0;
    }
  }
};