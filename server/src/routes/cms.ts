import { Router, Request, Response } from 'express';
import { z } from 'zod';
import CmsContent from '../models/CmsContent';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createContentSchema = z.object({
  slug: z.string().min(1),
  type: z.enum(['page', 'banner', 'announcement', 'faq', 'policy']),
  title: z.string().min(1),
  body: z.string().min(1),
  metadata: z.record(z.string()).optional(),
  isPublished: z.boolean().default(false),
});

const updateContentSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  metadata: z.record(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

// Public: Get published content by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const content = await CmsContent.findOne({
      slug: req.params.slug,
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

// Public: Get published content by type
router.get('/type/:type', async (req: Request, res: Response) => {
  try {
    const content = await CmsContent.find({
      type: req.params.type,
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Admin: List all content
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const content = await CmsContent.find().sort({ updatedAt: -1 }).lean();
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Admin: Create content
router.post('/', requireAuth, validate(createContentSchema), async (req: Request, res: Response) => {
  try {
    const content = new CmsContent({
      ...req.body,
      publishedAt: req.body.isPublished ? new Date() : undefined,
    });
    await content.save();
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Admin: Update content
router.put('/:id', requireAuth, validate(updateContentSchema), async (req: Request, res: Response) => {
  try {
    const update: Record<string, unknown> = { ...req.body };
    if (req.body.isPublished) {
      update.publishedAt = new Date();
    }

    const content = await CmsContent.findByIdAndUpdate(req.params.id, update, {
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
    const content = await CmsContent.findByIdAndDelete(req.params.id);
    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

export default router;
