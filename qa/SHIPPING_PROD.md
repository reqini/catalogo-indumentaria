# QA: Sistema de Envíos en Producción

## 🎯 Objetivo

Validar que el sistema de envíos funciona correctamente en producción con integración real de Envíopack.

---

## 📋 CASOS DE PRUEBA

### TC-SHIPPING-PROD-001: Cálculo de envío real con Envíopack

**Precondiciones:**

- Envíopack configurado con API Key y Secret
- Variables de entorno configuradas en Vercel

**Pasos:**

1. Ir a `/checkout`
2. Completar datos personales
3. Seleccionar "Envío a domicilio"
4. Ingresar código postal válido (ej: C1000)
5. Click en "Calcular"

**Resultado Esperado:**

- ✅ Métodos reales de Envíopack devueltos
- ✅ Precios reales (no simulados)
- ✅ Múltiples transportistas disponibles
- ✅ Ordenamiento por precio

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot: `qa/screenshots/shipping/TC-SHIPPING-PROD-001-calculo-real.png`
- [ ] Logs del servidor: [adjuntar]
- [ ] Métodos devueltos: [adjuntar lista]

---

### TC-SHIPPING-PROD-002: Creación de envío real después de pago

**Precondiciones:**

- Orden creada con pago aprobado
- Envíopack configurado
- Dirección completa en orden

**Pasos:**

1. Completar compra completa hasta pago aprobado
2. Verificar logs en Vercel
3. Verificar en Envíopack Dashboard que se creó envío
4. Verificar que orden tiene tracking number

**Resultado Esperado:**

- ✅ Envío creado en Envíopack Dashboard
- ✅ Tracking number real generado (no simulado)
- ✅ Orden actualizada con tracking en BD
- ✅ Email enviado al cliente con tracking

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Tracking number: [adjuntar]
- [ ] Screenshot Envíopack Dashboard: [adjuntar]
- [ ] Verificación en BD: [adjuntar]

---

### TC-SHIPPING-PROD-003: Webhook de actualización de estado

**Precondiciones:**

- Envío creado con tracking real
- Webhook configurado en Envíopack

**Pasos:**

1. Simular actualización de estado desde Envíopack Dashboard
2. Verificar logs en Vercel
3. Verificar que orden se actualiza en BD
4. Verificar que se envía notificación al cliente

**Resultado Esperado:**

- ✅ Webhook recibe actualización
- ✅ Orden actualizada en BD
- ✅ Estado correcto mapeado
- ✅ Notificación enviada

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Estado recibido: [adjuntar]
- [ ] Estado mapeado: [adjuntar]
- [ ] Logs del webhook: [adjuntar]

---

### TC-SHIPPING-PROD-004: Consulta de tracking desde frontend

**Precondiciones:**

- Orden con tracking number real

**Pasos:**

1. Ir a `/envio/{trackingNumber}`
2. Verificar información mostrada
3. Verificar estado actualizado

**Resultado Esperado:**

- ✅ Página carga correctamente
- ✅ Muestra tracking number
- ✅ Muestra estado actual
- ✅ Muestra ubicación (si disponible)
- ✅ Muestra fecha estimada de entrega

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot: `qa/screenshots/shipping/TC-SHIPPING-PROD-004-tracking-page.png`

---

### TC-SHIPPING-PROD-005: Retiro en local completo

**Precondiciones:**

- Variables de retiro configuradas

**Pasos:**

1. Completar checkout seleccionando "Retiro en local"
2. Finalizar compra
3. Verificar email recibido
4. Verificar información mostrada en página de éxito

**Resultado Esperado:**

- ✅ No requiere código postal
- ✅ No requiere dirección
- ✅ Muestra información del local
- ✅ Email con dirección y horarios
- ✅ Costo de envío = 0

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot: `qa/screenshots/shipping/TC-SHIPPING-PROD-005-retiro-local.png`
- [ ] Email recibido: [adjuntar]

---

### TC-SHIPPING-PROD-006: Descarga de etiqueta PDF

**Precondiciones:**

- Orden con tracking real de Envíopack

**Pasos:**

1. Ir a `/admin/orders/{orderId}`
2. Click en "Descargar etiqueta"
3. Verificar descarga

**Resultado Esperado:**

- ✅ PDF descargado correctamente
- ✅ Etiqueta contiene información correcta
- ✅ Tracking number visible

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] PDF descargado: [adjuntar]

---

### TC-SHIPPING-PROD-007: Notificaciones de envío

**Precondiciones:**

- Email configurado

**Pasos:**

1. Completar compra con envío
2. Verificar email de confirmación
3. Verificar email cuando se crea envío
4. Verificar email cuando se entrega

**Resultado Esperado:**

- ✅ Email de confirmación con resumen
- ✅ Email de envío creado con tracking
- ✅ Email de entrega cuando se completa

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Emails recibidos: [adjuntar screenshots]

---

## 📊 RESUMEN DE RESULTADOS

| Caso                                    | Estado       | Observaciones |
| --------------------------------------- | ------------ | ------------- |
| TC-SHIPPING-PROD-001: Cálculo real      | ⏳ Pendiente |               |
| TC-SHIPPING-PROD-002: Creación envío    | ⏳ Pendiente |               |
| TC-SHIPPING-PROD-003: Webhook           | ⏳ Pendiente |               |
| TC-SHIPPING-PROD-004: Consulta tracking | ⏳ Pendiente |               |
| TC-SHIPPING-PROD-005: Retiro local      | ⏳ Pendiente |               |
| TC-SHIPPING-PROD-006: Etiqueta PDF      | ⏳ Pendiente |               |
| TC-SHIPPING-PROD-007: Notificaciones    | ⏳ Pendiente |               |

---

## ✅ CHECKLIST PRE-PRODUCCIÓN

- [ ] Envíopack configurado y probado
- [ ] Webhook configurado y probado
- [ ] Variables de entorno configuradas
- [ ] Retiro en local con datos completos
- [ ] Tracking visible al cliente
- [ ] Notificaciones funcionando
- [ ] Admin panel muestra tracking
- [ ] Sin errores 500 en creación de envío
- [ ] Sin errores en webhook

---

**Última actualización:** 2024-11-26
