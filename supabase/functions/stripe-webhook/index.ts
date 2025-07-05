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
      console.error('Missing signature or webhook secret')
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

    console.log('Received webhook event:', event.type, event.id)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const userId = paymentIntent.metadata.userId
        const amount = paymentIntent.amount / 100 // Convert from cents to dollars
        const paymentMethod = paymentIntent.metadata.paymentMethod || 'Card'

        console.log('Processing successful payment:', {
          paymentIntentId: paymentIntent.id,
          userId,
          amount,
          paymentMethod
        })

        if (!userId) {
          console.error('No userId in payment intent metadata')
          break
        }

        // Verify user exists
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('id, balance, email, username')
          .eq('id', userId)
          .single()

        if (userError || !user) {
          console.error('User not found for payment:', userId, userError)
          break
        }

        // Add funds to user balance using the secure function
        const { error: balanceError } = await supabase.rpc('add_balance', {
          user_id: userId,
          amount: amount,
        })

        if (balanceError) {
          console.error('Error updating user balance:', balanceError)
          // Update transaction status to failed
          await supabase
            .from('transactions')
            .update({ status: 'failed' })
            .eq('user_id', userId)
            .eq('metadata->stripe_payment_intent_id', paymentIntent.id)
          break
        }

        // Update transaction record to completed
        const { error: transactionUpdateError } = await supabase
          .from('transactions')
          .update({ 
            status: 'completed',
            metadata: {
              stripe_payment_intent_id: paymentIntent.id,
              payment_method_type: paymentIntent.metadata.paymentMethod,
              stripe_charge_id: paymentIntent.latest_charge,
              completed_at: new Date().toISOString()
            }
          })
          .eq('user_id', userId)
          .eq('metadata->stripe_payment_intent_id', paymentIntent.id)

        if (transactionUpdateError) {
          console.error('Error updating transaction record:', transactionUpdateError)
        }

        // Create a success transaction record if no pending transaction exists
        const { data: existingTransaction } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('metadata->stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (!existingTransaction) {
          const { error: newTransactionError } = await supabase
            .from('transactions')
            .insert([
              {
                user_id: userId,
                type: 'deposit',
                amount: amount,
                status: 'completed',
                payment_method: paymentMethod,
                metadata: {
                  stripe_payment_intent_id: paymentIntent.id,
                  payment_method_type: paymentIntent.metadata.paymentMethod,
                  stripe_charge_id: paymentIntent.latest_charge,
                  completed_at: new Date().toISOString()
                }
              }
            ])

          if (newTransactionError) {
            console.error('Error creating transaction record:', newTransactionError)
          }
        }

        console.log(`Successfully processed deposit of $${amount} for user ${userId} (${user.username})`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const userId = paymentIntent.metadata.userId
        const amount = paymentIntent.amount / 100
        const paymentMethod = paymentIntent.metadata.paymentMethod || 'Card'

        console.log('Processing failed payment:', {
          paymentIntentId: paymentIntent.id,
          userId,
          amount,
          paymentMethod
        })

        if (!userId) {
          console.error('No userId in payment intent metadata')
          break
        }

        // Update existing transaction to failed or create new failed transaction
        const { data: existingTransaction } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('metadata->stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (existingTransaction) {
          // Update existing transaction
          const { error: updateError } = await supabase
            .from('transactions')
            .update({ 
              status: 'failed',
              metadata: {
                stripe_payment_intent_id: paymentIntent.id,
                payment_method_type: paymentIntent.metadata.paymentMethod,
                failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
                failed_at: new Date().toISOString()
              }
            })
            .eq('id', existingTransaction.id)

          if (updateError) {
            console.error('Error updating failed transaction:', updateError)
          }
        } else {
          // Create new failed transaction record
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert([
              {
                user_id: userId,
                type: 'deposit',
                amount: amount,
                status: 'failed',
                payment_method: paymentMethod,
                metadata: {
                  stripe_payment_intent_id: paymentIntent.id,
                  payment_method_type: paymentIntent.metadata.paymentMethod,
                  failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
                  failed_at: new Date().toISOString()
                }
              }
            ])

          if (transactionError) {
            console.error('Error creating failed transaction record:', transactionError)
          }
        }

        console.log(`Payment failed for user ${userId}, amount $${amount}`)
        break
      }

      case 'payment_method.attached': {
        console.log('Payment method attached:', event.data.object.id)
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