import { Router } from 'express';
import { createLead, getLeads, getLead, updateLead } from '../controllers/lead.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Публичный endpoint для создания заявки с лендинга
router.post('/', createLead);

// Админ endpoints
router.get('/', requireAuth, requireAdmin, getLeads);
router.get('/:id', requireAuth, requireAdmin, getLead);
router.put('/:id', requireAuth, requireAdmin, updateLead);

export default router;
