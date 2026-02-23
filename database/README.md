# Templo Verde - Database Architecture Guide

## Overview

This database schema supports a high-performance cannabis cultivation management system with automated environmental monitoring, crop steering analytics, and operational task management.

**Technology**: PostgreSQL 15+ (via Supabase)  
**Optional Extension**: TimescaleDB (recommended for >500K environmental records/year)

---

## Schema Modules

### Module A: Infrastructure & Assets
- **`rooms`**: Grow room configuration with target environmental parameters
- **`strains`**: Cannabis genetics library
- **`inventory_items`**: Nutrient, substrate, and equipment inventory

### Module B: Crop Cycle Management
- **`batches`**: Cultivation batches (lotes) tracking plant lifecycle
- **`batch_movements`**: Historical audit trail of batch movements between rooms

### Module C: Environmental Data (Automated)
- **`environmental_readings`**: Time-series sensor data from Pulse Pro API
  - Ingested automatically every 10 minutes via Edge Function
  - Optimized with composite indexes for dashboard queries

### Module D: Daily Operations (Manual)
- **`irrigation_logs`**: Crop steering data (EC, pH, dryback, water content)
- **`tasks`**: Operational task management and scheduling

### Supporting Tables
- **`alerts`**: Automated alert system for critical conditions
- **`inventory_transactions`**: Stock usage tracking
- **`audit_log`**: Optional compliance audit trail

---

## Entity Relationships

```mermaid
erDiagram
    rooms ||--o{ batches : contains
    rooms ||--o{ environmental_readings : monitors
    rooms ||--o{ irrigation_logs : receives
    rooms ||--o{ tasks : assigned
    
    strains ||--o{ batches : grows
    
    batches ||--o{ batch_movements : tracks
    batches ||--o{ irrigation_logs : receives
    batches ||--o{ tasks : assigned
    batches ||--o{ alerts : triggers
    
    inventory_items ||--o{ inventory_transactions : records
    
    irrigation_logs ||--o{ alerts : triggers
```

---

## Installation & Migration

### 1. Create Database Schema

```bash
# Connect to your Supabase database
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres

# Run migrations in order
\i database/schema.sql
\i database/indexes.sql
\i database/triggers.sql
\i database/security.sql
```

### 2. Optional: Enable TimescaleDB

> [!IMPORTANT]
> TimescaleDB is **highly recommended** if you're ingesting >100K environmental records/month (10-minute intervals = ~4,300 records/month/room).

```sql
-- Enable TimescaleDB extension (requires database restart)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert environmental_readings to hypertable
SELECT create_hypertable(
    'environmental_readings', 
    'timestamp',
    if_not_exists => TRUE
);

-- Enable compression for data older than 7 days
ALTER TABLE environmental_readings SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'room_id'
);

SELECT add_compression_policy('environmental_readings', INTERVAL '7 days');
```

### 3. Configure User Roles

```sql
-- Create user roles in Supabase Auth
-- Then set user metadata:

-- For operators (can read/write operational data)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data, 
    '{role}', 
    '"operator"'
)
WHERE email = 'operator@temploverde.com';

-- For admins (full access)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data, 
    '{role}', 
    '"admin"'
)
WHERE email = 'admin@temploverde.com';
```

---

## Pulse Pro API Integration

### Edge Function Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the Edge Function
supabase functions deploy pulse-pro-ingestion
```

### Environment Variables

Set these in Supabase Dashboard → Edge Functions → pulse-pro-ingestion:

```env
PULSE_PRO_API_KEY=your_api_key_here
PULSE_PRO_API_URL=https://api.pulsegrow.com/v1  # Optional
```

### Configure Cron Schedule

In Supabase Dashboard → Database → Cron Jobs:

```sql
-- Run every 10 minutes
SELECT cron.schedule(
    'pulse-pro-ingestion',
    '*/10 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://YOUR_PROJECT.supabase.co/functions/v1/pulse-pro-ingestion',
        headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
    $$
);
```

### Map Devices to Rooms

```sql
-- Configure which Pulse Pro device monitors which room
UPDATE rooms 
SET pulse_device_id = 'pulse-device-12345'
WHERE name = 'Flora A';

UPDATE rooms 
SET pulse_device_id = 'pulse-device-67890'
WHERE name = 'Vege';
```

---

## Performance Optimization

### Query Performance

The schema includes optimized indexes for common queries:

1. **Environmental Charts** (last 24 hours by room):
   ```sql
   SELECT timestamp, temp_c, humidity, vpd
   FROM environmental_readings
   WHERE room_id = 'room-uuid'
     AND timestamp > NOW() - INTERVAL '24 hours'
   ORDER BY timestamp DESC;
   ```
   → Uses `idx_env_readings_room_time` composite index

2. **Crop Steering Dashboard** (recent irrigation logs):
   ```sql
   SELECT date, input_ec, runoff_ec, ec_delta, dryback_percent
   FROM irrigation_logs
   WHERE room_id = 'room-uuid'
     AND date > CURRENT_DATE - INTERVAL '30 days'
   ORDER BY date DESC;
   ```
   → Uses `idx_irrigation_room_date` index

3. **Active Batches by Room**:
   ```sql
   SELECT b.*, s.name as strain_name
   FROM batches b
   JOIN strains s ON b.strain_id = s.id
   WHERE b.room_id = 'room-uuid' 
     AND b.status = 'active';
   ```
   → Uses `idx_batches_active_room` partial index

### Data Retention Strategy

For `environmental_readings` table:

**Option 1: Automatic Aggregation** (Recommended)
```sql
-- Create aggregated hourly view for historical data
CREATE MATERIALIZED VIEW environmental_readings_hourly AS
SELECT 
    room_id,
    date_trunc('hour', timestamp) as hour,
    AVG(temp_c) as avg_temp,
    AVG(humidity) as avg_humidity,
    AVG(vpd) as avg_vpd,
    AVG(co2_ppm) as avg_co2,
    AVG(ppfd) as avg_ppfd
