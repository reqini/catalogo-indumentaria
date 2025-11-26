# 🧪 QA: Fix Urgente de Error PGRST205 - Tabla Ordenes

**Fecha:** 2024-11-26  
**Prioridad:** 🔴 **CRÍTICA** - Bloquea todas las compras  
**Estado:** ⏳ **EN PROGRESO**

---

## 🎯 OBJETIVO

Resolver definitivamente el error `PGRST205 - Could not find the table 'public.ordenes'` que está bloqueando todas las compras en producción.

---

## 🔍 DIAGNÓSTICO INICIAL

### Error Detectado:

```
POST /api/checkout/create-order-simple → 500 Internal Server Error
Error: Could not find the table 'public.ordenes' in the schema cache (PGRST205)
```

### Causa Raíz:

- La tabla `ordenes` no existe en Supabase
- La migración `006_create_ordenes_simple.sql` nunca se ejecutó
- Sin tabla → no se pueden guardar órdenes → checkout falla

---

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. Script Automático de Creación

**Archivo:** `scripts/crear-tabla-ordenes-urgente.mjs`

- ✅ Verifica si la tabla existe
- ✅ Crea tabla automáticamente si no existe
- ✅ Verifica funcionamiento con inserción de prueba
- ✅ Logs detallados para debugging

### 2. Endpoint API de Creación Automática

**Archivo:** `app/api/admin/crear-tabla-ordenes-urgente/route.ts`

- ✅ Endpoint POST para crear tabla automáticamente
- ✅ Ejecuta SQL completo con todos los campos
- ✅ Retorna SQL para ejecución manual si falla
- ✅ Verifica creación después de ejecutar

### 3. Endpoint de Verificación

**Archivo:** `app/api/admin/verificar-y-crear-ordenes/route.ts`

- ✅ Verifica existencia de tabla
- ✅ Prueba inserción de orden de prueba
- ✅ Retorna instrucciones claras si no existe
- ✅ Incluye SQL completo para ejecución manual

### 4. Mejoras en Código de Checkout

**Archivo:** `app/api/checkout/create-order-simple/route.ts`

- ✅ Detección automática de error PGRST205
- ✅ Intento automático de crear tabla
- ✅ Reintento de creación de orden después de crear tabla
- ✅ Mensajes de error mejorados con instrucciones

### 5. Mejoras en Helpers de Órdenes

**Archivo:** `lib/ordenes-helpers-simple.ts`

- ✅ Retry logic con backoff exponencial
- ✅ Manejo mejorado de errores PGRST205
- ✅ Logs detallados para debugging

### 6. Migración SQL Actualizada

**Archivo:** `supabase/migrations/006_create_ordenes_simple.sql`

- ✅ SQL completo con todos los campos necesarios
- ✅ Incluye campos de pago (pago_preferencia_id, pago_id, pago_estado, pago_fecha)
- ✅ Índices para mejor performance
- ✅ Políticas RLS configuradas
- ✅ Trigger para updated_at automático

---

## 🧪 CASOS DE PRUEBA

### TC-001: Verificar Existencia de Tabla

**Pasos:**

1. Llamar a `GET /api/admin/verificar-y-crear-ordenes`
2. Verificar respuesta

**Resultado Esperado:**

- Si tabla existe: `{"exists": true, "working": true}`
- Si tabla NO existe: `{"exists": false, "error": "PGRST205", "sql": "..."}`

**Resultado Real:** [PENDIENTE DE EJECUTAR]

**Screenshots:** `/qa/screenshots/ordenes/TC-001/`

---

### TC-002: Crear Tabla Automáticamente

**Pasos:**

1. Llamar a `POST /api/admin/crear-tabla-ordenes-urgente`
2. Verificar respuesta
3. Llamar nuevamente a verificación

**Resultado Esperado:**

- Primera llamada: `{"success": true, "action": "created"}`
- Segunda llamada: `{"exists": true, "working": true}`

**Resultado Real:** [PENDIENTE DE EJECUTAR]

