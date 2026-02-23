-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Templo Verde - Access Control
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE strains ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================================================

-- NOTE: We use Supabase's built-in auth functions directly in policies:
-- - auth.uid() - Returns the current user's ID
-- - auth.role() - Returns 'authenticated', 'anon', or 'service_role'
-- - auth.jwt() - Returns the JWT token with user metadata
--
-- User roles are stored in auth.users.raw_user_meta_data->>'role'
-- Possible values: 'operator', 'admin'


-- ============================================================================
-- INFRASTRUCTURE TABLES - READ: Operators, WRITE: Admins
-- ============================================================================

-- ROOMS
CREATE POLICY "Authenticated users can view rooms"
    ON rooms FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert rooms"
    ON rooms FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Only admins can update rooms"
    ON rooms FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Only admins can delete rooms"
    ON rooms FOR DELETE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- STRAINS
CREATE POLICY "Authenticated users can view strains"
    ON strains FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify strains"
    ON strains FOR ALL
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- INVENTORY ITEMS
CREATE POLICY "Authenticated users can view inventory"
    ON inventory_items FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Operators can update inventory stock"
    ON inventory_items FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin'));

CREATE POLICY "Only admins can create/delete inventory items"
    ON inventory_items FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Only admins can delete inventory items"
    ON inventory_items FOR DELETE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ============================================================================
-- CROP CYCLE TABLES - READ/WRITE: Operators
-- ============================================================================

-- BATCHES
CREATE POLICY "Authenticated users can view batches"
    ON batches FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Operators can create batches"
    ON batches FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin'));

CREATE POLICY "Operators can update batches"
    ON batches FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin'));

CREATE POLICY "Only admins can delete batches"
    ON batches FOR DELETE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- BATCH MOVEMENTS
CREATE POLICY "Authenticated users can view batch movements"
    ON batch_movements FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Operators can create batch movements"
    ON batch_movements FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin'));

-- ============================================================================
-- ENVIRONMENTAL READINGS - Special policies for automated ingestion
-- ============================================================================

CREATE POLICY "Authenticated users can view environmental data"
    ON environmental_readings FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can insert environmental data"
    ON environmental_readings FOR INSERT
    WITH CHECK (
        -- Allow service role (Edge Function) OR operators
        auth.role() = 'service_role' OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin')
    );

-- Only admins can delete environmental data (for cleanup/maintenance)
CREATE POLICY "Only admins can delete environmental data"
    ON environmental_readings FOR DELETE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ============================================================================
-- DAILY OPERATIONS - READ/WRITE: Operators
-- ============================================================================

-- IRRIGATION LOGS
CREATE POLICY "Authenticated users can view irrigation logs"
    ON irrigation_logs FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Operators can create irrigation logs"
    ON irrigation_logs FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin'));

CREATE POLICY "Operators can update irrigation logs"
    ON irrigation_logs FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin'));

CREATE POLICY "Only admins can delete irrigation logs"
    ON irrigation_logs FOR DELETE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- TASKS
CREATE POLICY "Authenticated users can view tasks"
    ON tasks FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Operators can manage tasks"
    ON tasks FOR ALL
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin'));

-- ============================================================================
-- ALERTS - Special policies
-- ============================================================================

CREATE POLICY "Authenticated users can view alerts"
    ON alerts FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role and operators can create alerts"
    ON alerts FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin')
    );

CREATE POLICY "Operators can acknowledge/resolve alerts"
    ON alerts FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin'));

-- ============================================================================
-- INVENTORY TRANSACTIONS
-- ============================================================================

CREATE POLICY "Authenticated users can view inventory transactions"
    ON inventory_transactions FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Operators can create inventory transactions"
    ON inventory_transactions FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('operator', 'admin'));

-- ============================================================================
-- AUDIT LOG - Read-only for admins
-- ============================================================================

CREATE POLICY "Only admins can view audit log"
    ON audit_log FOR SELECT
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Audit log inserts are handled by triggers only (no direct INSERT policy)

-- ============================================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant sequence permissions for UUID generation
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Service role can insert environmental data" ON environmental_readings IS 
'Allows Edge Functions (service_role) to insert sensor data automatically';

COMMENT ON POLICY "Service role and operators can create alerts" ON alerts IS 
'Allows automated triggers and Edge Functions to create alerts';
