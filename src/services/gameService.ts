import { supabase, type Game, type GameEntry } from '../lib/supabase';

export const gameService = {
  // Get all active games
  async getActiveGames(): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Join a game
  async joinGame(gameId: string, userId: string): Promise<void> {
    // Start a transaction
    const { error: entryError } = await supabase
      .from('game_entries')
      .insert([
        {
          user_id: userId,
          game_id: gameId,
          score: 0,
          qualified: false,
        },
      ]);

    if (entryError) throw entryError;

    // Deduct $1 from user balance
    const { error: balanceError } = await supabase.rpc('deduct_balance', {
      user_id: userId,
      amount: 1,
    });

    if (balanceError) throw balanceError;

    // Update game player count
    const { error: gameError } = await supabase.rpc('increment_game_players', {
      game_id: gameId,
    });

    if (gameError) throw gameError;
  },

  // Submit game score
  async submitScore(gameId: string, userId: string, score: number): Promise<boolean> {
    // Get game details to check minimum score
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('min_score')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;

    const qualified = score >= game.min_score;

    // Update game entry with score
    const { error: updateError } = await supabase
      .from('game_entries')
      .update({
        score,
        qualified,
      })
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return qualified;
  },

  // Get user's game entries
  async getUserGameEntries(userId: string): Promise<GameEntry[]> {
    const { data, error } = await supabase
      .from('game_entries')
      .select(`
        *,
        games (
          name,
          prize_pool
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};