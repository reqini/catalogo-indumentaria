# 🧪 QA E2E: Compra con Envío a Domicilio

**Fecha:** 2024-11-26  
**Tipo:** End-to-End Test  
**Prioridad:** 🔴 CRÍTICA  
**Estado:** ⏳ PENDIENTE DE EJECUCIÓN

---

## 📋 Pre-requisitos

- [ ] Tabla `ordenes` existe en Supabase
- [ ] `MP_ACCESS_TOKEN` configurado en Vercel
- [ ] REDEPLOY realizado después de configurar token
- [ ] Productos disponibles en catálogo
- [ ] EnvioPack configurado O fallback simulado funcionando

---

## 🎯 Objetivo

Verificar que el flujo completo de compra con envío a domicilio funciona sin errores desde el primer clic hasta la redirección a Mercado Pago.

---

## 📝 Pasos de la Prueba

### Paso 1: Ingresar al Sitio

**Acción:**

- Abrir navegador
- Ir a `https://catalogo-indumentaria.vercel.app`

**Resultado esperado:**

- ✅ Sitio carga correctamente
- ✅ Catálogo visible
- ✅ Sin errores en consola

**Resultado real:** ⏳ PENDIENTE

---

### Paso 2: Seleccionar Producto Real

**Acción:**

- Navegar a `/catalogo`
- Seleccionar un producto disponible
- Verificar detalles del producto

**Resultado esperado:**

- ✅ Producto se muestra correctamente
- ✅ Imágenes cargan
- ✅ Precio visible
- ✅ Stock disponible visible
- ✅ Botón "Agregar al carrito" funcional

**Resultado real:** ⏳ PENDIENTE

---

### Paso 3: Agregar al Carrito

**Acción:**

- Seleccionar talle (si aplica)
- Click en "Agregar al carrito"
- Verificar que aparece en el carrito

**Resultado esperado:**

- ✅ Producto agregado al carrito
- ✅ Badge muestra cantidad correcta
- ✅ MiniCart muestra producto
- ✅ Sin errores en consola

**Logs esperados:**

```
[Cart] Producto agregado: {nombre}
[Cart] Total items: 1
```

**Resultado real:** ⏳ PENDIENTE

---

### Paso 4: Ir a Checkout

**Acción:**

- Click en "Finalizar compra" o navegar a `/checkout`
- Verificar que se carga la página de checkout

**Resultado esperado:**

- ✅ Página de checkout carga
- ✅ Productos del carrito visibles
- ✅ Totales calculados correctamente
- ✅ Sin errores en consola

**Resultado real:** ⏳ PENDIENTE

---

### Paso 5: Completar Datos Personales

**Acción:**

- Completar formulario:
  - Nombre: "Juan Pérez"
  - Email: "juan.perez@example.com"
  - Teléfono: "+54 11 1234-5678"
- Click en "Continuar a Envío"

**Resultado esperado:**

- ✅ Validación funciona correctamente
- ✅ Mensajes de error claros si hay campos inválidos
- ✅ Avance a siguiente step funciona
- ✅ Datos se guardan en estado

**Resultado real:** ⏳ PENDIENTE

---

### Paso 6: Seleccionar Método de Envío

**Acción:**

- Ingresar código postal: "C1043AAX"
- Esperar cálculo de envío
- Seleccionar método (ej: "OCA Estándar")
- Click en "Continuar a Resumen"

**Resultado esperado:**

- ✅ Métodos de envío se muestran
- ✅ Precios calculados correctamente
- ✅ Selección funciona
- ✅ Costo de envío se agrega al total
- ✅ Sin errores relacionados con EnvioPack

**Logs esperados:**

```
[ENVIOS][ENVIOPACK] 📤 Calculando envío...
[ENVIOS][ENVIOPACK] ✅ Métodos obtenidos: X
```

O si no está configurado:

```
[ENVIOS][ENVIOPACK] ⚠️ Credenciales no configuradas, usando cálculo simulado
[ENVIOS][ENVIOPACK] ✅ Métodos simulados generados: 5
```

**Resultado real:** ⏳ PENDIENTE

---

### Paso 7: Revisar Resumen

**Acción:**

- Verificar resumen completo:
  - Productos correctos
  - Datos personales correctos
  - Método de envío seleccionado
  - Total correcto (productos + envío)

**Resultado esperado:**

- ✅ Resumen completo y correcto
- ✅ Totales coinciden con cálculo
- ✅ Información visible y clara

**Resultado real:** ⏳ PENDIENTE

---

