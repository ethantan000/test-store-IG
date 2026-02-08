import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import Order from '../models/Order';
import Product from '../models/Product';
import { validate } from '../middleware/validate';
import { sendOrderConfirmation } from '../services/email';
import { checkInventoryLevels } from '../services/inventory';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16' as Stripe.LatestApiVersion,
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantSku: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().default('US'),
  }),
  customerId: z.string().optional(),
});

function generateOrderNumber(): string {
  const prefix = 'VG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Create Stripe checkout session
router.post('/create-session', validate(checkoutSchema), async (req: Request, res: Response) => {
  try {
    const { items, customerEmail, customerName, shippingAddress, customerId } = req.body;

    // Validate inventory and build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        res.status(400).json({ error: `Product not found: ${item.productId}` });
        return;
      }

      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (!variant) {
        res.status(400).json({ error: `Variant not found: ${item.variantSku}` });
        return;
      }

      if (variant.stock < item.quantity) {
        res.status(400).json({
          error: `Insufficient stock for ${product.title} (${variant.color}/${variant.size}). Available: ${variant.stock}`,
        });
        return;
      }

      const itemPrice = product.price + (variant.priceModifier || 0);
      subtotal += itemPrice * item.quantity;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            description: `${variant.color} / ${variant.size}`,
            images: product.images.slice(0, 1),
          },
          unit_amount: Math.round(itemPrice * 100),
        },
        quantity: item.quantity,
      });

      orderItems.push({
        productId: product._id.toString(),
        title: product.title,
        price: itemPrice,
        quantity: item.quantity,
        variant: { color: variant.color, size: variant.size, sku: variant.sku },
        image: product.images[0] || '',
      });
    }

    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;
    const orderNumber = generateOrderNumber();

    // Add shipping as line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax' },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout`,
      metadata: {
        orderNumber,
        customerName,
        customerEmail,
        customerId: customerId || '',
        shippingAddress: JSON.stringify(shippingAddress),
        orderItems: JSON.stringify(orderItems),
        subtotal: subtotal.toString(),
        shipping: shipping.toString(),
        tax: tax.toString(),
        total: total.toString(),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook handler
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ error: 'Webhook signature verification failed' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    try {
      const orderItems = JSON.parse(metadata.orderItems || '[]');
      const shippingAddress = JSON.parse(metadata.shippingAddress || '{}');

      // Decrement stock
      for (const item of orderItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          const variant = product.variants.find((v: { sku: string }) => v.sku === item.variant.sku);
          if (variant) {
            variant.stock -= item.quantity;
            await product.save();
            await checkInventoryLevels(item.productId);
          }
        }
      }

      const order = new Order({
        orderNumber: metadata.orderNumber,
        items: orderItems,
        subtotal: parseFloat(metadata.subtotal),
        shipping: parseFloat(metadata.shipping),
        tax: parseFloat(metadata.tax),
        total: parseFloat(metadata.total),
        customerEmail: metadata.customerEmail,
        customerName: metadata.customerName,
        customerId: metadata.customerId || undefined,
        shippingAddress,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        status: 'processing',
      });

      await order.save();

      // Send confirmation email
      await sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: orderItems,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        shippingAddress,
      });
    } catch (err) {
      console.error('Error processing checkout completion:', err);
    }
  }

  res.json({ received: true });
});

// Verify session (for success page)
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const orderNumber = session.metadata?.orderNumber;

    if (!orderNumber) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = await Order.findOne({ orderNumber }).lean();
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

export default router;
