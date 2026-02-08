# ViralGoods Local Setup Guide

This guide walks you through cloning, configuring, and running the ViralGoods storefront + API on macOS, Linux, or Windows. The project uses **Next.js 13 (App Router)** for the storefront and a separate **Express + MongoDB** backend.

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **Git**
- **MongoDB** (local install or Docker)
- **Optional**: Stripe test account (for checkout sessions)

## 1) Clone the repository

```bash
git clone https://github.com/ethantan000/test-store-IG.git
cd test-store-IG
```

## 2) Install frontend dependencies

From the repo root:

```bash
npm install
```

## 3) Configure frontend environment variables

Copy the example file and adjust if needed:

```bash
cp .env.example .env.local
```

**.env.local (frontend)**
- `NEXT_PUBLIC_SITE_URL` → usually `http://localhost:3000`
- `NEXT_PUBLIC_API_URL` → usually `http://localhost:4000/api`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` → optional Google Analytics ID
- `NEXT_PUBLIC_META_PIXEL_ID` → optional Meta Pixel ID

## 4) Install backend dependencies

```bash
cd server
npm install
```

## 5) Configure backend environment variables

```bash
cp .env.example .env
```

Update **server/.env** with your local values:

- `MONGODB_URI` → MongoDB connection string
- `JWT_SECRET` → any secure random string (64+ chars)
- `FRONTEND_URL` → `http://localhost:3000`
- `STRIPE_SECRET_KEY` → optional (if you want Stripe Checkout)
- `STRIPE_WEBHOOK_SECRET` → optional (only needed for webhooks)
- `SMTP_*` variables → optional (order emails)
- `ALIEXPRESS_*` variables → optional (AliExpress import)

## 6) Run MongoDB locally

### Option A: Docker (fastest)

```bash
docker run --name viralgoods-mongo -p 27017:27017 -d mongo:6
```

### Option B: MongoDB Community Server

- Download and install from https://www.mongodb.com/try/download/community
- Ensure `mongod` is running and listening on `mongodb://localhost:27017`

## 7) Seed the database

From the `server` directory:

```bash
npm run seed
```

This seeds:
- A default admin user
- Sample products and variants

**Default admin credentials (from seed):**
- Email: `admin@viralgoods.com`
- Password: `admin12345`

## 8) Start the backend API

From the `server` directory:

```bash
npm run dev
```

The API runs on: **http://localhost:4000**

## 9) Start the frontend

From the repo root:

```bash
npm run dev
```

The storefront runs on: **http://localhost:3000**

## 10) Verify key features

- **Browse products:** visit `/products`
- **Add to cart:** add a product from any product detail page
- **Checkout:**
  - If Stripe is configured, you’ll be redirected to Stripe Checkout
  - If Stripe is not configured, the app falls back to creating orders directly
- **Admin dashboard:** visit `/admin` and log in with the seeded credentials

## Common Errors & Fixes

### MongoDB connection fails
- Make sure `MONGODB_URI` matches your local MongoDB instance.
- Confirm MongoDB is running (`docker ps` or `mongod`).

### CORS errors in the browser
- Ensure `FRONTEND_URL` in `server/.env` matches the frontend URL.

### Stripe checkout fails
- Confirm `STRIPE_SECRET_KEY` is set in `server/.env`.
- If using webhooks, set `STRIPE_WEBHOOK_SECRET` and use `stripe listen`.

### Admin login fails after seed
- Re-run `npm run seed` to recreate the admin user.
- Ensure you are using the same database configured in `MONGODB_URI`.

## Optional: Stripe Webhooks (local)

```bash
stripe listen --forward-to localhost:4000/api/checkout/webhook
```

Then update `STRIPE_WEBHOOK_SECRET` in `server/.env` with the secret from the Stripe CLI output.

---

If you want a production deployment guide, see the **Deployment** section in `README.md`.
