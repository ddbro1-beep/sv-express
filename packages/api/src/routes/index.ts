import { Router } from 'express';
import authRoutes from './auth.routes';
import leadRoutes from './lead.routes';
import countryRoutes from './country.routes';
import orderRoutes from './order.routes';
import commentRoutes from './comment.routes';
import trackingRoutes from './tracking.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/countries', countryRoutes);
router.use('/orders', orderRoutes);
router.use('/comments', commentRoutes);
router.use('/tracking', trackingRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