### Paso 8: Finalizar Compra

**Acción:**

- Click en "Pagar Ahora"
- Observar:
  - Botón muestra "Procesando pago..." con spinner
  - Botón está deshabilitado
  - Toast "Redirigiendo a Mercado Pago..." aparece
- Esperar respuesta del servidor

**Resultado esperado:**

- ✅ Botón muestra loading correctamente
- ✅ Botón deshabilitado durante procesamiento
- ✅ No se puede hacer click múltiple
- ✅ Toast visible

**Resultado real:** ⏳ PENDIENTE

---

### Paso 9: Verificar Creación de Orden y Preference

**Acción:**

- Revisar logs en consola del navegador
- Revisar logs en Vercel Dashboard
- Verificar respuesta del servidor

**Resultado esperado:**

- ✅ Status 200 en `/api/checkout/create-order-simple`
- ✅ No aparece error 503
- ✅ No aparece `CHECKOUT_MP_NOT_CONFIGURED`
- ✅ Respuesta contiene `ok: true`
- ✅ Respuesta contiene `initPoint` válido
- ✅ Orden creada en Supabase con `orderId`

**Logs esperados en consola:**

```
[CHECKOUT][CLIENT] 🚀 Iniciando proceso de checkout...
[CHECKOUT][CLIENT] 📤 Enviando orden al servidor...
[CHECKOUT][CLIENT] ✅ Respuesta del servidor: {ok: true, ...}
[CHECKOUT][CLIENT] ✅ [SUCCESS] Respuesta válida recibida: {...}
[CHECKOUT][CLIENT] 🎯 Redirigiendo a Mercado Pago...
[CHECKOUT][CLIENT] 🚀 Ejecutando redirección a: ...
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

### Paso 10: Verificar Redirección a Mercado Pago

**Acción:**

- Esperar redirección automática
- Verificar que se carga la página de Mercado Pago

**Resultado esperado:**

- ✅ Redirección automática funciona
- ✅ URL contiene `init_point` válido
- ✅ Página de Mercado Pago carga correctamente
- ✅ Productos y totales correctos en MP
- ✅ Datos del comprador correctos

**Resultado real:** ⏳ PENDIENTE

---

### Paso 11: Verificar Orden en Supabase

**Acción:**

- Ir a Supabase Dashboard → Table Editor → `ordenes`
- Buscar orden por `orderId` o email reciente
- Verificar estructura completa

**Resultado esperado:**

- ✅ Orden visible en tabla
- ✅ Campo `productos` contiene array JSON correcto
- ✅ Campo `comprador` contiene datos correctos
- ✅ Campo `envio` contiene datos correctos (tipo, método, costo, dirección)
- ✅ Campo `total` coincide con cálculo
- ✅ Campo `estado` = 'pendiente'
- ✅ Campo `pago_preferencia_id` presente
- ✅ Campo `created_at` tiene timestamp reciente

**Resultado real:** ⏳ PENDIENTE

---

## 📊 Resumen de Resultados

| Paso                          | Estado       | Observaciones |
| ----------------------------- | ------------ | ------------- |
| 1. Ingresar al sitio          | ⏳ PENDIENTE | -             |
| 2. Seleccionar producto       | ⏳ PENDIENTE | -             |
| 3. Agregar al carrito         | ⏳ PENDIENTE | -             |
| 4. Ir a checkout              | ⏳ PENDIENTE | -             |
| 5. Completar datos            | ⏳ PENDIENTE | -             |
| 6. Seleccionar envío          | ⏳ PENDIENTE | -             |
| 7. Revisar resumen            | ⏳ PENDIENTE | -             |
| 8. Finalizar compra           | ⏳ PENDIENTE | -             |
| 9. Verificar orden/preference | ⏳ PENDIENTE | -             |
| 10. Redirección a MP          | ⏳ PENDIENTE | -             |
| 11. Verificar en Supabase     | ⏳ PENDIENTE | -             |

---

## 🔍 Errores Encontrados y Corregidos

### Error 1: [PENDIENTE]

**Descripción:**  
**Causa raíz:**  
**Corrección aplicada:**  
**Archivos modificados:**  
**Resultado:**

---

## ✅ Estado Final

**Estado:** ⏳ PENDIENTE DE EJECUCIÓN

**Próximos pasos:**

1. Ejecutar prueba completa
2. Documentar resultados reales
3. Corregir errores encontrados
4. Repetir hasta obtener 100% éxito

---

**Última actualización:** 2024-11-26  
**Ejecutado por:** [PENDIENTE]