**Screenshots:** `/qa/screenshots/ordenes/TC-002/`

---

### TC-003: Crear Orden de Compra Completa

**Pasos:**

1. Agregar producto al carrito
2. Ir a `/checkout`
3. Completar datos personales:
   - Nombre: "Test User"
   - Email: "test@example.com"
   - Teléfono: "+54 11 1234-5678"
4. Seleccionar "Retiro en local"
5. Click en "Pagar Ahora"
6. Verificar respuesta del servidor

**Resultado Esperado:**

- ✅ Status 200 (no 500)
- ✅ Respuesta con `orderId`, `preferenceId`, `initPoint`
- ✅ Orden guardada en Supabase
- ✅ Sin error PGRST205

**Resultado Real:** [PENDIENTE DE EJECUTAR]

**Screenshots:** `/qa/screenshots/ordenes/TC-003/`

---

### TC-004: Verificar Orden en Base de Datos

**Pasos:**

1. Después de crear orden exitosamente
2. Ir a Supabase Dashboard → Table Editor → `ordenes`
3. Buscar orden por ID o email
4. Verificar estructura de datos

**Resultado Esperado:**

- ✅ Orden visible en tabla
- ✅ Campos completos: productos, comprador, envio, total, estado
- ✅ `created_at` con timestamp correcto
- ✅ `estado = 'pendiente'`

**Resultado Real:** [PENDIENTE DE EJECUTAR]

**Screenshots:** `/qa/screenshots/ordenes/TC-004/`

---

### TC-005: Crear Orden con Envío a Domicilio

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

- ✅ Orden creada con `envio.tipo = 'estandar'` o `'express'`
- ✅ `envio.costo > 0`
- ✅ `envio.direccion` completo
- ✅ Total incluye costo de envío

**Resultado Real:** [PENDIENTE DE EJECUTAR]

**Screenshots:** `/qa/screenshots/ordenes/TC-005/`

---

## 📊 RESULTADOS DE PRUEBAS

| Caso                         | Estado       | Observaciones |
| ---------------------------- | ------------ | ------------- |
| TC-001: Verificar tabla      | ⏳ PENDIENTE | -             |
| TC-002: Crear tabla          | ⏳ PENDIENTE | -             |
| TC-003: Crear orden completa | ⏳ PENDIENTE | -             |
| TC-004: Verificar en BD      | ⏳ PENDIENTE | -             |
| TC-005: Orden con envío      | ⏳ PENDIENTE | -             |

---

## 🔧 INSTRUCCIONES DE EJECUCIÓN MANUAL

Si los métodos automáticos fallan, ejecuta manualmente:

### Paso 1: Ir a Supabase Dashboard

1. https://supabase.com/dashboard
2. Seleccionar proyecto

### Paso 2: Abrir SQL Editor

1. Click en "SQL Editor" en menú lateral
2. Click en "New query"

### Paso 3: Ejecutar SQL

1. Copiar contenido de `supabase/migrations/006_create_ordenes_simple.sql`
2. Pegar en editor
3. Click en "Run" o `Ctrl+Enter` / `Cmd+Enter`

### Paso 4: Verificar

1. Ir a "Table Editor"
2. Buscar tabla `ordenes`
3. Verificar que tiene todas las columnas

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Tabla `ordenes` existe en Supabase
- [ ] Todas las columnas presentes
- [ ] Índices creados
- [ ] Políticas RLS configuradas
- [ ] Endpoint `/api/checkout/create-order-simple` responde 200
- [ ] Orden se guarda correctamente en BD
- [ ] Sin errores PGRST205 en logs
- [ ] Flujo de checkout completo funciona

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DEL FIX

1. ✅ Probar compra completa end-to-end
2. ✅ Conectar con Mercado Pago
3. ✅ Probar creación de envío
4. ✅ Verificar tracking

---

**Última actualización:** 2024-11-26  
**Estado:** ⏳ **EN PROGRESO - ESPERANDO EJECUCIÓN DE SQL**
