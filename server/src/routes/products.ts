import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Product from '../models/Product';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public: Get all active products
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      search,
      sort = 'createdAt',
      order = 'desc',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }

    const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Product list error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Public: Get single product by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean();

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Admin: Create product
const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  brand: z.string().optional(),
  category: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  images: z.array(z.string().url()).min(1),
  variants: z
    .array(
      z.object({
        color: z.string(),
        size: z.string(),
        sku: z.string(),
        stock: z.number().int().min(0),
        priceModifier: z.number().optional(),
      })
    )
    .optional(),
  isDropship: z.boolean().optional(),
  aliexpressId: z.string().optional(),
  shippingFrom: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

router.post('/', requireAuth, validate(createProductSchema), async (req: Request, res: Response) => {
  try {
    const slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    const product = new Product({ ...req.body, slug });
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: Update product
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: Delete product
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
