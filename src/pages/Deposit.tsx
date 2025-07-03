import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Building, 
  Shield,
  Check,
  Apple,
  DollarSign
} from 'lucide-react';

const Deposit: React.FC = () => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
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
      color: 'from-steel-blue-500 to-steel-blue-600',
      available: true
    },
    {
      id: 'zelle',
      name: 'Zelle',
      description: 'Bank-to-bank transfer via Zelle',
      icon: Building,
      color: 'from-royal-blue-500 to-royal-blue-600',
      available: true
    },
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Secure payment with any major card',
      icon: CreditCard,
      color: 'from-steel-blue-500 to-royal-blue-600',
      available: true
    }
  ];

  const quickAmounts = [5, 10, 25, 50, 100];

  const handleDeposit = async () => {
    if (!selectedMethod || !amount || parseFloat(amount) < 1) {
      alert('Please select a payment method and enter a valid amount.');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      alert(`Successfully deposited $${amount} via ${paymentMethods.find(m => m.id === selectedMethod)?.name}!`);
      setIsProcessing(false);
      setAmount('');
      setSelectedMethod('');
    }, 3000);
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
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedMethod === method.id
                        ? 'border-royal-blue-500 bg-royal-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${method.color}`}>
                        <method.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {selectedMethod === method.id && (
                        <Check className="h-5 w-5 text-royal-blue-600" />
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
                        ? 'border-royal-blue-500 bg-royal-blue-50 text-royal-blue-700'
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-royal-blue-500 focus:border-transparent"
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
                  <span className="font-semibold">$0.00</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">New Balance</span>
                  <span className="font-bold text-steel-blue-600">
                    ${((user?.balance || 0) + parseFloat(amount || '0')).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleDeposit}
                disabled={!selectedMethod || !amount || isProcessing || parseFloat(amount || '0') < 1}
                className="w-full bg-gradient-to-r from-royal-blue-600 to-steel-blue-500 text-white py-3 rounded-xl font-semibold hover:from-royal-blue-700 hover:to-steel-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Add Funds</span>
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-steel-blue-50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-steel-blue-600" />
                  <span className="text-sm text-steel-blue-800 font-medium">
                    Secure & Encrypted
                  </span>
                </div>
                <p className="text-xs text-steel-blue-700 mt-1">
                  All payments are processed securely and your financial information is never stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;