# 🐛 Debug: Error "Error al procesar el checkout"

**Fecha:** 2024-11-26  
**Problema:** El checkout muestra "Error al procesar el checkout" sin más detalles

---

## 🔍 PASOS PARA DIAGNOSTICAR

### 1. Abrir DevTools del Navegador

1. Abre tu sitio en producción
2. Presiona `F12` o `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
3. Ve a la pestaña **Console**
4. Intenta hacer una compra
5. Busca mensajes que empiecen con `[CHECKOUT]`

---

### 2. Verificar Logs en Consola

Busca estos mensajes en la consola:

#### ✅ Si ves esto, la orden se creó correctamente:

```
[CHECKOUT][CLIENT] 📤 Enviando orden al servidor...
[CHECKOUT][API] 📥 Request recibido
[CHECKOUT][API] ✅ Validación exitosa
[CHECKOUT][API] 📤 Creando orden en Supabase...
[CHECKOUT][API] ✅ Orden creada exitosamente: {orderId}
```

#### ❌ Si ves esto, hay un error:

```
[CHECKOUT][CLIENT] ❌ Error del servidor: {...}
[CHECKOUT][API] ❌ Error creando orden: {...}
[CHECKOUT][API] ❌ Error creando preferencia MP: {...}
```

---

### 3. Verificar Logs en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Click en "Deployments"
4. Click en el deployment más reciente
5. Click en "Functions" o "Logs"
6. Busca mensajes con `[CHECKOUT]` o `[MP-PAYMENT]`

---

## 🔧 ERRORES COMUNES Y SOLUCIONES

### Error 1: "Error HTTP 503" o "Service Unavailable"

**Causa:** Mercado Pago no está configurado

**Solución:**

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Verifica que existe `MP_ACCESS_TOKEN`
3. Si no existe, agrégalo:
   - Key: `MP_ACCESS_TOKEN`
   - Value: Tu token de Mercado Pago (empieza con `APP_USR-` o `TEST-`)
4. Haz **REDEPLOY** después de agregar la variable

**Verificar en logs:**

```
[MP-PAYMENT] ❌ MP_ACCESS_TOKEN NO ENCONTRADO
```

---

### Error 2: "Error HTTP 500" con código `CHECKOUT_CREATE_ORDER_ERROR`

**Causa:** Error al crear la orden en Supabase

**Posibles causas:**

- Tabla `ordenes` no existe (ya debería estar resuelto)
- Error de conexión a Supabase
- Datos inválidos

**Solución:**

1. Verifica en logs el error específico
2. Si dice `PGRST205`, ejecuta el SQL nuevamente
3. Verifica variables de Supabase en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

### Error 3: "Error HTTP 400" con código `CHECKOUT_VALIDATION_ERROR`

**Causa:** Datos del formulario inválidos

**Solución:**

1. Verifica que todos los campos requeridos estén completos
2. Verifica formato de email
3. Verifica que el código postal tenga al menos 4 caracteres
4. Si es envío, verifica que todos los campos de dirección estén completos

---

### Error 4: "Error HTTP 400" con código `CHECKOUT_INSUFFICIENT_STOCK`

**Causa:** No hay suficiente stock del producto

**Solución:**

1. Verifica el stock del producto en Supabase
2. Reduce la cantidad en el carrito
3. Elige otro talle si está disponible

---

### Error 5: "Error de conexión" o "fetch failed"

**Causa:** Problema de red o el servidor no responde

**Solución:**

1. Verifica tu conexión a internet
2. Verifica que el sitio esté funcionando
3. Intenta nuevamente después de unos minutos
4. Si persiste, verifica el estado de Vercel

---

### Error 6: "No se recibió una URL válida de Mercado Pago"

**Causa:** La respuesta del servidor no contiene `initPoint`

**Solución:**

1. Verifica logs en Vercel para ver la respuesta completa
2. Verifica que Mercado Pago esté configurado correctamente
3. Verifica que el endpoint `/api/pago` esté funcionando

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de reportar el error, verifica:

- [ ] Tabla `ordenes` existe en Supabase (ejecutaste el SQL)
- [ ] Variables de entorno configuradas en Vercel:
  - [ ] `MP_ACCESS_TOKEN`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Hiciste REDEPLOY después de agregar variables
- [ ] Revisaste los logs en la consola del navegador
- [ ] Revisaste los logs en Vercel Dashboard

---

## 🆘 SI NADA FUNCIONA

Si después de verificar todo lo anterior el error persiste:

1. **Copia los logs completos** de:
   - Consola del navegador (todos los mensajes `[CHECKOUT]`)
   - Vercel Dashboard → Logs (últimos 50 mensajes)

2. **Indica:**
   - Qué error exacto aparece en pantalla
   - En qué paso del checkout falla
   - Si es la primera vez o siempre falla

3. **Información útil:**
   - URL de producción donde falla
   - Navegador usado
   - Si funciona en desarrollo local

---

**Última actualización:** 2024-11-26
