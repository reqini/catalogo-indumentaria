# 🧪 QA Final: Checkout Productivo

**Fecha:** 2024-11-26  
**Versión:** 1.0  
**Estado:** ✅ **LISTO PARA EJECUTAR**

---

## 📋 Pre-requisitos

Antes de ejecutar las pruebas, asegúrate de:

- [ ] Tabla `ordenes` existe en Supabase (ejecutar `supabase/schemas/checkout-schema-completo.sql`)
- [ ] `MP_ACCESS_TOKEN` configurado en Vercel Dashboard
- [ ] REDEPLOY realizado después de configurar `MP_ACCESS_TOKEN`
- [ ] Productos disponibles en catálogo
- [ ] Carrito funcional

---

## ✅ Casos de Prueba

### CP-01: Agregar Producto al Carrito y Llegar a Checkout

**ID:** CP-01  
**Prioridad:** 🔴 ALTA  
**Descripción:** Verificar que el flujo básico de carrito funciona

**Pasos:**

1. Ir a catálogo (`/catalogo`)
2. Seleccionar un producto
3. Elegir talle (si aplica)
4. Click en "Agregar al carrito"
5. Verificar que aparece en el carrito
6. Click en "Finalizar compra" o navegar a `/checkout`

**Resultado esperado:**

- ✅ Producto aparece en carrito
- ✅ Badge muestra cantidad correcta
- ✅ Redirección a `/checkout` funciona
- ✅ Checkout muestra productos del carrito

**Resultado real:** ⏳ PENDIENTE

---

### CP-02: Completar Datos y Generar Orden + Preference MP, Redirigir a MP

**ID:** CP-02  
**Prioridad:** 🔴 CRÍTICA  
**Descripción:** Verificar flujo completo hasta redirección a Mercado Pago

**Pasos:**

1. En checkout, completar datos personales:
   - Nombre: "Juan Pérez"
   - Email: "juan.perez@example.com"
   - Teléfono: "+54 11 1234-5678"
2. Seleccionar método de envío:
   - Opción A: Ingresar CP "C1043AAX" y seleccionar método
   - Opción B: Seleccionar "Retiro en el local"
3. Revisar resumen
4. Click en "Pagar Ahora"
5. Observar:
   - Botón muestra "Procesando pago..." con spinner
   - Botón está deshabilitado
   - Toast "Redirigiendo a Mercado Pago..." aparece
6. Verificar redirección a Mercado Pago

**Resultado esperado:**

- ✅ No aparece error 503
- ✅ No aparece `CHECKOUT_MP_NOT_CONFIGURED`
- ✅ Status 200 en `/api/checkout/create-order-simple`
- ✅ Orden creada en Supabase con `orderId`
- ✅ Preferencia MP creada con `preferenceId`
- ✅ `initPoint` presente en respuesta
- ✅ Redirección a Mercado Pago funciona
- ✅ URL de MP contiene `init_point` válido

**Logs esperados en consola:**

```
[CHECKOUT][CLIENT] 🚀 Iniciando proceso de checkout...
[CHECKOUT][CLIENT] 📤 Enviando orden al servidor...
[CHECKOUT][CLIENT] ✅ Respuesta del servidor: {ok: true, ...}
[CHECKOUT][CLIENT] 🎯 Redirigiendo a Mercado Pago...
```

**Logs esperados en Vercel:**

```
[CHECKOUT][API] 📥 Request recibido
[CHECKOUT][API] ✅ Validación exitosa
[CHECKOUT][API] 📤 Creando orden en Supabase...
[CHECKOUT][API] ✅ Orden creada exitosamente: {orderId}
[CHECKOUT][API] 📤 Creando preferencia MP...
[MP-PAYMENT] ✅ Token configurado correctamente
[MP-PAYMENT] ✅ [SUCCESS] Preferencia creada exitosamente
[CHECKOUT][API] ✅ [SUCCESS] Checkout completado exitosamente
```

**Resultado real:** ⏳ PENDIENTE

---

### CP-03: Simular Fallo de MP (Token Incorrecto) y Verificar Mensaje de Error Coherente

**ID:** CP-03  
**Prioridad:** 🟡 MEDIA  
**Descripción:** Verificar manejo de errores cuando MP falla

**Precondiciones:**

- Configurar `MP_ACCESS_TOKEN` con un token inválido temporalmente

**Pasos:**

1. Completar checkout hasta "Pagar Ahora"
2. Click en "Pagar Ahora"
3. Observar respuesta del servidor

**Resultado esperado:**

- ✅ NO aparece 503 genérico
- ✅ NO aparece `CHECKOUT_MP_NOT_CONFIGURED`
- ✅ Aparece código específico: `MP_INVALID_TOKEN` o `CHECKOUT_MP_ERROR`
- ✅ Mensaje claro: "Credenciales de Mercado Pago inválidas" o similar
- ✅ Status 500 o 502 (no 503)
- ✅ Toast visible con mensaje de error
- ✅ Botón se habilita nuevamente

**Logs esperados:**

