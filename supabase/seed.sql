-- ===========================================
-- Seed data for local development
-- ===========================================

-- Countries
INSERT INTO countries (code, name_en, name_ru, region, is_origin, is_destination) VALUES
-- EU Origins (where packages can be sent FROM)
('FR', 'France', 'Франция', 'eu', TRUE, FALSE),
('DE', 'Germany', 'Германия', 'eu', TRUE, FALSE),
('ES', 'Spain', 'Испания', 'eu', TRUE, FALSE),
('IT', 'Italy', 'Италия', 'eu', TRUE, FALSE),
('BE', 'Belgium', 'Бельгия', 'eu', TRUE, FALSE),
('NL', 'Netherlands', 'Нидерланды', 'eu', TRUE, FALSE),
('AT', 'Austria', 'Австрия', 'eu', TRUE, FALSE),
('CH', 'Switzerland', 'Швейцария', 'eu', TRUE, FALSE),
('PL', 'Poland', 'Польша', 'eu', TRUE, FALSE),
('CZ', 'Czech Republic', 'Чехия', 'eu', TRUE, FALSE),
-- CIS Destinations (where packages can be sent TO)
('RU', 'Russia', 'Россия', 'cis', FALSE, TRUE),
('BY', 'Belarus', 'Беларусь', 'cis', FALSE, TRUE),
('KZ', 'Kazakhstan', 'Казахстан', 'cis', FALSE, TRUE),
('UA', 'Ukraine', 'Украина', 'cis', FALSE, TRUE),
('MD', 'Moldova', 'Молдова', 'cis', FALSE, TRUE),
('AM', 'Armenia', 'Армения', 'cis', FALSE, TRUE),
('GE', 'Georgia', 'Грузия', 'cis', FALSE, TRUE),
('AZ', 'Azerbaijan', 'Азербайджан', 'cis', FALSE, TRUE),
('UZ', 'Uzbekistan', 'Узбекистан', 'cis', FALSE, TRUE),
('KG', 'Kyrgyzstan', 'Кыргызстан', 'cis', FALSE, TRUE),
('TJ', 'Tajikistan', 'Таджикистан', 'cis', FALSE, TRUE),
('TM', 'Turkmenistan', 'Туркменистан', 'cis', FALSE, TRUE);

-- Pricing tiers
INSERT INTO pricing_tiers (name, description, weight_min_kg, weight_max_kg, base_price_eur, shipment_type) VALUES
('Documents Small', 'Documents and papers up to 0.5 kg', 0, 0.5, 30.00, 'document'),
('Documents Medium', 'Documents and papers 0.5-2 kg', 0.5, 2, 45.00, 'document'),
('Package XS', 'Small packages up to 1 kg', 0, 1, 50.00, 'package'),
('Package S', 'Small packages 1-5 kg', 1, 5, 75.00, 'package'),
('Package M', 'Medium packages 5-10 kg', 5, 10, 95.00, 'package'),
('Package L', 'Large packages 10-15 kg', 10, 15, 125.00, 'package'),
('Package XL', 'Extra large packages 15-20 kg', 15, 20, 156.00, 'package'),
('Package XXL', 'Very large packages 20-30 kg', 20, 30, 195.00, 'package'),
('Package XXXL', 'Extremely large packages 30-50 kg', 30, 50, 280.00, 'package'),
('Express Document', 'Express delivery for documents', 0, 2, 85.00, 'express'),
('Express Small', 'Express delivery for small packages', 0, 10, 150.00, 'express'),
('Express Medium', 'Express delivery for medium packages', 10, 20, 220.00, 'express'),
('Express Large', 'Express delivery for large packages', 20, 50, 350.00, 'express'),
('Fragile Small', 'Fragile items with special handling (up to 10kg)', 0, 10, 140.00, 'fragile'),
('Fragile Medium', 'Fragile items with special handling (10-20kg)', 10, 20, 220.00, 'fragile'),
('Fragile Large', 'Fragile items with special handling (20-30kg)', 20, 30, 310.00, 'fragile');

-- Admin user (password: Bordei1705B)
INSERT INTO users (
    email, password_hash, first_name, last_name, phone, role, email_verified, created_at
) VALUES (
    'admin@sv-express.com',
    '$2b$10$7ZAXINqXkoawYfg.JFKgS.gaN56gLx3UeuMHUNGwUHXRByRuLHuBm',
    'Admin',
    'SV Express',
    '+33753540436',
    'admin',
    TRUE,
    NOW()
);
