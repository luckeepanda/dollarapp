import { supabase } from '../lib/supabase';

export const paymentService = {
  // Add funds to user account
  async addFunds(userId: string, amount: number, paymentMethod: string): Promise<void> {
    // In a real app, you'd integrate with Stripe/payment processor here
    // For now, we'll simulate the payment and add funds directly
    
    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'deposit',
          amount,
          status: 'completed',
          payment_method: paymentMethod,
        },
      ]);

    if (transactionError) throw transactionError;

    // Add funds to user balance
    const { error: balanceError } = await supabase.rpc('add_balance', {
      user_id: userId,
      amount,
    });

    if (balanceError) throw balanceError;
  },

  // Withdraw funds (for restaurants)
  async withdrawFunds(userId: string, amount: number): Promise<void> {
    // Create withdrawal transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'withdrawal',
          amount,
          status: 'pending',
        },
      ]);

    if (transactionError) throw transactionError;

    // Deduct from user balance
    const { error: balanceError } = await supabase.rpc('deduct_balance', {
      user_id: userId,
      amount,
    });

    if (balanceError) throw balanceError;
  },

  // Get user transactions
  async getUserTransactions(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};