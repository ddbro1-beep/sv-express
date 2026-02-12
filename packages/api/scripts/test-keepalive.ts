import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const KEEPALIVE_SECRET = process.env.KEEPALIVE_SECRET;

async function testKeepAlive() {
  console.log('🔔 Тестирование Keep-Alive пинга...\n');

  if (!KEEPALIVE_SECRET) {
    console.error('❌ KEEPALIVE_SECRET не задан в .env');
    process.exit(1);
  }

  try {
    console.log('📍 URL:', `${API_URL}/keepalive/log`);
    console.log('🔑 Secret:', KEEPALIVE_SECRET.substring(0, 10) + '***');
    console.log('');

    const response = await fetch(`${API_URL}/keepalive/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Keepalive-Secret': KEEPALIVE_SECRET,
      },
      body: JSON.stringify({ status: 'ok' }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Keep-alive пинг успешен!');
      console.log('📋 Данные:', JSON.stringify(data, null, 2));
      console.log('');
      console.log('💡 Обновите страницу Settings в админке - статус должен стать зелёным!');
    } else {
      console.error('❌ Ошибка:', data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
    process.exit(1);
  }
}

testKeepAlive();
