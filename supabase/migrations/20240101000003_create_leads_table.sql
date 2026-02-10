-- Create leads table for customer inquiries from landing page
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    origin_country_id INTEGER REFERENCES countries(id),
    destination_country_id INTEGER REFERENCES countries(id),
    weight_estimate_kg DECIMAL(10,2),
    shipment_type VARCHAR(50),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new',
    converted_to_user_id UUID REFERENCES users(id),
    assigned_to_admin_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    contacted_at TIMESTAMP,
    CONSTRAINT valid_lead_status CHECK (status IN ('new', 'contacted', 'converted', 'lost'))
);

-- Create trigger for leads table
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE leads IS 'Customer inquiries from the landing page';
