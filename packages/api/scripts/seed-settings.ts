import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load production environment variables
dotenv.config({ path: resolve(__dirname, '../.env.production') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedSettings() {
  console.log('🌱 Seeding settings table...');

  const settings = [
    { key: 'keep_alive_last_ping', value: null },
    { key: 'keep_alive_last_status', value: null },
    { key: 'telegram_bot_token', value: null },
    { key: 'telegram_chat_id', value: null },
    { key: 'telegram_enabled', value: 'false' },
  ];

  for (const setting of settings) {
    const { error } = await supabase
      .from('settings')
      .upsert(setting, { onConflict: 'key' });

    if (error) {
      console.error(`❌ Error inserting ${setting.key}:`, error.message);
    } else {
      console.log(`✅ Inserted: ${setting.key}`);
    }
  }

  console.log('🎉 Settings seeded successfully!');
}

seedSettings().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
