import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DollarSign, Plus, AlertCircle, CheckCircle, User } from 'lucide-react';

const AdminTestCredits: React.FC = () => {
  const { user, updateBalance } = useAuth();
  const [targetUserId, setTargetUserId] = useState('');
  const [amount, setAmount] = useState('10');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, account_type, balance')
        .eq('email', searchEmail.trim().toLowerCase())
        .single();

      if (error || !data) {
        setMessage({ type: 'error', text: 'User not found' });
        setFoundUser(null);
        return;
      }

      setFoundUser(data);
      setTargetUserId(data.id);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching for user' });
      setFoundUser(null);
    }
  };

  const addTestCredits = async () => {
    if (!user || user.accountType !== 'admin') {
      setMessage({ type: 'error', text: 'Admin access required' });
      return;
    }

    if (!targetUserId || !amount) {
      setMessage({ type: 'error', text: 'Please select a user and enter an amount' });
      return;
    }

    const creditAmount = parseFloat(amount);
    if (creditAmount <= 0 || creditAmount > 1000) {
      setMessage({ type: 'error', text: 'Amount must be between $0.01 and $1000' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      // Use the admin function to add test credits
      const { error } = await supabase.rpc('admin_add_test_credits', {
        target_user_id: targetUserId,
        amount: creditAmount,
        admin_user_id: user.id
      });

      if (error) {
        throw error;
      }

      // If adding credits to self, update local balance
      if (targetUserId === user.id) {
        updateBalance(user.balance + creditAmount);
      }

      // Update found user display
      if (foundUser) {
        setFoundUser({
          ...foundUser,
          balance: foundUser.balance + creditAmount
        });
      }

      setMessage({ 
        type: 'success', 
        text: `Successfully added $${creditAmount} to ${foundUser?.username || 'user'}'s account` 
      });
      
      setAmount('10');
    } catch (error: any) {
      console.error('Failed to add test credits:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to add test credits' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addToSelf = () => {
    if (user) {
      setTargetUserId(user.id);
      setFoundUser({
        id: user.id,
        email: user.email,
        username: user.username,
        account_type: user.accountType,
        balance: user.balance
      });
      setSearchEmail(user.email);
      setMessage(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Add to Self */}
      <div className="flex items-center space-x-3">
        <button
          onClick={addToSelf}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <User className="h-4 w-4" />
          <span>Add to My Account</span>
        </button>
        <span className="text-red-800 text-sm">or search for another user:</span>
      </div>

      {/* User Search */}
      <div className="flex space-x-3">
        <div className="flex-1">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            placeholder="Enter user email to search"
          />
        </div>
        <button
          onClick={searchUser}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Found User Display */}
      {foundUser && (
        <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-400">{foundUser.username}</p>
              <p className="text-sm text-red-600">{foundUser.email}</p>
              <p className="text-sm text-red-600">
                {foundUser.account_type} • Balance: ${foundUser.balance.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                Selected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Amount Input and Add Button */}
      <div className="flex space-x-3">
        <div className="flex-1">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
              placeholder="Amount to add"
              min="0.01"
              max="1000"
              step="0.01"
            />
          </div>
        </div>
        <button
          onClick={addTestCredits}
          disabled={isProcessing || !foundUser}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Add Credits</span>
            </>
          )}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-500/20 border-green-400/30 text-green-200' 
            : 'bg-red-500/30 border-red-400/40 text-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <p className="text-yellow-600 text-sm">
            <strong>Admin Only:</strong> This feature is for testing purposes only and is restricted to admin accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTestCredits;