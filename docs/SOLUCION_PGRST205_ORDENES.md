# Solución Definitiva: Error PGRST205 - Tabla ordenes no encontrada

## 🔴 Error Original

```
POST /api/checkout/create-order 500 (Internal Server Error)
Error: Could not find the table 'public.ordenes' in the schema cache (PGRST205)
```

## ✅ Solución Implementada

### 1. Migración SQL Lista

**Archivo:** `supabase/migrations/005_create_ordenes_table.sql`

Esta migración crea la tabla `ordenes` con toda la estructura necesaria:

- Campos de cliente (nombre, email, teléfono)
- Campos de dirección (opcionales para retiro en local)
- Campos de envío (tipo, método, costo, tracking)
- Items como JSONB
- Totales (subtotal, descuento, envío, total)
- Campos de pago (método, estado, preferencia_id, payment_id)
- Estado de orden y timestamps
- Tabla de logs `ordenes_logs`
- Índices para performance
- Triggers para `updated_at` y logs automáticos
- RLS (Row Level Security) configurado

### 2. Endpoint de Verificación

**Endpoint:** `GET /api/admin/verify-ordenes-table`

Verifica si la tabla existe y devuelve información útil:

```json
{
  "exists": true,
  "message": "La tabla ordenes existe y está operativa",
  "sampleCount": 0
}
```

Si no existe:

```json
{
  "exists": false,
  "error": "Could not find the table 'public.ordenes'...",
  "code": "PGRST205",
  "hint": "Ejecuta la migración SQL...",
  "migrationFile": "supabase/migrations/005_create_ordenes_table.sql"
}
```

### 3. Script de Verificación

**Archivo:** `scripts/verify-and-create-ordenes-table.mjs`

Script Node.js que:

- Verifica si la tabla existe
- Intenta leer la migración SQL
- Proporciona instrucciones claras si necesita ejecución manual

**Uso:**

```bash
node scripts/verify-and-create-ordenes-table.mjs
```

### 4. Manejo de Errores Mejorado

**Archivos modificados:**

- `lib/ordenes-helpers.ts`: Manejo específico de error PGRST205
- `app/api/checkout/create-order/route.ts`: Respuestas claras con instrucciones

Cuando ocurre el error PGRST205, el sistema ahora:

1. Detecta específicamente el error de tabla no encontrada
2. Devuelve un mensaje claro con instrucciones
3. Incluye la ruta al archivo de migración SQL
4. Proporciona un `hint` con pasos a seguir

## 📋 Pasos para Resolver en Producción

### Opción 1: Ejecutar Migración SQL Manualmente (Recomendado)

1. **Ir a Supabase Dashboard:**
   - Abrir el proyecto en https://supabase.com/dashboard
   - Seleccionar el proyecto correcto

2. **Abrir SQL Editor:**
   - Click en "SQL Editor" en el menú lateral
   - Click en "New query"

3. **Copiar y Pegar Migración:**
   - Abrir el archivo `supabase/migrations/005_create_ordenes_table.sql`
   - Copiar TODO el contenido
   - Pegar en el SQL Editor de Supabase

4. **Ejecutar:**
   - Click en "Run" o presionar `Cmd/Ctrl + Enter`
   - Verificar que no hay errores
   - Deberías ver: "Success. No rows returned"

5. **Verificar:**
   - Ir a "Table Editor"
   - Buscar tabla `ordenes` en schema `public`
   - Verificar que tiene todas las columnas

### Opción 2: Usar el Endpoint de Verificación

1. **Verificar estado actual:**

   ```
   GET https://catalogo-indumentaria.vercel.app/api/admin/verify-ordenes-table
   ```

2. **Si devuelve `exists: false`:**
   - Seguir Opción 1 para crear la tabla

3. **Si devuelve `exists: true`:**
   - La tabla ya existe, el problema puede ser otro (permisos, caché, etc.)

### Opción 3: Limpiar Caché de PostgREST

Si la tabla existe pero sigue apareciendo el error:

