import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export { stripePromise };

export const STRIPE_CONFIG = {
  // Payment Intent configuration for fiat payments
  paymentIntent: {
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never'
    },
  },
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
    networks: ['solana', 'ethereum', 'polygon', 'base'],
    preferredNetwork: 'solana',
    settlementCurrency: 'usd', // Settle as fiat USD
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
    theme: 'flat' as const,
    variables: {
      colorPrimary: '#FF6B35', // Dollar App orange
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Poppins, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
};

// Crypto payment configuration for Elements
export const CRYPTO_CONFIG = {
  appearance: {
    theme: 'flat' as const,
    variables: {
      colorPrimary: '#FF6B35', // Dollar App orange
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Poppins, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
  // Crypto-specific configuration
  paymentMethodCreation: 'manual',
  paymentMethodTypes: ['crypto'],
};