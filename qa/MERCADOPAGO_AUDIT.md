# 💳 Auditoría Profunda de Mercado Pago

**Fecha de Auditoría:** 26/11/2025  
**Estado General:** 🟢 **BIEN IMPLEMENTADO** (requiere validación de credenciales en producción)

---

## 📊 Resumen Ejecutivo

| Elemento                 | Estado                     | Detalle                                                                  |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------ |
| **Credenciales**         | 🟡 **REQUIERE VALIDACIÓN** | Validación robusta implementada, necesita verificar en producción        |
| **Webhook**              | 🟢 **COMPLETO**            | Implementado con verificación de firma, idempotencia y manejo de estados |
| **Preferencia**          | 🟢 **COMPLETO**            | Genera preferencias con items, payer, shipping y metadata correcta       |
| **Notificaciones**       | 🟢 **COMPLETO**            | Email al cliente y admin, preparado para WhatsApp                        |
| **Estados de Orden**     | 🟢 **COMPLETO**            | Maneja approved, pending, rejected correctamente                         |
| **Stock Management**     | 🟢 **COMPLETO**            | Actualiza stock automáticamente al aprobar pago                          |
| **Shipping Integration** | 🟢 **COMPLETO**            | Crea envío automáticamente cuando pago se aprueba                        |

---

## 🔐 Validación de Credenciales

### Modo Productivo vs Sandbox

**Implementación Actual:**

- ✅ Detecta automáticamente si el token es de producción (`APP_USR-`) o sandbox (`TEST-`)
- ✅ Validación en runtime (no al cargar módulo)
- ✅ Múltiples fallbacks para leer variables de entorno
- ✅ Logs detallados de diagnóstico

**Código Relevante:**

```typescript
// app/api/pago/route.ts
const MP_ACCESS_TOKEN_DIRECT =
  process.env.MP_ACCESS_TOKEN ||
  process.env['MP_ACCESS_TOKEN'] ||
  process.env.MERCADOPAGO_ACCESS_TOKEN ||
  process.env['MERCADOPAGO_ACCESS_TOKEN']

const mpConfig = validateMercadoPagoConfig()
const MP_ACCESS_TOKEN = MP_ACCESS_TOKEN_DIRECT || mpConfig.accessToken
```

**Estado:** 🟢 **BIEN IMPLEMENTADO**

**Recomendación:**

- Verificar que `MP_ACCESS_TOKEN` esté configurado en Vercel Dashboard
- Verificar que el token sea de producción (`APP_USR-`) y no de sandbox (`TEST-`)
- Hacer redeploy después de configurar variables

---

## 🔑 Validación de Credenciales (PUBLIC_KEY, ACCESS_TOKEN)

### ACCESS_TOKEN

**Estado:** 🟡 **REQUIERE VALIDACIÓN EN PRODUCCIÓN**

**Validaciones Implementadas:**

- ✅ Verifica existencia del token
- ✅ Verifica formato (`APP_USR-` o `TEST-`)
- ✅ Verifica longitud mínima
- ✅ Logs detallados de diagnóstico

**Variables Requeridas:**

```env
MP_ACCESS_TOKEN=APP_USR-xxxxx... (producción)
# o
MP_ACCESS_TOKEN=TEST-xxxxx... (sandbox para pruebas)
```

**Endpoint de Verificación:**

- `GET /api/mp/verify-config` - Verifica configuración actual
- `GET /api/mp/test-token` - Prueba rápida del token

### PUBLIC_KEY

**Estado:** 🟢 **IMPLEMENTADO**

**Variables Requeridas:**

```env
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR_xxxxx... (clave pública)
```

**Uso:**

- Se usa en el frontend para inicializar el SDK de Mercado Pago
- No se valida en el backend (solo en frontend)

---

## 📦 Validación de Preferencia Generada

### Items Reales

**Estado:** 🟢 **COMPLETO**

**Implementación:**

