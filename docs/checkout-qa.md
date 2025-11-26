# 🧪 QA: Flujo de Checkout Completo

**Fecha:** 2024-11-26  
**Prioridad:** 🔴 **CRÍTICA** - Flujo de compra completo  
**Estado:** ✅ **LISTO PARA PRUEBAS**

---

## 📋 PRE-REQUISITOS

### 1. Ejecutar SQL en Supabase

**ANTES de probar el checkout**, ejecuta el siguiente SQL en Supabase Dashboard:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en "SQL Editor" en el menú lateral
4. Click en "New query"
5. Copia y pega el contenido completo de: `supabase/schemas/checkout-schema-completo.sql`
6. Click en "Run" o presiona `Ctrl+Enter` / `Cmd+Enter`
7. Verifica que aparezca: "Success. No rows returned"

**Archivo SQL:** `supabase/schemas/checkout-schema-completo.sql`

---

## ✅ CASOS DE PRUEBA

### TC-CHECKOUT-001: Flujo Completo de Compra (Happy Path)

**Objetivo:** Verificar que el flujo completo de compra funciona sin errores

**Precondiciones:**

- Tabla `ordenes` existe en Supabase (ejecutar SQL arriba)
- Productos disponibles en catálogo
- Mercado Pago configurado (variables de entorno)

**Pasos:**

1. Agregar producto al carrito
2. Ir a `/checkout`
3. Completar datos personales:
   - Nombre: "Juan Pérez"
   - Email: "juan@example.com"
   - Teléfono: "+54 11 1234-5678"
4. Completar dirección de envío:
   - Calle: "Av. Corrientes"
   - Número: "1234"
   - Código Postal: "C1043AAX"
   - Localidad: "Ciudad Autónoma de Buenos Aires"
   - Provincia: "Buenos Aires"
5. Seleccionar método de envío (o retiro en local)
6. Ver resumen de la orden
7. Click en "Pagar Ahora"
8. Verificar redirección a Mercado Pago

**Resultado esperado:**

- ✅ No aparece error 500
- ✅ No aparece error PGRST205
- ✅ Orden creada en Supabase con todos los datos
- ✅ Preferencia MP creada correctamente
- ✅ Redirección a Mercado Pago exitosa
- ✅ URL de MP contiene `init_point` válido

**Logs esperados en consola:**

```
[CHECKOUT][CLIENT] 📤 Enviando orden al servidor...
[CHECKOUT][API] 📥 Request recibido
[CHECKOUT][API] ✅ Validación exitosa
[CHECKOUT][API] 📤 Creando orden en Supabase...
[CHECKOUT][API] ✅ Orden creada exitosamente: {orderId}
[CHECKOUT][API] ✅ Preferencia MP creada: {preferenceId}
[CHECKOUT][API] ✅ Checkout completado exitosamente
[CHECKOUT][CLIENT] ✅ Respuesta del servidor: {ok: true, ...}
[CHECKOUT][CLIENT] 🎯 Redirigiendo a Mercado Pago...
```

---

### TC-CHECKOUT-002: Compra con Retiro en Local

**Objetivo:** Verificar que el checkout funciona con retiro en local (sin dirección)

**Pasos:**

1. Agregar producto al carrito
2. Ir a `/checkout`
3. Completar datos personales
4. Seleccionar "Retiro en el local" en método de envío
5. Verificar que no se requiere dirección
6. Click en "Pagar Ahora"

**Resultado esperado:**

- ✅ No se requiere dirección completa
- ✅ `envio_costo = 0`
- ✅ Orden creada con `envio.tipo = 'retiro_local'`
- ✅ Redirección a MP exitosa

---

### TC-CHECKOUT-003: Validación de Datos Inválidos

**Objetivo:** Verificar que las validaciones funcionan correctamente

**Pasos:**

1. Ir a `/checkout`
2. Intentar avanzar sin completar datos
3. Completar datos con formato inválido:
   - Email inválido: "juan@"
   - Teléfono muy corto: "123"
   - Código postal sin dirección completa

**Resultado esperado:**

- ✅ Mensajes de error claros y específicos
- ✅ No se permite avanzar con datos inválidos
- ✅ Errores específicos por campo

---

### TC-CHECKOUT-004: Error PGRST205 (Tabla No Existe)

