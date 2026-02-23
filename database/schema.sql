-- ============================================================================
-- TEMPLO VERDE - PostgreSQL Database Schema
-- High-Performance Cannabis Cultivation Management System
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMERATIONS (Type Safety)
-- ============================================================================

CREATE TYPE room_type AS ENUM ('vege', 'flora', 'drying', 'mother', 'clone');
CREATE TYPE batch_stage AS ENUM ('clone', 'vege', 'flora', 'drying', 'curing', 'harvested');
CREATE TYPE batch_status AS ENUM ('active', 'archived', 'failed');
CREATE TYPE task_type AS ENUM ('defoliation', 'feeding', 'cleaning', 'ipm', 'transplant', 'harvest', 'maintenance');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE inventory_category AS ENUM ('nutrient', 'substrate', 'ipm', 'equipment', 'packaging');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved');

-- ============================================================================
-- MODULE A: INFRASTRUCTURE & ASSETS
-- ============================================================================

-- Grow Rooms Configuration
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type room_type NOT NULL,
    area_m2 DECIMAL(6,2),
    target_vpd_min DECIMAL(3,2) DEFAULT 0.8,
    target_vpd_max DECIMAL(3,2) DEFAULT 1.2,
    target_temp_min DECIMAL(4,1),
    target_temp_max DECIMAL(4,1),
    target_humidity_min DECIMAL(4,1),
    target_humidity_max DECIMAL(4,1),
    sensor_device_id VARCHAR(100), -- Sensor device ID (Pulse Pro, Grocast, etc.)
    sensor_brand VARCHAR(50) DEFAULT 'pulse_pro', -- 'pulse_pro', 'grocast', 'trolmaster', etc.
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cannabis Strains Library
CREATE TABLE strains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    breeder VARCHAR(100),
    genetics VARCHAR(200), -- e.g., "Indica-dominant hybrid (60/40)"
    expected_flowering_days INTEGER,
    expected_yield_g_m2 INTEGER,
    thc_range VARCHAR(20), -- e.g., "22-26%"
    cbd_range VARCHAR(20),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Management
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category inventory_category NOT NULL,
    brand VARCHAR(100),
    stock_current DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_min DECIMAL(10,2) DEFAULT 0, -- Minimum threshold for alerts
    unit VARCHAR(20) NOT NULL, -- ml, L, kg, g, units
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR(100),
    last_purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODULE B: CROP CYCLE MANAGEMENT
-- ============================================================================

-- Cultivation Batches (Lotes)
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code VARCHAR(50) NOT NULL UNIQUE, -- e.g., "FLA-001-2026"
    strain_id UUID NOT NULL REFERENCES strains(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    plant_count_start INTEGER NOT NULL,
    plant_count_current INTEGER NOT NULL,
    stage batch_stage NOT NULL DEFAULT 'clone',
    status batch_status NOT NULL DEFAULT 'active',
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    harvest_weight_wet_g DECIMAL(10,2),
    harvest_weight_dry_g DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_plant_count CHECK (plant_count_current >= 0 AND plant_count_current <= plant_count_start)
);

-- Batch Movement History (Trazabilidad)
CREATE TABLE batch_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    from_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    to_room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    from_stage batch_stage,
    to_stage batch_stage NOT NULL,
    plant_count INTEGER NOT NULL, -- Number of plants moved (supports partial moves)
    movement_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT,
    performed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODULE C: ENVIRONMENTAL DATA (Automated - Pulse Pro API)
-- ============================================================================

