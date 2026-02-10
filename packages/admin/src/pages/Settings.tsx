import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import settingsApi, { Setting } from '../api/settings';
import telegramApi from '../api/telegram';

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

  const getSettingValue = (data: Setting[], key: string): string | null => {
    return data.find((s) => s.key === key)?.value || null;
  };

  const loadSettings = async () => {
    try {
      const data = await settingsApi.getAll();
      setSettings(data);
      setBotToken(getSettingValue(data, 'telegram_bot_token') || '');
      setChatId(getSettingValue(data, 'telegram_chat_id') || '');
      setEnabled(getSettingValue(data, 'telegram_enabled') === 'true');
      setBotTokenChanged(false);
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
                }}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                Получите у @BotFather в Telegram
              </p>
            </div>

            {/* Chat ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="-1001234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                Отправьте сообщение боту, затем откройте{' '}
                <code className="bg-gray-100 px-1 rounded">
                  https://api.telegram.org/bot{'<TOKEN>'}/getUpdates
                </code>{' '}
                — Chat ID будет в поле <code className="bg-gray-100 px-1 rounded">chat.id</code>
              </p>
            </div>

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
