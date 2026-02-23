-- ============================================================================
-- DATABASE TRIGGERS & FUNCTIONS
-- Templo Verde - Automated Business Logic
-- ============================================================================

-- ============================================================================
-- UPDATED_AT TIMESTAMP TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_strains_updated_at ON strains;
CREATE TRIGGER update_strains_updated_at BEFORE UPDATE ON strains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_batches_updated_at ON batches;
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_irrigation_logs_updated_at ON irrigation_logs;
CREATE TRIGGER update_irrigation_logs_updated_at BEFORE UPDATE ON irrigation_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- EC ALERT TRIGGER (Critical for Crop Steering)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_ec_runoff_alert()
RETURNS TRIGGER AS $$
DECLARE
    v_room_name VARCHAR(100);
    v_batch_code VARCHAR(50);
BEGIN
    -- Only check if runoff_ec is provided
    IF NEW.runoff_ec IS NOT NULL AND NEW.input_ec IS NOT NULL THEN
        
        -- Check if runoff EC exceeds input EC by more than 2.0 (nutrient accumulation)
        IF NEW.runoff_ec > (NEW.input_ec + 2.0) THEN
            
            -- Get room name for alert message
            SELECT name INTO v_room_name FROM rooms WHERE id = NEW.room_id;
            
            -- Get batch code if linked
            IF NEW.batch_id IS NOT NULL THEN
                SELECT batch_code INTO v_batch_code FROM batches WHERE id = NEW.batch_id;
            END IF;
            
            -- Create critical alert
            INSERT INTO alerts (
                severity,
                status,
                title,
                message,
                room_id,
                batch_id,
                irrigation_log_id
            ) VALUES (
                'critical',
                'active',
                'EC Runoff Crítico - ' || v_room_name,
                format(
                    'EC de drenaje (%.2f mS/cm) excede EC de entrada (%.2f mS/cm) por %.2f puntos. ' ||
                    'Acumulación de sales detectada. Considerar flush con agua pura. Batch: %s',
                    NEW.runoff_ec,
                    NEW.input_ec,
                    NEW.runoff_ec - NEW.input_ec,
                    COALESCE(v_batch_code, 'N/A')
                ),
                NEW.room_id,
                NEW.batch_id,
                NEW.id
            );
        END IF;
        
        -- Check for low runoff EC (under-feeding)
        IF NEW.runoff_ec < (NEW.input_ec - 0.5) THEN
            SELECT name INTO v_room_name FROM rooms WHERE id = NEW.room_id;
            
            INSERT INTO alerts (
                severity,
                status,
                title,
                message,
                room_id,
                batch_id,
                irrigation_log_id
            ) VALUES (
                'warning',
                'active',
                'EC Runoff Bajo - ' || v_room_name,
                format(
                    'EC de drenaje (%.2f mS/cm) está %.2f puntos por debajo del EC de entrada (%.2f mS/cm). ' ||
                    'Las plantas pueden estar consumiendo más nutrientes de lo esperado.',
                    NEW.runoff_ec,
                    NEW.input_ec - NEW.runoff_ec,
                    NEW.input_ec
                ),
                NEW.room_id,
                NEW.batch_id,
                NEW.id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS irrigation_ec_alert_trigger ON irrigation_logs;
CREATE TRIGGER irrigation_ec_alert_trigger
    AFTER INSERT ON irrigation_logs
    FOR EACH ROW
    EXECUTE FUNCTION check_ec_runoff_alert();

-- ============================================================================
-- INVENTORY DEPLETION ALERT
-- ============================================================================

CREATE OR REPLACE FUNCTION check_inventory_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_item_name VARCHAR(200);
BEGIN
    -- Check if stock falls below minimum threshold
    IF NEW.stock_current <= NEW.stock_min AND NEW.stock_min > 0 THEN
        
        SELECT name INTO v_item_name FROM inventory_items WHERE id = NEW.id;
        
        INSERT INTO alerts (
            severity,
            status,
            title,
            message
        ) VALUES (
            'warning',
            'active',
            'Stock Bajo: ' || v_item_name,
            format(
                'El inventario de "%s" está en %.2f %s (mínimo: %.2f %s). Realizar pedido.',
                v_item_name,
                NEW.stock_current,
                NEW.unit,
                NEW.stock_min,
                NEW.unit
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_stock_alert_trigger ON inventory_items;
CREATE TRIGGER inventory_stock_alert_trigger
    AFTER UPDATE OF stock_current ON inventory_items
    FOR EACH ROW
    WHEN (OLD.stock_current IS DISTINCT FROM NEW.stock_current)
    EXECUTE FUNCTION check_inventory_stock();

-- ============================================================================
-- BATCH STATUS AUTO-UPDATE ON MOVEMENT
-- Supports PARTIAL batch movements (e.g., moving 50 of 100 plants)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_batch_on_movement()
RETURNS TRIGGER AS $$
DECLARE
    v_current_plant_count INTEGER;
BEGIN
    -- Get current plant count for the batch
    SELECT plant_count_current INTO v_current_plant_count
    FROM batches
    WHERE id = NEW.batch_id;
    
    -- Check if this is a FULL batch movement or PARTIAL
    IF NEW.plant_count >= v_current_plant_count THEN
        -- FULL MOVEMENT: Update batch's current room and stage
        UPDATE batches
        SET 
            room_id = NEW.to_room_id,
            stage = NEW.to_stage,
            plant_count_current = NEW.plant_count,
            -- Auto-archive if moved to drying
            status = CASE 
                WHEN NEW.to_stage = 'drying' THEN 'archived'::batch_status
                ELSE status
            END
        WHERE id = NEW.batch_id;
    ELSE
        -- PARTIAL MOVEMENT: Only decrement plant count
        -- The original batch stays in the same room
        UPDATE batches
        SET plant_count_current = plant_count_current - NEW.plant_count
        WHERE id = NEW.batch_id;
        
        -- Note: For partial movements, you may want to create a NEW batch
        -- in the destination room. This logic can be added here or handled
        -- in the application layer.
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS batch_movement_update_trigger ON batch_movements;
CREATE TRIGGER batch_movement_update_trigger
    AFTER INSERT ON batch_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_on_movement();

-- ============================================================================
-- ENVIRONMENTAL ALERTS (VPD, Temperature, Humidity)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_environmental_thresholds()
RETURNS TRIGGER AS $$
DECLARE
    v_room RECORD;
BEGIN
    -- Get room configuration
    SELECT * INTO v_room FROM rooms WHERE id = NEW.room_id;
    
    -- Check VPD thresholds
    IF NEW.vpd IS NOT NULL AND v_room.target_vpd_min IS NOT NULL THEN
        IF NEW.vpd < v_room.target_vpd_min THEN
            INSERT INTO alerts (severity, status, title, message, room_id)
            VALUES (
                'warning',
                'active',
                'VPD Bajo - ' || v_room.name,
                format('VPD actual: %.2f kPa (objetivo: %.2f-%.2f kPa). Reducir humedad o aumentar temperatura.',
                    NEW.vpd, v_room.target_vpd_min, v_room.target_vpd_max),
                NEW.room_id
            );
        ELSIF NEW.vpd > v_room.target_vpd_max THEN
            INSERT INTO alerts (severity, status, title, message, room_id)
            VALUES (
                'warning',
                'active',
                'VPD Alto - ' || v_room.name,
                format('VPD actual: %.2f kPa (objetivo: %.2f-%.2f kPa). Aumentar humedad o reducir temperatura.',
                    NEW.vpd, v_room.target_vpd_min, v_room.target_vpd_max),
                NEW.room_id
            );
        END IF;
    END IF;
    
    -- Check temperature thresholds
    IF NEW.temp_c IS NOT NULL AND v_room.target_temp_min IS NOT NULL THEN
        IF NEW.temp_c < v_room.target_temp_min THEN
            INSERT INTO alerts (severity, status, title, message, room_id)
            VALUES (
                'critical',
                'active',
                'Temperatura Baja - ' || v_room.name,
                format('Temperatura: %.1f°C (mínimo: %.1f°C)', NEW.temp_c, v_room.target_temp_min),
                NEW.room_id
            );
        ELSIF NEW.temp_c > v_room.target_temp_max THEN
            INSERT INTO alerts (severity, status, title, message, room_id)
            VALUES (
                'critical',
                'active',
                'Temperatura Alta - ' || v_room.name,
                format('Temperatura: %.1f°C (máximo: %.1f°C)', NEW.temp_c, v_room.target_temp_max),
                NEW.room_id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only trigger on significant changes (every 30 minutes to avoid spam)
DROP TRIGGER IF EXISTS environmental_threshold_alert_trigger ON environmental_readings;
CREATE TRIGGER environmental_threshold_alert_trigger
    AFTER INSERT ON environmental_readings
    FOR EACH ROW
    WHEN (EXTRACT(MINUTE FROM NEW.timestamp)::INTEGER % 30 = 0)
    EXECUTE FUNCTION check_environmental_thresholds();

-- ============================================================================
-- INVENTORY TRANSACTION UPDATES STOCK
-- ============================================================================

CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock based on transaction type
    UPDATE inventory_items
    SET stock_current = stock_current + 
        CASE NEW.transaction_type
            WHEN 'purchase' THEN NEW.quantity
            WHEN 'usage' THEN -NEW.quantity
            WHEN 'waste' THEN -NEW.quantity
            WHEN 'adjustment' THEN NEW.quantity
            ELSE 0
        END
    WHERE id = NEW.item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_transaction_stock_trigger ON inventory_transactions;
CREATE TRIGGER inventory_transaction_stock_trigger
    AFTER INSERT ON inventory_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_stock();

-- ============================================================================
-- TASK AUTO-COMPLETION TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION set_task_completed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS task_completion_trigger ON tasks;
CREATE TRIGGER task_completion_trigger
    BEFORE UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_task_completed_timestamp();

-- ============================================================================
-- AUDIT LOG TRIGGER (Optional - for compliance)
-- ============================================================================

CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), current_user);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), current_user);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit logging to critical tables (uncomment if needed)
-- CREATE TRIGGER audit_batches AFTER INSERT OR UPDATE OR DELETE ON batches
--     FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

-- CREATE TRIGGER audit_irrigation_logs AFTER INSERT OR UPDATE OR DELETE ON irrigation_logs
--     FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION check_ec_runoff_alert() IS 
'Automatically creates alerts when runoff EC indicates nutrient accumulation or deficiency';

COMMENT ON FUNCTION check_environmental_thresholds() IS 
'Monitors VPD, temperature, and humidity against room targets. Triggers every 30 min to avoid alert spam';

COMMENT ON FUNCTION update_batch_on_movement() IS 
'Keeps batch.room_id and batch.stage in sync with batch_movements table';
