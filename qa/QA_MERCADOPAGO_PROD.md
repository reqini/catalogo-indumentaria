# 💳 QA - Mercado Pago - Producción

**Fecha:** 26/11/2025  
**Entorno:** Producción (`https://catalogo-indumentaria.vercel.app`)  
**Versión:** 1.0.0

---

## 📋 Casos de Prueba

### TC-MP-001 – Compra exitosa con MP

**Prioridad:** Crítica  
**Tipo:** E2E  
**Módulo:** Mercado Pago

#### Precondiciones

- Carrito con productos
- Envío calculado y seleccionado (opcional)
- Mercado Pago configurado correctamente
- Tarjeta de prueba o real disponible

#### Pasos Detallados

1. Navegar a `/carrito`
2. Verificar productos en el carrito
3. Calcular y seleccionar envío (opcional)
4. Verificar resumen con total correcto
5. Hacer clic en "Finalizar Compra"
6. Verificar redirección a Mercado Pago
7. Completar datos de pago en MP:
   - Ingresar número de tarjeta
   - Ingresar CVV
   - Ingresar fecha de vencimiento
   - Ingresar nombre del titular
   - Ingresar documento
8. Confirmar pago en MP
9. Verificar redirección a `/pago/success`
10. Verificar mensaje de éxito
11. Verificar que el carrito se limpió
12. Verificar email de confirmación (si aplica)
13. Verificar en panel de MP que el pago aparece como aprobado

#### Resultado Esperado

- ✅ Redirección correcta a Mercado Pago
- ✅ Datos de productos y totales correctos en MP
- ✅ Pago se procesa exitosamente
- ✅ Redirección a `/pago/success` después del pago
- ✅ Mensaje de éxito claro y amigable
- ✅ Carrito se limpia automáticamente
- ✅ Email de confirmación enviado (si aplica)
- ✅ Pago aparece como aprobado en panel de MP
- ✅ Stock actualizado correctamente
- ✅ Orden creada en base de datos (si existe sistema)

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Carrito antes de checkout
- [ ] Pantalla de Mercado Pago
- [ ] Pantalla de éxito
- [ ] Email de confirmación (si aplica)
- [ ] Panel de MP con pago aprobado

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-MP-002 – Pago rechazado

**Prioridad:** Alta  
**Tipo:** E2E  
**Módulo:** Mercado Pago

#### Precondiciones

- Carrito con productos
- Tarjeta de prueba rechazada o simular rechazo

#### Pasos Detallados

1. Navegar a `/carrito`
2. Agregar productos
3. Hacer clic en "Finalizar Compra"
4. En Mercado Pago, usar tarjeta rechazada o cancelar pago
5. Verificar redirección a `/pago/failure`
6. Verificar mensaje de error claro
7. Verificar que el carrito NO se borró
8. Verificar que los productos siguen disponibles
9. Verificar que no se creó orden pagada
10. Verificar en panel de MP que el pago aparece como rechazado

#### Resultado Esperado

- ✅ Redirección a `/pago/failure` después del rechazo
- ✅ Mensaje de error claro y amigable
- ✅ Carrito NO se borra (productos siguen disponibles)
- ✅ No se crea orden pagada
- ✅ Stock NO se actualiza
- ✅ Pago aparece como rechazado en panel de MP
- ✅ Opción de reintentar pago disponible

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Pantalla de rechazo en MP
- [ ] Pantalla de failure en la web
- [ ] Carrito con productos aún presentes

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-MP-003 – Pago pendiente

**Prioridad:** Media  
**Tipo:** E2E  
**Módulo:** Mercado Pago

#### Precondiciones

- Carrito con productos
- Método de pago que genera estado pendiente (ej: transferencia bancaria)

#### Pasos Detallados

