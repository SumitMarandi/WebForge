import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    
    // Verify webhook signature (implement based on Cashfree docs)
    // const signature = req.headers.get('x-webhook-signature')
    // if (!verifySignature(payload, signature)) {
    //   throw new Error('Invalid signature')
    // }

    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { order_id, customer_id } = payload.data.order

      // Extract plan from order metadata or order_id
      const plan = order_id.includes('pro') ? 'pro' : 'business'
      
      // Calculate subscription period
      const now = new Date()
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

      // Create or update subscription
      const { error } = await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: customer_id,
          plan,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString()
        })

      if (error) throw error

      console.log(`Subscription activated for user ${customer_id}, plan: ${plan}`)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error', { status: 400 })
  }
})