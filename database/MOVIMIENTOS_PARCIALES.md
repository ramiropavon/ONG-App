# Movimientos Parciales de Batches - Guía de Uso

## ¿Qué son los Movimientos Parciales?

Los **movimientos parciales** te permiten mover **solo una parte de las plantas** de un lote (batch) a otra sala, manteniendo el resto en la sala original.

### Ejemplo Real:
Tienes un lote de 100 plantas en Vege:
- **Día 30**: Mueves 60 plantas a Flora A (las más grandes)
- **Día 35**: Mueves las 40 restantes a Flora B

---

## 🔧 Cómo Funciona Técnicamente

### Escenario 1: Movimiento COMPLETO (100 de 100 plantas)

```sql
-- Batch original: VEG-001 con 100 plantas en Vege
INSERT INTO batch_movements (
    batch_id, 
    from_room_id, 
    to_room_id,
    from_stage,
    to_stage,
    plant_count
) VALUES (
    'batch-uuid',
    'vege-room-uuid',
    'flora-a-uuid',
    'vege',
    'flora',
    100  -- Todas las plantas
);
```

**Resultado**:
- ✅ El batch `VEG-001` se mueve completamente a Flora A
- ✅ `batches.room_id` → Flora A
- ✅ `batches.stage` → 'flora'
- ✅ `batches.plant_count_current` → 100

---

### Escenario 2: Movimiento PARCIAL (60 de 100 plantas)

```sql
-- Batch original: VEG-001 con 100 plantas en Vege
INSERT INTO batch_movements (
    batch_id, 
    from_room_id, 
    to_room_id,
    from_stage,
    to_stage,
    plant_count
) VALUES (
    'batch-uuid',
    'vege-room-uuid',
    'flora-a-uuid',
    'vege',
    'flora',
    60  -- Solo 60 plantas
);
```

**Resultado**:
- ✅ El batch `VEG-001` **permanece en Vege**
- ✅ `batches.room_id` → Vege (sin cambios)
- ✅ `batches.stage` → 'vege' (sin cambios)
- ✅ `batches.plant_count_current` → **40** (100 - 60)
- ✅ Se crea un registro en `batch_movements` con la trazabilidad

---

## 🎯 Casos de Uso Comunes

### 1. Selección por Tamaño (Pheno Hunting)

```sql
-- Día 1: Mueves las 30 plantas más grandes a Flora A
INSERT INTO batch_movements (...) VALUES (..., 30);

-- Día 7: Mueves otras 25 plantas medianas a Flora B
INSERT INTO batch_movements (...) VALUES (..., 25);

-- Resultado: 45 plantas quedan en Vege para seguir creciendo
```

### 2. Escalonamiento de Cosechas

```sql
-- Semana 1: Mueves 20 plantas a Flora A
-- Semana 2: Mueves 20 plantas a Flora A
-- Semana 3: Mueves 20 plantas a Flora A

-- Resultado: Cosechas cada 7 días en lugar de todo junto
```

### 3. Descarte de Plantas Débiles

```sql
-- Tienes 100 plantas, descartas 15 débiles
UPDATE batches 
SET plant_count_current = 85
WHERE batch_code = 'VEG-001';

-- Luego mueves las 85 restantes a Flora
INSERT INTO batch_movements (...) VALUES (..., 85);
```

---

## ⚠️ Limitación Actual: Creación Manual de Nuevo Batch

### Problema:
Cuando haces un movimiento parcial, el trigger **NO crea automáticamente** un nuevo batch en la sala de destino. Solo decrementa el contador de plantas del batch original.

### Solución (2 opciones):

#### Opción A: Crear Nuevo Batch Manualmente (Recomendado)

```sql
-- 1. Crear nuevo batch en Flora A para las plantas movidas
INSERT INTO batches (
    batch_code,
    strain_id,
    room_id,
    start_date,
    plant_count_start,
    plant_count_current,
    stage,
    status,
    notes
) VALUES (
    'FLA-001-2026',  -- Nuevo código
    (SELECT strain_id FROM batches WHERE batch_code = 'VEG-001'),
    'flora-a-uuid',
    CURRENT_DATE,
    60,  -- Plantas movidas
    60,
    'flora',
    'active',
    'Plantas movidas desde VEG-001'
);

-- 2. Registrar el movimiento
INSERT INTO batch_movements (
    batch_id,  -- ID del batch ORIGINAL (VEG-001)
    from_room_id,
    to_room_id,
    from_stage,
    to_stage,
    plant_count
) VALUES (
    'veg-001-uuid',
    'vege-room-uuid',
    'flora-a-uuid',
    'vege',
    'flora',
    60
);
```

