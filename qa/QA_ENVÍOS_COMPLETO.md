# 🧪 QA Completo: Sistema de Envíos y Checkout

**Fecha:** 2024-11-26  
**Versión:** 1.0  
**Ambiente:** Producción (`https://catalogo-indumentaria.vercel.app`)

---

## 📋 CASOS DE PRUEBA MANUALES

### TC-CHECKOUT-001: Compra Completa con Envío a Domicilio

**Objetivo:** Validar flujo completo de compra con envío real

**Precondiciones:**

- Productos disponibles en catálogo
- Stock suficiente
- Mercado Pago configurado
- Envíopack configurado (o simulado)

**Pasos:**

1. Ir a `/catalogo`
2. Agregar producto al carrito
3. Ir a `/carrito`
4. Verificar productos en carrito
5. Click en "Finalizar compra"
6. Completar datos personales:
   - Nombre: "Juan Pérez"
   - Email: "juan@example.com"
   - Teléfono: "+54 11 1234-5678"
7. Completar dirección:
   - Calle: "Av. Corrientes"
   - Número: "1234"
   - Código Postal: "C1000"
   - Localidad: "CABA"
   - Provincia: "Buenos Aires"
8. Click en "Continuar a Envío"
9. Ingresar código postal y click en "Calcular"
10. Seleccionar método de envío (ej: "OCA Estándar")
11. Click en "Continuar a Resumen"
12. Verificar resumen completo
13. Click en "Pagar Ahora"
14. Completar pago en Mercado Pago (sandbox o producción)
15. Verificar redirección a página de éxito
16. Verificar que orden se creó en BD
17. Verificar que tracking se generó (si aplica)

**Resultado esperado:**

- ✅ Orden creada con estado "pendiente"
- ✅ Preferencia MP creada correctamente
- ✅ Redirección a MP exitosa
- ✅ Pago procesado correctamente
- ✅ Webhook actualiza orden a "pagada"
- ✅ Envío creado automáticamente
- ✅ Tracking number generado
- ✅ Email de confirmación enviado

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/checkout/TC-CHECKOUT-001/`

---

### TC-CHECKOUT-002: Compra con Retiro en Local

**Objetivo:** Validar flujo de compra con retiro en local

**Precondiciones:**

- Productos disponibles
- Variables de entorno de retiro configuradas

**Pasos:**

1. Agregar producto al carrito
2. Ir a checkout
3. Completar datos personales
4. Seleccionar "Retiro en el local"
5. Verificar que no se requiere dirección completa
6. Continuar a resumen
7. Verificar que costo de envío es $0
8. Completar pago
9. Verificar página de éxito
10. Verificar que orden se guardó con `envio_tipo = 'retiro_local'`
11. Verificar que NO se creó solicitud de envío

**Resultado esperado:**

- ✅ Retiro en local seleccionable
- ✅ No requiere dirección completa
- ✅ Costo de envío = $0
- ✅ Orden guardada correctamente
- ✅ NO se crea envío
- ✅ Información de retiro visible en éxito
- ✅ Email con información de retiro

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/checkout/TC-CHECKOUT-002/`

---

### TC-CHECKOUT-003: Validación de Datos Incompletos

**Objetivo:** Validar que las validaciones funcionan correctamente

**Pasos:**

1. Ir a checkout sin productos en carrito
2. Intentar avanzar sin completar datos
3. Completar solo nombre, dejar email vacío
4. Intentar avanzar
5. Completar email inválido
6. Intentar avanzar
7. Seleccionar envío sin ingresar CP
8. Intentar calcular envío
9. Ingresar CP inválido (< 4 caracteres)
10. Intentar calcular envío

**Resultado esperado:**

- ✅ Redirección a carrito si está vacío
- ✅ Mensajes de error claros
- ✅ No permite avanzar con datos inválidos
- ✅ Validación de email funciona
- ✅ Validación de CP funciona

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/checkout/TC-CHECKOUT-003/`

---

### TC-ENVIO-001: Cálculo de Envío Real con Envíopack

**Objetivo:** Validar que el cálculo de envío usa API real de Envíopack

**Precondiciones:**

- Envíopack configurado con credenciales reales

**Pasos:**

1. Ir a checkout
2. Completar datos personales
3. Ingresar código postal válido (ej: "C1000")
4. Click en "Calcular"
5. Verificar que se muestran métodos reales de Envíopack
6. Verificar que precios son reales (no simulados)
7. Seleccionar método
8. Verificar que costo se agrega al total

**Resultado esperado:**

- ✅ Métodos obtenidos de Envíopack API
- ✅ Precios reales (no simulados)
- ✅ Múltiples opciones disponibles
- ✅ Costo se agrega correctamente al total

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/envio/TC-ENVIO-001/`