FROM environmental_readings
WHERE timestamp < NOW() - INTERVAL '30 days'
GROUP BY room_id, date_trunc('hour', timestamp);

-- Refresh daily
CREATE INDEX ON environmental_readings_hourly (room_id, hour DESC);
```

**Option 2: Archive Old Data**
```sql
-- Move data older than 6 months to archive table
CREATE TABLE environmental_readings_archive (LIKE environmental_readings);

INSERT INTO environmental_readings_archive
SELECT * FROM environmental_readings
WHERE timestamp < NOW() - INTERVAL '6 months';

DELETE FROM environmental_readings
WHERE timestamp < NOW() - INTERVAL '6 months';
```

### Maintenance Schedule

```sql
-- Weekly vacuum and analyze (add to cron)
VACUUM ANALYZE environmental_readings;
VACUUM ANALYZE irrigation_logs;

-- Monthly index maintenance
REINDEX TABLE environmental_readings;
```

---

## Automated Alerts

The system automatically creates alerts for:

1. **EC Runoff Critical** (Trigger: `triggers.sql`)
   - When `runoff_ec > input_ec + 2.0` → Nutrient accumulation
   - When `runoff_ec < input_ec - 0.5` → Under-feeding

2. **Environmental Thresholds** (Trigger: every 30 min)
   - VPD outside target range
   - Temperature outside target range
   - Humidity outside target range

3. **Inventory Depletion**
   - When `stock_current <= stock_min`

4. **Batch Status Changes**
   - Auto-archives batches moved to drying stage

---

## Data Integrity Rules

### Critical Constraints

1. **Batch-Room Relationship**:
   - Historical environmental data belongs to **rooms**, not batches
   - When a batch moves rooms, `environmental_readings.room_id` stays constant
   - `batch_movements` table maintains full audit trail

2. **Plant Count Validation**:
   ```sql
   CONSTRAINT valid_plant_count CHECK (
       plant_count_current >= 0 
       AND plant_count_current <= plant_count_start
   )
   ```

3. **EC/pH Ranges**:
   ```sql
   CONSTRAINT valid_ec CHECK (input_ec >= 0 AND input_ec <= 5)
   CONSTRAINT valid_ph CHECK (input_ph >= 4.0 AND input_ph <= 8.0)
   ```

### Cascading Deletes

- Deleting a **room** → Cascades to `environmental_readings`, `irrigation_logs`
- Deleting a **batch** → Cascades to `batch_movements`
- Deleting a **strain** → **RESTRICTED** (cannot delete if batches exist)

---

## Backup & Recovery

### Automated Backups (Supabase)

Supabase automatically backs up your database daily. Configure in Dashboard → Settings → Database.

### Manual Backup

```bash
# Full database dump
pg_dump -h db.YOUR_PROJECT.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f templo_verde_backup.dump

# Restore
pg_restore -h db.YOUR_PROJECT.supabase.co \
           -U postgres \
           -d postgres \
           -c \
           templo_verde_backup.dump
```

### Selective Backup (Data Only)

```bash
# Export critical operational data
pg_dump -h db.YOUR_PROJECT.supabase.co \
        -U postgres \
        -d postgres \
        -t batches \
        -t irrigation_logs \
        -t environmental_readings \
        --data-only \
        -f operational_data.sql
```

---

## Security Best Practices

1. **Never expose service role key** in frontend code
2. **Use RLS policies** for all user-facing queries
3. **Rotate API keys** quarterly (Pulse Pro, Supabase)
4. **Enable audit logging** for compliance (uncomment triggers in `triggers.sql`)
5. **Use SSL connections** for all database access

---

## Troubleshooting

### Slow Environmental Queries

```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM environmental_readings
WHERE room_id = 'uuid' AND timestamp > NOW() - INTERVAL '24 hours';

-- Should show "Index Scan using idx_env_readings_room_time"
```

### Edge Function Not Ingesting Data

```bash
# Check Edge Function logs
supabase functions logs pulse-pro-ingestion

# Test manually
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/pulse-pro-ingestion \
     -H "Authorization: Bearer YOUR_ANON_KEY"
```

### RLS Policy Issues

```sql
-- Test as specific user
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'user-uuid';

-- Try query
SELECT * FROM batches;

-- Reset
RESET ROLE;
```

---

## Next Steps

1. ✅ Run schema migrations
2. ✅ Configure user roles
3. ✅ Deploy Pulse Pro Edge Function
4. ✅ Map devices to rooms
5. ✅ Test data ingestion
6. 🔄 Integrate with React frontend
7. 🔄 Build dashboard queries
8. 🔄 Set up monitoring and alerts

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **TimescaleDB Docs**: https://docs.timescale.com
- **PostgreSQL Performance**: https://www.postgresql.org/docs/current/performance-tips.html
