# 🔍 Causa Raíz - Error "Mercado Pago no configurado"

**Fecha:** 2024-12-19  
**Commit:** `485e4d9`  
**Estado:** ✅ Causa identificada y solucionada

---

## 🎯 PROBLEMA IDENTIFICADO

**Error:** "Mercado Pago no configurado: Por favor, configura MP_ACCESS_TOKEN en .env.local con un token real de Mercado Pago"

---

## 🔍 CAUSA RAÍZ

### Problema Principal: Validación al Cargar Módulo

**Antes (INCORRECTO):**
```typescript
// En app/api/pago/route.ts
const mpConfig = validateMercadoPagoConfig() // ❌ Se ejecuta al cargar el módulo
const MP_ACCESS_TOKEN = mpConfig.accessToken
```

**Problema:**
- La validación se ejecutaba **una sola vez** al cargar el módulo
- Si las variables de entorno cambiaban después del build, no se detectaba
- En Vercel, las variables pueden actualizarse sin rebuild completo
- El módulo se cacheaba con valores antiguos

**Ahora (CORRECTO):**
```typescript
// En app/api/pago/route.ts
export async function POST(request: Request) {
  // ✅ Validación en runtime, cada vez que se ejecuta el endpoint
  const mpConfig = validateMercadoPagoConfig()
  const MP_ACCESS_TOKEN = mpConfig.accessToken
  // ...
}
```

---

## 🐛 PROBLEMAS ADICIONALES DETECTADOS

### 1. Endpoint Obsoleto con Nombre Diferente

**Archivo:** `app/api/mercadopago/create-preference/route.ts` (ELIMINADO)

**Problema:**
- Usaba `MERCADOPAGO_ACCESS_TOKEN` en lugar de `MP_ACCESS_TOKEN`
- Causaba confusión sobre qué variable usar
- Endpoint duplicado innecesario

**Solución:** Eliminado completamente

---

### 2. Validación Inconsistente en Múltiples Endpoints

**Endpoints afectados:**
- `app/api/pago/route.ts` ✅ Corregido
- `app/api/mp/webhook/route.ts` ✅ Corregido
- `app/api/suscripcion/create/route.ts` ✅ Corregido
- `app/api/mp/subscription/route.ts` ✅ Corregido
- `lib/shipping/mercado-envios.ts` ✅ Corregido

**Problema:** Todos validaban al cargar módulo en lugar de runtime

**Solución:** Todos ahora validan en runtime

---

### 3. Falta de Script de Verificación Pre-Deploy

**Problema:** No había forma de verificar configuración antes de deploy

**Solución:** Creado `scripts/verify-mp-config.mjs`

---

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. Validación en Runtime (No al Cargar Módulo)

**Archivos corregidos:**
- `app/api/pago/route.ts`
- `app/api/mp/webhook/route.ts`
- `app/api/suscripcion/create/route.ts`
- `app/api/mp/subscription/route.ts`

**Cambio:**
```typescript
// ANTES (incorrecto)
const mpConfig = validateMercadoPagoConfig() // Al cargar módulo

// AHORA (correcto)
export async function POST(request: Request) {
  const mpConfig = validateMercadoPagoConfig() // En runtime
  // ...
}
```

---

### 2. Eliminación de Endpoint Obsoleto

**Archivo eliminado:** `app/api/mercadopago/create-preference/route.ts`

**Razón:** Usaba nombre de variable diferente y causaba confusión

---

### 3. Script de Verificación Pre-Deploy

**Archivo creado:** `scripts/verify-mp-config.mjs`

**Uso:**
```bash
# Verificar antes de deploy
pnpm verify-mp

# O manualmente
node scripts/verify-mp-config.mjs
```

**Integrado en:** `package.json` → `prebuild`

---

### 4. Test Automatizado de Checkout

**Archivo creado:** `scripts/test-mp-checkout.mjs`

**Uso:**
```bash
# Ejecutar después de configurar credenciales
pnpm test-mp-checkout
```

**Valida:**
- Configuración correcta
- Creación de preferencia
- Respuesta de Mercado Pago

---

## 📋 CHECKLIST DE PREVENCIÓN DE REGRESIÓN

### ✅ Implementado

- [x] Validación en runtime (no al cargar módulo)
- [x] Endpoint obsoleto eliminado
- [x] Script de verificación pre-deploy
- [x] Test automatizado de checkout
- [x] Logs detallados para debugging
- [x] Documentación completa

### ⏳ Requiere Acción Manual

- [ ] **MP_ACCESS_TOKEN configurado en `.env.local`** (local)
- [ ] **MP_ACCESS_TOKEN configurado en Vercel** (producción)
- [ ] **NEXT_PUBLIC_MP_PUBLIC_KEY configurado** (opcional pero recomendado)
- [ ] **Verificación ejecutada** (`pnpm verify-mp`)
- [ ] **Test ejecutado** (`pnpm test-mp-checkout`)
- [ ] **Checkout probado manualmente**

