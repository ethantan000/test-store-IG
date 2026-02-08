import { Router, Request, Response } from 'express';
import { z } from 'zod';
import InventoryAlert from '../models/InventoryAlert';
import Product from '../models/Product';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { triggerAutoReorder, checkInventoryLevels } from '../services/inventory';

const router = Router();

router.use(requireAuth);

// Get all alerts
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { resolved } = req.query;
    const filter: Record<string, unknown> = {};
    if (resolved === 'false') filter.isResolved = false;
    if (resolved === 'true') filter.isResolved = true;

    const alerts = await InventoryAlert.find(filter).sort({ createdAt: -1 }).lean();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get low stock products
router.get('/low-stock', async (req: Request, res: Response) => {
  try {
    const threshold = parseInt((req.query.threshold as string) || '5', 10);

    const products = await Product.find({ isActive: true }).lean();

    const lowStockItems = products.flatMap((product) =>
      product.variants
        .filter((v) => v.stock <= threshold)
        .map((v) => ({
          productId: product._id,
          productTitle: product.title,
          variantSku: v.sku,
          color: v.color,
          size: v.size,
          currentStock: v.stock,
        }))
    );

    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// Trigger auto-reorder for an alert
router.post('/reorder/:alertId', async (req: Request, res: Response) => {
  try {
    const result = await triggerAutoReorder(req.params.alertId);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger reorder' });
  }
});

// Update reorder settings
const updateSettingsSchema = z.object({
  threshold: z.number().int().min(0).optional(),
  reorderQuantity: z.number().int().min(1).optional(),
});

router.put('/alerts/:id', validate(updateSettingsSchema), async (req: Request, res: Response) => {
  try {
    const alert = await InventoryAlert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Resolve alert manually
router.post('/alerts/:id/resolve', async (req: Request, res: Response) => {
  try {
    const alert = await InventoryAlert.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Run inventory check for all products
router.post('/check-all', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true });
    for (const product of products) {
      await checkInventoryLevels(product._id.toString());
    }
    res.json({ message: `Checked inventory for ${products.length} products` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check inventory' });
  }
});

export default router;
