-- Enable Row Level Security (RLS) and create policies

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can view their own profile
CREATE POLICY "users_view_own" ON users
    FOR SELECT USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "admins_view_all_users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Leads table policies
-- Anyone can insert leads (landing page form)
CREATE POLICY "public_insert_leads" ON leads
    FOR INSERT WITH CHECK (TRUE);

-- Only admins can view leads
CREATE POLICY "admins_view_leads" ON leads
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can update leads
CREATE POLICY "admins_update_leads" ON leads
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Shipments table policies
-- Customers can view their own shipments
CREATE POLICY "customers_view_own_shipments" ON shipments
    FOR SELECT USING (auth.uid() = customer_id);

-- Admins can view all shipments
CREATE POLICY "admins_view_all_shipments" ON shipments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can insert shipments
CREATE POLICY "admins_insert_shipments" ON shipments
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can update shipments
CREATE POLICY "admins_update_shipments" ON shipments
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Tracking events policies
-- Customers can view tracking events for their shipments
CREATE POLICY "customers_view_own_tracking" ON tracking_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shipments s
            WHERE s.id = tracking_events.shipment_id
            AND s.customer_id = auth.uid()
        )
    );

-- Admins can view all tracking events
CREATE POLICY "admins_view_all_tracking" ON tracking_events
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can insert tracking events
CREATE POLICY "admins_insert_tracking" ON tracking_events
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
