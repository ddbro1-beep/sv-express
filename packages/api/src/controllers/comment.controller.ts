import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import supabase from '../config/database';
import { AppError } from '../middleware/error.middleware';

// Get comments for an entity (lead or order)
export const getComments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, id } = req.params;

    if (!['lead', 'order'].includes(type)) {
      throw new AppError('Invalid entity type', 400);
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_type', type)
      .eq('entity_id', id)
      .order('created_at', { ascending: true });

    // Handle case where comments table doesn't exist yet
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        // Table doesn't exist - return empty array gracefully
        return res.json({
          success: true,
          data: [],
        });
      }
      throw new AppError(error.message, 500);
    }

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    next(error);
  }
};

// Create a comment
export const createComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { entity_type, entity_id, content } = req.body;

    if (!['lead', 'order'].includes(entity_type)) {
      throw new AppError('Invalid entity type', 400);
    }

    if (!entity_id || !content) {
      throw new AppError('entity_id and content are required', 400);
    }

    const user = req.user;
    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'System';

    const { data, error } = await supabase
      .from('comments')
      .insert({
        entity_type,
        entity_id,
        user_id: user?.id || null,
        user_name: userName,
        content,
      })
      .select()
      .single();

    // Handle case where comments table doesn't exist yet
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        throw new AppError('Comments table not yet created. Please run migrations.', 503);
      }
      throw new AppError(error.message, 500);
    }

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export default { getComments, createComment };
