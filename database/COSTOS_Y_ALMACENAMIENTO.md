# Análisis de Costos y Almacenamiento - Templo Verde Database

## 📊 Cálculo de Volumen de Datos

### Datos Ambientales (Environmental Readings)

**Frecuencia de ingesta**: Cada 10 minutos  
**Registros por día por sala**: 6 registros/hora × 24 horas = **144 registros/día**

#### Escenario: 4 Salas Activas

| Período | Registros Totales | Tamaño Estimado |
|---------|-------------------|-----------------|
| **1 Día** | 576 registros | ~115 KB |
| **1 Mes** | 17,280 registros | ~3.5 MB |
| **1 Año** | 210,240 registros | ~42 MB |
| **3 Años** | 630,720 registros | ~126 MB |

**Tamaño por registro**: ~200 bytes (timestamp, room_id, temp, humidity, vpd, co2, ppfd, etc.)

---

### Datos de Riego (Irrigation Logs)

**Frecuencia**: 1-2 veces por día por sala (promedio 1.5)

| Período | Registros Totales | Tamaño Estimado |
|---------|-------------------|-----------------|
| **1 Mes** | 180 registros | ~36 KB |
| **1 Año** | 2,190 registros | ~438 KB |
| **3 Años** | 6,570 registros | ~1.3 MB |

**Tamaño por registro**: ~200 bytes

---

### Otros Datos (Batches, Tasks, Alerts, Inventory)

Estos son datos de bajo volumen:
- **Batches**: ~50-100 registros/año → **20 KB/año**
- **Tasks**: ~500-1000 registros/año → **100 KB/año**
- **Alerts**: ~200-500 registros/año → **50 KB/año**
- **Inventory Transactions**: ~1000 registros/año → **200 KB/año**

---

## 💰 Costos de Supabase (PostgreSQL Hosting)

### Plan FREE (Gratis)
- **Base de datos**: 500 MB
- **Bandwidth**: 5 GB/mes
- **Usuarios activos**: Ilimitados
- **Row Level Security**: ✅ Incluido
- **Backups automáticos**: 7 días

**¿Te alcanza?** ✅ **SÍ, SOBRADO** para los primeros 2-3 años

**Cálculo**:
- Año 1: ~43 MB (ambiente) + 0.5 MB (riego) + 0.5 MB (otros) = **44 MB**
- Año 3: ~130 MB (ambiente) + 1.5 MB (riego) + 1.5 MB (otros) = **133 MB**

**Conclusión**: Con el plan FREE de Supabase tienes espacio para **~10 años de datos** sin problema.

---

### Plan PRO ($25 USD/mes) - Solo si necesitas:
- **Base de datos**: 8 GB
- **Backups**: 14 días + Point-in-time recovery
- **Soporte prioritario**
- **Mejor performance** (más CPU/RAM dedicada)

**¿Cuándo upgradearte?**
- Si tienes >10 salas activas
- Si necesitas backups más largos (compliance)
- Si tienes >1000 usuarios concurrentes en la app

---

## 🚀 TimescaleDB: ¿Qué es y cuánto cuesta?

### ¿Qué es TimescaleDB?

Es una **extensión GRATIS de PostgreSQL** especializada en datos de series temporales (como tus lecturas ambientales cada 10 minutos).

**Ventajas**:
1. **Queries 10-100x más rápidos** en gráficos de ambiente
2. **Compresión automática**: Reduce el tamaño de datos viejos en un 90%
3. **Particionamiento inteligente**: Organiza datos por tiempo automáticamente

**Desventajas**:
1. Requiere reiniciar la base de datos (downtime de ~2 minutos)
2. Ligeramente más complejo de configurar

### ¿Cuánto cuesta TimescaleDB en Supabase?

**GRATIS** ✅ - Es una extensión de PostgreSQL, no tiene costo adicional.

Lo único que necesitas es:
1. Activar la extensión en Supabase Dashboard
2. Ejecutar un comando SQL: `SELECT create_hypertable('environmental_readings', 'timestamp');`

### Comparación de Performance

**Sin TimescaleDB** (índices estándar):
```sql
-- Query: Últimas 24 horas de temperatura en Flora A
-- Tiempo: ~50-100ms con 200K registros
-- Tiempo: ~500ms-1s con 1M registros ❌ Lento
```

**Con TimescaleDB**:
```sql
-- Mismo query
-- Tiempo: ~10-20ms con 200K registros
-- Tiempo: ~30-50ms con 1M registros ✅ Rápido siempre
```

---

## 💡 Recomendación Final

