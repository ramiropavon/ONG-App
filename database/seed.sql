-- ============================================================================
-- SAMPLE SEED DATA
-- Templo Verde - Test Data for Development
-- ============================================================================

-- ============================================================================
-- STRAINS
-- ============================================================================

INSERT INTO strains (name, breeder, genetics, expected_flowering_days, expected_yield_g_m2, thc_range, cbd_range, notes) VALUES
('Gelato 41', 'Cookies Fam', 'Indica-dominant hybrid (55/45)', 60, 550, '22-26%', '<1%', 'Premium strain with high resin production'),
('Wedding Cake', 'Seed Junky Genetics', 'Indica-dominant hybrid (60/40)', 58, 500, '24-27%', '<1%', 'Dense buds, excellent for extractions'),
('Runtz', 'Cookies x Zkittlez', 'Balanced hybrid (50/50)', 63, 480, '23-26%', '<1%', 'Fruity terpene profile'),
('Purple Punch', 'Symbiotic Genetics', 'Indica-dominant (80/20)', 60, 520, '20-24%', '<1%', 'High anthocyanin content');

-- ============================================================================
-- ROOMS
-- ============================================================================

INSERT INTO rooms (name, type, area_m2, target_vpd_min, target_vpd_max, target_temp_min, target_temp_max, target_humidity_min, target_humidity_max, pulse_device_id, notes) VALUES
('Vege', 'vege', 20.0, 0.8, 1.0, 24.0, 27.0, 65.0, 75.0, NULL, 'Vegetative growth room - 18/6 light cycle'),
('Flora A', 'flora', 25.0, 1.0, 1.3, 25.0, 28.0, 50.0, 60.0, NULL, 'Flowering room A - 12/12 light cycle'),
('Flora B', 'flora', 25.0, 1.0, 1.3, 25.0, 28.0, 50.0, 60.0, NULL, 'Flowering room B - 12/12 light cycle'),
('Drying', 'drying', 15.0, NULL, NULL, 18.0, 21.0, 55.0, 62.0, NULL, 'Slow dry room - 14 days target');

-- ============================================================================
-- INVENTORY ITEMS
-- ============================================================================

INSERT INTO inventory_items (name, category, brand, stock_current, stock_min, unit, cost_per_unit, notes) VALUES
-- Nutrients
('Flora Micro', 'nutrient', 'General Hydroponics', 15000, 5000, 'ml', 0.025, 'Base nutrient - Micro'),
('Flora Gro', 'nutrient', 'General Hydroponics', 12000, 5000, 'ml', 0.025, 'Base nutrient - Grow'),
('Flora Bloom', 'nutrient', 'General Hydroponics', 18000, 5000, 'ml', 0.025, 'Base nutrient - Bloom'),
('CalMag', 'nutrient', 'Botanicare', 8000, 3000, 'ml', 0.030, 'Calcium and Magnesium supplement'),
('Bud Candy', 'nutrient', 'Advanced Nutrients', 5000, 2000, 'ml', 0.045, 'Carbohydrate supplement for flowering'),

-- Substrates
('Coco Coir 50L', 'substrate', 'Canna', 200, 50, 'L', 0.30, 'Premium coco coir'),
('Perlite 100L', 'substrate', 'Generic', 150, 30, 'L', 0.15, 'Drainage amendment'),

-- IPM (Integrated Pest Management)
('Neem Oil', 'ipm', 'Organic', 2000, 500, 'ml', 0.020, 'Preventive foliar spray'),
('Predatory Mites', 'ipm', 'Koppert', 10, 5, 'units', 25.00, 'Biological pest control');

-- ============================================================================
-- BATCHES (Sample cultivation cycles)
-- ============================================================================

