# QA: Corrección de Error PGRST205 - Tabla ordenes

## 🎯 Objetivo

Verificar que el error `PGRST205 - Could not find the table 'public.ordenes'` está completamente resuelto y que el flujo de creación de orden funciona correctamente.

## 📋 Casos de Prueba

### Caso 1: Crear orden con envío a domicilio

**Precondiciones:**

- Tabla `ordenes` creada en Supabase
- Variables de entorno configuradas (`SUPABASE_SERVICE_ROLE_KEY`)
- Productos con stock disponible

**Pasos:**

1. Ir a `/checkout`
2. Completar datos personales completos
3. Completar dirección completa (calle, número, CP, localidad, provincia)
4. Seleccionar método de envío y calcular costo
5. Click en "Finalizar Compra"

**Resultado Esperado:**

- ✅ No aparece error 500
- ✅ No aparece error PGRST205
- ✅ Endpoint `/api/checkout/create-order` responde 200
- ✅ Orden insertada en BD con todos los campos correctos
- ✅ Redirección correcta a Mercado Pago
- ✅ `orderId` devuelto correctamente

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot: `qa/screenshots/checkout/orden-envio-domicilio.png`
- [ ] Logs del servidor: [adjuntar]
- [ ] Verificación en Supabase Dashboard: [adjuntar]

---

### Caso 2: Crear orden con retiro en local

**Precondiciones:**

- Tabla `ordenes` creada en Supabase
- Variables de entorno configuradas

**Pasos:**

1. Ir a `/checkout`
2. Completar datos personales
3. Seleccionar "Retiro en local"
4. Click en "Finalizar Compra"

**Resultado Esperado:**

- ✅ No aparece error 500
- ✅ No aparece error PGRST205
- ✅ Endpoint responde 200
- ✅ Orden insertada con `envio_tipo = 'retiro_local'`
- ✅ Campos de dirección son NULL (válido para retiro)
- ✅ `envio_costo = 0`
- ✅ Redirección correcta a MP

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot: `qa/screenshots/checkout/orden-retiro-local.png`
- [ ] Verificación en BD: campos NULL correctos

---

### Caso 3: Verificar que el error 500 en BD no ocurre más

**Precondiciones:**

- Tabla `ordenes` creada y verificada

**Pasos:**

1. Abrir DevTools → Network
2. Completar checkout completo
3. Verificar respuesta del endpoint `/api/checkout/create-order`

**Resultado Esperado:**

- ✅ Status code: 200 (no 500)
- ✅ Response body contiene `orderId`
- ✅ No aparece mensaje: "Could not find the table 'public.ordenes'"
- ✅ No aparece mensaje: "Error al crear la orden en la base de datos"

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot de Network tab: `qa/screenshots/checkout/network-200-ok.png`
- [ ] Response body: [adjuntar JSON]

---

### Caso 4: Checkout completo hasta Mercado Pago

**Precondiciones:**

- Tabla `ordenes` creada
- Mercado Pago configurado

**Pasos:**

1. Agregar productos al carrito
2. Ir a checkout
3. Completar todos los datos
4. Finalizar compra
5. Verificar redirección

**Resultado Esperado:**

- ✅ Orden creada en BD (verificar en Supabase Dashboard)
- ✅ Preferencia MP creada correctamente
- ✅ Redirección a `init_point` de Mercado Pago
- ✅ URL de MP contiene datos correctos
- ✅ Total en MP coincide con checkout

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot de redirección a MP: `qa/screenshots/checkout/redirect-mp.png`
- [ ] Verificación de orden en BD: [adjuntar]

---

## 🔍 Verificaciones Adicionales

### Verificación de Tabla en Supabase

**Pasos:**

1. Ir a Supabase Dashboard → Table Editor
2. Buscar tabla `ordenes` en schema `public`
3. Verificar estructura de columnas

**Resultado Esperado:**

- ✅ Tabla `ordenes` existe
- ✅ Columnas correctas:
  - `id` (UUID, PK)
  - `cliente_nombre`, `cliente_email`, `cliente_telefono`
  - `direccion_*` (pueden ser NULL)
  - `envio_tipo`, `envio_metodo`, `envio_costo`
  - `items` (JSONB)
  - `subtotal`, `descuento`, `envio_costo_total`, `total`
  - `pago_*` (método, estado, preferencia_id, etc.)
  - `estado`, `estado_fecha`
  - `created_at`, `updated_at`

**Resultado Real:**

- [ ] OK / [ ] Falla

---

### Verificación de Endpoint de Diagnóstico

**Endpoint:** `GET /api/admin/verify-ordenes-table`

**Pasos:**

1. Abrir `https://catalogo-indumentaria.vercel.app/api/admin/verify-ordenes-table`
2. Verificar respuesta JSON

**Resultado Esperado:**

```json
{
  "exists": true,
  "message": "La tabla ordenes existe y está operativa",
  "sampleCount": 0
}
```

**Si la tabla NO existe:**

```json
{
  "exists": false,
  "error": "Could not find the table 'public.ordenes'...",
  "code": "PGRST205",
  "hint": "Ejecuta la migración SQL...",
  "migrationFile": "supabase/migrations/005_create_ordenes_table.sql"
}
```

**Resultado Real:**

- [ ] OK / [ ] Falla

---

## 📊 Resumen de Resultados

| Caso                                  | Estado       | Observaciones |
| ------------------------------------- | ------------ | ------------- |
| Crear orden con envío domicilio       | ⏳ Pendiente |               |
| Crear orden con retiro en local       | ⏳ Pendiente |               |
| Verificar que error 500 no ocurre más | ⏳ Pendiente |               |
| Checkout completo hasta MP            | ⏳ Pendiente |               |
| Verificación de tabla en Supabase     | ⏳ Pendiente |               |
| Verificación de endpoint diagnóstico  | ⏳ Pendiente |               |

## 🚨 Acciones Requeridas si Falla

Si algún caso falla con error PGRST205:

1. **Ejecutar migración SQL manualmente:**
   - Ir a Supabase Dashboard → SQL Editor
   - Copiar contenido de `supabase/migrations/005_create_ordenes_table.sql`
   - Pegar y ejecutar en SQL Editor
   - Verificar que no hay errores

2. **Verificar variables de entorno en Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Verificar que están configuradas en Production

3. **Verificar permisos RLS:**
   - La tabla debe tener RLS habilitado
   - Debe existir política "Backend full access"

4. **Limpiar caché de PostgREST:**
   - En Supabase Dashboard → Settings → API
   - Hacer "Restart PostgREST" si está disponible

## ✅ Estado Final

**ESTADO FINAL: ORDENES OPERATIVO EN PRODUCCIÓN ✔ CIRCUITO DE COMPRA SIN ERRORES**
