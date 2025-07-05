import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Building, 
  Shield,
  Check,
  Apple,
  DollarSign,
  Zap
} from 'lucide-react';

const Deposit: React.FC = () => {
  const { user, updateBalance } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'dummy_pay',
      name: 'Dummy Pay',
      description: 'Instant test payment - adds funds immediately',
      icon: Zap,
      color: 'from-purple-500 to-pink-600',
      available: true,
      isTest: true
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      description: 'Quick and secure payment with Touch ID',
      icon: Apple,
      color: 'from-gray-700 to-black',
      available: true
    },
    {
      id: 'cash_app',
      name: 'Cash App',
      description: 'Pay with your Cash App balance or card',
      icon: Smartphone,
      color: 'from-green-500 to-green-600',
      available: true
    },
    {
      id: 'zelle',
      name: 'Zelle',
      description: 'Bank-to-bank transfer via Zelle',
      icon: Building,
      color: 'from-purple-500 to-purple-600',
      available: true
    },
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Secure payment with any major card',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      available: true
    }
  ];

  const quickAmounts = [5, 10, 25, 50, 100];

  const handleDeposit = async () => {
    if (!selectedMethod || !amount || parseFloat(amount) < 1) {
      alert('Please select a payment method and enter a valid amount.');
      return;
    }

    if (!user) {
      alert('User not found. Please log in again.');
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedMethod === 'dummy_pay') {
        // Handle Dummy Pay - actually update the balance in Supabase
        const depositAmount = parseFloat(amount);
        
        // Update balance in Supabase using the add_balance function
        const { error } = await supabase.rpc('add_balance', {
          user_id: user.id,
          amount: depositAmount
        });

        if (error) {
          throw error;
        }

        // Update local state
        updateBalance(user.balance + depositAmount);

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              type: 'deposit',
              amount: depositAmount,
              status: 'completed',
              payment_method: 'Dummy Pay'
            }
          ]);

        if (transactionError) {
          console.error('Failed to create transaction record:', transactionError);
          // Don't throw here as the balance was already updated
        }

        alert(`✅ Successfully deposited $${amount} via Dummy Pay! Your new balance is $${(user.balance + depositAmount).toFixed(2)}`);
        setAmount('');
        setSelectedMethod('');
      } else {
        // Simulate other payment methods
        setTimeout(() => {
          alert(`Successfully deposited $${amount} via ${paymentMethods.find(m => m.id === selectedMethod)?.name}!`);
          setIsProcessing(false);
          setAmount('');
          setSelectedMethod('');
        }, 3000);
        return; // Exit early for simulated payments
      }
    } catch (error: any) {
      console.error('Deposit failed:', error);
      alert(`Deposit failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link 
            to="/player/dashboard"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Funds</h1>
            <p className="text-gray-600">Choose your preferred payment method</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
              <div className="grid gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {method.isTest && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          TEST
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${method.color}`}>
                        <method.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        {method.isTest && (
                          <p className="text-xs text-purple-600 font-medium mt-1">
                            ⚡ Instantly adds funds to your account
                          </p>
                        )}
                      </div>
                      {selectedMethod === method.id && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Select Amount</h2>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-5 gap-3 mb-4">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      amount === quickAmount.toString()
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter custom amount"
                  min="1"
                  step="0.01"
                />
              </div>

              <p className="text-sm text-gray-600 mt-2">
                Minimum deposit: $1.00
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance</span>
                  <span className="font-semibold">${user?.balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit Amount</span>
                  <span className="font-semibold">${amount || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-semibold">
                    {selectedMethod === 'dummy_pay' ? '$0.00' : '$0.00'}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">New Balance</span>
                  <span className="font-bold text-green-600">
                    ${((user?.balance || 0) + parseFloat(amount || '0')).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleDeposit}
                disabled={!selectedMethod || !amount || isProcessing || parseFloat(amount || '0') < 1}
                className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-2xl font-bold hover:from-blue-700 hover:to-green-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border border-blue-400/30"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : selectedMethod === 'dummy_pay' ? (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Add Funds Instantly</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Add Funds</span>
                  </>
                )}
              </button>

              {/* Payment Method Info */}
              {selectedMethod === 'dummy_pay' && (
                <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-800 font-medium">
                      Test Payment Method
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mt-1">
                    This instantly adds funds to your account for testing purposes. Real payment processing is simulated for other methods.
                  </p>
                </div>
              )}

              {/* Security Notice */}
              {selectedMethod !== 'dummy_pay' && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                      Secure & Encrypted
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    All payments are processed securely and your financial information is never stored.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;