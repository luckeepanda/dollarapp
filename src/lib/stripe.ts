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
  // Crypto configuration for USDC on Solana
  crypto: {
    currency: 'usdc',
    network: 'solana',
    settlementCurrency: 'usd', // Settle as fiat USD
    supportedNetworks: ['solana', 'ethereum', 'polygon', 'base'],
    limits: {
      maxPerTransaction: 10000, // $10k per transaction
      maxPerMonth: 100000, // $100k per month
    },
    fees: {
      percentage: 1.5, // 1.5% fee for crypto payments
    },
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

// Crypto payment configuration
export const CRYPTO_CONFIG = {
  mode: 'payment' as const,
  currency: 'usdc',
  payment_method_types: ['crypto'],
  crypto: {
    network: 'solana',
  },
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#FF6B35', // Dollar App orange
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      fontFamily: 'Poppins, system-ui, sans-serif',
      borderRadius: '8px',
    },
  },
};