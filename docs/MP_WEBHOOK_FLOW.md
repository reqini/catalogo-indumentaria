# 💳 Flujo del Webhook de Mercado Pago

**Fecha:** 26/11/2025  
**Versión:** 1.0.0

---

## 🔄 Flujo Completo

```
1. Cliente completa checkout
   ↓
2. Se crea orden en BD (estado: pendiente)
   ↓
3. Se crea preferencia en MP (external_reference = orderId)
   ↓
4. Cliente redirigido a MP
   ↓
5. Cliente paga en MP
   ↓
6. MP envía webhook a /api/mp/webhook
   ↓
7. Webhook valida firma y procesa pago
   ↓
8. Si pago aprobado:
   - Actualiza orden (estado: pagada, pago_estado: aprobado)
   - Actualiza stock de productos
   - Crea solicitud de envío real (si aplica)
   - Envía emails (cliente + admin)
   - Crea logs de auditoría
   ↓
9. Cliente redirigido a /pago/success
```

---

## 📡 Endpoint del Webhook

### POST `/api/mp/webhook`

**Headers requeridos:**

- `x-signature`: Firma HMAC-SHA256 (si `MP_WEBHOOK_SECRET` está configurado)

**Body:**

```json
{
  "type": "payment",
  "data": {
    "id": "1234567890"
  }
}
```

---

## 🔍 Procesamiento del Webhook

### 1. Validación Inicial

- ✅ Verificar configuración de MP
- ✅ Validar firma del webhook (si está configurada)
- ✅ Obtener detalles del pago desde MP API

### 2. Búsqueda de Orden

El webhook busca la orden usando:

1. `external_reference` del pago (orderId)
2. `preference_id` del pago (fallback)

### 3. Idempotencia

- ✅ Verifica si el pago ya fue procesado
- ✅ Si `pago_id` ya existe y `pago_estado = aprobado`, retorna sin procesar

### 4. Procesamiento según Estado

#### Estado: `approved`

1. **Actualizar orden:**
   - `pago_estado` → `aprobado`
   - `pago_id` → Payment ID de MP
   - `pago_fecha` → Fecha actual
   - `estado` → `pagada`

2. **Actualizar stock:**
   - Por cada item del pago:
     - Buscar producto por ID o nombre
     - Obtener talle del item
     - Decrementar stock del talle específico
     - Crear log de stock

3. **Crear envío real:**
   - Si `envio_costo_total > 0` y `envio_tipo !== retiro_local`:
     - Llamar a `createShippingRequest()`
     - Guardar `tracking_number` en la orden
     - Actualizar estado a `enviada` si se crea exitosamente

4. **Enviar notificaciones:**
   - Email al cliente con resumen de compra
   - Email al admin con detalles de nueva orden
   - WhatsApp (si está configurado)

5. **Crear logs:**
   - Log de orden: `pago_aprobado`
   - Logs de stock: uno por cada producto vendido

#### Estado: `pending`

- Actualizar `pago_estado` → `pendiente`
- Guardar `pago_id`
- No actualizar stock ni crear envío

#### Estado: `rejected`

- Actualizar `pago_estado` → `rechazado`
- Guardar `pago_id`
- Crear log: `pago_rechazado`
- No actualizar stock ni crear envío

---

## 🔐 Seguridad

### Validación de Firma

```typescript
function verifySignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return hash === signature
}
```

**Configuración:**

- Variable de entorno: `MP_WEBHOOK_SECRET`
- Si no está configurada, el webhook funciona sin validación (solo en desarrollo)

### Prevención de Duplicados

- ✅ Verificación de `pago_id` existente antes de procesar
- ✅ Estado de orden verificado antes de actualizar stock
- ✅ Logs de auditoría para rastrear cambios

---

## 📊 Logs Generados

### Logs de Orden

```json
{
  "accion": "pago_aprobado",
  "datos_anteriores": {
    "pago_estado": "pendiente"
  },
  "datos_nuevos": {
    "pago_estado": "aprobado",
    "pago_id": "1234567890"
  },
  "notas": "Pago aprobado por Mercado Pago"
}
```

### Logs de Stock

```json
{
  "producto_id": "uuid",
  "accion": "venta",
  "cantidad": -1,
  "talle": "M",
  "usuario": "sistema"
}
```

---

## 🧪 Testing

### Webhook de Prueba

Para probar el webhook localmente:

1. Usar ngrok para exponer el endpoint:

   ```bash
   ngrok http 3000
   ```

2. Configurar URL en Mercado Pago Dashboard:

   ```
   https://tu-ngrok-url.ngrok.io/api/mp/webhook
   ```

3. Realizar pago de prueba y verificar logs

### Simulación Manual

```bash
curl -X POST http://localhost:3000/api/mp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "1234567890"
    }
  }'
```

---

## ⚠️ Manejo de Errores

### Errores No Críticos

Estos errores NO bloquean el procesamiento del webhook:

- ❌ Error enviando email → Solo loguea, continúa
- ❌ Error creando envío → Solo loguea, continúa
- ❌ Error creando logs → Solo loguea, continúa

### Errores Críticos

Estos errores SÍ bloquean el webhook:

- ❌ Error obteniendo pago de MP → Retorna 500
- ❌ Error actualizando orden → Retorna 500
- ❌ Error actualizando stock → Retorna 500 (pero solo para ese item)

---

## 📈 Métricas

El webhook registra las siguientes métricas:

- Tiempo de procesamiento
- Cantidad de items procesados
- Estado del pago
- Si se creó envío
- Si se enviaron notificaciones

---

**Última actualización:** 26/11/2025