---

### TC-ENVIO-002: Creación de Envío Real Post-Pago

**Objetivo:** Validar que se crea envío real después del pago

**Precondiciones:**

- Envíopack configurado
- Pago aprobado

**Pasos:**

1. Completar compra con envío
2. Aprobar pago en MP
3. Verificar webhook procesado
4. Verificar que orden se actualizó a "pagada"
5. Verificar que se creó envío en Envíopack
6. Verificar que tracking number es real (no simulado)
7. Verificar que tracking se guardó en orden
8. Verificar email con tracking

**Resultado esperado:**

- ✅ Envío creado en Envíopack Dashboard
- ✅ Tracking number real (formato de Envíopack)
- ✅ Tracking guardado en BD
- ✅ Email con tracking enviado
- ✅ Estado de orden actualizado a "enviada"

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/envio/TC-ENVIO-002/`

---

### TC-TRACKING-001: Visualización de Tracking para Usuario

**Objetivo:** Validar que usuarios pueden ver tracking de su envío

**Precondiciones:**

- Orden con tracking number

**Pasos:**

1. Ir a página de éxito después de pago
2. Verificar que hay link de tracking
3. Click en link de tracking
4. Verificar que se muestra página de tracking
5. Verificar que se muestra estado actual
6. Verificar que se muestra ubicación (si disponible)
7. Verificar que se muestra fecha estimada
8. Verificar link al sitio del proveedor

**Resultado esperado:**

- ✅ Link de tracking visible en página de éxito
- ✅ Página de tracking carga correctamente
- ✅ Estado actual visible
- ✅ Información completa del envío
- ✅ Link al sitio del proveedor funciona

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/tracking/TC-TRACKING-001/`

---

### TC-WEBHOOK-001: Webhook de Mercado Pago

**Objetivo:** Validar que el webhook procesa pagos correctamente

**Precondiciones:**

- Webhook configurado en MP Dashboard
- Orden creada

**Pasos:**

1. Crear orden
2. Completar pago en MP
3. Verificar logs de webhook en Vercel
4. Verificar que webhook recibió evento
5. Verificar que orden se actualizó correctamente
6. Verificar que stock se actualizó
7. Verificar que envío se creó (si aplica)
8. Verificar notificaciones enviadas

**Resultado esperado:**

- ✅ Webhook recibe evento correctamente
- ✅ Orden actualizada a "pagada"
- ✅ Stock decrementado correctamente
- ✅ Envío creado automáticamente
- ✅ Notificaciones enviadas
- ✅ Idempotencia funciona (no procesa duplicados)

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/webhook/TC-WEBHOOK-001/`

---

### TC-WEBHOOK-002: Webhook de Envíopack

**Objetivo:** Validar que el webhook actualiza estados de envío

**Precondiciones:**

- Webhook configurado en Envíopack Dashboard
- Envío creado

**Pasos:**

1. Crear envío real
2. Simular actualización de estado en Envíopack
3. Verificar logs de webhook en Vercel
4. Verificar que orden se actualizó
5. Verificar que estado cambió correctamente
6. Verificar notificación al cliente

**Resultado esperado:**

- ✅ Webhook recibe actualización
- ✅ Estado de orden actualizado
- ✅ Tracking actualizado en BD
- ✅ Notificación enviada al cliente

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/webhook/TC-WEBHOOK-002/`

---

### TC-ADMIN-001: Visualización de Órdenes en Admin

**Objetivo:** Validar que admin puede ver y gestionar órdenes

**Precondiciones:**

- Usuario admin autenticado
- Órdenes creadas

**Pasos:**

1. Login como admin
2. Ir a `/admin/orders`
3. Verificar que se muestran todas las órdenes
4. Verificar filtros por estado
5. Click en orden para ver detalle
6. Verificar información completa
7. Cambiar estado a "enviada"
8. Cambiar estado a "entregada"
9. Verificar que cambios se guardan