### Para Templo Verde (4 salas):

| Componente | Recomendación | Costo |
|------------|---------------|-------|
| **Hosting** | Supabase FREE | **$0/mes** |
| **TimescaleDB** | ✅ Activar (opcional pero recomendado) | **$0** |
| **Data Retention** | Archivar datos >12 meses (script automático) | **$0** |
| **Backups** | 7 días automáticos (FREE plan) | **$0** |

### Costo Total Mensual: **$0 USD** 🎉

---

## 📈 Estrategia de Retención de Datos (Aprobada)

Basado en tu aprobación, implementaremos:

### 1. Datos Recientes (0-3 meses)
- **Granularidad**: Cada 10 minutos (original)
- **Uso**: Dashboards en tiempo real, crop steering diario
- **Acción**: Ninguna

### 2. Datos Históricos (3-12 meses)
- **Granularidad**: Cada 10 minutos (original)
- **Uso**: Análisis de tendencias, comparación de ciclos
- **Acción**: Comprimir con TimescaleDB (reduce 90% de espacio)

### 3. Datos Archivados (>12 meses)
- **Granularidad**: Agregado a 1 hora (promedio)
- **Uso**: Reportes anuales, análisis histórico
- **Acción**: Script automático que:
  - Calcula promedios por hora
  - Guarda en tabla `environmental_readings_archive`
  - Elimina registros originales de 10 minutos

**Resultado**: Mantienes **todos los datos** pero reduces el tamaño en un 95% después de 1 año.

---

## 🔧 Script de Retención Automática

```sql
-- Ejecutar mensualmente (via cron job)
-- Agrega datos >12 meses a archivo horario
INSERT INTO environmental_readings_archive
SELECT 
    room_id,
    date_trunc('hour', timestamp) as hour,
    AVG(temp_c) as avg_temp,
    AVG(humidity) as avg_humidity,
    AVG(vpd) as avg_vpd,
    AVG(co2_ppm) as avg_co2,
    AVG(ppfd) as avg_ppfd,
    COUNT(*) as reading_count
FROM environmental_readings
WHERE timestamp < NOW() - INTERVAL '12 months'
GROUP BY room_id, date_trunc('hour', timestamp);

-- Eliminar datos originales ya archivados
DELETE FROM environmental_readings
WHERE timestamp < NOW() - INTERVAL '12 months';
```

**Ahorro de espacio**: 
- Antes: 210,240 registros/año × 200 bytes = **42 MB/año**
- Después: 8,760 registros/año × 250 bytes = **2.2 MB/año**
- **Reducción: 95%** 🎯

---

## 🌱 Escalabilidad Futura

### Si creces a 10 salas:
- **Datos/año**: ~105 MB (ambiente) + 5 MB (otros) = **110 MB/año**
- **Plan recomendado**: Seguir en FREE (tienes 500 MB)
- **Con retención automática**: ~10 MB/año → **50 años de datos en plan FREE**

### Si creces a 20 salas:
- **Datos/año**: ~210 MB/año
- **Plan recomendado**: PRO ($25/mes) solo por performance, no por espacio
- **Con retención automática**: ~20 MB/año → Seguir en FREE

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si me quedo sin espacio?
Supabase te avisa cuando llegas al 80% de uso. Opciones:
1. Ejecutar script de retención manualmente
2. Upgradearte a PRO ($25/mes)
3. Exportar datos viejos a CSV y eliminarlos

### ¿Puedo descargar todos mis datos?
✅ Sí, siempre. Supabase te permite hacer `pg_dump` completo en cualquier momento.

### ¿TimescaleDB me obliga a pagar?
❌ No. Es una extensión open-source de PostgreSQL, completamente gratis.

### ¿Cuánto downtime tiene activar TimescaleDB?
~2-5 minutos de reinicio de base de datos. Hazlo en horario de baja actividad (madrugada).

---

## 🎯 Resumen Ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| **¿Cuánto pagas por hosting?** | $0/mes (Supabase FREE) |
| **¿Cuánto espacio usarás?** | ~44 MB/año (4 salas) |
| **¿Te alcanza el plan FREE?** | ✅ Sí, por 10+ años |
| **¿Necesitas TimescaleDB?** | Recomendado pero opcional |
| **¿Costo de TimescaleDB?** | $0 (extensión gratis) |
| **¿Cuándo upgradearte a PRO?** | Solo si tienes >10 salas o necesitas mejor performance |

**Conclusión**: Puedes operar **completamente gratis** con Supabase FREE + TimescaleDB por muchos años. 🚀
