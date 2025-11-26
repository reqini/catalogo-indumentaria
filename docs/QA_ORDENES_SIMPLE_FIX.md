# 🧪 QA: Fix Definitivo de Error PGRST205 - Tabla Ordenes

**Fecha:** 2024-11-26  
**Prioridad:** 🔴 **CRÍTICA**  
**Estado:** ⏳ **EN PROGRESO**

---

## 🎯 OBJETIVO

Verificar que el error `PGRST205` está completamente resuelto y que el flujo de creación de orden funciona correctamente en producción.

---

## ✅ CHECKLIST DE VERIFICACIÓN

### 1. Verificación de Tabla en Supabase

- [ ] Tabla `ordenes` existe en Supabase Dashboard → Table Editor
- [ ] Estructura correcta (columnas: id, productos, comprador, envio, total, estado, created*at, updated_at, pago*\*)
- [ ] Índices creados correctamente
- [ ] Políticas RLS configuradas

### 2. Verificación de Endpoint

- [ ] `GET /api/admin/verificar-y-crear-ordenes` retorna `exists: true`
- [ ] `POST /api/admin/crear-ordenes-inmediato` funciona correctamente
- [ ] Endpoint retorna SQL si la tabla no existe

### 3. Prueba de Compra Completa

#### TC-001: Compra Simple con Retiro en Local

**Pasos:**

1. Ir a `/catalogo`
2. Agregar producto al carrito
3. Ir a `/carrito`
4. Click en "Finalizar compra"
5. Completar datos:
   - Nombre: "Test Usuario"
   - Email: "test@example.com"
   - Teléfono: "+54 11 1234-5678"
6. Seleccionar "Retiro en el local"
7. Click en "Continuar a Resumen"
8. Verificar resumen
9. Click en "Pagar Ahora"

**Resultado Esperado:**

- ✅ Orden creada en BD sin error PGRST205
- ✅ Response 200 con `orderId` y `initPoint`
- ✅ Redirección a Mercado Pago (o mensaje si no está configurado)
- ✅ Orden visible en Supabase Table Editor

**Resultado Real:** [COMPLETAR DESPUÉS DE PRUEBA]

**Logs Esperados:**

```
[CHECKOUT-SIMPLE] ✅ Orden creada exitosamente: {orderId}
[ORDENES-SIMPLE] ✅ Orden creada exitosamente: {orderId}
```

**Logs Reales:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/ordenes/TC-001/`

---

#### TC-002: Compra con Envío a Domicilio

**Pasos:**

1. Agregar producto al carrito
2. Ir a checkout
3. Completar datos personales
4. Completar dirección completa:
   - Calle: "Av. Corrientes"
   - Número: "1234"
   - Código Postal: "C1000"
   - Localidad: "CABA"
   - Provincia: "Buenos Aires"
5. Calcular envío
6. Seleccionar método de envío
7. Completar compra

**Resultado Esperado:**

- ✅ Orden creada con datos de envío completos
- ✅ `envio.direccion` guardado correctamente en JSONB
- ✅ Sin error PGRST205

**Resultado Real:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/ordenes/TC-002/`

---

#### TC-003: Manejo de Error PGRST205 (Si ocurre)

**Pasos:**

1. Simular tabla no existente (si es posible)
2. Intentar crear orden
3. Verificar mensaje de error

**Resultado Esperado:**

- ✅ Error claro con código PGRST205
- ✅ Mensaje con instrucciones para crear tabla
- ✅ SQL proporcionado en la respuesta
- ✅ Instrucciones paso a paso

**Resultado Real:** [COMPLETAR DESPUÉS DE PRUEBA]

---

## 📊 RESULTADOS DE PRUEBAS

| Test Case                 | Estado       | Observaciones |
| ------------------------- | ------------ | ------------- |
| TC-001: Compra con Retiro | ⏳ PENDIENTE | -             |
| TC-002: Compra con Envío  | ⏳ PENDIENTE | -             |
| TC-003: Manejo de Error   | ⏳ PENDIENTE | -             |

---

## 🔍 VERIFICACIÓN EN BASE DE DATOS

### Query para verificar estructura:

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'ordenes'
ORDER BY ordinal_position;
```

### Query para verificar órdenes creadas:

```sql
SELECT
  id,
  estado,
  total,
  comprador->>'nombre' as nombre_cliente,
  comprador->>'email' as email_cliente,
  envio->>'tipo' as tipo_envio,
  created_at
FROM public.ordenes
ORDER BY created_at DESC
LIMIT 10;
```

### Resultado Esperado:

- Tabla con todas las columnas correctas
- Al menos una orden de prueba visible
- Datos en formato JSONB correctos

---

## 📝 LOGS DE SERVIDOR

### Logs Esperados en Vercel:

```
[CHECKOUT-SIMPLE] 📥 Request recibido
[CHECKOUT-SIMPLE] 📋 Body recibido: {comprador, productosCount, total}
[CHECKOUT-SIMPLE] ✅ Validación exitosa
[CHECKOUT-SIMPLE] 📤 Creando orden...
[ORDENES-SIMPLE] 🔍 Iniciando creación de orden
[ORDENES-SIMPLE] 📤 Insertando orden en BD
[ORDENES-SIMPLE] ✅ Orden creada exitosamente: {orderId}
[CHECKOUT-SIMPLE] ✅ Orden creada: {orderId}
[CHECKOUT-SIMPLE] ✅ Preferencia creada: {preferenceId}
```

### Logs Reales: [COMPLETAR DESPUÉS DE PRUEBA]

---

## 🐛 ERRORES DETECTADOS

### Error 1: PGRST205

**Estado:** ⏳ **VERIFICANDO**

**Descripción:** Tabla ordenes no encontrada en schema cache

**Solución Aplicada:**

- Script automático de creación
- Endpoint de verificación y creación
- SQL completo documentado
- Manejo robusto de errores con reintentos

**Resultado:** [COMPLETAR DESPUÉS DE VERIFICACIÓN]

---

## ✅ CRITERIOS DE ÉXITO

- [ ] Tabla `ordenes` existe en Supabase
- [ ] Estructura correcta verificada
- [ ] Compra de prueba exitosa (TC-001)
- [ ] Compra con envío exitosa (TC-002)
- [ ] Sin errores PGRST205 en logs
- [ ] Orden visible en BD después de compra
- [ ] Response 200 del endpoint create-order-simple

---

## 📸 EVIDENCIA VISUAL

### Screenshots Requeridos:

1. **Supabase Dashboard → Table Editor:**
   - Tabla `ordenes` visible
   - Estructura de columnas

2. **Supabase Dashboard → SQL Editor:**
   - SQL ejecutado exitosamente
   - Mensaje de éxito

3. **Vercel Dashboard → Logs:**
   - Logs de creación exitosa
   - Sin errores PGRST205

4. **Checkout en Producción:**
   - Formulario completado
   - Respuesta exitosa
   - Redirección a MP (si configurado)

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DEL FIX

1. ✅ Tabla ordenes creada y verificada
2. ⏳ Probar compra completa end-to-end
3. ⏳ Conectar Mercado Pago
4. ⏳ Probar webhook de MP
5. ⏳ Verificar actualización de orden después de pago

---

**Última actualización:** 2024-11-26  
**Estado:** ⏳ **EN VERIFICACIÓN**
