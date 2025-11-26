# 📋 Tareas Finales: Sistema de Envíos Productivo

## 🎯 OBJETIVO

Dejar el sistema de envíos 100% operativo en producción con integración real de Envíopack.

---

## ✅ TAREAS COMPLETADAS

- ✅ Cálculo de envío implementado (simulación + Envíopack ready)
- ✅ Creación de orden con datos de envío
- ✅ Webhook de Mercado Pago crea envío automáticamente
- ✅ Webhook de envíos para actualizaciones
- ✅ Endpoint de tracking
- ✅ Retiro en local implementado
- ✅ Componente ShippingCalculator funcional

---

## 🔴 TAREAS PENDIENTES - ALTA PRIORIDAD

### 1. Configurar Envíopack (2 horas)

**Pasos:**

1. Crear cuenta en https://enviopack.com
2. Obtener API Key y Secret desde Dashboard
3. Configurar en Vercel Dashboard → Environment Variables:
   ```
   ENVIOPACK_API_KEY=tu_api_key
   ENVIOPACK_API_SECRET=tu_api_secret
   ENVIOPACK_WEBHOOK_SECRET=tu_webhook_secret
   ```
4. Hacer redeploy en Vercel
5. Probar cálculo real: `POST /api/envios/calcular`

**Archivos afectados:**

- Ninguno (solo configuración)

**Verificación:**

```bash
curl -X POST https://catalogo-indumentaria.vercel.app/api/envios/calcular \
  -H "Content-Type: application/json" \
  -d '{"codigoPostal":"C1000","peso":1,"precio":10000}'
```

Debe devolver métodos reales de Envíopack.

---

### 2. Configurar Webhook de Envíos (30 min)

**Pasos:**

1. En Envíopack Dashboard → Webhooks
2. Agregar webhook:
   - URL: `https://catalogo-indumentaria.vercel.app/api/shipping/webhook`
   - Eventos: `envio.actualizado`, `envio.entregado`, `envio.en_transito`
   - Secret: Generar y copiar
3. Configurar `ENVIOPACK_WEBHOOK_SECRET` en Vercel
4. Probar webhook con evento de prueba

**Archivos afectados:**

- `app/api/shipping/webhook/route.ts` (ya implementado)

**Verificación:**

- Simular webhook desde Envíopack Dashboard
- Verificar logs en Vercel
- Verificar que orden se actualiza en BD

---

### 3. Completar Retiro en Local (1 hora)

**Pasos:**

1. Configurar variables en Vercel:
   ```
   LOCAL_RETIRO_DIRECCION="Av. Corrientes 1234, CABA"
   LOCAL_RETIRO_HORARIOS="Lunes a Viernes: 9:00 - 18:00"
   LOCAL_RETIRO_TELEFONO="+54 11 1234-5678"
   ```
2. Actualizar componente para mostrar estos datos
3. Enviar email con información al cliente

**Archivos a modificar:**

- `components/ShippingCalculator.tsx` - Mostrar mensaje con datos
- `app/checkout/page.tsx` - Mostrar información en resumen
- `app/pago/success/page.tsx` - Mostrar información si es retiro
- `lib/notifications.ts` - Email con datos de retiro

---

### 4. Mejorar Display de Tracking (2 horas)

**Pasos:**

1. Mostrar tracking en página de éxito (`/pago/success`)
2. Crear página de tracking (`/envio/[trackingNumber]`)
3. Mejorar admin panel para mostrar tracking claramente
4. Agregar botón "Consultar tracking" en emails

**Archivos a crear/modificar:**

- `app/envio/[trackingNumber]/page.tsx` - Nueva página de tracking
- `app/pago/success/page.tsx` - Mostrar tracking si existe
- `app/admin/orders/[id]/page.tsx` - Mejorar display de tracking
- `lib/notifications.ts` - Incluir link de tracking en emails

---

### 5. Probar Flujo Completo (1 hora)

