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

async function createSettingsTable() {
  console.log('🔨 Creating settings table...');

  const sql = `
-- Create settings table (key-value store for app configuration)
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default settings
INSERT INTO settings (key, value) VALUES
    ('keep_alive_last_ping', NULL),
    ('keep_alive_last_status', NULL),
    ('telegram_bot_token', NULL),
    ('telegram_chat_id', NULL),
    ('telegram_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'settings'
        AND policyname = 'Service role has full access to settings'
    ) THEN
        CREATE POLICY "Service role has full access to settings" ON settings
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
  `.trim();

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Error creating table:', error.message);

    // Try alternative method - direct HTTP request
    console.log('\n🔄 Trying direct SQL execution...');
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey!,
        'Authorization': `Bearer ${supabaseServiceKey!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed:', errorText);
      console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/tjukpkrqssgzvndbdnht/sql');
      console.log('\nSQL:');
      console.log(sql);
    } else {
      console.log('✅ Table created successfully!');
    }
  } else {
    console.log('✅ Table created successfully!');
    console.log('Data:', data);
  }
}

createSettingsTable().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
