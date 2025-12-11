-- Create shipments table for main shipment/order records
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) NOT NULL,
    assigned_admin_id UUID REFERENCES users(id),

    -- Shipment details
    shipment_type VARCHAR(50) NOT NULL,
    weight_kg DECIMAL(10,2) NOT NULL,
    declared_value_eur DECIMAL(10,2),

    -- Origin
    origin_country_id INTEGER REFERENCES countries(id) NOT NULL,
    origin_address TEXT NOT NULL,
    origin_city VARCHAR(100),
    origin_postal_code VARCHAR(20),

    -- Destination
    destination_country_id INTEGER REFERENCES countries(id) NOT NULL,
    destination_address TEXT NOT NULL,
    destination_city VARCHAR(100),
    destination_postal_code VARCHAR(20),
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(50),

    -- Pricing
    price_eur DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',

    -- Status
    status VARCHAR(50) DEFAULT 'created',
    current_location VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    pickup_date DATE,
    estimated_delivery_date DATE,
    delivered_at TIMESTAMP,

    -- Additional
    notes TEXT,
    customs_declaration TEXT,
    insurance_amount_eur DECIMAL(10,2),

    CONSTRAINT valid_shipment_status CHECK (status IN ('created', 'pickup_scheduled', 'in_transit', 'customs', 'out_for_delivery', 'delivered', 'cancelled')),
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded'))
);

-- Create trigger for shipments table
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE shipments IS 'Main shipment and order records';
