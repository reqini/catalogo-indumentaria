# 🚚 QA - Sistema de Envíos - Producción

**Fecha:** 26/11/2025  
**Entorno:** Producción (`https://catalogo-indumentaria.vercel.app`)  
**Versión:** 1.0.0

---

## 📋 Casos de Prueba

### TC-SHIP-001 – Carga de datos de envío correctos

**Prioridad:** Alta  
**Tipo:** Funcional  
**Módulo:** Envíos

#### Precondiciones

- Carrito con al menos 1 producto
- Navegador funcionando correctamente

#### Pasos Detallados

1. Navegar a `/carrito`
2. En la sección "Cálculo de Envío", ingresar código postal válido (ej: `C1000`)
3. Hacer clic en "Calcular"
4. Esperar respuesta de métodos de envío disponibles
5. Seleccionar un método de envío
6. Verificar que el método seleccionado se muestra destacado
7. Verificar que el costo de envío se suma al total

#### Resultado Esperado

- ✅ Código postal aceptado correctamente
- ✅ Métodos de envío se muestran después de calcular
- ✅ Método seleccionado se destaca visualmente
- ✅ Costo de envío se suma correctamente al total
- ✅ Total final incluye productos + envío

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Calculadora de envío vacía
- [ ] Métodos de envío disponibles
- [ ] Método seleccionado
- [ ] Resumen con costo de envío

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-SHIP-002 – CP inválido (validaciones)

**Prioridad:** Media  
**Tipo:** Validación  
**Módulo:** Envíos

#### Precondiciones

- Carrito con productos

#### Pasos Detallados

1. Navegar a `/carrito`
2. Intentar ingresar código postal con menos de 4 caracteres
3. Verificar mensaje de error
4. Intentar ingresar código postal con caracteres especiales inválidos
5. Verificar que solo se aceptan números y letras
6. Intentar calcular con código postal vacío
7. Verificar mensaje de error

#### Resultado Esperado

- ✅ Mensaje de error para CP con menos de 4 caracteres
- ✅ Solo se aceptan números y letras (sin caracteres especiales)
- ✅ Mensaje de error para CP vacío
- ✅ Botón "Calcular" deshabilitado cuando el CP es inválido

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Mensaje de error CP corto
- [ ] Mensaje de error CP vacío
- [ ] Validación de caracteres

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-SHIP-003 – Campos obligatorios vacíos

**Prioridad:** Media  
**Tipo:** Validación  
**Módulo:** Envíos

#### Precondiciones

- Carrito con productos

#### Pasos Detallados

1. Navegar a `/carrito`
2. Dejar código postal vacío
3. Intentar calcular envío
4. Verificar mensaje de error
5. Ingresar código postal válido
6. Calcular envío exitosamente

#### Resultado Esperado

- ✅ Mensaje de error claro cuando el CP está vacío
- ✅ No se permite calcular sin CP
- ✅ Después de ingresar CP válido, funciona correctamente

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-SHIP-004 – Cambio de código postal y recálculo del costo de envío

**Prioridad:** Alta  
**Tipo:** Funcional  
**Módulo:** Envíos

#### Precondiciones

- Envío ya calculado para un CP

#### Pasos Detallados

1. Navegar a `/carrito`
2. Calcular envío para CP `C1000` (CABA)
3. Seleccionar un método de envío
4. Anotar el costo de envío
5. Cambiar código postal a `X5000` (Córdoba - interior)
6. Recalcular envío
7. Verificar que los métodos y precios cambian
8. Seleccionar nuevo método
9. Verificar que el total se actualiza correctamente

#### Resultado Esperado

- ✅ Métodos de envío se recalculan al cambiar CP
- ✅ Precios cambian según la zona geográfica
- ✅ Método anterior se deselecciona automáticamente
- ✅ Total se actualiza con el nuevo costo de envío
- ✅ Precios de interior son más altos que CABA (generalmente)

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Envío para CABA
- [ ] Envío para interior
- [ ] Comparación de precios

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-SHIP-005 – Validación de tipo de envío

**Prioridad:** Alta  
**Tipo:** Funcional  
**Módulo:** Envíos

#### Precondiciones

- Envío calculado con múltiples métodos disponibles

#### Pasos Detallados - Envío estándar

1. Calcular envío para un CP
2. Verificar que aparece opción "OCA Estándar" o similar
3. Seleccionar envío estándar
4. Verificar precio y demora mostrados
5. Verificar que se suma al total

#### Pasos Detallados - Retiro en local

1. Calcular envío
2. Verificar si hay opción de "Retiro en local" o similar
3. Si existe, seleccionarla
4. Verificar que el costo es $0 o menor
5. Verificar que el total no incluye costo de envío

