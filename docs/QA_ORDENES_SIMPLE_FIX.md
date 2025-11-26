# 🧪 QA: Fix de Error PGRST205 - Tabla ordenes

**Fecha:** 2024-11-26  
**Prioridad:** 🔴 **CRÍTICA** - Bloquea todas las compras  
**Estado:** ⏳ **EN PROGRESO**

---

## 🎯 OBJETIVO

Verificar que el error `PGRST205 - Could not find the table 'public.ordenes'` está completamente resuelto y que el flujo de creación de orden funciona correctamente.

---

## ✅ CASOS DE PRUEBA

### TC-ORDENES-001: Verificar Existencia de Tabla

**Objetivo:** Confirmar que la tabla `ordenes` existe en Supabase

**Pasos:**

1. Ir a Supabase Dashboard → Table Editor
2. Buscar tabla `ordenes`
3. Verificar columnas presentes

**Resultado esperado:**

- ✅ Tabla `ordenes` visible
- ✅ Columnas: `id`, `productos`, `comprador`, `envio`, `total`, `estado`, `created_at`, `updated_at`, `pago_preferencia_id`, `pago_id`, `pago_estado`, `pago_fecha`

**Resultado real:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshot:** `/qa/screenshots/ordenes/tabla-existe.png`

---

### TC-ORDENES-002: Crear Orden desde Checkout

**Objetivo:** Verificar que se puede crear una orden completa desde el checkout

**Precondiciones:**

- Tabla `ordenes` existe en Supabase
- Productos disponibles en catálogo
- Usuario en checkout con datos completos

**Pasos:**

1. Agregar producto al carrito
2. Ir a `/checkout`
3. Completar datos personales:
   - Nombre: "Juan Pérez"
   - Email: "juan@example.com"
   - Teléfono: "+54 11 1234-5678"
4. Seleccionar método de envío o retiro en local
5. Click en "Pagar Ahora"
6. Verificar respuesta del servidor

**Resultado esperado:**

- ✅ Respuesta 200 OK
- ✅ `orderId` presente en respuesta
- ✅ `preferenceId` presente en respuesta
- ✅ `initPoint` presente en respuesta
- ✅ Orden guardada en BD con todos los datos
- ✅ NO aparece error PGRST205

**Resultado real:** [COMPLETAR DESPUÉS DE PRUEBA]

**Logs esperados:**

```
[CHECKOUT-SIMPLE] ✅ Orden creada exitosamente: {orderId}
[CHECKOUT-SIMPLE] 🎯 QA LOG - Orden creada: {orderId, productosCount, total, envioTipo}
```

**Screenshot:** `/qa/screenshots/ordenes/orden-creada-checkout.png`

---

### TC-ORDENES-003: Verificar Orden en Base de Datos

**Objetivo:** Confirmar que la orden se guardó correctamente en Supabase

**Pasos:**

1. Después de crear orden (TC-ORDENES-002)
2. Ir a Supabase Dashboard → Table Editor → `ordenes`
3. Buscar orden por `orderId` o por email del comprador
4. Verificar datos guardados

**Resultado esperado:**

- ✅ Orden visible en tabla
- ✅ Campo `productos` contiene array JSON correcto
- ✅ Campo `comprador` contiene datos correctos
- ✅ Campo `envio` contiene datos correctos
- ✅ Campo `total` coincide con cálculo
- ✅ Campo `estado` = 'pendiente'
- ✅ Campo `created_at` tiene timestamp reciente

**Resultado real:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshot:** `/qa/screenshots/ordenes/orden-en-bd.png`

---

### TC-ORDENES-004: Error PGRST205 Resuelto

**Objetivo:** Confirmar que el error PGRST205 NO aparece más

**Pasos:**

1. Abrir DevTools → Console
2. Intentar crear orden (TC-ORDENES-002)
3. Verificar logs en consola
4. Verificar logs en Vercel Dashboard

**Resultado esperado:**

- ✅ NO aparece error PGRST205 en consola
- ✅ NO aparece error PGRST205 en logs de Vercel
- ✅ Mensajes de éxito presentes

**Resultado real:** [COMPLETAR DESPUÉS DE PRUEBA]

**Logs a verificar:**

- ❌ NO debe aparecer: `PGRST205`
- ❌ NO debe aparecer: `schema cache`
- ❌ NO debe aparecer: `does not exist`
- ✅ Debe aparecer: `Orden creada exitosamente`

---

### TC-ORDENES-005: Compra Completa End-to-End

**Objetivo:** Verificar flujo completo de compra sin errores

**Pasos:**

1. Agregar producto al carrito
2. Ir a checkout
3. Completar todos los datos
4. Seleccionar envío
5. Crear orden (debe funcionar sin error)
6. Verificar que se genera preferencia MP
7. Verificar redirección a MP

**Resultado esperado:**

- ✅ Todo el flujo funciona sin errores
- ✅ Orden creada correctamente
- ✅ Preferencia MP generada
- ✅ Redirección a MP exitosa
- ✅ NO aparece error 500
- ✅ NO aparece error PGRST205

**Resultado real:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshot:** `/qa/screenshots/ordenes/flujo-completo.png`

---

## 📊 RESUMEN DE RESULTADOS

| Caso           | Estado       | Observaciones |
| -------------- | ------------ | ------------- |
| TC-ORDENES-001 | ⏳ PENDIENTE | -             |
| TC-ORDENES-002 | ⏳ PENDIENTE | -             |
| TC-ORDENES-003 | ⏳ PENDIENTE | -             |
| TC-ORDENES-004 | ⏳ PENDIENTE | -             |
| TC-ORDENES-005 | ⏳ PENDIENTE | -             |

---

## 🔍 VERIFICACIÓN TÉCNICA

### Estructura de Tabla Verificada

```sql
-- Verificar estructura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'ordenes'
ORDER BY ordinal_position;
```

**Resultado esperado:**

- 12 columnas presentes
- Tipos de datos correctos
- Defaults configurados

### Políticas RLS Verificadas

```sql
-- Verificar políticas
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'ordenes';
```

**Resultado esperado:**

- 3 políticas presentes (insert, select, update)
- Permisos para `anon` configurados

### Índices Verificados

```sql
-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'ordenes';
```

**Resultado esperado:**

- Mínimo 5 índices presentes
- Índices en campos críticos

---

## 🐛 TROUBLESHOOTING

### Si el error PGRST205 persiste:

1. **Verificar que la tabla existe:**

   ```sql
   SELECT * FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'ordenes';
   ```

2. **Si no existe, ejecutar migración:**
   - Archivo: `supabase/migrations/006_create_ordenes_simple_COMPLETA.sql`
   - En Supabase Dashboard → SQL Editor

3. **Esperar actualización de cache:**
   - PostgREST cache se actualiza cada 1-2 minutos
   - O hacer un request a Supabase para forzar refresh

4. **Verificar variables de entorno:**
   - `NEXT_PUBLIC_SUPABASE_URL` configurada
   - `SUPABASE_SERVICE_ROLE_KEY` configurada

---

## ✅ CHECKLIST FINAL

- [ ] Tabla `ordenes` existe en Supabase
- [ ] Estructura correcta (12 columnas)
- [ ] Políticas RLS configuradas
- [ ] Índices creados
- [ ] Orden se crea desde checkout sin error
- [ ] Orden visible en BD después de creación
- [ ] NO aparece error PGRST205
- [ ] Logs muestran éxito
- [ ] Flujo completo funciona

---

**Última actualización:** 2024-11-26  
**Estado:** ⏳ **PENDIENTE DE EJECUCIÓN**
