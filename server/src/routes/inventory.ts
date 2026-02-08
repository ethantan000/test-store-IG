import { Router, Request, Response } from 'express';
import InventoryAlert from '../models/InventoryAlert';
import Product from '../models/Product';
import { requireAuth } from '../middleware/auth';
import { processAutoReorders, checkInventoryLevels } from '../services/inventory';

const router = Router();

// All inventory routes require admin auth
router.use(requireAuth);

// Get all active alerts
router.get('/alerts', async (_req: Request, res: Response) => {
  try {
    const alerts = await InventoryAlert.find({ isResolved: false })
      .populate('productId', 'title slug images')
      .sort({ createdAt: -1 })
      .lean();

    const resolved = await InventoryAlert.countDocuments({ isResolved: true });
    const active = alerts.length;

    res.json({ alerts, stats: { active, resolved } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert history
router.get('/alerts/history', async (req: Request, res: Response) => {
  try {
    const alerts = await InventoryAlert.find()
      .populate('productId', 'title slug')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert history' });
  }
});

// Resolve an alert manually
router.put('/alerts/:id/resolve', async (req: Request, res: Response) => {
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

// Configure auto-reorder for an alert
router.put('/alerts/:id/auto-reorder', async (req: Request, res: Response) => {
  try {
    const { autoReorder, reorderQuantity } = req.body;
    const alert = await InventoryAlert.findByIdAndUpdate(
      req.params.id,
      { autoReorder, reorderQuantity: reorderQuantity || 50 },
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update auto-reorder' });
  }
});

// Trigger auto-reorder processing
router.post('/auto-reorder', async (_req: Request, res: Response) => {
  try {
    const result = await processAutoReorders();
    res.json({ message: 'Auto-reorder processed', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Auto-reorder failed' });
  }
});

// Run inventory check for all products
router.post('/check', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true }).select('_id');
    for (const product of products) {
      await checkInventoryLevels(product._id.toString());
    }
    res.json({ message: `Checked ${products.length} products` });
  } catch (error) {
    res.status(500).json({ error: 'Inventory check failed' });
  }
});

// Bulk restock
router.post('/restock', async (req: Request, res: Response) => {
  try {
    const { productId, variantSku, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      res.status(404).json({ error: 'Variant not found' });
      return;
    }

    variant.stock += quantity;
    await product.save();

    // Resolve any related alerts
    await InventoryAlert.updateMany(
      { productId, variantSku, isResolved: false },
      { isResolved: true, resolvedAt: new Date() }
    );

    res.json({ message: `Restocked ${quantity} units`, newStock: variant.stock });
  } catch (error) {
    res.status(500).json({ error: 'Restock failed' });
  }
});

export default router;
