import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public: Get reviews for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const { sort = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, parseInt(limit, 10));

    const [reviews, total] = await Promise.all([
      Review.find({ productId: req.params.productId, isApproved: true })
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ productId: req.params.productId, isApproved: true }),
    ]);

    // Calculate rating summary
    const ratingAgg = await Review.aggregate([
      { $match: { productId: req.params.productId, isApproved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
          r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        },
      },
    ]);

    const summary = ratingAgg[0] || { avgRating: 0, count: 0, r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 };

    res.json({
      reviews,
      summary: {
        averageRating: Math.round((summary.avgRating || 0) * 10) / 10,
        totalReviews: summary.count,
        distribution: { 1: summary.r1, 2: summary.r2, 3: summary.r3, 4: summary.r4, 5: summary.r5 },
      },
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Public: Submit a review
const createReviewSchema = z.object({
  productId: z.string(),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  body: z.string().min(10).max(2000),
});

router.post('/', validate(createReviewSchema), async (req: Request, res: Response) => {
  try {
    const { productId, customerEmail } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if verified purchase
    const hasOrdered = await Order.findOne({
      customerEmail,
      'items.productId': productId,
      status: { $in: ['processing', 'shipped', 'delivered'] },
    });

    // Prevent duplicate reviews from same email
    const existingReview = await Review.findOne({ productId, customerEmail });
    if (existingReview) {
      res.status(400).json({ error: 'You have already reviewed this product' });
      return;
    }

    const review = new Review({
      ...req.body,
      isVerifiedPurchase: !!hasOrdered,
    });
    await review.save();

    // Update product rating
    const ratingAgg = await Review.aggregate([
      { $match: { productId: product._id, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (ratingAgg[0]) {
      product.rating = Math.round(ratingAgg[0].avg * 10) / 10;
      product.reviewCount = ratingAgg[0].count;
      await product.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Public: Mark review as helpful
router.post('/:id/helpful', async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Admin: Get all reviews (including unapproved)
router.get('/admin/all', requireAuth, async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('productId', 'title slug').lean();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Admin: Approve/reject review
router.put('/:id/approve', requireAuth, async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.approved },
      { new: true }
    );
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

export default router;
