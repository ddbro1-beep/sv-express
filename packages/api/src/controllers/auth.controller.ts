import { Request, Response, NextFunction } from 'express';
import supabase from '../config/database';
import { comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { AppError } from '../middleware/error.middleware';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Получить пользователя из БД
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Проверить пароль
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Обновить last_login_at
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Генерировать токены
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          emailVerified: user.email_verified,
        },
        token: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Проверить refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Генерировать новый access token
    const newAccessToken = generateAccessToken(payload);

    res.json({
      success: true,
      data: {
        token: newAccessToken,
      },
    });
  } catch (error) {
    next(new AppError('Invalid refresh token', 401));
  }
};

export default { login, refreshToken };
