import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { Apple, CreditCard, Loader, AlertCircle } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');


  // Handle regular card payment
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('Processing card payment...');

      // Create payment intent using Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'usd',
          userId: user.id,
          paymentMethodType: 'card',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { client_secret } = await response.json();

      // Confirm payment with card
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: client_secret,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.origin + '/deposit',
        },
      });

      if (error) {
        console.error('Card payment failed:', error);
        onError(error.message || 'Card payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Card payment succeeded:', paymentIntent.id);
        onSuccess(paymentIntent);
      } else {
        onError('Payment was not completed successfully');
      }
    } catch (err: any) {
      console.error('Card payment error:', err);
      onError(err.message || 'Card payment failed');
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


      {/* Card Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Card Details</span>
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
          className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-2xl font-bold hover:from-blue-700 hover:to-green-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border border-blue-400/30"
        >
          {isProcessing ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              <span>Pay ${amount.toFixed(2)}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default StripePaymentForm;