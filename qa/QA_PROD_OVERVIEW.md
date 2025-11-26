# 📸 QA Producción - Reporte Maestro

**Fecha de ejecución:** [DD/MM/YYYY]  
**Entorno:** Producción (`https://catalogo-indumentaria.vercel.app`)  
**Versión:** 1.0.0  
**Ejecutado por:** [Nombre del tester]

---

## 📋 Resumen Ejecutivo

### ¿Se puede comprar en producción de punta a punta sin errores?

**Respuesta:** [Sí / No / Parcialmente]

**Comentario:**

```
[Comentario detallado sobre el estado general del sistema]
```

---

## ✅ Resumen de Qué se Probó

### 🛒 Compra Completa

- [ ] Agregar productos al carrito
- [ ] Calcular envío
- [ ] Finalizar compra
- [ ] Procesar pago en Mercado Pago
- [ ] Confirmación de compra
- [ ] Email de confirmación (si aplica)

### 🛒 Carrito

- [ ] Agregar productos
- [ ] Modificar cantidades
- [ ] Eliminar productos
- [ ] Persistencia en localStorage
- [ ] Cálculo de totales
- [ ] Validación de stock

### 🚚 Envíos

- [ ] Cálculo de envío por código postal
- [ ] Selección de método de envío
- [ ] Integración con proveedor (Envíopack o simulado)
- [ ] Inclusión de costo de envío en total
- [ ] Validaciones de código postal

### 💳 Mercado Pago

- [ ] Creación de preferencia
- [ ] Redirección a MP
- [ ] Pago exitoso
- [ ] Pago rechazado
- [ ] Pago pendiente
- [ ] Webhook de confirmación
- [ ] Actualización de stock
- [ ] Limpieza de carrito

---

## 📊 Lista de Casos de Prueba Ejecutados

### Carrito (7 casos)

| ID          | Caso                        | Estado | Observaciones |
| ----------- | --------------------------- | ------ | ------------- |
| TC-CART-001 | Agregar producto simple     | ⏳     | -             |
| TC-CART-002 | Agregar varias unidades     | ⏳     | -             |
| TC-CART-003 | Agregar distintos productos | ⏳     | -             |
| TC-CART-004 | Eliminar producto/vaciar    | ⏳     | -             |
| TC-CART-005 | Persistencia del carrito    | ⏳     | -             |
| TC-CART-006 | Validación de stock         | ⏳     | -             |
| TC-CART-007 | Cálculo de descuentos       | ⏳     | -             |

**Aprobados:** 0 / 7  
**Fallidos:** 0 / 7  
**No ejecutados:** 7 / 7

### Envíos (7 casos)

| ID          | Caso                        | Estado | Observaciones |
| ----------- | --------------------------- | ------ | ------------- |
| TC-SHIP-001 | Carga de datos correctos    | ⏳     | -             |
| TC-SHIP-002 | CP inválido                 | ⏳     | -             |
| TC-SHIP-003 | Campos obligatorios         | ⏳     | -             |
| TC-SHIP-004 | Cambio de CP y recálculo    | ⏳     | -             |
| TC-SHIP-005 | Validación de tipo de envío | ⏳     | -             |
| TC-SHIP-006 | Visualización de costos     | ⏳     | -             |
| TC-SHIP-007 | Manejo de errores           | ⏳     | -             |

**Aprobados:** 0 / 7  
**Fallidos:** 0 / 7  
**No ejecutados:** 7 / 7

### Integración de Envíos (6 casos)

| ID           | Caso                       | Estado | Observaciones |
| ------------ | -------------------------- | ------ | ------------- |
| TC-ENVIO-001 | Compra con envío estándar  | ⏳     | -             |
| TC-ENVIO-002 | Compra con retiro en local | ⏳     | -             |
| TC-ENVIO-003 | Validar respuesta de API   | ⏳     | -             |
| TC-ENVIO-004 | Fallo de comunicación      | ⏳     | -             |
| TC-ENVIO-005 | Número de seguimiento      | ⏳     | -             |
| TC-ENVIO-006 | Consistencia de BD         | ⏳     | -             |

**Aprobados:** 0 / 6  
**Fallidos:** 0 / 6  
**No ejecutados:** 6 / 6

### Mercado Pago (7 casos)

| ID        | Caso                 | Estado | Observaciones |
| --------- | -------------------- | ------ | ------------- |
| TC-MP-001 | Compra exitosa       | ⏳     | -             |
| TC-MP-002 | Pago rechazado       | ⏳     | -             |
| TC-MP-003 | Pago pendiente       | ⏳     | -             |
| TC-MP-004 | Validar preferencia  | ⏳     | -             |
| TC-MP-005 | Validar webhook      | ⏳     | -             |
| TC-MP-006 | Manejo de errores    | ⏳     | -             |
| TC-MP-007 | Envío en preferencia | ⏳     | -             |