CREATE TABLE environmental_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    
    -- Core measurements
    temp_c DECIMAL(4,1),
    humidity DECIMAL(4,1),
    vpd DECIMAL(3,2),
    co2_ppm INTEGER,
    
    -- Light measurements
    ppfd INTEGER, -- Photosynthetic Photon Flux Density (μmol/m²/s)
    light_status VARCHAR(10), -- 'on' or 'off'
    dli DECIMAL(5,1), -- Daily Light Integral (calculated)
    
    -- Additional sensors (optional)
    leaf_temp_c DECIMAL(4,1),
    substrate_temp_c DECIMAL(4,1),
    substrate_moisture DECIMAL(4,1),
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'pulse_pro', -- 'pulse_pro', 'manual', 'other_sensor'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hypertable for TimescaleDB (optional - uncomment if using TimescaleDB)
-- SELECT create_hypertable('environmental_readings', 'timestamp', if_not_exists => TRUE);

-- ============================================================================
-- MODULE D: DAILY OPERATIONS
-- ============================================================================

-- Irrigation & Crop Steering Logs
CREATE TABLE irrigation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL, -- Optional: link to specific batch
    
    -- Input parameters
    input_ec DECIMAL(4,2) NOT NULL, -- Electrical Conductivity (mS/cm)
    input_ph DECIMAL(3,1) NOT NULL,
    water_volume_ml INTEGER,
    
    -- Runoff measurements
    runoff_ec DECIMAL(4,2),
    runoff_ph DECIMAL(3,1),
    runoff_volume_ml INTEGER,
    
    -- Crop Steering metrics
    dryback_percent DECIMAL(4,1), -- % weight loss between irrigations
    water_content_start DECIMAL(4,1), -- Substrate moisture % before irrigation
    water_content_end DECIMAL(4,1), -- Substrate moisture % after irrigation
    
    -- Calculated metrics
    ec_delta DECIMAL(4,2) GENERATED ALWAYS AS (runoff_ec - input_ec) STORED,
    
    -- Metadata
    performed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_ec CHECK (input_ec >= 0 AND input_ec <= 5),
    CONSTRAINT valid_ph CHECK (input_ph >= 4.0 AND input_ph <= 8.0)
);

-- Task Management
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    type task_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status task_status NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 3, -- 1=High, 2=Medium, 3=Low
    assigned_to VARCHAR(100),
    completed_at TIMESTAMPTZ,
    completed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT task_has_target CHECK (room_id IS NOT NULL OR batch_id IS NOT NULL)
);

-- ============================================================================
-- SUPPORTING TABLES
-- ============================================================================

-- Automated Alerts System
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    severity alert_severity NOT NULL,
    status alert_status NOT NULL DEFAULT 'active',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Context references
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    irrigation_log_id UUID REFERENCES irrigation_logs(id) ON DELETE CASCADE,
    
    -- Alert metadata
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by VARCHAR(100),
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100),
    resolution_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Usage Tracking
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- 'purchase', 'usage', 'adjustment', 'waste'
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    
    -- Context
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    
    -- Metadata
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    performed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT LOG (Optional - for compliance)
-- ============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_by VARCHAR(100),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE rooms IS 'Grow room infrastructure and configuration';
COMMENT ON TABLE strains IS 'Cannabis genetics library';
COMMENT ON TABLE batches IS 'Cultivation batches (lotes) tracking plant lifecycle';
COMMENT ON TABLE batch_movements IS 'Historical record of batch movements between rooms';
COMMENT ON TABLE environmental_readings IS 'Time-series environmental sensor data from Pulse Pro, Grocast, or other IoT sensors';
COMMENT ON TABLE irrigation_logs IS 'Crop steering data - irrigation inputs and runoff measurements';
COMMENT ON TABLE tasks IS 'Daily operational tasks and maintenance schedule';
COMMENT ON TABLE alerts IS 'Automated alert system for critical conditions';

COMMENT ON COLUMN irrigation_logs.ec_delta IS 'Calculated EC difference (runoff - input). Positive = nutrient accumulation';
COMMENT ON COLUMN irrigation_logs.dryback_percent IS 'Critical crop steering metric - % substrate weight loss between irrigations';
COMMENT ON COLUMN environmental_readings.vpd IS 'Vapor Pressure Deficit - key metric for transpiration control';
