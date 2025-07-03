import { supabase } from '../lib/supabase';

export interface GameSession {
  id: string;
  game_type: string;
  entry_fee: number;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  prize_pool: number;
  min_score: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface GameParticipant {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: string;
  final_score?: number;
  qualified: boolean;
  prize_won?: number;
  profiles?: {
    username: string;
  };
}

export const gameSessionService = {
  // Join a game session (deducts $1 from balance)
  async joinGameSession(userId: string, gameType: string = 'taco_flyer'): Promise<string> {
    const { data, error } = await supabase.rpc('join_game_session', {
      p_user_id: userId,
      p_game_type: gameType
    });

    if (error) {
      console.error('Error joining game session:', error);
      throw new Error(error.message || 'Failed to join game session');
    }

    return data; // Returns session ID
  },

  // Get current session for user
  async getCurrentSession(userId: string): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        game_participants!inner(user_id)
      `)
      .eq('game_participants.user_id', userId)
      .in('status', ['waiting', 'active'])
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching current session:', error);
      throw error;
    }

    return data || null;
  },

  // Get session details with participants
  async getSessionDetails(sessionId: string): Promise<{
    session: GameSession;
    participants: GameParticipant[];
  }> {
    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      throw sessionError;
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('game_participants')
      .select(`
        *,
        profiles(username)
      `)
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true });

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      throw participantsError;
    }

    return {
      session,
      participants: participants || []
    };
  },

  // Submit game score
  async submitScore(sessionId: string, userId: string, score: number): Promise<boolean> {
    const { data, error } = await supabase.rpc('submit_game_score', {
      p_session_id: sessionId,
      p_user_id: userId,
      p_score: score
    });

    if (error) {
      console.error('Error submitting score:', error);
      throw error;
    }

    return data; // Returns whether player qualified
  },

  // Complete game session (distribute prizes)
  async completeSession(sessionId: string): Promise<void> {
    const { error } = await supabase.rpc('complete_game_session', {
      p_session_id: sessionId
    });

    if (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  },

  // Listen for session updates
  subscribeToSession(sessionId: string, callback: (session: GameSession) => void) {
    return supabase
      .channel(`session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          callback(payload.new as GameSession);
        }
      )
      .subscribe();
  },

  // Listen for participant updates
  subscribeToParticipants(sessionId: string, callback: (participants: GameParticipant[]) => void) {
    return supabase
      .channel(`participants_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `session_id=eq.${sessionId}`
        },
        async () => {
          // Refetch participants when changes occur
          const { data } = await supabase
            .from('game_participants')
            .select(`
              *,
              profiles(username)
            `)
            .eq('session_id', sessionId)
            .order('joined_at', { ascending: true });
          
          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();
  }
};