import { Router } from 'express';
import { sendTestMessage, sendNotification, getChats } from '../controllers/telegram.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Get available chats (admin only)
router.post('/chats', requireAuth, requireAdmin, getChats);

// Send test message (admin only)
router.post('/test', requireAuth, requireAdmin, sendTestMessage);

// Send custom notification (admin only)
router.post('/send', requireAuth, requireAdmin, sendNotification);

export default router;
