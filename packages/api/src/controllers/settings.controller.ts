import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import supabase from '../config/database';
import { AppError } from '../middleware/error.middleware';

// Mask sensitive values
const maskValue = (key: string, value: string | null): string | null => {
  if (!value) return null;
  if (key === 'telegram_bot_token' && value.length > 14) {
    return value.slice(0, 10) + '***' + value.slice(-4);
  }
  return value;
};

// Get all settings
export const getSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key');

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        return res.json({ success: true, data: [] });
      }
      throw new AppError(error.message, 500);
    }

    const masked = (data || []).map((row: { key: string; value: string | null; updated_at: string }) => ({
      ...row,
      value: maskValue(row.key, row.value),
    }));

    res.json({ success: true, data: masked });
  } catch (error) {
    next(error);
  }
};

// Update a single setting by key
export const updateSetting = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!key) {
      throw new AppError('Setting key is required', 400);
    }

    const { data, error } = await supabase
      .from('settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        throw new AppError('Settings table not yet created. Please run migrations.', 503);
      }
      throw new AppError(error.message, 500);
    }

    if (!data) {
      throw new AppError(`Setting "${key}" not found`, 404);
    }

    res.json({
      success: true,
      data: { ...data, value: maskValue(data.key, data.value) },
    });
  } catch (error) {
    next(error);
  }
};

export default { getSettings, updateSetting };
