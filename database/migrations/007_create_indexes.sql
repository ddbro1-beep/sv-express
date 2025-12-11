-- Create indexes for performance optimization

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Leads table indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_admin ON leads(assigned_to_admin_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- Shipments table indexes
CREATE INDEX idx_shipments_customer ON shipments(customer_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_assigned_admin ON shipments(assigned_admin_id);
CREATE INDEX idx_shipments_created_at ON shipments(created_at);

-- Tracking events indexes
CREATE INDEX idx_tracking_shipment ON tracking_events(shipment_id);
CREATE INDEX idx_tracking_date ON tracking_events(event_date);
