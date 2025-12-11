-- Seed data for pricing tiers
-- Pricing based on weight ranges and shipment types

INSERT INTO pricing_tiers (name, description, weight_min_kg, weight_max_kg, base_price_eur, shipment_type) VALUES
-- Documents
('Documents Small', 'Documents and papers up to 0.5 kg', 0, 0.5, 30.00, 'document'),
('Documents Medium', 'Documents and papers 0.5-2 kg', 0.5, 2, 45.00, 'document'),

-- Small Packages
('Package XS', 'Small packages up to 1 kg', 0, 1, 50.00, 'package'),
('Package S', 'Small packages 1-5 kg', 1, 5, 75.00, 'package'),
('Package M', 'Medium packages 5-10 kg', 5, 10, 95.00, 'package'),

-- Medium Packages
('Package L', 'Large packages 10-15 kg', 10, 15, 125.00, 'package'),
('Package XL', 'Extra large packages 15-20 kg', 15, 20, 156.00, 'package'),

-- Large Packages
('Package XXL', 'Very large packages 20-30 kg', 20, 30, 195.00, 'package'),
('Package XXXL', 'Extremely large packages 30-50 kg', 30, 50, 280.00, 'package'),

-- Express (premium pricing)
('Express Document', 'Express delivery for documents', 0, 2, 85.00, 'express'),
('Express Small', 'Express delivery for small packages', 0, 10, 150.00, 'express'),
('Express Medium', 'Express delivery for medium packages', 10, 20, 220.00, 'express'),
('Express Large', 'Express delivery for large packages', 20, 50, 350.00, 'express'),

-- Fragile items (special handling)
('Fragile Small', 'Fragile items with special handling (up to 10kg)', 0, 10, 140.00, 'fragile'),
('Fragile Medium', 'Fragile items with special handling (10-20kg)', 10, 20, 220.00, 'fragile'),
('Fragile Large', 'Fragile items with special handling (20-30kg)', 20, 30, 310.00, 'fragile');
