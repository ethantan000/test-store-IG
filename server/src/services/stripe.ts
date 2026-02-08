import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as Stripe.LatestApiVersion })
  : null;

export interface CheckoutItem {
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export async function createCheckoutSession(
  items: CheckoutItem[],
  customerEmail: string,
  orderId: string
): Promise<{ url: string; sessionId: string } | null> {
  if (!stripe) {
    console.warn('Stripe not configured — returning mock session');
    return {
      url: `${FRONTEND_URL}/checkout/success?order=${orderId}&mock=true`,
      sessionId: `mock_session_${orderId}`,
    };
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.title,
        ...(item.image ? { images: [item.image] } : {}),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: customerEmail,
    metadata: { orderId },
    success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`,
    cancel_url: `${FRONTEND_URL}/checkout?cancelled=true`,
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
  });

  return { url: session.url!, sessionId: session.id };
}

export async function retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null;
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function constructWebhookEvent(
  body: Buffer,
  signature: string
): Promise<Stripe.Event | null> {
  if (!stripe) return null;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