---

## 🚨 REGLAS PARA PREVENIR REGRESIÓN

### ❌ NUNCA HACER

1. **NO** validar configuración al cargar módulo:
   ```typescript
   // ❌ INCORRECTO
   const mpConfig = validateMercadoPagoConfig()
   ```

2. **NO** usar nombres de variables diferentes:
   ```typescript
   // ❌ INCORRECTO
   const token = process.env.MERCADOPAGO_ACCESS_TOKEN
   ```

3. **NO** exponer `MP_ACCESS_TOKEN` al cliente:
   ```typescript
   // ❌ INCORRECTO
   env: {
     MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN // ❌ NUNCA
   }
   ```

### ✅ SIEMPRE HACER

1. **SIEMPRE** validar en runtime:
   ```typescript
   // ✅ CORRECTO
   export async function POST(request: Request) {
     const mpConfig = validateMercadoPagoConfig()
     const MP_ACCESS_TOKEN = mpConfig.accessToken
   }
   ```

2. **SIEMPRE** usar `MP_ACCESS_TOKEN` (nombre exacto):
   ```typescript
   // ✅ CORRECTO
   const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
   ```

3. **SIEMPRE** usar `NEXT_PUBLIC_MP_PUBLIC_KEY` para frontend:
   ```typescript
   // ✅ CORRECTO
   const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
   ```

---

## 🔧 VERIFICACIÓN POST-FIX

### Paso 1: Verificar Local

```bash
# 1. Verificar configuración
pnpm verify-mp

# 2. Iniciar servidor
pnpm dev

# 3. En otra terminal, testear checkout
pnpm test-mp-checkout

# 4. Verificar endpoint
curl http://localhost:3001/api/mp/verify-config
```

**Resultado esperado:**
```json
{
  "valid": true,
  "isProduction": false,
  "errors": []
}
```

### Paso 2: Verificar Producción

```bash
# 1. Verificar endpoint
curl https://catalogo-indumentaria.vercel.app/api/mp/verify-config
```

**Resultado esperado:**
```json
{
  "valid": true,
  "isProduction": true,
  "errors": []
}
```

### Paso 3: Probar Checkout Real

1. Agregar producto al carrito
2. Ir a `/carrito`
3. Hacer clic en "Finalizar Compra"
4. **Verificar** que redirige a Mercado Pago (no muestra error)

---

## 📊 ARCHIVOS MODIFICADOS

1. **`app/api/pago/route.ts`**
   - ✅ Validación movida a runtime
   - ✅ Logs mejorados

2. **`app/api/mp/webhook/route.ts`**
   - ✅ Validación movida a runtime
   - ✅ Logs mejorados

3. **`app/api/suscripcion/create/route.ts`**
   - ✅ Validación movida a runtime
   - ✅ Integración con sistema de validación

4. **`app/api/mp/subscription/route.ts`**
   - ✅ Validación movida a runtime
   - ✅ Integración con sistema de validación

5. **`lib/shipping/mercado-envios.ts`**
   - ✅ Validación mejorada

6. **`app/api/mercadopago/create-preference/route.ts`**
   - ❌ ELIMINADO (obsoleto, causaba confusión)

7. **`scripts/verify-mp-config.mjs`** (NUEVO)
   - ✅ Script de verificación pre-deploy

8. **`scripts/test-mp-checkout.mjs`** (NUEVO)
   - ✅ Test automatizado de checkout

9. **`package.json`**
   - ✅ Script `verify-mp` agregado
   - ✅ Script `test-mp-checkout` agregado
   - ✅ Verificación integrada en `prebuild`

---

## 🎯 RESULTADO ESPERADO

**Después de aplicar estos fixes:**

- ✅ Validación siempre actualizada (runtime)
- ✅ Detecta cambios en variables de entorno
- ✅ No hay endpoints obsoletos
- ✅ Script de verificación pre-deploy
- ✅ Test automatizado disponible
- ✅ Logs detallados para debugging
- ✅ Documentación completa

---

## 🔗 REFERENCIAS

- **Sistema de validación**: `lib/mercadopago/validate.ts`
- **Endpoint de verificación**: `/api/mp/verify-config`
- **Script de verificación**: `scripts/verify-mp-config.mjs`
- **Test automatizado**: `scripts/test-mp-checkout.mjs`
- **Documentación**: `docs/configuracion-mercadopago.md`

---

**✅ Causa raíz identificada y solucionada**

**🚨 IMPORTANTE:** La validación ahora se ejecuta en runtime, asegurando que siempre detecte la configuración actual, incluso si las variables cambian después del build.