```
[MP-PAYMENT] ❌ [ERROR] Error de Mercado Pago API
[MP-PAYMENT] Status: 401
[CHECKOUT][API] ❌ [ERROR] Error de Mercado Pago: {code: 'MP_INVALID_TOKEN', ...}
```

**Resultado real:** ⏳ PENDIENTE

---

### CP-04: Envío Sin EnvioPack Configurado → Checkout Sigue Funcionando con Fallback

**ID:** CP-04  
**Prioridad:** 🟡 MEDIA  
**Descripción:** Verificar que EnvioPack no rompe el checkout si no está configurado

**Precondiciones:**

- `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET` NO configurados
- `MP_ACCESS_TOKEN` configurado

**Pasos:**

1. Ir a checkout
2. Completar datos personales
3. En método de envío, ingresar código postal "C1043AAX"
4. Observar métodos de envío disponibles
5. Seleccionar método
6. Continuar y completar compra

**Resultado esperado:**

- ✅ Métodos de envío se muestran (simulados)
- ✅ NO aparece error 500
- ✅ NO aparece error relacionado con EnvioPack
- ✅ Checkout continúa funcionando normalmente
- ✅ Métodos simulados disponibles (OCA, Correo Argentino, Andreani)
- ✅ Precios calculados correctamente (simulados)
- ✅ Redirección a MP funciona

**Logs esperados:**

```
[ENVIOS][ENVIOPACK] ⚠️ Credenciales no configuradas, usando cálculo simulado
[ENVIOS][ENVIOPACK] ✅ Métodos simulados generados: 5
```

**Resultado real:** ⏳ PENDIENTE

---

### CP-05: Envío con EnvioPack Bien Configurado → Checkout + MP Funcionan

**ID:** CP-05  
**Prioridad:** 🟢 BAJA  
**Descripción:** Verificar integración completa con EnvioPack real

**Precondiciones:**

- `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET` configurados
- `MP_ACCESS_TOKEN` configurado

**Pasos:**

1. Ir a checkout
2. Completar datos personales
3. Ingresar código postal válido
4. Observar métodos de envío (deben ser reales de EnvioPack)
5. Seleccionar método
6. Completar compra

**Resultado esperado:**

- ✅ Métodos de envío reales de EnvioPack se muestran
- ✅ Precios son reales (no simulados)
- ✅ Checkout funciona completamente
- ✅ Redirección a MP funciona

**Logs esperados:**

```
[ENVIOS][ENVIOPACK] 📤 Calculando envío real: {...}
[ENVIOS][ENVIOPACK] ✅ Métodos obtenidos: X
```

**Resultado real:** ⏳ PENDIENTE

---

### CP-06: Flujo Feliz Completo (Happy Path)

**ID:** CP-06  
**Prioridad:** 🔴 CRÍTICA  
**Descripción:** Verificar flujo completo sin errores

**Pasos:**

1. Agregar producto al carrito
2. Ir a checkout
3. Completar datos personales
4. Seleccionar método de envío
5. Revisar resumen
6. Click en "Pagar Ahora"
7. Verificar redirección a Mercado Pago
8. En Mercado Pago (sandbox), usar tarjeta de prueba aprobada
9. Verificar redirección de vuelta
10. Verificar orden en Supabase

**Resultado esperado:**

- ✅ Todo el flujo funciona sin errores
- ✅ Status 200 en todos los endpoints
- ✅ Nunca aparece 503 (excepto si flag de mantenimiento está activo)
- ✅ Orden creada en Supabase
- ✅ Preferencia MP creada
- ✅ Redirección funciona
- ✅ Webhook actualiza orden (si está implementado)

**Resultado real:** ⏳ PENDIENTE

---

## 📊 Resumen de Resultados

| Caso  | Estado       | Resultado | Observaciones           |
| ----- | ------------ | --------- | ----------------------- |
| CP-01 | ⏳ PENDIENTE | -         | Agregar al carrito      |
| CP-02 | ⏳ PENDIENTE | -         | Flujo completo hasta MP |
| CP-03 | ⏳ PENDIENTE | -         | Manejo de errores MP    |
| CP-04 | ⏳ PENDIENTE | -         | EnvioPack fallback      |
| CP-05 | ⏳ PENDIENTE | -         | EnvioPack real          |
| CP-06 | ⏳ PENDIENTE | -         | Happy path completo     |

---

## ✅ Checklist de Validación Final

Antes de considerar el checkout como productivo:

- [ ] CP-02 pasa exitosamente (flujo completo hasta MP)
- [ ] CP-06 pasa exitosamente (happy path completo)
- [ ] No aparecen errores 503 en flujo normal
- [ ] No aparece `CHECKOUT_MP_NOT_CONFIGURED` en flujo normal
- [ ] Orden se crea correctamente en Supabase
- [ ] Preferencia MP se crea correctamente
- [ ] Redirección a MP funciona
- [ ] EnvioPack no rompe el checkout si no está configurado
- [ ] Mensajes de error son claros y específicos
- [ ] Logs estructurados funcionan correctamente

---

**Última actualización:** 2024-11-26  
**Versión:** 1.0
