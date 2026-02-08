import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { requireAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.post('/', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const outputPath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(outputPath);

    const publicUrl = `${process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`}/uploads/${filename}`;

    res.json({ url: publicUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
