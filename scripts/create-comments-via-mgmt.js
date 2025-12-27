const https = require('https');

// Using Supabase database connection directly through pg
const { Client } = require('pg');

// Supabase project: tjukpkrqssgzvndbdnht
// Password from env or default
const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres.tjukpkrqssgzvndbdnht:' + 
  (process.env.SUPABASE_DB_PASSWORD || 'YOUR_PASSWORD') + 
  '@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

async function createTable() {
  console.log('Note: To create the comments table, run the following SQL in Supabase Dashboard:');
  console.log('Go to: https://supabase.com/dashboard/project/tjukpkrqssgzvndbdnht/sql/new');
  console.log('\n--- SQL TO RUN ---\n');
  
  const sql = `
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
`;
  
  console.log(sql);
}

createTable();
