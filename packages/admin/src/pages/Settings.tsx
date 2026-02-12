import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import settingsApi, { Setting } from '../api/settings';
import telegramApi, { AvailableChat } from '../api/telegram';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSend, setTestingSend] = useState(false);

  // Telegram form state
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [botTokenChanged, setBotTokenChanged] = useState(false);
  const [tokenIsMasked, setTokenIsMasked] = useState(false);

  // Chat discovery
  const [loadingChats, setLoadingChats] = useState(false);
  const [availableChats, setAvailableChats] = useState<AvailableChat[]>([]);
  const [showChatSelector, setShowChatSelector] = useState(false);

  const getSettingValue = (data: Setting[], key: string): string | null => {
    return data.find((s) => s.key === key)?.value || null;
  };

  const loadSettings = async () => {
    try {
      const data = await settingsApi.getAll();
      setSettings(data);
      const token = getSettingValue(data, 'telegram_bot_token') || '';
      setBotToken(token);
      setChatId(getSettingValue(data, 'telegram_chat_id') || '');
      setEnabled(getSettingValue(data, 'telegram_enabled') === 'true');
      setBotTokenChanged(false);
      setTokenIsMasked(token.includes('***'));
    } catch {
      toast.error('Не удалось загрузить настройки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveTelegram = async () => {
    setSaving(true);
    try {
      // Only update token if user changed it (to avoid saving masked value)
      if (botTokenChanged) {
        await settingsApi.update('telegram_bot_token', botToken || null);
      }
      await settingsApi.update('telegram_chat_id', chatId || null);
      await settingsApi.update('telegram_enabled', enabled ? 'true' : 'false');
      toast.success('Настройки Telegram сохранены');
      await loadSettings();
    } catch {
      toast.error('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingSend(true);
    try {
      await telegramApi.sendTest();
      toast.success('Тестовое сообщение отправлено!');
    } catch {
      toast.error('Не удалось отправить. Проверьте токен и Chat ID.');
    } finally {
      setTestingSend(false);
    }
  };

  const handleFindChats = async () => {
    console.log('[SETTINGS] Finding chats, token:', botToken ? 'exists' : 'missing', 'masked:', tokenIsMasked);

    setLoadingChats(true);
    try {
      console.log('[SETTINGS] Calling getChats API...');
      // Отправляем токен (даже если замаскирован), backend сам возьмёт из БД если нужно
      const chats = await telegramApi.getChats(botToken || '');
      console.log('[SETTINGS] Received chats:', chats);

      if (chats.length === 0) {
        toast.error('Не найдено чатов. Отправьте боту сообщение и попробуйте снова.');
      } else {
        setAvailableChats(chats);
        setShowChatSelector(true);
        toast.success(`Найдено чатов: ${chats.length}`);
      }
    } catch (error: any) {
      console.error('[SETTINGS] Error fetching chats:', error);
      const errorMessage = error?.response?.data?.error || 'Не удалось получить чаты. Проверьте токен.';
      toast.error(errorMessage);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleSelectChat = (chat: AvailableChat) => {
    setChatId(chat.chatId);
    setShowChatSelector(false);
    toast.success(`Выбран: ${chat.name}`);
  };

  // Keep-alive data
  const lastPing = getSettingValue(settings, 'keep_alive_last_ping');
  const lastStatus = getSettingValue(settings, 'keep_alive_last_status');

  const formatDate = (iso: string | null): string => {
    if (!iso) return 'Нет данных';
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if ping is stale (> 7 days)
  const isPingStale = (): boolean => {
    if (!lastPing) return true;
    const diff = Date.now() - new Date(lastPing).getTime();
    return diff > 7 * 24 * 60 * 60 * 1000;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Загрузка настроек...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>

        {/* Keep-Alive Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Статус системы</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Keep-Alive (Supabase)</span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    !isPingStale() && lastStatus === 'ok'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-sm font-medium text-gray-900">
                  {!isPingStale() && lastStatus === 'ok' ? 'Активен' : 'Нет ответа'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Последний пинг</span>
              <span className="text-sm text-gray-900">{formatDate(lastPing)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Статус</span>
              <span className="text-sm text-gray-900">{lastStatus || 'Нет данных'}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            GitHub Actions пингует Supabase каждые 6 дней для предотвращения засыпания.
          </p>
        </div>

        {/* Telegram Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Telegram уведомления</h2>
          <div className="space-y-4">
            {/* Bot Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => {
                  setBotToken(e.target.value);
                  setBotTokenChanged(true);
                  setTokenIsMasked(false);
                }}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                {tokenIsMasked
                  ? '✅ Токен сохранён и защищён'
                  : 'Получите у @BotFather в Telegram'}
              </p>
            </div>

            {/* Chat ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="-1001234567890"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={handleFindChats}
                  disabled={loadingChats}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors touch-manipulation whitespace-nowrap"
                >
                  {loadingChats ? 'Поиск...' : '🔍 Найти чаты'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                💡 {tokenIsMasked
                  ? 'Отправьте боту сообщение в Telegram, затем нажмите "Найти чаты"'
                  : 'Сначала сохраните Bot Token, затем отправьте боту сообщение и нажмите "Найти чаты"'}
              </p>
            </div>

            {/* Chat Selector Modal */}
            {showChatSelector && availableChats.length > 0 && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Выберите чат
                    </h3>
                    <button
                      onClick={() => setShowChatSelector(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-[60vh]">
                    {availableChats.map((chat) => (
                      <button
                        key={chat.chatId}
                        onClick={() => handleSelectChat(chat)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors touch-manipulation"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{chat.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {chat.type === 'private' && '👤 Личный чат'}
                              {chat.type === 'group' && '👥 Группа'}
                              {chat.type === 'supergroup' && '👥 Супергруппа'}
                              {chat.type === 'channel' && '📢 Канал'}
                              {chat.username && ` • @${chat.username}`}
                            </div>
                          </div>
                          <div className="text-xs font-mono text-gray-400">
                            {chat.chatId}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Enabled Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Включить уведомления</span>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors touch-manipulation ${
                  enabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveTelegram}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors touch-manipulation"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                onClick={handleTestTelegram}
                disabled={testingSend}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors touch-manipulation"
              >
                {testingSend ? 'Отправка...' : 'Отправить тест'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
