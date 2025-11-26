# 💳 Configuración de Mercado Pago

**Fecha:** 2024-11-26  
**Versión:** 1.0  
**Estado:** ✅ **DOCUMENTACIÓN COMPLETA**

---

## 📋 Resumen

Este documento explica cómo configurar Mercado Pago para que el checkout funcione correctamente en producción.

---

## 🔑 Variables de Entorno Requeridas

### Variable Principal: `MP_ACCESS_TOKEN`

**Descripción:** Token de acceso de Mercado Pago (Access Token)

**Formato:**

- Producción: `APP_USR-...` (empieza con `APP_USR-`)
- Sandbox/Test: `TEST-...` (empieza con `TEST-`)

**Dónde obtenerlo:**

1. Ve a https://www.mercadopago.com.ar/developers/panel
2. Inicia sesión con tu cuenta de Mercado Pago
3. Ve a "Tus integraciones"
4. Selecciona tu aplicación (o crea una nueva)
5. En la sección "Credenciales", copia el **Access Token**

**Dónde configurarlo:**

#### En Vercel (Producción):

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `catalogo-indumentaria`
3. Ve a **Settings** → **Environment Variables**
4. Click en **Add New**
5. Configura:
   - **Key:** `MP_ACCESS_TOKEN`
   - **Value:** Tu Access Token (el que copiaste, empieza con `APP_USR-` o `TEST-`)
   - **Environment:** Selecciona todas:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
6. Click en **Save**

#### En Desarrollo Local:

1. Crea o edita el archivo `.env.local` en la raíz del proyecto
2. Agrega:
   ```
   MP_ACCESS_TOKEN=TEST-tu-token-aqui
   ```
3. Reinicia el servidor de desarrollo (`yarn dev`)

---

## ⚠️ IMPORTANTE: REDEPLOY Después de Configurar

**CRÍTICO:** Después de agregar `MP_ACCESS_TOKEN` en Vercel Dashboard, **DEBES hacer REDEPLOY** para que la variable esté disponible.

### Cómo hacer REDEPLOY:

**Opción 1: Automático (recomendado)**

- Haz un push a la rama `main`
- Vercel automáticamente hará deploy con las nuevas variables

**Opción 2: Manual**

1. Ve a Vercel Dashboard → Deployments
2. Click en los 3 puntos del último deployment
3. Click en **Redeploy**
4. Espera a que termine el deploy

---

## 🧪 Sandbox vs Producción

### Sandbox (Test)

**Cuándo usar:**

- Desarrollo local
- Pruebas antes de ir a producción
- Testing de integración

**Token:**

- Empieza con `TEST-`
- No procesa pagos reales
- Tarjetas de prueba disponibles

**Tarjetas de prueba:**

- Aprobada: `5031 7557 3453 0604` (CVV: 123)
- Rechazada: `5031 4332 1540 6351` (CVV: 123)
- Pendiente: `5031 4332 1540 6351` (CVV: 123)

### Producción

**Cuándo usar:**

- Ambiente de producción en Vercel
- Pagos reales de clientes

**Token:**

- Empieza con `APP_USR-`
- Procesa pagos reales
- Requiere cuenta verificada en Mercado Pago

---

## ✅ Verificación de Configuración

### Verificar en Logs de Vercel

Después de hacer deploy, verifica en los logs:

**Logs esperados (configuración correcta):**

```
[MP-PAYMENT] ✅ PRESENTE
[MP-PAYMENT]   - Longitud: 150
[MP-PAYMENT]   - Empieza con: APP_USR-...
[MP-PAYMENT]   - Formato válido: ✅
[MP-PAYMENT] ✅ Token configurado correctamente
[MP-PAYMENT] Tipo: PRODUCCIÓN
```

**Logs de error (configuración incorrecta):**

```
[MP-PAYMENT] ❌ NO ENCONTRADO
[MP-PAYMENT] ❌ NO se encontraron variables relacionadas con MP
[MP-PAYMENT] ❌ [ERROR] MP_ACCESS_TOKEN NO CONFIGURADO
```

### Probar Creación de Preferencia

1. Completa el checkout hasta "Pagar Ahora"
2. Verifica en consola del navegador:
   - ✅ No aparece error `CHECKOUT_MP_NOT_CONFIGURED`
   - ✅ No aparece error 503
   - ✅ Redirección a Mercado Pago funciona

3. Verifica en logs de Vercel:
   - ✅ `[MP-PAYMENT] ✅ [SUCCESS] Preferencia creada exitosamente`
   - ✅ `Preference ID:` con un ID válido
   - ✅ `Init Point:` con una URL válida

---

## 🚨 Troubleshooting

### Error: "MP_ACCESS_TOKEN no configurado"

**Causa:** Variable no está configurada o no se hizo REDEPLOY

**Solución:**

1. Verifica que `MP_ACCESS_TOKEN` esté en Vercel Dashboard
2. Verifica que esté seleccionado para el ambiente correcto (Production)
3. **Haz REDEPLOY** después de agregar
4. Verifica logs después del redeploy

---

### Error: "Credenciales de Mercado Pago inválidas"

**Causa:** Token inválido o expirado

**Solución:**

1. Ve a https://www.mercadopago.com.ar/developers/panel
2. Verifica que el token sea válido
3. Si es necesario, genera un nuevo token
4. Actualiza `MP_ACCESS_TOKEN` en Vercel
5. Haz REDEPLOY

---

### Error: "Datos inválidos enviados a Mercado Pago"

**Causa:** Payload incorrecto (items sin precio, URLs inválidas, etc.)

**Solución:**

1. Revisa logs en Vercel Dashboard
2. Busca `[MP-PAYMENT] ❌ [ERROR] Error de Mercado Pago API`
3. Revisa el detalle del error en `mpError`
4. Corrige el payload según el error

---

## 🔒 Seguridad

### ⚠️ NUNCA expongas el Access Token

- ❌ NO lo subas a Git
- ❌ NO lo pongas en código fuente
- ❌ NO lo compartas públicamente
- ✅ Úsalo SOLO en variables de entorno
- ✅ Úsalo SOLO en el servidor (nunca en el cliente)

### Variables de Entorno Seguras

- ✅ `.env.local` está en `.gitignore`
- ✅ Variables en Vercel están encriptadas
- ✅ Solo accesibles en runtime del servidor

---

## 📚 Recursos Adicionales

- **Panel de Mercado Pago:** https://www.mercadopago.com.ar/developers/panel
- **Documentación API:** https://www.mercadopago.com.ar/developers/es/docs
- **Checkout Pro:** https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing

---

## 🎛️ Flag de Mantenimiento (Opcional)

Si necesitas deshabilitar el checkout temporalmente:

**Variable:** `NEXT_PUBLIC_CHECKOUT_DISABLED`

**Valor:** `true` para deshabilitar, `false` o no configurado para habilitar

**Dónde configurarlo:**

- Vercel Dashboard → Settings → Environment Variables
- Agregar `NEXT_PUBLIC_CHECKOUT_DISABLED` con valor `true`
- Hacer REDEPLOY

**Comportamiento:**

- Si está en `true`: Checkout retorna 503 con mensaje de mantenimiento
- Si está en `false` o no configurado: Checkout funciona normalmente

**⚠️ IMPORTANTE:** Por defecto, el checkout está **HABILITADO**. Solo se deshabilita si explícitamente configuras `NEXT_PUBLIC_CHECKOUT_DISABLED=true`.

---

**Última actualización:** 2024-11-26  
**Versión:** 1.0
