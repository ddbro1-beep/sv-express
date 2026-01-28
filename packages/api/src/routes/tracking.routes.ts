import express from 'express';
import { trackPackage } from '../controllers/tracking.controller';

const router = express.Router();

// Public route - no auth required
router.get('/:code', trackPackage);

export default router;
