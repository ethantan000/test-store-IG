import { Router, Request, Response } from 'express';
import { z } from 'zod';
import ABTest from '../models/ABTest';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createTestSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  variants: z
    .array(
      z.object({
        name: z.string(),
        weight: z.number().min(0).max(100).default(50),
        config: z.record(z.string()).optional(),
      })
    )
    .min(2),
  endDate: z.string().optional(),
});

// Public: Get assigned variant for a test
router.get('/assign/:slug', async (req: Request, res: Response) => {
  try {
    const test = await ABTest.findOne({ slug: req.params.slug, isActive: true });
    if (!test || test.variants.length === 0) {
      res.status(404).json({ error: 'Test not found or inactive' });
      return;
    }

    // Weighted random assignment
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
    await ABTest.updateOne(
      { _id: test._id, 'variants.name': selectedVariant.name },
      { $inc: { 'variants.$.impressions': 1 } }
    );

    res.json({
      testSlug: test.slug,
      variant: selectedVariant.name,
      config: selectedVariant.config,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign variant' });
  }
});

// Public: Record conversion
router.post('/convert/:slug/:variantName', async (req: Request, res: Response) => {
  try {
    const result = await ABTest.updateOne(
      { slug: req.params.slug, 'variants.name': req.params.variantName, isActive: true },
      { $inc: { 'variants.$.conversions': 1 } }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'Test or variant not found' });
      return;
    }

    res.json({ recorded: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record conversion' });
  }
});

// Admin: List all tests
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const tests = await ABTest.find().sort({ createdAt: -1 }).lean();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// Admin: Get test details with stats
router.get('/:slug/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const test = await ABTest.findOne({ slug: req.params.slug }).lean();
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    const stats = test.variants.map((v) => ({
      name: v.name,
      impressions: v.impressions,
      conversions: v.conversions,
      conversionRate: v.impressions > 0 ? ((v.conversions / v.impressions) * 100).toFixed(2) + '%' : '0%',
    }));

    res.json({ test, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test stats' });
  }
});

// Admin: Create test
router.post('/', requireAuth, validate(createTestSchema), async (req: Request, res: Response) => {
  try {
    const test = new ABTest({
      ...req.body,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    });
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// Admin: Toggle test active state
router.patch('/:id/toggle', requireAuth, async (req: Request, res: Response) => {
  try {
    const test = await ABTest.findById(req.params.id);
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    test.isActive = !test.isActive;
    await test.save();

    res.json(test);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle test' });
  }
});

// Admin: Delete test
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const test = await ABTest.findByIdAndDelete(req.params.id);
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }
    res.json({ message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

export default router;
