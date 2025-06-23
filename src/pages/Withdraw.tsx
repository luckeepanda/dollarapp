import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Building, 
  DollarSign, 
  Clock, 
  Shield,
  AlertCircle,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';

const Withdraw: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const minWithdrawal = 10;
  const maxWithdrawal = user?.balance || 0;

  const handleWithdraw = async () => {
    if (!user?.isKYCVerified) {
      alert('KYC verification required for withdrawals. Please complete verification first.');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < minWithdrawal || withdrawAmount > maxWithdrawal) {
      alert(`Please enter an amount between $${minWithdrawal} and $${maxWithdrawal.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);

    // Simulate withdrawal processing
    setTimeout(() => {
      alert(`Withdrawal request for $${amount} submitted successfully! Processing will take 1-2 business days.`);
      setIsProcessing(false);
      setAmount('');
    }, 2000);
  };

  const quickAmounts = [25, 50, 100, Math.floor(maxWithdrawal)].filter(amt => amt >= minWithdrawal && amt <= maxWithdrawal);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link 
            to="/restaurant/dashboard"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
            <p className="text-gray-600">Transfer your earnings to your bank account</p>
          </div>
        </div>

        {/* KYC Status Alert */}
        {!user?.isKYCVerified && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800 mb-2">KYC Verification Required</h3>
                <p className="text-orange-700 mb-4">
                  To comply with financial regulations, you must complete identity verification before withdrawing funds.
                </p>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Complete Verification
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h2 className="text-xl font-semibold mb-4">Withdrawal Details</h2>
              
              {/* Amount Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Withdrawal Amount
                </label>
                
                {/* Quick Amount Buttons */}
                {quickAmounts.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {quickAmounts.map((quickAmount) => (
                      <button
                        key={quickAmount}
                        onClick={() => setAmount(quickAmount.toString())}
                        disabled={!user?.isKYCVerified}
                        className={`p-3 rounded-xl border-2 transition-all disabled:opacity-50 ${
                          amount === quickAmount.toString()
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        ${quickAmount}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Amount Input */}
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!user?.isKYCVerified}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50"
                    placeholder="Enter custom amount"
                    min={minWithdrawal}
                    max={maxWithdrawal}
                    step="0.01"
                  />
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  Minimum withdrawal: ${minWithdrawal} • Available: ${maxWithdrawal.toFixed(2)}
                </p>
              </div>

              {/* Bank Account Info */}
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Building className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Bank Account</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Chase Bank ****1234</p>
                  <p>Checking Account</p>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Change Account
                  </button>
                </div>
              </div>

              {/* Processing Time Info */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Processing Time</span>
                </div>
                <p className="text-sm text-blue-800">
                  Withdrawals typically take 1-2 business days to appear in your bank account.
                </p>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!user?.isKYCVerified || !amount || isProcessing || parseFloat(amount || '0') < minWithdrawal}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    <span>Withdraw Funds</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summary & Info */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8 mb-6">
              <h2 className="text-xl font-semibold mb-4">Withdrawal Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Balance</span>
                  <span className="font-semibold">${user?.balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Withdrawal Amount</span>
                  <span className="font-semibold">${amount || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">You'll Receive</span>
                  <span className="font-bold text-green-600">
                    ${amount || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Balance</span>
                  <span className="font-semibold">
                    ${((user?.balance || 0) - parseFloat(amount || '0')).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="p-3 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    Secure Transfer
                  </span>
                </div>
                <p className="text-xs text-green-700">
                  All withdrawals are processed through encrypted banking networks with full transaction monitoring.
                </p>
              </div>
            </div>

            {/* Withdrawal History Preview */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold mb-4">Recent Withdrawals</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">$234.50</p>
                    <p className="text-gray-600">Jan 14, 2024</p>
                  </div>
                  <span className="text-green-600 flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Completed</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">$156.25</p>
                    <p className="text-gray-600">Jan 12, 2024</p>
                  </div>
                  <span className="text-yellow-600 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Processing</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;