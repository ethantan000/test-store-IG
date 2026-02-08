import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Order from '../models/Order';
import Product from '../models/Product';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';
import { createCheckoutSession, constructWebhookEvent } from '../services/stripe';
import { sendOrderConfirmation, sendShippingUpdate } from '../services/email';
import { checkInventoryLevels } from '../services/inventory';

const router = Router();

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantSku: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
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
  useStripe: z.boolean().optional(),
});

function generateOrderNumber(): string {
  const prefix = 'VG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Create order (guest or authenticated checkout)
router.post('/', validate(createOrderSchema), async (req: Request, res: Response) => {
  try {
    const { items, customerEmail, customerName, shippingAddress, useStripe } = req.body;

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

      orderItems.push({
        productId: product._id.toString(),
        title: product.title,
        price: itemPrice,
        quantity: item.quantity,
        variant: { color: variant.color, size: variant.size, sku: variant.sku },
        image: product.images[0] || '',
      });

      variant.stock -= item.quantity;
      await product.save();
      await checkInventoryLevels(product._id.toString());
    }

    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      customerEmail,
      customerName,
      shippingAddress,
    });

    if (useStripe) {
      const checkoutItems = orderItems.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));
      if (shipping > 0) {
        checkoutItems.push({ title: 'Shipping', price: shipping, quantity: 1, image: '' });
      }
      if (tax > 0) {
        checkoutItems.push({ title: 'Tax', price: tax, quantity: 1, image: '' });
      }

      const session = await createCheckoutSession(checkoutItems, customerEmail, order.orderNumber);
      if (session) {
        order.stripeSessionId = session.sessionId;
        order.status = 'pending';
        await order.save();
        res.status(201).json({ order, checkoutUrl: session.url });
        return;
      }
    }

    order.status = 'processing';
    await order.save();

    await sendOrderConfirmation({
      orderNumber: order.orderNumber,
      customerName,
      customerEmail,
      items: orderItems.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
      subtotal,
      shipping,
      tax,
      total,
    });

    res.status(201).json({ order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/:orderNumber', async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean();
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.get('/history/:email', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

router.get('/user/my-orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const User = (await import('../models/User')).default;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const orders = await Order.find({ customerEmail: user.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.put('/:orderNumber/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    order.status = status;
    await order.save();

    if (['processing', 'shipped', 'delivered'].includes(status)) {
      await sendShippingUpdate(order.customerEmail, order.orderNumber, status, trackingNumber);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.post('/webhook/stripe', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    const event = await constructWebhookEvent(req.body, signature);
    if (!event) {
      res.json({ received: true });
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { metadata?: { orderId?: string }; payment_intent?: string };
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await Order.findOne({ orderNumber: orderId });
        if (order) {
          order.status = 'processing';
          order.stripePaymentIntentId = session.payment_intent as string;
          await order.save();

          await sendOrderConfirmation({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
            subtotal: order.subtotal,
            shipping: order.shipping,
            tax: order.tax,
            total: order.total,
          });
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;
