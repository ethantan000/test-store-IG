import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { sendContactMessage } from '../services/email';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

router.post('/', validate(contactSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    await sendContactMessage({ name, email, message });
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