-- Get strain and room IDs (will vary based on UUIDs generated)
DO $$
DECLARE
    v_gelato_id UUID;
    v_wedding_id UUID;
    v_runtz_id UUID;
    v_vege_id UUID;
    v_flora_a_id UUID;
    v_flora_b_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO v_gelato_id FROM strains WHERE name = 'Gelato 41';
    SELECT id INTO v_wedding_id FROM strains WHERE name = 'Wedding Cake';
    SELECT id INTO v_runtz_id FROM strains WHERE name = 'Runtz';
    SELECT id INTO v_vege_id FROM rooms WHERE name = 'Vege';
    SELECT id INTO v_flora_a_id FROM rooms WHERE name = 'Flora A';
    SELECT id INTO v_flora_b_id FROM rooms WHERE name = 'Flora B';
    
    -- Insert batches
    INSERT INTO batches (batch_code, strain_id, room_id, start_date, plant_count_start, plant_count_current, stage, status, expected_harvest_date, notes) VALUES
    ('VEG-001-2026', v_gelato_id, v_vege_id, '2026-01-15', 50, 48, 'vege', 'active', NULL, 'Healthy growth, 2 plants culled due to poor vigor'),
    ('FLA-001-2026', v_wedding_id, v_flora_a_id, '2025-12-10', 40, 40, 'flora', 'active', '2026-02-15', 'Day 60 of flower - Week 2 flush'),
    ('FLB-001-2026', v_runtz_id, v_flora_b_id, '2025-12-20', 35, 35, 'flora', 'active', '2026-02-25', 'Day 50 of flower - Heavy resin production');
END $$;

-- ============================================================================
-- SAMPLE ENVIRONMENTAL READINGS (Last 24 hours)
-- ============================================================================

-- Generate sample environmental data for Flora A (last 24 hours, every 10 minutes)
DO $$
DECLARE
    v_room_id UUID;
    v_timestamp TIMESTAMPTZ;
    v_hour INTEGER;
    v_temp DECIMAL(4,1);
    v_humidity DECIMAL(4,1);
    v_vpd DECIMAL(3,2);
BEGIN
    SELECT id INTO v_room_id FROM rooms WHERE name = 'Flora A';
    
    -- Generate 144 readings (24 hours * 6 readings/hour)
    FOR i IN 0..143 LOOP
        v_timestamp := NOW() - (i * INTERVAL '10 minutes');
        v_hour := EXTRACT(HOUR FROM v_timestamp)::INTEGER;
        
        -- Simulate day/night cycle (lights on 6am-6pm)
        IF v_hour >= 6 AND v_hour < 18 THEN
            -- Lights ON
            v_temp := 26.5 + (random() * 1.5 - 0.75); -- 25.75-27.25°C
            v_humidity := 55.0 + (random() * 5.0 - 2.5); -- 52.5-57.5%
            v_vpd := 1.15 + (random() * 0.2 - 0.1); -- 1.05-1.25 kPa
            
            INSERT INTO environmental_readings (timestamp, room_id, temp_c, humidity, vpd, co2_ppm, ppfd, light_status, source)
            VALUES (
                v_timestamp,
                v_room_id,
                v_temp,
                v_humidity,
                v_vpd,
                1200 + (random() * 100 - 50)::INTEGER, -- 1150-1250 ppm CO2
                850 + (random() * 100 - 50)::INTEGER, -- 800-900 PPFD
                'on',
                'manual_seed'
            );
        ELSE
            -- Lights OFF
            v_temp := 23.0 + (random() * 1.0 - 0.5); -- 22.5-23.5°C
            v_humidity := 58.0 + (random() * 4.0 - 2.0); -- 56-60%
            v_vpd := 0.95 + (random() * 0.15 - 0.075); -- 0.875-1.025 kPa
            
            INSERT INTO environmental_readings (timestamp, room_id, temp_c, humidity, vpd, co2_ppm, ppfd, light_status, source)
            VALUES (
                v_timestamp,
                v_room_id,
                v_temp,
                v_humidity,
                v_vpd,
                450 + (random() * 50 - 25)::INTEGER, -- 425-475 ppm CO2
                0, -- Lights off
                'off',
                'manual_seed'
            );
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- SAMPLE IRRIGATION LOGS (Last 14 days)
-- ============================================================================

DO $$
DECLARE
    v_room_id UUID;
    v_batch_id UUID;
    v_date DATE;
