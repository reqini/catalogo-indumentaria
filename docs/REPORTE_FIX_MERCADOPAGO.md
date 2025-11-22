# 🔧 Reporte de Fix - Mercado Pago Configuración

**Fecha:** 2024-12-19  
**Commit:** `03e3955`  
**Estado:** ✅ Sistema de validación robusto implementado

---

## 🎯 Problema Identificado

**Error:** "Mercado Pago no configurado: Por favor, configura MP_ACCESS_TOKEN en .env.local con un token real de Mercado Pago"

**Causas posibles:**
1. Variable `MP_ACCESS_TOKEN` no configurada en `.env.local` o Vercel
2. Variable tiene valor placeholder (`TEST-xxxxxxxxxxxxxxxxxxxx` o contiene `xxxxx`)
3. Token de TEST en producción
4. Variable mal escrita o con espacios
5. No se reinició servidor después de cambiar variables

---

## ✅ Soluciones Implementadas

### 1. Sistema de Validación Robusto (`lib/mercadopago/validate.ts`)

**Nuevo módulo creado** con validación completa:

- ✅ Detecta si `MP_ACCESS_TOKEN` está configurado
- ✅ Detecta placeholders (`TEST-xxxxxxxxxxxxxxxxxxxx`, valores con `xxxxx`)
- ✅ Distingue entre tokens de TEST y PRODUCCIÓN
- ✅ Valida formato del token
- ✅ Valida `NEXT_PUBLIC_MP_PUBLIC_KEY` (opcional pero recomendado)
- ✅ Genera mensajes de error claros y accionables

**Funciones principales:**
- `validateMercadoPagoConfig()` - Valida configuración completa
- `getMercadoPagoErrorMessage()` - Genera mensajes amigables

---

### 2. Mejora en Endpoint de Pago (`app/api/pago/route.ts`)

**Antes:**
```typescript
if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN === 'TEST-xxxxxxxxxxxxxxxxxxxx' || MP_ACCESS_TOKEN.includes('xxxxx')) {
  // Error genérico
}
```

**Ahora:**
```typescript
const mpConfig = validateMercadoPagoConfig()
if (!mpConfig.isValid) {
  // Error detallado con información específica
  // Logs completos para debugging
  // Mensaje claro con pasos para resolver
}
```

**Mejoras:**
- ✅ Validación más robusta
- ✅ Logs detallados para debugging
- ✅ Mensajes de error específicos según el problema
- ✅ Información de ayuda incluida en respuesta

---

### 3. Mejora en Webhook (`app/api/mp/webhook/route.ts`)

**Actualizado** para usar el mismo sistema de validación:
- ✅ Validación consistente
- ✅ Logs mejorados
- ✅ Manejo de errores robusto

---

### 4. Nuevo Endpoint de Verificación (`app/api/mp/verify-config/route.ts`)

**Endpoint creado:** `GET /api/mp/verify-config`

**Funcionalidad:**
- ✅ Verifica configuración de Mercado Pago
- ✅ Muestra estado de validación
- ✅ Indica si es producción o test
- ✅ Lista errores específicos
- ✅ Proporciona ayuda y links útiles
- ✅ NO expone tokens completos (solo preview por seguridad)

**Uso:**
```bash
# Local
curl http://localhost:3001/api/mp/verify-config

# Producción
curl https://catalogo-indumentaria.vercel.app/api/mp/verify-config
```

---

### 5. Documentación Actualizada (`docs/configuracion-mercadopago.md`)

**Guía completa** con:
- ✅ Pasos detallados para obtener credenciales
- ✅ Configuración en local y producción
- ✅ Verificación paso a paso
- ✅ Troubleshooting completo
- ✅ Checklist final
- ✅ Referencias útiles

---

## 📋 Archivos Modificados

1. **`lib/mercadopago/validate.ts`** (NUEVO)
   - Sistema de validación robusto
   - Funciones reutilizables

2. **`app/api/pago/route.ts`**
   - Integración con sistema de validación
   - Logs mejorados
   - Mensajes de error específicos

3. **`app/api/mp/webhook/route.ts`**
   - Integración con sistema de validación
   - Validación consistente

4. **`app/api/mp/verify-config/route.ts`** (NUEVO)
   - Endpoint de verificación
   - Útil para debugging y QA

5. **`app/api/verificar-env/route.ts`**
   - Actualizado para incluir validación de MP
   - Warnings mejorados

6. **`docs/configuracion-mercadopago.md`**
   - Guía completa actualizada
   - Pasos claros y verificables

---

## 🔍 Cómo Verificar que Funciona

### Paso 1: Verificar Configuración Local

