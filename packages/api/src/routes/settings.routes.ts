import { Router } from 'express';
import { getSettings, updateSetting } from '../controllers/settings.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Get all settings (admin only)
router.get('/', requireAuth, requireAdmin, getSettings);

// Update a setting by key (admin only)
router.put('/:key', requireAuth, requireAdmin, updateSetting);

export default router;