#### Pasos Detallados - Envío rápido/express

1. Calcular envío
2. Verificar que aparece opción "OCA Express" o "Andreani Express"
3. Seleccionar envío express
4. Verificar que el precio es mayor que estándar
5. Verificar que la demora es menor
6. Verificar que se suma correctamente al total

#### Resultado Esperado

- ✅ Múltiples métodos de envío disponibles
- ✅ Envío estándar tiene precio y demora correctos
- ✅ Envío express tiene precio mayor pero demora menor
- ✅ Retiro en local (si existe) tiene costo $0
- ✅ Cada método se puede seleccionar correctamente
- ✅ Total se actualiza según método seleccionado

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Métodos estándar disponibles
- [ ] Método express seleccionado
- [ ] Comparación de precios y demoras

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-SHIP-006 – Visualización correcta del costo de envío

**Prioridad:** Alta  
**Tipo:** UI/UX  
**Módulo:** Envíos

#### Precondiciones

- Carrito con productos
- Envío calculado y seleccionado

#### Pasos Detallados - En checkout/carrito

1. Navegar a `/carrito`
2. Agregar productos
3. Calcular y seleccionar envío
4. Verificar en la sección "Resumen":
   - Subtotal de productos
   - Costo de envío
   - Total final

#### Pasos Detallados - En resumen final antes de pagar

1. Con envío seleccionado, hacer clic en "Finalizar Compra"
2. Verificar que el costo de envío se incluye en la preferencia de Mercado Pago
3. Verificar que el total en MP coincide con el total mostrado en el carrito

#### Resultado Esperado

- ✅ Subtotal visible y correcto
- ✅ Costo de envío visible y destacado
- ✅ Total final = Subtotal + Envío
- ✅ Formato de precio correcto (ARS con símbolo $)
- ✅ Envío incluido en preferencia de Mercado Pago
- ✅ Total en MP coincide con total del carrito

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Resumen en carrito con envío
- [ ] Preferencia de MP con envío incluido
- [ ] Comparación de totales

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-SHIP-007 – Manejo de errores en cálculo de envío

**Prioridad:** Media  
**Tipo:** Manejo de Errores  
**Módulo:** Envíos

#### Precondiciones

- Carrito con productos

#### Pasos Detallados

1. Navegar a `/carrito`
2. Ingresar código postal que no tiene métodos disponibles (si existe)
3. Intentar calcular
4. Verificar mensaje de error amigable
5. Simular error de red (desactivar internet temporalmente)
6. Intentar calcular envío
7. Verificar mensaje de error de conexión

#### Resultado Esperado

- ✅ Mensaje de error claro cuando no hay métodos disponibles
- ✅ Mensaje de error de conexión cuando falla la red
- ✅ UI no se rompe con errores
- ✅ Usuario puede reintentar después del error

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Mensaje de error sin métodos
- [ ] Mensaje de error de conexión

#### Observaciones

```
[Completar durante ejecución]
```

---

## 📊 Resumen de Ejecución

| Caso        | Estado | Fecha | Ejecutado por | Observaciones |
| ----------- | ------ | ----- | ------------- | ------------- |
| TC-SHIP-001 | ⏳     | -     | -             | -             |
| TC-SHIP-002 | ⏳     | -     | -             | -             |
| TC-SHIP-003 | ⏳     | -     | -             | -             |
| TC-SHIP-004 | ⏳     | -     | -             | -             |
| TC-SHIP-005 | ⏳     | -     | -             | -             |
| TC-SHIP-006 | ⏳     | -     | -             | -             |
| TC-SHIP-007 | ⏳     | -     | -             | -             |

**Total:** 7 casos  
**Aprobados:** 0  
**Fallidos:** 0  
**No ejecutados:** 7

---

## 🔍 Métodos de Envío Disponibles

Según el código, el sistema soporta:

1. **OCA Estándar** - 3-5 días hábiles
2. **OCA Express** - 1-2 días hábiles
3. **Correo Argentino** - 4-6 días hábiles
4. **Andreani Estándar** - 3-5 días hábiles
5. **Andreani Express** - 1-2 días hábiles
6. **Mercado Envíos** - 2-4 días hábiles (solo para ciertos CP y montos)

**Nota:** Si `ENVIOPACK_API_KEY` está configurado, se usan cotizaciones reales. Si no, se usa cálculo simulado.

---

## 🐛 Bugs Encontrados

Ver `qa/BUGS_PROD.md` para bugs relacionados con envíos.

---

**Última actualización:** 26/11/2025  
**Próxima revisión:** Después de ejecutar pruebas
