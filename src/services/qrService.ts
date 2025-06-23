import { supabase, type QRCode } from '../lib/supabase';

export const qrService = {
  // Generate QR code for prize winner
  async generateQRCode(userId: string, gameId: string, amount: number): Promise<string> {
    const code = `QR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const { error } = await supabase
      .from('qr_codes')
      .insert([
        {
          code,
          user_id: userId,
          game_id: gameId,
          amount,
          is_redeemed: false,
        },
      ]);

    if (error) throw error;
    return code;
  },

  // Validate and redeem QR code
  async redeemQRCode(code: string, restaurantId: string): Promise<{ valid: boolean; amount?: number; customer?: string }> {
    // Get QR code details
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        users!qr_codes_user_id_fkey (username)
      `)
      .eq('code', code)
      .eq('is_redeemed', false)
      .single();

    if (error || !qrCode) {
      return { valid: false };
    }

    // Mark as redeemed
    const { error: redeemError } = await supabase
      .from('qr_codes')
      .update({
        is_redeemed: true,
        redeemed_by: restaurantId,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', qrCode.id);

    if (redeemError) throw redeemError;

    // Add funds to restaurant balance
    const { error: balanceError } = await supabase.rpc('add_balance', {
      user_id: restaurantId,
      amount: qrCode.amount,
    });

    if (balanceError) throw balanceError;

    return {
      valid: true,
      amount: qrCode.amount,
      customer: qrCode.users.username,
    };
  },

  // Get restaurant's redemption history
  async getRedemptionHistory(restaurantId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        users!qr_codes_user_id_fkey (username)
      `)
      .eq('redeemed_by', restaurantId)
      .eq('is_redeemed', true)
      .order('redeemed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};