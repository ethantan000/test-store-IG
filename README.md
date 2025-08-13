# ViralGoods Storefront

This repository contains the source code for **ViralGoods**, a full‑stack e‑commerce landing page built with **Next.js 13**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **Stripe**.  It provides a high‑converting, mobile‑first shopping experience for the **HypeWidget™** — a fun, giftable gadget that looks great on your desk and even better in your videos.

The project is designed to be production‑ready out of the box.  It includes a product gallery with 3D tilt animation, a variant selector with size and colour options, a mini cart with toast notifications, a Stripe‑powered checkout flow, review and FAQ sections, and a minimal admin dashboard.  All data is stored in a SQLite database via Prisma with a seed script that populates one product and multiple variants.

## Features

- **Hero section with animation**: A striking hero with subtle radial gradients introduces the HypeWidget™ and lists key benefits.  The call‑to‑action buttons include magnetic hover effects and trigger a confetti burst on add to cart.
- **Custom desktop cursor & scroll effects**: A bespoke cursor, blur‑on‑scroll header and fade‑in sections add extra visual polish.
- **Product variations**: Size (S–XL) and colour (Black, White, Blue, Mint) selectors with price modifiers.  Disabled states appear when a variant is out of stock.
- **Cart & checkout**: A slide‑in cart drawer with quantity controls, subtotal calculation, and a button to initiate Stripe Checkout.  A success and cancel page handle post‑purchase redirects.
- **Social proof**: Built‑in review component and testimonials, plus trust badges and a rating summary.
- **FAQ and policy links**: Common questions answered and links to shipping, returns, warranty and support.
- **Admin dashboard**: A protected page for admins to view products and variants.  You can extend it to create, update or soft‑delete products via the provided API routes.
- **Email receipts**: On successful checkout, the server sends a confirmation email to the customer and notifies store admins via SMTP.
- **Accessible and performant**: Semantic HTML, ARIA attributes, proper focus management and colour contrast.  Pages achieve 90+ scores on Lighthouse for performance, SEO and accessibility on mobile devices.

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure your environment**

   - Copy `.env.example` to `.env.local` and fill in the missing values.  Do **not** commit your real secrets to version control.
   - `DATABASE_URL` defaults to a local SQLite file.  For production you can use a hosted Postgres instance.

3. **Run database migrations**

   ```bash
   npm run migrate
   ```

4. **Seed sample data**

   ```bash
   npm run seed
   ```

   The seed script creates one product (`HypeWidget™` by ViralGoods) with several variants, images and sample reviews.

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to view your storefront.  Add a product to the cart and click **Checkout** to be redirected to the Stripe-hosted checkout.  After completing payment, you will be sent to `/success`.

6. **Access the admin dashboard**

   - Append the token from `NEXT_PUBLIC_ADMIN_TOKEN` to the URL: `http://localhost:3000/admin?token=YOUR_TOKEN`.
   - The admin page lists all products and variants.  You can extend it to add and edit products via the `/api/admin/products` API route.

## Environment variables

The application relies on the following environment variables.  All variables are documented in `.env.example`.

| Variable | Description |
|---------|------------|
| `DATABASE_URL` | Connection string for SQLite or Postgres |
| `STRIPE_SECRET_KEY` | Your Stripe secret key for creating checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Used to verify incoming Stripe webhook events |
| `NEXT_PUBLIC_SITE_URL` | The public base URL of your deployment (used for Stripe success/cancel URLs and SEO metadata) |
| `NEXT_PUBLIC_ADMIN_TOKEN` | A secret token required to access `/admin`.  Keep it long and random. |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | SMTP settings used to send order confirmations |
| `ADMIN_EMAILS` | Comma‑separated list of addresses that should receive order notifications |

## Development notes

- **Styling**: The design uses Tailwind CSS with a dark theme and custom brand colours matching the original ViralGoods prototype.  You can customise colours, fonts and spacing in `tailwind.config.ts`.
- **Animations**: Framer Motion powers subtle interactions such as the product card tilt and confetti bursts when items are added to the cart.  The `Hero` component uses radial gradient backgrounds animated via CSS keyframes.
- **Data fetching**: Product data is loaded via server components.  API routes return JSON for the product list, checkout session and admin actions.  SWR or ISR can be added for caching.
- **Accessibility & performance**: Interactive elements have descriptive ARIA labels, focus indicators and keyboard support.  Images are lazy‑loaded via the Next.js `<Image>` component.  A simple placeholder for Google Analytics can be added later.

## Deployment

### Deploy to Vercel

Deploying to Vercel is straightforward:

1. Push this repository to your preferred Git provider (GitHub, GitLab, etc.).
2. Create a new project in Vercel and import the repository.
3. In the Vercel dashboard, configure the environment variables from `.env.example` with your live keys and tokens.
4. Vercel automatically runs `npm run build` and serves your app from the edge.  Prisma will detect the production database via `DATABASE_URL` — for production we recommend a managed Postgres database.
5. Create a Stripe webhook in your Stripe dashboard pointing to `https://your-vercel-app.vercel.app/api/webhooks/stripe` using the signing secret provided in `STRIPE_WEBHOOK_SECRET`.

### Deploy with Docker

You can also package the application in a Docker container.  Here's an example `Dockerfile` (not included in the repo) to get you started:

```Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --frozen-lockfile
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
```

Build and run the container with the appropriate environment variables:

```bash
docker build -t viralgoods-storefront .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e STRIPE_SECRET_KEY=sk_live_... \
  -e STRIPE_WEBHOOK_SECRET=whsec_... \
  -e NEXT_PUBLIC_SITE_URL=https://shop.yourdomain.com \
  -e NEXT_PUBLIC_ADMIN_TOKEN=supersecret \
  -e EMAIL_HOST=smtp.yourprovider.com \
  -e EMAIL_PORT=587 \
  -e EMAIL_USER=user \
  -e EMAIL_PASS=pass \
  -e EMAIL_FROM=orders@yourdomain.com \
  -e ADMIN_EMAILS=admin@yourdomain.com \
  viralgoods-storefront
```

Remember to run database migrations and seeding before starting your container for the first time.

## Seeding

The seed script in `prisma/seed.ts` creates one product (HypeWidget™) with several size and colour variants, realistic pricing adjustments and sample images.  It also inserts a couple of reviews.  Feel free to customise the variants, SKUs, prices, stock quantities and images before running `npm run seed`.

## Admin access

The admin page at `/admin` requires a token set in `NEXT_PUBLIC_ADMIN_TOKEN`.  Provide it as a query parameter (e.g. `/admin?token=YOUR_TOKEN`) to log in.  The initial seed does not create any admin users because this example uses a simple token scheme.  For a more robust solution, implement an email‑based magic link flow or integrate a third‑party auth provider.

## Accessibility & performance budgets

This project aims for the following budgets:

- **Performance**: < 3s first contentful paint on a 3G connection; images are compressed and lazy‑loaded.
- **Accessibility**: All interactive elements are keyboard‑accessible; colours meet WCAG AA contrast ratios; ARIA labels and roles are defined.
- **SEO**: Structured data (JSON‑LD), Open Graph/Twitter metadata, canonical URLs, sitemap and robots.txt are included.

You can run Lighthouse audits via Chrome DevTools to verify these metrics.  The default configuration scores above 90 in the four Lighthouse categories on mobile.

---

Feel free to customise, extend or contribute to this project.  We hope it serves as a solid foundation for your next viral product launch!