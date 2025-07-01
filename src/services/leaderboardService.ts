import { supabase } from '../lib/supabase';

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  user_id?: string;
  created_at: string;
}

export const leaderboardService = {
  // Get top leaderboard entries
  async getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
    
    return data || [];
  },

  // Add a new leaderboard entry
  async addScore(nickname: string, score: number, userId?: string): Promise<void> {
    const { error } = await supabase
      .from('leaderboard')
      .insert([
        {
          nickname: nickname.trim(),
          score,
          user_id: userId || null,
        },
      ]);

    if (error) {
      console.error('Error adding leaderboard entry:', error);
      throw error;
    }
  },

  // Get user's best score
  async getUserBestScore(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user best score:', error);
      throw error;
    }

    return data?.score || 0;
  },

  // Get recent scores for a user
  async getUserRecentScores(userId: string, limit: number = 5): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user recent scores:', error);
      throw error;
    }

    return data || [];
  }
};