1. Navegar a `/carrito`
2. Agregar productos
3. Hacer clic en "Finalizar Compra"
4. En Mercado Pago, seleccionar método de pago que genera pendiente
5. Iniciar proceso de pago pendiente
6. Verificar redirección a `/pago/pending`
7. Verificar mensaje de estado pendiente
8. Verificar que el carrito se mantiene (o se limpia según lógica)
9. Verificar en panel de MP que el pago aparece como pendiente
10. Esperar confirmación del pago (si es posible)
11. Verificar que cuando se aprueba, se procesa correctamente

#### Resultado Esperado

- ✅ Redirección a `/pago/pending` después de iniciar pago pendiente
- ✅ Mensaje claro sobre estado pendiente
- ✅ Información sobre próximos pasos
- ✅ Pago aparece como pendiente en panel de MP
- ✅ Cuando se aprueba, se procesa correctamente (webhook)
- ✅ Email de confirmación cuando se aprueba

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Pantalla de pago pendiente en MP
- [ ] Pantalla de pending en la web
- [ ] Panel de MP con estado pendiente

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-MP-004 – Validar datos en preferencia de MP

**Prioridad:** Alta  
**Tipo:** Validación  
**Módulo:** Mercado Pago

#### Precondiciones

- Carrito con productos y envío

#### Pasos Detallados

1. Agregar productos al carrito
2. Calcular y seleccionar envío
3. Abrir DevTools → Network
4. Hacer clic en "Finalizar Compra"
5. Verificar request a `/api/pago`
6. Verificar que la preferencia incluye:
   - Todos los productos con precio correcto
   - Costo de envío (si está seleccionado)
   - Back URLs correctas (success, failure, pending)
   - Notification URL configurada
   - External reference único
7. Verificar respuesta con `init_point` válido

#### Resultado Esperado

- ✅ Request incluye todos los productos
- ✅ Precios correctos (con descuentos aplicados)
- ✅ Costo de envío incluido si está seleccionado
- ✅ Back URLs son URLs públicas válidas (no localhost)
- ✅ Notification URL configurada correctamente
- ✅ External reference es único
- ✅ Response contiene `init_point` válido

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Request Esperado

```json
{
  "items": [
    {
      "title": "Producto 1",
      "quantity": 1,
      "unit_price": 5000
    },
    {
      "title": "Envío - OCA Estándar",
      "quantity": 1,
      "unit_price": 3500,
      "id": "envio"
    }
  ],
  "back_urls": {
    "success": "https://catalogo-indumentaria.vercel.app/pago/success",
    "failure": "https://catalogo-indumentaria.vercel.app/pago/failure",
    "pending": "https://catalogo-indumentaria.vercel.app/pago/pending"
  }
}
```

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-MP-005 – Validar webhook de MP

**Prioridad:** Crítica  
**Tipo:** Integración  
**Módulo:** Mercado Pago

#### Precondiciones

- Compra completada con pago aprobado
- Acceso a logs de Vercel

#### Pasos Detallados

1. Completar compra exitosa (TC-MP-001)
2. Verificar en logs de Vercel que se recibió webhook
3. Verificar que el webhook procesa correctamente:
   - Estado del pago (approved)
   - Payment ID
   - Preference ID
   - Monto
4. Verificar que se actualiza stock
5. Verificar que se crea log de compra
6. Verificar que se envía email de confirmación (si aplica)
7. Verificar idempotencia (no procesa pago duplicado)

#### Resultado Esperado

- ✅ Webhook recibido correctamente
- ✅ Pago procesado correctamente
- ✅ Stock actualizado
- ✅ Log de compra creado
- ✅ Email enviado (si aplica)
- ✅ Idempotencia funciona (no procesa duplicados)
- ✅ Logs contienen información detallada

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Logs Esperados

```
[MP-WEBHOOK] Evento recibido: { type: 'payment', dataId: '...' }
[MP-WEBHOOK] Estado del pago: approved
[MP-WEBHOOK] ✅ Pago aprobado: [payment_id]
[MP-WEBHOOK] 🎯 QA LOG - Webhook recibido: { ... }
```

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-MP-006 – Validar manejo de errores de MP

**Prioridad:** Alta  
**Tipo:** Manejo de Errores  
**Módulo:** Mercado Pago

