-- Create settings table (key-value store for app configuration)
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default settings
INSERT INTO settings (key, value) VALUES
    ('keep_alive_last_ping', NULL),
    ('keep_alive_last_status', NULL),
    ('telegram_bot_token', NULL),
    ('telegram_chat_id', NULL),
    ('telegram_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access to settings" ON settings
    FOR ALL
    USING (true)
    WITH CHECK (true);
