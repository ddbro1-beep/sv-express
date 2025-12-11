import { Router } from 'express';
import authRoutes from './auth.routes';
import leadRoutes from './lead.routes';
import countryRoutes from './country.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/countries', countryRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
