# 🛒 QA - Carrito de Compras - Producción

**Fecha:** 26/11/2025  
**Entorno:** Producción (`https://catalogo-indumentaria.vercel.app`)  
**Versión:** 1.0.0

---

## 📋 Casos de Prueba

### TC-CART-001 – Agregar un producto simple al carrito

**Prioridad:** Alta  
**Tipo:** Funcional  
**Módulo:** Carrito

#### Precondiciones

- Acceso a `https://catalogo-indumentaria.vercel.app`
- Navegador con localStorage habilitado
- Producto disponible con stock > 0

#### Pasos Detallados

1. Navegar a `https://catalogo-indumentaria.vercel.app`
2. Hacer clic en "Catálogo" o navegar a `/catalogo`
3. Seleccionar un producto disponible
4. Seleccionar un talle disponible (si aplica)
5. Hacer clic en "Agregar al carrito"
6. Verificar que aparece notificación de éxito
7. Verificar que el ícono del carrito muestra cantidad > 0

#### Resultado Esperado

- ✅ Producto agregado al carrito exitosamente
- ✅ Notificación de éxito visible
- ✅ Contador del carrito actualizado
- ✅ Producto visible en `/carrito`

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Home con productos
- [ ] Producto seleccionado
- [ ] Notificación de éxito
- [ ] Carrito con producto

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-CART-002 – Agregar varias unidades del mismo producto

**Prioridad:** Alta  
**Tipo:** Funcional  
**Módulo:** Carrito

#### Precondiciones

- Producto ya agregado al carrito (TC-CART-001)
- Stock disponible >= cantidad deseada

#### Pasos Detallados

1. Navegar a `/carrito`
2. Localizar el producto agregado
3. Hacer clic en el botón "+" para aumentar cantidad
4. Verificar que la cantidad aumenta
5. Verificar que el subtotal se actualiza correctamente
6. Repetir paso 3-5 hasta alcanzar el límite de stock

#### Resultado Esperado

- ✅ Cantidad aumenta correctamente
- ✅ Subtotal se recalcula automáticamente
- ✅ Botón "+" se deshabilita cuando se alcanza el stock máximo
- ✅ Mensaje de error si se intenta exceder stock

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Carrito con cantidad inicial
- [ ] Carrito con cantidad aumentada
- [ ] Mensaje de error si aplica

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-CART-003 – Agregar distintos productos

**Prioridad:** Alta  
**Tipo:** Funcional  
**Módulo:** Carrito

#### Precondiciones

- Múltiples productos disponibles con stock

#### Pasos Detallados

1. Navegar a `/catalogo`
2. Agregar primer producto al carrito
3. Volver al catálogo
4. Agregar segundo producto diferente al carrito
5. Agregar tercer producto diferente al carrito
6. Navegar a `/carrito`
7. Verificar que todos los productos están presentes

#### Resultado Esperado

- ✅ Todos los productos agregados están en el carrito
- ✅ Cada producto mantiene su información (nombre, precio, talle, imagen)
- ✅ El total se calcula correctamente sumando todos los productos
- ✅ Contador del carrito muestra la cantidad total de ítems

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Catálogo con productos seleccionados
- [ ] Carrito con múltiples productos
- [ ] Resumen con total correcto

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-CART-004 – Eliminar uno / vaciar carrito

**Prioridad:** Media  
**Tipo:** Funcional  
**Módulo:** Carrito

#### Precondiciones

- Carrito con al menos 2 productos

#### Pasos Detallados - Eliminar un producto

1. Navegar a `/carrito`
2. Localizar un producto específico
3. Hacer clic en el ícono de eliminar (🗑️)
4. Verificar que el producto desaparece del carrito
5. Verificar que el total se recalcula correctamente

#### Pasos Detallados - Vaciar carrito completo

1. Navegar a `/carrito`
2. Eliminar todos los productos uno por uno
3. Verificar que aparece mensaje "Tu carrito está vacío"
4. Verificar que el contador del carrito vuelve a 0

#### Resultado Esperado

