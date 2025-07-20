import { supabase, type PlayerQRCode } from '../lib/supabase';

export const playerQRService = {
  // Get all QR codes for a player
  async getPlayerQRCodes(userId: string): Promise<PlayerQRCode[]> {
    const { data, error } = await supabase
      .from('player_qr_codes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching player QR codes:', error);
      throw error;
    }

    return data || [];
  },

  // Create tournament QR code
  async createTournamentQRCode(
    userId: string,
    tournamentId: string,
    gameName: string,
    prizeAmount: number = 5.00
  ): Promise<string> {
    const { data, error } = await supabase.rpc('create_tournament_qr_code', {
      p_user_id: userId,
      p_tournament_id: tournamentId,
      p_game_name: gameName,
      p_prize_amount: prizeAmount
    });

    if (error) {
      console.error('Error creating tournament QR code:', error);
      throw error;
    }

    return data;
  },

  // Create restaurant game QR code
  async createRestaurantGameQRCode(
    userId: string,
    gameId: string,
    gameName: string,
    prizeAmount: number
  ): Promise<string> {
    const { data, error } = await supabase.rpc('create_restaurant_game_qr_code', {
      p_user_id: userId,
      p_game_id: gameId,
      p_game_name: gameName,
      p_prize_amount: prizeAmount
    });

    if (error) {
      console.error('Error creating restaurant game QR code:', error);
      throw error;
    }

    return data;
  },

  // Redeem QR code
  async redeemQRCode(qrCode: string, restaurantId: string): Promise<any> {
    const { data, error } = await supabase.rpc('redeem_player_qr_code', {
      p_qr_code: qrCode,
      p_restaurant_id: restaurantId
    });

    if (error) {
      console.error('Error redeeming QR code:', error);
      throw error;
    }

    return data;
  }
};