# 🔥 Solución Definitiva: Error PGRST205 - Tabla ordenes no encontrada

**Fecha:** 2024-11-26  
**Prioridad:** 🔴 **CRÍTICA** - Bloquea todas las compras

---

## 🚨 PROBLEMA

Error `PGRST205` indica que la tabla `public.ordenes` no existe en Supabase:

```
Could not find the table 'public.ordenes' in the schema cache (PGRST205)
```

**Impacto:** ❌ **NO SE PUEDEN CREAR ÓRDENES** → ❌ **NO SE PUEDEN COMPRAR PRODUCTOS**

---

## ✅ SOLUCIÓN INMEDIATA (3 métodos)

### Método 1: Ejecutar SQL Manualmente (RECOMENDADO - 2 minutos)

1. **Ir a Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Seleccionar tu proyecto

2. **Abrir SQL Editor:**
   - Click en "SQL Editor" en el menú lateral
   - Click en "New query"

3. **Copiar y pegar este SQL completo:**

```sql
-- Crear tabla ordenes con estructura completa
CREATE TABLE IF NOT EXISTS public.ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  productos JSONB NOT NULL,
  comprador JSONB NOT NULL,
  envio JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estado TEXT DEFAULT 'pendiente' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  pago_preferencia_id TEXT,
  pago_id TEXT,
  pago_estado TEXT DEFAULT 'pendiente',
  pago_fecha TIMESTAMP
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS ordenes_created_idx ON public.ordenes (created_at DESC);
CREATE INDEX IF NOT EXISTS ordenes_estado_idx ON public.ordenes (estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_estado_idx ON public.ordenes (pago_estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_id_idx ON public.ordenes (pago_id) WHERE pago_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_comprador_email_idx ON public.ordenes ((comprador->>'email')) WHERE comprador->>'email' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_idx ON public.ordenes ((envio->>'tracking')) WHERE envio->>'tracking' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_number_idx ON public.ordenes ((envio->>'tracking_number')) WHERE envio->>'tracking_number' IS NOT NULL;

-- Habilitar RLS
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permite crear/leer/actualizar órdenes)
DROP POLICY IF EXISTS "insert-public" ON public.ordenes;
CREATE POLICY "insert-public" ON public.ordenes
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "select-public" ON public.ordenes;
CREATE POLICY "select-public" ON public.ordenes
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "update-public" ON public.ordenes;
CREATE POLICY "update-public" ON public.ordenes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER trigger_update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION update_ordenes_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.ordenes IS 'Órdenes de compra con estructura simplificada (productos, comprador, envio como JSONB)';
COMMENT ON COLUMN public.ordenes.productos IS 'Array JSON con productos: [{id, nombre, precio, cantidad, talle, subtotal}]';
COMMENT ON COLUMN public.ordenes.comprador IS 'Datos del comprador: {nombre, email, telefono}';
COMMENT ON COLUMN public.ordenes.envio IS 'Datos de envío: {tipo, metodo, costo, direccion, tracking}';
```

4. **Ejecutar:**
   - Click en "Run" o presionar `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Esperar confirmación de éxito

5. **Verificar:**
   - Deberías ver mensaje: "Success. No rows returned"
   - Ir a "Table Editor" → buscar tabla `ordenes`
   - Debería aparecer con todas las columnas

---

### Método 2: Usar Endpoint API (Automático)

1. **Obtener ADMIN_SECRET:**
   - Configurar en Vercel: `ADMIN_SECRET=tu_secret_aqui`
   - O usar el que ya tengas configurado

2. **Llamar al endpoint:**

```bash
curl -X POST https://catalogo-indumentaria.vercel.app/api/admin/crear-tabla-ordenes \
  -H "Authorization: Bearer tu_admin_secret_aqui" \
  -H "Content-Type: application/json"
