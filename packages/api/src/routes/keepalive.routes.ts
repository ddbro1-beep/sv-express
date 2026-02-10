import { Router } from 'express';
import { logKeepAlive } from '../controllers/keepalive.controller';

const router = Router();

// Log keep-alive ping (authenticated via X-Keepalive-Secret header)
router.post('/log', logKeepAlive);

export default router;
