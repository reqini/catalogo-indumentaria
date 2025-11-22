# 🧪 QA Completo: Mercado Pago en Producción

## 🎯 Objetivo

Verificar que Mercado Pago funcione 100% en producción con pruebas exhaustivas como profesional.

## 📋 Checklist Pre-Deploy

### 1. Variables de Entorno

- [ ] `MP_ACCESS_TOKEN` configurado en Vercel Dashboard
- [ ] `NEXT_PUBLIC_MP_PUBLIC_KEY` configurado (opcional pero recomendado)
- [ ] Variables marcadas para **Production** (no solo Preview)
- [ ] Token es de PRODUCCIÓN (empieza con `APP_USR-`)
- [ ] Token completo sin espacios extra

### 2. Verificación Local

```bash
# Verificar variables locales
pnpm diagnose-mp-complete

# Debe mostrar:
# ✅ Token configurado
# ✅ Token válido
# ✅ Conectividad con API OK
# ✅ Creación de preferencias OK
```

### 3. Build y Deploy

- [ ] Build exitoso sin errores
- [ ] Deploy completado en Vercel
- [ ] Logs de Vercel muestran token presente

## 🔍 Verificación Post-Deploy

### 1. Endpoint de Verificación Rápida

```bash
# Verificar token en producción
curl https://tu-dominio.vercel.app/api/mp/test-token

# Debe retornar:
{
  "success": true,
  "token": {
    "found": true,
    "isValidFormat": true
  }
}
```

### 2. Endpoint de Verificación Completa

```bash
# Verificar configuración completa
curl https://tu-dominio.vercel.app/api/mp/verify-config

# Debe retornar:
{
  "status": "ok",
  "config": {
    "isValid": true,
    "hasAccessToken": true
  }
}
```

### 3. Logs en Vercel

1. Ve a **Deployments** → Último deployment → **View Function Logs**
2. Busca logs que empiecen con `[MP-PAYMENT] 🔍 DIAGNÓSTICO`
3. Debe mostrar:
   ```
   [MP-PAYMENT] MP_ACCESS_TOKEN (directo): ✅ PRESENTE
   [MP-PAYMENT] ✅ Token configurado correctamente
   ```

## 🧪 Pruebas Funcionales

### Test 1: Flujo de Checkout Básico

**Pasos:**

1. Agregar producto al carrito
2. Ir a carrito
3. Calcular envío (opcional)
4. Click en "Finalizar Compra"

**Resultado Esperado:**

- ✅ Redirección a Mercado Pago
- ✅ URL de checkout válida
- ✅ Productos visibles en checkout
- ✅ Precio correcto

**Verificar:**

- [ ] Redirección exitosa
- [ ] URL contiene `init_point` válido
- [ ] Productos correctos en checkout
- [ ] Precio total correcto

### Test 2: Pago Aprobado

**Pasos:**

1. Completar checkout básico
2. Usar tarjeta de prueba aprobada:
   - **Número:** 5031 7557 3453 0604
   - **CVV:** 123
   - **Vencimiento:** 11/25
   - **Nombre:** APRO

**Resultado Esperado:**

- ✅ Redirección a `/pago/success`
- ✅ Mensaje de éxito
- ✅ Orden registrada en base de datos
- ✅ Stock actualizado

**Verificar:**

- [ ] Redirección a success
- [ ] Mensaje de éxito visible
- [ ] Orden en base de datos
- [ ] Stock reducido correctamente

### Test 3: Pago Rechazado

**Pasos:**

1. Completar checkout básico
2. Usar tarjeta de prueba rechazada:
   - **Número:** 5031 4332 1540 6351
   - **CVV:** 123
   - **Vencimiento:** 11/25
   - **Nombre:** OTHE

**Resultado Esperado:**

- ✅ Redirección a `/pago/failure`
- ✅ Mensaje de error claro
- ✅ Stock NO actualizado
- ✅ Carrito intacto

**Verificar:**

- [ ] Redirección a failure
- [ ] Mensaje de error visible
- [ ] Stock no modificado
- [ ] Carrito intacto

### Test 4: Pago Pendiente

**Pasos:**

1. Completar checkout básico
2. Usar método de pago pendiente (ej: transferencia)

**Resultado Esperado:**

- ✅ Redirección a `/pago/pending`
- ✅ Mensaje de pendiente
- ✅ Webhook recibirá actualización

**Verificar:**

- [ ] Redirección a pending
- [ ] Mensaje de pendiente visible
- [ ] Webhook configurado correctamente

### Test 5: Envío con Costo

**Pasos:**

1. Agregar productos al carrito
2. Calcular envío con código postal válido
3. Seleccionar método de envío
4. Finalizar compra

**Resultado Esperado:**

