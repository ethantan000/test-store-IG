import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Customer from '../models/Customer';
import Order from '../models/Order';
import { generateToken, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthRequest } from '../types';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

const addressSchema = z.object({
  label: z.string().default('Home'),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().default('US'),
  isDefault: z.boolean().default(false),
});

// Register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const customer = new Customer({ email, password, name, phone });
    await customer.save();

    const token = generateToken(customer._id.toString());

    res.status(201).json({
      token,
      customer: {
        id: customer._id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await customer.comparePassword(password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(customer._id.toString());

    res.json({
      token,
      customer: {
        id: customer._id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get profile
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findById(req.userId).select('-password');
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/me', requireAuth, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add shipping address
router.post('/me/addresses', requireAuth, validate(addressSchema), async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    if (req.body.isDefault) {
      customer.shippingAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    customer.shippingAddresses.push(req.body);
    await customer.save();

    res.status(201).json(customer.shippingAddresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Delete shipping address
router.delete('/me/addresses/:index', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const index = parseInt(req.params.index, 10);
    if (index < 0 || index >= customer.shippingAddresses.length) {
      res.status(400).json({ error: 'Invalid address index' });
      return;
    }

    customer.shippingAddresses.splice(index, 1);
    await customer.save();

    res.json(customer.shippingAddresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// Get order history
router.get('/me/orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const orders = await Order.find({ customerEmail: customer.email })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

export default router;
