import { supabase } from '../lib/supabase';
import { playerQRService } from './playerQRService';

export interface RestaurantGame {
  id: string;
  business_id: string;
  name: string;
  description: string;
  entry_fee: number;
  game_type?: string;
  max_players: number;
  current_players: number;
  prize_pool: number;
  min_score: number;
  status: 'active' | 'completed' | 'cancelled';
  winner_id?: string;
  winning_score?: number;
  qr_code?: string;
  qr_redeemed: boolean;
  image_url?: string;
  emoji?: string;
  created_at: string;
  completed_at?: string;
  business?: {
    username: string;
  };
}

export interface RestaurantGameEntry {
  id: string;
  game_id: string;
  user_id: string;
  score: number;
  completed_at: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export interface GameResult {
  game_completed: boolean;
  winner_id?: string;
  winning_score?: number;
  qr_code?: string;
  your_score: number;
  qualified: boolean;
  entries_count: number;
  max_players: number;
  entry_number?: number;
  game_name?: string;
  prize_pool?: number;
}

export const restaurantGameService = {
  // Create a new restaurant game
  async createGame(
    businessId: string,
    name: string,
    description: string,
    entryFee: number,
    maxPlayers: number = 1,
    minScore: number = 0,
    gameType: string = 'flappy_bird',
    emoji: string = '🍔'
  ): Promise<string> {
    const { data, error } = await supabase.rpc('create_restaurant_game', {
      p_business_id: businessId,
      p_name: name,
      p_description: description,
      p_entry_fee: entryFee,
      p_max_players: 1, // Always single player
      p_min_score: minScore,
      p_game_type: gameType,
      p_emoji: emoji
    });

    if (error) {
      console.error('Error creating restaurant game:', error);
      throw error;
    }

    return data;
  },

  // Get all active restaurant games
  async getActiveGames(): Promise<RestaurantGame[]> {
    const { data, error } = await supabase
      .from('restaurant_games')
      .select(`
        *,
        business:profiles!restaurant_games_business_id_fkey(username)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active games:', error);
      throw error;
    }

    return data || [];
  },

  // Get restaurant's games
  async getBusinessGames(businessId: string): Promise<RestaurantGame[]> {
    const { data, error } = await supabase
      .from('restaurant_games')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurant games:', error);
      throw error;
    }

    return data || [];
  },

  // Delete a restaurant game
  async deleteGame(gameId: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_games')
      .delete()
      .eq('id', gameId);

    if (error) {
      console.error('Error deleting restaurant game:', error);
      throw error;
    }
  },

  // Join a restaurant game
  async joinGame(gameId: string, userId: string): Promise<boolean> {
    const { error } = await supabase.rpc('join_restaurant_game', {
      p_game_id: gameId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error joining restaurant game:', error);
      throw error;
    }

    return true;
  },

  // Submit score to restaurant game
  async submitScore(gameId: string, userId: string, score: number): Promise<GameResult> {
    const { data, error } = await supabase.rpc('submit_restaurant_game_score', {
      p_game_id: gameId,
      p_user_id: userId,
      p_score: score
    });

    if (error) {
      console.error('Error submitting restaurant game score:', error);
      throw error;
    }

    // If game is completed and user is the winner, create QR code in player_qr_codes table
    if (data && data.game_completed && data.winner_id === userId) {
      try {
        console.log('Creating restaurant game QR code for winner:', userId);
        // Use game details from the RPC response
        if (data.game_name && data.prize_pool !== undefined) {
          const qrCode = await playerQRService.createRestaurantGameQRCode(
            userId,
            gameId,
            data.game_name,
            data.prize_pool
          );
          
          // Add QR code to the result
          data.qr_code = qrCode;
          console.log('Restaurant game QR code created successfully:', qrCode);
        } else {
          console.error('Game details missing from response when creating QR code');
          throw new Error('Game completed but QR code creation failed. Please contact support.');
        }
      } catch (qrError) {
        console.error('Failed to create restaurant game QR code:', qrError);
        // Don't fail the game completion if QR creation fails
        throw new Error('Game completed but QR code creation failed. Please contact support.');
      }
    }

    return data;
  },

  // Get game entries/results
  async getGameEntries(gameId: string): Promise<RestaurantGameEntry[]> {
    const { data, error } = await supabase
      .from('restaurant_game_entries')
      .select(`
        *,
        profiles(username)
      `)
      .eq('game_id', gameId)
      .order('score', { ascending: false });

    if (error) {
      console.error('Error fetching game entries:', error);
      throw error;
    }

    return data || [];
  },

  // Get game details
  async getGame(gameId: string): Promise<RestaurantGame | null> {
    const { data, error } = await supabase
      .from('restaurant_games')
      .select(`
        *,
        business:profiles!restaurant_games_business_id_fkey(username)
      `)
      .eq('id', gameId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching game:', error);
      throw error;
    }

    return data || null;
  },

  // Check if user has already played this game
  async hasUserPlayed(gameId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('restaurant_game_entries')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking user participation:', error);
      return false;
    }

    return (data && data.length > 0);
  },

  // Get user's entry count for a game
  async getUserEntryCount(gameId: string, userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('restaurant_game_entries')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user entry count:', error);
      return 0;
    }

    return data ? data.length : 0;
  },

  // Get user's best score for a game
  async getUserBestScore(gameId: string, userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_user_best_score_for_game', {
      p_game_id: gameId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error getting user best score:', error);
      return 0;
    }

    return data || 0;
  },

  // Redeem QR code
  async redeemQR(qrCode: string, businessId: string, approved: boolean = true, rejectionReason?: string): Promise<any> {
    // Use the existing player QR service for redemption
    return await playerQRService.redeemQRCode(qrCode, businessId, approved, rejectionReason);
  }
};