# SV Express - Database Schema Documentation

## Database: PostgreSQL (via Supabase)

Version: PostgreSQL 15.x

## Overview

The database uses a relational schema with 6 core tables and proper foreign key relationships. Row Level Security (RLS) is enabled for data protection.

---

## Tables

### 1. users

Stores user accounts for both customers and administrators.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    CONSTRAINT valid_role CHECK (role IN ('admin', 'customer'))
);
```

**Indexes:**
- `idx_users_email` ON `email` (unique)
- `idx_users_role` ON `role`

**Columns:**
- `id`: Unique identifier (UUID)
- `email`: User email (unique, used for login)
- `password_hash`: Bcrypt hashed password
- `first_name`, `last_name`: User's name
- `phone`: Contact phone number
- `role`: User role (`admin` or `customer`)
- `email_verified`: Whether email is verified
- `created_at`, `updated_at`: Timestamps
- `last_login_at`: Last login timestamp

---

### 2. countries

Available countries for shipping.

```sql
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    is_origin BOOLEAN DEFAULT FALSE,
    is_destination BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Sample Data:**
```sql
INSERT INTO countries (code, name_en, name_ru, region, is_origin, is_destination) VALUES
('FR', 'France', 'Франция', 'eu', TRUE, FALSE),
('RU', 'Russia', 'Россия', 'cis', FALSE, TRUE),
('DE', 'Germany', 'Германия', 'eu', TRUE, FALSE),
('MD', 'Moldova', 'Молдова', 'cis', FALSE, TRUE);
```

---

### 3. pricing_tiers

Pricing tiers based on weight and shipment type.

```sql
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
```

**Sample Data:**
```sql
INSERT INTO pricing_tiers (name, description, weight_min_kg, weight_max_kg, base_price_eur, shipment_type) VALUES
('Documents', 'Documents up to 0.5 kg', 0, 0.5, 30, 'document'),
('Small Package', 'Packages up to 10 kg', 0.5, 10, 95, 'package'),
('Medium Package', 'Packages up to 20 kg', 10, 20, 156, 'package');
```

---

### 4. leads

Customer inquiries from the landing page.

```sql
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
```

**Indexes:**
- `idx_leads_status` ON `status`
- `idx_leads_assigned_admin` ON `assigned_to_admin_id`

**Statuses:**
- `new`: Just submitted, not contacted yet
- `contacted`: Admin has reached out
- `converted`: Converted to paying customer
- `lost`: Lead did not convert

---

### 5. shipments

Main shipment/order records.

```sql
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) NOT NULL,
    assigned_admin_id UUID REFERENCES users(id),

    -- Shipment details
    shipment_type VARCHAR(50) NOT NULL,
    weight_kg DECIMAL(10,2) NOT NULL,
    declared_value_eur DECIMAL(10,2),

    -- Origin
    origin_country_id INTEGER REFERENCES countries(id) NOT NULL,
    origin_address TEXT NOT NULL,
    origin_city VARCHAR(100),
    origin_postal_code VARCHAR(20),

    -- Destination
    destination_country_id INTEGER REFERENCES countries(id) NOT NULL,
    destination_address TEXT NOT NULL,
    destination_city VARCHAR(100),
    destination_postal_code VARCHAR(20),
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(50),

    -- Pricing
    price_eur DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',

    -- Status
    status VARCHAR(50) DEFAULT 'created',
    current_location VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    pickup_date DATE,
    estimated_delivery_date DATE,
    delivered_at TIMESTAMP,

    -- Additional
    notes TEXT,
    customs_declaration TEXT,
    insurance_amount_eur DECIMAL(10,2),

    CONSTRAINT valid_shipment_status CHECK (status IN ('created', 'pickup_scheduled', 'in_transit', 'customs', 'out_for_delivery', 'delivered', 'cancelled')),
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded'))
);
```

**Indexes:**
- `idx_shipments_customer` ON `customer_id`
- `idx_shipments_tracking` ON `tracking_number` (unique)
- `idx_shipments_status` ON `status`
- `idx_shipments_assigned_admin` ON `assigned_admin_id`

**Shipment Statuses:**
- `created`: Shipment created, awaiting pickup
- `pickup_scheduled`: Pickup scheduled
- `in_transit`: In transit
- `customs`: Clearing customs
- `out_for_delivery`: Out for delivery
- `delivered`: Delivered successfully
- `cancelled`: Cancelled by customer or admin

---

### 6. tracking_events

Timeline of shipment tracking events.

```sql
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_by_admin_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    event_date TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_tracking_shipment` ON `shipment_id`
- `idx_tracking_date` ON `event_date`