**Resultado esperado:**

- ✅ Lista de órdenes visible
- ✅ Filtros funcionan correctamente
- ✅ Detalle completo visible
- ✅ Tracking visible
- ✅ Cambio de estado funciona
- ✅ Historial de cambios visible

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/admin/TC-ADMIN-001/`

---

### TC-ERROR-001: Manejo de Errores en Checkout

**Objetivo:** Validar que los errores se manejan correctamente

**Pasos:**

1. Intentar crear orden sin stock suficiente
2. Intentar crear orden con datos inválidos
3. Simular error en creación de preferencia MP
4. Simular error en creación de envío
5. Verificar mensajes de error
6. Verificar que no se crean órdenes "huérfanas"

**Resultado esperado:**

- ✅ Mensajes de error claros y amigables
- ✅ No se crean órdenes con errores
- ✅ Usuario puede reintentar
- ✅ Logs de errores en backend

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/errors/TC-ERROR-001/`

---

## 📊 RESUMEN DE RESULTADOS

| Caso            | Estado       | Observaciones |
| --------------- | ------------ | ------------- |
| TC-CHECKOUT-001 | ⏳ PENDIENTE | -             |
| TC-CHECKOUT-002 | ⏳ PENDIENTE | -             |
| TC-CHECKOUT-003 | ⏳ PENDIENTE | -             |
| TC-ENVIO-001    | ⏳ PENDIENTE | -             |
| TC-ENVIO-002    | ⏳ PENDIENTE | -             |
| TC-TRACKING-001 | ⏳ PENDIENTE | -             |
| TC-WEBHOOK-001  | ⏳ PENDIENTE | -             |
| TC-WEBHOOK-002  | ⏳ PENDIENTE | -             |
| TC-ADMIN-001    | ⏳ PENDIENTE | -             |
| TC-ERROR-001    | ⏳ PENDIENTE | -             |

---

**Última actualización:** 2024-11-26  
**Estado:** ⏳ **PENDIENTE DE EJECUCIÓN**

**Fecha:** 2024-11-26  
**Versión:** 1.0  
**Ambiente:** Producción (`https://catalogo-indumentaria.vercel.app`)

---

## 📋 CASOS DE PRUEBA MANUALES

### TC-CHECKOUT-001: Compra Completa con Envío a Domicilio

**Objetivo:** Validar flujo completo de compra con envío real

**Precondiciones:**

- Productos disponibles en catálogo
- Stock suficiente
- Mercado Pago configurado
- Envíopack configurado (o simulado)

**Pasos:**

1. Ir a `/catalogo`
2. Agregar producto al carrito
3. Ir a `/carrito`
4. Verificar productos en carrito
5. Click en "Finalizar compra"
6. Completar datos personales:
   - Nombre: "Juan Pérez"
   - Email: "juan@example.com"
   - Teléfono: "+54 11 1234-5678"
7. Completar dirección:
   - Calle: "Av. Corrientes"
   - Número: "1234"
   - Código Postal: "C1000"
   - Localidad: "CABA"
   - Provincia: "Buenos Aires"
8. Click en "Continuar a Envío"
9. Ingresar código postal y click en "Calcular"
10. Seleccionar método de envío (ej: "OCA Estándar")
11. Click en "Continuar a Resumen"
12. Verificar resumen completo
13. Click en "Pagar Ahora"
14. Completar pago en Mercado Pago (sandbox o producción)
15. Verificar redirección a página de éxito
16. Verificar que orden se creó en BD
17. Verificar que tracking se generó (si aplica)

**Resultado esperado:**

