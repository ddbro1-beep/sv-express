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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initSettings() {
  console.log('🔨 Initializing settings...\n');

  const settings = [
    { key: 'keep_alive_last_ping', value: null },
    { key: 'keep_alive_last_status', value: null },
    { key: 'telegram_bot_token', value: null },
    { key: 'telegram_chat_id', value: null },
    { key: 'telegram_enabled', value: 'false' },
  ];

  for (const setting of settings) {
    console.log(`📝 Creating setting: ${setting.key}...`);

    const { data, error } = await supabase
      .from('settings')
      .upsert(setting, { onConflict: 'key', ignoreDuplicates: false })
      .select();

    if (error) {
      console.error(`❌ Error: ${error.message}`);

      if (error.message.includes('does not exist')) {
        console.log('\n⚠️  Table settings does not exist!');
        console.log('📋 Please create the table manually in Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/tjukpkrqssgzvndbdnht/sql\n');
        console.log('SQL:');
        console.log(`
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to settings" ON settings
    FOR ALL
    USING (true)
    WITH CHECK (true);
        `);
        process.exit(1);
      }
    } else {
      console.log(`✅ ${setting.key}: ${data ? 'Created/Updated' : 'Skipped'}`);
    }
  }

  console.log('\n🎉 Settings initialized successfully!');
}

initSettings().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
