# 📦 QA - Integración con Proveedor de Envíos - Producción

**Fecha:** 26/11/2025  
**Entorno:** Producción (`https://catalogo-indumentaria.vercel.app`)  
**Versión:** 1.0.0

---

## 🔍 Información Técnica

### Proveedor Principal

**Envíopack** (opcional, con fallback a cálculo simulado)

- **Documentación:** https://developers.enviopack.com
- **Endpoint API:** `https://api.enviopack.com/cotizar`
- **Método:** POST
- **Autenticación:** Bearer Token + X-API-Secret

### Proveedores Soportados (Cálculo Simulado)

Cuando Envíopack no está configurado, el sistema usa cálculo simulado para:

1. **OCA** (Estándar y Express)
2. **Correo Argentino**
3. **Andreani** (Estándar y Express)
4. **Mercado Envíos** (condicional)

---

## 📡 Endpoints Usados

### Calcular Envío

**Endpoint:** `POST /api/envios/calcular`

**Request Body:**

```json
{
  "codigoPostal": "C1000",
  "peso": 1.5,
  "precio": 50000,
  "provincia": "Buenos Aires" // Opcional
}
```

**Response:**

```json
{
  "metodos": [
    {
      "nombre": "OCA Estándar",
      "precio": 3500,
      "demora": "3-5 días hábiles",
      "disponible": true,
      "transportista": "OCA"
    }
  ],
  "codigoPostal": "C1000"
}
```

---

## 🔧 Campos que se Envían

### A Envíopack API (si está configurado)

- `codigo_postal`: Código postal del destino
- `peso`: Peso en kg (mínimo 0.1kg)
- `precio`: Valor declarado del producto
- `provincia`: Provincia (opcional)

### Al Sistema Interno

- `codigoPostal`: Código postal
- `peso`: Peso total estimado (0.5kg por producto por defecto)
- `precio`: Precio total del carrito
- `provincia`: Provincia (opcional)

---

## 📋 Casos de Prueba

### TC-ENVIO-001 – Crear compra con envío estándar → validar orden de envío

**Prioridad:** Alta  
**Tipo:** Integración  
**Módulo:** Envíos

#### Precondiciones

- Carrito con productos
- Envío calculado y seleccionado
- Mercado Pago configurado

#### Pasos Detallados

1. Agregar productos al carrito
2. Calcular envío estándar (ej: OCA Estándar)
3. Seleccionar método de envío estándar
4. Finalizar compra y completar pago en Mercado Pago
5. Verificar en logs del servidor que se generó request de envío
6. Verificar en Envíopack (si está configurado) que se creó orden de envío
7. Verificar que el costo de envío se incluyó en la preferencia de MP

#### Resultado Esperado

- ✅ Request de envío registrado en logs
- ✅ Orden de envío creada en Envíopack (si está configurado)
- ✅ Costo de envío incluido en preferencia de MP
- ✅ Datos de envío guardados en la orden (si existe sistema de órdenes)

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Logs a Verificar

```bash
# Buscar en logs de Vercel:
[API-ENVIOS] Calculando envío: { codigoPostal, peso, precio }
[API-ENVIOS] 🎯 QA LOG - Cálculo de envío: { ... }
```

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-ENVIO-002 – Crear compra con otra modalidad de envío (retira/local)

**Prioridad:** Media  
**Tipo:** Integración  
**Módulo:** Envíos

#### Precondiciones

- Carrito con productos

#### Pasos Detallados

1. Agregar productos al carrito
2. NO calcular envío (o seleccionar "Retiro en local" si existe)
3. Finalizar compra sin seleccionar envío
4. Completar pago en Mercado Pago
5. Verificar que la compra se procesa correctamente sin costo de envío
6. Verificar que no se genera orden de envío en Envíopack

#### Resultado Esperado

- ✅ Compra se procesa sin costo de envío
- ✅ Total = Subtotal (sin envío)
- ✅ No se genera orden de envío
- ✅ Mensaje claro sobre retiro en local (si aplica)

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-ENVIO-003 – Validar respuesta de API: códigos de error, mensajes

**Prioridad:** Media  
**Tipo:** Validación  
**Módulo:** Envíos

#### Precondiciones

- Acceso a herramientas de desarrollo

#### Pasos Detallados

1. Abrir DevTools → Network
2. Calcular envío con CP válido
3. Verificar respuesta 200 OK
4. Calcular envío con CP inválido
5. Verificar código de error apropiado (400)
6. Verificar mensaje de error claro
7. Simular error de red
8. Verificar manejo de error de conexión

#### Resultado Esperado

- ✅ Respuesta 200 OK para CP válido
- ✅ Respuesta 400 para CP inválido
- ✅ Mensajes de error claros y amigables
- ✅ Manejo correcto de errores de red
- ✅ UI no se rompe con errores

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Códigos de Error Esperados