**Objetivo:** Verificar manejo de error cuando la tabla no existe

**Precondiciones:**

- Tabla `ordenes` NO existe en Supabase

**Pasos:**

1. Intentar crear orden desde checkout
2. Verificar respuesta del servidor

**Resultado esperado:**

- ✅ Error 500 con código `CHECKOUT_CREATE_ORDER_ERROR`
- ✅ Mensaje claro indicando que falta ejecutar SQL
- ✅ Instrucciones para ejecutar migración
- ✅ No crashea la aplicación

**Respuesta esperada:**

```json
{
  "ok": false,
  "code": "CHECKOUT_CREATE_ORDER_ERROR",
  "message": "Error al crear la orden en la base de datos",
  "errorCode": "PGRST205",
  "hint": "Ejecuta el SQL en Supabase Dashboard → SQL Editor",
  "migrationFile": "supabase/schemas/checkout-schema-completo.sql"
}
```

---

### TC-CHECKOUT-005: EnvioPack No Configurado

**Objetivo:** Verificar que EnvioPack no rompe el checkout si no está configurado

**Precondiciones:**

- Variables `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET` NO configuradas

**Pasos:**

1. Ir a checkout
2. Ingresar código postal
3. Verificar cálculo de envío

**Resultado esperado:**

- ✅ No aparece error 500
- ✅ Se usa cálculo simulado como fallback
- ✅ Métodos de envío disponibles (simulados)
- ✅ Checkout continúa funcionando normalmente

**Logs esperados:**

```
[ENVIOS][ENVIOPACK] ⚠️ Credenciales no configuradas, usando cálculo simulado
```

---

### TC-CHECKOUT-006: Stock Insuficiente

**Objetivo:** Verificar manejo de stock insuficiente

**Pasos:**

1. Agregar producto con stock limitado al carrito
2. Intentar comprar más unidades de las disponibles
3. Verificar respuesta

**Resultado esperado:**

- ✅ Error 400 con código `CHECKOUT_INSUFFICIENT_STOCK`
- ✅ Mensaje claro indicando stock disponible
- ✅ No se crea orden

---

## 🔍 VERIFICACIÓN EN SUPABASE

Después de crear una orden exitosa, verifica en Supabase:

1. Ve a Supabase Dashboard → Table Editor → `ordenes`
2. Busca la orden recién creada (por email o por fecha)
3. Verifica que contenga:
   - ✅ Campo `productos` con array JSON correcto
   - ✅ Campo `comprador` con datos correctos
   - ✅ Campo `envio` con datos correctos
   - ✅ Campo `total` coincide con cálculo
   - ✅ Campo `estado` = 'pendiente'
   - ✅ Campo `pago_preferencia_id` presente (después de crear MP preference)

---

## 📊 RESUMEN DE RESULTADOS

| Caso            | Estado       | Observaciones |
| --------------- | ------------ | ------------- |
| TC-CHECKOUT-001 | ⏳ PENDIENTE | -             |
| TC-CHECKOUT-002 | ⏳ PENDIENTE | -             |
| TC-CHECKOUT-003 | ⏳ PENDIENTE | -             |
| TC-CHECKOUT-004 | ⏳ PENDIENTE | -             |
| TC-CHECKOUT-005 | ⏳ PENDIENTE | -             |
| TC-CHECKOUT-006 | ⏳ PENDIENTE | -             |

---

## 🐛 TROUBLESHOOTING

### Si aparece error PGRST205:

1. Verifica que ejecutaste el SQL en Supabase Dashboard
2. Espera 1-2 minutos (cache de PostgREST se actualiza)
3. Verifica que la tabla existe: `SELECT * FROM ordenes LIMIT 1;`

### Si no se redirige a Mercado Pago:

1. Verifica logs en consola del navegador
2. Verifica logs en Vercel Dashboard
3. Verifica que `MP_ACCESS_TOKEN` está configurado
4. Verifica que la respuesta contiene `initPoint`

### Si EnvioPack falla:

- No es crítico - el sistema usa cálculo simulado automáticamente
- Verifica logs: `[ENVIOS][ENVIOPACK]`

---

**Última actualización:** 2024-11-26  
**Estado:** ✅ **LISTO PARA PRUEBAS**
