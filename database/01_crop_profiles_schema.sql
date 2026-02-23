-- ============================================================================
-- TEMPLO VERDE - Crop Profiles & Environmental Targets Schema
-- ============================================================================

-- Table to store high-level Crop Profiles (Recipes)
CREATE TABLE crop_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store granular phases within a profile
CREATE TABLE crop_profile_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES crop_profiles(id) ON DELETE CASCADE,
    stage batch_stage NOT NULL, -- enum: 'clone', 'vege', 'flora'
    name VARCHAR(100) NOT NULL, -- e.g., "Stretch", "Bulking", "Vege Final"
    
    -- Week ranges are primarily used for Flowering. For Clones/Vege, they might be NULL or 1.
    start_week INTEGER,
    end_week INTEGER,
    
    -- Strategy
    irrigation_strategy VARCHAR(50), -- 'vegetative' or 'generative'
    
    -- Targets (min, target, max)
    vpd_min DECIMAL(3,2),
    vpd_target DECIMAL(3,2),
    vpd_max DECIMAL(3,2),
    
    ppfd_min INTEGER,
    ppfd_target INTEGER,
    ppfd_max INTEGER,
    
    temp_min DECIMAL(4,1),
    temp_target DECIMAL(4,1),
    temp_max DECIMAL(4,1),
    
    humidity_min DECIMAL(4,1),
    humidity_target DECIMAL(4,1),
    humidity_max DECIMAL(4,1),
    
    dryback_min DECIMAL(4,1),
    dryback_target DECIMAL(4,1),
    dryback_max DECIMAL(4,1),
    
    runoff_ec_min DECIMAL(4,2),
    runoff_ec_target DECIMAL(4,2),
    runoff_ec_max DECIMAL(4,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Link Batches to a Specific Profile
ALTER TABLE batches
ADD COLUMN crop_profile_id UUID REFERENCES crop_profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- SEED DATA (As requested in the user prompt)
-- ============================================================================

-- Insert the default "Receta Standard" Profile
WITH inserted_profile AS (
    INSERT INTO crop_profiles (id, name, description) 
    VALUES (uuid_generate_v4(), 'Receta Standard Alta Producción', 'Perfil de cultivo basado en asesoría técnica para maximizar rendimiento y calidad.')
    RETURNING id
)
-- Insert the 5 phases for this profile
INSERT INTO crop_profile_phases (
    profile_id, stage, name, start_week, end_week, irrigation_strategy,
    vpd_target, ppfd_min, ppfd_target, ppfd_max, temp_target, humidity_min, humidity_target, humidity_max,
    dryback_min, dryback_target, dryback_max, runoff_ec_min, runoff_ec_target, runoff_ec_max
) VALUES 
-- 1. Clones / Esquejes
( (SELECT id FROM inserted_profile), 'clone', 'Clones / Esquejes', NULL, NULL, NULL,
  0.8, 150, 175, 200, 26.0, 70.0, 72.5, 75.0,
  NULL, NULL, NULL, NULL, NULL, NULL),

-- 2. Vegetativo (Sala Definitiva)
( (SELECT id FROM inserted_profile), 'vege', 'Vegetativo (Sala Definitiva)', NULL, NULL, 'Vegetativa',
  1.0, 450, 475, 500, 26.0, NULL, 65.0, NULL,
  30.0, 35.0, 40.0, 2.0, 2.5, 3.0),

-- 3. Floración - Stretch (Semanas 1 a 3)
( (SELECT id FROM inserted_profile), 'flora', 'Stretch (Estrés Controlado)', 1, 3, 'Generativa',
  1.2, 600, 650, 700, 23.5, NULL, 55.0, NULL,
  40.0, 45.0, 50.0, 5.0, 7.5, 10.0),

-- 4. Floración - Engorde / Bulking (Semanas 4 a 8)
( (SELECT id FROM inserted_profile), 'flora', 'Engorde / Bulking', 4, 8, 'Vegetativa',
  1.3, 800, 850, 900, 25.5, 55.0, 57.5, 60.0,
  30.0, 35.0, 40.0, 3.0, 4.0, 5.0),

-- 5. Floración - Maduración (Últimas semanas, e.g. 9-10)
( (SELECT id FROM inserted_profile), 'flora', 'Maduración', 9, 10, 'Generativa',
  1.4, NULL, 800, NULL, 22.5, 45.0, 50.0, 55.0,
  40.0, 45.0, 50.0, 1.0, 2.0, 3.0);
