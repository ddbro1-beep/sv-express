import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export const getCountries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name_ru', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        countries: data || [],
      },
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to fetch countries', 500));
  }
};

export const getOriginCountries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_origin', true)
      .order('name_ru', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        countries: data || [],
      },
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to fetch countries', 500));
  }
};

export const getDestinationCountries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_destination', true)
      .order('name_ru', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        countries: data || [],
      },
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to fetch countries', 500));
  }
};
