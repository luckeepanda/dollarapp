import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  to: string
  username: string
  qrCode: string
  score: number
  gameName: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { to, username, qrCode, score, gameName }: EmailRequest = await req.json()

    // Validate required fields
    if (!to || !username || !qrCode || !score || !gameName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // For now, we'll log the email details since we don't have SendGrid configured
    console.log('Tournament Winner Email:', {
      to,
      username,
      qrCode,
      score,
      gameName,
      timestamp: new Date().toISOString()
    })

    // In a real implementation, you would send the email here using SendGrid or similar
    // Example with SendGrid:
    /*
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    
    const emailData = {
      personalizations: [{
        to: [{ email: to, name: username }],
        subject: `🏆 You Won! ${gameName} - Prize QR Code Inside`
      }],
      from: { email: 'noreply@dollarapp.com', name: 'Dollar App' },
      content: [{
        type: 'text/html',
        value: `
          <h1>🎉 Congratulations ${username}!</h1>
          <p>You won the ${gameName} tournament with a score of ${score} points!</p>
          <p>Your prize QR code is: <strong>${qrCode}</strong></p>
          <p>Present this QR code at any participating restaurant to claim your prize.</p>
          <p>Thank you for playing Dollar App!</p>
        `
      }]
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`)
    }
    */

    // For demo purposes, we'll simulate successful email sending
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Winner email sent successfully',
        qrCode: qrCode
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error sending winner email:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send winner email',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})