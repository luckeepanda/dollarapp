# Stripe USDC Crypto Payment Integration Guide

This guide explains how to set up USDC cryptocurrency payments on Solana network using Stripe, which settle as USD in user balances.

## 1. Stripe Dashboard Setup (CRITICAL FIRST STEP)

### Enable Crypto Payments
1. **Log into Stripe Dashboard**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Navigate to **Settings > Payment Methods**

2. **Request Crypto Access**
   - Scroll to "Digital Wallets" section
   - Find "Crypto" and click **"Request Access"**
   - Fill out the crypto onboarding form
   - **Important:** Only US businesses are eligible for crypto payments

3. **Wait for Approval**
   - Stripe will review your request (typically 1-3 business days)
   - You'll receive an email when crypto payments are enabled
   - Status will show as "Enabled" in Payment Methods

4. **Configure Crypto Settings**
   - Once approved, go to **Settings > Crypto**
   - Enable USDC on desired networks (Solana recommended)
   - Set settlement currency to USD
   - Review fee structure (1.5% for crypto payments)

## 2. Environment Variables

Add these to your `.env` file (same as existing Stripe setup):

```env
# Stripe Configuration (existing)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here

# For Supabase Edge Functions (existing)
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Note:** No additional environment variables needed - crypto uses the same Stripe keys.

## 3. How It Works

### Payment Flow
1. **User selects USDC payment** in the deposit page
2. **Stripe Checkout redirect** to crypto.link.com for wallet connection
3. **Wallet connection** - Users connect Phantom, Solflare, or other Solana wallets
4. **QR code option** - Mobile users can scan QR code with wallet app
5. **Payment confirmation** - USDC is sent, settles as USD in your Stripe account
6. **Webhook processing** - User balance is updated in Dollar App database

### Technical Implementation
- **Frontend:** Stripe Checkout redirect (no complex wallet integration needed)
- **Backend:** Supabase Edge Functions handle checkout session creation
- **Settlement:** All crypto payments settle as USD (no crypto holding)
- **Fees:** 1.5% processing fee (higher than card payments)

## 4. Supported Networks & Wallets

### Networks
- ✅ **Solana** (recommended - lowest fees)
- ✅ **Ethereum** (higher network fees)
- ✅ **Polygon** (moderate fees)
- ✅ **Base** (Coinbase's L2)

### Popular Wallets
- **Solana:** Phantom, Solflare, Backpack
- **Ethereum:** MetaMask, Coinbase Wallet, WalletConnect
- **Multi-chain:** Trust Wallet, Ledger Live

## 5. Testing

### Test Mode
1. **Use Stripe test keys** (pk_test_, sk_test_)
2. **Test crypto payments** in Stripe Dashboard test mode
3. **Simulate transactions** using Stripe's test environment
4. **Verify webhooks** receive test events properly

### Test Flow
1. Select USDC payment option
2. Redirected to crypto.link.com test environment
3. Connect test wallet or use demo mode
4. Complete test transaction
5. Verify balance update in Dollar App

## 6. Production Checklist

### Before Going Live
- [ ] **Crypto payments enabled** in Stripe Dashboard (production)
- [ ] **Business verification complete** (required for crypto)
- [ ] **Live API keys** updated in environment variables
- [ ] **Webhook endpoints** configured for production
- [ ] **Test transactions** completed successfully
- [ ] **Settlement currency** confirmed as USD
- [ ] **Fee structure** reviewed and accepted

### Compliance Requirements
- [ ] **US business entity** (required for Stripe crypto)
- [ ] **Business bank account** for USD settlement
- [ ] **Tax reporting** setup for crypto transactions
- [ ] **Terms of service** updated to mention crypto payments
- [ ] **Customer support** trained on crypto payment flow

## 7. Limitations & Considerations

### Business Requirements
- **US businesses only** - Stripe crypto is not available internationally
- **Business verification** - Enhanced verification required
- **Settlement only** - Cannot hold crypto, must settle to USD
- **No refunds** - Crypto payments cannot be refunded (use fiat for refundable items)

### Transaction Limits
- **Per transaction:** $10,000 USD equivalent
- **Per month:** $100,000 USD equivalent
- **Minimum:** $1.00 USD equivalent

### User Experience
- **Wallet required** - Users need a crypto wallet
- **Network fees** - Users pay blockchain network fees
- **Confirmation time** - Varies by network (Solana ~1 second, Ethereum ~15 seconds)
- **Mobile support** - QR code scanning for mobile wallets

## 8. Error Handling

### Common Issues
1. **"Crypto not enabled"** - Business hasn't been approved for crypto
2. **"Unsupported network"** - Network not enabled in Stripe settings
3. **"Wallet connection failed"** - User needs to install/connect wallet
4. **"Insufficient funds"** - User doesn't have enough USDC
5. **"Network congestion"** - Blockchain network is slow/expensive

### Fallback Strategy
- Always offer card payment as backup
- Clear error messages directing users to alternative payment methods
- Support contact information for payment issues

## 9. Monitoring & Analytics

### Key Metrics
- **Crypto adoption rate** - % of users choosing crypto vs card
- **Completion rate** - % of crypto payments that complete successfully
- **Average transaction size** - Crypto vs card payment amounts
- **Network preference** - Which blockchain networks users prefer
- **Error rates** - Failed crypto payments by reason

### Stripe Dashboard
- Monitor crypto payment volume in Stripe Dashboard
- Review settlement reports for USD conversion rates
- Track fee costs (1.5% vs 2.9% for cards)
- Monitor dispute/chargeback rates (crypto has none)

## 10. Support & Troubleshooting

### For Users
- **Wallet setup guides** - Links to Phantom, MetaMask setup
- **Network fee explanations** - Why users pay blockchain fees
- **Transaction status** - How to check payment confirmation
- **Refund policy** - Crypto payments cannot be refunded

### For Business
- **Stripe support** - Contact Stripe for crypto payment issues
- **Settlement timing** - USD funds available next business day
- **Tax implications** - Crypto payments are taxable events
- **Compliance** - Maintain records for regulatory requirements

## 11. Future Enhancements

### Potential Additions
- **More cryptocurrencies** - USDT, ETH (when Stripe supports)
- **More networks** - Arbitrum, Optimism (when available)
- **Wallet integration** - Direct wallet connect (advanced)
- **Crypto rewards** - Pay winners in crypto (if regulations allow)

### Integration Opportunities
- **Coinbase Commerce** - Alternative crypto processor
- **Circle APIs** - Direct USDC integration
- **Solana Pay** - Native Solana payment protocol
- **Web3 wallets** - Enhanced wallet connection experience

---

**Important:** This integration requires Stripe crypto approval and is only available to US businesses. Always test thoroughly in Stripe's test environment before going live.