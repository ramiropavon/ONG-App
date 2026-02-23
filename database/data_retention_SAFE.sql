-- ============================================================================
-- DATA RETENTION - CORE SETUP
-- Templo Verde - Automatic archival of old environmental data
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Archive Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS environmental_readings_archive (
    room_id UUID NOT NULL,
    hour TIMESTAMPTZ NOT NULL,
    avg_temp DECIMAL(5,2),
    avg_humidity DECIMAL(5,2),
    avg_vpd DECIMAL(4,3),
    avg_co2 INTEGER,
    avg_ppfd INTEGER,
    min_temp DECIMAL(5,2),
    max_temp DECIMAL(5,2),
    min_humidity DECIMAL(5,2),
    max_humidity DECIMAL(5,2),
    reading_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (room_id, hour)
);

CREATE INDEX IF NOT EXISTS idx_archive_room_hour 
    ON environmental_readings_archive (room_id, hour DESC);

COMMENT ON TABLE environmental_readings_archive IS 
'Aggregated hourly environmental data for readings older than 12 months. Reduces storage by 95%.';

-- ============================================================================
-- STEP 2: Archive Function
-- ============================================================================

CREATE OR REPLACE FUNCTION archive_old_environmental_data()
RETURNS TABLE (
    archived_hours INTEGER,
    deleted_readings INTEGER,
    space_saved_mb NUMERIC
) AS $$
DECLARE
    v_archived_count INTEGER;
    v_deleted_count INTEGER;
    v_cutoff_date TIMESTAMPTZ;
BEGIN
    -- Archive data older than 12 months
    v_cutoff_date := NOW() - INTERVAL '12 months';
    
    -- Insert aggregated hourly data into archive
    INSERT INTO environmental_readings_archive (
        room_id,
        hour,
        avg_temp,
        avg_humidity,
        avg_vpd,
        avg_co2,
        avg_ppfd,
        min_temp,
        max_temp,
        min_humidity,
        max_humidity,
        reading_count
    )
    SELECT 
        room_id,
        date_trunc('hour', timestamp) as hour,
        ROUND(AVG(temp_c)::numeric, 2) as avg_temp,
        ROUND(AVG(humidity)::numeric, 2) as avg_humidity,
        ROUND(AVG(vpd)::numeric, 3) as avg_vpd,
        ROUND(AVG(co2_ppm)::numeric, 0)::INTEGER as avg_co2,
        ROUND(AVG(ppfd)::numeric, 0)::INTEGER as avg_ppfd,
        ROUND(MIN(temp_c)::numeric, 2) as min_temp,
        ROUND(MAX(temp_c)::numeric, 2) as max_temp,
        ROUND(MIN(humidity)::numeric, 2) as min_humidity,
        ROUND(MAX(humidity)::numeric, 2) as max_humidity,
        COUNT(*) as reading_count
    FROM environmental_readings
    WHERE timestamp < v_cutoff_date
    GROUP BY room_id, date_trunc('hour', timestamp)
    ON CONFLICT (room_id, hour) DO NOTHING;  -- Skip if already archived
    
    GET DIAGNOSTICS v_archived_count = ROW_COUNT;
    
    -- Delete original readings that have been archived
    DELETE FROM environmental_readings
    WHERE timestamp < v_cutoff_date;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Return statistics
    RETURN QUERY SELECT 
        v_archived_count,
        v_deleted_count,
        ROUND((v_deleted_count * 200 / 1024.0 / 1024.0)::numeric, 2) as space_saved_mb;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_old_environmental_data() IS 
'Archives environmental readings older than 12 months into hourly aggregates. Run monthly via cron.';

-- ============================================================================
-- DONE! 
-- ============================================================================
-- La tabla y función están listas.
-- Para programar el cron job automático, seguí las instrucciones en:
-- database/CRON_SETUP.md
