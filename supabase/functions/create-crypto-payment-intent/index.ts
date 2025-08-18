import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CryptoPaymentIntentRequest {
  amount: number
  currency: string
  network: string
  userId: string
  settlementCurrency: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { amount, currency, network, userId, settlementCurrency }: CryptoPaymentIntentRequest = await req.json()

    // Validate the request
    if (!amount || !currency || !network || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, currency, network, userId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate minimum amount ($1.00)
    if (amount < 100) {
      return new Response(
        JSON.stringify({ error: 'Minimum deposit amount is $1.00' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate supported currency and network
    if (currency !== 'usdc') {
      return new Response(
        JSON.stringify({ error: 'Only USDC is supported for crypto payments' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!['solana', 'ethereum', 'polygon', 'base'].includes(network)) {
      return new Response(
        JSON.stringify({ error: 'Unsupported network. Supported: solana, ethereum, polygon, base' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify user exists in our database
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, username')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Creating crypto payment intent:', {
      amount,
      currency,
      network,
      userId,
      settlementCurrency,
      userEmail: user.email
    })

    // Create crypto payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['crypto'],
      crypto: {
        network: network,
      },
      metadata: {
        userId,
        userEmail: user.email,
        username: user.username,
        type: 'crypto_deposit',
        paymentMethod: 'USDC',
        network: network,
        settlementCurrency: settlementCurrency || 'usd',
      },
      receipt_email: user.email,
      description: `Dollar App USDC deposit for ${user.username}`,
      // Settlement configuration
      transfer_data: {
        destination: 'self', // Settle to your own account as USD
      },
    })

    // Log the crypto payment intent creation
    const { error: logError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'deposit',
          amount: amount / 100, // Convert cents to dollars
          status: 'pending',
          payment_method: `USDC (${network})`,
          metadata: {
            stripe_payment_intent_id: paymentIntent.id,
            payment_method_type: 'crypto',
            currency: currency,
            network: network,
            settlement_currency: settlementCurrency
          }
        }
      ])

    if (logError) {
      console.error('Error logging crypto transaction:', logError)
    }

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id,
        status: paymentIntent.status,
        network: network,
        currency: currency,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error creating crypto payment intent:', error)
    
    // Handle specific Stripe crypto errors
    let errorMessage = 'Failed to create crypto payment intent'
    
    if (error.message?.includes('crypto payments are not enabled')) {
      errorMessage = 'Crypto payments are not enabled for this account. Please contact support.'
    } else if (error.message?.includes('unsupported currency')) {
      errorMessage = 'USDC is not supported. Please use a different payment method.'
    } else if (error.message?.includes('unsupported network')) {
      errorMessage = 'Solana network is not supported. Please try a different network.'
    } else if (error.message?.includes('business verification')) {
      errorMessage = 'Business verification required for crypto payments. Please contact support.'
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message || 'Please try a different payment method'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})