**Casos de prueba:**

1. Compra con envío estándar
2. Compra con envío express
3. Compra con retiro en local
4. Verificar creación de envío en Envíopack
5. Verificar tracking real generado
6. Simular actualización de estado
7. Verificar notificaciones

**Archivos de QA:**

- `qa/e2e/shipping.spec.ts` - Tests automatizados
- `qa/SHIPPING_PROD.md` - Casos de prueba manuales

---

## 🟡 TAREAS PENDIENTES - MEDIA PRIORIDAD

### 6. Autocompletado de Código Postal (4 horas)

**Implementar:**

- Integrar API de códigos postales de Argentina
- Autocompletar localidad/provincia automáticamente
- Validar CP antes de calcular

**API recomendada:**

- https://apis.datos.gob.ar/georef/api/localidades
- O servicio de códigos postales de Argentina

**Archivos a modificar:**

- `app/checkout/page.tsx` - Autocompletar al escribir CP
- `lib/shipping/postal-codes.ts` - Nuevo helper

---

### 7. Generar Etiquetas PDF (3 horas)

**Implementar:**

- Endpoint para generar etiqueta: `/api/shipping/label/[orderId]`
- Descargar PDF desde admin panel
- Enviar PDF por email al cliente

**Archivos a crear:**

- `app/api/shipping/label/[orderId]/route.ts`
- `lib/shipping/generate-label.ts`

---

### 8. Notificaciones Completas (2 horas)

**Implementar:**

- Email cuando se crea envío (con tracking)
- Email cuando se actualiza estado
- Email cuando se entrega
- WhatsApp opcional (si está configurado)

**Archivos a modificar:**

- `lib/notifications.ts` - Completar funciones
- `app/api/mp/webhook/route.ts` - Enviar notificaciones
- `app/api/shipping/webhook/route.ts` - Enviar notificaciones

---

## 🟢 TAREAS PENDIENTES - BAJA PRIORIDAD

### 9. Múltiples Proveedores (8 horas)

**Implementar:**

- Integración directa con OCA API
- Integración directa con Andreani API
- Permitir seleccionar proveedor en admin

---

### 10. Cache de Cálculos (2 horas)

**Implementar:**

- Cachear resultados de cálculo por CP (24h)
- Reducir llamadas a API
- Mejorar performance

---

## 📊 CHECKLIST DE PRODUCCIÓN

### Antes de Abrir al Público:

- [ ] Envíopack configurado y probado
- [ ] Webhook de envíos configurado y probado
- [ ] Retiro en local con datos completos
- [ ] Tracking visible al cliente
- [ ] Notificaciones funcionando
- [ ] Flujo completo probado (compra → envío → tracking → entrega)
- [ ] Admin panel muestra tracking correctamente
- [ ] Sin errores 500 en creación de envío
- [ ] Sin errores en webhook de envíos

### Después de Abrir (Mejoras):

- [ ] Autocompletado de CP
- [ ] Etiquetas PDF
- [ ] Notificaciones mejoradas
- [ ] Cache de cálculos
- [ ] Múltiples proveedores

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

1. **Día 1 (3.5 horas)**:
   - Configurar Envíopack
   - Configurar webhook
   - Probar flujo completo

2. **Día 2 (3 horas)**:
   - Completar retiro en local
   - Mejorar display de tracking
   - Notificaciones básicas

3. **Semana 2 (9 horas)**:
   - Autocompletado CP
   - Etiquetas PDF
   - Notificaciones completas

---

## 📝 NOTAS IMPORTANTES

- **Envíopack es la mejor opción** porque integra múltiples transportistas
- **El sistema ya funciona con simulación**, solo falta configuración real
- **Todos los endpoints están implementados**, solo necesitan datos reales
- **El webhook está listo**, solo falta configurar URL en Envíopack

---

**Última actualización:** 2024-11-26  
**Estado:** ⚠️ Listo para configuración, requiere credenciales de Envíopack