- ✅ Orden creada con estado "pendiente"
- ✅ Preferencia MP creada correctamente
- ✅ Redirección a MP exitosa
- ✅ Pago procesado correctamente
- ✅ Webhook actualiza orden a "pagada"
- ✅ Envío creado automáticamente
- ✅ Tracking number generado
- ✅ Email de confirmación enviado

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/checkout/TC-CHECKOUT-001/`

---

### TC-CHECKOUT-002: Compra con Retiro en Local

**Objetivo:** Validar flujo de compra con retiro en local

**Precondiciones:**

- Productos disponibles
- Variables de entorno de retiro configuradas

**Pasos:**

1. Agregar producto al carrito
2. Ir a checkout
3. Completar datos personales
4. Seleccionar "Retiro en el local"
5. Verificar que no se requiere dirección completa
6. Continuar a resumen
7. Verificar que costo de envío es $0
8. Completar pago
9. Verificar página de éxito
10. Verificar que orden se guardó con `envio_tipo = 'retiro_local'`
11. Verificar que NO se creó solicitud de envío

**Resultado esperado:**

- ✅ Retiro en local seleccionable
- ✅ No requiere dirección completa
- ✅ Costo de envío = $0
- ✅ Orden guardada correctamente
- ✅ NO se crea envío
- ✅ Información de retiro visible en éxito
- ✅ Email con información de retiro

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/checkout/TC-CHECKOUT-002/`

---

### TC-CHECKOUT-003: Validación de Datos Incompletos

**Objetivo:** Validar que las validaciones funcionan correctamente

**Pasos:**

1. Ir a checkout sin productos en carrito
2. Intentar avanzar sin completar datos
3. Completar solo nombre, dejar email vacío
4. Intentar avanzar
5. Completar email inválido
6. Intentar avanzar
7. Seleccionar envío sin ingresar CP
8. Intentar calcular envío
9. Ingresar CP inválido (< 4 caracteres)
10. Intentar calcular envío

**Resultado esperado:**

- ✅ Redirección a carrito si está vacío
- ✅ Mensajes de error claros
- ✅ No permite avanzar con datos inválidos
- ✅ Validación de email funciona
- ✅ Validación de CP funciona

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/checkout/TC-CHECKOUT-003/`

---

### TC-ENVIO-001: Cálculo de Envío Real con Envíopack

**Objetivo:** Validar que el cálculo de envío usa API real de Envíopack

**Precondiciones:**

- Envíopack configurado con credenciales reales

**Pasos:**

1. Ir a checkout
2. Completar datos personales
3. Ingresar código postal válido (ej: "C1000")
4. Click en "Calcular"
5. Verificar que se muestran métodos reales de Envíopack
6. Verificar que precios son reales (no simulados)
7. Seleccionar método
8. Verificar que costo se agrega al total

**Resultado esperado:**

- ✅ Métodos obtenidos de Envíopack API
- ✅ Precios reales (no simulados)
- ✅ Múltiples opciones disponibles
- ✅ Costo se agrega correctamente al total

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/envio/TC-ENVIO-001/`

---

### TC-ENVIO-002: Creación de Envío Real Post-Pago

**Objetivo:** Validar que se crea envío real después del pago

**Precondiciones:**

- Envíopack configurado
- Pago aprobado

**Pasos:**

1. Completar compra con envío
2. Aprobar pago en MP
3. Verificar webhook procesado
4. Verificar que orden se actualizó a "pagada"
5. Verificar que se creó envío en Envíopack
6. Verificar que tracking number es real (no simulado)
7. Verificar que tracking se guardó en orden
8. Verificar email con tracking

**Resultado esperado:**

- ✅ Envío creado en Envíopack Dashboard
- ✅ Tracking number real (formato de Envíopack)
- ✅ Tracking guardado en BD
- ✅ Email con tracking enviado
- ✅ Estado de orden actualizado a "enviada"

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/envio/TC-ENVIO-002/`

---

### TC-TRACKING-001: Visualización de Tracking para Usuario

**Objetivo:** Validar que usuarios pueden ver tracking de su envío

**Precondiciones:**

- Orden con tracking number

**Pasos:**

1. Ir a página de éxito después de pago
2. Verificar que hay link de tracking
3. Click en link de tracking
4. Verificar que se muestra página de tracking
5. Verificar que se muestra estado actual
6. Verificar que se muestra ubicación (si disponible)
7. Verificar que se muestra fecha estimada
8. Verificar link al sitio del proveedor

**Resultado esperado:**

- ✅ Link de tracking visible en página de éxito
- ✅ Página de tracking carga correctamente
- ✅ Estado actual visible
- ✅ Información completa del envío
- ✅ Link al sitio del proveedor funciona

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/tracking/TC-TRACKING-001/`

---

### TC-WEBHOOK-001: Webhook de Mercado Pago

**Objetivo:** Validar que el webhook procesa pagos correctamente

