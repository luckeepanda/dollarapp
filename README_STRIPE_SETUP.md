# Stripe Integration Setup Guide

This guide will help you set up Stripe payments with Apple Pay support in your Dollar App.

## 1. Stripe Account Setup

1. **Create a Stripe Account**
   - Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
   - Complete the registration process

2. **Get Your API Keys**
   - Navigate to [Developers > API Keys](https://dashboard.stripe.com/apikeys)
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Enable Apple Pay**
   - Go to [Settings > Payment Methods](https://dashboard.stripe.com/settings/payment_methods)
   - Enable "Apple Pay" under Digital Wallets
   - Add your domain for Apple Pay verification

## 2. Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

For Supabase Edge Functions, add these secrets in your Supabase dashboard:

```env
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 3. Supabase Edge Functions Setup

The following Edge Functions have been created:

### create-payment-intent
- **Purpose**: Creates Stripe payment intents for deposits
- **Endpoint**: `https://your-project.supabase.co/functions/v1/create-payment-intent`

### stripe-webhook
- **Purpose**: Handles Stripe webhook events to update user balances
- **Endpoint**: `https://your-project.supabase.co/functions/v1/stripe-webhook`

## 4. Webhook Configuration

1. **Create Webhook in Stripe Dashboard**
   - Go to [Developers > Webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - Set endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Select events to send:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

2. **Get Webhook Secret**
   - After creating the webhook, click on it
   - Copy the "Signing secret" (starts with `whsec_`)
   - Add this to your Supabase Edge Function secrets

## 5. Apple Pay Domain Verification

1. **Download Apple Pay Domain Verification File**
   - In Stripe Dashboard, go to Settings > Payment Methods
   - Under Apple Pay, click "Add Domain"
   - Download the verification file

2. **Host the Verification File**
   - Place the file at: `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`
   - Ensure it's accessible via HTTPS

3. **Verify Domain in Stripe**
   - Enter your domain in the Stripe dashboard
   - Click "Verify Domain"

## 6. Testing

### Test Cards
Use these test card numbers in development:

- **Visa**: 4242 4242 4242 4242
- **Visa (debit)**: 4000 0566 5566 5556
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005
- **Declined**: 4000 0000 0000 0002

### Apple Pay Testing
- Use Safari on macOS or iOS device
- Ensure you have a card set up in Apple Wallet
- Test in a secure context (HTTPS)

## 7. Production Checklist

Before going live:

1. **Switch to Live Keys**
   - Replace test keys (`pk_test_`, `sk_test_`) with live keys (`pk_live_`, `sk_live_`)

2. **Update Webhook Endpoint**
   - Create a new webhook endpoint for production
   - Update the webhook secret

3. **Verify Apple Pay Domain**
   - Ensure your production domain is verified for Apple Pay

4. **Test Real Payments**
   - Make small test transactions with real cards
   - Verify funds are properly credited to user accounts

## 8. Security Notes

- Never expose secret keys in client-side code
- Always validate webhook signatures
- Use HTTPS in production
- Regularly rotate API keys
- Monitor for suspicious activity

## 9. Troubleshooting

### Common Issues

1. **Apple Pay not showing**
   - Ensure you're on HTTPS
   - Verify domain is registered with Apple Pay
   - Check that user has cards in Apple Wallet

2. **Webhook not receiving events**
   - Verify webhook URL is correct
   - Check webhook secret matches
   - Ensure Edge Function is deployed

3. **Payment fails**
   - Check Stripe logs in dashboard
   - Verify API keys are correct
   - Ensure sufficient test funds

### Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Apple Pay Documentation](https://developer.apple.com/apple-pay/)