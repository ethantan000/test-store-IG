import { Router, Request, Response } from 'express';
import { z } from 'zod';
import AbTest from '../models/AbTest';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public: Get active test variant for a given test key
router.get('/variant/:key', async (req: Request, res: Response) => {
  try {
    const test = await AbTest.findOne({ key: req.params.key, isActive: true }).lean();
    if (!test || test.variants.length === 0) {
      res.json({ variant: null });
      return;
    }

    // Weighted random selection
    const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedVariant = test.variants[0];

    for (const variant of test.variants) {
      random -= variant.weight;
      if (random <= 0) {
        selectedVariant = variant;
        break;
      }
    }

    // Increment impressions
    await AbTest.updateOne(
      { _id: test._id, 'metrics.variantId': selectedVariant.id },
      { $inc: { 'metrics.$.impressions': 1 } }
    );

    res.json({ testId: test._id, variant: selectedVariant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get test variant' });
  }
});

// Public: Track conversion
router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { testId, variantId } = req.body;
    await AbTest.updateOne(
      { _id: testId, 'metrics.variantId': variantId },
      { $inc: { 'metrics.$.conversions': 1 } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track conversion' });
  }
});

// Admin: List all tests
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const tests = await AbTest.find().sort({ createdAt: -1 }).lean();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// Admin: Create test
const createTestSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1).regex(/^[a-z0-9-]+$/),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    weight: z.number().min(0).max(100),
    content: z.record(z.unknown()).optional(),
  })).min(2),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

router.post('/', requireAuth, validate(createTestSchema), async (req: Request, res: Response) => {
  try {
    const metrics = req.body.variants.map((v: { id: string }) => ({
      variantId: v.id,
      impressions: 0,
      conversions: 0,
    }));

    const test = new AbTest({ ...req.body, metrics });
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// Admin: Update test
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const test = await AbTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update test' });
  }
});

// Admin: Delete test
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await AbTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

export default router;