**Precondiciones:**

- Webhook configurado en MP Dashboard
- Orden creada

**Pasos:**

1. Crear orden
2. Completar pago en MP
3. Verificar logs de webhook en Vercel
4. Verificar que webhook recibió evento
5. Verificar que orden se actualizó correctamente
6. Verificar que stock se actualizó
7. Verificar que envío se creó (si aplica)
8. Verificar notificaciones enviadas

**Resultado esperado:**

- ✅ Webhook recibe evento correctamente
- ✅ Orden actualizada a "pagada"
- ✅ Stock decrementado correctamente
- ✅ Envío creado automáticamente
- ✅ Notificaciones enviadas
- ✅ Idempotencia funciona (no procesa duplicados)

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/webhook/TC-WEBHOOK-001/`

---

### TC-WEBHOOK-002: Webhook de Envíopack

**Objetivo:** Validar que el webhook actualiza estados de envío

**Precondiciones:**

- Webhook configurado en Envíopack Dashboard
- Envío creado

**Pasos:**

1. Crear envío real
2. Simular actualización de estado en Envíopack
3. Verificar logs de webhook en Vercel
4. Verificar que orden se actualizó
5. Verificar que estado cambió correctamente
6. Verificar notificación al cliente

**Resultado esperado:**

- ✅ Webhook recibe actualización
- ✅ Estado de orden actualizado
- ✅ Tracking actualizado en BD
- ✅ Notificación enviada al cliente

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/webhook/TC-WEBHOOK-002/`

---

### TC-ADMIN-001: Visualización de Órdenes en Admin

**Objetivo:** Validar que admin puede ver y gestionar órdenes

**Precondiciones:**

- Usuario admin autenticado
- Órdenes creadas

**Pasos:**

1. Login como admin
2. Ir a `/admin/orders`
3. Verificar que se muestran todas las órdenes
4. Verificar filtros por estado
5. Click en orden para ver detalle
6. Verificar información completa
7. Cambiar estado a "enviada"
8. Cambiar estado a "entregada"
9. Verificar que cambios se guardan

**Resultado esperado:**

- ✅ Lista de órdenes visible
- ✅ Filtros funcionan correctamente
- ✅ Detalle completo visible
- ✅ Tracking visible
- ✅ Cambio de estado funciona
- ✅ Historial de cambios visible

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/admin/TC-ADMIN-001/`

---

### TC-ERROR-001: Manejo de Errores en Checkout

**Objetivo:** Validar que los errores se manejan correctamente

**Pasos:**

1. Intentar crear orden sin stock suficiente
2. Intentar crear orden con datos inválidos
3. Simular error en creación de preferencia MP
4. Simular error en creación de envío
5. Verificar mensajes de error
6. Verificar que no se crean órdenes "huérfanas"

**Resultado esperado:**

- ✅ Mensajes de error claros y amigables
- ✅ No se crean órdenes con errores
- ✅ Usuario puede reintentar
- ✅ Logs de errores en backend

**Resultado real:** [PENDIENTE DE EJECUTAR]

**Observaciones:** [COMPLETAR DESPUÉS DE PRUEBA]

**Screenshots:** `/qa/screenshots/errors/TC-ERROR-001/`

---

## 📊 RESUMEN DE RESULTADOS

| Caso            | Estado       | Observaciones |
| --------------- | ------------ | ------------- |
| TC-CHECKOUT-001 | ⏳ PENDIENTE | -             |
| TC-CHECKOUT-002 | ⏳ PENDIENTE | -             |
| TC-CHECKOUT-003 | ⏳ PENDIENTE | -             |
| TC-ENVIO-001    | ⏳ PENDIENTE | -             |
| TC-ENVIO-002    | ⏳ PENDIENTE | -             |
| TC-TRACKING-001 | ⏳ PENDIENTE | -             |
| TC-WEBHOOK-001  | ⏳ PENDIENTE | -             |
| TC-WEBHOOK-002  | ⏳ PENDIENTE | -             |
| TC-ADMIN-001    | ⏳ PENDIENTE | -             |
| TC-ERROR-001    | ⏳ PENDIENTE | -             |

---

**Última actualización:** 2024-11-26  
**Estado:** ⏳ **PENDIENTE DE EJECUCIÓN**
