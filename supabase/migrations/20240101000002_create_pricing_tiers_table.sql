-- Create pricing tiers table for shipment pricing
CREATE TABLE pricing_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    weight_min_kg DECIMAL(10,2) NOT NULL,
    weight_max_kg DECIMAL(10,2),
    base_price_eur DECIMAL(10,2) NOT NULL,
    shipment_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create trigger for pricing_tiers table
CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE pricing_tiers IS 'Pricing tiers based on weight and shipment type';