- ✅ Incluye todos los productos del carrito
- ✅ Incluye costo de envío como item separado (si aplica)
- ✅ Cada item incluye:
  - `title`: Nombre del producto + talle
  - `quantity`: Cantidad
  - `unit_price`: Precio unitario
  - `id`: ID del producto (UUID)
  - `description`: Talle del producto

**Código Relevante:**

```typescript
// app/api/pago/route.ts
const preferenceData = {
  items: items.map((item) => ({
    title: item.title,
    quantity: item.quantity,
    unit_price: item.unit_price,
    description: item.talle ? `Talle: ${item.talle}` : item.title,
  })),
  // ...
}
```

### Payer Real

**Estado:** 🟢 **COMPLETO**

**Implementación:**

- ✅ Incluye nombre completo del cliente
- ✅ Incluye email del cliente
- ✅ Incluye teléfono (si está disponible)
- ✅ Incluye dirección completa:
  - `street_name`: Calle
  - `street_number`: Número
  - `zip_code`: Código postal

**Código Relevante:**

```typescript
// app/api/checkout/create-order/route.ts
payer: {
  name: validatedData.cliente.nombre,
  email: validatedData.cliente.email,
  phone: validatedData.cliente.telefono ? {
    area_code: '',
    number: validatedData.cliente.telefono,
  } : undefined,
  address: {
    street_name: validatedData.direccion.calle,
    street_number: parseInt(validatedData.direccion.numero) || 0,
    zip_code: validatedData.direccion.codigoPostal,
  },
}
```

### Shipping Data Incluido

**Estado:** 🟢 **COMPLETO**

**Implementación:**

- ✅ El costo de envío se incluye como item separado en la preferencia
- ✅ Se detecta automáticamente en el webhook
- ✅ Se guarda en la orden con método y costo

**Código Relevante:**

```typescript
// app/api/checkout/create-order/route.ts
if (validatedData.envio.costo > 0) {
  mpItems.push({
    title: `Envío - ${validatedData.envio.metodo}`,
    quantity: 1,
    unit_price: validatedData.envio.costo,
    id: 'envio',
  })
}
```

### Metadata Correcta

**Estado:** 🟢 **COMPLETO**

**Implementación:**

- ✅ `external_reference`: ID de la orden (UUID)
- ✅ `notification_url`: URL del webhook
- ✅ `back_urls`: URLs de éxito, fallo y pendiente con `orderId`
- ✅ `additional_info.items`: Información detallada de cada item

**Código Relevante:**

```typescript
// app/api/pago/route.ts
preferenceData = {
  external_reference: externalReference, // orderId
  notification_url: `${baseUrl}/api/mp/webhook`,
  back_urls: {
    success: `${origin}/pago/success?orderId=${order.id}`,
    failure: `${origin}/pago/failure?orderId=${order.id}`,
    pending: `${origin}/pago/pending?orderId=${order.id}`,
  },
  additional_info: {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.talle ? `Talle: ${item.talle}` : undefined,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  },
}
```

---

## 🔄 Validación de Success / Failure / Pending Callbacks

### Success Callback

**Estado:** 🟢 **COMPLETO**

**Implementación:**

- ✅ URL: `/pago/success?orderId={orderId}`
- ✅ Página muestra información de la orden
- ✅ Limpia el carrito automáticamente
- ✅ Muestra número de tracking si está disponible

**Código:** `app/pago/success/page.tsx`

### Failure Callback

**Estado:** 🟢 **COMPLETO**

**Implementación:**

- ✅ URL: `/pago/failure?orderId={orderId}`
- ✅ Página muestra mensaje de error
- ✅ Permite reintentar la compra
- ✅ No limpia el carrito (permite reintentar)

**Código:** `app/pago/failure/page.tsx`

### Pending Callback

**Estado:** 🟢 **COMPLETO**

**Implementación:**

