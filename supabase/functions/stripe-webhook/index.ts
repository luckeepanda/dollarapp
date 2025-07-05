import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      return new Response('Missing signature or webhook secret', { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const userId = paymentIntent.metadata.userId
        const amount = paymentIntent.amount / 100 // Convert from cents to dollars

        if (!userId) {
          console.error('No userId in payment intent metadata')
          break
        }

        // Add funds to user balance
        const { error: balanceError } = await supabase.rpc('add_balance', {
          user_id: userId,
          amount: amount,
        })

        if (balanceError) {
          console.error('Error updating user balance:', balanceError)
          break
        }

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: userId,
              type: 'deposit',
              amount: amount,
              status: 'completed',
              payment_method: 'Stripe',
            },
          ])

        if (transactionError) {
          console.error('Error creating transaction record:', transactionError)
        }

        console.log(`Successfully processed deposit of $${amount} for user ${userId}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const userId = paymentIntent.metadata.userId
        const amount = paymentIntent.amount / 100

        if (!userId) {
          console.error('No userId in payment intent metadata')
          break
        }

        // Create failed transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: userId,
              type: 'deposit',
              amount: amount,
              status: 'failed',
              payment_method: 'Stripe',
            },
          ])

        if (transactionError) {
          console.error('Error creating failed transaction record:', transactionError)
        }

        console.log(`Payment failed for user ${userId}, amount $${amount}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})