- ✅ Costo de envío agregado al total
- ✅ Envío aparece como item en Mercado Pago
- ✅ Total correcto (productos + envío)

**Verificar:**

- [ ] Costo de envío visible
- [ ] Total incluye envío
- [ ] Envío en checkout de MP
- [ ] Precio correcto

### Test 6: Múltiples Productos

**Pasos:**

1. Agregar 3+ productos diferentes
2. Diferentes talles
3. Diferentes cantidades
4. Finalizar compra

**Resultado Esperado:**

- ✅ Todos los productos en checkout
- ✅ Cantidades correctas
- ✅ Talles correctos
- ✅ Total correcto

**Verificar:**

- [ ] Todos los productos visibles
- [ ] Cantidades correctas
- [ ] Talles correctos
- [ ] Total correcto

### Test 7: Stock Insuficiente

**Pasos:**

1. Agregar producto con stock limitado
2. Intentar comprar más de lo disponible

**Resultado Esperado:**

- ✅ Error antes de llegar a Mercado Pago
- ✅ Mensaje claro de stock insuficiente
- ✅ No se crea preferencia

**Verificar:**

- [ ] Error antes de checkout
- [ ] Mensaje claro
- [ ] No se crea preferencia

### Test 8: Webhook

**Pasos:**

1. Completar pago aprobado
2. Verificar logs de webhook

**Resultado Esperado:**

- ✅ Webhook recibido
- ✅ Orden actualizada
- ✅ Stock actualizado
- ✅ Logs correctos

**Verificar:**

- [ ] Webhook en logs
- [ ] Orden actualizada
- [ ] Stock actualizado
- [ ] Logs correctos

## 📱 Pruebas Mobile

### Test 9: Mobile Checkout

**Pasos:**

1. Abrir sitio en móvil
2. Agregar producto
3. Completar checkout

**Resultado Esperado:**

- ✅ UI responsive
- ✅ Checkout funcional
- ✅ Redirección correcta

**Verificar:**

- [ ] UI responsive
- [ ] Checkout funcional
- [ ] Redirección correcta

## 🔒 Pruebas de Seguridad

### Test 10: Validación de Token

**Pasos:**

1. Intentar crear preferencia sin token
2. Verificar manejo de errores

**Resultado Esperado:**

- ✅ Error 503 (no 500)
- ✅ Mensaje amigable
- ✅ No expone información sensible

**Verificar:**

- [ ] Status 503
- [ ] Mensaje amigable
- [ ] No expone token

## 📊 Métricas de Éxito

### KPIs

- ✅ **Tasa de éxito de checkout:** > 95%
- ✅ **Tiempo de respuesta:** < 2s
- ✅ **Errores 500:** 0%
- ✅ **Errores 503:** < 1% (solo cuando token no configurado)

### Logs Esperados

```
[MP-PAYMENT] 🔍 DIAGNÓSTICO COMPLETO
[MP-PAYMENT] MP_ACCESS_TOKEN (directo): ✅ PRESENTE
[MP-PAYMENT] ✅ Token configurado correctamente
[MP-PAYMENT] ✅ Preferencia creada exitosamente
```

## 🚨 Troubleshooting

### Problema: Token no encontrado

**Síntomas:**

- Error 503 en checkout
- Mensaje "checkout-disabled"

**Solución:**

1. Verificar variables en Vercel Dashboard
2. Verificar que estén marcadas para Production
3. Hacer REDEPLOY
4. Verificar con `/api/mp/test-token`

### Problema: Redirección falla

**Síntomas:**

- Checkout se crea pero no redirige
- Error en consola

**Solución:**

1. Verificar `back_urls` en logs
2. Verificar que URLs sean públicas (no localhost)
3. Verificar `NEXT_PUBLIC_BASE_URL`

### Problema: Webhook no funciona

**Síntomas:**

- Pago aprobado pero orden no actualizada

**Solución:**

1. Verificar `notification_url` en logs
2. Verificar que URL sea pública
3. Verificar logs de webhook en Vercel

## ✅ Checklist Final

- [ ] Todas las pruebas pasan
- [ ] Logs correctos en producción
- [ ] No hay errores 500
- [ ] Checkout funcional
- [ ] Webhook funcional
- [ ] Mobile funcional
- [ ] Seguridad verificada

## 📚 Referencias

- [Solución Definitiva](./SOLUCION_DEFINITIVA_MP_ACCESS_TOKEN.md)
- [Configuración en Vercel](./GUIA_VERCEL_ENV_VARS.md)
- [Verificación de Variables](./VERIFICAR_VARIABLES_VERCEL.md)

---

**Última actualización:** Noviembre 2024
**Estado:** ✅ Listo para Producción
