-- ============================================================================
-- CONFIGURACIÓN DE USUARIOS - Templo Verde
-- Equipo: Seba, Fede, Rama
-- ============================================================================

-- IMPORTANTE: Primero debes crear los usuarios en Supabase Dashboard
-- Ve a: Authentication → Users → Add user
-- Luego ejecuta este script para asignar roles

-- ============================================================================
-- SEBA - Encargado de Riego (Operator)
-- ============================================================================
-- Responsabilidades:
-- - Preparar y ejecutar riegos
-- - Registrar datos de irrigation logs (EC, pH, dryback)
-- - Ver alertas de EC y crop steering

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"operator"'
)
WHERE email = 'seba@temploverde.com';

-- Verificar
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'seba@temploverde.com';

-- ============================================================================
-- FEDE - Encargado de Vege y Cosecha (Operator)
-- ============================================================================
-- Responsabilidades:
-- - Organizar cosechas
-- - Gestión de sala Vege
-- - Control de esquejes y clones
-- - Crear y mover batches

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"operator"'
)
WHERE email = 'fede@temploverde.com';

-- Verificar
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'fede@temploverde.com';

-- ============================================================================
-- RAMA - Monitoreo y Control Diario (Admin)
-- ============================================================================
-- Responsabilidades:
-- - Monitoreo general de todas las salas
-- - Control diario de parámetros ambientales
-- - Gestión de alertas críticas
-- - Acceso completo a configuración

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'rama@temploverde.com';

-- Verificar
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'rama@temploverde.com';

-- ============================================================================
-- VERIFICACIÓN FINAL - Ver todos los usuarios y sus roles
-- ============================================================================

SELECT 
    email,
    raw_user_meta_data->>'role' as role,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- PERMISOS POR ROL
-- ============================================================================

/*
OPERATOR (Seba, Fede):
✅ Ver todas las salas, batches, datos ambientales
✅ Crear y editar irrigation logs
✅ Crear y mover batches
✅ Crear y completar tasks
✅ Ver alertas
✅ Actualizar inventario

❌ Eliminar batches
❌ Eliminar irrigation logs
❌ Modificar configuración de salas
❌ Eliminar strains

ADMIN (Rama):
✅ TODO lo que puede hacer un Operator
✅ Eliminar cualquier registro
✅ Modificar configuración de salas
✅ Crear/eliminar strains
✅ Acceso al audit log
✅ Gestión completa del sistema
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
1. CREAR USUARIOS PRIMERO:
   - Ve a Supabase Dashboard → Authentication → Users
   - Click "Add user" → "Create new user"
   - Email: seba@temploverde.com (y los demás)
   - Password: Genera una contraseña segura
   - Auto Confirm User: ✅ Activado

2. LUEGO EJECUTAR ESTE SCRIPT:
   - Copia y pega en SQL Editor
   - Ejecuta todo junto

3. CREDENCIALES:
   - Envía las contraseñas a cada usuario de forma segura
   - Recomendá que cambien la contraseña en el primer login

4. TESTING:
   - Cada usuario debe loguearse en la app
   - Verificar que pueden ver/editar según sus permisos
*/
