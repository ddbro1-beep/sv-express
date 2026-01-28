import { Request, Response, NextFunction } from 'express';
import { fetchTrackingInfo } from '../services/tracking.service';
import { AppError } from '../middleware/error.middleware';

// Helper to extract error message from unknown error type
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unknown error';
}

/**
 * GET /api/tracking/:code
 * Track a package by its tracking number
 */
export const trackPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;
    const lang = (req.query.lang as string) || 'ru';

    if (!code || code.trim().length < 3) {
      throw new AppError('Invalid tracking number', 400);
    }

    const trackingNumber = code.trim().toUpperCase();
    const result = await fetchTrackingInfo(trackingNumber, lang);

    // Build response with fallback URL for frontend
    res.json({
      success: true,
      data: {
        ...result,
        fallbackUrl: `https://track.global/${lang}?tracking=${encodeURIComponent(trackingNumber)}`,
      },
    });
  } catch (error: unknown) {
    next(new AppError(getErrorMessage(error) || 'Failed to track package', 500));
  }
};
