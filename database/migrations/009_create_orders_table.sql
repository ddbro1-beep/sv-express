-- Create orders table for declaration form submissions
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Sender info
    sender_email VARCHAR(255),
    sender_phone VARCHAR(50),
    sender_name VARCHAR(255),
    sender_country VARCHAR(100),
    sender_city VARCHAR(100),
    sender_address TEXT,
    sender_address2 TEXT,
    sender_postcode VARCHAR(20),

    -- Recipient info
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

    -- Parcel info
    weight_kg DECIMAL(10,2),
    length_cm INTEGER,
    width_cm INTEGER,
    height_cm INTEGER,

    -- Items (JSON array)
    items JSONB DEFAULT '[]'::jsonb,

    -- Collection info
    collection_method VARCHAR(50),
    collection_date DATE,
    collection_time VARCHAR(50),

    -- Payment
    payment_method VARCHAR(50),

    -- Agreements
    agree_terms BOOLEAN DEFAULT FALSE,
    agree_overweight BOOLEAN DEFAULT FALSE,
    agree_insurance BOOLEAN DEFAULT FALSE,

    -- Status and meta
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access to orders" ON orders
    FOR ALL
    USING (true)
    WITH CHECK (true);