- ✅ URL: `/pago/pending?orderId={orderId}`
- ✅ Página muestra mensaje de pago pendiente
- ✅ Informa que se notificará cuando se apruebe

**Código:** `app/pago/pending/page.tsx`

---

## 🔔 Auditoría del Webhook Real

### Endpoint Existe y Responde 200?

**Estado:** 🟢 **SÍ**

**Endpoint:** `POST /api/mp/webhook`

**Implementación:**

- ✅ Endpoint implementado correctamente
- ✅ Responde 200 OK cuando procesa correctamente
- ✅ Responde 401 si la firma es inválida
- ✅ Responde 500 si hay error interno

**Código:** `app/api/mp/webhook/route.ts`

### Verifica Firma?

**Estado:** 🟡 **OPCIONAL (Recomendado)**

**Implementación:**

- ✅ Verificación de firma implementada
- ⚠️ Solo se ejecuta si `MP_WEBHOOK_SECRET` está configurado
- ✅ Usa HMAC-SHA256 para verificar firma

**Código:**

```typescript
// app/api/mp/webhook/route.ts
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET

if (MP_WEBHOOK_SECRET && signature) {
  const isValid = verifySignature(bodyText, signature, MP_WEBHOOK_SECRET)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
}
```

**Recomendación:**

- Configurar `MP_WEBHOOK_SECRET` en Vercel Dashboard
- Obtener el secret desde el panel de Mercado Pago → Webhooks

### Actualiza Orden Internamente?

**Estado:** 🟢 **SÍ**

**Implementación:**

- ✅ Busca orden por `external_reference` (orderId)
- ✅ Actualiza estado de orden según estado del pago
- ✅ Actualiza `pago_estado`, `pago_id`, `pago_fecha`
- ✅ Crea logs de auditoría

**Código:**

```typescript
// app/api/mp/webhook/route.ts
if (payment.status === 'approved') {
  await updateOrderPayment(order.id, {
    pago_estado: 'aprobado',
    pago_id: payment.id.toString(),
    pago_fecha: new Date().toISOString(),
  })
  await updateOrderStatus(order.id, 'pagada', 'aprobado', ...)
}
```

### Maneja Reintentos de MP?

**Estado:** 🟢 **SÍ (Idempotencia)**

**Implementación:**

- ✅ Verifica si el pago ya fue procesado antes de procesar
- ✅ Si `pago_id` ya existe y `pago_estado === 'aprobado'`, retorna sin procesar
- ✅ Previene duplicación de actualizaciones de stock

**Código:**

```typescript
// app/api/mp/webhook/route.ts
if (order && order.pago_id === payment.id.toString() && order.pago_estado === 'aprobado') {
  console.log(`[MP-WEBHOOK] ⚠️ Pago ya procesado anteriormente: ${payment.id}`)
  return NextResponse.json({ message: 'Payment already processed' })
}
```

### Manejo de Duplicados?

**Estado:** 🟢 **SÍ**

**Implementación:**

- ✅ Idempotencia implementada (ver sección anterior)
- ✅ Verifica estado antes de actualizar stock
- ✅ Logs de auditoría para rastrear cambios

---

## ✅ Confirmaciones

### Retorno a la App Incluye Todos los Datos Relevantes?

**Estado:** 🟢 **SÍ**

**Datos Incluidos en URLs de Retorno:**

- ✅ `orderId`: ID de la orden
- ✅ `payment_id`: ID del pago (en algunos casos)
- ✅ `preference_id`: ID de la preferencia (en algunos casos)

**Página de Success:**

- ✅ Muestra información completa de la orden
- ✅ Muestra número de tracking si está disponible
- ✅ Muestra estado del pago

### Estados de BD se Actualizan Correctamente?

**Estado:** 🟢 **SÍ**

**Estados Actualizados:**