**Example Events:**
```sql
INSERT INTO tracking_events (shipment_id, status, location, description, event_date) VALUES
('shipment_uuid', 'created', 'Nice, France', 'Shipment created', '2024-12-01 10:00:00'),
('shipment_uuid', 'picked_up', 'Nice, France', 'Package picked up by courier', '2024-12-02 14:30:00'),
('shipment_uuid', 'in_transit', 'Paris Hub', 'In transit to destination', '2024-12-05 08:15:00');
```

---

## Relationships

### Entity Relationship Diagram

```
users (1) ----< (N) shipments [customer_id]
users (1) ----< (N) shipments [assigned_admin_id]
users (1) ----< (N) leads [converted_to_user_id]
users (1) ----< (N) leads [assigned_to_admin_id]

countries (1) ----< (N) shipments [origin_country_id]
countries (1) ----< (N) shipments [destination_country_id]
countries (1) ----< (N) leads [origin_country_id]
countries (1) ----< (N) leads [destination_country_id]

shipments (1) ----< (N) tracking_events

pricing_tiers (independent table, no foreign keys)
```

---

## Row Level Security (RLS) Policies

### users table

```sql
-- Users can view own profile
CREATE POLICY "users_view_own" ON users
    FOR SELECT USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "admins_view_all_users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
```

### shipments table

```sql
-- Customers can view own shipments
CREATE POLICY "customers_view_own_shipments" ON shipments
    FOR SELECT USING (auth.uid() = customer_id);

-- Admins can view all shipments
CREATE POLICY "admins_view_all_shipments" ON shipments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can insert/update/delete
CREATE POLICY "admins_manage_shipments" ON shipments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
```

### leads table

```sql
-- Anyone can insert (landing page form)
CREATE POLICY "public_insert_leads" ON leads
    FOR INSERT WITH CHECK (TRUE);

-- Only admins can view/update
CREATE POLICY "admins_manage_leads" ON leads
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
```

---

## Common Queries

### Get user with their shipments

```sql
SELECT
    u.*,
    COUNT(s.id) as shipment_count
FROM users u
LEFT JOIN shipments s ON s.customer_id = u.id
WHERE u.id = $1
GROUP BY u.id;
```

### Get shipment with full tracking history

```sql
SELECT
    s.*,
    json_agg(
        json_build_object(
            'id', te.id,
            'status', te.status,
            'location', te.location,
            'description', te.description,
            'eventDate', te.event_date
        ) ORDER BY te.event_date DESC
    ) as tracking_events
FROM shipments s
LEFT JOIN tracking_events te ON te.shipment_id = s.id
WHERE s.tracking_number = $1
GROUP BY s.id;
```

### Get leads by status with country names

```sql
SELECT
    l.*,
    oc.name_en as origin_country,
    dc.name_en as destination_country,
    u.first_name || ' ' || u.last_name as assigned_admin
FROM leads l
LEFT JOIN countries oc ON oc.id = l.origin_country_id
LEFT JOIN countries dc ON dc.id = l.destination_country_id
LEFT JOIN users u ON u.id = l.assigned_to_admin_id
WHERE l.status = $1
ORDER BY l.created_at DESC;
```

### Calculate total revenue

```sql
SELECT
    COUNT(*) as total_shipments,
    SUM(price_eur) as total_revenue,
    AVG(price_eur) as average_price
FROM shipments
WHERE payment_status = 'paid'
AND created_at >= NOW() - INTERVAL '30 days';
```

---

## Migrations

Migrations are located in `database/migrations/` and should be run in order:

1. `001_create_users_table.sql`
2. `002_create_countries_table.sql`
3. `003_create_pricing_tiers_table.sql`
4. `004_create_leads_table.sql`
5. `005_create_shipments_table.sql`
6. `006_create_tracking_events_table.sql`
7. `007_create_indexes.sql`
8. `008_enable_rls.sql`

## Seeds

Seed data is in `database/seeds/`:
- `countries.sql` - Insert all supported countries
- `pricing_tiers.sql` - Insert default pricing tiers
- `admin_user.sql` - Create first admin user

---

## Backup & Restore

### Manual Backup (via Supabase Dashboard)

1. Go to Database → Backups
2. Click "Create Backup"
3. Download backup file

### Programmatic Backup

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > backup.sql
```

### Restore

```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < backup.sql
```

---

## Performance Optimization

### Indexes Created

- All foreign keys are indexed
- `email` fields are indexed for fast lookups
- `tracking_number` has unique index
- `status` fields are indexed for filtering

### Query Optimization Tips

1. Use `SELECT` with specific columns, not `SELECT *`
2. Use `LIMIT` for large result sets
3. Add indexes on frequently queried columns
4. Use `JOIN` efficiently
5. Avoid N+1 queries (use `JOIN` or batch queries)

---

## Monitoring

### Check Database Size

```sql
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### Check Table Sizes

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Find Slow Queries

Enable `pg_stat_statements` in Supabase and query:

```sql
SELECT
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```