#### Opción B: Trigger Automático (Requiere Modificación)

Si quieres que el sistema cree automáticamente el nuevo batch, puedo modificar el trigger para que:
1. Detecte movimiento parcial
2. Clone el batch original
3. Cree nuevo batch en sala de destino
4. Actualice ambos batches

**¿Quieres que implemente esta opción?** Es un poco más complejo pero automatiza todo el proceso.

---

## 📊 Consultas Útiles

### Ver Historial de Movimientos de un Batch

```sql
SELECT 
    bm.movement_date,
    r_from.name as from_room,
    r_to.name as to_room,
    bm.from_stage,
    bm.to_stage,
    bm.plant_count,
    bm.reason,
    bm.performed_by
FROM batch_movements bm
LEFT JOIN rooms r_from ON bm.from_room_id = r_from.id
JOIN rooms r_to ON bm.to_room_id = r_to.id
WHERE bm.batch_id = 'batch-uuid'
ORDER BY bm.movement_date DESC;
```

### Ver Batches con Movimientos Parciales

```sql
SELECT 
    b.batch_code,
    b.plant_count_start,
    b.plant_count_current,
    b.plant_count_start - b.plant_count_current as plants_moved,
    r.name as current_room
FROM batches b
JOIN rooms r ON b.room_id = r.id
WHERE b.plant_count_current < b.plant_count_start
  AND b.status = 'active';
```

### Calcular Total de Plantas Movidas

```sql
SELECT 
    b.batch_code,
    SUM(bm.plant_count) as total_plants_moved,
    COUNT(bm.id) as movement_count
FROM batches b
JOIN batch_movements bm ON b.id = bm.batch_id
WHERE b.batch_code = 'VEG-001'
GROUP BY b.batch_code;
```

---

## 🚀 Workflow Recomendado en la App

### Frontend (React):

```javascript
// Componente: MovePartialBatch.jsx

const handlePartialMove = async () => {
  const { data: originalBatch } = await supabase
    .from('batches')
    .select('*')
    .eq('id', batchId)
    .single();
  
  // 1. Crear nuevo batch en destino
  const { data: newBatch } = await supabase
    .from('batches')
    .insert({
      batch_code: `${toRoom.code}-${Date.now()}`,
      strain_id: originalBatch.strain_id,
      room_id: toRoomId,
      start_date: new Date(),
      plant_count_start: plantCountToMove,
      plant_count_current: plantCountToMove,
      stage: toStage,
      status: 'active',
      notes: `Moved from ${originalBatch.batch_code}`
    })
    .select()
    .single();
  
  // 2. Registrar movimiento
  await supabase
    .from('batch_movements')
    .insert({
      batch_id: originalBatch.id,
      from_room_id: originalBatch.room_id,
      to_room_id: toRoomId,
      from_stage: originalBatch.stage,
      to_stage: toStage,
      plant_count: plantCountToMove,
      reason: moveReason,
      performed_by: user.name
    });
  
  // 3. El trigger automáticamente decrementa plant_count_current
  // del batch original
};
```

---

## ✅ Ventajas del Sistema Actual

1. **Trazabilidad Completa**: Cada movimiento queda registrado con fecha, usuario, y razón
2. **Flexibilidad**: Puedes mover cualquier cantidad de plantas
3. **Integridad de Datos**: El trigger valida que no muevas más plantas de las que existen
4. **Historial**: Puedes ver todos los movimientos de un batch a lo largo del tiempo

---

## 📝 Resumen

| Tipo de Movimiento | Plant Count | Comportamiento |
|-------------------|-------------|----------------|
| **Completo** | `plant_count >= plant_count_current` | Batch se mueve a nueva sala |
| **Parcial** | `plant_count < plant_count_current` | Batch permanece, se decrementa contador |

**Nota**: Para movimientos parciales, debes crear manualmente el nuevo batch en la sala de destino (o puedo automatizarlo con un trigger mejorado).

---

## 🤔 ¿Necesitas Automatización Completa?

Si quieres que el sistema automáticamente:
1. Cree el nuevo batch en la sala de destino
2. Actualice ambos batches
3. Mantenga la trazabilidad completa

Puedo modificar el trigger para que lo haga todo automáticamente. Solo dime y lo implemento. 🚀
