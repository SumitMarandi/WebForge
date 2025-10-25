# WebForge Deployment Guide

## 🚀 Complete Deployment Instructions

### Prerequisites

1. **Supabase CLI** installed and configured
   ```bash
   npm install -g supabase
   supabase login
   ```

2. **Cashfree Account** (Sandbox for testing, Production for live)
   - Get your App ID and Secret Key
   - Configure webhook URL

### 1. Database Setup

Navigate to the backend directory and apply migrations:

```bash
cd backend/supabase
supabase db push
```

This will create:
- Enhanced `subscriptions` table
- New `subscription_plans` table  
- New `payment_transactions` table
- Database functions for subscription management
- Proper RLS policies and indexes

### 2. Deploy Supabase Functions

Deploy all Edge Functions:

```bash
supabase functions deploy create-order
supabase functions deploy cashfree-webhook  
supabase functions deploy get-subscription-plans
```

### 3. Environment Variables

Set these in your Supabase project dashboard (Settings > Edge Functions):

**Required for Cashfree Integration:**
```
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_BASE_URL=https://sandbox.cashfree.com/pg
```

**For Production:**
```
CASHFREE_BASE_URL=https://api.cashfree.com/pg
```

### 4. Cashfree Webhook Configuration

In your Cashfree dashboard, set the webhook URL to:
```
https://your-project-id.supabase.co/functions/v1/cashfree-webhook
```

### 5. Frontend Configuration

Update your frontend environment variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 6. Test the System

1. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test subscription flow:**
   - Navigate to `/profile?tab=billing`
   - Try upgrading to Pro or Business plan
   - Use Cashfree test cards for sandbox testing

### 7. Subscription Plans

The system includes three plans:

| Plan | Monthly | Yearly | Websites | Pages/Site | Features |
|------|---------|--------|----------|------------|----------|
| Free | ₹0 | ₹0 | 3 | 3 | Basic templates, Standard support |
| Pro | ₹299 | ₹2,990 | 10 | 5 | Advanced templates, Priority support, No watermark, Download code |
| Business | ₹999 | ₹9,990 | Unlimited | Unlimited | Everything + Team collaboration, 24/7 support |

### 8. Testing Payment Flow

**Sandbox Test Cards:**
- **Success:** 4111 1111 1111 1111
- **Failure:** 4012 0010 3714 1112
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### 9. Monitoring

Monitor your system through:
- **Supabase Dashboard:** Function logs and database
- **Cashfree Dashboard:** Payment transactions
- **Database Tables:** `payment_transactions` and `subscriptions`

### 10. Going Live

When ready for production:

1. **Update Cashfree credentials** to production keys
2. **Change CASHFREE_BASE_URL** to production endpoint
3. **Update webhook URL** in Cashfree production dashboard
4. **Test with real payment methods**

## 🔧 Troubleshooting

### Common Issues

**1. Function Deployment Fails**
- Check Supabase CLI is latest version
- Verify you're logged in: `supabase status`
- Check function syntax and imports

**2. Payment Order Creation Fails**
- Verify Cashfree credentials are set correctly
- Check CASHFREE_BASE_URL is correct for your environment
- Review function logs in Supabase dashboard

**3. Webhook Not Receiving Events**
- Verify webhook URL is correctly set in Cashfree dashboard
- Check webhook signature verification
- Review webhook function logs

**4. Subscription Not Activating**
- Check webhook is processing successfully
- Verify database permissions and RLS policies
- Check `payment_transactions` table for transaction status

### Logs and Debugging

**View Function Logs:**
```bash
supabase functions logs create-order
supabase functions logs cashfree-webhook
```

**Database Queries:**
```sql
-- Check subscription status
SELECT * FROM subscriptions WHERE user_id = 'user-uuid';

-- Check payment transactions
SELECT * FROM payment_transactions WHERE user_id = 'user-uuid';

-- Check subscription plans
SELECT * FROM subscription_plans WHERE is_active = true;
```

## 🎉 Success!

Once deployed, your WebForge application will have:
- ✅ Complete subscription management
- ✅ Secure payment processing
- ✅ Automatic subscription activation
- ✅ Usage limit enforcement
- ✅ Billing history tracking
- ✅ Multi-plan support with yearly discounts

Your users can now upgrade their plans and enjoy premium features!

## 📞 Support

For deployment issues:
1. Check the function logs in Supabase dashboard
2. Verify all environment variables are set
3. Test webhook delivery in Cashfree dashboard
4. Review database table contents for debugging