import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Product from '../models/Product';
import Order from '../models/Order';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { fetchProduct, searchProducts } from '../services/aliexpress';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// Dashboard stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalProducts, activeProducts, dropshipProducts, orders, revenue] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isDropship: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const avgMargin = await Product.aggregate([
      { $match: { costPrice: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgMargin: { $avg: { $subtract: ['$price', '$costPrice'] } },
        },
      },
    ]);

    res.json({
      totalProducts,
      activeProducts,
      dropshipProducts,
      totalOrders: orders,
      totalRevenue: revenue[0]?.total || 0,
      averageMargin: avgMargin[0]?.avgMargin || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Import product from AliExpress by ID/URL
const importSchema = z.object({
  productIdOrUrl: z.string().min(1),
  customTitle: z.string().optional(),
  customDescription: z.string().optional(),
  brand: z.string().optional(),
  markupMultiplier: z.number().min(1).default(2.5),
  category: z.string().optional(),
});

router.post('/import', validate(importSchema), async (req: Request, res: Response) => {
  try {
    const { productIdOrUrl, customTitle, customDescription, brand, markupMultiplier, category } =
      req.body;

    const aeProduct = await fetchProduct(productIdOrUrl);
    if (!aeProduct) {
      res.status(404).json({ error: 'Product not found on AliExpress' });
      return;
    }

    // Only allow US-shipped products
    if (aeProduct.shippingFrom !== 'US') {
      res.status(400).json({ error: 'Only US-shipped products can be imported' });
      return;
    }

    const retailPrice = Math.round(aeProduct.price * markupMultiplier * 100) / 100;
    const compareAtPrice = Math.round(aeProduct.originalPrice * markupMultiplier * 100) / 100;

    const slug =
      (customTitle || aeProduct.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);

    const product = new Product({
      title: customTitle || aeProduct.title,
      slug,
      description: customDescription || aeProduct.description,
      brand: brand || 'ViralGoods',
      category: category || 'general',
      price: retailPrice,
      comparePrice: compareAtPrice,
      costPrice: aeProduct.price,
      images: aeProduct.images,
      variants: aeProduct.variants,
      isActive: true,
      isDropship: true,
      aliexpressId: aeProduct.productId,
      shippingFrom: aeProduct.shippingFrom,
      estimatedDelivery: aeProduct.estimatedDelivery,
      rating: aeProduct.rating,
      reviewCount: aeProduct.orders,
      tags: ['dropship', 'aliexpress'],
    });

    await product.save();

    res.status(201).json({
      product,
      importDetails: {
        costPrice: aeProduct.price,
        retailPrice,
        compareAtPrice,
        margin: retailPrice - aeProduct.price,
        marginPercent: Math.round(((retailPrice - aeProduct.price) / retailPrice) * 100),
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import product' });
  }
});

// Search AliExpress products
router.get('/aliexpress/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const page = parseInt((req.query.page as string) || '1', 10);

    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const products = await searchProducts(query, page);

    // Filter to US-shipped only
    const usProducts = products.filter((p) => p.shippingFrom === 'US');

    res.json({ products: usProducts, total: usProducts.length });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get all products (admin view - includes inactive)
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get all orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
