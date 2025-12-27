import { Router } from 'express';
import { getComments, createComment } from '../controllers/comment.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Get comments for an entity (admin only)
router.get('/:type/:id', requireAuth, requireAdmin, getComments);

// Create a comment (admin only)
router.post('/', requireAuth, requireAdmin, createComment);

export default router;
