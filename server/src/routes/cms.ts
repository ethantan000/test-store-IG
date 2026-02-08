import { Router, Request, Response } from 'express';
import { z } from 'zod';
import CmsContent from '../models/CmsContent';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public: Get published content by key
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const content = await CmsContent.findOne({
      key: req.params.key,
      isPublished: true,
    }).lean();

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Public: Get all published content by type
router.get('/type/:contentType', async (req: Request, res: Response) => {
  try {
    const contents = await CmsContent.find({
      contentType: req.params.contentType,
      isPublished: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Admin: List all content
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const contents = await CmsContent.find().sort({ updatedAt: -1 }).lean();
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Admin: Create content
const createContentSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  contentType: z.enum(['page', 'banner', 'announcement', 'faq', 'policy']),
  isPublished: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

router.post('/', requireAuth, validate(createContentSchema), async (req: Request, res: Response) => {
  try {
    const existing = await CmsContent.findOne({ key: req.body.key });
    if (existing) {
      res.status(400).json({ error: 'Content key already exists' });
      return;
    }

    const content = new CmsContent(req.body);
    await content.save();
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Admin: Update content
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const content = await CmsContent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Admin: Delete content
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await CmsContent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

export default router;
