import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import supabase from '../config/database';
import { sendMessage, getAvailableChats } from '../services/telegram.service';
import { AppError } from '../middleware/error.middleware';

// Send a test message to verify Telegram configuration
export const sendTestMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'telegram_chat_id']);

    if (error) throw new AppError(error.message, 500);

    const settingsMap: Record<string, string | null> = {};
    for (const row of settings || []) {
      settingsMap[row.key] = row.value;
    }

    const botToken = settingsMap.telegram_bot_token;
    const chatId = settingsMap.telegram_chat_id;

    if (!botToken || !chatId) {
      throw new AppError('Telegram bot token and chat ID must be configured first', 400);
    }

    const success = await sendMessage(
      botToken,
      chatId,
      'SV Express Admin — тестовое сообщение. Telegram уведомления работают!'
    );

    if (!success) {
      throw new AppError('Failed to send Telegram message. Check bot token and chat ID.', 400);
    }

    res.json({ success: true, data: { message: 'Test message sent successfully' } });
  } catch (error) {
    next(error);
  }
};

// Send a custom notification (admin only)
export const sendNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text } = req.body;

    if (!text) {
      throw new AppError('Text is required', 400);
    }

    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'telegram_chat_id']);

    if (error) throw new AppError(error.message, 500);

    const settingsMap: Record<string, string | null> = {};
    for (const row of settings || []) {
      settingsMap[row.key] = row.value;
    }

    const botToken = settingsMap.telegram_bot_token;
    const chatId = settingsMap.telegram_chat_id;

    if (!botToken || !chatId) {
      throw new AppError('Telegram bot token and chat ID must be configured first', 400);
    }

    const success = await sendMessage(botToken, chatId, text);

    if (!success) {
      throw new AppError('Failed to send Telegram message', 500);
    }

    res.json({ success: true, data: { message: 'Notification sent' } });
  } catch (error) {
    next(error);
  }
};

// Get available chats from Telegram (via getUpdates)
export const getChats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let { botToken } = req.body;

    // If no token provided or token is masked, get from DB
    if (!botToken || botToken.includes('***')) {
      console.log('[TELEGRAM] Token not provided or masked, fetching from DB...');

      const { data: settings, error } = await supabase
        .from('settings')
        .select('key, value')
        .eq('key', 'telegram_bot_token')
        .single();

      if (error || !settings?.value) {
        throw new AppError('Bot token not found in settings. Please enter a token first.', 400);
      }

      botToken = settings.value;
      console.log('[TELEGRAM] Using saved token from DB');
    }

    console.log('[TELEGRAM] Getting available chats...');
    const chats = await getAvailableChats(botToken);

    if (!chats || chats.length === 0) {
      throw new AppError(
        'No chats found. Please send a message to the bot first.',
        404
      );
    }

    console.log('[TELEGRAM] Found chats:', chats.length);
    res.json({ success: true, data: { chats } });
  } catch (error) {
    next(error);
  }
};

export default { sendTestMessage, sendNotification, getChats };
