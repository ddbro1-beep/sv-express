const { Client } = require('pg');
require('dotenv').config();

// Build connection config manually due to special chars in password
// Using pooler connection
const dbConfig = {
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.tjukpkrqssgzvndbdnht',
  password: '!6WtH/K5&Cq8rN+',
  ssl: { rejectUnauthorized: false }
};

async function createCommentsTable() {
  console.log('Connecting to database...');

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('Connected!');

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

      DROP POLICY IF EXISTS "Service role has full access to comments" ON comments;
      CREATE POLICY "Service role has full access to comments" ON comments
          FOR ALL
          USING (true)
          WITH CHECK (true);
    `;

    console.log('Creating comments table...');
    await client.query(sql);
    console.log('Comments table created successfully!');

    // Verify
    const { rows } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'comments'
    `);
    console.log('\nTable columns:', rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

createCommentsTable();