**Aprobados:** 0 / 7  
**Fallidos:** 0 / 7  
**No ejecutados:** 7 / 7

**TOTAL GENERAL:**

- **Total de casos:** 27
- **Aprobados:** 0
- **Fallidos:** 0
- **No ejecutados:** 27
- **Tasa de éxito:** 0%

---

## 📸 Capturas de Pantalla

### Home

- [ ] Screenshot de home: `qa/screenshots/home.png`
- [ ] Observaciones: [Completar]

### Producto

- [ ] Screenshot de producto: `qa/screenshots/producto.png`
- [ ] Observaciones: [Completar]

### Carrito

- [ ] Screenshot de carrito vacío: `qa/screenshots/carrito-vacio.png`
- [ ] Screenshot de carrito con productos: `qa/screenshots/carrito-lleno.png`
- [ ] Observaciones: [Completar]

### Checkout

- [ ] Screenshot de calculadora de envío: `qa/screenshots/envio-calculadora.png`
- [ ] Screenshot de métodos de envío: `qa/screenshots/envio-metodos.png`
- [ ] Screenshot de resumen final: `qa/screenshots/resumen-final.png`
- [ ] Observaciones: [Completar]

### Mercado Pago

- [ ] Screenshot de pantalla de MP: `qa/screenshots/mercadopago.png`
- [ ] Observaciones: [Completar]

### Confirmación de Compra

- [ ] Screenshot de éxito: `qa/screenshots/pago-success.png`
- [ ] Screenshot de rechazo: `qa/screenshots/pago-failure.png`
- [ ] Screenshot de pendiente: `qa/screenshots/pago-pending.png`
- [ ] Observaciones: [Completar]

---

## 🔍 Hallazgos Principales

### ✅ Funcionalidades que Funcionan Correctamente

1. [Listar funcionalidades que funcionan bien]
2. [Ejemplo: Agregar productos al carrito funciona correctamente]
3. [Ejemplo: Cálculo de envío responde rápidamente]

### ⚠️ Problemas Encontrados

1. [Listar problemas encontrados]
2. [Ejemplo: El carrito no persiste después de cerrar navegador]
3. [Ejemplo: El costo de envío no se incluye en el total]

### 🐛 Bugs Críticos

Ver `qa/BUGS_PROD.md` para detalles completos.

**Total de bugs críticos:** 0

---

## 📈 Métricas de Rendimiento

### Tiempos de Respuesta

- **Carga de home:** [X] segundos
- **Carga de catálogo:** [X] segundos
- **Cálculo de envío:** [X] segundos
- **Creación de preferencia MP:** [X] segundos
- **Procesamiento de webhook:** [X] segundos

### Disponibilidad

- **Uptime durante pruebas:** [X]%
- **Errores 500:** [X]
- **Errores 404:** [X]
- **Timeouts:** [X]

---

## 🎯 Recomendaciones

### Prioridad Alta

1. [Recomendación 1]
2. [Recomendación 2]

### Prioridad Media

1. [Recomendación 3]
2. [Recomendación 4]

### Prioridad Baja

1. [Recomendación 5]
2. [Recomendación 6]

---

## 📝 Notas Adicionales

### Configuración Verificada

- [ ] Mercado Pago configurado correctamente
- [ ] Envíopack configurado (o usando cálculo simulado)
- [ ] Variables de entorno presentes
- [ ] Webhooks configurados

### Entorno de Prueba

- **Navegador:** [Chrome/Firefox/Safari/Edge]
- **Versión:** [X.X.X]
- **OS:** [Windows/Mac/Linux]
- **Dispositivo:** [Desktop/Mobile/Tablet]
- **Resolución:** [1920x1080 / Otro]

### Datos de Prueba Usados

- **Productos:** [Listar productos usados]
- **Códigos postales:** [Listar CPs usados]
- **Montos:** [Listar montos de prueba]

---

## ✅ Checklist Final

- [ ] Todos los casos de prueba ejecutados
- [ ] Screenshots capturados
- [ ] Bugs documentados en `qa/BUGS_PROD.md`
- [ ] Logs revisados
- [ ] Panel de MP verificado
- [ ] Email de confirmación verificado (si aplica)
- [ ] Reporte completo generado

---

## 📊 Conclusión

**Estado General:** [Excelente / Bueno / Regular / Malo]

**¿Listo para Producción?** [Sí / No / Con reservas]

**Comentario Final:**

```
[Comentario final sobre el estado del sistema y recomendaciones]
```

---

**Próxima revisión:** [DD/MM/YYYY]  
**Última actualización:** 26/11/2025
