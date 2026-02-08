import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import Customer from '../models/Customer';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthRequest } from '../types';

const router = Router();

const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
});

// Get reviews for a product (public)
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const { sort = 'createdAt', order = 'desc' } = req.query as Record<string, string>;
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));

    const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };

    const [reviews, total] = await Promise.all([
      Review.find({ productId: req.params.productId })
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments({ productId: req.params.productId }),
    ]);

    const ratingBreakdown = await Review.aggregate([
      { $match: { productId: req.params.productId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingBreakdown.forEach((r) => {
      breakdown[r._id] = r.count;
    });

    res.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      ratingBreakdown: breakdown,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review (authenticated customer)
router.post('/', requireAuth, validate(createReviewSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, title, body } = req.body;

    const customer = await Customer.findById(req.userId);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if already reviewed
    const existing = await Review.findOne({ productId, customerId: req.userId });
    if (existing) {
      res.status(400).json({ error: 'You have already reviewed this product' });
      return;
    }

    // Check if verified purchase
    const hasOrder = await Order.findOne({
      customerEmail: customer.email,
      'items.productId': productId,
      status: { $in: ['processing', 'shipped', 'delivered'] },
    });

    const review = new Review({
      productId,
      customerId: req.userId,
      customerName: customer.name,
      rating,
      title,
      body,
      isVerifiedPurchase: !!hasOrder,
    });

    await review.save();

    // Update product rating
    const stats = await Review.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      product.rating = Math.round(stats[0].avgRating * 10) / 10;
      product.reviewCount = stats[0].count;
      await product.save();
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Mark review as helpful (public)
router.post('/:reviewId/helpful', async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    res.json({ helpful: review.helpful });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

export default router;
