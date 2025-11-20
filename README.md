# Menublend - 3D/AR Dish Visualization SaaS

**Menublend** transforms restaurant dishes into photorealistic 3D models and AR experiences. Restaurant owners upload photos of their signature dishes, and Menublend's team delivers production-ready 3D/AR assets that can be embedded on websites, shared via QR codes, and used to enhance digital menus.

This is a **production-ready MVP** built around a "paid demo dish" business model: restaurants start with a single paid demo dish ($99) to test the service.

---

## 🎯 Main Flows

### Restaurant Owner Journey
1. Signup & onboarding → Complete restaurant profile
2. Order paid demo dish → Upload 8-20 photos
3. Track order status (NEW → IN_PRODUCTION → READY → DELIVERED)
4. Receive 3D viewer URL → Share public demo page

### Admin Journey
1. View all orders in admin dashboard
2. Update order status, payment status, delivery URL
3. System sends automatic email notifications to restaurants

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Lovable Cloud (Supabase)
  - PostgreSQL with Row Level Security (RLS)
  - Auth (email/password)
  - Storage (dish photos + logos)
  - Edge Functions (email notifications)
- **Email:** Resend API
- **Icons:** lucide-react
- **Notifications:** sonner (toast)

---

## ⚙️ Environment Variables

### Auto-Configured (Lovable Cloud)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Secrets (Configure in Lovable Cloud)
- `RESEND_API_KEY` - Get from [resend.com/api-keys](https://resend.com/api-keys)
- `ADMIN_NOTIFICATION_EMAIL` - Your admin email (e.g., hello@menublend.com)

---

## 🚀 Local Development

```bash
# Clone repository
git clone <YOUR_REPO_URL>
cd menublend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Configure Secrets
1. In Lovable, go to Project Settings → Secrets
2. Add `RESEND_API_KEY` and `ADMIN_NOTIFICATION_EMAIL`

---

## 📊 Database Schema

### Tables
- `user_roles` - RBAC (admin | restaurant_owner)
- `restaurant_profiles` - Restaurant info + logo
- `dish_orders` - Dish orders with status tracking
- `dish_photos` - 8-20 photos per order
- `payment_records` - Payment status (PENDING/PAID/FAILED)

### Storage Buckets
- `dish-photos` (public) - Uploaded dish photos
- `restaurant-logos` (public) - Restaurant logos

---

## 🌐 Routes

### Public
- `/` - Landing page
- `/login` - Login
- `/signup` - Signup
- `/demo/dish/:id` - Public shareable demo

### Protected (Restaurant Owner)
- `/app` - Dashboard
- `/app/dishes/new` - Create order
- `/app/dishes/:id` - Order detail
- `/app/profile` - Profile
- `/onboarding` - Setup

### Admin
- `/admin` - Admin dashboard
- `/admin/dishes` - All orders
- `/admin/dishes/:id` - Manage order

---

## 📧 Email Notifications

Automated emails via Resend:

1. **Admin: New Order** - When restaurant submits order
2. **Restaurant: Order Ready** - When admin marks READY
3. **Restaurant: Order Delivered** - When admin marks DELIVERED (with viewer URL)

---

## 🚢 Deployment

### Frontend
Click **Publish** in Lovable → Live at `https://your-project.lovable.app`

### Backend
Edge functions and migrations deploy automatically

### Custom Domain
Go to Project Settings → Domains (requires paid plan)

---

## 👥 User Roles

### Make a User Admin

```sql
-- Find user ID
SELECT id, email FROM auth.users;

-- Add admin role
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

Or use Lovable Cloud UI → Database → `user_roles` table → Insert Row

---

## 💰 Pricing Configuration

Centralized in `src/config/pricing.ts`:

```typescript
export const PRICING = {
  DEMO_DISH: {
    PRICE: 99,
    CURRENCY: 'USD',
    DISPLAY: '$99',
    FEATURES: [...],
  },
};
```

Update pricing here to reflect across entire app.

---

## ✅ Testing Flows

### Restaurant Owner
1. Signup at `/signup`
2. Complete onboarding
3. Click "Order Demo Dish"
4. Upload 8-20 photos
5. Submit → Order created (NEW, PENDING)

### Admin
1. Make yourself admin (SQL above)
2. Go to `/admin/dishes`
3. Click order → Update status to IN_PRODUCTION
4. Set payment to PAID
5. Add delivery URL
6. Mark as DELIVERED → Email sent

### Public Demo
Visit `/demo/dish/:id` to see shareable demo page

---

## 🐛 Known Limitations

- Manual payment workflow (no Stripe yet)
- Single demo order at a time
- No built-in 3D viewer (uses iframe)
- Basic admin dashboard (no analytics)

### Recommended Next Steps
1. Stripe integration for automated payments
2. Analytics dashboard for admin
3. Multi-dish packages
4. Built-in 3D viewer (Three.js)
5. Restaurant profile editing

---

## 🔒 Security

- RLS policies on all tables
- Role-based access control
- Secrets stored in Lovable Cloud (not in code)
- Photo upload limits enforced (8-20)
- Input validation on forms

---

**Built with ❤️ using [Lovable](https://lovable.dev)**

---

## Original Lovable Project Info

**Project URL**: https://lovable.dev/projects/4bb42116-38e8-49c1-abaf-9d70f553021b

Changes made via Lovable are committed automatically to this repo.
