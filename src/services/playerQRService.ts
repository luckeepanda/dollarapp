import { supabase, type PlayerQRCode } from '../lib/supabase';

export const playerQRService = {
  // Get all QR codes for a player
  async getPlayerQRCodes(userId: string): Promise<PlayerQRCode[]> {
    console.log('Fetching QR codes for user:', userId);
    
    const { data, error } = await supabase
      .from('player_qr_codes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching player QR codes:', error);
      throw error;
    }

    console.log('Found QR codes:', data?.length || 0);
    return data || [];
  },

  // Create tournament QR code
  async createTournamentQRCode(
    userId: string,
    tournamentId: string,
    gameName: string,
    prizeAmount: number = 5.00
  ): Promise<string> {
    console.log('Creating tournament QR code:', { userId, tournamentId, gameName, prizeAmount });
    
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

    console.log('Tournament QR code created:', data);
    return data;
  },

  // Create restaurant game QR code
  async createRestaurantGameQRCode(
    userId: string,
    gameId: string,
    gameName: string,
    prizeAmount: number
  ): Promise<string> {
    console.log('Creating restaurant game QR code:', { userId, gameId, gameName, prizeAmount });
    
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

    console.log('Restaurant game QR code created:', data);
    return data;
  },

  // Redeem QR code
  async redeemQRCode(qrCode: string, restaurantId: string, approved: boolean = true, rejectionReason?: string): Promise<any> {
    const { data, error } = await supabase.rpc('redeem_player_qr_code', {
      p_qr_code: qrCode,
      p_restaurant_id: restaurantId,
      p_approved: approved,
      p_rejection_reason: rejectionReason
    });

    if (error) {
      console.error('Error redeeming QR code:', error);
      throw error;
    }

    return data;
  },

  // Remove rejected QR code
  async removeRejectedQRCode(qrCode: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('remove_rejected_qr_code', {
      p_qr_code: qrCode,
      p_user_id: userId
    });

    if (error) {
      console.error('Error removing rejected QR code:', error);
      throw error;
    }

    return data;
  }
};