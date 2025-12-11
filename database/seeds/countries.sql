-- Seed data for countries table
-- Origin countries (EU) and destination countries (CIS)

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
