import { Router } from 'express';
import { sendTestMessage, sendNotification } from '../controllers/telegram.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Send test message (admin only)
router.post('/test', requireAuth, requireAdmin, sendTestMessage);

// Send custom notification (admin only)
router.post('/send', requireAuth, requireAdmin, sendNotification);

export default router;
