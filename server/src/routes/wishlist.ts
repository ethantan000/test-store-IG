import { Router, Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// All wishlist routes require authentication
router.use(requireAuth);

// Get user's wishlist
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.userId }).populate({
      path: 'items.productId',
      select: 'title slug price comparePrice images rating reviewCount variants isActive',
    });

    if (!wishlist) {
      res.json({ items: [] });
      return;
    }

    // Filter out inactive products
    const activeItems = wishlist.items.filter(
      (item) => item.productId && (item.productId as unknown as { isActive: boolean }).isActive
    );

    res.json({ items: activeItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add item to wishlist
router.post('/add', async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    let wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, items: [] });
    }

    const exists = wishlist.items.some(
      (item) => item.productId.toString() === productId
    );

    if (exists) {
      res.status(400).json({ error: 'Product already in wishlist' });
      return;
    }

    wishlist.items.push({ productId, addedAt: new Date() });
    await wishlist.save();

    res.json({ message: 'Added to wishlist', count: wishlist.items.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove item from wishlist
router.delete('/remove/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      res.status(404).json({ error: 'Wishlist not found' });
      return;
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== req.params.productId
    );
    await wishlist.save();

    res.json({ message: 'Removed from wishlist', count: wishlist.items.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
