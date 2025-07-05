import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PaymentIntentRequest {
  amount: number
  currency: string
  userId: string
  paymentMethodId?: string
  paymentMethodType?: string
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

    const { amount, currency, userId, paymentMethodId, paymentMethodType }: PaymentIntentRequest = await req.json()

    // Validate the request
    if (!amount || !currency || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create payment intent
    const paymentIntentData: any = {
      amount,
      currency,
      metadata: {
        userId,
        type: 'deposit',
        paymentMethod: paymentMethodType || 'card',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    }

    // If payment method is provided (for Apple Pay/Google Pay)
    if (paymentMethodId) {
      paymentIntentData.payment_method = paymentMethodId
      paymentIntentData.confirmation_method = 'manual'
      paymentIntentData.confirm = true
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData)

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id,
        status: paymentIntent.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})