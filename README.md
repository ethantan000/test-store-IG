# ViralGoods - Full-Stack E-Commerce Storefront

A production-ready full-stack e-commerce platform for dropshipping, built with **Next.js 13**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, and **MongoDB**. Designed for Instagram ad-driven traffic with a blue/purple premium aesthetic.

## Architecture

```
viralgoods/
├── app/                    # Next.js 13 App Router pages
│   ├── page.tsx            # Landing page (hero, categories, featured products)
│   ├── products/           # Product catalog & detail pages
│   ├── checkout/           # Guest checkout flow
│   ├── admin/              # Admin dashboard (login-protected)
│   └── layout.tsx          # Root layout with navbar, cart, footer
├── components/
│   ├── ui/                 # Reusable UI (MotionDiv, Skeleton, Toast)
│   ├── layout/             # Navbar, Footer
│   ├── product/            # ProductCard, ProductDetail
│   ├── cart/               # CartDrawer
│   └── admin/              # Admin components
├── lib/                    # API client, utilities
├── store/                  # Zustand stores (cart, auth)
├── server/                 # Express.js backend
│   └── src/
│       ├── models/         # MongoDB models (Product, User, Order)
│       ├── routes/         # API routes (auth, products, admin, orders)
│       ├── middleware/      # Auth (JWT), validation (Zod)
│       ├── services/       # AliExpress API integration
│       └── index.ts        # Server entry point
└── tailwind.config.ts      # Blue/purple theme configuration
```

## Features

### Consumer-Facing
- Responsive landing page optimized for Instagram ad traffic
- Product catalog with search, category filtering, and sorting
- Product detail pages with variant selection (color/size), image gallery
- Animated cart drawer with persistent localStorage state
- Guest checkout with order confirmation
- Skeleton loading states, error handling, empty states
- Framer Motion animations throughout
- Trust signals and social proof elements

### Admin Dashboard
- Secure JWT-based admin authentication
- Dashboard with product/order/revenue statistics
- Product management (activate/deactivate products)
- AliExpress product import (by ID/URL or keyword search)
- Configurable markup multiplier and branding
- US-shipped products only filter
- Order management view

### Technical
- Blue (#0070f3) and purple (#a855f7) color system with WCAG compliance
- TypeScript throughout (frontend and backend)
- Zustand for state management with persistence
- MongoDB with Mongoose ODM
- JWT authentication with bcrypt password hashing
- Rate limiting, CORS, input validation (Zod)
- Responsive mobile-first design
- Custom cursor, scroll animations

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Frontend Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run seed    # Creates admin user + sample products
npm run dev     # Starts on port 4000
```

### 3. Access the App

- **Storefront**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:4000/api

Default admin credentials (from seed):
- Email: `admin@viralgoods.com`
- Password: `admin12345`

## Environment Variables

### Frontend (.env.local)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Frontend URL (default: http://localhost:3000) |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: http://localhost:4000/api) |

### Backend (server/.env)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `PORT` | Server port (default: 4000) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `ALIEXPRESS_APP_KEY` | AliExpress Affiliate API key |
| `ALIEXPRESS_APP_SECRET` | AliExpress Affiliate API secret |
| `ALIEXPRESS_TRACKING_ID` | AliExpress tracking ID |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `ADMIN_EMAIL` | Default admin email for seed |
| `ADMIN_PASSWORD` | Default admin password for seed |

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

### Backend (Railway / Render / Heroku)
1. Set `MONGODB_URI` to a MongoDB Atlas connection string
2. Set remaining environment variables
3. Build command: `npm run build`
4. Start command: `npm start`

## API Endpoints

### Public
- `GET /api/products` - List products (supports ?category, ?search, ?sort, ?order, ?page, ?limit)
- `GET /api/products/:slug` - Get single product
- `POST /api/orders` - Create order (guest checkout)
- `GET /api/orders/:orderNumber` - Get order details

### Admin (requires Bearer token)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/products` - All products (including inactive)
- `GET /api/admin/orders` - All orders
- `POST /api/admin/import` - Import product from AliExpress
- `GET /api/admin/aliexpress/search?q=query` - Search AliExpress
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Future Roadmap
- Stripe Payments integration (checkout sessions)
- Consumer user accounts and order history
- Headless CMS for content management
- Google Analytics / Meta Pixel integration
- A/B testing for landing page variants
- Email notifications (order confirmation, shipping updates)
- Wishlist functionality
- Product reviews system
- Inventory alerts and auto-reorder
