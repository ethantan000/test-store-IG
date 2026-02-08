# ViralGoods - Full-Stack E-Commerce Storefront

ViralGoods is a beta e-commerce storefront built with **Next.js 13 (App Router)**, **TypeScript**, **Tailwind CSS**, **Express**, **MongoDB**, and **Stripe**. It ships with a mobile-first landing page, product catalog, cart + checkout, and an admin dashboard that can import products from AliExpress.

> **Status:** Beta. The core storefront, checkout flow, and admin dashboard are functional. Some roadmap items are still in progress.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 13, TypeScript, Tailwind CSS |
| State | Zustand (persisted auth + cart) |
| UI/Animation | Framer Motion, react-hot-toast |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Payments | Stripe Checkout |
| Email | Nodemailer (SMTP) |
| Analytics | Google Analytics + Meta Pixel (optional) |
| Caching | SWR (client-side caching + deduping) |

---

## Features

### Storefront
- Mobile-first landing page optimized for Instagram ads
- Product catalog with search, category filters, and sorting
- Product detail pages with variant selection and image gallery
- Persistent cart drawer (localStorage)
- Guest checkout with Stripe Checkout (fallback to direct order creation)
- Reviews, FAQs, and trust/brand sections
- Framer Motion animations + custom cursor

### Admin Dashboard
- JWT-based admin authentication
- Dashboard stats (products, orders, revenue, margin)
- Product activation toggles
- AliExpress import (ID/URL or keyword search)
- Orders list + status visibility

### Technical
- MongoDB data models (Product, Order, User, Review, Customer, CMS)
- Stripe webhooks for order confirmation
- SMTP email receipts
- Rate limiting + request validation (Zod)
- Client-side caching for product fetches via SWR

---

## Quick Start

> For a full step-by-step guide, see **[SETUP.md](./SETUP.md)**.

```bash
# Install frontend deps
npm install
cp .env.example .env.local
npm run dev
```

```bash
# Start backend
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

- Storefront: **http://localhost:3000**
- Admin: **http://localhost:3000/admin**
- API: **http://localhost:4000/api**

**Seeded admin credentials**
- Email: `admin@viralgoods.com`
- Password: `admin12345`

---

## Environment Variables

### Frontend (`.env.local`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:4000/api`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional Google Analytics ID |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional Meta Pixel ID |

### Backend (`server/.env`)

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign admin JWTs |
| `PORT` | API port (default: `4000`) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `SMTP_HOST` | SMTP host for email receipts |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `FROM_EMAIL` | From email for receipts |
| `FROM_NAME` | From name for receipts |
| `ALIEXPRESS_APP_KEY` | AliExpress affiliate key |
| `ALIEXPRESS_APP_SECRET` | AliExpress affiliate secret |
| `ALIEXPRESS_TRACKING_ID` | AliExpress tracking ID |
| `ADMIN_EMAIL` | Admin seed email |
| `ADMIN_PASSWORD` | Admin seed password |

---

## API Highlights

**Public**
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/orders`
- `GET /api/orders/:orderNumber`

**Admin (JWT)**
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/stats`
- `GET /api/admin/products`
- `GET /api/admin/orders`
- `POST /api/admin/import`
- `GET /api/admin/aliexpress/search`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

---

## Deployment

### Frontend (Vercel)
1. Import the repo into Vercel
2. Set `.env.local` values in Vercel project settings
3. Deploy

### Backend (Railway, Render, Fly.io, etc.)
1. Provision MongoDB Atlas
2. Set environment variables from `server/.env.example`
3. Build: `npm run build`
4. Start: `npm start`

---

## Roadmap

The following items are planned or partially implemented:
- Admin UI for full product CRUD (create/edit/delete + asset uploads)
- Enhanced caching and ISR for product pages
- Google Analytics + Meta Pixel dashboard reporting
- Advanced admin auth (magic links, 2FA, token rotation)
- Customer accounts + order history
- CMS integration for landing page content
- Wishlist + inventory alerts

---

## Contributing

Contributions are welcome! Please open an issue or PR with context about what you are changing and why.
