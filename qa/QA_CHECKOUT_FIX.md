# QA: Corrección de Errores de Checkout y PWA

## 🎯 Objetivo

Validar que los errores reportados están completamente resueltos:

- ✅ Error de iconos PWA en manifest
- ✅ Error 400 "Datos inválidos" en `/api/checkout/create-order`
- ✅ Circuito completo de compra funcional

## 📋 Casos de Prueba

### TC-CHECKOUT-ENVIO-001 – Compra con envío a domicilio

**Precondiciones:**

- Usuario con carrito con al menos 1 producto
- Productos con stock disponible

**Pasos:**

1. Ir a `/carrito`
2. Verificar productos en carrito
3. Click en "Finalizar Compra"
4. Completar datos personales:
   - Nombre: "Juan Pérez"
   - Email: "juan@example.com"
   - Teléfono: "+54 11 1234-5678"
5. Completar dirección completa:
   - Calle: "Av. Corrientes"
   - Número: "1234"
   - Piso/Depto: "2° A" (opcional)
   - Código Postal: "C1000"
   - Localidad: "CABA"
   - Provincia: "Buenos Aires"
6. Seleccionar "Envío a domicilio"
7. Ingresar código postal y calcular envío
8. Seleccionar método de envío disponible
9. Verificar resumen con total + envío
10. Click en "Finalizar Compra"

**Resultado Esperado:**

- ✅ No aparece error 400
- ✅ Endpoint `/api/checkout/create-order` responde 200
- ✅ Orden creada en BD con estado `pendiente`
- ✅ Redirección correcta a Mercado Pago
- ✅ Preferencia MP generada con items correctos
- ✅ Total en MP coincide con checkout (productos + envío)

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot: `qa/screenshots/checkout/TC-CHECKOUT-ENVIO-001-orden-creada.png`
- [ ] Logs del servidor: [adjuntar]

---

### TC-CHECKOUT-RETIRO-002 – Compra con retiro en el local

**Precondiciones:**

- Usuario con carrito con al menos 1 producto
- Productos con stock disponible

**Pasos:**

1. Ir a `/carrito`
2. Verificar productos en carrito
3. Click en "Finalizar Compra"
4. Completar datos personales:
   - Nombre: "María González"
   - Email: "maria@example.com"
   - Teléfono: "+54 11 9876-5432"
5. Seleccionar "Retiro en el local"
6. Verificar que NO se requiere código postal ni dirección
7. Verificar resumen con total (sin costo de envío)
8. Click en "Finalizar Compra"

**Resultado Esperado:**

- ✅ No aparece error 400
- ✅ Endpoint `/api/checkout/create-order` responde 200
- ✅ Orden creada en BD con `envio_tipo = 'retiro_local'`
- ✅ Campos de dirección en BD son NULL o valores placeholder
- ✅ Redirección correcta a Mercado Pago
- ✅ Preferencia MP generada sin `address` en payer
- ✅ Total en MP coincide con checkout (solo productos)

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot: `qa/screenshots/checkout/TC-CHECKOUT-RETIRO-002-orden-creada.png`
- [ ] Logs del servidor: [adjuntar]

---

### TC-CHECKOUT-VALIDACION-003 – Envío con datos incompletos

**Precondiciones:**

- Usuario con carrito con productos

**Pasos:**

1. Ir a `/checkout`
2. Completar datos personales
3. Seleccionar "Envío a domicilio"
4. Ingresar código postal pero NO completar calle o número
5. Intentar avanzar al resumen

**Resultado Esperado:**

- ✅ Validación frontend previene avanzar sin datos completos
- ✅ Mensaje claro: "Por favor, completá todos los campos obligatorios"
- ✅ Si se fuerza el envío, backend responde 400 con mensaje claro
- ✅ Mensaje de error muestra qué campo falta

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot: `qa/screenshots/checkout/TC-CHECKOUT-VALIDACION-003-error.png`

---

### TC-CHECKOUT-ICONS-004 – Verificación de manifest e iconos PWA

**Precondiciones:**

- Navegador en modo incógnito
- DevTools abierto (Console)

**Pasos:**

1. Abrir `/` (Home)
2. Verificar consola (no debe haber errores de iconos)
3. Abrir `/catalogo`
4. Verificar consola
5. Abrir `/carrito`
6. Verificar consola
7. Abrir `/checkout`
8. Verificar consola
9. Verificar que los iconos existen:
   - `/icon-192x192.png` (192x192px)
   - `/icon-512x512.png` (512x512px)

**Resultado Esperado:**

- ✅ No aparece error: "Resource size is not correct - typo in the Manifest?"
- ✅ No aparece error: "Error while trying to use the following icon from the Manifest"
- ✅ Iconos existen y tienen tamaños correctos
- ✅ Manifest.json referencia iconos correctamente

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot de consola limpia: `qa/screenshots/checkout/TC-CHECKOUT-ICONS-004-console.png`
- [ ] Verificación de tamaños: [adjuntar]

---

### TC-CHECKOUT-400-FIXED-005 – No debe aparecer más el log de error

**Precondiciones:**

- Navegador con DevTools abierto

**Pasos:**

1. Completar checkout completo con datos válidos
2. Verificar consola del navegador
3. Verificar logs del servidor (si están disponibles)

**Resultado Esperado:**

- ✅ No aparece: `Error: Datos inválidos: [object Object]`
- ✅ No aparece: `[CHECKOUT] ❌ Error del servidor: {error: 'Datos inválidos', details: Array(1)}`
- ✅ Logs muestran validación exitosa
- ✅ Mensajes de error (si los hay) son claros y específicos

**Resultado Real:**

- [ ] OK / [ ] Falla

**Observaciones:**

- [ ] Screenshot de consola: `qa/screenshots/checkout/TC-CHECKOUT-400-FIXED-005-console.png`

---

## 📊 Resumen de Resultados

| Caso                       | Estado       | Observaciones |
| -------------------------- | ------------ | ------------- |
| TC-CHECKOUT-ENVIO-001      | ⏳ Pendiente |               |
| TC-CHECKOUT-RETIRO-002     | ⏳ Pendiente |               |
| TC-CHECKOUT-VALIDACION-003 | ⏳ Pendiente |               |
| TC-CHECKOUT-ICONS-004      | ⏳ Pendiente |               |
| TC-CHECKOUT-400-FIXED-005  | ⏳ Pendiente |               |

## 🔍 Verificaciones Adicionales

- [ ] Verificar que la tabla `ordenes` existe en Supabase
- [ ] Verificar que el webhook de MP funciona correctamente
- [ ] Verificar que las órdenes aparecen en `/admin/orders`
- [ ] Verificar que el total en MP coincide con el checkout
- [ ] Verificar que no hay errores en producción

## 📝 Notas

- Todos los casos deben ejecutarse en producción: `https://catalogo-indumentaria.vercel.app`
- Capturas de pantalla deben guardarse en `qa/screenshots/checkout/`
- Logs del servidor deben documentarse si están disponibles