#### Precondiciones

- Carrito con productos

#### Pasos Detallados - Error de configuración

1. Simular falta de `MP_ACCESS_TOKEN` (si es posible)
2. Intentar finalizar compra
3. Verificar mensaje de error amigable
4. Verificar que no se rompe la UI

#### Pasos Detallados - Error de API de MP

1. Simular error de API de MP (timeout o error 500)
2. Intentar finalizar compra
3. Verificar mensaje de error claro
4. Verificar que el usuario puede reintentar

#### Resultado Esperado

- ✅ Mensajes de error claros y amigables
- ✅ UI no se rompe con errores
- ✅ Usuario puede reintentar después del error
- ✅ Errores registrados en logs
- ✅ No se crean órdenes inconsistentes

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-MP-007 – Validar que envío se incluye en preferencia de MP

**Prioridad:** Alta  
**Tipo:** Validación  
**Módulo:** Mercado Pago + Envíos

#### Precondiciones

- Carrito con productos
- Envío calculado y seleccionado

#### Pasos Detallados

1. Agregar productos al carrito
2. Calcular y seleccionar envío (ej: OCA Estándar - $3500)
3. Abrir DevTools → Network
4. Hacer clic en "Finalizar Compra"
5. Verificar request a `/api/pago`
6. Verificar que `items` incluye item de envío:
   ```json
   {
     "title": "Envío - OCA Estándar",
     "quantity": 1,
     "unit_price": 3500,
     "id": "envio"
   }
   ```
7. Verificar que el total en MP coincide con total del carrito

#### Resultado Esperado

- ✅ Item de envío incluido en preferencia
- ✅ Precio de envío correcto
- ✅ Total en MP = Subtotal + Envío
- ✅ Envío visible en resumen de MP

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Observaciones

```
[Completar durante ejecución]
```

---

## 🔍 Verificaciones en Panel de Mercado Pago

### Acceso al Panel

1. Ir a https://www.mercadopago.com.ar/developers/panel
2. Iniciar sesión con credenciales de producción
3. Navegar a "Pagos" → "Tus ventas"

### Validaciones

- [ ] Pago aparece con monto correcto
- [ ] Descripción incluye productos correctos
- [ ] Estado correcto (approved/rejected/pending)
- [ ] External reference único
- [ ] Datos del comprador correctos
- [ ] Método de pago registrado

---

## 📊 Resumen de Ejecución

| Caso      | Estado | Fecha | Ejecutado por | Observaciones |
| --------- | ------ | ----- | ------------- | ------------- |
| TC-MP-001 | ⏳     | -     | -             | -             |
| TC-MP-002 | ⏳     | -     | -             | -             |
| TC-MP-003 | ⏳     | -     | -             | -             |
| TC-MP-004 | ⏳     | -     | -             | -             |
| TC-MP-005 | ⏳     | -     | -             | -             |
| TC-MP-006 | ⏳     | -     | -             | -             |
| TC-MP-007 | ⏳     | -     | -             | -             |

**Total:** 7 casos  
**Aprobados:** 0  
**Fallidos:** 0  
**No ejecutados:** 7

---

## ⚠️ Observaciones de Tiempos de Respuesta y UX

### Tiempos Esperados

- Creación de preferencia: < 2 segundos
- Redirección a MP: < 1 segundo
- Procesamiento de pago: Depende de MP
- Webhook: < 5 segundos después del pago
- Redirección de vuelta: < 2 segundos

### UX

- [ ] Loading states visibles durante procesamiento
- [ ] Mensajes claros en cada paso
- [ ] Botones deshabilitados durante procesamiento
- [ ] No se permite doble click en "Finalizar Compra"
- [ ] Transiciones suaves entre pantallas

---

## 🐛 Bugs Encontrados

Ver `qa/BUGS_PROD.md` para bugs relacionados con Mercado Pago.

---

**Última actualización:** 26/11/2025  
**Próxima revisión:** Después de ejecutar pruebas
