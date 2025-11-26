# 🧪 QA E2E: Compra con Retiro en Local

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

---

## 🎯 Objetivo

Verificar que el flujo completo de compra con retiro en local funciona sin errores, sin requerir dirección completa y sin intervención de EnvioPack.

---

## 📝 Pasos de la Prueba

### Paso 1-4: Igual que Prueba de Envío

(Ver `docs/qa-e2e-compra-con-envio.md` para pasos 1-4)

---

### Paso 5: Completar Datos Personales (Solo Básicos)

**Acción:**

- Completar formulario:
  - Nombre: "María González"
  - Email: "maria.gonzalez@example.com"
  - Teléfono: "+54 11 9876-5432"
- Click en "Continuar a Envío"

**Resultado esperado:**

- ✅ Validación funciona correctamente
- ✅ NO se requiere dirección completa
- ✅ Avance a siguiente step funciona

**Resultado real:** ⏳ PENDIENTE

---

### Paso 6: Seleccionar Retiro en Local

**Acción:**

- En método de envío, seleccionar "Retiro en el local"
- Verificar que NO se requiere código postal
- Verificar que costo de envío = $0
- Click en "Continuar a Resumen"

**Resultado esperado:**

- ✅ Opción "Retiro en el local" visible y funcional
- ✅ NO se requiere código postal
- ✅ NO se llama a EnvioPack
- ✅ Costo de envío = $0
- ✅ Mensaje: "Vas a retirar tu pedido por el local..."
- ✅ Sin errores relacionados con envío

**Logs esperados:**

```
[CHECKOUT][CLIENT] Retiro en local seleccionado
[CHECKOUT][CLIENT] Costo de envío: 0
```

**NO debe aparecer:**

- `[ENVIOS][ENVIOPACK]` (no se debe llamar)

**Resultado real:** ⏳ PENDIENTE

---

### Paso 7: Revisar Resumen

**Acción:**

- Verificar resumen completo:
  - Productos correctos
  - Datos personales correctos
  - Tipo de entrega: "Retiro en el local"
  - Costo de envío: $0
  - Total = solo productos (sin envío)

**Resultado esperado:**

- ✅ Resumen completo y correcto
- ✅ Tipo de entrega claramente indicado
- ✅ Costo de envío = $0
- ✅ Total = productos solamente

**Resultado real:** ⏳ PENDIENTE

---

### Paso 8: Finalizar Compra

**Acción:**

- Click en "Pagar Ahora"
- Observar comportamiento igual que prueba de envío

**Resultado esperado:**

- ✅ Mismo comportamiento que prueba de envío
- ✅ Botón muestra loading
- ✅ Toast visible
- ✅ Sin errores

**Resultado real:** ⏳ PENDIENTE

---

### Paso 9: Verificar Creación de Orden

**Acción:**

- Revisar logs
- Verificar respuesta del servidor

**Resultado esperado:**

- ✅ Status 200
- ✅ Orden creada exitosamente
- ✅ Preference MP creada
- ✅ `initPoint` presente

**Logs esperados:**

```
[CHECKOUT][API] ✅ Orden creada exitosamente: {orderId}
[CHECKOUT][API] Envío tipo: retiro_local
[CHECKOUT][API] Envío costo: 0
[MP-PAYMENT] ✅ [SUCCESS] Preferencia creada exitosamente
```

**Resultado real:** ⏳ PENDIENTE

---

### Paso 10: Verificar Orden en Supabase

**Acción:**

- Buscar orden en Supabase
- Verificar estructura

**Resultado esperado:**

- ✅ Orden visible en tabla
- ✅ Campo `envio.tipo` = 'retiro_local'
- ✅ Campo `envio.costo` = 0
- ✅ Campo `envio.direccion` = undefined o null
- ✅ Campo `total` = solo productos (sin envío)
- ✅ Resto de campos correctos

**Resultado real:** ⏳ PENDIENTE

---

### Paso 11: Verificar Preference de Mercado Pago

**Acción:**

- Verificar que la preference MP no incluye datos de envío inválidos
- Verificar que el total en MP coincide con el checkout

**Resultado esperado:**

- ✅ Preference creada exitosamente
- ✅ Items correctos (productos solamente, sin item "Envío")
- ✅ Total en MP = total de productos solamente
- ✅ No hay errores relacionados con shipping en MP

**Resultado real:** ⏳ PENDIENTE

---

## 📊 Resumen de Resultados

| Paso                      | Estado       | Observaciones             |
| ------------------------- | ------------ | ------------------------- |
| 1-4. Flujo inicial        | ⏳ PENDIENTE | Igual que prueba de envío |
| 5. Completar datos        | ⏳ PENDIENTE | Solo básicos              |
| 6. Seleccionar retiro     | ⏳ PENDIENTE | Sin CP, sin EnvioPack     |
| 7. Revisar resumen        | ⏳ PENDIENTE | Envío = $0                |
| 8. Finalizar compra       | ⏳ PENDIENTE | Igual que envío           |
| 9. Verificar orden        | ⏳ PENDIENTE | Tipo retiro_local         |
| 10. Verificar en Supabase | ⏳ PENDIENTE | Estructura correcta       |
| 11. Verificar MP          | ⏳ PENDIENTE | Sin shipping              |

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

---

**Última actualización:** 2024-11-26  
**Ejecutado por:** [PENDIENTE]
