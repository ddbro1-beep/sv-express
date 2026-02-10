import { Request, Response, NextFunction } from 'express';
import supabase from '../config/database';
import { AppError } from '../middleware/error.middleware';

// Log keep-alive ping result (called from GitHub Actions)
export const logKeepAlive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const secret = req.headers['x-keepalive-secret'];
    const expectedSecret = process.env.KEEPALIVE_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      throw new AppError('Unauthorized', 401);
    }

    const { status } = req.body;
    const timestamp = new Date().toISOString();

    // Update both settings in parallel
    const [pingResult, statusResult] = await Promise.all([
      supabase
        .from('settings')
        .update({ value: timestamp, updated_at: timestamp })
        .eq('key', 'keep_alive_last_ping'),
      supabase
        .from('settings')
        .update({ value: status || 'ok', updated_at: timestamp })
        .eq('key', 'keep_alive_last_status'),
    ]);

    if (pingResult.error || statusResult.error) {
      const errMsg = pingResult.error?.message || statusResult.error?.message;
      throw new AppError(errMsg || 'Failed to update settings', 500);
    }

    res.json({
      success: true,
      data: { timestamp, status: status || 'ok' },
    });
  } catch (error) {
    next(error);
  }
};

export default { logKeepAlive };
