const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('Attempting to create orders table via Supabase...');

  // Check if we can insert into orders (might fail if table doesn't exist)
  const testData = {
    sender_email: 'test@test.com',
    sender_phone: '+33123456789',
    sender_name: 'Test User',
    sender_country: 'FR',
    sender_city: 'Paris',
    sender_address: '123 Rue Test',
    sender_postcode: '75001',
    recipient_name: 'Recipient Test',
    recipient_phone: '+7999123456',
    recipient_country: 'RU',
    recipient_city: 'Moscow',
    recipient_street: 'ul. Testovaya',
    recipient_house: '1',
    recipient_postcode: '123456',
    recipient_delivery_service: 'cdek',
    weight_kg: 5.5,
    items: [{ description: 'Test item', quantity: 1, price: 10 }],
    collection_method: 'courier',
    payment_method: 'bank_transfer',
    agree_terms: true,
    agree_overweight: true,
    status: 'new'
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.log('Error:', error.message);
    console.log('Code:', error.code);

    if (error.message.includes('Could not find the table') || error.code === 'PGRST205') {
      console.log('\n===========================================');
      console.log('TABLE "orders" DOES NOT EXIST!');
      console.log('Please run this SQL in Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/tjukpkrqssgzvndbdnht/sql/new');
      console.log('===========================================\n');

      console.log(`
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_email VARCHAR(255),
    sender_phone VARCHAR(50),
    sender_name VARCHAR(255),
    sender_country VARCHAR(100),
    sender_city VARCHAR(100),
    sender_address TEXT,
    sender_address2 TEXT,
    sender_postcode VARCHAR(20),
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(50),
    recipient_country VARCHAR(100),
    recipient_region VARCHAR(100),
    recipient_city VARCHAR(100),
    recipient_street VARCHAR(255),
    recipient_house VARCHAR(50),
    recipient_apartment VARCHAR(50),
    recipient_postcode VARCHAR(20),
    recipient_delivery_service VARCHAR(100),
    weight_kg DECIMAL(10,2),
    length_cm INTEGER,
    width_cm INTEGER,
    height_cm INTEGER,
    items JSONB DEFAULT '[]'::jsonb,
    collection_method VARCHAR(50),
    collection_date DATE,
    collection_time VARCHAR(50),
    payment_method VARCHAR(50),
    agree_terms BOOLEAN DEFAULT FALSE,
    agree_overweight BOOLEAN DEFAULT FALSE,
    agree_insurance BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);
      `);
    }
    return;
  }

  console.log('Success! Test order created:', data.id);

  // Delete test order
  await supabase.from('orders').delete().eq('id', data.id);
  console.log('Test order deleted.');
}

main().catch(console.error);