```

3. **Si funciona:** Recibirás `{"success": true, "message": "Tabla ordenes creada exitosamente"}`

4. **Si no funciona:** Recibirás el SQL completo para ejecutar manualmente

---

### Método 3: Script Node.js Local

```bash
# Desde la raíz del proyecto
node scripts/crear-tabla-ordenes-automatico.mjs
```

**Requisitos:**

- Variables de entorno configuradas en `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=tu_url
  SUPABASE_SERVICE_ROLE_KEY=tu_service_key
  ```

---

## 🔍 VERIFICACIÓN POST-CREACIÓN

### Verificar que la tabla existe:

1. **En Supabase Dashboard:**
   - Table Editor → buscar `ordenes`
   - Debería aparecer con columnas: `id`, `productos`, `comprador`, `envio`, `total`, `estado`, `created_at`, etc.

2. **Probar creación de orden:**
   - Intentar hacer una compra de prueba
   - Debería funcionar sin error PGRST205

3. **Verificar logs:**
   - En Vercel Dashboard → Logs
   - Buscar: `[ORDENES-SIMPLE] ✅ Orden creada exitosamente`
   - NO debería aparecer: `PGRST205`

---

## 📋 ESTRUCTURA DE LA TABLA

La tabla `ordenes` debe tener esta estructura:

| Columna               | Tipo      | Descripción                                                             |
| --------------------- | --------- | ----------------------------------------------------------------------- |
| `id`                  | UUID      | ID único de la orden                                                    |
| `productos`           | JSONB     | Array de productos: `[{id, nombre, precio, cantidad, talle, subtotal}]` |
| `comprador`           | JSONB     | Datos del comprador: `{nombre, email, telefono}`                        |
| `envio`               | JSONB     | Datos de envío: `{tipo, metodo, costo, direccion, tracking}`            |
| `total`               | NUMERIC   | Total de la orden                                                       |
| `estado`              | TEXT      | Estado: `pendiente`, `pagada`, `enviada`, `entregada`, `cancelada`      |
| `created_at`          | TIMESTAMP | Fecha de creación                                                       |
| `updated_at`          | TIMESTAMP | Fecha de última actualización                                           |
| `pago_preferencia_id` | TEXT      | ID de preferencia de Mercado Pago                                       |
| `pago_id`             | TEXT      | ID del pago de Mercado Pago                                             |
| `pago_estado`         | TEXT      | Estado del pago: `pendiente`, `aprobado`, `rechazado`                   |
| `pago_fecha`          | TIMESTAMP | Fecha del pago                                                          |

---

## 🐛 TROUBLESHOOTING

### Error: "permission denied for schema public"

**Causa:** El usuario no tiene permisos para crear tablas

**Solución:**

1. Usar `SUPABASE_SERVICE_ROLE_KEY` (no `ANON_KEY`)
2. O ejecutar desde Supabase Dashboard (tiene permisos completos)

### Error: "relation already exists"

**Causa:** La tabla ya existe pero tiene estructura incorrecta

**Solución:**

1. Verificar estructura actual: `SELECT * FROM ordenes LIMIT 1`
2. Si falta campos, ejecutar migración 007: `supabase/migrations/007_add_pago_fields_to_ordenes.sql`

### Error: "PGRST205" persiste después de crear tabla

**Causa:** Cache de PostgREST no se actualizó

**Solución:**

1. Esperar 1-2 minutos (cache se actualiza automáticamente)
2. O hacer un request a Supabase para forzar refresh
3. O reiniciar el proyecto en Vercel

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] SQL ejecutado en Supabase Dashboard
- [ ] Tabla `ordenes` visible en Table Editor
- [ ] Todas las columnas presentes
- [ ] Índices creados correctamente
- [ ] Políticas RLS configuradas
- [ ] Probar creación de orden (debería funcionar)
- [ ] Verificar logs (no debería aparecer PGRST205)

---

## 🚀 DESPUÉS DE RESOLVER

Una vez resuelto el error:

1. **Probar compra completa:**
   - Agregar producto al carrito
   - Ir a checkout
   - Completar datos
   - Crear orden (debería funcionar sin error)

2. **Verificar orden en BD:**
   - Supabase Dashboard → Table Editor → `ordenes`
   - Debería aparecer la nueva orden

3. **Verificar logs:**
   - Vercel Dashboard → Logs
   - Buscar: `[ORDENES-SIMPLE] ✅ Orden creada exitosamente`

---

**Última actualización:** 2024-11-26  
**Estado:** ✅ **SOLUCIÓN LISTA PARA EJECUTAR**
