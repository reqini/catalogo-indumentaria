# 🚨 SOLUCIÓN URGENTE: MP_ACCESS_TOKEN No Configurado

**Fecha:** 2024-11-26  
**Prioridad:** 🔴 **CRÍTICA**  
**Estado:** ⚠️ **REQUIERE ACCIÓN MANUAL**

---

## ❌ Error Actual

```
POST /api/checkout/create-order-simple 500 (Internal Server Error)
code: 'CHECKOUT_MP_CONFIG_ERROR'
message: 'No se pudo generar el pago. La configuración de Mercado Pago no está completa.'
detail: 'MP_ACCESS_TOKEN no está configurado en Vercel Dashboard.'
```

---

## ✅ Solución Paso a Paso

### Paso 1: Obtener Access Token de Mercado Pago

1. Ve a https://www.mercadopago.com.ar/developers/panel
2. Inicia sesión con tu cuenta de Mercado Pago
3. Ve a **"Tus integraciones"**
4. Selecciona tu aplicación (o crea una nueva si no tienes)
5. En la sección **"Credenciales"**, copia el **Access Token**
   - Producción: Empieza con `APP_USR-...`
   - Sandbox/Test: Empieza con `TEST-...`

---

### Paso 2: Configurar en Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto: **`catalogo-indumentaria`**
3. Ve a **Settings** → **Environment Variables**
4. Click en **"Add New"**
5. Configura:
   - **Key:** `MP_ACCESS_TOKEN`
   - **Value:** Tu Access Token (el que copiaste, empieza con `APP_USR-` o `TEST-`)
   - **Environment:** Selecciona **TODAS**:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
6. Click en **Save**

---

### Paso 3: HACER REDEPLOY (CRÍTICO)

**⚠️ IMPORTANTE:** Después de agregar la variable, **DEBES hacer REDEPLOY** para que esté disponible.

**Opción A: Redeploy Manual (Recomendado)**

1. Ve a Vercel Dashboard → **Deployments**
2. Click en los **3 puntos** del último deployment
3. Click en **"Redeploy"**
4. Espera a que termine el deploy (2-3 minutos)

**Opción B: Redeploy Automático**

1. Haz un push a la rama `main`:
   ```bash
   git commit --allow-empty -m "trigger: redeploy para aplicar MP_ACCESS_TOKEN"
   git push origin main
   ```
2. Espera a que Vercel haga deploy automático

---

### Paso 4: Verificar que Funciona

1. Espera a que termine el deploy
2. Ve a https://catalogo-indumentaria.vercel.app/checkout
3. Completa el checkout hasta "Pagar Ahora"
4. Click en "Pagar Ahora"
5. **Verificar:**
   - ✅ NO aparece error 500
   - ✅ NO aparece `CHECKOUT_MP_CONFIG_ERROR`
   - ✅ Redirección a Mercado Pago funciona
   - ✅ Logs en Vercel muestran: `[MP-PAYMENT] ✅ Token configurado correctamente`

---

## 🔍 Verificar en Logs de Vercel

Después del redeploy, verifica en Vercel Dashboard → Deployments → Último deploy → Logs:

**Logs esperados (configuración correcta):**

```
[MP-PAYMENT] ✅ PRESENTE
[MP-PAYMENT]   - Longitud: 150
[MP-PAYMENT]   - Empieza con: APP_USR-... o TEST-...
[MP-PAYMENT]   - Formato válido: ✅
[MP-PAYMENT] ✅ Token configurado correctamente
```

**Logs de error (configuración incorrecta):**

```
[MP-PAYMENT] ❌ NO ENCONTRADO
[MP-PAYMENT] ❌ NO se encontraron variables relacionadas con MP
[MP-PAYMENT] ❌ [ERROR] MP_ACCESS_TOKEN NO CONFIGURADO
```

---

## 🧪 Script de Verificación Local

Para verificar en desarrollo local:

```bash
node scripts/verificar-mp-config.mjs
```

Este script verifica:

- ✅ Si `MP_ACCESS_TOKEN` está en `.env.local`
- ✅ Si el formato es válido
- ✅ Si es producción o sandbox
- ✅ Instrucciones para configurar en Vercel

---

## 📋 Checklist Completo

- [ ] Access Token obtenido de Mercado Pago
- [ ] `MP_ACCESS_TOKEN` agregado en Vercel Dashboard
- [ ] Variable seleccionada para Production, Preview, Development
- [ ] **REDEPLOY realizado** (crítico)
- [ ] Verificado en logs de Vercel que token está presente
- [ ] Probar checkout completo y verificar redirección a MP

---

## 🚨 Si Aún No Funciona Después de Configurar

### Verificar que Variable Está Configurada:

1. Vercel Dashboard → Settings → Environment Variables
2. Buscar `MP_ACCESS_TOKEN`
3. Verificar que esté presente y tenga valor correcto
4. Verificar que esté seleccionado para **Production**

### Verificar que se Hizo REDEPLOY:

1. Vercel Dashboard → Deployments
2. Verificar que el último deploy es **POSTERIOR** a cuando agregaste la variable
3. Si el deploy es anterior, hacer **Redeploy** manual

### Verificar Logs del Deploy:

1. Vercel Dashboard → Deployments → Último deploy → Logs
2. Buscar `[MP-PAYMENT]` en los logs
3. Verificar que muestre token presente

### Verificar Token Válido:

1. Verificar que el token no haya expirado
2. Verificar que el token sea válido en https://www.mercadopago.com.ar/developers/panel
3. Si es necesario, generar nuevo token y actualizar en Vercel

---

## 📞 Contacto y Soporte

Si después de seguir todos los pasos aún no funciona:

1. Revisar logs completos en Vercel Dashboard
2. Verificar que el token sea válido en Mercado Pago
3. Verificar que se hizo REDEPLOY después de agregar variable
4. Contactar soporte de Vercel si la variable no está disponible después del redeploy

---

## ✅ Resultado Esperado

Después de configurar correctamente:

- ✅ Checkout funciona sin errores 500
- ✅ Preferencia de Mercado Pago se crea exitosamente
- ✅ Redirección a Mercado Pago funciona
- ✅ Logs muestran: `[MP-PAYMENT] ✅ [SUCCESS] Preferencia creada exitosamente`

---

**Última actualización:** 2024-11-26  
**Estado:** ⚠️ **REQUIERE CONFIGURACIÓN MANUAL EN VERCEL**
