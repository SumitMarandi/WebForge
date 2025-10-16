# WebForge Deployment Guide

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Cashfree Account**: Sign up at [cashfree.com](https://merchant.cashfree.com)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
4. **Node.js**: Version 18 or higher

## Step 1: Supabase Setup

### Create Project
1. Go to Supabase Dashboard
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be ready

### Database Setup
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste the content from `backend/supabase/migrations/001_initial_schema.sql`
3. Run the migration

### Edge Functions Setup
1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   cd backend
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Deploy Edge Functions:
   ```bash
   supabase functions deploy publish-site
   supabase functions deploy create-order
   supabase functions deploy cashfree-webhook
   ```

5. Set environment variables for Edge Functions:
   ```bash
   supabase secrets set CASHFREE_APP_ID=your_app_id
   supabase secrets set CASHFREE_SECRET_KEY=your_secret_key
   supabase secrets set CASHFREE_BASE_URL=https://sandbox.cashfree.com/pg
   ```

## Step 2: Cashfree Setup

### Create Application
1. Login to Cashfree Merchant Dashboard
2. Go to Developers → API Keys
3. Create new application
4. Note down App ID and Secret Key

### Configure Webhooks
1. Go to Developers → Webhooks
2. Add webhook URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/cashfree-webhook`
3. Select events: Payment Success, Payment Failed

## Step 3: Frontend Deployment

### Environment Variables
Create `.env` file in frontend directory:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_CASHFREE_APP_ID=your_cashfree_app_id
```

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## Step 4: Testing

### Test Authentication
1. Visit your deployed app
2. Sign up with email
3. Check Supabase Auth dashboard

### Test Site Creation
1. Login to your app
2. Create a new website
3. Add some content in editor
4. Publish the site

### Test Payments (Sandbox)
1. Go to billing page
2. Try upgrading to Pro plan
3. Use Cashfree test credentials
4. Verify subscription in database

## Step 5: Production Setup

### Switch to Production
1. Change Cashfree to production mode
2. Update `CASHFREE_BASE_URL` to production endpoint
3. Test with real payment methods

### Custom Domain (Optional)
1. Add custom domain in Vercel
2. Configure DNS records
3. Update site URLs in Supabase settings

## Monitoring

### Supabase Logs
- Monitor Edge Function logs
- Check database performance
- Review auth events

### Vercel Analytics
- Enable Vercel Analytics
- Monitor frontend performance
- Track user behavior

## Security Checklist

- ✅ RLS policies enabled
- ✅ Environment variables secured
- ✅ HTTPS enforced
- ✅ Webhook signatures verified
- ✅ Input validation implemented
- ✅ CORS configured properly

## Troubleshooting

### Common Issues

1. **Edge Function Timeout**
   - Check function logs in Supabase
   - Optimize function performance
   - Increase timeout if needed

2. **Payment Webhook Failures**
   - Verify webhook URL is accessible
   - Check Cashfree webhook logs
   - Validate signature verification

3. **Site Publishing Errors**
   - Check storage bucket permissions
   - Verify RLS policies
   - Review function logs

### Support

For issues:
1. Check Supabase documentation
2. Review Cashfree API docs
3. Check Vercel deployment logs
4. Contact support if needed