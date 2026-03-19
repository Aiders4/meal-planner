import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import { findUserByUsername } from '../db/queries/users.js';
import { getPartners, addPartner, removePartner } from '../db/queries/partners.js';

const MAX_PARTNERS = 10;

const router = Router();

const partnerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(requireAuth);

// GET /api/partners
router.get('/', async (req, res, next) => {
  try {
    const partners = await getPartners(req.user!.userId);
    res.json({ partners });
  } catch (err) {
    next(err);
  }
});

// POST /api/partners
router.post('/', partnerLimiter, async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const userId = req.user!.userId;
    const partner = await findUserByUsername(username.trim().toLowerCase());

    if (!partner) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (partner.id === userId) {
      res.status(400).json({ error: 'You cannot add yourself as a cooking partner' });
      return;
    }

    const existing = await getPartners(userId);
    if (existing.length >= MAX_PARTNERS) {
      res.status(400).json({ error: `Maximum of ${MAX_PARTNERS} cooking partners allowed` });
      return;
    }
    if (existing.some((p) => p.id === partner.id)) {
      res.status(409).json({ error: 'Already a cooking partner' });
      return;
    }

    await addPartner(userId, partner.id);
    const partners = await getPartners(userId);
    res.status(201).json({ partners });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/partners/:partnerId
router.delete('/:partnerId', async (req, res, next) => {
  try {
    const partnerId = Number(req.params.partnerId);
    if (!Number.isInteger(partnerId) || partnerId <= 0) {
      res.status(400).json({ error: 'Invalid partner ID' });
      return;
    }

    const removed = await removePartner(req.user!.userId, partnerId);
    if (!removed) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
