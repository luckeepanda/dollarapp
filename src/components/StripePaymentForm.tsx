import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { Apple, CreditCard, Loader } from 'lucide-react';

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
  const [canMakePayment, setCanMakePayment] = useState(false);

  // Apple Pay / Google Pay setup
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Dollar App Deposit',
          amount: Math.round(amount * 100), // Convert to cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });
      setPaymentRequest(pr);
    }
  }, [stripe, amount]);

  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.canMakePayment().then((result) => {
        if (result) {
          setCanMakePayment(true);
        }
      });
    }
  }, [paymentRequest]);

  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.on('paymentmethod', async (event) => {
        if (!stripe) return;

        setIsProcessing(true);
        try {
          // Create payment intent on your backend
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: Math.round(amount * 100),
              currency: 'usd',
              userId: user?.id,
              paymentMethodId: event.paymentMethod.id,
            }),
          });

          const { client_secret } = await response.json();

          // Confirm payment
          const { error, paymentIntent } = await stripe.confirmCardPayment(
            client_secret,
            {
              payment_method: event.paymentMethod.id,
            }
          );

          if (error) {
            event.complete('fail');
            onError(error.message || 'Payment failed');
          } else {
            event.complete('success');
            onSuccess(paymentIntent);
          }
        } catch (err: any) {
          event.complete('fail');
          onError(err.message || 'Payment failed');
        } finally {
          setIsProcessing(false);
        }
      });
    }
  }, [paymentRequest, stripe, amount, user?.id, onSuccess, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'usd',
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { client_secret } = await response.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: client_secret,
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err: any) {
      onError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Apple Pay / Google Pay Button */}
      {canMakePayment && paymentRequest && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Quick Payment</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-xl">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Apple className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Apple Pay & Google Pay</span>
            </div>
            <PaymentRequestButtonElement
              options={{
                paymentRequest,
                style: {
                  paymentRequestButton: {
                    type: 'default',
                    theme: 'dark',
                    height: '48px',
                  },
                },
              }}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or pay with card</span>
            </div>
          </div>
        </div>
      )}

      {/* Regular Card Payment Form */}
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