# Paddle Integration Setup & Testing Guide

## Overview
Menublend uses Paddle for:
- **One-time purchases**: Single dishes and multi-dish packs (adds credits)
- **Subscriptions**: Hosting plans (Basic/Pro) with 30-day free trial

## Setup Steps

### 1. Create Paddle Account
1. Go to https://vendors.paddle.com/signup
2. Create sandbox account for testing
3. Note your:
   - Vendor ID
   - Client-side token (for Paddle.js)
   - Webhook secret (for signature verification)

### 2. Create Products in Paddle Dashboard

#### One-Time Products
Create the following products in Paddle (Catalog → Products):

1. **Single Demo Dish** - $99
2. **Pack 5 Dishes** - $449
3. **Pack 10 Dishes** - $799
4. **Pack 15 Dishes** - $1,125
5. **Pack 20 Dishes** - $1,399
6. **Pack 30 Dishes** - $1,899

#### Subscription Products
Create subscription products:

1. **Hosting Basic** - $29/month (30-day trial)
2. **Hosting Pro** - $59/month (30-day trial)

### 3. Update Price IDs
After creating products in Paddle, copy their price IDs and update `src/config/pricing.ts`:

```typescript
export const PRICING = {
  SINGLE: {
    id: 'pri_01abc123...', // ← Replace with actual Paddle price ID
    // ...
  },
  PACKS: [
    { id: 'pri_01def456...', dishes: 5, price: 449 },
    // ... update all pack IDs
  ],
  HOSTING: {
    BASIC: {
      id: 'pri_01ghi789...', // ← Replace with actual Paddle price ID
      // ...
    },
    PRO: {
      id: 'pri_01jkl012...', // ← Replace with actual Paddle price ID
      // ...
    },
  },
};
```

### 4. Update Paddle Client Token
In `src/services/paddle.ts`, update line 39-41:

```typescript
const clientToken = environment === 'sandbox' 
  ? 'test_abc123...' // ← Your Paddle sandbox client token
  : 'live_xyz789...'; // ← Your Paddle production client token
```

### 5. Configure Webhook
1. In Paddle Dashboard → Developer Tools → Webhooks
2. Add webhook URL: `https://your-project.lovable.app/paddle-webhook`
3. Select events:
   - `transaction.completed`
   - `transaction.paid`
   - `subscription.created`
   - `subscription.activated`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.paused`
4. Copy the webhook secret

#### Update Webhook Signature Verification
In `supabase/functions/paddle-webhook/index.ts`, uncomment and implement signature verification (lines 28-32):

```typescript
const signature = req.headers.get("paddle-signature");
const webhookSecret = Deno.env.get("PADDLE_WEBHOOK_SECRET");
// Implement Paddle signature verification
// See: https://developer.paddle.com/webhooks/signature-verification
```

## Testing Flows

### Test 1: Single Dish Purchase
**Goal**: User buys 1 credit, creates 1 dish order

1. **Sign up** new user
2. **Complete onboarding**
3. Go to **/app** dashboard
4. Click **"Order Dish ($99)"** button
5. Paddle checkout opens → Complete purchase (use Paddle test card)
6. Verify:
   - ✅ Credits widget shows `1 / 1` credits
   - ✅ `restaurant_profiles.pack_dishes_remaining = 1`
   - ✅ `restaurant_profiles.pack_dishes_total = 1`
7. Click **"Create Dish Order"**
8. Fill dish info → Upload 8-20 photos → Confirm order
9. Verify:
   - ✅ Credits decremented to `0 / 1`
   - ✅ Dish order created with `status=NEW`
   - ✅ Payment record created with `status=PAID`

### Test 2: Pack Purchase (5 Dishes)
**Goal**: User buys 5 credits, creates multiple dishes

1. Navigate to **/app/billing**
2. Click **"Buy 5 Credits"** ($449)
3. Complete Paddle checkout
4. Verify:
   - ✅ Credits widget shows `5 / 5`
5. Create 3 dish orders (repeat flow from Test 1)
6. Verify credits decrement: `5 → 4 → 3 → 2`

### Test 3: Hosting Subscription Trial
**Goal**: User starts 30-day free trial

1. Go to **/app/billing**
2. Click **"Start Free Trial"** on Basic plan
3. Complete Paddle subscription checkout
4. Verify:
   - ✅ Subscription record created with `status=TRIALING`
   - ✅ `trial_ends_at` set to 30 days from now
   - ✅ Billing page shows "Trialing" status

### Test 4: Subscription Upgrade (Basic → Pro)
**Goal**: User upgrades plan mid-trial

1. While on Basic trial, go to **/app/billing**
2. Click **"Upgrade to Pro"**
3. Complete Paddle upgrade checkout
4. Verify:
   - ✅ `subscription_records.plan = 'PRO'`
   - ✅ Trial continues until original end date

### Test 5: Webhook Flow
**Goal**: Verify webhook updates database correctly

1. Use Paddle Dashboard → Developer Tools → Webhook Event Simulator
2. Send test events:
   - `transaction.paid` → Check credits increment
   - `subscription.activated` → Check subscription created
   - `subscription.canceled` → Check status updated

## Database Schema Check

Verify these columns exist in `restaurant_profiles`:
```sql
SELECT 
  pack_dishes_remaining,
  pack_dishes_total,
  pack_purchased_at
FROM restaurant_profiles 
LIMIT 1;
```

Verify `subscription_records` table exists:
```sql
SELECT * FROM subscription_records LIMIT 1;
```

## Troubleshooting

### Credits not incrementing after purchase
- Check webhook logs in Paddle Dashboard
- Check edge function logs: `supabase functions logs paddle-webhook`
- Verify `customData` in checkout includes `userId` and `dishesCount`

### Subscription not created
- Verify subscription price ID is correct
- Check webhook received `subscription.activated` event
- Check `customData` includes `userId` and `plan`

### Checkout not opening
- Verify client token is correct in `paddle.ts`
- Check browser console for Paddle.js errors
- Ensure price IDs match Paddle products

## Production Checklist

Before going live:
- [ ] Replace all sandbox price IDs with production IDs
- [ ] Update Paddle client token to production token
- [ ] Configure production webhook URL
- [ ] Implement webhook signature verification
- [ ] Test all flows in production environment
- [ ] Set up monitoring for webhook failures

## Support

- **Paddle Docs**: https://developer.paddle.com/
- **Paddle Support**: https://vendors.paddle.com/support
- **Menublend Issues**: Contact dev team
