import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export { stripePromise };

export const STRIPE_CONFIG = {
  // Apple Pay configuration
  applePay: {
    country: 'US',
    currency: 'usd',
    requestPayerName: true,
    requestPayerEmail: true,
  },
  // General payment configuration
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2B69E5',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
};