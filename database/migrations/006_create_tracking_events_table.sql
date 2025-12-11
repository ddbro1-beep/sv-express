-- Create tracking events table for shipment timeline
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_by_admin_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    event_date TIMESTAMP DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE tracking_events IS 'Timeline of shipment tracking events';
