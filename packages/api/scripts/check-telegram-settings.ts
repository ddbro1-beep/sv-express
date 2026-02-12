import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTelegramSettings() {
  console.log('🔍 Checking Telegram settings...\n');

  // Check if settings table exists
  const { data: tables, error: tablesError } = await supabase
    .from('settings')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.error('❌ Settings table does not exist or error:', tablesError.message);
    console.log('\n💡 Run: npm run create-settings-table');
    return;
  }

  // Get Telegram settings
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .in('key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled']);

  if (error) {
    console.error('❌ Error fetching settings:', error.message);
    return;
  }

  console.log('📋 Current Telegram settings:\n');

  if (!settings || settings.length === 0) {
    console.log('⚠️  No Telegram settings found!');
    console.log('\n💡 Run: npm run seed-settings');
    return;
  }

  settings.forEach((setting: { key: string; value: string | null }) => {
    let displayValue = setting.value;
    if (setting.key === 'telegram_bot_token' && setting.value) {
      displayValue = setting.value.substring(0, 10) + '***' + setting.value.slice(-4);
    }
    console.log(`  ${setting.key}: ${displayValue || 'NOT SET'}`);
  });

  console.log('\n📊 Status:');
  const settingsMap: Record<string, string | null> = {};
  settings.forEach((s: { key: string; value: string | null }) => {
    settingsMap[s.key] = s.value;
  });

  const enabled = settingsMap.telegram_enabled === 'true';
  const hasToken = !!settingsMap.telegram_bot_token;
  const hasChatId = !!settingsMap.telegram_chat_id;

  console.log(`  ✓ Enabled: ${enabled ? '✅ Yes' : '❌ No'}`);
  console.log(`  ✓ Bot Token: ${hasToken ? '✅ Set' : '❌ Not set'}`);
  console.log(`  ✓ Chat ID: ${hasChatId ? '✅ Set' : '❌ Not set'}`);

  if (enabled && hasToken && hasChatId) {
    console.log('\n✅ Telegram notifications are configured!');
  } else {
    console.log('\n⚠️  Telegram notifications are NOT fully configured');
    console.log('\n💡 To configure:');
    console.log('  1. Open Admin Panel: http://localhost:5173');
    console.log('  2. Go to Settings');
    console.log('  3. Enter Bot Token and Chat ID');
    console.log('  4. Enable notifications');
  }
}

checkTelegramSettings().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
