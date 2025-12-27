const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tjukpkrqssgzvndbdnht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdWtwa3Jxc3NnenZuZGJkbmh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ1Nzk3MywiZXhwIjoyMDgxMDMzOTczfQ.P7IQQPJJn4deYXmkqsRKs8Bxpwk214ANDxpXkyFqxDc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCommentsTable() {
  console.log('Creating comments table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
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
      
      DROP POLICY IF EXISTS "Service role has full access to comments" ON comments;
      CREATE POLICY "Service role has full access to comments" ON comments
          FOR ALL
          USING (true)
          WITH CHECK (true);
    `
  });
  
  if (error) {
    console.log('RPC not available, trying direct query...');
    
    // Try direct table check
    const { data, error: checkError } = await supabase
      .from('comments')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Table does not exist. Please run the SQL manually in Supabase Dashboard.');
      console.log('\nSQL to run:');
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
      return;
    } else if (checkError) {
      console.error('Error checking table:', checkError);
      return;
    }
    
    console.log('Comments table already exists!');
    return;
  }
  
  console.log('Comments table created successfully!');
}

createCommentsTable();
