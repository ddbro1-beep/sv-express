const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createCommentsTable() {
  console.log('Creating comments table...');

  // Check if table exists by trying to query it
  const { data, error: checkError } = await supabase
    .from('comments')
    .select('id')
    .limit(1);

  if (!checkError) {
    console.log('Comments table already exists!');
    return;
  }

  if (checkError.code !== 'PGRST205' && !checkError.message.includes('does not exist')) {
    console.log('Table might exist. Error:', checkError.message);
    return;
  }

  console.log('Table does not exist. Please create it manually in Supabase SQL Editor.');
  console.log('Go to: https://supabase.com/dashboard/project/tjukpkrqssgzvndbdnht/sql/new');
  console.log('\n--- Copy and paste this SQL ---\n');
  console.log(`
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to comments" ON comments
    FOR ALL
    USING (true)
    WITH CHECK (true);
  `);
}

createCommentsTable().catch(console.error);
