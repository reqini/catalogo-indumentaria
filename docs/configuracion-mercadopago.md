# 🔑 Configuración de Mercado Pago - Guía Completa

## 🎯 Objetivo

Configurar Mercado Pago para que funcione correctamente tanto en **desarrollo** como en **producción**.

---

## 📋 PASO 1: Obtener Credenciales de Mercado Pago

### 1.1 Acceder al Panel de Desarrolladores

1. Ir a: **https://www.mercadopago.com.ar/developers/panel**
2. Iniciar sesión con tu cuenta de Mercado Pago
3. Si no tienes cuenta, crear una en: https://www.mercadopago.com.ar/

### 1.2 Crear o Seleccionar Aplicación

1. En el panel, buscar **"Tus integraciones"** o **"Aplicaciones"**
2. Si no tienes aplicación, hacer clic en **"Crear aplicación"**
3. Completar datos básicos (nombre, descripción)
4. Seleccionar **"Producción"** o **"Test"** según necesites

### 1.3 Obtener Credenciales

**Para PRODUCCIÓN (recomendado para tienda real):**
- **Access Token**: Copiar el token que empieza con `APP_USR-...`
- **Public Key**: Copiar la clave pública (empieza con `APP_USR-...` o similar)

**Para TEST (solo desarrollo):**
- **Access Token**: Copiar el token que empieza con `TEST-...`
- **Public Key**: Copiar la clave pública de test

⚠️ **IMPORTANTE**: En producción, **SIEMPRE** usar credenciales de **PRODUCCIÓN**, nunca de TEST.

---

## ⚙️ PASO 2: Configurar Variables de Entorno

### 2.1 En Local (.env.local)

Crear o editar `.env.local` en la raíz del proyecto:

```env
# Mercado Pago - CRÍTICO: Usar tokens REALES, no placeholders
MP_ACCESS_TOKEN=APP_USR-tu-token-real-de-produccion-aqui
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-tu-public-key-real-aqui

# Opcional: Webhook secret (para validar notificaciones)
MP_WEBHOOK_SECRET=tu-webhook-secret-opcional

# Base URL (ajustar según entorno)
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

**⚠️ CRÍTICO**: 
- ❌ NO usar `TEST-xxxxxxxxxxxxxxxxxxxx`
- ❌ NO usar valores con `xxxxx`
- ✅ Usar tokens REALES obtenidos del panel de MP

### 2.2 En Vercel (Producción)

1. Ir a: **Vercel Dashboard** → Tu Proyecto → **Settings** → **Environment Variables**

2. Agregar o actualizar estas variables:

| Key | Value | Scope |
|-----|-------|-------|
| `MP_ACCESS_TOKEN` | `APP_USR-tu-token-real` | **Production** |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | `APP_USR-tu-public-key-real` | **All** (Production, Preview, Development) |
| `MP_WEBHOOK_SECRET` | `tu-webhook-secret` | **Production** (opcional) |

3. **Guardar** y hacer clic en **"Redeploy"** para aplicar cambios

---

## ✅ PASO 3: Verificar Configuración

### 3.1 Verificar Localmente

1. **Reiniciar servidor**:
   ```bash
   pnpm dev
   ```

2. **Verificar logs**:
   - No debe aparecer: `[MP-PAYMENT] ❌ Mercado Pago no configurado`
   - Debe aparecer: `[MP-PAYMENT] ✅ Token configurado correctamente`
   - Debe mostrar: `[MP-PAYMENT] Tipo: PRODUCCIÓN` o `TEST`

3. **Probar endpoint de verificación**:
   ```bash
   curl http://localhost:3001/api/mp/verify-config
   ```
   
   Debe retornar `"valid": true`

### 3.2 Verificar en Producción

1. **Esperar deploy** en Vercel
2. **Abrir**: `https://catalogo-indumentaria.vercel.app/api/mp/verify-config`
3. **Verificar** que `"valid": true` y `"isProduction": true`