- `400`: Datos inválidos (CP inválido, peso negativo, etc.)
- `500`: Error del servidor
- `Network Error`: Error de conexión

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-ENVIO-004 – Fallo de comunicación con el plugin/API

**Prioridad:** Alta  
**Tipo:** Manejo de Errores  
**Módulo:** Envíos

#### Precondiciones

- Envíopack configurado (si aplica)

#### Pasos Detallados

1. Simular fallo de Envíopack API (timeout o error 500)
2. Calcular envío
3. Verificar que el sistema usa cálculo simulado como fallback
4. Verificar que se muestran métodos de envío (simulados)
5. Verificar que el usuario puede continuar con la compra
6. Verificar logs de error en servidor

#### Resultado Esperado

- ✅ Sistema usa cálculo simulado cuando Envíopack falla
- ✅ Métodos de envío se muestran correctamente (simulados)
- ✅ Usuario puede continuar con la compra
- ✅ Error registrado en logs pero no bloquea al usuario
- ✅ Mensaje claro si aplica (opcional)

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Logs Esperados

```
[ENVIOPACK] ⚠️ Error con Envíopack, usando cálculo simulado: [error]
[API-ENVIOS] 📊 Usando cálculo simulado (Envíopack no configurado)
```

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-ENVIO-005 – Validar número de seguimiento o referencia del envío

**Prioridad:** Media  
**Tipo:** Funcional  
**Módulo:** Envíos

#### Precondiciones

- Compra completada con envío
- Envíopack configurado (si aplica)

#### Pasos Detallados

1. Completar compra con envío
2. Verificar en email de confirmación si hay número de seguimiento
3. Verificar en panel de admin (si existe) si se guardó referencia de envío
4. Verificar en logs del servidor si se registró número de seguimiento

#### Resultado Esperado

- ✅ Número de seguimiento guardado (si Envíopack está configurado)
- ✅ Referencia visible en email de confirmación
- ✅ Referencia guardada en base de datos (si existe sistema de órdenes)
- ✅ Logs contienen información de envío

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Observaciones

```
[Completar durante ejecución]
```

---

### TC-ENVIO-006 – Validar que no se genera inconsistencia en BD si el envío falla

**Prioridad:** Alta  
**Tipo:** Integridad de Datos  
**Módulo:** Envíos

#### Precondiciones

- Sistema de órdenes implementado

#### Pasos Detallados

1. Simular fallo de Envíopack durante checkout
2. Completar compra con envío que falla
3. Verificar que la orden se crea correctamente
4. Verificar que el estado de la orden es correcto
5. Verificar que no hay órdenes duplicadas
6. Verificar que el stock se actualiza correctamente

#### Resultado Esperado

- ✅ Orden se crea aunque el envío falle
- ✅ Estado de orden es correcto (pending/paid según pago)
- ✅ No hay órdenes duplicadas
- ✅ Stock se actualiza correctamente
- ✅ Datos consistentes en base de datos

#### Resultado Observado

- [ ] ✅ Aprobado
- [ ] ❌ Falló
- [ ] ⏳ No ejecutado

#### Observaciones

```
[Completar durante ejecución]
```

---

## 🔍 Verificaciones Técnicas

### Configuración de Envíopack

Para verificar si Envíopack está configurado:

1. Verificar variables de entorno en Vercel:
   - `ENVIOPACK_API_KEY`
   - `ENVIOPACK_API_SECRET`

2. Verificar en logs:
   ```
   [ENVIOPACK] 📤 Calculando envío real: { ... }
   ```
   vs
   ```
   [API-ENVIOS] 📊 Usando cálculo simulado (Envíopack no configurado)
   ```

### Cálculo Simulado

El sistema usa cálculo simulado cuando:

- Envíopack no está configurado
- Envíopack falla o retorna error
- Timeout de Envíopack (10 segundos)

---

## 📊 Resumen de Ejecución

| Caso         | Estado | Fecha | Ejecutado por | Observaciones |
| ------------ | ------ | ----- | ------------- | ------------- |
| TC-ENVIO-001 | ⏳     | -     | -             | -             |
| TC-ENVIO-002 | ⏳     | -     | -             | -             |
| TC-ENVIO-003 | ⏳     | -     | -             | -             |
| TC-ENVIO-004 | ⏳     | -     | -             | -             |
| TC-ENVIO-005 | ⏳     | -     | -             | -             |
| TC-ENVIO-006 | ⏳     | -     | -             | -             |

**Total:** 6 casos  
**Aprobados:** 0  
**Fallidos:** 0  
**No ejecutados:** 6

---

## 🐛 Bugs Encontrados

Ver `qa/BUGS_PROD.md` para bugs relacionados con integración de envíos.

---

**Última actualización:** 26/11/2025  
**Próxima revisión:** Después de ejecutar pruebas
