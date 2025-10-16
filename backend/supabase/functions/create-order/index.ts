import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID')
const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY')
const CASHFREE_BASE_URL = Deno.env.get('CASHFREE_BASE_URL') || 'https://sandbox.cashfree.com/pg'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { plan, userId } = await req.json()

    const planPrices = {
      pro: 299,
      business: 999
    }

    const amount = planPrices[plan as keyof typeof planPrices]
    if (!amount) {
      throw new Error('Invalid plan')
    }

    // Create Cashfree order
    const orderId = `order_${Date.now()}_${userId.slice(0, 8)}`
    
    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: userId,
        customer_email: 'user@example.com', // You should get this from the user
        customer_phone: '9999999999' // You should get this from the user
      },
      order_meta: {
        return_url: `${req.headers.get('origin')}/billing?success=true`,
        notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/cashfree-webhook`
      }
    }

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2022-09-01',
        'x-client-id': CASHFREE_APP_ID!,
        'x-client-secret': CASHFREE_SECRET_KEY!
      },
      body: JSON.stringify(orderData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create order')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: result.order_id,
        paymentLink: result.payment_link 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})