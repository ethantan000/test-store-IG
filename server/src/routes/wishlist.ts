import { Router, Response } from 'express';
import Customer from '../models/Customer';
import Product from '../models/Product';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.use(requireAuth);

// Get wishlist
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const products = await Product.find({
      _id: { $in: customer.wishlist },
      isActive: true,
    }).lean();

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
router.post('/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (customer.wishlist.includes(req.params.productId)) {
      res.json({ message: 'Already in wishlist', wishlist: customer.wishlist });
      return;
    }

    customer.wishlist.push(req.params.productId);
    await customer.save();

    res.status(201).json({ message: 'Added to wishlist', wishlist: customer.wishlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    customer.wishlist = customer.wishlist.filter((id) => id !== req.params.productId);
    await customer.save();

    res.json({ message: 'Removed from wishlist', wishlist: customer.wishlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
