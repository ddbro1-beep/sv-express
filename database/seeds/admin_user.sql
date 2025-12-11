-- Create first admin user
-- Credentials:
--   Email: admin@sv-express.com
--   Password: Bordei1705B

INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    role,
    email_verified,
    created_at
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