1. En Supabase Dashboard → Settings → API
2. Buscar opción "Restart PostgREST" o "Clear Cache"
3. Reiniciar el servicio PostgREST

## 🔍 Verificación Post-Solución

### 1. Verificar Tabla en Supabase Dashboard

- Table Editor → `public.ordenes`
- Verificar columnas: `id`, `cliente_nombre`, `items`, `total`, etc.

### 2. Probar Endpoint de Verificación

```bash
curl https://catalogo-indumentaria.vercel.app/api/admin/verify-ordenes-table
```

Debería devolver `exists: true`

### 3. Probar Creación de Orden

1. Ir a `/checkout`
2. Completar datos
3. Finalizar compra
4. Verificar que NO aparece error 500
5. Verificar que la orden se crea en Supabase Dashboard

## 📊 Estructura de la Tabla

La tabla `ordenes` tiene la siguiente estructura:

```sql
CREATE TABLE public.ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cliente
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_telefono VARCHAR(50),

  -- Dirección (NULL si retiro en local)
  direccion_calle VARCHAR(255),
  direccion_numero VARCHAR(50),
  direccion_piso_depto VARCHAR(50),
  direccion_codigo_postal VARCHAR(10),
  direccion_localidad VARCHAR(255),
  direccion_provincia VARCHAR(255),
  direccion_pais VARCHAR(100) DEFAULT 'Argentina',

  -- Envío
  envio_tipo VARCHAR(50) NOT NULL,
  envio_metodo VARCHAR(100),
  envio_costo DECIMAL(10, 2) DEFAULT 0,
  envio_tracking VARCHAR(255),
  envio_proveedor VARCHAR(100),

  -- Productos (JSONB)
  items JSONB NOT NULL DEFAULT '[]',

  -- Totales
  subtotal DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  envio_costo_total DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,

  -- Pago
  pago_metodo VARCHAR(50) DEFAULT 'mercadopago',
  pago_estado VARCHAR(50) DEFAULT 'pendiente',
  pago_preferencia_id VARCHAR(255),
  pago_id VARCHAR(255),
  pago_fecha TIMESTAMP,

  -- Estado
  estado VARCHAR(50) DEFAULT 'pendiente',
  estado_fecha TIMESTAMP DEFAULT NOW(),

  -- Metadata
  notas TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## ✅ Resultado Esperado

Después de ejecutar la migración:

- ✅ La tabla `ordenes` existe en `public` schema
- ✅ El endpoint `/api/checkout/create-order` responde 200
- ✅ Las órdenes se crean correctamente en BD
- ✅ No aparece más el error PGRST205
- ✅ El flujo de checkout funciona completamente

## 🚨 Troubleshooting

### Si la tabla existe pero sigue el error:

1. **Verificar permisos RLS:**
   - La política "Backend full access" debe existir
   - Debe permitir INSERT, SELECT, UPDATE, DELETE

2. **Verificar variables de entorno:**
   - `SUPABASE_SERVICE_ROLE_KEY` debe estar configurada en Vercel
   - Debe ser la Service Role Key (no la Anon Key)

3. **Limpiar caché:**
   - Reiniciar PostgREST en Supabase Dashboard
   - Esperar 1-2 minutos para que se actualice el caché

4. **Verificar schema:**
   - La tabla debe estar en schema `public`
   - No debe estar en otro schema

## 📝 Notas Importantes

- La migración SQL es **idempotente** (usa `IF NOT EXISTS`)
- Puede ejecutarse múltiples veces sin problemas
- Los triggers y funciones se recrean si ya existen
- Las políticas RLS se crean solo si no existen

## 🔗 Archivos Relacionados

- `supabase/migrations/005_create_ordenes_table.sql` - Migración SQL completa
- `lib/ordenes-helpers.ts` - Funciones de creación de órdenes
- `app/api/checkout/create-order/route.ts` - Endpoint de creación
- `app/api/admin/verify-ordenes-table/route.ts` - Endpoint de verificación
- `scripts/verify-and-create-ordenes-table.mjs` - Script de verificación
- `qa/checkout_ordenes_fix.md` - QA completo
