# B2B Marketplace — IndiaMART-style Platform

A full-stack B2B marketplace built with Next.js 14, TypeScript, MySQL, and Prisma.

## Tech Stack

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **State:** Zustand (persisted)
- **Backend:** Next.js API Routes
- **Database:** MySQL + Prisma ORM
- **Auth:** JWT (RBAC: SUPER_ADMIN, SUB_ADMIN, VENDOR, BUYER)
- **Storage:** Cloudinary
- **Payments:** Razorpay
- **Email:** Nodemailer

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Fill in `.env`:
```
DATABASE_URL="mysql://user:password@localhost:3306/b2b_marketplace"
JWT_SECRET="your-super-secret-key-min-32-chars"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-razorpay-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="B2B Marketplace <noreply@yourdomain.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up database
```bash
npx prisma migrate dev --name init
```

### 4. Seed demo data
```bash
npm run db:seed ya npx prisma db seed
```

### 5. Start dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@example.com | Admin@123 |
| Vendor | vendor@example.com | Vendor@123 |
| Buyer | user@example.com | User@123 |

---

## Project Structure

```
app/
├── api/                      # API routes
│   ├── auth/                 # login, register, me, forgot-password, change-password
│   ├── products/             # CRUD + [id]
│   ├── categories/           # GET
│   ├── inquiries/            # CRUD + [id]
│   ├── chat/                 # GET/POST messages
│   ├── wishlist/             # toggle
│   ├── notifications/        # GET/PUT
│   ├── upload/               # Cloudinary upload
│   ├── vendors/              # GET/PATCH
│   ├── subscriptions/        # GET/POST + verify
│   └── admin/                # stats, users, vendors
├── auth/
│   ├── login/
│   └── register/
├── marketplace/
│   ├── page.tsx              # Product listing with filters
│   └── products/[slug]/      # Product detail
├── vendors/[id]/             # Vendor public profile
└── dashboard/
    ├── buyer/                # inquiries, wishlist, messages, settings
    ├── vendor/               # products (CRUD), inquiries, messages, analytics, subscription, profile
    └── admin/                # stats, users, vendors, products

components/
├── layout/
│   ├── Navbar.tsx
│   └── DashboardLayout.tsx
├── shared/
│   ├── ProductCard.tsx
│   └── InquiryModal.tsx
└── ui/
    ├── Button.tsx
    └── Toaster.tsx

lib/
├── prisma.ts, jwt.ts, bcrypt.ts
├── cloudinary.ts, email.ts, razorpay.ts
├── middleware.ts, validations.ts

store/
├── authStore.ts (Zustand)
└── cartStore.ts (Zustand)
```

---

## Key Features

### Buyer
- Browse & search products with filters (category, price, sort)
- Product detail pages with image gallery
- Send inquiries to vendors
- Wishlist management
- Real-time chat with vendors
- Dashboard: inquiries, orders, wishlist, settings

### Vendor
- Company profile with logo, GST, address
- Product management (add/edit/delete with Cloudinary images)
- Inquiry management with respond functionality
- Analytics dashboard (views, leads, inquiry breakdown)
- Subscription plans with Razorpay integration
- Real-time chat with buyers
- Pending approval flow

### Admin
- Platform stats (users, vendors, products, inquiries)
- User management (suspend/activate/delete)
- Vendor approval queue (approve/reject with reason)
- Product moderation (activate/deactivate/delete)
- Role breakdown charts

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Get current user |
| GET | /api/products | — | List products (filters) |
| POST | /api/products | VENDOR | Create product |
| GET | /api/products/:id | — | Get product |
| PUT | /api/products/:id | VENDOR/ADMIN | Update product |
| DELETE | /api/products/:id | VENDOR/ADMIN | Delete product |
| GET | /api/categories | — | List categories |
| GET | /api/inquiries | ✓ | List inquiries (role-filtered) |
| POST | /api/inquiries | BUYER | Send inquiry |
| PUT | /api/inquiries/:id | VENDOR | Respond |
| GET | /api/chat | ✓ | Conversations / thread |
| POST | /api/chat | ✓ | Send message |
| GET | /api/wishlist | ✓ | Get wishlist |
| POST | /api/wishlist | ✓ | Toggle wishlist |
| POST | /api/upload | ✓ | Upload to Cloudinary |
| GET | /api/admin/stats | ADMIN | Platform stats |
| GET | /api/admin/users | ADMIN | User list |
| PATCH | /api/admin/users/:id | ADMIN | Update user |
| GET | /api/admin/vendors | ADMIN | Vendor list |
| PATCH | /api/admin/vendors/:id | ADMIN | Approve/reject |

---

## Deployment

```bash
npm run build
npm start
```

For production, set `NODE_ENV=production` and use a managed MySQL instance (PlanetScale, RDS, etc.).
