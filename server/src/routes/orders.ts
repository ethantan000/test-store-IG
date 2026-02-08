import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Order from '../models/Order';
import Product from '../models/Product';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
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
  customerId: z.string().optional(),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().default('US'),
  }),
});

function generateOrderNumber(): string {
  const prefix = 'VG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Create order (guest checkout fallback)
router.post('/', validate(createOrderSchema), async (req: Request, res: Response) => {
  try {
    const { items, customerEmail, customerName, customerId, shippingAddress } = req.body;

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
        variant: {
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
        },
        image: product.images[0] || '',
      });

      // Decrement stock
      variant.stock -= item.quantity;
      await product.save();

      // Check inventory levels
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
      customerId,
      shippingAddress,
    });

    await order.save();

    // Send order confirmation email (fire and forget)
    sendOrderConfirmation({
      orderNumber: order.orderNumber,
      customerName,
      customerEmail,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order by number (for confirmation page)
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

// Admin: Update order status (sends shipping update email)
const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
});

router.patch('/:orderNumber/status', requireAuth, validate(updateStatusSchema), async (req: Request, res: Response) => {
  try {
    const { status, trackingNumber, trackingUrl } = req.body;

    const update: Record<string, unknown> = { status };
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (trackingUrl) update.trackingUrl = trackingUrl;

    const order = await Order.findOneAndUpdate(
      { orderNumber: req.params.orderNumber },
      update,
      { new: true }
    );

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Send shipping update email for relevant status changes
    if (['processing', 'shipped', 'delivered'].includes(status)) {
      sendShippingUpdate({
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        status,
        trackingNumber,
        trackingUrl,
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
