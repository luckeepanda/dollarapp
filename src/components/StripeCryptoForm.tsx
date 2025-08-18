import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { Coins, Loader, AlertCircle, Wallet, QrCode } from 'lucide-react';

interface StripeCryptoFormProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

const StripeCryptoForm: React.FC<StripeCryptoFormProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showWalletInfo, setShowWalletInfo] = useState(false);

  // Handle crypto payment with proper elements.submit() flow
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('Processing USDC crypto payment...');

      // Step 1: Submit the form to validate the payment element
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        console.error('Elements submit error:', submitError);
        onError(submitError.message || 'Payment form validation failed');
        return;
      }

      // Step 2: Create crypto payment intent using Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-crypto-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usdc',
          network: 'solana',
          userId: user.id,
          settlementCurrency: 'usd',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create crypto payment intent');
      }

      const { client_secret } = await response.json();

      // Step 3: Confirm payment with the client secret
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: client_secret,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.origin + '/deposit',
        },
      });

      if (error) {
        console.error('Crypto payment failed:', error);
        onError(error.message || 'Crypto payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Crypto payment succeeded:', paymentIntent.id);
        onSuccess(paymentIntent);
      } else {
        onError('Crypto payment was not completed successfully');
      }
    } catch (err: any) {
      console.error('Crypto payment error:', err);
      onError(err.message || 'Crypto payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Crypto Payment Info */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Coins className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">USDC on Solana</h3>
            <p className="text-sm text-purple-700">Fast, low-cost crypto payments</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-purple-600 font-medium">Network:</span>
            <span className="text-purple-800 ml-1">Solana</span>
          </div>
          <div>
            <span className="text-purple-600 font-medium">Fee:</span>
            <span className="text-purple-800 ml-1">1.5%</span>
          </div>
          <div>
            <span className="text-purple-600 font-medium">Settlement:</span>
            <span className="text-purple-800 ml-1">USD</span>
          </div>
          <div>
            <span className="text-purple-600 font-medium">Limit:</span>
            <span className="text-purple-800 ml-1">$10k/tx</span>
          </div>
        </div>
      </div>

      {/* Wallet Connection Info */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <button
          onClick={() => setShowWalletInfo(!showWalletInfo)}
          className="flex items-center space-x-2 text-blue-800 font-medium"
        >
          <Wallet className="h-4 w-4" />
          <span>How Crypto Payments Work</span>
        </button>
        
        {showWalletInfo && (
          <div className="mt-3 text-sm text-blue-700 space-y-2">
            <p>• You'll be redirected to crypto.link.com to connect your wallet</p>
            <p>• Supports popular wallets like Phantom, Solflare, and others</p>
            <p>• QR code available for mobile wallet scanning</p>
            <p>• Payment settles as USD in your Dollar App balance</p>
            <p>• Transaction typically confirms within seconds</p>
          </div>
        )}
      </div>

      {/* Crypto Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Coins className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-gray-900">USDC Payment</span>
          </div>
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-2xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border border-purple-400/30"
        >
          {isProcessing ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Processing USDC Payment...</span>
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              <span>Pay ${amount.toFixed(2)} with USDC</span>
            </>
          )}
        </button>
      </form>

      {/* Important Notes */}
      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• USDC payments are available for US businesses only</li>
          <li>• Crypto payments cannot be refunded - use fiat for refundable transactions</li>
          <li>• Network fees may apply from your wallet provider</li>
          <li>• Payment settles as USD in your account balance</li>
        </ul>
      </div>
    </div>
  );
};

export default StripeCryptoForm;