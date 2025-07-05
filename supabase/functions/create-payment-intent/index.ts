import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { amount, currency, userId, paymentMethodType }: PaymentIntentRequest = await req.json()

    // Validate the request
    if (!amount || !currency || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, currency, userId' }),
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

    // Create payment intent configuration
    const paymentIntentData: any = {
      amount,
      currency,
      metadata: {
        userId,
        userEmail: user.email,
        username: user.username,
        type: 'deposit',
        paymentMethod: paymentMethodType || 'card',
      },
      receipt_email: user.email,
      description: `Dollar App deposit for ${user.username}`,
    }

    // Configure payment methods based on type
    if (paymentMethodType === 'apple_pay') {
      paymentIntentData.payment_method_types = ['card']
      paymentIntentData.automatic_payment_methods = {
        enabled: true,
        allow_redirects: 'never'
      }
    } else {
      paymentIntentData.automatic_payment_methods = {
        enabled: true,
      }
    }

    console.log('Creating payment intent:', {
      amount,
      currency,
      userId,
      paymentMethodType,
      userEmail: user.email
    })

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData)

    // Log the payment intent creation
    const { error: logError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'deposit',
          amount: amount / 100, // Convert cents to dollars
          status: 'pending',
          payment_method: paymentMethodType === 'apple_pay' ? 'Apple Pay' : 'Card',
          metadata: {
            stripe_payment_intent_id: paymentIntent.id,
            payment_method_type: paymentMethodType
          }
        }
      ])

    if (logError) {
      console.error('Error logging transaction:', logError)
    }

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
      JSON.stringify({ 
        error: error.message || 'Failed to create payment intent',
        details: 'Please check your payment information and try again'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})