BEGIN
    SELECT id INTO v_room_id FROM rooms WHERE name = 'Flora A';
    SELECT id INTO v_batch_id FROM batches WHERE batch_code = 'FLA-001-2026';
    
    -- Generate 14 days of irrigation logs
    FOR i IN 0..13 LOOP
        v_date := CURRENT_DATE - i;
        
        INSERT INTO irrigation_logs (
            date, 
            room_id, 
            batch_id, 
            input_ec, 
            input_ph, 
            water_volume_ml,
            runoff_ec, 
            runoff_ph,
            runoff_volume_ml,
            dryback_percent,
            water_content_start,
            water_content_end,
            notes
        ) VALUES (
            v_date,
            v_room_id,
            v_batch_id,
            2.2 + (random() * 0.2 - 0.1), -- EC 2.1-2.3 (flowering range)
            5.8 + (random() * 0.3 - 0.15), -- pH 5.65-5.95
            4000 + (random() * 500 - 250)::INTEGER, -- 3750-4250ml
            2.3 + (random() * 0.3 - 0.15), -- Runoff EC slightly higher
            6.0 + (random() * 0.3 - 0.15), -- Runoff pH
            1200 + (random() * 200 - 100)::INTEGER, -- 30% runoff
            12.0 + (random() * 3.0 - 1.5), -- 10.5-13.5% dryback (generative)
            45.0 + (random() * 5.0 - 2.5), -- Water content before
            78.0 + (random() * 4.0 - 2.0), -- Water content after
            CASE 
                WHEN i = 0 THEN 'Increased EC to 2.3 - Week 8 push'
                WHEN i = 5 THEN 'Started flush - EC 1.0'
                ELSE NULL
            END
        );
    END LOOP;
END $$;

-- ============================================================================
-- SAMPLE TASKS
-- ============================================================================

DO $$
DECLARE
    v_flora_a_id UUID;
    v_flora_b_id UUID;
    v_batch_fla_id UUID;
BEGIN
    SELECT id INTO v_flora_a_id FROM rooms WHERE name = 'Flora A';
    SELECT id INTO v_flora_b_id FROM rooms WHERE name = 'Flora B';
    SELECT id INTO v_batch_fla_id FROM batches WHERE batch_code = 'FLA-001-2026';
    
    INSERT INTO tasks (room_id, batch_id, type, title, description, due_date, status, priority, assigned_to) VALUES
    (v_flora_a_id, v_batch_fla_id, 'defoliation', 'Defoliación final - FLA-001', 'Remover hojas grandes que bloquean luz a cogollos inferiores', CURRENT_DATE + 1, 'pending', 1, 'Juan'),
    (v_flora_a_id, v_batch_fla_id, 'harvest', 'Cosecha FLA-001', 'Verificar tricomas antes de corte. Target: 70% lechosos, 30% ámbar', CURRENT_DATE + 7, 'pending', 1, 'María'),
    (v_flora_b_id, NULL, 'feeding', 'Aplicar Bud Candy - Flora B', 'Aumentar carbohidratos para semana 7 de flora', CURRENT_DATE, 'in_progress', 2, 'Carlos'),
    (v_flora_a_id, NULL, 'cleaning', 'Limpieza de bandejas de drenaje', 'Prevenir acumulación de sales y patógenos', CURRENT_DATE + 3, 'pending', 3, NULL);
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- View sample data
SELECT 'Strains' as table_name, COUNT(*) as record_count FROM strains
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'Batches', COUNT(*) FROM batches
UNION ALL
SELECT 'Environmental Readings', COUNT(*) FROM environmental_readings
UNION ALL
SELECT 'Irrigation Logs', COUNT(*) FROM irrigation_logs
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Inventory Items', COUNT(*) FROM inventory_items;

-- View active batches with strain info
SELECT 
    b.batch_code,
    s.name as strain,
    r.name as room,
    b.stage,
    b.plant_count_current,
    b.expected_harvest_date
FROM batches b
JOIN strains s ON b.strain_id = s.id
JOIN rooms r ON b.room_id = r.id
WHERE b.status = 'active'
ORDER BY b.expected_harvest_date;

-- View recent environmental data
SELECT 
    r.name as room,
    e.timestamp,
    e.temp_c,
    e.humidity,
    e.vpd,
    e.light_status
FROM environmental_readings e
JOIN rooms r ON e.room_id = r.id
WHERE e.timestamp > NOW() - INTERVAL '1 hour'
ORDER BY e.timestamp DESC
LIMIT 10;
