const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('Supabase URL:', process.env.SUPABASE_URL);
  console.log('Checking users in database...');

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name');

    if (error) {
      console.error('Error:', error.message, error);
      return;
    }

    console.log('Users found:', users?.length || 0);
    if (users && users.length > 0) {
      users.forEach(u => console.log('  - ' + u.email + ' (' + u.role + ')'));
    }

    const adminExists = users?.some(u => u.email === 'admin@sv-express.com');

    if (!adminExists) {
      console.log('\nCreating admin user...');
      const hash = await bcrypt.hash('Admin123!', 10);

      const { error: createError } = await supabase
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

      if (createError) {
        console.error('Create error:', createError.message);
      } else {
        console.log('Admin created!');
        console.log('Email: admin@sv-express.com');
        console.log('Password: Admin123!');
      }
    } else {
      console.log('\nResetting admin password...');
      const hash = await bcrypt.hash('Admin123!', 10);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: hash })
        .eq('email', 'admin@sv-express.com');

      if (updateError) {
        console.error('Update error:', updateError.message);
      } else {
        console.log('Password reset to: Admin123!');
      }
    }
  } catch (err) {
    console.error('Caught error:', err.message);
    console.error('Full error:', err);
  }
}

main().catch(console.error);
