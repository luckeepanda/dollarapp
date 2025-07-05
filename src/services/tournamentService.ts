import { supabase } from '../lib/supabase';

export interface Tournament {
  id: string;
  name: string;
  entry_fee: number;
  max_participants: number;
  current_participants: number;
  status: 'active' | 'completed';
  winner_id?: string;
  winning_score?: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface TournamentEntry {
  id: string;
  tournament_id: string;
  user_id: string;
  score: number;
  completed_at: string;
  created_at: string;
}

export interface TournamentResult {
  user_id: string;
  username: string;
  score: number;
  rank: number;
  is_winner: boolean;
  completed_at: string;
}

export interface ScoreSubmissionResult {
  tournament_completed: boolean;
  winner_id?: string;
  winning_score?: number;
  your_score: number;
  entries_count: number;
  max_participants: number;
}

export const tournamentService = {
  // Join a tournament
  async joinTournament(userId: string): Promise<string> {
    const { data, error } = await supabase.rpc('join_tournament', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error joining tournament:', error);
      throw new Error(error.message || 'Failed to join tournament');
    }

    return data; // Returns tournament ID
  },

  // Submit tournament score
  async submitScore(tournamentId: string, userId: string, score: number): Promise<ScoreSubmissionResult> {
    const { data, error } = await supabase.rpc('submit_tournament_score', {
      p_tournament_id: tournamentId,
      p_user_id: userId,
      p_score: score
    });

    if (error) {
      console.error('Error submitting tournament score:', error);
      throw error;
    }

    return data;
  },

  // Get tournament details
  async getTournament(tournamentId: string): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching tournament:', error);
      throw error;
    }

    return data || null;
  },

  // Get tournament results
  async getTournamentResults(tournamentId: string): Promise<TournamentResult[]> {
    const { data, error } = await supabase.rpc('get_tournament_results', {
      p_tournament_id: tournamentId
    });

    if (error) {
      console.error('Error fetching tournament results:', error);
      throw error;
    }

    return data || [];
  },

  // Get active tournaments
  async getActiveTournaments(): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching active tournaments:', error);
      throw error;
    }

    return data || [];
  },

  // Get completed tournaments
  async getCompletedTournaments(limit: number = 10): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        winner:profiles!tournaments_winner_id_fkey(username)
      `)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching completed tournaments:', error);
      throw error;
    }

    return data || [];
  },

  // Check if user is in tournament
  async isUserInTournament(userId: string, tournamentId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('tournament_entries')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user tournament participation:', error);
      throw error;
    }

    return !!data;
  }
};