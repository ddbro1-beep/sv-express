import supabase from '../config/database';

const TELEGRAM_API = 'https://api.telegram.org';

// Telegram API Response type
interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

// Chat info from getUpdates
interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

// Available chat for UI
export interface AvailableChat {
  chatId: string;
  name: string;
  type: string;
  username?: string;
}

// Send a message via Telegram Bot API
export const sendMessage = async (
  botToken: string,
  chatId: string,
  text: string
): Promise<boolean> => {
  try {
    const url = `${TELEGRAM_API}/bot${botToken}/sendMessage`;
    console.log('[TELEGRAM] Sending to:', url.replace(botToken, '***'));
    console.log('[TELEGRAM] Chat ID:', chatId);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json() as TelegramResponse;
    console.log('[TELEGRAM] API Response:', JSON.stringify(data, null, 2));

    if (!data.ok) {
      console.error('[TELEGRAM] API Error:', data.description);
    }

    return data.ok === true;
  } catch (error) {
    console.error('[TELEGRAM] Send error:', error);
    return false;
  }
};

// Send notification to admin using settings from DB
export const notifyAdmin = async (text: string): Promise<boolean> => {
  try {
    console.log('[TELEGRAM] Attempting to send notification...');

    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled']);

    if (error) {
      console.error('[TELEGRAM] DB error:', error);
      return false;
    }

    if (!settings) {
      console.error('[TELEGRAM] No settings found in DB');
      return false;
    }

    console.log('[TELEGRAM] Settings found:', settings.length, 'rows');

    const settingsMap: Record<string, string | null> = {};
    for (const row of settings) {
      settingsMap[row.key] = row.value;
    }

    console.log('[TELEGRAM] Settings map:', {
      enabled: settingsMap.telegram_enabled,
      hasToken: !!settingsMap.telegram_bot_token,
      hasChatId: !!settingsMap.telegram_chat_id,
    });

    if (settingsMap.telegram_enabled !== 'true') {
      console.log('[TELEGRAM] Notifications disabled');
      return false;
    }

    if (!settingsMap.telegram_bot_token || !settingsMap.telegram_chat_id) {
      console.log('[TELEGRAM] Missing token or chat_id');
      return false;
    }

    console.log('[TELEGRAM] Sending message to chat:', settingsMap.telegram_chat_id);
    const result = await sendMessage(
      settingsMap.telegram_bot_token,
      settingsMap.telegram_chat_id,
      text
    );

    console.log('[TELEGRAM] Send result:', result);
    return result;
  } catch (error) {
    console.error('[TELEGRAM] notifyAdmin error:', error);
    return false;
  }
};

// Get available chats from Telegram bot (via getUpdates)
export const getAvailableChats = async (
  botToken: string
): Promise<AvailableChat[]> => {
  try {
    console.log('[TELEGRAM] Fetching updates from Telegram...');

    const response = await fetch(
      `${TELEGRAM_API}/bot${botToken}/getUpdates?limit=100`,
      { method: 'GET' }
    );

    const data = (await response.json()) as TelegramResponse;

    if (!data.ok) {
      console.error('[TELEGRAM] getUpdates error:', data.description);
      return [];
    }

    const updates = (data.result as any[]) || [];
    console.log('[TELEGRAM] Received updates:', updates.length);

    // Extract unique chats
    const chatsMap = new Map<number, TelegramChat>();

    for (const update of updates) {
      const message = update.message || update.edited_message || update.channel_post;
      if (message?.chat) {
        const chat = message.chat as TelegramChat;
        chatsMap.set(chat.id, chat);
      }
    }

    // Convert to array with user-friendly names
    const availableChats: AvailableChat[] = Array.from(chatsMap.values()).map(
      (chat) => {
        let name = '';

        if (chat.type === 'private') {
          name = [chat.first_name, chat.last_name].filter(Boolean).join(' ');
        } else {
          name = chat.title || 'Unknown';
        }

        return {
          chatId: chat.id.toString(),
          name,
          type: chat.type,
          username: chat.username,
        };
      }
    );

    console.log('[TELEGRAM] Found unique chats:', availableChats.length);
    return availableChats;
  } catch (error) {
    console.error('[TELEGRAM] getAvailableChats error:', error);
    return [];
  }
};