```bash
# Reiniciar servidor
pnpm dev

# En otra terminal, verificar
curl http://localhost:3001/api/mp/verify-config
```

**Resultado esperado:**
```json
{
  "valid": true,
  "isProduction": false,
  "environment": "development",
  "errors": []
}
```

### Paso 2: Verificar Configuración Producción

```bash
curl https://catalogo-indumentaria.vercel.app/api/mp/verify-config
```

**Resultado esperado:**
```json
{
  "valid": true,
  "isProduction": true,
  "environment": "production",
  "errors": []
}
```

### Paso 3: Probar Checkout

1. Agregar producto al carrito
2. Ir a `/carrito`
3. Hacer clic en "Finalizar Compra"
4. **Verificar** que redirige a Mercado Pago (no muestra error)

---

## 🐛 Troubleshooting Mejorado

### Error: "MP_ACCESS_TOKEN no está configurado"

**Solución:**
1. Verificar que existe en `.env.local` (local) o Vercel (producción)
2. Verificar que no tiene espacios al inicio/final
3. Reiniciar servidor después de agregar

### Error: "MP_ACCESS_TOKEN es un placeholder"

**Solución:**
1. Reemplazar `TEST-xxxxxxxxxxxxxxxxxxxx` por token real
2. Obtener token en: https://www.mercadopago.com.ar/developers/panel
3. Actualizar en `.env.local` y Vercel

### Error: "Token de TEST en producción"

**Solución:**
1. Generar token de PRODUCCIÓN en panel de MP
2. Actualizar `MP_ACCESS_TOKEN` en Vercel
3. Redeploy

---

## ✅ Checklist de Verificación

- [x] Sistema de validación implementado
- [x] Endpoint de verificación creado
- [x] Logs mejorados en todos los endpoints
- [x] Mensajes de error específicos y accionables
- [x] Documentación actualizada
- [ ] **MP_ACCESS_TOKEN configurado en `.env.local`** (requiere acción manual)
- [ ] **MP_ACCESS_TOKEN configurado en Vercel** (requiere acción manual)
- [ ] **NEXT_PUBLIC_MP_PUBLIC_KEY configurado** (opcional pero recomendado)
- [ ] **Verificación local exitosa** (`/api/mp/verify-config`)
- [ ] **Verificación producción exitosa** (`/api/mp/verify-config`)
- [ ] **Checkout funciona correctamente**

---

## 🚀 Próximos Pasos Manuales

### 1. Obtener Credenciales (5 minutos)

1. Ir a: https://www.mercadopago.com.ar/developers/panel
2. Iniciar sesión
3. Seleccionar aplicación o crear nueva
4. Copiar **Access Token** (PRODUCCIÓN)
5. Copiar **Public Key** (PRODUCCIÓN)

### 2. Configurar Local (2 minutos)

Editar `.env.local`:
```env
MP_ACCESS_TOKEN=APP_USR-tu-token-real-aqui
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-tu-public-key-real-aqui
```

Reiniciar servidor:
```bash
pnpm dev
```

### 3. Configurar Producción (3 minutos)

1. Vercel Dashboard → Settings → Environment Variables
2. Agregar `MP_ACCESS_TOKEN` = `APP_USR-tu-token-real`
3. Agregar `NEXT_PUBLIC_MP_PUBLIC_KEY` = `APP_USR-tu-public-key-real`
4. Scope: **Production** (y Preview/Development si aplica)
5. **Guardar** y **Redeploy**

### 4. Verificar (2 minutos)

```bash
# Verificar local
curl http://localhost:3001/api/mp/verify-config

# Verificar producción (después de deploy)
curl https://catalogo-indumentaria.vercel.app/api/mp/verify-config
```

Ambos deben retornar `"valid": true`

---

## 📊 Resultado Esperado

**Después de configurar correctamente:**

- ✅ No aparece error "Mercado Pago no configurado"
- ✅ `/api/mp/verify-config` retorna `"valid": true`
- ✅ Checkout redirige correctamente a Mercado Pago
- ✅ Logs muestran: `[MP-PAYMENT] ✅ Token configurado correctamente`
- ✅ Logs muestran: `[MP-PAYMENT] Tipo: PRODUCCIÓN`

---

## 🔗 Referencias

- **Panel de Desarrolladores**: https://www.mercadopago.com.ar/developers/panel
- **Verificar Config**: `/api/mp/verify-config`
- **Documentación**: `/docs/configuracion-mercadopago.md`

---

**¡Sistema de validación robusto implementado! 🚀**

**Pendiente:** Configurar credenciales reales en `.env.local` y Vercel

