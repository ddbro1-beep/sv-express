const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigrations() {
  console.log('Running migrations...');

  // Create users table using raw SQL via Supabase
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(50),
        role VARCHAR(20) NOT NULL DEFAULT 'customer',
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login_at TIMESTAMP
      );
    `
  });

  if (createError) {
    // If rpc doesn't work, try direct insert as workaround
    console.log('RPC not available, trying direct table creation...');

    // Check if we can access via REST - table might already exist
    const { data, error: checkError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (checkError && checkError.code === 'PGRST205') {
      console.log('Table does not exist. Please create it manually in Supabase SQL Editor.');
      console.log('\nCopy and run this SQL in Supabase Dashboard -> SQL Editor:\n');
      console.log(`
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- Create index on email
CREATE INDEX idx_users_email ON users(email);
      `);
      return;
    }
  }

  console.log('Migrations completed (or table already exists).');
}

async function createAdmin() {
  console.log('\nCreating admin user...');

  const password = 'Admin123!';
  const hash = await bcrypt.hash(password, 10);

  // First check if admin exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'admin@sv-express.com')
    .single();

  if (existing) {
    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hash })
      .eq('email', 'admin@sv-express.com');

    if (error) {
      console.error('Error updating admin:', error.message);
    } else {
      console.log('Admin password updated!');
      console.log('Email: admin@sv-express.com');
      console.log('Password: Admin123!');
    }
  } else {
    // Create new admin
    const { error } = await supabase
      .from('users')
      .insert({
        email: 'admin@sv-express.com',
        password_hash: hash,
        first_name: 'Admin',
        last_name: 'SV Express',
        phone: '+33753540436',
        role: 'admin',
        email_verified: true
      });

    if (error) {
      console.error('Error creating admin:', error.message);
    } else {
      console.log('Admin created!');
      console.log('Email: admin@sv-express.com');
      console.log('Password: Admin123!');
    }
  }
}

async function main() {
  await runMigrations();
  await createAdmin();
}

main().catch(console.error);
