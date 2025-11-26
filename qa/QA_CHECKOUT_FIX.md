# 🧪 QA Extremo - Checkout Fix

**Fecha:** 26/11/2025  
**Versión:** 1.0  
**Estado:** ✅ **LISTO PARA EJECUTAR**

---

## 📋 Casos de Prueba

### TC-ORD-001: Compra Completa (Happy Path)

**Prioridad:** 🔴 **ALTA**  
**Tipo:** E2E  
**Precondiciones:**

- Productos disponibles en catálogo
- Stock suficiente
- Mercado Pago configurado
- Tabla `ordenes` existe en Supabase

**Pasos:**

1. Navegar a `/catalogo`
2. Agregar producto al carrito
3. Ir a `/carrito`
4. Calcular envío con código postal válido
5. Seleccionar método de envío
6. Ir a `/checkout`
7. Completar formulario de datos personales
8. Completar formulario de dirección
9. Verificar resumen de orden
10. Hacer clic en "Finalizar Compra"
11. Completar pago en Mercado Pago (sandbox)
12. Verificar redirección a `/pago/success`
13. Verificar que la orden se creó en Supabase
14. Verificar que el stock se actualizó
15. Verificar que se recibió webhook de MP

**Resultado Esperado:**

- ✅ Orden creada con estado "pendiente"
- ✅ Preferencia de MP creada correctamente
- ✅ Redirección a MP exitosa
- ✅ Pago completado exitosamente
- ✅ Orden actualizada a "pagada"
- ✅ Stock actualizado correctamente
- ✅ Notificaciones enviadas

**Resultado Observado:** _Pendiente_  
**Estado:** ⏳ **PENDIENTE**

---

### TC-ORD-002: Error Controlado con Stock Mínimo

**Prioridad:** 🟡 **MEDIA**  
**Tipo:** Validación  
**Precondiciones:**

- Producto con stock = 1
- Usuario intenta comprar cantidad > stock disponible

**Pasos:**

1. Agregar producto con stock limitado al carrito
2. Intentar agregar más cantidad de la disponible
3. Ir a checkout
4. Intentar finalizar compra

**Resultado Esperado:**

- ✅ Error claro: "Stock insuficiente"
- ✅ Mensaje muestra cantidad disponible
- ✅ No se crea orden
- ✅ No se redirige a MP

**Resultado Observado:** _Pendiente_  
**Estado:** ⏳ **PENDIENTE**

---

### TC-ORD-003: Rechazo de MP

**Prioridad:** 🟡 **MEDIA**  
**Tipo:** E2E  
**Precondiciones:**

- Orden creada
- Preferencia de MP creada

**Pasos:**

1. Completar checkout hasta redirección a MP
2. En MP, rechazar el pago (usar tarjeta de prueba rechazada)
3. Verificar redirección a `/pago/failure`
4. Verificar estado de orden en BD

**Resultado Esperado:**

- ✅ Redirección a `/pago/failure`
- ✅ Mensaje de error claro
- ✅ Orden permanece en estado "pendiente"
- ✅ Stock NO se actualiza
- ✅ Webhook actualiza orden a "rechazado"

**Resultado Observado:** _Pendiente_  
**Estado:** ⏳ **PENDIENTE**

---

### TC-ORD-004: Pendiente de MP

**Prioridad:** 🟡 **MEDIA**  
**Tipo:** E2E  
**Precondiciones:**

- Orden creada
- Preferencia de MP creada

**Pasos:**

1. Completar checkout hasta redirección a MP
2. En MP, iniciar pago pendiente (ej: transferencia bancaria)
3. Verificar redirección a `/pago/pending`
4. Verificar estado de orden en BD
5. Simular aprobación del pago pendiente
6. Verificar actualización de orden

**Resultado Esperado:**

- ✅ Redirección a `/pago/pending`
- ✅ Mensaje informativo
- ✅ Orden en estado "pendiente"
- ✅ Webhook actualiza orden cuando se aprueba

**Resultado Observado:** _Pendiente_  
**Estado:** ⏳ **PENDIENTE**

---

### TC-ORD-005: Cambio CP Recalcula Envío

**Prioridad:** 🟢 **BAJA**  
**Tipo:** Funcionalidad  
**Precondiciones:**

- Usuario en checkout
- Método de envío seleccionado

**Pasos:**

1. Completar datos personales
2. Ingresar código postal inicial
3. Seleccionar método de envío
4. Cambiar código postal
5. Verificar que se recalculan costos de envío
6. Verificar que el total se actualiza

**Resultado Esperado:**

- ✅ Costos de envío se recalculan automáticamente
- ✅ Total se actualiza correctamente
- ✅ Métodos de envío disponibles se actualizan

**Resultado Observado:** _Pendiente_  
**Estado:** ⏳ **PENDIENTE**

---

### TC-ORD-006: Entrada sin Datos Válidos

**Prioridad:** 🔴 **ALTA**  
**Tipo:** Validación  
**Precondiciones:**

- Usuario en checkout

**Pasos:**

1. Intentar enviar formulario vacío
2. Intentar enviar con email inválido
3. Intentar enviar con código postal inválido
4. Intentar enviar sin método de envío seleccionado

**Resultado Esperado:**

- ✅ Validación en frontend muestra errores
- ✅ No se envía request al backend
- ✅ Mensajes de error claros por campo

**Resultado Observado:** _Pendiente_  
**Estado:** ⏳ **PENDIENTE**

---

### TC-ORD-007: Carrito Persistente y Luego Checkout

**Prioridad:** 🟡 **MEDIA**  
**Tipo:** Persistencia  
**Precondiciones:**

- Productos en carrito

**Pasos:**

1. Agregar productos al carrito
2. Cerrar navegador
3. Abrir navegador nuevamente
4. Verificar que el carrito persiste
5. Ir a checkout
6. Verificar que los productos están presentes

**Resultado Esperado:**

- ✅ Carrito persiste en localStorage
- ✅ Productos presentes en checkout
- ✅ Totales correctos

**Resultado Observado:** _Pendiente_  
**Estado:** ⏳ **PENDIENTE**

---

## 📊 Resumen de Casos

| ID         | Caso                | Prioridad | Estado       |
| ---------- | ------------------- | --------- | ------------ |
| TC-ORD-001 | Compra Completa     | 🔴 Alta   | ⏳ Pendiente |
| TC-ORD-002 | Error Stock Mínimo  | 🟡 Media  | ⏳ Pendiente |
| TC-ORD-003 | Rechazo MP          | 🟡 Media  | ⏳ Pendiente |
| TC-ORD-004 | Pendiente MP        | 🟡 Media  | ⏳ Pendiente |
| TC-ORD-005 | Cambio CP           | 🟢 Baja   | ⏳ Pendiente |
| TC-ORD-006 | Datos Inválidos     | 🔴 Alta   | ⏳ Pendiente |
| TC-ORD-007 | Carrito Persistente | 🟡 Media  | ⏳ Pendiente |

**Total:** 7 casos  
**Pendientes:** 7  
**Completados:** 0

---

## 📸 Capturas Requeridas

Crear carpeta `qa/screenshots/checkout/` y capturar:

- [ ] Formulario de checkout completo
- [ ] Resumen de orden antes de pagar
- [ ] Redirección a Mercado Pago
- [ ] Página de éxito después del pago
- [ ] Página de error si falla
- [ ] Orden en admin dashboard
- [ ] Logs de Vercel con errores detallados (si aplica)

---

**Última actualización:** 26/11/2025
