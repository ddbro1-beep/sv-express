import { Router } from 'express';
import { createOrder, getOrders, getOrder, updateOrder, deleteOrder, getOrderPdf } from '../controllers/order.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public endpoint for creating order from landing page
router.post('/', createOrder);

// Admin endpoints
router.get('/', requireAuth, requireAdmin, getOrders);
router.get('/:id', requireAuth, requireAdmin, getOrder);
router.get('/:id/pdf', requireAuth, requireAdmin, getOrderPdf);
router.put('/:id', requireAuth, requireAdmin, updateOrder);
router.delete('/:id', requireAuth, requireAdmin, deleteOrder);

export default router;
