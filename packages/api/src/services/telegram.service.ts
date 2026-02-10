import supabase from '../config/database';

const TELEGRAM_API = 'https://api.telegram.org';

// Telegram API Response type
interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

// Send a message via Telegram Bot API
export const sendMessage = async (
  botToken: string,
  chatId: string,
  text: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json() as TelegramResponse;
    return data.ok === true;
  } catch (error) {
    console.error('[TELEGRAM] Send error:', error);
    return false;
  }
};

// Send notification to admin using settings from DB
export const notifyAdmin = async (text: string): Promise<boolean> => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled']);

    if (error || !settings) return false;

    const settingsMap: Record<string, string | null> = {};
    for (const row of settings) {
      settingsMap[row.key] = row.value;
    }

    if (settingsMap.telegram_enabled !== 'true') return false;
    if (!settingsMap.telegram_bot_token || !settingsMap.telegram_chat_id) return false;

    return await sendMessage(
      settingsMap.telegram_bot_token,
      settingsMap.telegram_chat_id,
      text
    );
  } catch (error) {
    console.error('[TELEGRAM] notifyAdmin error:', error);
    return false;
  }
};