- ✅ Producto eliminado correctamente
- ✅ Total recalculado sin el producto eliminado
- ✅ Mensaje de carrito vacío cuando no hay productos
- ✅ Contador del carrito actualizado a 0

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Carrito con productos
- [ ] Carrito después de eliminar
- [ ] Mensaje de carrito vacío

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-CART-005 – Persistencia del carrito al refrescar / cambiar de página

**Prioridad:** Alta  
**Tipo:** Funcional  
**Módulo:** Carrito

#### Precondiciones

- Carrito con al menos 1 producto

#### Pasos Detallados

1. Agregar productos al carrito
2. Verificar cantidad en el contador del carrito
3. Refrescar la página (F5 o Cmd+R)
4. Verificar que los productos siguen en el carrito
5. Navegar a otra página (ej: `/catalogo`)
6. Volver a `/carrito`
7. Verificar que los productos siguen presentes
8. Cerrar y abrir el navegador (simular sesión nueva)
9. Verificar que los productos siguen en el carrito

#### Resultado Esperado

- ✅ Carrito persiste después de refrescar
- ✅ Carrito persiste al navegar entre páginas
- ✅ Carrito persiste después de cerrar y abrir navegador
- ✅ localStorage funciona correctamente

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Carrito antes de refrescar
- [ ] Carrito después de refrescar
- [ ] DevTools mostrando localStorage

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-CART-006 – Validación de stock al agregar producto

**Prioridad:** Alta  
**Tipo:** Validación  
**Módulo:** Carrito

#### Precondiciones

- Producto con stock limitado (ej: stock = 2)

#### Pasos Detallados

1. Agregar producto con stock limitado al carrito (cantidad = stock disponible)
2. Intentar agregar una unidad más del mismo producto
3. Verificar mensaje de error
4. En el carrito, intentar aumentar cantidad más allá del stock disponible
5. Verificar que el botón "+" se deshabilita o muestra error

#### Resultado Esperado

- ✅ Mensaje de error claro cuando no hay stock suficiente
- ✅ No se permite agregar más unidades que el stock disponible
- ✅ Botón "+" se deshabilita cuando se alcanza el límite
- ✅ Mensaje indica stock disponible

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Mensaje de error de stock
- [ ] Botón deshabilitado
- [ ] Carrito con cantidad máxima

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-CART-007 – Cálculo correcto de precios con descuentos

**Prioridad:** Media  
**Tipo:** Funcional  
**Módulo:** Carrito

#### Precondiciones

- Producto con descuento disponible

#### Pasos Detallados

1. Agregar producto con descuento al carrito
2. Verificar que se muestra precio original tachado
3. Verificar que se muestra precio con descuento
4. Verificar que se muestra porcentaje de descuento
5. Agregar múltiples unidades
6. Verificar que el subtotal se calcula con el precio con descuento

#### Resultado Esperado

- ✅ Precio original tachado visible
- ✅ Precio con descuento destacado
- ✅ Porcentaje de descuento visible
- ✅ Subtotal calculado correctamente (precio con descuento × cantidad)
- ✅ Total general incluye descuentos correctamente

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Screenshots

- [ ] Producto con descuento en carrito
- [ ] Resumen con totales correctos

#### Observaciones

```
[Completar durante ejecución]
```

---

## 📊 Resumen de Ejecución

| Caso        | Estado | Fecha | Ejecutado por | Observaciones |
| ----------- | ------ | ----- | ------------- | ------------- |
| TC-CART-001 | ⏳     | -     | -             | -             |
| TC-CART-002 | ⏳     | -     | -             | -             |
| TC-CART-003 | ⏳     | -     | -             | -             |
| TC-CART-004 | ⏳     | -     | -             | -             |
| TC-CART-005 | ⏳     | -     | -             | -             |
| TC-CART-006 | ⏳     | -     | -             | -             |
| TC-CART-007 | ⏳     | -     | -             | -             |

**Total:** 7 casos  
**Aprobados:** 0  
**Fallidos:** 0  
**No ejecutados:** 7

---

## 🐛 Bugs Encontrados

Ver `qa/BUGS_PROD.md` para bugs relacionados con el carrito.

---

**Última actualización:** 26/11/2025  
**Próxima revisión:** Después de ejecutar pruebas