---

## 🧪 PASO 4: Probar Checkout Completo

### 4.1 Flujo de Prueba

1. **Agregar producto** al carrito
2. **Ir a** `/carrito`
3. **Hacer clic** en "Finalizar Compra" o "Pagar"
4. **Verificar** que redirige a Mercado Pago

### 4.2 Tarjetas de Prueba (Solo TEST)

Si estás usando token de TEST:

- **Aprobada**: 
  - Número: `5031 7557 3453 0604`
  - CVV: `123`
  - Vencimiento: `11/25`
  - Nombre: `APRO`

- **Rechazada**:
  - Número: `5031 4332 1540 6351`
  - CVV: `123`
  - Vencimiento: `11/25`
  - Nombre: `OTHE`

### 4.3 Verificar Resultado

- ✅ Redirección a Mercado Pago funciona
- ✅ Pago procesado correctamente
- ✅ Redirección a `/pago/success` funciona
- ✅ Stock actualizado
- ✅ Email de confirmación enviado

---

## 🔧 PASO 5: Configurar Webhook (Opcional pero Recomendado)

### 5.1 En Panel de Mercado Pago

1. Ir a: **Panel de Desarrolladores** → **Webhooks**
2. Agregar URL: `https://catalogo-indumentaria.vercel.app/api/mp/webhook`
3. Copiar el **secret** generado

### 5.2 En Vercel

1. Agregar variable: `MP_WEBHOOK_SECRET` = `secret-copiado`
2. Scope: **Production**
3. Guardar y redeploy

---

## 🐛 Troubleshooting

### Error: "Mercado Pago no configurado"

**Causas posibles:**
1. ❌ Variable `MP_ACCESS_TOKEN` no está configurada
2. ❌ Variable tiene valor placeholder (`TEST-xxxxxxxxxxxxxxxxxxxx`)
3. ❌ Variable no está en Vercel (producción)
4. ❌ Token es de TEST pero estamos en producción

**Solución:**
1. Verificar que `MP_ACCESS_TOKEN` existe en `.env.local` (local) o Vercel (producción)
2. Verificar que el token es REAL, no placeholder
3. En producción, usar token de PRODUCCIÓN, no TEST
4. Reiniciar servidor después de cambiar variables

### Error: "Token inválido" en Mercado Pago

**Causas posibles:**
1. Token expirado o revocado
2. Token incorrecto (copiado mal)
3. Token de otra aplicación

**Solución:**
1. Generar nuevo token en panel de MP
2. Actualizar en `.env.local` y Vercel
3. Redeploy en Vercel

### Checkout no redirige a Mercado Pago

**Causas posibles:**
1. Error en creación de preferencia
2. Token inválido
3. Error en frontend

**Solución:**
1. Verificar logs en consola del servidor
2. Verificar endpoint `/api/mp/verify-config`
3. Verificar que no hay errores en consola del navegador

---

## 📝 Checklist Final

- [ ] Credenciales obtenidas del panel de MP
- [ ] `MP_ACCESS_TOKEN` configurado en `.env.local` (local)
- [ ] `MP_ACCESS_TOKEN` configurado en Vercel (producción)
- [ ] `NEXT_PUBLIC_MP_PUBLIC_KEY` configurado (opcional pero recomendado)
- [ ] Tokens son REALES, no placeholders
- [ ] En producción, usando tokens de PRODUCCIÓN
- [ ] Servidor reiniciado después de cambios
- [ ] Endpoint `/api/mp/verify-config` retorna `"valid": true`
- [ ] Checkout redirige correctamente a Mercado Pago
- [ ] Pago de prueba funciona correctamente

---

## 🔗 Referencias

- **Panel de Desarrolladores**: https://www.mercadopago.com.ar/developers/panel
- **Documentación MP**: https://www.mercadopago.com.ar/developers/es/docs
- **Verificar Config**: `/api/mp/verify-config`

---

**¡Configuración completa! 🚀**

