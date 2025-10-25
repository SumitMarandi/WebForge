# WebForge Testing Checklist

## 🧪 **Application Testing Guide**

### **Frontend Testing (http://localhost:3000)**

#### **1. Navigation Testing**
- [ ] **Home Page** loads correctly
- [ ] **Dashboard** link appears when logged in (first in navigation)
- [ ] **Pricing** page accessible (second in navigation)
- [ ] **Contact** page accessible (third in navigation)
- [ ] **User dropdown** shows profile settings and sign out

#### **2. Authentication Flow**
- [ ] User can register new account
- [ ] User can login with existing account
- [ ] User dropdown shows correct email
- [ ] Sign out works properly
- [ ] Protected routes redirect to login when not authenticated

#### **3. Profile Page Testing**
Navigate to Profile Settings from user dropdown:

**Profile Tab:**
- [ ] User avatar displays correctly
- [ ] Personal information form works
- [ ] Full name, phone, role can be updated
- [ ] Email field is read-only
- [ ] Save changes works

**Billing Tab:**
- [ ] Current subscription status displays
- [ ] Usage statistics show (websites, pages, storage, bandwidth)
- [ ] Plan comparison cards display correctly
- [ ] Monthly/Yearly toggle works
- [ ] Upgrade buttons are functional
- [ ] Billing history table shows (may be empty initially)
- [ ] Payment methods section displays

**Security Tab:**
- [ ] Change password form works
- [ ] Password validation works
- [ ] Session status component displays

#### **4. Pricing Page Testing**
- [ ] All three plans display correctly (Free, Pro, Business)
- [ ] Monthly/Yearly toggle works
- [ ] Pricing updates correctly
- [ ] Upgrade buttons link to Profile → Billing tab
- [ ] Feature lists are accurate

#### **5. Contact Page Testing**
- [ ] Contact form displays correctly
- [ ] All form fields work
- [ ] Form validation works
- [ ] Contact methods display
- [ ] Company information shows
- [ ] FAQ section is readable

### **Backend Testing**

#### **6. Supabase Functions**
Functions deployed to: `https://dwddnpqvbfzwidxsxlxs.supabase.co/functions/v1/`

- [x] **get-subscription-plans**: ✅ Deployed
- [x] **create-order**: ✅ Deployed (requires auth)
- [x] **cashfree-webhook**: ✅ Deployed (requires signature)

#### **7. Database Schema**
Check in Supabase dashboard:
- [ ] `sites` table exists with proper structure
- [ ] `pages` table exists with proper structure
- [ ] `subscriptions` table exists with enhanced fields
- [ ] `subscription_plans` table exists with plan data
- [ ] `payment_transactions` table exists
- [ ] All RLS policies are active

### **Environment Setup**

#### **8. Required Environment Variables**
Set in Supabase Dashboard → Settings → Edge Functions:

- [ ] `CASHFREE_APP_ID`: Your Cashfree App ID
- [ ] `CASHFREE_SECRET_KEY`: Your Cashfree Secret Key
- [ ] `CASHFREE_BASE_URL`: `https://sandbox.cashfree.com/pg` (for testing)

#### **9. Cashfree Configuration**
In your Cashfree dashboard:
- [ ] Webhook URL set to: `https://dwddnpqvbfzwidxsxlxs.supabase.co/functions/v1/cashfree-webhook`
- [ ] Payment methods enabled (UPI, Cards, Net Banking, etc.)
- [ ] Sandbox mode enabled for testing

### **Payment Flow Testing**

#### **10. End-to-End Payment Test**
✅ **Environment variables are now configured! Ready for testing:**

1. [ ] Login to your application
2. [ ] Go to Profile → Billing tab
3. [ ] Click "Upgrade to Pro" or "Upgrade to Business"
4. [ ] Verify redirect to Cashfree payment page
5. [ ] Complete test payment (use Cashfree test cards)
6. [ ] Verify redirect back to Profile → Billing tab
7. [ ] Check subscription status updated
8. [ ] Verify transaction recorded in payment history

#### **11. Payment Infrastructure Status**
✅ **All backend services are working:**
- [x] Cashfree environment variables configured
- [x] Subscription plans API working
- [x] Create order function working (requires auth)
- [x] Webhook handler deployed and ready

### **Test Cards (Cashfree Sandbox)**
- **Success**: 4111 1111 1111 1111
- **Failure**: 4012 0010 3714 1112
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## 🚨 **Known Issues to Check**

1. **CORS Issues**: If you get CORS errors, check that your frontend URL is in Supabase auth settings
2. **Authentication**: Make sure users can register and login properly
3. **Environment Variables**: Payment flow won't work without Cashfree credentials
4. **Webhook Delivery**: Check Cashfree dashboard for webhook delivery status

## ✅ **Success Indicators**

- [ ] All pages load without console errors
- [ ] Navigation works smoothly
- [ ] User authentication flows work
- [ ] Profile tabs switch correctly
- [ ] Subscription status displays accurately
- [ ] Payment buttons generate proper orders (when env vars are set)

## 🎯 **Priority Tests**

**High Priority:**
1. Navigation order (Dashboard → Pricing → Contact)
2. Profile page tabs (Profile → Billing → Security)
3. User authentication and profile management

**Medium Priority:**
4. Contact form functionality
5. Subscription status display
6. Plan comparison interface

**Low Priority (requires Cashfree setup):**
7. Payment processing
8. Webhook handling
9. Subscription activation

---

**Start testing at: http://localhost:3000** 🚀