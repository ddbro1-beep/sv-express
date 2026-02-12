-- ========================================
-- Create settings table for SV Express
-- ========================================
-- This table stores application configuration
-- including Telegram bot credentials
-- ========================================

-- Create the settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
    ('keep_alive_last_ping', NULL),
    ('keep_alive_last_status', NULL),
    ('telegram_bot_token', NULL),
    ('telegram_chat_id', NULL),
    ('telegram_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access)
DROP POLICY IF EXISTS "Service role has full access to settings" ON settings;
CREATE POLICY "Service role has full access to settings" ON settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verify the table was created
SELECT * FROM settings ORDER BY key;