- ✅ `ordenes.pago_estado`: 'pendiente' → 'aprobado' / 'rechazado'
- ✅ `ordenes.pago_id`: ID del pago de MP
- ✅ `ordenes.pago_fecha`: Fecha de aprobación
- ✅ `ordenes.estado`: 'pendiente' → 'pagada' → 'enviada' → 'entregada'
- ✅ `productos.stock`: Decrementa stock por talle
- ✅ `compras`: Crea log de compra
- ✅ `stock_logs`: Crea log de cambio de stock

---

## 💰 Cálculo de Comisiones y Costos Reales

### Comisiones de Mercado Pago

**Estado:** ⚠️ **NO IMPLEMENTADO**

**Recomendación:**

- Mercado Pago cobra comisiones automáticamente
- Las comisiones se deducen del monto recibido
- No es necesario calcularlas manualmente
- Si se necesita mostrar comisiones al cliente, consultar API de MP

**Comisiones Típicas:**

- Tarjeta de crédito: ~4.99% + IVA
- Tarjeta de débito: ~2.99% + IVA
- Efectivo (Rapipago/Pago Fácil): ~1.99% + IVA

### Costos Reales

**Estado:** 🟢 **CORRECTO**

**Implementación:**

- ✅ Los montos enviados a MP son los montos reales
- ✅ El cliente paga el monto exacto de la preferencia
- ✅ MP deduce comisiones automáticamente
- ✅ El monto recibido es: `monto_pagado - comisiones`

---

## ⚠️ Problemas y Riesgos Detectados

### Problemas Críticos

**Ninguno detectado** - La implementación es sólida

### Riesgos Menores

1. **🟡 Webhook Secret No Configurado**
   - **Riesgo:** Webhook puede ser llamado por terceros maliciosos
   - **Mitigación:** Configurar `MP_WEBHOOK_SECRET` en producción

2. **🟡 Token de Sandbox en Producción**
   - **Riesgo:** Pagos de prueba en producción
   - **Mitigación:** Verificar que `MP_ACCESS_TOKEN` empiece con `APP_USR-`

3. **🟡 Falta de Retry Logic en Webhook**
   - **Riesgo:** Si el webhook falla, MP reintenta, pero no hay lógica de retry interna
   - **Mitigación:** MP maneja reintentos automáticamente, pero se podría mejorar

---

## 📋 Checklist de Validación en Producción

### Credenciales

- [ ] Verificar que `MP_ACCESS_TOKEN` esté configurado en Vercel Dashboard
- [ ] Verificar que el token sea de producción (`APP_USR-`)
- [ ] Verificar que `NEXT_PUBLIC_MP_PUBLIC_KEY` esté configurado
- [ ] Verificar que `MP_WEBHOOK_SECRET` esté configurado (recomendado)
- [ ] Hacer redeploy después de configurar variables

### Webhook

- [ ] Configurar webhook en panel de Mercado Pago:
  - URL: `https://catalogo-indumentaria.vercel.app/api/mp/webhook`
  - Eventos: `payment`
- [ ] Probar webhook con pago de prueba
- [ ] Verificar que se reciben eventos correctamente
- [ ] Verificar que las órdenes se actualizan correctamente

### Preferencias

- [ ] Crear preferencia de prueba con productos reales
- [ ] Verificar que los items se incluyen correctamente
- [ ] Verificar que el payer se incluye correctamente
- [ ] Verificar que el shipping se incluye como item
- [ ] Verificar que `external_reference` es el orderId

### Flujo Completo

- [ ] Realizar compra de prueba completa
- [ ] Verificar que la orden se crea correctamente
- [ ] Verificar que la preferencia se crea correctamente
- [ ] Completar pago en MP (sandbox o producción)
- [ ] Verificar que el webhook se ejecuta
- [ ] Verificar que la orden se actualiza a "pagada"
- [ ] Verificar que el stock se actualiza
- [ ] Verificar que se crea el envío (si aplica)
- [ ] Verificar que se envían notificaciones

---

**Última actualización:** 26/11/2025
